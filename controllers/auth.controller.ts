import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import type { Request, Response, NextFunction } from "express";

// Custom error interface for HTTP errors
interface HttpError extends Error {
  statusCode?: number;
}

// MARK: Sign Up Logic
export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { username, email, password } = req.body;

    // Validate JWT_SECRET
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error: HttpError = new Error("User already exists with this email");
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUsers = await User.create(
      [{ username, email, password: hashedPassword }],
      { session }
    );
    
    // Create JWT token (no expiration)
    const token = jwt.sign(
      { userId: newUsers[0]._id.toString() },
      JWT_SECRET as string
    );
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        user: newUsers[0],
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
// MARK: Sign In Logic

export const signIn = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  try {
    // Validate JWT_SECRET
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      const error: HttpError = new Error("User does not exist with this email");
      error.statusCode = 404;
      throw error;
    }
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error: HttpError = new Error("Invalid password");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET as string
    );

    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// MARK: Sign In or Create Logic
export const signInOrCreate = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      const error: HttpError = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }

    // Validate JWT_SECRET
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // User exists - verify password and sign in
      const isPasswordValid = await bcrypt.compare(password, existingUser.password);

      if (!isPasswordValid) {
        const error: HttpError = new Error("Invalid password");
        error.statusCode = 401;
        throw error;
      }

      await session.abortTransaction();
      session.endSession();

      const token = jwt.sign(
        { userId: existingUser._id.toString() },
        JWT_SECRET as string
      );

      return res.status(200).json({
        success: true,
        message: "User signed in successfully",
        isNewUser: false,
        data: {
          token,
          user: existingUser,
        },
      });
    }

    // User doesn't exist - create new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate username from email (part before @)
    const username = email.split("@")[0];

    const newUsers = await User.create(
      [{ username, email, password: hashedPassword }],
      { session }
    );

    const token = jwt.sign(
      { userId: newUsers[0]._id.toString() },
      JWT_SECRET as string
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "User created and signed in successfully",
      isNewUser: true,
      data: {
        token,
        user: newUsers[0],
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};