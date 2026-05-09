import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import {
  register,
  login,
  getProfile,
  updateProfile,
  searchUsers,
} from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.get("/search", verifyToken, searchUsers);

export default router;
