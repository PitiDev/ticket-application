// src/middleware/mockAuth.js

/**
 * This is a mock authentication middleware for development purposes only.
 * It simulates an authenticated user with predefined role and branch.
 * NEVER USE THIS IN PRODUCTION!
 */
const mockAuth = (req, res, next) => {
  // Simulate an authenticated user
  // You can change these values for testing different scenarios
  req.user = {
    id: 2,
    username: "pitidev.lao@gmail.com",
    email: "pitidev.lao@gmail.com",
    role: "super_admin",
    full_name: "PITI PHANTHASOMBATH",
    is_active: 1,
    avatar_url: null,
    created_at: "2025-02-16T19:22:38.000Z",
    branch_id: 1,
    updated_at: "2025-09-08T01:53:04.000Z",
    last_login: null,
    branch_name: "Main Branch" // Added branch name for completeness
  };
  
  // Ensure branch_id is a number, not a string
  if (req.user.branch_id) {
    req.user.branch_id = parseInt(req.user.branch_id);
  }
  
  console.log('Mock auth middleware applied', {
    id: req.user.id,
    role: req.user.role,
    branch_id: req.user.branch_id
  });
  
  next();
};