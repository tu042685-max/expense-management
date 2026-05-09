import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import {
  addExpense,
  getGroupExpenses,
  updateExpense,
  deleteExpense,
  getGroupSettlement,
  payDebt,
} from "../controllers/expenseController";


const router = Router();

router.post("/", verifyToken, addExpense);
router.get("/:groupId", verifyToken, getGroupExpenses);
router.put("/:expenseId", verifyToken, updateExpense);
router.delete("/:expenseId", verifyToken, deleteExpense);
router.get("/:groupId/settlement", verifyToken, getGroupSettlement);
router.post("/:groupId/pay", verifyToken, payDebt);

export default router;

