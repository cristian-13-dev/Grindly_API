import { Router } from "express";
import authorize from "../middleware/auth.middleware.js";
import {
  getUsers,
  getUser,
  getCurrentUser,
  updateUser,
  getUserGamification,
  deleteUser,
} from "../controllers/user.controller.js";

const userRouter = Router();

// Public
userRouter.get("/", getUsers);

// Protected “current user” routes — must come before `/:id`
userRouter.get("/me", authorize, getCurrentUser);
userRouter.get("/me/gamification", authorize, getUserGamification);
userRouter.patch("/me", authorize, updateUser);
userRouter.delete("/me", authorize, deleteUser);

// Protected “by ID”
userRouter.get("/:id", authorize, getUser);

// Placeholders for create/update/delete (implement as needed)
userRouter.post("/", (req, res) => res.send({ message: "CREATE new user" }));
userRouter.put("/:id", (req, res) => res.send({ message: "UPDATE user" }));

export default userRouter;
