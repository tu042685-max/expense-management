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

export const createGroup = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, description, inviteUserIds } = req.body;

    if (!name) {
      res.status(400).json({ message: "Group name is required" });
      return;
    }

    // Create group
    const group = await prisma.group.create({
      data: {
        name,
        description,
        createdBy: req.userId!,
      },
    });

    // Add creator as member
    await prisma.groupMember.create({
      data: {
        userId: req.userId!,
        groupId: group.id,
      },
    });

    // Send invitations if provided
    let invitedCount = 0;
    if (Array.isArray(inviteUserIds) && inviteUserIds.length > 0) {
      for (const userId of inviteUserIds) {
        try {
          const invitation = await prisma.groupInvitation.create({
            data: {
              groupId: group.id,
              invitedUserId: userId,
              invitedByUserId: req.userId!,
            },
          });

          invitedCount += 1;

          await prisma.notification.create({
            data: {
              userId,
              type: "invitation_received",
              message: `You have been invited to join \"${group.name}\".`,
              groupId: group.id,
              invitationId: invitation.id,
            },
          });
        } catch (error) {
          // Continue if invitation creation fails (e.g., duplicate)
          console.error(`Failed to invite user ${userId}:`, error);
        }
      }
    }

    await prisma.notification.create({
      data: {
        userId: req.userId!,
        type: "group_created",
        message: `Group \"${group.name}\" created successfully${
          invitedCount > 0 ? ` and ${invitedCount} invitation(s) sent.` : "."
        }`,
        groupId: group.id,
      },
    });

    const fullGroup = await prisma.group.findUnique({
      where: { id: group.id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({
      message: "Group created successfully",
      group: fullGroup,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating group" });
  }
};

export const getGroupById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const groupId = normalizeParam(req.params.groupId);

    if (!groupId) {
      res.status(400).json({ message: "Group ID is required" });
      return;
    }

    // Check if user is member
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.userId!,
          groupId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, profileAvatar: true },
            },
          },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    res.json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching group" });
  }
};

export const getUserGroups = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: req.userId!,
          },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching groups" });
  }
};

export const addMemberToGroup = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { groupId, userId } = req.body;

    if (!groupId || !userId) {
      res.status(400).json({ message: "Missing groupId or userId" });
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

    // Check if member already exists
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (existingMember) {
      res.status(409).json({ message: "User already in group" });
      return;
    }

    // Add member
    await prisma.groupMember.create({
      data: {
        userId,
        groupId,
      },
    });

    res.status(201).json({ message: "Member added to group" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding member to group" });
  }
};

export const removeMemberFromGroup = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const groupId = normalizeParam(req.params.groupId);
    const userId = normalizeParam(req.params.userId);

    if (!groupId || !userId) {
      res.status(400).json({ message: "Missing groupId or userId" });
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

    // Remove member
    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    res.json({ message: "Member removed from group" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error removing member" });
  }
};

export const updateGroup = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const groupId = normalizeParam(req.params.groupId);
    const { name, description } = req.body;

    if (!groupId) {
      res.status(400).json({ message: "Group ID is required" });
      return;
    }

    // Check if user is creator
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (group.createdBy !== req.userId) {
      res.status(403).json({ message: "Only creator can update group" });
      return;
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
      },
    });

    res.json({ message: "Group updated", group: updatedGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating group" });
  }
};
