import Task from "../models/task.model.js";
import type { Request, Response, NextFunction } from "express";

// Custom error interface
interface CustomError extends Error {
  statusCode?: number;
}

// Extend Request interface to include userId
interface AuthenticatedRequest extends Request {
  userId?: string;
}

// 🔹 GET all tasks for current user
export const getTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const tasks = await Task.find({ user: req.userId }).populate('user', 'username email');

    res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 GET task by ID (only if belongs to current user)
export const getTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    }).populate('user', 'username email');

    if (!task) {
      const error: CustomError = new Error("Task not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Task fetched successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 POST create new task
export const createTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const taskData = {
      ...req.body,
      user: req.userId
    };

    const task = new Task(taskData);
    await task.save();

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 PATCH update task (only if belongs to current user)
export const updateTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      const error: CustomError = new Error("Task not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 DELETE task (only if belongs to current user)
export const deleteTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!task) {
      const error: CustomError = new Error("Task not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 PATCH complete task (toggle completion status)
export const completeTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!task) {
      const error: CustomError = new Error("Task not found");
      error.statusCode = 404;
      return next(error);
    }

    task.completed = !task.completed;
    if (task.completed) {
      task.completedAt = new Date();
    } else {
      task.completedAt = undefined as any;
    }
    
    await task.save();

    res.status(200).json({
      success: true,
      message: `Task ${task.completed ? 'completed' : 'uncompleted'} successfully`,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 GET tasks by frequency
export const getTasksByFrequency = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { frequency } = req.params;
    
    if (!['once', 'daily', 'weekly', 'monthly'].includes(frequency)) {
      const error: CustomError = new Error("Invalid frequency");
      error.statusCode = 400;
      return next(error);
    }

    const tasks = await Task.find({ 
      user: req.userId, 
      frequency: frequency 
    });

    res.status(200).json({
      success: true,
      message: `${frequency} tasks fetched successfully`,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 GET task statistics
export const getTaskStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const totalTasks = await Task.countDocuments({ user: req.userId });
    const completedTasks = await Task.countDocuments({ user: req.userId, completed: true });
    const pendingTasks = totalTasks - completedTasks;
    
    const totalXpEarned = await Task.aggregate([
      { $match: { user: req.userId, completed: true } },
      { $group: { _id: null, totalXp: { $sum: "$xpReward" } } }
    ]);
    
    const totalCoinsEarned = await Task.aggregate([
      { $match: { user: req.userId, completed: true } },
      { $group: { _id: null, totalCoins: { $sum: "$coinReward" } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalXpEarned: totalXpEarned[0]?.totalXp || 0,
        totalCoinsEarned: totalCoinsEarned[0]?.totalCoins || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};