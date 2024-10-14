import { Request, Response } from "express";
import User from "../models/User";
import { comparePasswords, hashPassword } from "../utils/auth";
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
      });

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
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Invalid token");
        res.status(404).json({ error: error.message });
        return;
      }

      const user = await User.findById(tokenExists.user);
      if (!user) {
        const error = new Error("User not found");
        res.status(404).json({ error: error.message });
        return;
      }

      user.confirmed = true;

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      res.send("Account verified successfully");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      if (!user.confirmed) {
        // Generate a token for email verification
        const token = new Token();
        token.token = generateToken();
        token.user = user.id;

        // Send the email
        AuthEmail.sendVerificationEmail({
          email: user.email,
          user: user.name,
          token: token.token,
        });

        await Promise.allSettled([user.save(), token.save()]);
        const error = new Error("Account not verified. Check your email");
        res.status(401).json({ error: error.message });
        return;
      }

      const passwordMatch = await comparePasswords(password, user.password);

      if (!passwordMatch) {
        res.status(401).json({ error: "Invalid password" });
        return;
      }
      
      console.log(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static resendVerificationEmail = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // Check if the user already exists
      const user = await User.findOne({ email });
      if(!user) {
        res.status(404).json({ error: "User does not exists" });
        return;
      }

      if(user.confirmed) {
        res.status(403).json({ error: "Account already verified" });
        return;
      }

      // Generate a token for email verification
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // Send the email
      AuthEmail.sendVerificationEmail({
        email: user.email,
        user: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);
      res.send(
        "New token created. Check your email to verify your account"
      );
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}
