const friendService = require('../friend.service');

// Send friend request
exports.sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params; // User to send request to
    const requesterId = req.user.id; // Current user (from auth middleware)

    // Validate that users exist and are not the same
    if (requesterId === userId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    const requester = await prisma.user.findUnique({ where: { id: requesterId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!requester || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already friends
    const existingFriendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: requesterId, friendId: userId },
          { userId: userId, friendId: requesterId }
        ]
      }
    });

    if (existingFriendship) {
      return res.status(400).json({ error: 'Already friends' });
    }

    // Check if request already sent
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId: requesterId,
        receiverId: userId,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already sent' });
    }

    // Create friend request
    const friendRequest = await friendService.sendFriendRequest(requesterId, userId);

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Get friend requests (incoming)
exports.getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await friendService.getFriendRequests(userId);

    res.json(requests);
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Respond to friend request (accept/reject)
exports.respondToFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const userId = req.user.id; // Current user

    const result = await friendService.respondToFriendRequest(requestId, userId, action);

    res.json(result);
  } catch (error) {
    console.error('Error responding to friend request:', error);
    res.status(400).json({ error: error.message || 'Bad request' });
  }
};

// Get friends list
exports.getFriends = async (req, res) => {
  try {
    const userId = req.user.id;

    const friends = await friendService.getFriends(userId);

    res.json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Remove friend
exports.removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    const result = await friendService.removeFriend(userId, friendId);

    res.json(result);
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Get followers
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const followers = await prisma.follower.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Check if current user is following each follower
    const followerList = await Promise.all(
      followers.map(async f => {
        const isFollowingBack = await prisma.follower.findFirst({
          where: {
            followerId: currentUserId,
            followingId: f.followerId
          }
        });

        return {
          ...f.follower,
          isFollowingBack: !!isFollowingBack
        };
      })
    );

    res.json(followerList);
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Get following
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const following = await prisma.follower.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Extract just the following data
    const followingList = following.map(f => f.following);
    res.json(followingList);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params; // User to follow
    const followerId = req.user.id; // Current user

    if (followerId === userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const userToFollow = await prisma.user.findUnique({ where: { id: userId } });
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const existingFollow = await prisma.follower.findFirst({
      where: {
        followerId: followerId,
        followingId: userId
      }
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Create follow relationship
    const follow = await prisma.follower.create({
      data: {
        followerId: followerId,
        followingId: userId
      }
    });

    res.status(201).json(follow);
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params; // User to unfollow
    const followerId = req.user.id; // Current user

    // Find and delete follow relationship
    const follow = await prisma.follower.findFirst({
      where: {
        followerId: followerId,
        followingId: userId
      }
    });

    if (!follow) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    await prisma.follower.delete({
      where: { id: follow.id }
    });

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Check friendship status
exports.checkFriendshipStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId === userId) {
      return res.json({ status: 'self' });
    }

    // Check if already friends
    const isFriend = await prisma.friend.findFirst({
      where: {
        userId: currentUserId,
        friendId: userId
      }
    });

    if (isFriend) {
      return res.json({ status: 'friends' });
    }

    // Check if friend request sent
    const requestSent = await prisma.friendRequest.findFirst({
      where: {
        senderId: currentUserId,
        receiverId: userId,
        status: 'PENDING'
      }
    });

    if (requestSent) {
      return res.json({ status: 'request_sent' });
    }

    // Check if friend request received
    const requestReceived = await prisma.friendRequest.findFirst({
      where: {
        senderId: userId,
        receiverId: currentUserId,
        status: 'PENDING'
      }
    });

    if (requestReceived) {
      return res.json({ status: 'request_received', requestId: requestReceived.id });
    }

    // Check if following
    const isFollowing = await prisma.follower.findFirst({
      where: {
        followerId: currentUserId,
        followingId: userId
      }
    });

    if (isFollowing) {
      return res.json({ status: 'following' });
    }

    // Check if followed by
    const isFollowedBy = await prisma.follower.findFirst({
      where: {
        followerId: userId,
        followingId: currentUserId
      }
    });

    if (isFollowedBy) {
      return res.json({ status: 'followed_by' });
    }

    res.json({ status: 'none' });
  } catch (error) {
    console.error('Error checking friendship status:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};