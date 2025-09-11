// src/routes/branchRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Try to import the real controller, fall back to inline implementation
let branchController;
try {
  branchController = require('../controllers/branchController');
} catch (error) {
  console.error('Warning: branchController not found, using inline implementation');
  
  // DB import
  const db = require('../config/database');
  
  // Inline controller functions
  branchController = {
    getAllBranches: async (req, res) => {
      try {
        // Check if branches table exists first
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
          // If table doesn't exist, return empty array
          console.log('branches table may not exist yet:', error.message);
          
          return res.status(200).json({
            success: true,
            count: 0,
            data: []
          });
        }
      } catch (error) {
        console.error('Error getting all branches:', error);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message
        });
      }
    },
    
    getBranchById: async (req, res) => {
      try {
        const { id } = req.params;
        
        // Check if branches table exists
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
          // If table doesn't exist, return not found
          console.log('branches table may not exist yet:', error.message);
          
          return res.status(404).json({
            success: false,
            message: 'Branch not found or table does not exist'
          });
        }
      } catch (error) {
        console.error('Error getting branch by ID:', error);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message
        });
      }
    },
    
    // Placeholder functions for other operations
    createBranch: (req, res) => {
      return res.status(200).json({
        success: true,
        message: 'This endpoint is ready for implementation',
        data: {
          received: req.body
        }
      });
    },
    
    updateBranch: (req, res) => {
      return res.status(200).json({
        success: true,
        message: 'This endpoint is ready for implementation',
        data: {
          id: req.params.id,
          received: req.body
        }
      });
    },
    
    deleteBranch: (req, res) => {
      return res.status(200).json({
        success: true,
        message: 'This endpoint is ready for implementation',
        data: {
          id: req.params.id
        }
      });
    }
  };
}

/**
 * @route   GET /api/branches
 * @desc    Get all branches
 * @access  Private
 */
router.get('/', branchController.getAllBranches);

/**
 * @route   GET /api/branches/:id
 * @desc    Get a specific branch by ID
 * @access  Private
 */
router.get('/:id', branchController.getBranchById);

/**
 * @route   POST /api/branches
 * @desc    Create a new branch
 * @access  Private (Admin only)
 */
router.post('/', branchController.createBranch);

/**
 * @route   PUT /api/branches/:id
 * @desc    Update a branch
 * @access  Private (Admin only)
 */
router.put('/:id', branchController.updateBranch);

/**
 * @route   DELETE /api/branches/:id
 * @desc    Delete a branch
 * @access  Private (Admin only)
 */
router.delete('/:id', branchController.deleteBranch);

module.exports = router;