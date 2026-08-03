import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudyRoomDto } from './dto/create-study-room.dto';
import { UpdateStudyRoomDto } from './dto/update-study-room.dto';
import { JoinStudyRoomDto } from './dto/join-study-room.dto';
import * as crypto from 'crypto';

@Injectable()
export class StudyRoomsService {
  constructor(private prisma: PrismaService) {}

  async create(createStudyRoomDto: CreateStudyRoomDto, userId: string) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate password hash if provided
    let passwordHash = null;
    if (createStudyRoomDto.password) {
      passwordHash = crypto
        .createHash('sha256')
        .update(createStudyRoomDto.password)
        .digest('hex');
    }

    return this.prisma.studyRoom.create({
      data: {
        name: createStudyRoomDto.name,
        description: createStudyRoomDto.description,
        type: createStudyRoomDto.type,
        status: createStudyRoomDto.status || 'ACTIVE',
        password: passwordHash,
        maxCapacity: createStudyRoomDto.maxCapacity || 50,
        isPermanent: createStudyRoomDto.isPermanent || false,
        expiresAt: createStudyRoomDto.expiresAt,
        createdBy: { connect: { id: userId } },
        community: createStudyRoomDto.communityId
          ? { connect: { id: createStudyRoomDto.communityId } }
          : undefined,
      },
      include: {
        createdBy: true,
        community: true,
      },
    });
  }

  async findAll(query: any, userId: string) {
    const {
      type,
      status,
      search,
      page = 1,
      limit = 20,
      myRooms = false,
      communityId
    } = query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit as string, 10);

    const where: any = {};

    // Filter by type
    if (type) where.type = type;

    // Filter by status
    if (status) where.status = status;

    // Filter by community
    if (communityId) where.communityId = communityId;

    // Search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // If myRooms is true, show rooms created by user or where user has access
    if (myRooms) {
      where.OR = [
        { createdById: userId },
        { accessList: { some: { userId } } },
      ];
    }

    // For private rooms, check access
    // Note: This is simplified - in practice, you'd want to handle this in the query
    // For now, we'll filter out private rooms the user doesn't have access to
    // and handle access checking in the findOne method

    const [studyRooms, total] = await this.prisma.$transaction([
      this.prisma.studyRoom.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, avatarUrl: true }
          },
          community: {
            select: { id: true, name: true, slug: true }
          },
          _count: {
            select: { sessions: true, messages: true }
          }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.studyRoom.count({ where }),
    ]);

    // Filter out private rooms user doesn't have access to (simplified)
    const accessibleRooms = studyRooms.filter(room => {
      if (room.type !== 'PRIVATE') return true;
      // Check if user is creator or has access
      return room.createdById === userId ||
             room.accessList.some(access => access.userId === userId);
    });

    return {
      data: accessibleRooms,
      meta: {
        page: parseInt(page as string, 10),
        limit: take,
        total: accessibleRooms.length,
        totalPages: Math.ceil(accessibleRooms.length / take),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const studyRoom = await this.prisma.studyRoom.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, avatarUrl: true }
        },
        community: {
          select: { id: true, name: true, slug: true }
        },
        settings: true,
        accessList: {
          select: {
            user: {
              select: { id: true, name: true, avatarUrl: true }
            },
            grantedAt: true,
            grantedBy: {
              select: { id: true, name: true }
            }
          }
        },
        _count: {
          select: { sessions: true, messages: true }
        }
      },
    });

    if (!studyRoom) {
      throw new NotFoundException('Study room not found');
    }

    // Check access permissions
    const hasAccess =
      studyRoom.createdById === userId || // Creator has access
      studyRoom.accessList.some(access => access.userId === userId) || // Explicit access
      studyRoom.type === 'OPEN' || // Open rooms accessible to all
      (studyRoom.type === 'SUBJECT' && studyRoom.communityId &&
       // Check if user is member of the community (would need community member check)
       true); // Simplified - in real app, check community membership
    // For BATCH and FOCUS rooms, similar logic would apply based on user's batch/enrollment

    if (!hasAccess && studyRoom.type !== 'OPEN') {
      throw new ForbiddenException('Access denied to this study room');
    }

    // For private rooms, password would be checked during join, not during fetch
    // This is just to see room details

    return studyRoom;
  }

  async update(id: string, updateStudyRoomDto: UpdateStudyRoomDto, userId: string) {
    const studyRoom = await this.prisma.studyRoom.findUnique({ where: { id } });

    if (!studyRoom) {
      throw new NotFoundException('Study room not found');
    }

    // Only creator can update
    if (studyRoom.createdById !== userId) {
      throw new ForbiddenException('Only the room creator can update this room');
    }

    // Handle password update
    let data: any = { ...updateStudyRoomDto };
    if (updateStudyRoomDto.password) {
      data.password = crypto
        .createHash('sha256')
        .update(updateStudyRoomDto.password)
        .digest('hex');
    } else if (updateStudyRoomDto.password === null) {
      data.password = null; // Allow removing password
    }

    // Handle community update
    if (updateStudyRoomDto.communityId !== undefined) {
      data.community = updateStudyRoomDto.communityId
        ? { connect: { id: updateStudyRoomDto.communityId } }
        : { disconnect: true };
      delete data.communityId;
    }

    return this.prisma.studyRoom.update({
      where: { id },
      data,
      include: {
        createdBy: true,
        community: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const studyRoom = await this.prisma.studyRoom.findUnique({ where: { id } });

    if (!studyRoom) {
      throw new NotFoundException('Study room not found');
    }

    // Only creator can delete
    if (studyRoom.createdById !== userId) {
      throw new ForbiddenException('Only the room creator can delete this room');
    }

    // Delete related records first (due to foreign key constraints)
    await this.prisma.studyRoomSession.deleteMany({ where: { studyRoomId: id } });
    await this.prisma.studyRoomMessage.deleteMany({ where: { studyRoomId: id } });
    await this.prisma.studyRoomAccess.deleteMany({ where: { studyRoomId: id } });
    await this.prisma.studyRoomSettings.deleteMany({ where: { studyRoomId: id } });

    return this.prisma.studyRoom.delete({ where: { id } });
  }

  async join(id: string, joinStudyRoomDto: JoinStudyRoomDto, userId: string) {
    const studyRoom = await this.prisma.studyRoom.findUnique({
      where: { id },
      include: { accessList: true }
    });

    if (!studyRoom) {
      throw new NotFoundException('Study room not found');
    }

    // Check if room is active
    if (studyRoom.status !== 'ACTIVE') {
      throw new BadRequestException('Study room is not active');
    }

    // Check capacity
    const currentSessionCount = await this.prisma.studyRoomSession.count({
      where: { studyRoomId: id, leftAt: null }
    });

    if (currentSessionCount >= studyRoom.maxCapacity) {
      throw new BadRequestException('Study room is at full capacity');
    }

    // Check access permissions
    let hasAccess = false;

    if (studyRoom.createdById === userId) {
      hasAccess = true; // Creator always has access
    } else if (studyRoom.type === 'OPEN') {
      hasAccess = true; // Open rooms
    } else if (studyRoom.type === 'SUBJECT') {
      // In real app, check if user is member of the community
      hasAccess = true; // Simplified
    } else if (studyRoom.type === 'BATCH') {
      // Check if user is in the batch (would need batch enrollment check)
      hasAccess = true; // Simplified
    } else if (studyRoom.type === 'FOCUS') {
      hasAccess = true; // Focus rooms typically open but chat disabled
    } else if (studyRoom.type === 'PRIVATE') {
      // Check explicit access or password
      hasAccess = studyRoom.accessList.some(access => access.userId === userId);

      // If no explicit access, check password
      if (!hasAccess && joinStudyRoomDto.password) {
        const passwordHash = crypto
          .createHash('sha256')
          .update(joinStudyRoomDto.password)
          .digest('hex');
        hasAccess = studyRoom.password === passwordHash;
      }
    }

    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this study room');
    }

    // Check if user already has an active session in this room
    const existingSession = await this.prisma.studyRoomSession.findFirst({
      where: {
        studyRoomId: id,
        userId,
        leftAt: null
      }
    });

    if (existingSession) {
      throw new BadRequestException('You already have an active session in this room');
    }

    // Create session
    const session = await this.prisma.studyRoomSession.create({
      data: {
        userId: userId,
        studyRoomId: id,
        goal: joinStudyRoomDto.goal,
        isFocusMode: joinStudyRoomDto.isFocusMode || false,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true }
        },
        studyRoom: {
          select: { id: true, name: true }
        }
      }
    });

    // Update current users count
    await this.prisma.studyRoom.update({
      where: { id },
      data: { currentUsers: { increment: 1 } }
    });

    return session;
  }

  async leave(id: string, userId: string) {
    const session = await this.prisma.studyRoomSession.findFirst({
      where: {
        studyRoomId: id,
        userId,
        leftAt: null
      }
    });

    if (!session) {
      throw new NotFoundException('No active session found for this user in the room');
    }

    // Update session with leave time and calculate duration
    const leftAt = new Date();
    const duration = Math.floor((leftAt.getTime() - session.joinedAt.getTime()) / 1000);

    const updatedSession = await this.prisma.studyRoomSession.update({
      where: { id: session.id },
      data: {
        leftAt,
        duration,
        goalMet: false // Would be set based on user action in UI
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true }
        },
        studyRoom: {
          select: { id: true, name: true }
        }
      }
    });

    // Update current users count
    await this.prisma.studyRoom.update({
      where: { id },
      data: { currentUsers: { decrement: 1 } }
    });

    return updatedSession;
  }

  async sendMessage(id: string, content: string, userId: string) {
    // Verify user has access to the room
    const studyRoom = await this.prisma.studyRoom.findUnique({
      where: { id },
      include: { accessList: true }
    });

    if (!studyRoom) {
      throw new NotFoundException('Study room not found');
    }

    const hasAccess =
      studyRoom.createdById === userId ||
      studyRoom.accessList.some(access => access.userId === userId) ||
      studyRoom.type === 'OPEN' ||
      (studyRoom.type === 'SUBJECT' && true) || // Simplified
      (studyRoom.type === 'BATCH' && true) ||     // Simplified
      (studyRoom.type === 'FOCUS' && studyRoom.settings?.isChatEnabled !== false) || // Only if chat enabled
      (studyRoom.type === 'PRIVATE' && studyRoom.accessList.some(access => access.userId === userId));

    if (!hasAccess) {
      throw new ForbiddenException('Access denied to send messages in this study room');
    }

    // For FOCUS rooms, check if chat is enabled
    if (studyRoom.type === 'FOCUS' && studyRoom.settings?.isChatEnabled === false) {
      throw new ForbiddenException('Chat is disabled in this focus room');
    }

    const message = await this.prisma.studyRoomMessage.create({
      data: {
        content,
        senderId: userId,
        studyRoomId: id
      },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    });

    return message;
  }

  async getMessages(id: string, limit: number = 50, userId: string) {
    // Verify access (same as sendMessage)
    const studyRoom = await this.prisma.studyRoom.findUnique({
      where: { id },
      include: { accessList: true }
    });

    if (!studyRoom) {
      throw new NotFoundException('Study room not found');
    }

    const hasAccess =
      studyRoom.createdById === userId ||
      studyRoom.accessList.some(access => access.userId === userId) ||
      studyRoom.type === 'OPEN' ||
      (studyRoom.type === 'SUBJECT' && true) || // Simplified
      (studyRoom.type === 'BATCH' && true) ||     // Simplified
      (studyRoom.type === 'FOCUS' && studyRoom.settings?.isChatEnabled !== false) ||
      (studyRoom.type === 'PRIVATE' && studyRoom.accessList.some(access => access.userId === userId));

    if (!hasAccess) {
      throw new ForbiddenException('Access denied to view messages in this study room');
    }

    const messages = await this.prisma.studyRoomMessage.findMany({
      where: { studyRoomId: id },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return messages.reverse(); // Return oldest first for chat display
  }

  async updateSettings(id: string, settings: any, userId: string) {
    const studyRoom = await this.prisma.studyRoom.findUnique({ where: { id } });

    if (!studyRoom) {
      throw new NotFoundException('Study room not found');
    }

    // Only creator can update settings
    if (studyRoom.createdById !== userId) {
      throw new ForbiddenException('Only the room creator can update settings');
    }

    // Upsert settings
    const studyRoomSettings = await this.prisma.studyRoomSettings.upsert({
      where: { studyRoomId: id },
      update: settings,
      create: {
        ...settings,
        studyRoomId: id
      }
    });

    return studyRoomSettings;
  }

  async grantAccess(id: string, userId: string, grantedById: string) {
    const studyRoom = await this.prisma.studyRoom.findUnique({ where: { id } });

    if (!studyRoom) {
      throw new NotFoundException('Study room not found');
    }

    // Only creator can grant access
    if (studyRoom.createdById !== grantedById) {
      throw new ForbiddenException('Only the room creator can grant access');
    }

    // Verify user to grant access to exists
    const userToGrant = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userToGrant) {
      throw new NotFoundException('User not found');
    }

    // Check if access already exists
    const existingAccess = await this.prisma.studyRoomAccess.findFirst({
      where: { studyRoomId: id, userId }
    });

    if (existingAccess) {
      throw new BadRequestException('User already has access to this room');
    }

    // Only PRIVATE rooms can have explicit access granted
    if (studyRoom.type !== 'PRIVATE') {
      throw new BadRequestException('Access can only be granted to private rooms');
    }

    const access = await this.prisma.studyRoomAccess.create({
      data: {
        studyRoomId: id,
        userId,
        grantedById
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true }
        },
        grantedBy: {
          select: { id: true, name: true }
        }
      }
    });

    return access;
  }

  async revokeAccess(id: string, userIdToRevoke: string, userId: string) {
    const studyRoom = await this.prisma.studyRoom.findUnique({ where: { id } });

    if (!studyRoom) {
      throw new NotFoundException('Study room not found');
    }

    // Only creator can revoke access
    if (studyRoom.createdById !== userId) {
      throw new ForbiddenException('Only the room creator can revoke access');
    }

    // Only PRIVATE rooms can have access revoked
    if (studyRoom.type !== 'PRIVATE') {
      throw new BadRequestException('Access can only be revoked from private rooms');
    }

    const access = await this.prisma.studyRoomAccess.findFirst({
      where: { studyRoomId: id, userId: userIdToRevoke }
    });

    if (!access) {
      throw new NotFoundException('Access record not found');
    }

    return this.prisma.studyRoomAccess.delete({ where: { id: access.id } });
  }
}