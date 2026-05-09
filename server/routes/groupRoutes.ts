import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import {
  createGroup,
  getGroupById,
  getUserGroups,
  addMemberToGroup,
  removeMemberFromGroup,
  updateGroup,
} from "../controllers/groupController";

const router = Router();

router.post("/", verifyToken, createGroup);
router.get("/", verifyToken, getUserGroups);
router.get("/:groupId", verifyToken, getGroupById);
router.post("/member/add", verifyToken, addMemberToGroup);
router.delete("/:groupId/member/:userId", verifyToken, removeMemberFromGroup);
router.put("/:groupId", verifyToken, updateGroup);

export default router;
