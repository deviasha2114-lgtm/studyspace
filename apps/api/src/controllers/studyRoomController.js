const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new study room
exports.createStudyRoom = async (req, res) => {
  try {
    const { title, description, type, scheduledAt, duration, maxParticipants, isPublic, password } = req.body;
    const hostId = req.user.id;

    // Validate required fields
    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }

    // Parse scheduledAt if provided
    let parsedScheduledAt = null;
    if (scheduledAt) {
      parsedScheduledAt = new Date(scheduledAt);
      if (isNaN(parsedScheduledAt.getTime())) {
        return res.status(400).json({ error: 'Invalid scheduledAt date' });
      }
    }

    // Create study room
    const studyRoom = await prisma.studyRoom.create({
      data: {
        title,
        description,
        type,
        scheduledAt: parsedScheduledAt,
        duration: duration || 60, // default 60 minutes
        maxParticipants: maxParticipants || 50,
        hostId,
        isPublic: isPublic !== undefined ? isPublic : true,
        password: password || null
      }
    });

    // Create default settings for the study room
    await prisma.studyRoomSettings.create({
      data: {
        studyRoomId: studyRoom.id
      }
    });

    // Add host as participant
    await prisma.studyRoomParticipant.create({
      data: {
        userId: hostId,
        studyRoomId: studyRoom.id,
        joinedAt: new Date()
      }
    });

    res.status(201).json(studyRoom);
  } catch (error) {
    console.error('Error creating study room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all study rooms (with filtering and pagination)
exports.getStudyRooms = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    // Only show public rooms or rooms the user has access to
    const userId = req.user.id;

    const [studyRooms, totalCount] = await prisma.$transaction([
      prisma.studyRoom.findMany({
        where: {
          ...where,
          OR: [
            { isPublic: true },
            {
              studyRoomAccess: {
                some: {
                  userId
                }
              }
            },
            {
              hostId: userId
            }
          ]
        },
        include: {
          host: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          },
          _count: {
            select: {
              studyRoomParticipant: true
            }
          }
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.studyRoom.count({
        where: {
          ...where,
          OR: [
            { isPublic: true },
            {
              studyRoomAccess: {
                some: {
                  userId
                }
              }
            },
            {
              hostId: userId
            }
          ]
        }
      })
    ]);

    res.json({
      studyRooms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching study rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific study room by ID
exports.getStudyRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const studyRoom = await prisma.studyRoom.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        settings: true,
        _count: {
          select: {
            studyRoomParticipant: true
          }
        },
        studyRoomParticipant: {
          where: { userId },
          take: 1
        }
      }
    });

    if (!studyRoom) {
      return res.status(404).json({ error: 'Study room not found' });
    }

    // Check if user has access to private room
    if (!studyRoom.isPublic) {
      const hasAccess = await prisma.studyRoomAccess.findFirst({
        where: {
          studyRoomId: id,
          userId
        }
      });

      if (!hasAccess && studyRoom.hostId !== userId) {
        return res.status(403).json({ error: 'Access denied to this study room' });
      }
    }

    res.json(studyRoom);
  } catch (error) {
    console.error('Error fetching study room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Join a study room
exports.joinStudyRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { password } = req.body;

    const studyRoom = await prisma.studyRoom.findUnique({
      where: { id }
    });

    if (!studyRoom) {
      return res.status(404).json({ error: 'Study room not found' });
    }

    // Check if user is already a participant
    const existingParticipant = await prisma.studyRoomParticipant.findFirst({
      where: {
        studyRoomId: id,
        userId
      }
    });

    if (existingParticipant) {
      return res.status(400).json({ error: 'Already joined this study room' });
    }

    // Check if room is full
    const participantCount = await prisma.studyRoomParticipant.count({
      where: { studyRoomId: id }
    });

    if (participantCount >= studyRoom.maxParticipants) {
      return res.status(400).json({ error: 'Study room is full' });
    }

    // Check password for private rooms
    if (!studyRoom.isPublic && studyRoom.password) {
      if (!password || password !== studyRoom.password) {
        return res.status(403).json({ error: 'Invalid password' });
      }
    }

    // Grant access if it's a private room and user doesn't have access yet
    if (!studyRoom.isPublic) {
      const existingAccess = await prisma.studyRoomAccess.findFirst({
        where: {
          studyRoomId: id,
          userId
        }
      });

      if (!existingAccess) {
        await prisma.studyRoomAccess.create({
          data: {
            studyRoomId: id,
            userId,
            grantedById: studyRoom.hostId
          }
        });
      }
    }

    // Add participant
    const participant = await prisma.studyRoomParticipant.create({
      data: {
        studyRoomId: id,
        userId,
        joinedAt: new Date()
      }
    });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`study-room-${id}`).emit('user-joined', {
        userId,
        studyRoomId: id,
        participantCount: participantCount + 1
      });
    }

    res.status(201).json({ message: 'Joined study room successfully', participant });
  } catch (error) {
    console.error('Error joining study room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Leave a study room
exports.leaveStudyRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const participant = await prisma.studyRoomParticipant.findFirst({
      where: {
        studyRoomId: id,
        userId
      }
    });

    if (!participant) {
      return res.status(400).json({ error: 'Not a participant in this study room' });
    }

    // Remove participant
    await prisma.studyRoomParticipant.delete({
      where: { id: participant.id }
    });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      const participantCount = await prisma.studyRoomParticipant.count({
        where: { studyRoomId: id }
      });

      io.to(`study-room-${id}`).emit('user-left', {
        userId,
        studyRoomId: id,
        participantCount
      });
    }

    res.json({ message: 'Left study room successfully' });
  } catch (error) {
    console.error('Error leaving study room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// End a study room (host only)
exports.endStudyRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const studyRoom = await prisma.studyRoom.findUnique({
      where: { id }
    });

    if (!studyRoom) {
      return res.status(404).json({ error: 'Study room not found' });
    }

    // Check if user is the host
    if (studyRoom.hostId !== userId) {
      return res.status(403).json({ error: 'Only the host can end the study room' });
    }

    // Update study room to ended
    const updatedStudyRoom = await prisma.studyRoom.update({
      where: { id },
      data: {
        endedAt: new Date()
      }
    });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`study-room-${id}`).emit('room-ended', {
        studyRoomId: id,
        endedAt: new Date()
      });
    }

    res.json({ message: 'Study room ended successfully', studyRoom: updatedStudyRoom });
  } catch (error) {
    console.error('Error ending study room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get study room messages
exports.getStudyRoomMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;
    const userId = req.user.id;

    // Check if user has access to the study room
    const studyRoom = await prisma.studyRoom.findUnique({
      where: { id }
    });

    if (!studyRoom) {
      return res.status(404).json({ error: 'Study room not found' });
    }

    // Check access for private rooms
    if (!studyRoom.isPublic) {
      const hasAccess = await prisma.studyRoomAccess.findFirst({
        where: {
          studyRoomId: id,
          userId
        }
      });

      if (!hasAccess && studyRoom.hostId !== userId) {
        return res.status(403).json({ error: 'Access denied to this study room' });
      }
    }

    const messages = await prisma.studyRoomMessage.findMany({
      where: { studyRoomId: id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      },
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(messages.reverse()); // Return in chronological order
  } catch (error) {
    console.error('Error fetching study room messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send a message in study room
exports.sendStudyRoomMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Check if user has access to the study room
    const studyRoom = await prisma.studyRoom.findUnique({
      where: { id }
    });

    if (!studyRoom) {
      return res.status(404).json({ error: 'Study room not found' });
    }

    // Check access for private rooms
    if (!studyRoom.isPublic) {
      const hasAccess = await prisma.studyRoomAccess.findFirst({
        where: {
          studyRoomId: id,
          userId
        }
      });

      if (!hasAccess && studyRoom.hostId !== userId) {
        return res.status(403).json({ error: 'Access denied to this study room' });
      }
    }

    // Check if user is a participant
    const isParticipant = await prisma.studyRoomParticipant.findFirst({
      where: {
        studyRoomId: id,
        userId
      }
    });

    if (!isParticipant) {
      return res.status(403).json({ error: 'Must be a participant to send messages' });
    }

    // Create message
    const message = await prisma.studyRoomMessage.create({
      data: {
        content: content.trim(),
        studyRoomId: id,
        senderId: userId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });

    // Emit socket event for real-time message
    const io = req.app.get('io');
    if (io) {
      io.to(`study-room-${id}`).emit('new-message', message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending study room message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update study room settings
exports.updateStudyRoomSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { pomodoroWorkInt, pomodoroBreakInt, ambientSound, isChatEnabled, isAudioEnabled, isVideoEnabled, maxVideoUsers } = req.body;
    const userId = req.user.id;

    const studyRoom = await prisma.studyRoom.findUnique({
      where: { id }
    });

    if (!studyRoom) {
      return res.status(404).json({ error: 'Study room not found' });
    }

    // Check if user is the host
    if (studyRoom.hostId !== userId) {
      return res.status(403).json({ error: 'Only the host can update study room settings' });
    }

    // Update or create settings
    const settings = await prisma.studyRoomSettings.upsert({
      where: { studyRoomId: id },
      update: {
        pomodoroWorkInt,
        pomodoroBreakInt,
        ambientSound,
        isChatEnabled,
        isAudioEnabled,
        isVideoEnabled,
        maxVideoUsers
      },
      create: {
        studyRoomId: id,
        pomodoroWorkInt: pomodoroWorkInt || 25,
        pomodoroBreakInt: pomodoroBreakInt || 5,
        ambientSound,
        isChatEnabled: isChatEnabled !== undefined ? isChatEnabled : true,
        isAudioEnabled: isAudioEnabled !== undefined ? isAudioEnabled : true,
        isVideoEnabled: isVideoEnabled !== undefined ? isVideoEnabled : true,
        maxVideoUsers: maxVideoUsers || 10
      }
    });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`study-room-${id}`).emit('settings-updated', settings);
    }

    res.json({ message: 'Study room settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating study room settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = exports;