import { Router } from "express";
import {
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  sendInvitation,
} from "../controllers/invitationController";
import { authenticate } from "../middleware/auth";

const router = Router();

// All invitation routes require authentication
router.use(authenticate);

// Get user's invitations
router.get("/", getMyInvitations);

// Send invitation
router.post("/", sendInvitation);

// Accept invitation
router.post("/:invitationId/accept", acceptInvitation);

// Reject invitation
router.post("/:invitationId/reject", rejectInvitation);

export default router;