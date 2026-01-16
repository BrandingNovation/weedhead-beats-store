import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { TrackComment } from '../types';

interface CommentWithUser extends TrackComment {
  id: string;
  trackId: string;
  userId: string;
  comment: string;
  rating?: number;
  createdAt: string;
  updatedAt?: string;
  user_name?: string;
  user_avatar?: string;
}

interface CommentsContextType {
  comments: CommentWithUser[];
  isLoading: boolean;
  error: string | null;
  addComment: (trackId: string, comment: string, rating?: number) => Promise<void>;
  updateComment: (commentId: string, comment: string, rating?: number) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  getCommentsForTrack: (trackId: string) => CommentWithUser[];
  getAverageRating: (trackId: string) => number;
  getUserRating: (trackId: string) => number | null;
  getUserComment: (trackId: string) => CommentWithUser | null;
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

export const CommentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('track_comments')
          .select(`
            *,
            user:profiles!track_comments_user_id_fkey(name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(500);

        if (fetchError) {
          // Table might not exist yet - that's okay
          if (fetchError.code !== 'PGRST116' && fetchError.code !== '42P01') {
            console.error('Error loading comments:', fetchError);
            setError(fetchError.message);
          }
          return;
        }

        const commentsWithUser = (data || []).map((comment: any) => ({
          id: comment.id,
          trackId: comment.track_id || comment.trackId,
          userId: comment.user_id || comment.userId,
          comment: comment.comment,
          rating: comment.rating,
          createdAt: comment.created_at || comment.createdAt,
          updatedAt: comment.updated_at || comment.updatedAt,
          user_name: comment.user?.name || 'Anonymous',
          user_avatar: comment.user?.avatar_url || ''
        }));

        setComments(commentsWithUser);
      } catch (err: any) {
        console.error('Error in loadComments:', err);
        setError(err.message);
      }
    };

    loadComments();

    // Listen for new comments
    const subscription = supabase
      .channel('track_comments_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'track_comments' },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addComment = useCallback(async (trackId: string, comment: string, rating?: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to comment');
      }

      const newComment = {
        track_id: trackId,
        user_id: user.id,
        comment: comment.trim(),
        rating: rating || null,
        created_at: new Date().toISOString()
      };

      const { data, error: insertError } = await supabase
        .from('track_comments')
        .insert([newComment])
        .select(`
          *,
          user:profiles!track_comments_user_id_fkey(name, avatar_url)
        `)
        .single();

      if (insertError) {
        if (insertError.code !== 'PGRST116' && insertError.code !== '42P01') {
          throw insertError;
        }
        return;
      }

      const commentWithUser: CommentWithUser = {
        id: data.id,
        trackId: data.track_id || data.trackId,
        userId: data.user_id || data.userId,
        comment: data.comment,
        rating: data.rating,
        createdAt: data.created_at || data.createdAt,
        updatedAt: data.updated_at || data.updatedAt,
        user_name: data.user?.name || 'Anonymous',
        user_avatar: data.user?.avatar_url || ''
      };

      setComments(prev => [commentWithUser, ...prev]);
    } catch (err: any) {
      console.error('Error in addComment:', err);
      throw err;
    }
  }, []);

  const updateComment = useCallback(async (commentId: string, comment: string, rating?: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to update comments');
      }

      const { error: updateError } = await supabase
        .from('track_comments')
        .update({
          comment: comment.trim(),
          rating: rating || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (updateError) {
        if (updateError.code !== 'PGRST116' && updateError.code !== '42P01') {
          throw updateError;
        }
        return;
      }

      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, comment: comment.trim(), rating: rating || undefined, updatedAt: new Date().toISOString(), updated_at: new Date().toISOString() }
          : c
      ));
    } catch (err: any) {
      console.error('Error in updateComment:', err);
      throw err;
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to delete comments');
      }

      const { error: deleteError } = await supabase
        .from('track_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (deleteError) {
        if (deleteError.code !== 'PGRST116' && deleteError.code !== '42P01') {
          throw deleteError;
        }
        return;
      }

      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err: any) {
      console.error('Error in deleteComment:', err);
      throw err;
    }
  }, []);

  const getCommentsForTrack = useCallback((trackId: string) => {
    return comments.filter(c => c.trackId === trackId);
  }, [comments]);

  const getAverageRating = useCallback((trackId: string) => {
    const trackComments = comments.filter(c => c.trackId === trackId && c.rating);
    if (trackComments.length === 0) return 0;
    const sum = trackComments.reduce((acc, c) => acc + (c.rating || 0), 0);
    return sum / trackComments.length;
  }, [comments]);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };

    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getUserRating = useCallback((trackId: string) => {
    if (!currentUserId) return null;
    
    const userComment = comments.find(c => c.trackId === trackId && c.userId === currentUserId);
    return userComment?.rating || null;
  }, [comments, currentUserId]);

  const getUserComment = useCallback((trackId: string) => {
    if (!currentUserId) return null;
    
    return comments.find(c => c.trackId === trackId && c.userId === currentUserId) || null;
  }, [comments, currentUserId]);

  return (
    <CommentsContext.Provider
      value={{
        comments,
        isLoading,
        error,
        addComment,
        updateComment,
        deleteComment,
        getCommentsForTrack,
        getAverageRating,
        getUserRating,
        getUserComment
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
};

export const useComments = () => {
  const context = useContext(CommentsContext);
  if (context === undefined) {
    throw new Error('useComments must be used within a CommentsProvider');
  }
  return context;
};
