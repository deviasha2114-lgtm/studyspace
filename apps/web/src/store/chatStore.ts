import { create } from "zustand";
import { Message } from "@studyspace/ui/components/Chat/ChatUI";
import { io, Socket } from "socket.io-client";

interface ChatState {
  socket: Socket | null;
  messages: Message[];
  isConnected: boolean;
  currentSlug: string | null;

  // Actions
  connect: (slug: string, userId: string, token: string) => void;
  disconnect: () => void;
  sendMessage: (content: string, userId: string, username: string) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  messages: [],
  isConnected: false,
  currentSlug: null,

  connect: (slug, userId, token) => {
    const existing = get().socket;
    if (existing) existing.disconnect();

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001", {
      auth: { token },
      query: { slug },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      set({ isConnected: true });
      socket.emit("join_room", { slug, userId });
    });

    socket.on("disconnect", () => set({ isConnected: false }));

    socket.on("message", (msg: Message) => {
      get().addMessage({ ...msg, timestamp: new Date(msg.timestamp) });
    });

    socket.on("history", (msgs: Message[]) => {
      set({
        messages: msgs.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })),
      });
    });

    set({ socket, currentSlug: slug });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, isConnected: false, messages: [], currentSlug: null });
  },

  sendMessage: (content, userId, username) => {
    const { socket, currentSlug } = get();
    if (!socket || !currentSlug) return;

    const msg: Message = {
      id: crypto.randomUUID(),
      userId,
      username,
      content,
      timestamp: new Date(),
    };

    socket.emit("message", { slug: currentSlug, message: msg });
    get().addMessage(msg); // optimistic
  },

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  clearMessages: () => set({ messages: [] }),
}));
