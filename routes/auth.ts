import {Router} from "express";
import {refreshToken, signIn, signUp} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/sign-up", signUp);
authRouter.post("/sign-in", signIn);
authRouter.post('/refresh', refreshToken);

export default authRouter;