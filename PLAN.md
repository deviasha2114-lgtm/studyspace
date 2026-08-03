# Implementation Plan: Instagram-Style Chat System (Sprint 13)

## Overview
This plan outlines the implementation of the Instagram-style chat system as requested in Sprint 13, including:
- Private Direct Messages (DMs)
- Friend Requests
- Group Chat
- Message Reactions
- Image/PDF Sharing
- Voice Messages

We will build upon the existing codebase, leveraging the Community and Message models for chat functionality, and extending them as needed.

## Current State
- The Message model currently has: id, content, senderId, communityId, createdAt, and relations.
- The Community model represents groups/communities and can be repurposed for private chats.
- The User model has relations to messages and communities.
- Socket.IO is set up for real-time communication in the chat service.

## Proceeding.

## Implementation Steps

### 1. Database Schema Updates
#### 1.1 Extend Message Model
Add fields to support rich media, replies, and reactions:
- `type`: String (default: 'text') - message type (text, image, file, voice, etc.)
- `attachments`: Json? - array of objects containing file metadata (url, type, name, size)
- `replyTo`: String? - ID of the message being replied to (for threaded replies)
- `reactions`: Json? - array of objects { userId, emoji, createdAt }

#### 1.2 Update Community Model for Private Chats
Make `name` and `slug` optional to allow for private chats without requiring meaningful names (we can generate placeholder values).
Alternatively, we can keep them required and generate placeholder values for private chats.

We'll keep them required and generate a placeholder name and slug for private chats.

#### 1.3 Add Friend Request Model
Create a new model `FriendRequest` to manage friend requests between users:
- `id`: String @id @default(cuid())
- `senderId`: String
- `receiverId`: String
- `status`: String @default('PENDING') // PENDING, ACCEPTED, REJECTED
- `createdAt`: DateTime @default(now())
- Relations:
  - `sender`: User @relation("sentRequests", fields: [senderId], references: [id])
  - `receiver`: User @relation("receivedRequests", fields: [receiverId], references: [id])
- Indexes:
  - @@index([senderId, receiverId])
  - @@unique([senderId, receiverId])

#### 1.4 Update User Model for Friends
Add relations to the User model for friend requests and friends list:
- `sentRequests`: FriendRequest[] @relation("sentRequests")
- `receivedRequests`: FriendRequest[] @relation("receivedRequests")
- `friends`: User[] @relation("Friendships") // We'll need a separate relation for mutual friendships

Alternatively, we can derive friends from accepted friend requests. For simplicity, we'll compute friends from accepted requests where both users have accepted each other? Actually, we can consider a friendship as established when a friend request is accepted. We'll store the friendship explicitly or infer from accepted requests.

We'll add a `friends` relation via a separate join table? Or we can say that two users are friends if there exists an accepted friend request from A to B or B to A. For simplicity, we'll store a friendship record when a request is accepted.

We'll create a `Friendship` model? Or we can just use the FriendRequest with status ACCEPTED to indicate friendship. Then to get a user's friends, we can look for accepted requests where they are the sender or receiver.

We'll do the latter to avoid extra model.

Thus, we don't need to change the User model for friends; we can query FriendRequest.

However, for convenience, we can add virtual relations in Prisma? Not necessary.

We'll keep the User model as is and add methods in the service to get friends.

### 2. Backend Implementation

#### 2.1 Friend Request Service
Create a new service: `apps/api/src/friend/friend.service.js`
Functions:
- `sendFriendRequest(senderId, receiverId)`
- `respondToFriendRequest(requestId, action)` // action: 'accept' or 'reject'
- `getFriendRequests(userId, type)` // type: 'sent', 'received'
- `getFriends(userId)`
- `removeFriend(userId, friendId)`

#### 2.2 Friend Request Controller
Create a new controller: `apps/api/src/friend/friend.controller.js`
Endpoints:
- POST `/api/friends/request` - send friend request
- POST `/api/friends/respond/:requestId` - accept/reject request
- GET `/api/friends` - get list of friends
- GET `/api/friends/requests` - get pending incoming/outgoing requests (with query param?type=sent|received)
- DELETE `/api/friends/:friendId` - remove friend

#### 2.3 Update Chat Service for Rich Messages
Modify `apps/api/src/chat/chat.service.js`:
- Update `saveMessage` to handle new fields: type, attachments, replyTo, reactions
- Ensure `getMessages` still works (it currently ignores new fields, which is fine)

