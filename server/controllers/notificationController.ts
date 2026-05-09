import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const normalizeParam = (
  value: string | string[] | undefined
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

export const getMyNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
      include: {
        group: { select: { id: true, name: true } },
        invitation: { select: { id: true, status: true } },
      },
    });

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

export const markNotificationRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const notificationId = normalizeParam(req.params.notificationId);

    if (!notificationId) {
      res.status(400).json({ message: "Notification ID is required" });
      return;
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== req.userId) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error marking notification as read" });
  }
};
