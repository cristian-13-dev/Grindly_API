import { Router } from "express";
import { signUp, signIn, signInOrCreate } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/sign-up", signUp);
authRouter.post("/sign-in", signIn);
authRouter.post("/sign-in-or-create", signInOrCreate);

export default authRouter;