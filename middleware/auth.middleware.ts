import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import User from "../models/user.model.js";
// Extend the Request interface to include userId property
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
    }
  }
}

interface JwtPayload {
  userId: string;
}

const authorize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access, no token provided",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;

    // Set userId for controllers that expect it
    req.userId = decoded.userId;

    // Also verify user exists (with timeout handling)
    try {
      const user = await User.findById(decoded.userId).select("-password").maxTimeMS(5000);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access - user not found",
        });
      }

      req.user = user;
    } catch (dbError) {
      // If DB is slow/unavailable, still allow if token is valid
      console.error("Database timeout in auth middleware:", dbError);
      // Continue with just the userId from token
    }

    next();

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(401).json({
      success: false,
      message: "Unauthorized access",
      error: errorMessage,
    });
  }
};

export default authorize;