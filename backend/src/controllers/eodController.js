// src/controllers/eodController.js
const db = require('../config/database');

/**
 * Get EOD session data for a specific date
 */
exports.getEodByDate = async (req, res) => {
  try {
    const { date } = req.params;

    // Validate date format
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Query to get tickets for the specified date
    const query = `
      SELECT 
        t.id,
        t.ticket_number,
        t.title,
        t.status_id,
        t.created_at,
        t.updated_at,
        u.full_name as assigned_to,
        d.name as department,
        c.name as category,
        p.name as priority,
        s.name as status
      FROM 
        tickets t
      LEFT JOIN 
        users u ON t.assigned_to = u.id
      LEFT JOIN 
        departments d ON t.department_id = d.id
      LEFT JOIN 
        categories c ON t.category_id = c.id
      LEFT JOIN 
        priorities p ON t.priority_id = p.id
      LEFT JOIN 
        statuses s ON t.status_id = s.id
      WHERE 
        DATE(t.created_at) = ? OR DATE(t.updated_at) = ?
      ORDER BY 
        t.updated_at DESC
    `;

    const [tickets] = await db.query(query, [date, date]);

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status_id = 4 OR status_id = 5 THEN 1 ELSE 0 END) as resolved_tickets,
        SUM(CASE WHEN status_id = 1 THEN 1 ELSE 0 END) as new_tickets,
        SUM(CASE WHEN status_id = 2 THEN 1 ELSE 0 END) as in_progress_tickets,
        SUM(CASE WHEN status_id = 3 THEN 1 ELSE 0 END) as pending_tickets
      FROM 
        tickets
      WHERE 
        DATE(created_at) = ? OR DATE(updated_at) = ?
    `;

    const [summary] = await db.query(summaryQuery, [date, date]);

    // Check if we have EOD sessions table
    let session = null;
    let branchChecklists = [];

    try {
      // Try to get EOD session info if the table exists
      const sessionQuery = `
        SELECT 
          es.id,
          es.session_date,
          es.status,
          es.started_at,
          es.completed_at,
          u1.full_name as started_by_name,
          u2.full_name as completed_by_name,
          es.notes,
          ct.template_name,
          ct.description as template_description
        FROM 
          eod_sessions es
        LEFT JOIN 
          users u1 ON es.started_by = u1.id
        LEFT JOIN 
          users u2 ON es.completed_by = u2.id
        LEFT JOIN
          checklist_templates ct ON es.template_id = ct.id
        WHERE 
          es.session_date = ?
      `;

      const [sessions] = await db.query(sessionQuery, [date]);

      if (sessions.length > 0) {
        session = sessions[0];

        // Get branch checklists for this session
        const branchChecklistsQuery = `
          SELECT 
            bc.id,
            bc.status,
            bc.total_items,
            bc.completed_items,
            bc.completion_percentage,
            bc.started_at,
            bc.completed_at,
            u1.full_name as assigned_to_name,
            u2.full_name as completed_by_name,
            bc.notes,
            b.branch_code,
            b.branch_name,
            b.address
          FROM 
            branch_checklists bc
          LEFT JOIN 
            users u1 ON bc.assigned_to = u1.id
          LEFT JOIN 
            users u2 ON bc.completed_by = u2.id
          LEFT JOIN
            branches b ON bc.branch_id = b.id
          WHERE 
            bc.eod_session_id = ?
          ORDER BY
            b.branch_name ASC
        `;

        [branchChecklists] = await db.query(branchChecklistsQuery, [session.id]);
      }
    } catch (error) {
      // If tables don't exist yet, just continue with ticket data
      console.log('EOD tables may not exist yet:', error.message);
    }

    return res.status(200).json({
      success: true,
      data: {
        date,
        session,
        branchChecklists,
        tickets,
        ticketStats: summary[0],
        summary: {
          total_branches: branchChecklists.length,
          completed_branches: branchChecklists.filter(b => b.status === 'completed').length,
          in_progress_branches: branchChecklists.filter(b => b.status === 'in_progress').length,
          pending_branches: branchChecklists.filter(b => b.status === 'pending').length
        }
      }
    });
  } catch (error) {
    console.error('Error getting EOD by date:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get EOD statistics for a date range
 */
exports.getEodByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date format
    if (!startDate.match(/^\d{4}-\d{2}-\d{2}$/) || !endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Query to get daily ticket statistics
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status_id = 4 OR status_id = 5 THEN 1 ELSE 0 END) as resolved_tickets,
        SUM(CASE WHEN status_id = 1 THEN 1 ELSE 0 END) as new_tickets,
        SUM(CASE WHEN status_id = 2 THEN 1 ELSE 0 END) as in_progress_tickets,
        SUM(CASE WHEN status_id = 3 THEN 1 ELSE 0 END) as pending_tickets
      FROM 
        tickets
      WHERE 
        DATE(created_at) BETWEEN ? AND ?
      GROUP BY 
        DATE(created_at)
      ORDER BY 
        DATE(created_at) ASC
    `;

    const [ticketStats] = await db.query(query, [startDate, endDate]);

    // Get department-wise statistics
    const deptQuery = `
      SELECT 
        d.name as department,
        COUNT(*) as total_tickets,
        SUM(CASE WHEN t.status_id = 4 OR t.status_id = 5 THEN 1 ELSE 0 END) as completed
      FROM 
        tickets t
      JOIN 
        departments d ON t.department_id = d.id
      WHERE 
        DATE(t.created_at) BETWEEN ? AND ?
      GROUP BY 
        t.department_id
      ORDER BY 
        completed DESC
    `;

    const [departmentStats] = await db.query(deptQuery, [startDate, endDate]);

    // Try to get EOD session data if the tables exist
    let sessions = [];
    let branchStats = [];

    try {
      // Try to get EOD session info if the table exists
      const sessionQuery = `
        SELECT 
          es.session_date as date,
          es.status,
          COUNT(bc.id) as total_branches,
          SUM(CASE WHEN bc.status = 'completed' THEN 1 ELSE 0 END) as completed_branches,
          SUM(CASE WHEN bc.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_branches,
          SUM(CASE WHEN bc.status = 'pending' THEN 1 ELSE 0 END) as pending_branches,
          AVG(bc.completion_percentage) as avg_completion_percentage
        FROM 
          eod_sessions es
        LEFT JOIN 
          branch_checklists bc ON es.id = bc.eod_session_id
        WHERE 
          es.session_date BETWEEN ? AND ?
        GROUP BY 
          es.id
        ORDER BY 
          es.session_date ASC
      `;

      [sessions] = await db.query(sessionQuery, [startDate, endDate]);

      // Get branch-wise statistics
      const branchStatsQuery = `
        SELECT 
          b.id,
          b.branch_name,
          b.branch_code,
          COUNT(bc.id) as total_sessions,
          SUM(CASE WHEN bc.status = 'completed' THEN 1 ELSE 0 END) as completed_sessions,
          AVG(bc.completion_percentage) as avg_completion_percentage
        FROM 
          branches b
        LEFT JOIN 
          branch_checklists bc ON b.id = bc.branch_id
        LEFT JOIN
          eod_sessions es ON bc.eod_session_id = es.id
        WHERE 
          es.session_date BETWEEN ? AND ?
        GROUP BY 
          b.id
        ORDER BY 
          completed_sessions DESC, avg_completion_percentage DESC
      `;

      [branchStats] = await db.query(branchStatsQuery, [startDate, endDate]);
    } catch (error) {
      // If tables don't exist yet, just continue with ticket data
      console.log('EOD tables may not exist yet:', error.message);
    }

    return res.status(200).json({
      success: true,
      data: {
        startDate,
        endDate,
        ticketStats,
        departmentStats,
        sessions,
        branchStats
      }
    });
  } catch (error) {
    console.error('Error getting EOD by date range:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get current day's EOD status
 */
exports.getCurrentDayEod = async (req, res) => {
  try {
    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];

    // Query to get tickets for the current date
    const query = `
      SELECT 
        t.id,
        t.ticket_number,
        t.title,
        t.status_id,
        t.created_at,
        t.updated_at,
        u.full_name as assigned_to,
        d.name as department,
        c.name as category,
        p.name as priority,
        s.name as status
      FROM 
        tickets t
      LEFT JOIN 
        users u ON t.assigned_to = u.id
      LEFT JOIN 
        departments d ON t.department_id = d.id
      LEFT JOIN 
        categories c ON t.category_id = c.id
      LEFT JOIN 
        priorities p ON t.priority_id = p.id
      LEFT JOIN 
        statuses s ON t.status_id = s.id
      WHERE 
        DATE(t.created_at) = ? OR DATE(t.updated_at) = ?
      ORDER BY 
        t.updated_at DESC
    `;

    const [tickets] = await db.query(query, [currentDate, currentDate]);

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status_id = 4 OR status_id = 5 THEN 1 ELSE 0 END) as resolved_tickets,
        SUM(CASE WHEN status_id = 1 THEN 1 ELSE 0 END) as new_tickets,
        SUM(CASE WHEN status_id = 2 THEN 1 ELSE 0 END) as in_progress_tickets,
        SUM(CASE WHEN status_id = 3 THEN 1 ELSE 0 END) as pending_tickets
      FROM 
        tickets
      WHERE 
        DATE(created_at) = ? OR DATE(updated_at) = ?
    `;

    const [summary] = await db.query(summaryQuery, [currentDate, currentDate]);

    // Get EOD session info
    let session = null;
    let branchChecklists = [];

    try {
      const sessionQuery = `
        SELECT 
          es.id,
          es.session_date,
          es.status,
          es.started_at,
          es.completed_at,
          u1.full_name as started_by_name,
          u2.full_name as completed_by_name,
          es.notes,
          ct.template_name,
          ct.description as template_description
        FROM 
          eod_sessions es
        LEFT JOIN 
          users u1 ON es.started_by = u1.id
        LEFT JOIN 
          users u2 ON es.completed_by = u2.id
        LEFT JOIN
          checklist_templates ct ON es.template_id = ct.id
        WHERE 
          es.session_date = ?
      `;

      const [sessions] = await db.query(sessionQuery, [currentDate]);

      if (sessions.length > 0) {
        session = sessions[0];

        // Get branch checklists for this session
        const branchChecklistsQuery = `
          SELECT 
            bc.id,
            bc.status,
            bc.total_items,
            bc.completed_items,
            bc.completion_percentage,
            bc.started_at,
            bc.completed_at,
            u1.full_name as assigned_to_name,
            u2.full_name as completed_by_name,
            bc.notes,
            b.branch_code,
            b.branch_name,
            b.address
          FROM 
            branch_checklists bc
          LEFT JOIN 
            users u1 ON bc.assigned_to = u1.id
          LEFT JOIN 
            users u2 ON bc.completed_by = u2.id
          LEFT JOIN
            branches b ON bc.branch_id = b.id
          WHERE 
            bc.eod_session_id = ?
          ORDER BY
            b.branch_name ASC
        `;

        [branchChecklists] = await db.query(branchChecklistsQuery, [session.id]);
      }
    } catch (error) {
      console.log('EOD tables may not exist yet:', error.message);
    }

    return res.status(200).json({
      success: true,
      data: {
        date: currentDate,
        session,
        branchChecklists,
        tickets,
        ticketStats: summary[0],
        summary: {
          total_branches: branchChecklists.length,
          completed_branches: branchChecklists.filter(b => b.status === 'completed').length,
          in_progress_branches: branchChecklists.filter(b => b.status === 'in_progress').length,
          pending_branches: branchChecklists.filter(b => b.status === 'pending').length
        }
      }
    });
  } catch (error) {
    console.error('Error getting current day EOD data:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get user performance for EOD reporting
 */
exports.getUserPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date format
    if (!startDate.match(/^\d{4}-\d{2}-\d{2}$/) || !endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Query to get user performance statistics for tickets
    const ticketUserStatsQuery = `
      SELECT 
        u.id,
        u.full_name,
        u.role,
        COUNT(t.id) as total_assigned_tickets,
        SUM(CASE WHEN t.status_id = 4 OR t.status_id = 5 THEN 1 ELSE 0 END) as resolved_tickets,
        SUM(CASE WHEN t.status_id = 2 THEN 1 ELSE 0 END) as in_progress_tickets,
        SUM(CASE WHEN t.status_id = 3 THEN 1 ELSE 0 END) as pending_tickets,
        SUM(CASE WHEN t.status_id = 1 THEN 1 ELSE 0 END) as new_tickets
      FROM 
        users u
      LEFT JOIN 
        tickets t ON u.id = t.assigned_to
      WHERE 
        (DATE(t.created_at) BETWEEN ? AND ? OR DATE(t.updated_at) BETWEEN ? AND ?)
        AND t.id IS NOT NULL
      GROUP BY 
        u.id
      ORDER BY 
        resolved_tickets DESC
    `;

    const [ticketUserStats] = await db.query(ticketUserStatsQuery, [startDate, endDate, startDate, endDate]);

    // Try to get EOD user performance data if the tables exist
    let eodUserStats = [];

    try {
      // Query to get user performance statistics for EOD checklists
      const eodUserStatsQuery = `
        SELECT 
          u.id,
          u.full_name,
          u.role,
          b.branch_name,
          COUNT(DISTINCT bc.id) as total_assigned,
          SUM(CASE WHEN bc.status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN bc.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN bc.status = 'pending' THEN 1 ELSE 0 END) as pending,
          AVG(bc.completion_percentage) as avg_completion_percentage,
          AVG(TIMESTAMPDIFF(MINUTE, bc.started_at, 
            CASE WHEN bc.completed_at IS NOT NULL THEN bc.completed_at ELSE NOW() END)) as avg_completion_time_minutes
        FROM 
          users u
        LEFT JOIN 
          branch_checklists bc ON u.id = bc.assigned_to
        LEFT JOIN 
          eod_sessions es ON bc.eod_session_id = es.id
        LEFT JOIN
          branches b ON u.branch_id = b.id
        WHERE 
          es.session_date BETWEEN ? AND ?
          AND bc.id IS NOT NULL
        GROUP BY 
          u.id
        ORDER BY 
          completed DESC, avg_completion_percentage DESC
      `;

      [eodUserStats] = await db.query(eodUserStatsQuery, [startDate, endDate]);
    } catch (error) {
      // If tables don't exist yet, just continue with ticket data
      console.log('EOD tables may not exist yet:', error.message);
    }

    return res.status(200).json({
      success: true,
      data: {
        startDate,
        endDate,
        eodUserStats,
        ticketUserStats
      }
    });
  } catch (error) {
    console.error('Error getting user performance:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get branch checklist details with items
 */
exports.getBranchChecklistDetails = async (req, res) => {
  try {
    const { checklistId } = req.params;

    // Check if branch_checklists table exists
    try {
      // Get branch checklist info
      const checklistQuery = `
        SELECT 
          bc.id,
          bc.status,
          bc.total_items,
          bc.completed_items,
          bc.completion_percentage,
          bc.started_at,
          bc.completed_at,
          bc.notes,
          es.session_date,
          es.status as session_status,
          b.branch_name,
          b.branch_code,
          u1.full_name as assigned_to_name,
          u2.full_name as completed_by_name
        FROM 
          branch_checklists bc
        JOIN 
          eod_sessions es ON bc.eod_session_id = es.id
        JOIN 
          branches b ON bc.branch_id = b.id
        LEFT JOIN 
          users u1 ON bc.assigned_to = u1.id
        LEFT JOIN 
          users u2 ON bc.completed_by = u2.id
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

      // Get checklist items with completion status
      const itemsQuery = `
        SELECT 
          ci.id,
          ci.item_name,
          ci.description,
          ci.item_order,
          ci.required_role,
          ci.is_mandatory,
          cc.is_completed,
          cc.completed_at,
          u.full_name as completed_by_name,
          cc.notes as completion_notes,
          cc.attachment_url
        FROM 
          checklist_items ci
        JOIN 
          checklist_templates ct ON ci.template_id = ct.id
        JOIN 
          eod_sessions es ON es.template_id = ct.id
        JOIN 
          branch_checklists bc ON bc.eod_session_id = es.id
        LEFT JOIN 
          checklist_completions cc ON cc.checklist_item_id = ci.id AND cc.branch_checklist_id = bc.id
        LEFT JOIN 
          users u ON cc.completed_by = u.id
        WHERE 
          bc.id = ?
        ORDER BY 
          ci.item_order ASC
      `;

      const [items] = await db.query(itemsQuery, [checklistId]);

      return res.status(200).json({
        success: true,
        data: {
          checklist,
          items
        }
      });
    } catch (error) {
      // If tables don't exist yet, return a placeholder response
      console.log('EOD tables may not exist yet:', error.message);

      return res.status(200).json({
        success: true,
        data: {
          checklist: {
            id: checklistId,
            status: 'pending',
            total_items: 0,
            completed_items: 0,
            completion_percentage: 0,
            branch_name: 'Example Branch',
            branch_code: 'BR001'
          },
          items: []
        }
      });
    }
  } catch (error) {
    console.error('Error getting branch checklist details:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get EOD checklist templates
 */
exports.getChecklistTemplates = async (req, res) => {
  try {
    // Check if checklist_templates table exists
    try {
      // Query to get all active checklist templates
      const query = `
        SELECT 
          id,
          template_name,
          description,
          is_active,
          created_at,
          updated_at
        FROM 
          checklist_templates
        WHERE 
          is_active = 1
        ORDER BY 
          template_name ASC
      `;

      const [templates] = await db.query(query);

      return res.status(200).json({
        success: true,
        data: templates
      });
    } catch (error) {
      // If table doesn't exist yet, return an empty array
      console.log('checklist_templates table may not exist yet:', error.message);

      return res.status(200).json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Error getting checklist templates:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};