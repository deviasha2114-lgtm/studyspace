"use client";

export interface Peer {
  id: string;
  name: string;
  isLocal: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

interface VideoRoomUIProps {
  peers: Peer[];
  isJoined: boolean;
  isJoining: boolean;
  localAudio: boolean;
  localVideo: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  roomName?: string;
}

export function VideoRoomUI({
  peers,
  isJoined,
  isJoining,
  localAudio,
  localVideo,
  onJoin,
  onLeave,
  onToggleAudio,
  onToggleVideo,
  roomName = "Study Room",
}: VideoRoomUIProps) {
  if (!isJoined) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-950 text-gray-100 gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">{roomName}</h2>
          <p className="text-gray-400 text-sm">
            {peers.length} participant{peers.length !== 1 ? "s" : ""} in room
          </p>
        </div>
        <button
          onClick={onJoin}
          disabled={isJoining}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-2xl transition-colors text-sm"
        >
          {isJoining ? "Joining..." : "Join Room"}
        </button>
      </div>
    );
  }

  const gridCols =
    peers.length <= 1
      ? "grid-cols-1"
      : peers.length <= 4
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <span className="font-semibold text-gray-200">{roomName}</span>
        <span className="text-xs text-gray-400">
          {peers.length} participant{peers.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Video Grid */}
      <div className={`flex-1 grid ${gridCols} gap-2 p-3 overflow-hidden`}>
        {peers.map((peer) => (
          <div
            key={peer.id}
            className="relative bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center"
          >
            {peer.videoEnabled && peer.videoRef ? (
              <video
                ref={peer.videoRef}
                autoPlay
                muted={peer.isLocal}
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-700 flex items-center justify-center text-2xl font-bold">
                {peer.name[0].toUpperCase()}
              </div>
            )}
            {/* Peer info */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
              <span className="text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                {peer.name} {peer.isLocal && "(You)"}
              </span>
              {!peer.audioEnabled && (
                <span className="text-xs bg-red-600/80 text-white px-1.5 py-0.5 rounded-full">
                  🔇
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-4 bg-gray-900 border-t border-gray-800">
        <button
          onClick={onToggleAudio}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
            localAudio
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-red-600 hover:bg-red-500"
          }`}
          title={localAudio ? "Mute" : "Unmute"}
        >
          {localAudio ? "🎤" : "🔇"}
        </button>
        <button
          onClick={onToggleVideo}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
            localVideo
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-red-600 hover:bg-red-500"
          }`}
          title={localVideo ? "Stop Video" : "Start Video"}
        >
          {localVideo ? "📹" : "🚫"}
        </button>
        <button
          onClick={onLeave}
          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-lg transition-colors"
          title="Leave Room"
        >
          📵
        </button>
      </div>
    </div>
  );
}
