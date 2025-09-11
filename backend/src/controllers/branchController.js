const db = require('../config/database');

/**
 * Get all branches
 */
exports.getAllBranches = async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        branch_code, 
        branch_name, 
        address, 
        contact_phone, 
        is_active,
        created_at, 
        updated_at
      FROM 
        branches
      ORDER BY 
        branch_name ASC
    `;
    
    const [branches] = await db.query(query);
    
    return res.status(200).json({
      success: true,
      count: branches.length,
      data: branches
    });
  } catch (error) {
    console.error('Error getting all branches:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get a branch by ID
 */
exports.getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id, 
        branch_code, 
        branch_name, 
        address, 
        contact_phone, 
        is_active,
        created_at, 
        updated_at
      FROM 
        branches
      WHERE 
        id = ?
    `;
    
    const [branches] = await db.query(query, [id]);
    
    if (branches.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: branches[0]
    });
  } catch (error) {
    console.error('Error getting branch by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Create a new branch
 */
exports.createBranch = async (req, res) => {
  try {
    // Check if user has admin privileges
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin privileges required'
      });
    }
    
    const { branch_code, branch_name, address, contact_phone, is_active } = req.body;
    
    if (!branch_code || !branch_name) {
      return res.status(400).json({
        success: false,
        message: 'Branch code and name are required'
      });
    }
    
    // Check if branch code already exists
    const checkQuery = 'SELECT id FROM branches WHERE branch_code = ?';
    const [existingBranches] = await db.query(checkQuery, [branch_code]);
    
    if (existingBranches.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Branch code already exists'
      });
    }
    
    const insertQuery = `
      INSERT INTO branches (
        branch_code, 
        branch_name, 
        address, 
        contact_phone, 
        is_active
      ) VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(insertQuery, [
      branch_code,
      branch_name,
      address || null,
      contact_phone || null,
      is_active !== undefined ? is_active : 1
    ]);
    
    return res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: {
        id: result.insertId,
        branch_code,
        branch_name,
        address,
        contact_phone,
        is_active: is_active !== undefined ? is_active : 1
      }
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Update a branch
 */
exports.updateBranch = async (req, res) => {
  try {
    // Check if user has admin privileges
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin privileges required'
      });
    }
    
    const { id } = req.params;
    const { branch_code, branch_name, address, contact_phone, is_active } = req.body;
    
    if (!branch_code && !branch_name && address === undefined && contact_phone === undefined && is_active === undefined) {
      return res.status(400).json({
        success: false,
        message: 'At least one field to update is required'
      });
    }
    
    // Check if branch exists
    const checkQuery = 'SELECT * FROM branches WHERE id = ?';
    const [existingBranches] = await db.query(checkQuery, [id]);
    
    if (existingBranches.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }
    
    const existingBranch = existingBranches[0];
    
    // Check if updating branch code to one that already exists
    if (branch_code && branch_code !== existingBranch.branch_code) {
      const codeCheckQuery = 'SELECT id FROM branches WHERE branch_code = ? AND id != ?';
      const [branchesWithCode] = await db.query(codeCheckQuery, [branch_code, id]);
      
      if (branchesWithCode.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Branch code already exists'
        });
      }
    }
    
    const updateQuery = `
      UPDATE branches
      SET
        branch_code = ?,
        branch_name = ?,
        address = ?,
        contact_phone = ?,
        is_active = ?,
        updated_at = NOW()
      WHERE id = ?
    `;
    
    await db.query(updateQuery, [
      branch_code || existingBranch.branch_code,
      branch_name || existingBranch.branch_name,
      address !== undefined ? address : existingBranch.address,
      contact_phone !== undefined ? contact_phone : existingBranch.contact_phone,
      is_active !== undefined ? is_active : existingBranch.is_active,
      id
    ]);
    
    return res.status(200).json({
      success: true,
      message: 'Branch updated successfully',
      data: {
        id: parseInt(id),
        branch_code: branch_code || existingBranch.branch_code,
        branch_name: branch_name || existingBranch.branch_name,
        address: address !== undefined ? address : existingBranch.address,
        contact_phone: contact_phone !== undefined ? contact_phone : existingBranch.contact_phone,
        is_active: is_active !== undefined ? is_active : existingBranch.is_active
      }
    });
  } catch (error) {
    console.error('Error updating branch:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Delete a branch
 */
exports.deleteBranch = async (req, res) => {
  try {
    // Check if user has admin privileges
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin privileges required'
      });
    }
    
    const { id } = req.params;
    
    // Check if branch exists
    const checkQuery = 'SELECT id FROM branches WHERE id = ?';
    const [existingBranches] = await db.query(checkQuery, [id]);
    
    if (existingBranches.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }
    
    // Check if branch is used in any checklist
    const checkUsageQuery = 'SELECT id FROM branch_checklists WHERE branch_id = ? LIMIT 1';
    const [usedBranches] = await db.query(checkUsageQuery, [id]);
    
    if (usedBranches.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete branch that is used in checklists. Consider marking it as inactive instead.'
      });
    }
    
    // Delete branch
    const deleteQuery = 'DELETE FROM branches WHERE id = ?';
    await db.query(deleteQuery, [id]);
    
    return res.status(200).json({
      success: true,
      message: 'Branch deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};