import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Heart, MessageSquare, Share2, Users, Activity, Bell } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Track } from '../types';

interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  userId: string;
  type: 'follow' | 'like' | 'comment' | 'purchase' | 'upload';
  trackId?: string;
  targetUserId?: string;
  metadata?: any;
  createdAt: string;
  user?: {
    id: string;
    username?: string;
    avatarUrl?: string;
  };
  track?: Track;
}

interface SocialFeaturesProps {
  currentUserId?: string;
  producerId?: string;
  track?: Track;
  className?: string;
}

const SocialFeatures: React.FC<SocialFeaturesProps> = ({
  currentUserId,
  producerId,
  track,
  className = '',
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is following
  useEffect(() => {
    if (currentUserId && producerId) {
      checkFollowStatus();
      loadFollowerCounts();
    }
  }, [currentUserId, producerId]);

  // Load activity feed
  useEffect(() => {
    if (currentUserId) {
      loadActivityFeed();
    }
  }, [currentUserId]);

  const checkFollowStatus = async () => {
    if (!currentUserId || !producerId) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', producerId)
        .single();

      if (!error && data) {
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const loadFollowerCounts = async () => {
    if (!producerId) return;

    try {
      // Get followers count
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', producerId);

      // Get following count
      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', producerId);

      setFollowerCount(followers || 0);
      setFollowingCount(following || 0);
    } catch (error) {
      console.error('Error loading follower counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUserId || !producerId) return;

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', producerId);

        if (!error) {
          setIsFollowing(false);
          setFollowerCount((prev) => Math.max(0, prev - 1));
          
          // Add to activity feed
          await addActivity({
            type: 'follow',
            targetUserId: producerId,
            metadata: { action: 'unfollowed' },
          });
        }
      } else {
        // Follow
        const { error } = await supabase.from('follows').insert({
          follower_id: currentUserId,
          following_id: producerId,
        });

        if (!error) {
          setIsFollowing(true);
          setFollowerCount((prev) => prev + 1);
          
          // Add to activity feed
          await addActivity({
            type: 'follow',
            targetUserId: producerId,
            metadata: { action: 'followed' },
          });
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const addActivity = async (activity: Partial<ActivityItem>) => {
    if (!currentUserId) return;

    try {
      await supabase.from('activity_feed').insert({
        user_id: currentUserId,
        type: activity.type,
        track_id: activity.trackId,
        target_user_id: activity.targetUserId,
        metadata: activity.metadata,
      });
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const loadActivityFeed = async () => {
    if (!currentUserId) return;

    try {
      // Get activities from users you follow
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId);

      const followingIds = follows?.map((f) => f.following_id) || [];

      if (followingIds.length === 0) {
        setActivityFeed([]);
        return;
      }

      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          user:profiles!activity_feed_user_id_fkey(id, username, avatar_url),
          track:tracks(id, title, producer, cover_image)
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setActivityFeed(data as any);
      }
    } catch (error) {
      console.error('Error loading activity feed:', error);
    }
  };

  const handleShare = async (platform: string) => {
    if (!track) return;

    const shareData = {
      title: track.title || 'Check out this track',
      text: track.description || '',
      url: window.location.href,
    };

    const shareLinks: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareData.title)}%20${encodeURIComponent(shareData.url)}`,
    };

    if (shareLinks[platform]) {
      window.open(shareLinks[platform], '_blank');
    } else if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share(shareData).catch(console.error);
    }
  };

  if (loading && !producerId) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Follow Button & Stats */}
      {producerId && (
        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-white">{followerCount}</div>
              <div className="text-sm text-gray-400">Followers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{followingCount}</div>
              <div className="text-sm text-gray-400">Following</div>
            </div>
            {currentUserId && currentUserId !== producerId && (
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isFollowing
                    ? 'bg-surface-highlight text-white hover:bg-surface-highlight/80'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-5 h-5" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Follow
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Share Buttons */}
      {track && (
        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleShare('twitter')}
              className="px-4 py-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] rounded-lg transition-colors text-sm"
            >
              Twitter
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="px-4 py-2 bg-[#1877F2] hover:bg-[#166FE5] rounded-lg transition-colors text-sm"
            >
              Facebook
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="px-4 py-2 bg-[#25D366] hover:bg-[#22C55E] rounded-lg transition-colors text-sm"
            >
              WhatsApp
            </button>
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={() => handleShare('native')}
                className="px-4 py-2 bg-surface-highlight hover:bg-surface-highlight/80 rounded-lg transition-colors text-sm"
              >
                More...
              </button>
            )}
          </div>
        </div>
      )}

      {/* Activity Feed */}
      {currentUserId && activityFeed.length > 0 && (
        <div className="bg-surface border border-white/10 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Feed
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityFeed.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-surface-highlight rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  {activity.type === 'follow' && <UserPlus className="w-5 h-5 text-primary" />}
                  {activity.type === 'like' && <Heart className="w-5 h-5 text-primary" />}
                  {activity.type === 'comment' && <MessageSquare className="w-5 h-5 text-primary" />}
                  {activity.type === 'purchase' && <Users className="w-5 h-5 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">
                    {activity.user?.username || 'User'}{' '}
                    {activity.type === 'follow' && 'followed someone'}
                    {activity.type === 'like' && 'liked a track'}
                    {activity.type === 'comment' && 'commented on a track'}
                    {activity.type === 'purchase' && 'purchased a track'}
                    {activity.type === 'upload' && 'uploaded a new track'}
                  </div>
                  {activity.track && (
                    <div className="text-xs text-gray-400 mt-1 truncate">
                      {activity.track.title}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialFeatures;
