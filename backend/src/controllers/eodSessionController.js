const db = require('../config/database');

/**
 * Create a new EOD session with branch checklists
 */
exports.createEodSession = async (req, res) => {
  try {
    const { session_date, template_id, notes, branch_ids } = req.body;
    
    if (!session_date || !template_id || !branch_ids || !Array.isArray(branch_ids) || branch_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Session date, template ID, and at least one branch are required'
      });
    }
    
    // Check if session already exists for this date and template
    const checkQuery = `
      SELECT id FROM eod_sessions 
      WHERE session_date = ? AND template_id = ?
    `;
    
    const [existingSessions] = await db.query(checkQuery, [session_date, template_id]);
    
    if (existingSessions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An EOD session already exists for this date and template'
      });
    }
    
    // Start a transaction
    await db.query('START TRANSACTION');
    
    // Create EOD session
    const insertSessionQuery = `
      INSERT INTO eod_sessions (
        session_date, 
        template_id, 
        status, 
        notes, 
        started_by
      ) VALUES (?, ?, ?, ?, ?)
    `;
    
    const [sessionResult] = await db.query(insertSessionQuery, [
      session_date,
      template_id,
      'pending',
      notes || null,
      req.user.id
    ]);
    
    const sessionId = sessionResult.insertId;
    
    // Get checklist items count for this template
    const countItemsQuery = `
      SELECT COUNT(*) as item_count 
      FROM checklist_items 
      WHERE template_id = ? AND is_active = 1
    `;
    
    const [itemCountResult] = await db.query(countItemsQuery, [template_id]);
    const totalItems = itemCountResult[0].item_count;
    
    // Create branch checklists
    const insertChecklistQuery = `
      INSERT INTO branch_checklists (
        eod_session_id,
        branch_id,
        status,
        total_items,
        completed_items,
        completion_percentage
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    for (const branchId of branch_ids) {
      await db.query(insertChecklistQuery, [
        sessionId,
        branchId,
        'pending',
        totalItems,
        0,
        0
      ]);
    }
    
    // Record in EOD history
    const insertHistoryQuery = `
      INSERT INTO eod_history (
        eod_session_id,
        action_type,
        action_by,
        action_details,
        ip_address
      ) VALUES (?, ?, ?, ?, ?)
    `;
    
    await db.query(insertHistoryQuery, [
      sessionId,
      'session_started',
      req.user.id,
      JSON.stringify({ 
        branch_count: branch_ids.length,
        branches: branch_ids
      }),
      req.ip
    ]);
    
    // Commit transaction
    await db.query('COMMIT');
    
    return res.status(201).json({
      success: true,
      message: 'EOD session created successfully',
      data: {
        session_id: sessionId,
        session_date,
        branch_count: branch_ids.length
      }
    });
  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    
    console.error('Error creating EOD session:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Update a branch checklist
 */
exports.updateBranchChecklist = async (req, res) => {
  try {
    const { id: checklistId } = req.params;
    const { notes, completion_data } = req.body;
    
    if (!completion_data || !Array.isArray(completion_data)) {
      return res.status(400).json({
        success: false,
        message: 'Completion data is required and must be an array'
      });
    }
    
    // Get current checklist info
    const checklistQuery = `
      SELECT 
        bc.id,
        bc.eod_session_id,
        bc.branch_id,
        bc.status,
        bc.total_items,
        bc.completed_items,
        es.status as session_status
      FROM 
        branch_checklists bc
      JOIN
        eod_sessions es ON bc.eod_session_id = es.id
      WHERE 
        bc.id = ?
    `;
    
    const [checklists] = await db.query(checklistQuery, [checklistId]);
    
    if (checklists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Checklist not found'
      });
    }
    
    const checklist = checklists[0];
    
    // Check if session is completed or cancelled
    if (checklist.session_status === 'completed' || checklist.session_status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update checklist for a completed or cancelled session'
      });
    }
    
    // Start a transaction
    await db.query('START TRANSACTION');
    
    // Update checklist notes if provided
    if (notes !== undefined) {
      const updateNotesQuery = `
        UPDATE branch_checklists 
        SET notes = ? 
        WHERE id = ?
      `;
      
      await db.query(updateNotesQuery, [notes, checklistId]);
    }
    
    // Process completion data
    let completedCount = checklist.completed_items;
    const historyRecords = [];
    
    for (const item of completion_data) {
      const { item_id, is_completed, notes: itemNotes, attachment_url } = item;
      
      // Check if item completion already exists
      const checkCompletionQuery = `
        SELECT id, is_completed 
        FROM checklist_completions 
        WHERE branch_checklist_id = ? AND checklist_item_id = ?
      `;
      
      const [completions] = await db.query(checkCompletionQuery, [checklistId, item_id]);
      
      if (completions.length === 0 && is_completed) {
        // Insert new completion
        const insertCompletionQuery = `
          INSERT INTO checklist_completions (
            branch_checklist_id,
            checklist_item_id,
            is_completed,
            completed_at,
            completed_by,
            notes,
            attachment_url
          ) VALUES (?, ?, ?, NOW(), ?, ?, ?)
        `;
        
        await db.query(insertCompletionQuery, [
          checklistId,
          item_id,
          is_completed ? 1 : 0,
          req.user.id,
          itemNotes || null,
          attachment_url || null
        ]);
        
        completedCount++;
        
        historyRecords.push({
          action_type: 'item_completed',
          details: { item_id, notes: itemNotes }
        });
      } else if (completions.length > 0) {
        const completion = completions[0];
        
        if (completion.is_completed !== is_completed) {
          // Update existing completion
          const updateCompletionQuery = `
            UPDATE checklist_completions 
            SET 
              is_completed = ?,
              completed_at = ${is_completed ? 'NOW()' : 'completed_at'},
              completed_by = ${is_completed ? '?' : 'completed_by'},
              notes = ?,
              attachment_url = ?
            WHERE id = ?
          `;
          
          const params = is_completed 
            ? [is_completed ? 1 : 0, req.user.id, itemNotes || null, attachment_url || null, completion.id]
            : [is_completed ? 1 : 0, itemNotes || null, attachment_url || null, completion.id];
          
          await db.query(updateCompletionQuery, params);
          
          if (is_completed) {
            completedCount++;
            historyRecords.push({
              action_type: 'item_completed',
              details: { item_id, notes: itemNotes }
            });
          } else {
            completedCount--;
            historyRecords.push({
              action_type: 'item_unchecked',
              details: { item_id }
            });
          }
        }
      }
    }
    
    // Calculate new completion percentage
    const completionPercentage = checklist.total_items > 0 
      ? Math.round((completedCount / checklist.total_items) * 100) 
      : 0;
    
    // Determine checklist status based on completion
    let newStatus = checklist.status;
    
    if (completedCount === 0) {
      newStatus = 'pending';
    } else if (completedCount < checklist.total_items) {
      newStatus = 'in_progress';
    } else if (completedCount === checklist.total_items) {
      newStatus = 'completed';
    }
    
    // Update checklist status, completed items, and completion percentage
    const updateChecklistQuery = `
      UPDATE branch_checklists 
      SET 
        status = ?,
        completed_items = ?,
        completion_percentage = ?,
        ${newStatus === 'completed' && checklist.status !== 'completed' ? 'completed_at = NOW(), completed_by = ?,' : ''}
        ${newStatus === 'in_progress' && checklist.status === 'pending' ? 'started_at = NOW(), assigned_to = ?,' : ''}
        updated_at = NOW()
      WHERE id = ?
    `;
    
    let updateParams = [newStatus, completedCount, completionPercentage];
    
    if (newStatus === 'completed' && checklist.status !== 'completed') {
      updateParams.push(req.user.id);
    } else if (newStatus === 'in_progress' && checklist.status === 'pending') {
      updateParams.push(req.user.id);
    }
    
    updateParams.push(checklistId);
    
    await db.query(updateChecklistQuery, updateParams);
    
    // Record history entries
    if (historyRecords.length > 0) {
      const insertHistoryQuery = `
        INSERT INTO eod_history (
          eod_session_id,
          branch_id,
          action_type,
          action_by,
          action_details,
          ip_address
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      for (const record of historyRecords) {
        await db.query(insertHistoryQuery, [
          checklist.eod_session_id,
          checklist.branch_id,
          record.action_type,
          req.user.id,
          JSON.stringify(record.details),
          req.ip
        ]);
      }
    }
    
    // Check if all branch checklists are completed to update session status
    if (newStatus === 'completed') {
      const countChecklistsQuery = `
        SELECT 
          COUNT(*) as total_checklists,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_checklists
        FROM 
          branch_checklists
        WHERE 
          eod_session_id = ?
      `;
      
      const [countResult] = await db.query(countChecklistsQuery, [checklist.eod_session_id]);
      
      if (countResult[0].total_checklists === countResult[0].completed_checklists) {
        // All checklists completed, update session status
        const updateSessionQuery = `
          UPDATE eod_sessions 
          SET 
            status = 'completed',
            completed_at = NOW(),
            completed_by = ?,
            updated_at = NOW()
          WHERE id = ?
        `;
        
        await db.query(updateSessionQuery, [req.user.id, checklist.eod_session_id]);
        
        // Add session completion to history
        const insertSessionHistoryQuery = `
          INSERT INTO eod_history (
            eod_session_id,
            action_type,
            action_by,
            action_details,
            ip_address
          ) VALUES (?, ?, ?, ?, ?)
        `;
        
        await db.query(insertSessionHistoryQuery, [
          checklist.eod_session_id,
          'session_completed',
          req.user.id,
          JSON.stringify({ auto_completed: true }),
          req.ip
        ]);
      }
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    return res.status(200).json({
      success: true,
      message: 'Checklist updated successfully',
      data: {
        checklist_id: checklistId,
        status: newStatus,
        completed_items: completedCount,
        completion_percentage: completionPercentage
      }
    });
  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    
    console.error('Error updating branch checklist:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Upload a file attachment for a checklist item
 */
exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const { checklist_id, checklist_item_id } = req.body;
    
    if (!checklist_id || !checklist_item_id) {
      return res.status(400).json({
        success: false,
        message: 'Checklist ID and checklist item ID are required'
      });
    }
    
    // Save attachment info in the database
    const insertQuery = `
      INSERT INTO attachments (
        ticket_id,
        comment_id,
        user_id,
        file_name,
        file_path,
        file_url,
        file_type,
        file_size
      ) VALUES (0, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // For this example, we're using comment_id to store the checklist_item_id
    // In a real implementation, you might want to modify the attachments table
    // to include specific fields for EOD checklist attachments
    
    const [result] = await db.query(insertQuery, [
      checklist_item_id,
      req.user.id,
      req.file.originalname,
      req.file.path,
      `/uploads/${req.file.filename}`, // Assuming you have an uploads folder
      req.file.mimetype,
      req.file.size
    ]);
    
    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        attachment_id: result.insertId,
        file_name: req.file.originalname,
        file_url: `/uploads/${req.file.filename}`,
        file_type: req.file.mimetype,
        file_size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading attachment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get template items
 */
exports.getTemplateItems = async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const query = `
      SELECT 
        id,
        item_name,
        description,
        item_order,
        required_role,
        is_mandatory,
        is_active
      FROM 
        checklist_items
      WHERE 
        template_id = ? AND is_active = 1
      ORDER BY 
        item_order ASC
    `;
    
    const [items] = await db.query(query, [templateId]);
    
    return res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Error getting template items:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};