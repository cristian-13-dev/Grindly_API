import UserStatEvent from "../models/eventLog.model.js";
import type { Request, Response, NextFunction } from "express";

// Custom error interface
interface CustomError extends Error {
  statusCode?: number;
}

// Extend Request interface to include userId
interface AuthenticatedRequest extends Request {
  userId?: string;
}

// 🔹 GET all events for current user
export const getEvents = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const events = await UserStatEvent.find({ user: req.userId })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 GET events by metric (xp or coins)
export const getEventsByMetric = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { metric } = req.params;
    
    if (!['xp', 'coins'].includes(metric)) {
      const error: CustomError = new Error("Invalid metric");
      error.statusCode = 400;
      return next(error);
    }

    const events = await UserStatEvent.find({ 
      user: req.userId, 
      metric: metric 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: `${metric} events fetched successfully`,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 POST create new event
export const createEvent = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const eventData = {
      ...req.body,
      user: req.userId
    };

    const event = new UserStatEvent(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 GET event statistics
export const getEventStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const totalXpGained = await UserStatEvent.aggregate([
      { $match: { user: req.userId, metric: 'xp', type: 'gain' } },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);
    
    const totalXpSpent = await UserStatEvent.aggregate([
      { $match: { user: req.userId, metric: 'xp', type: 'spend' } },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);
    
    const totalCoinsGained = await UserStatEvent.aggregate([
      { $match: { user: req.userId, metric: 'coins', type: 'gain' } },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);
    
    const totalCoinsSpent = await UserStatEvent.aggregate([
      { $match: { user: req.userId, metric: 'coins', type: 'spend' } },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        xp: {
          gained: totalXpGained[0]?.total || 0,
          spent: totalXpSpent[0]?.total || 0,
          net: (totalXpGained[0]?.total || 0) - (totalXpSpent[0]?.total || 0)
        },
        coins: {
          gained: totalCoinsGained[0]?.total || 0,
          spent: totalCoinsSpent[0]?.total || 0,
          net: (totalCoinsGained[0]?.total || 0) - (totalCoinsSpent[0]?.total || 0)
        }
      },
    });
  } catch (error) {
    next(error);
  }
};
