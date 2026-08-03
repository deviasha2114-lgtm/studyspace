import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import axios from '@/lib/axios';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { useRouter, usePathname } from 'next/navigation';

export default function StudyRoomDetailPage({ params }: { params: { roomId: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const roomId = params.roomId;

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ id: string; userId: string; userName: string; content: string; timestamp: string; }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [participants, setParticipants] = useState<Array<{ id: string; name: string; avatar: string; isOnline: boolean }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // AI Feature States
  const [showDoubtSolver, setShowDoubtSolver] = useState(false);
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [showNotesSummarizer, setShowNotesSummarizer] = useState(false);

  // Doubt Solver State
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtAnswer, setDoubtAnswer] = useState<string | null>(null);
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [doubtError, setDoubtError] = useState<string | null>(null);

  // Quiz Generator State
  const [quizTopic, setQuizTopic] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<Array<any>>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Notes Summarizer State
  const [notesContent, setNotesContent] = useState('');
  const [notesSummary, setNotesSummary] = useState<string | null>(null);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  // Socket.io connection
  useEffect(() => {
    if (!user) return;

    // Get token from localStorage (same as used in axios interceptor)
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }

    // Initialize socket with token
    const socket = getSocket(token);

    // Join the room
    socket.emit('join-room', { roomId, userId: user.id });

    // Listen for messages
    socket.on('message', (data: { id: string; userId: string; userName: string; content: string; timestamp: string }) => {
      setMessages(prev => [...prev, data]);
    });

    // Listen for participants update
    socket.on('participants-update', (data: Array<{ id: string; name: string; avatar: string; isOnline: boolean }>) => {
      setParticipants(data);
    });

    // Listen for typing indicators
    socket.on('typing', (data: { userId: string; isTyping: boolean }) => {
      // Update typing status for specific user
      setParticipants(prev =>
        prev.map(p =>
          p.id === data.userId ? { ...p, isTyping: data.isTyping } : p
        )
      );
    });

    // Cleanup on unmount
    return () => {
      socket.off('message');
      socket.off('participants-update');
      socket.off('typing');
      socket.emit('leave-room', { roomId, userId: user.id });
      // Note: We don't disconnect the socket entirely as it might be used elsewhere
      // disconnectSocket();
    };
  }, [user, roomId]);

  // Fetch room details
  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/study-rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setRoom(response.data.data);
      } catch (err: any) {
        console.error('Error fetching room details:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load room details'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [user, roomId]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Emit typing indicator
    const token = localStorage.getItem('token');
    if (user && token) {
      const socket = getSocket(token);
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Emit typing start
      socket.emit('typing', { roomId, userId: user.id, isTyping: true });

      // Set timeout to emit typing stop after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (socket) {
          socket.emit('typing', { roomId, userId: user.id, isTyping: false });
        }
      }, 1000);
    }
  };

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      const messageData = {
        roomId,
        content: inputValue,
      };

      // Optimistically add message to UI
      const tempMessage = {
        id: Date.now().toString(), // Temporary ID
        userId: user.id,
        userName: user.name || 'Anonymous',
        content: inputValue: new Date().toISOString(),
      };

      setMessages(prev => [...prev, tempMessage]);
      setInputValue('');

      // Send to server via socket
      const socket = getSocket(token);
      socket.emit('send-message', messageData);
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove optimistic message on error
      setMessages(prev => prev.slice(0, -1));
      setError('Failed to send message');
    }
  };

  // Leave room
  const leaveRoom = async () => {
    if (!user || !window.confirm('Are you sure you want to leave this study room?')) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      await axios.post(
        `/api/study-rooms/${roomId}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      router.push('/study-rooms');
    } catch (err: any) {
      console.error('Error leaving room:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to leave room'
      );
    }
  };

  // Doubt Solver Functions
  const askDoubt = async () => {
    if (!doubtQuestion.trim() || !user) return;

    setDoubtLoading(true);
    setDoubtError(null);
    setDoubtAnswer(null);

    try {
      const response = await axios.post(
        `/api/ai/doubt-solver`,
        {
          question: doubtQuestion,
          context: room?.title || '',
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setDoubtAnswer(response.data.answer);
    } catch (err: any) {
      console.error('Error solving doubt:', err);
      setDoubtError(
        err.response?.data?.message ||
          err.message ||
          'Failed to get answer'
      );
    } finally {
      setDoubtLoading(false);
    }
  };

  // Quiz Generator Functions
  const generateQuiz = async () => {
    if (!quizTopic.trim() || !user) return;

    setQuizLoading(true);
    setQuizError(null);
    setQuizQuestions([]);

    try {
      const response = await axios.post(
        `/api/ai/quiz-generator`,
        {
          topic: quizTopic,
          difficulty: 'medium', // Could be made configurable
          count: 5, // Number of questions
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setQuizQuestions(response.data.questions);
    } catch (err: any) {
      console.error('Error generating quiz:', err);
      setQuizError(
        err.response?.data?.message ||
          err.message ||
          'Failed to generate quiz'
      );
    } finally {
      setQuizLoading(false);
    }
  };

  // Notes Summarizer Functions
  const summarizeNotes = async () => {
    if (!notesContent.trim() || !user) return;

    setNotesLoading(true);
    setNotesError(null);
    setNotesSummary(null);

    try {
      const response = await axios.post(
        `/api/ai/notes-summarizer`,
        {
          content: notesContent,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setNotesSummary(response.data.summary);
    } catch (err: any) {
      console.error('Error summarizing notes:', err);
      setNotesError(
        err.response?.data?.message ||
          err.message ||
          'Failed to summarize notes'
      );
    } finally {
      setNotesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Loading Study Room...</h2>
            <Link href="/study-rooms" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Study Rooms
            </Link>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-500">Loading room details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Study Room</h2>
            <Link href="/study-rooms" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Study Rooms
            </Link>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
          {/* Room details would go here if loaded */}
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Study Room</h2>
            <Link href="/study-rooms" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Study Rooms
            </Link>
          </div>
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Room not found</h3>
            <p className="text-sm text-gray-500 mt-2">
              The study room you're looking for doesn't exist or has been deleted.
            </p>
            <Link
              href="/study-rooms"
              className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
            >
              Back to Study Rooms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center">
                {room.type === 'OPEN' ? '🔓' : room.type === 'PRIVATE' ? '🔒' : '📚'}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{room.title}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {room.type} • {room.currentParticipants}/{room.maxParticipants} participants
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={leaveRoom}
              className="px-3 py-1 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 text-xs"
            >
              Leave Room
            </button>
            <button
              className="px-3 py-1 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 text-xs"
            >
              Report
            </button>
            <button
              className="px-3 py-1 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 text-xs"
            >
              Copy Link
            </button>
          </div>
        </div>

        {/* Room Description */}
        {room.description && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{room.description}</p>
          </div>
        )}

        {/* Room Details */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Room Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="w-20 text-gray-500">Host:</span>
                <span className="font-medium">{room.hostName || 'Anonymous'}</span>
              </div>
              {room.scheduledAt && (
                <div className="flex items-center">
                  <span className="w-20 text-gray-500">Scheduled:</span>
                  <span className="font-medium">
                    {new Date(room.scheduledAt).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center">
                <span className="w-20 text-gray-500">Duration:</span>
                <span className="font-medium">{room.duration} minutes</span>
              </div>
              <div className="flex items-center">
                <span className="w-20 text-gray-500">Visibility:</span>
                <span className="font-medium text-{room.isPublic ? 'green-600' : 'red-600'}">
                  {room.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              {!room.isPublic && (
                <div className="flex items-center">
                  <span className="w-20 text-gray-500">Password:</span>
                  <span className="font-medium monospace">••••••</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content: Chat and Participants */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Chat Area */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">Online:</span>
                <span className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="ml-1">{participants.filter(p => p.isOnline).length}</span>
                </span>
              </div>
            </div>

            {/* Messages List */}
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.userId === user.id ? 'justify-end' : 'justify-start'} max-w-[80%]}`}>
                      <div className={`rounded-lg px-4 py-2 max-w-[80%] ${msg.userId === user.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                        <div className="flex items-center space-x-2 mb-1">
                          {msg.userId !== user.id && (
                                            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-600">
                                              {msg.userName?.charAt(0).toUpperCase()}
                                            </div>
                                          )}
                          <span className="font-medium">{msg.userName}</span>
                        </div>
                        <p className="text-sm">{msg.content}</p>
                        <span className="text-xs text-gray-500 block mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center space-x-3">
              <textarea
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1 min-h-[44px] pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none"
                rows={1}
              ></textarea>
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || loading}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>

          {/* Participants Sidebar */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Participants Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Participants ({participants.length})</h3>
              <button
                className="px-3 py-1 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 text-xs"
              >
                Invite
              </button>
            </div>

            {/* Participants List */}
            <div className="p-4 space-y-2">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600">
                        {p.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{p.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    {p.isTyping && (
                      <p className="mt-1 text-xs text-gray-500 italic">typing...</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Features */}
        <div className="mt-6 bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <svg className="h-5 w-5 text-indigo-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.504-.183-2.956-.482-4.266M13 19h6m0 0v-6m0 6l3-3m-3 3L10 16"/>
              </svg>
              AI Study Assistant
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* AI Doubt Solver */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-2 flex items-center space-x-2">
                  <svg className="h-4 w-4 text-indigo-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Ask a Doubt
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Get instant help with your study questions using AI
                </p>
                <div className="space-y-3">
                  <textarea
                    value={doubtQuestion}
                    onChange={(e) => setDoubtQuestion(e.target.value)}
                    placeholder="Ask your question about the study material..."
                    className="w-full min-h-[80px] pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={askDoubt}
                      disabled={doubtLoading || !doubtQuestion.trim()}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {doubtLoading ? 'Getting answer...' : 'Ask Question'}
                    </button>
                    <button
                      onClick={() => setDoubtQuestion('')}
                      className="px-3 py-1 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 text-xs"
                    >
                      Clear
                    </button>
                  </div>
                  {doubtError && (
                    <div className="bg-red-50 text-red-600 text-sm p-2 rounded">
                      {doubtError}
                    </div>
                  )}
                  {doubtAnswer && (
                    <div className="bg-green-50 text-green-800 text-sm p-3 rounded">
                      <p className="font-medium mb-1">Answer:</p>
                      <p>{doubtAnswer}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quiz Generator */}
              <div className="bg-emerald-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-2 flex items-center space-x-2">
                  <svg className="h-4 w-4 text-emerald-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4l3 3"/>
                  </svg>
                  Generate Quiz
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Create a quiz to test your knowledge on any topic
                </p>
                <div className="space-y-3">
                  <input
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    placeholder="Enter topic for quiz (e.g., Photosynthesis, World War II)"
                    className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  />
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={generateQuiz}
                      disabled={quizLoading || !quizTopic.trim()}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {quizLoading ? 'Generating quiz...' : 'Generate Quiz'}
                    </button>
                    <button
                      onClick={() => setQuizTopic('')}
                      className="px-3 py-1 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 text-xs"
                    >
                      Clear
                    </button>
                  </div>
                  {quizError && (
                    <div className="bg-red-50 text-red-600 text-sm p-2 rounded">
                      {quizError}
                    </div>
                  )}
                  {quizQuestions.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-md font-medium mb-2">Your Quiz:</h5>
                      <div className="space-y-2">
                        {quizQuestions.map((q, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg">
                            <p className="font-medium">{index + 1}. {q.question}</p>
                            {q.options && q.options.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {q.options.map((opt, optIdx) => (
                                  <div key={optIdx} className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      name={`quiz-${index}`}
                                      value={opt}
                                      className="h-3 w-3 text-emerald-600"
                                    />
                                    <label>{opt}</label>
                                  </div>
                                ))}
                              </div>
                            )}
                            {q.correctAnswer && (
                              <div className="mt-2 text-sm text-green-600">
                                Correct answer: {q.correctAnswer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Summarizer */}
              <div className="bg-amber-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-2 flex items-center space-x-2">
                  <svg className="h-4 w-4 text-amber-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Summarize Notes
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Get a concise summary of your study notes or text
                </p>
                <div className="space-y-3">
                  <textarea
                    value={notesContent}
                    onChange={(e) => setNotesContent(e.target.value)}
                    placeholder="Paste your notes or text to summarize..."
                    className="w-full min-h-[100px] pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={summarizeNotes}
                      disabled={notesLoading || !notesContent.trim()}
                      className="flex-1 px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50"
                    >
                      {notesLoading ? 'Summarizing...' : 'Summarize'}
                    </button>
                    <button
                      onClick={() => setNotesContent('')}
                      className="px-3 py-1 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 text-xs"
                    >
                      Clear
                    </button>
                  </div>
                  {notesError && (
                    <div className="bg-red-50 text-red-600 text-sm p-2 rounded">
                      {notesError}
                    </div>
                  )}
                  {notesSummary && (
                    <div className="bg-green-50 text-green-800 text-sm p-3 rounded">
                      <p className="font-medium mb-1">Summary:</p>
                      <p>{notesSummary}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}