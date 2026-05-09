import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  calculateSettlements,
  calculateUserBalances,
} from "../utils/settlement";
import { prisma } from "../lib/prisma";

const normalizeParam = (
  value: string | string[] | undefined
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

export const addExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { amount, description, groupId, paidBy, splitAmongUserIds } =
      req.body;

    if (
      !amount ||
      !groupId ||
      !paidBy ||
      !Array.isArray(splitAmongUserIds) ||
      splitAmongUserIds.length === 0
    ) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Check if user is member of group
    const isMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.userId!,
          groupId,
        },
      },
    });

    if (!isMember) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // Calculate share per person
    const sharePerPerson = amount / splitAmongUserIds.length;

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        amount,
        description,
        paidBy,
        groupId,
      },
    });

    // Create splits
    for (const userId of splitAmongUserIds) {
      await prisma.expenseSplit.create({
        data: {
          expenseId: expense.id,
          userId,
          shareAmount: sharePerPerson,
        },
      });
    }

    // Create notifications for all group members
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });

    // Notify everyone in the group INCLUDING the expense creator
    // Include who created the expense in the message.
    const paidByUser = await prisma.user.findUnique({
      where: { id: paidBy },
      select: { name: true },
    });

    const paidByName = paidByUser?.name ?? "Someone";
    const trimmedDescription = description?.trim();
    const descriptionPart = trimmedDescription ? `: ${trimmedDescription}` : ".";

    for (const member of members) {
      await prisma.notification.create({
        data: {
          userId: member.userId,
          type: "expense_added",
          message: `${paidByName} added a new expense to your group${descriptionPart}`,
          groupId,
        },
      });
    }



    res.status(201).json({

      message: "Expense added successfully",
      expense: {
        id: expense.id,
        amount: expense.amount,
        description: expense.description,
        paidBy: expense.paidBy,
        groupId: expense.groupId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding expense" });
  }
};

export const getGroupExpenses = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const groupId = normalizeParam(req.params.groupId);

    if (!groupId) {
      res.status(400).json({ message: "Invalid groupId" });
      return;
    }

    // Check if user is member of group
    const isMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.userId!,
          groupId,
        },
      },
    });

    if (!isMember) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: {
        paidByUser: { select: { id: true, name: true, email: true } },
        splits: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching expenses" });
  }
};

export const updateExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const expenseId = normalizeParam(req.params.expenseId);
    const { amount, description, paidBy, splitAmongUserIds } = req.body;

    if (!expenseId) {
      res.status(400).json({ message: "Invalid expenseId" });
      return;
    }

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    // Check if user is member of group
    const isMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.userId!,
          groupId: expense.groupId,
        },
      },
    });

    if (!isMember) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // Update expense
    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...(amount && { amount }),
        ...(description && { description }),
        ...(paidBy && { paidBy }),
      },
    });

    // Update splits if provided
    if (splitAmongUserIds) {
      // Delete old splits
      await prisma.expenseSplit.deleteMany({
        where: { expenseId },
      });

      // Create new splits
      const sharePerPerson =
        (amount || expense.amount) / splitAmongUserIds.length;
      for (const userId of splitAmongUserIds) {
        await prisma.expenseSplit.create({
          data: {
            expenseId,
            userId,
            shareAmount: sharePerPerson,
          },
        });
      }
    }

    res.json({ message: "Expense updated", expense: updatedExpense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating expense" });
  }
};

export const deleteExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const expenseId = normalizeParam(req.params.expenseId);

    if (!expenseId) {
      res.status(400).json({ message: "Invalid expenseId" });
      return;
    }

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    // Check if user is member of group
    const isMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.userId!,
          groupId: expense.groupId,
        },
      },
    });

    if (!isMember) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // Delete expense (splits will cascade delete)
    await prisma.expense.delete({
      where: { id: expenseId },
    });

    res.json({ message: "Expense deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting expense" });
  }
};

export const payDebt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const groupId = normalizeParam(req.params.groupId);
    const { toUserId, amount } = req.body;

    if (!groupId) {
      res.status(400).json({ message: "Invalid groupId" });
      return;
    }

    if (!toUserId || typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ message: "Missing or invalid fields" });
      return;
    }

    // Check if payer is member of group
    const payerMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.userId!,
          groupId,
        },
      },
    });

    if (!payerMember) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // Check if receiver is member of group
    const receiverMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: toUserId,
          groupId,
        },
      },
    });

    if (!receiverMember) {
      res.status(400).json({ message: "Receiver is not in this group" });
      return;
    }

    // Create debt payment record (not an expense)
    const debtPayment = await prisma.debtPayment.create({
      data: {
        amount,
        paidBy: req.userId!,
        paidTo: toUserId,
        groupId,
      },
    });

    // Notifications for all group members
    const [payerUser, receiverUser, members] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.userId! },
        select: { name: true },
      }),
      prisma.user.findUnique({
        where: { id: toUserId },
        select: { name: true },
      }),
      prisma.groupMember.findMany({
        where: { groupId },
        select: { userId: true },
      }),
    ]);

    const payerName = payerUser?.name ?? "Someone";
    const receiverName = receiverUser?.name ?? "a member";

    await Promise.all(
      members.map((member) =>
        prisma.notification.create({
          data: {
            userId: member.userId,
            type: "debt_payment_completed",
            message: `${payerName} paid ₹${amount.toFixed(2)} to ${receiverName}.`,
            groupId,
          },
        })
      )
    );

    res.status(201).json({
      message: "Payment completed",
      payment: {
        id: debtPayment.id,
        amount: debtPayment.amount,
        paidBy: debtPayment.paidBy,
        paidTo: debtPayment.paidTo,
        groupId: debtPayment.groupId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error completing payment" });
  }
};

export const getGroupSettlement = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const groupId = normalizeParam(req.params.groupId);

    if (!groupId) {
      res.status(400).json({ message: "Invalid groupId" });
      return;
    }

    // Check if user is member of group
    const isMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.userId!,
          groupId,
        },
      },
    });


    if (!isMember) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // Get all expenses for group
    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: {
        splits: true,
      },
    });

    // Get all debt payments for group
    const debtPayments = await prisma.debtPayment.findMany({
      where: { groupId },
    });

    // Calculate balances including debt payments
    const balances = calculateUserBalances(expenses, debtPayments);

    // Calculate settlements
    const settlements = calculateSettlements(balances);

    // Enrich settlements with user info
    const enrichedSettlements = await Promise.all(
      settlements.map(async (settlement) => ({
        ...settlement,
        fromUser: await prisma.user.findUnique({
          where: { id: settlement.from },
          select: { name: true, email: true },
        }),
        toUser: await prisma.user.findUnique({
          where: { id: settlement.to },
          select: { name: true, email: true },
        }),
      }))
    );

    res.json({
      balances,
      settlements: enrichedSettlements,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error calculating settlement" });
  }
};
