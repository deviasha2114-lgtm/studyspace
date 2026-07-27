"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs, type ProfileTab } from "@/components/profile/ProfileTabs";
import { ProfileTabContent } from "@/components/profile/ProfileTabContent";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { FollowListModal } from "@/components/profile/FollowListModal";
import { Spinner } from "@/components/ui";
import type { ProfileUser } from "@/components/profile/profile.types";

export default function OwnProfilePage(): React.JSX.Element {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("notes");
  const [editOpen, setEditOpen] = useState(false);
  const [followModal, setFollowModal] = useState<"followers" | "following" | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return <></>;

  // Shape store user into ProfileUser for components
  const profile: ProfileUser = {
    id: user.id,
    displayName: user.displayName ?? user.name ?? "Unknown",
    username: user.username ?? user.email?.split("@")[0] ?? "user",
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    stream: user.stream,
    className: user.className,
    joinedAt: user.joinedAt ?? new Date().toISOString(),
    stats: { notes: 0, followers: 0, following: 0 },
    isOwnProfile: true,
  };

  return (
    <>
      <div className="flex flex-col gap-5 max-w-2xl">
        <ProfileHeader
          profile={profile}
          isOwnProfile
          onEditClick={() => setEditOpen(true)}
          onFollowersClick={() => setFollowModal("followers")}
          onFollowingClick={() => setFollowModal("following")}
        />

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6">
            <ProfileTabs active={activeTab} onChange={setActiveTab} />
          </div>
          <div className="px-4 py-4 sm:px-6">
            <ProfileTabContent
              tab={activeTab}
              username={profile.username}
            />
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <EditProfileForm
          profile={profile}
          onClose={() => setEditOpen(false)}
        />
      )}

      {/* Follow list modal */}
      {followModal && (
        <FollowListModal
          userId={profile.id}
          mode={followModal}
          onClose={() => setFollowModal(null)}
        />
      )}
    </>
  );
}
