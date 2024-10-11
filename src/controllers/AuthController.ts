import { Request, Response } from "express";
import User from "../models/User";
import { hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import Token from "../models/Token";
import { AuthEmail } from "../emails/AuthEmail";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;

      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(409).json({ error: "User already exists" });
        return;
      }

      const user = new User(req.body);
      // Hash the password before saving it to the database
      user.password = await hashPassword(password);

      // Generate a token for email verification
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // Send the email
      AuthEmail.sendVerificationEmail({ 
        email: user.email, 
        user: user.name,
        token: token.token,
      })

      await Promise.allSettled([user.save(), token.save()]);
      res.send(
        "Account created successfully. Check your email to verify your account"
      );
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      // Find the token in the database
      const tokenExists = await Token.findOne({ token })
      if(!tokenExists) {
        const error = new Error('Invalid token')
        res.status(401).json({ error: error.message });
        return;
      }

      const user = await User.findById(tokenExists.user);
      if(!user) {
        const error = new Error('User not found')
        res.status(404).json({ error: error.message });
        return;
      }

      user.confirmed = true;
      
      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      res.send('Account verified successfully');
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

}

