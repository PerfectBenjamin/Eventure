const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

// Create a new user
router.post(
  "/",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("name").notEmpty().withMessage("Name is required"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  userController.createUser
);

// User login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  userController.loginUser
);

// Forgot password
router.post("/forgot-password", userController.forgotPassword);
// Reset password
router.post("/reset-password/:token", userController.resetPassword);

// Get all users (admin only)
router.get(
  "/",
  authenticateJWT,
  authorizeRoles("admin"),
  userController.getAllUsers
);

// Update a user by ID (self or admin)
router.put("/:id", authenticateJWT, userController.updateUser);

// Delete a user by ID (admin only)
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  userController.deleteUser
);

// Get a single user by email
router.get("/email/:email", authenticateJWT, userController.getUserByEmail);

// Get a single user by ID (self or admin)
router.get("/:id", authenticateJWT, userController.getUserById);

module.exports = router;
