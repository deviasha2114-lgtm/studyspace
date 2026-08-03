const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user profile by userId
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bio, classLevel, board, competitiveExams, studyGoals,
            weeklyStudyHours, monthlyStudyHours, yearlyStudyHours,
            totalStoreHours, chaptersCompleted, subjectsProcess } = req.body;

    // Update profile
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        bio,
        classLevel,
        board,
        competitiveExams: Array.isArray(competitiveExams) ? competitiveExams : [],
        studyGoals,
        weeklyStudyHours,
        monthlyStudyHours,
        yearlyStudyHours,
        totalStoreHours,
        chaptersCompleted,
        subjectsProcess: typeof subjectsProcess === 'object' ? subjectsProcess : {}
      },
      create: {
        userId,
        bio,
        classLevel,
        board,
        competitiveExams: Array.isArray(competitiveExams) ? competitiveExams : [],
        studyGoals,
        weeklyStudyHours,
        monthlyStudyHours,
        yearlyStudyHours,
        totalStoreHours,
        chaptersCompleted,
        subjectsProcess: typeof subjectsProcess === 'object' ? subjectsProcess : {}
      }
    });

    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user by ID (public profile)
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        profile: {
          select: {
            bio: true,
            classLevel: true,
            board: true,
            competitiveExams: true,
            studyGoals: true,
            weeklyStudyHours: true,
            monthlyStudyHours: true,
            yearlyStudyHours: true,
            totalStoreHours: true,
            chaptersCompleted: true,
            subjectsProcess: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user's profile (requires auth)
exports.getMyProfile = async (req, res) => {
  try {
    // Assuming req.user is set by auth middleware
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};