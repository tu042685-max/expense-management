import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import {
  getMyNotifications,
  markNotificationRead,
} from "../controllers/notificationController";

const router = Router();

router.get("/", verifyToken, getMyNotifications);
router.post("/:notificationId/read", verifyToken, markNotificationRead);

export default router;
