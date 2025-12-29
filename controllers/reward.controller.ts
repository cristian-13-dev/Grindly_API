import Reward from "../models/reward.model.js";
import type { Request, Response, NextFunction } from "express";

// Custom error interface
interface CustomError extends Error {
  statusCode?: number;
}

// Extend Request interface to include userId
interface AuthenticatedRequest extends Request {
  userId?: string;
}

// 🔹 GET all rewards for current user
export const getRewards = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const rewards = await Reward.find({ user: req.userId }).populate('user', 'username email');

    res.status(200).json({
      success: true,
      message: "Rewards fetched successfully",
      data: rewards,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 GET reward by ID (only if belongs to current user)
export const getReward = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const reward = await Reward.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    }).populate('user', 'username email');

    if (!reward) {
      const error: CustomError = new Error("Reward not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Reward fetched successfully",
      data: reward,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 POST create new reward
export const createReward = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const rewardData = {
      ...req.body,
      user: req.userId
    };

    const reward = new Reward(rewardData);
    await reward.save();

    res.status(201).json({
      success: true,
      message: "Reward created successfully",
      data: reward,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 PATCH update reward (only if belongs to current user)
export const updateReward = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const reward = await Reward.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!reward) {
      const error: CustomError = new Error("Reward not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Reward updated successfully",
      data: reward,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 DELETE reward (only if belongs to current user)
export const deleteReward = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const reward = await Reward.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!reward) {
      const error: CustomError = new Error("Reward not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Reward deleted successfully",
      data: reward,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 PATCH claim reward
export const claimReward = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const reward = await Reward.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!reward) {
      const error: CustomError = new Error("Reward not found");
      error.statusCode = 404;
      return next(error);
    }

    if (reward.claimed) {
      const error: CustomError = new Error("Reward already claimed");
      error.statusCode = 400;
      return next(error);
    }

    if (!reward.isActive) {
      const error: CustomError = new Error("Reward is not active");
      error.statusCode = 400;
      return next(error);
    }

    reward.claimed = true;
    reward.claimedAt = new Date();
    
    await reward.save();

    res.status(200).json({
      success: true,
      message: "Reward claimed successfully",
      data: reward,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 GET available rewards (unclaimed and active)
export const getAvailableRewards = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const rewards = await Reward.find({ 
      user: req.userId, 
      claimed: false,
      isActive: true
    });

    res.status(200).json({
      success: true,
      message: "Available rewards fetched successfully",
      data: rewards,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 GET claimed rewards
export const getClaimedRewards = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const rewards = await Reward.find({ 
      user: req.userId, 
      claimed: true
    }).sort({ claimedAt: -1 });

    res.status(200).json({
      success: true,
      message: "Claimed rewards fetched successfully",
      data: rewards,
    });
  } catch (error) {
    next(error);
  }
};
