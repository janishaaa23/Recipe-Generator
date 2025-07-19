import express from "express"

import { signUp,login,logout,me } from "../controllers/user.controller.js"
import VerifyToken from "../middlewares/auth.middleware.js"
const router = express.Router();

router.post("/signup",signUp)
router.post("/login",login)
router.post("/logout",VerifyToken,logout);
router.get("/me",VerifyToken,me)

export default router;