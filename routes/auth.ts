import {Router} from "express";
import {changePassword, refreshToken, signIn, signOut, signUp} from "../controllers/auth.controller.js";
import authorize from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/sign-up", signUp);
authRouter.post("/sign-in", signIn);
authRouter.post("/sign-out", signOut);
authRouter.post('/refresh', refreshToken);
authRouter.put('/change-password', authorize, changePassword);

export default authRouter;