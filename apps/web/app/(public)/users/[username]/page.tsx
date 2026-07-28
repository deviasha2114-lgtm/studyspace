"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs, type ProfileTab } from "@/components/profile/ProfileTabs";
import { ProfileTabContent } from "@/components/profile/ProfileTabContent";
import { FollowListModal } from "@/components/profile/FollowListModal";
import { Spinner } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import type { ProfileUser } from "@/components/profile/profile.types";
import type { ApiErrorShape } from "@/lib/axios";

export default function PublicProfilePage(): React.JSX.Element {
  const { username } = useParams<{ username: string }>();
  const { user: me } = useAuth();

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("notes");
  const [followModal, setFollowModal] = useState<"followers" | "following" | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile(): Promise<void> {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.get<ProfileUser>(
          `/users/${username}`,
        );
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) {
          const apiErr = err as ApiErrorShape;
          setError(apiErr.message ?? "Failed to load profile.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchProfile();
    return () => { cancelled = true; };
  }, [username]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-5xl">🔍</span>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          Profile not found
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          @{username} doesn't exist or may have been removed.
        </p>
      </div>
    );
  }

  const isOwnProfile = me?.id === profile.id;

  return (
    <>
      <div className="flex flex-col gap-5 max-w-2xl mx-auto">
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          onEditClick={() => {/* redirect to dashboard/profile */}}
          onFollowersClick={() => setFollowModal("followers")}
          onFollowingClick={() => setFollowModal("following")}
          onFollowChange={(isFollowing) => {
            setProfile((prev) =>
              prev
                ? {
                    ...prev,
                    isFollowing,
                    stats: {
                      ...prev.stats,
                      followers: isFollowing
                        ? prev.stats.followers + 1
                        : prev.stats.followers - 1,
                    },
                  }
                : prev,
            );
          }}
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
