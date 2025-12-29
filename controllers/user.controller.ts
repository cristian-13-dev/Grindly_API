import User from "../models/user.model.js";
import type { Request, Response, NextFunction } from "express";

// Custom error interface
interface CustomError extends Error {
  statusCode?: number;
}

// Extend Request interface to include userId
interface AuthenticatedRequest extends Request {
  userId?: string;
}

// 🔹 GET all users (fără parole)
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 GET user by ID
export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      const error: CustomError = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 GET current user from token (asumat că req.userId e setat de middleware auth)
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Current user loaded",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 PATCH update profile (username / email)
export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { username, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { username, email },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 GET gamification only
export const getUserGamification = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        xp: user.gamification?.xp || 0,
        level: user.gamification?.level || 1,
        coins: user.gamification?.coins || 0,
        streakCount: user.gamification?.streakCount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
