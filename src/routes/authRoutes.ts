import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post(
  "/create-account",
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .notEmpty()
    .withMessage("Password is required"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long")
    .notEmpty()
    .withMessage("Name is required"),
  handleInputErrors,
  AuthController.createAccount
);

router.post('/confirm-account',
  body('token').isString().notEmpty().withMessage('Token is required'),
  handleInputErrors,
  AuthController.confirmAccount
)

router.post('/login',
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isString().notEmpty().withMessage('Password is required'),
  handleInputErrors,
  AuthController.login
)

router.post('/request-code',
  body('email').isEmail().withMessage('Invalid email'),
  handleInputErrors,
  AuthController.resendVerificationEmail
)

router.post('/forgot-password',
  body('email').isEmail().withMessage('Invalid email'),
  handleInputErrors,
  AuthController.requestPasswordReset
)

router.post('/validate-token',
  body('token').isString().notEmpty().withMessage('Token is required'),
  handleInputErrors,
  AuthController.validatePasswordResetToken
)

router.post('/update-password/:token',
  param('token').isString().notEmpty().withMessage('Token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .notEmpty()
    .withMessage('Password is required'),
  body('password_confirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updatePassword
)

router.get('/user', authenticate, AuthController.user)

export default router;
