import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "../config/env.js";
import type {NextFunction, Request, Response} from "express";

interface HttpError extends Error {
  statusCode?: number;
}

const ACCESS_TOKEN_EXP = "15m";
const REFRESH_TOKEN_EXP = "7d";

// MARK: SignUp
export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {email, password} = req.body;

    if (!email || !password) {
      const error: HttpError = new Error("Email and password are required");
      error.statusCode = 400;
      await session.abortTransaction();
      await session.endSession();
      return next(error);
    }

    if (!JWT_SECRET) {
      const error = new Error("JWT_SECRET is not configured");
      await session.abortTransaction();
      await session.endSession();
      return next(error);
    }

    const existingUser = await User.findOne({email});
    if (existingUser) {
      const error: HttpError = new Error("User already exists with this email");
      error.statusCode = 409;
      await session.abortTransaction();
      await session.endSession();
      return next(error);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const username = email.split("@")[0];

    const newUser = await User.create([{username, email, password: hashedPassword}], {session});

    // Create tokens
    const accessToken = jwt.sign({userId: newUser[0]._id.toString()}, JWT_SECRET, {expiresIn: ACCESS_TOKEN_EXP});
    const refreshToken = jwt.sign({userId: newUser[0]._id.toString()}, JWT_SECRET, {expiresIn: REFRESH_TOKEN_EXP});

    // Set cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    await session.commitTransaction();
    await session.endSession();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        _id: newUser[0]._id,
        username: newUser[0].username,
        email: newUser[0].email
      }
    });

  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    next(error);
  }
};

// MARK: SignIn
export const signIn = async (req: Request, res: Response, next: NextFunction) => {
  const {email, password} = req.body;

  try {
    if (!email || !password) {
      const error: HttpError = new Error("Email and password are required");
      error.statusCode = 400;
      return next(error);
    }

    if (!JWT_SECRET) {
      return next(new Error("JWT_SECRET is not configured"));
    }

    const user = await User.findOne({email});
    if (!user) {
      const error: HttpError = new Error("Invalid email or password");
      error.statusCode = 401;
      return next(error);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error: HttpError = new Error("Invalid email or password");
      error.statusCode = 401;
      return next(error);
    }

    // Create tokens
    const accessToken = jwt.sign({userId: user._id.toString()}, JWT_SECRET, {expiresIn: ACCESS_TOKEN_EXP});
    const refreshToken = jwt.sign({userId: user._id.toString()}, JWT_SECRET, {expiresIn: REFRESH_TOKEN_EXP});

    // Set cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: "User signed in successfully"
    });

  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({error: "No refresh token provided"});
    }

    // Verificăm refresh token-ul
    const payload: any = jwt.verify(refreshToken, JWT_SECRET!);

    // Creeăm un nou access token
    const newAccessToken = jwt.sign({userId: payload.userId}, JWT_SECRET!, {
      expiresIn: ACCESS_TOKEN_EXP
    });

    // Setăm cookie-ul nou
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    res.json({success: true});

  } catch (err) {
    console.error(err);
    return res.status(403).json({error: "Invalid refresh token"});
  }
};