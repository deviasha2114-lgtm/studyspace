import { create } from "zustand";
import {
  HMSReactiveStore,
  HMSStore,
  HMSActions,
  selectPeers,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectIsConnectedToRoom,
} from "@100mslive/hms-video-store";
import { Peer } from "@studyspace/ui/components/VideoRoom/VideoRoomUI";

// 100ms singleton
const hmsManager = new HMSReactiveStore();
hmsManager.triggerOnSubscribe();
export const hmsStore: HMSStore = hmsManager.getStore();
export const hmsActions: HMSActions = hmsManager.getActions();

interface VideoState {
  peers: Peer[];
  isJoined: boolean;
  isJoining: boolean;
  localAudio: boolean;
  localVideo: boolean;
  roomId: string | null;

  // Actions
  joinRoom: (roomId: string, authToken: string, userName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  syncFromHMS: () => void;
}

export const useVideoStore = create<VideoState>((set, get) => ({
  peers: [],
  isJoined: false,
  isJoining: false,
  localAudio: true,
  localVideo: true,
  roomId: null,

  joinRoom: async (roomId, authToken, userName) => {
    set({ isJoining: true, roomId });
    try {
      await hmsActions.join({
        userName,
        authToken,
        settings: { isAudioMuted: false, isVideoMuted: false },
      });
      set({ isJoined: true, isJoining: false });

      // Subscribe to HMS store updates
      hmsStore.subscribe((state) => {
        const hmsPeers = selectPeers(state);
        const peers: Peer[] = hmsPeers.map((p) => ({
          id: p.id,
          name: p.name,
          isLocal: p.isLocal,
          videoEnabled: p.videoEnabled,
          audioEnabled: p.audioEnabled,
        }));
        set({
          peers,
          localAudio: selectIsLocalAudioEnabled(state),
          localVideo: selectIsLocalVideoEnabled(state),
          isJoined: selectIsConnectedToRoom(state),
        });
      });
    } catch (err) {
      console.error("HMS join failed:", err);
      set({ isJoining: false });
    }
  },

  leaveRoom: async () => {
    await hmsActions.leave();
    set({ isJoined: false, peers: [], roomId: null });
  },

  toggleAudio: async () => {
    const { localAudio } = get();
    await hmsActions.setLocalAudioEnabled(!localAudio);
    set({ localAudio: !localAudio });
  },

  toggleVideo: async () => {
    const { localVideo } = get();
    await hmsActions.setLocalVideoEnabled(!localVideo);
    set({ localVideo: !localVideo });
  },

  syncFromHMS: () => {
    // Called on component mount to sync current HMS state
    const state = hmsStore.getState();
    const hmsPeers = selectPeers(state);
    set({
      peers: hmsPeers.map((p) => ({
        id: p.id,
        name: p.name,
        isLocal: p.isLocal,
        videoEnabled: p.videoEnabled,
        audioEnabled: p.audioEnabled,
      })),
      localAudio: selectIsLocalAudioEnabled(state),
      localVideo: selectIsLocalVideoEnabled(state),
      isJoined: selectIsConnectedToRoom(state),
    });
  },
}));
