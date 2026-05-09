import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

const router = Router();

router.get(
  "/notification/unread-count",
  verifyToken,
  async (req: AuthRequest, res) => {
    try {
      const count = await prisma.notification.count({
        where: { userId: req.userId!, isRead: false },
      });
      res.json({ count });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Error fetching unread notifications" });
    }
  }
);

router.get(
  "/invitation/pending-count",
  verifyToken,
  async (req: AuthRequest, res) => {
    try {
      const count = await prisma.groupInvitation.count({
        where: {
          invitedUserId: req.userId!,
          status: "pending",
        },
      });
      res.json({ count });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Error fetching pending invitations" });
    }
  }
);

export default router;