#### 2.4 Update Chat Controller for Feature Gating and New Features
Modify `apps/api/src/chat/chat.controller.js`:
- In `sendMessage`, add checks for:
  - Attachments: require "Attachment sharing in chat" feature (already implemented)
  - Voice messages: treat as attachment with type 'audio'
  - Reactions: we may need a separate endpoint to add/remove reactions
- Add new endpoint for reactions:
  - POST `/api/chat/:communityId/messages/:messageId/reactions` - add a reaction
  - DELETE `/api/chat/:communityId/messages/:messageId/reactions/:reactionId` - remove a reaction (or by userId and emoji)
- Add endpoint for replying to a message (handled by sending a message with `replyTo` set)

#### 2.5 Real-time Updates for Reactions
When a reaction is added/removed, emit a Socket.IO event to update the message in real-time.

#### 2.6 File Upload Integration
Use existing Cloudinary integration (if present) or implement file upload for attachments.
We'll need to handle:
- Image preview
- PDF preview
- Voice message playback

We'll store file metadata in the attachments array.

### 3. Frontend Implementation
We'll implement the frontend in the Next.js app (apps/web).

#### 3.1 Friend Request Components
- `FriendRequestButton` - to send a friend request
- `FriendRequestsList` - to show incoming/outgoing requests
- `FriendsList` - to list friends
- `FriendSearch` - to search for users to friend

#### 3.2 Chat UI Enhancements
- Message composer with attachments (image, file, voice) button
- Message reactions UI (long press or hover to show emoji picker)
- Reply functionality (reply to a specific message)
- Display of different message types (image preview, file download, voice player)
- Loading states and error handling

#### 3.3 Private Chat Initiation
- From a user's profile or friend list, provide a button to start a direct message
- This will create a private community (if not exists) and navigate to the chat page for that community

#### 3.4 Group Chat Creation
- Allow users to create a new group chat (community) and add members

### 4. Detailed Steps

#### Step 1: Update Database Schema
- Modify `prisma/schema.prisma` to add fields to Message model
- Add FriendRequest model
- Run migration

#### Step 2: Implement Friend Request Backend
- Create friend.service.js
- Create friend.controller.js
- Register routes in `apps/api/src/routes/friend.js`
- Protect routes with authentication middleware

#### Step 3: Update Chat Backend
- Modify chat.service.js to handle new message fields
- Modify chat.controller.js for reactions and feature gating
- Add new routes for reactions

#### Step 4: Implement Frontend
- Create friend-related components and pages
- Update chat interface to support new features
- Integrate with backend APIs

#### Step 5: Testing
- Test friend request flow
- Test chat with attachments, reactions, replies
- Test real-time updates
- Ensure feature gating works (attachments require subscription)

## Files to Modify/Create

### Backend
- `prisma/schema.prisma` - update Message model, add FriendRequest model
- `apps/api/src/friend/friend.service.js` (new)
- `apps/api/src/friend/friend.controller.js` (new)
- `apps/api/src/routes/friend.js` (new)
- `apps/api/src/chat/chat.service.js` (modify)
- `apps/api/src/chat/chat.controller.js` (modify)
- `apps/api/src/routes/chat.js` (possibly add new routes for reactions)

### Frontend
- `apps/web/app/(dashboard)/friends/page.tsx` (friends list)
- `apps/web/app/(dashboard)/friends/requests/page.tsx` (friend requests)
- `apps/web/app/(dashboard)/friends/send/[userId]/page.tsx` (send request form)
- `apps/web/app/(dashboard)/chat/[communityId]/page.tsx` (chat page enhancements)
- Components: `FriendRequestButton`, `FriendRequestsList`, `MessageReactions`, `MessageAttachments`, `VoicePlayer`, etc.

## Notes
- We will follow existing code patterns and conventions.
- We will ensure proper error handling and validation.
- We will reuse existing Socket.IO setup for real-time updates.
- We will implement feature gating for attachment sharing (already started in chat.controller.js).
- We will handle file uploads via existing upload route (if exists) or create new one.

## Estimated Time
- Database and backend: 2 days
- Frontend: 3 days
- Testing: 1 day

Total: 6 days (within Sprint 13 timeline).