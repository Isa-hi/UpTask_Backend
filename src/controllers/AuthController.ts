import { Request, Response } from "express";
import User from "../models/User";
import { comparePasswords, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import Token from "../models/Token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

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
      
      const jwtToken = generateJWT({id: user.id});
      res.json( jwtToken );
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

  static requestPasswordReset = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // Check if the user already exists
      const user = await User.findOne({ email });
      if(!user) {
        res.status(404).json({ error: "User does not exists" });
        return;
      }

      // Generate a token for email verification
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // Send the email
      AuthEmail.sendPasswordResetEmail({
        email: user.email,
        user: user.name,
        token: token.token,
      });
      await token.save(); 

      res.send(
        "Password reset token created. Check your email to reset your password"
      );
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static validatePasswordResetToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
       // Find the token in the database
       const tokenExists = await Token.findOne({ token });
       if (!tokenExists) {
         const error = new Error("Invalid token");
         res.status(404).json({ error: error.message });
         return;
       }
        res.send("Token is valid, you can reset your password");
       
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static updatePassword = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // Find the token in the database
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Invalid token");
        res.status(404).json({ error: error.message });
        return;
      }
      const user = await User.findById(tokenExists.user)     
      const hashedPassword = await hashPassword(password);      
      user.password = hashedPassword;
      
      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      res.send("Password updated successfully");
      
    } catch (error) {
      res.status(500).json({ error: error.message });
      
    }
  }

  static user = async (req: Request, res: Response) => {
      res.json(req.user);
      return 
  }

  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;
    const userExists = await User.findOne({email});
    if(userExists && userExists.id.toString() !== req.user.id.toString()) {
      res.status(409).json({ error: "User already exists" });
      return;
    }
    req.user.name = name;
    req.user.email = email;

    try {
      await req.user.save();
      res.json('Profile updated successfully');
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;

    const user = await User.findById(req.user.id);
    const passwordMatch = await comparePasswords(current_password, user.password);
    
    if(!passwordMatch) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }
    try {
      req.user.password = await hashPassword(password);
      await req.user.save();
      res.json('Password updated successfully');
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    const passwordMatch = await comparePasswords(password, user.password);
    if(!passwordMatch) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }
    res.json('Password is correct');
  }

}
