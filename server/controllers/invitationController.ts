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

export const getMyInvitations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const invitations = await prisma.groupInvitation.findMany({
      where: {
        invitedUserId: req.userId!,
        status: "pending",
      },
      include: {
        group: {
          include: {
            creator: { select: { id: true, name: true, email: true } },
            members: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
        invitedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(invitations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching invitations" });
  }
};

export const acceptInvitation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const invitationId = normalizeParam(req.params.invitationId);

    if (!invitationId) {
      res.status(400).json({ message: "Invalid invitationId" });
      return;
    }

    const invitation = await prisma.groupInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      res.status(404).json({ message: "Invitation not found" });
      return;
    }

    if (invitation.invitedUserId !== req.userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    if (invitation.status !== "pending") {
      res.status(400).json({ message: "Invitation already processed" });
      return;
    }

    // Create group membership
    await prisma.groupMember.create({
      data: {
        userId: req.userId!,
        groupId: invitation.groupId,
      },
    });

    // Update invitation status
    const updatedInvitation = await prisma.groupInvitation.update({
      where: { id: invitationId },
      data: { status: "accepted" },
      include: {
        invitedUser: { select: { id: true, name: true } },
        group: { select: { id: true, name: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: invitation.invitedByUserId,
        type: "invitation_accepted",
        message: `${updatedInvitation.invitedUser.name} accepted your invitation to join \"${updatedInvitation.group.name}\".`,
        groupId: updatedInvitation.groupId,
        invitationId: updatedInvitation.id,
      },
    });

    res.json({ message: "Invitation accepted, you've joined the group" });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      res.status(400).json({ message: "You're already a member of this group" });
    } else {
      res.status(500).json({ message: "Error accepting invitation" });
    }
  }
};

export const rejectInvitation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const invitationId = normalizeParam(req.params.invitationId);

    if (!invitationId) {
      res.status(400).json({ message: "Invalid invitationId" });
      return;
    }

    const invitation = await prisma.groupInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      res.status(404).json({ message: "Invitation not found" });
      return;
    }

    if (invitation.invitedUserId !== req.userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    if (invitation.status !== "pending") {
      res.status(400).json({ message: "Invitation already processed" });
      return;
    }

    // Update invitation status
    const updatedInvitation = await prisma.groupInvitation.update({
      where: { id: invitationId },
      data: { status: "rejected" },
      include: {
        invitedUser: { select: { id: true, name: true } },
        group: { select: { id: true, name: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: invitation.invitedByUserId,
        type: "invitation_rejected",
        message: `${updatedInvitation.invitedUser.name} rejected your invitation to join \"${updatedInvitation.group.name}\".`,
        groupId: updatedInvitation.groupId,
        invitationId: updatedInvitation.id,
      },
    });

    res.json({ message: "Invitation rejected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error rejecting invitation" });
  }
};

export const sendInvitation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { groupId, userId } = req.body;

    if (!groupId || !userId) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Check if user is admin/creator of the group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group || group.createdBy !== req.userId) {
      res.status(403).json({ message: "Only group creator can invite members" });
      return;
    }

    // Check if user is already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (existingMember) {
      res.status(400).json({ message: "User is already a member" });
      return;
    }

    // Create invitation
    const invitation = await prisma.groupInvitation.create({
      data: {
        groupId,
        invitedUserId: userId,
        invitedByUserId: req.userId!,
      },
      include: {
        group: { select: { id: true, name: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        type: "invitation_received",
        message: `You have been invited to join \"${invitation.group.name}\".`,
        groupId: invitation.groupId,
        invitationId: invitation.id,
      },
    });

    res.status(201).json({
      message: "Invitation sent successfully",
      invitation,
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      res.status(400).json({ message: "Invitation already exists" });
    } else {
      res.status(500).json({ message: "Error sending invitation" });
    }
  }
};
