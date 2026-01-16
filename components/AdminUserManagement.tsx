import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Users, Search, Edit2, Shield, Crown, Mail, Calendar, ShoppingBag, MessageSquare, X, Check } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isPro?: boolean;
  isAdmin?: boolean;
  created_at?: string;
  last_sign_in_at?: string;
}

interface UserStats {
  orders: number;
  comments: number;
  playlists: number;
  favorites: number;
}

interface UserWithStats extends UserProfile {
  stats: UserStats;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null);
  const [editName, setEditName] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editIsPro, setEditIsPro] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError && profilesError.code !== 'PGRST116' && profilesError.code !== '42P01') {
        throw profilesError;
      }

      // Combine profile data
      const usersMap = new Map<string, UserWithStats>();
      
      // Get current user for email reference
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Add profiles - profiles table may not have email column
      (profiles || []).forEach((profile: any) => {
        // Try to get email from profile, or use a placeholder
        const userEmail = profile.email || `user-${profile.id.substring(0, 8)}`;
        
        usersMap.set(profile.id, {
          id: profile.id,
          email: userEmail,
          name: profile.name || 'Unknown',
          avatar: profile.avatar_url || profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`,
          isPro: profile.is_pro ?? false,
          isAdmin: profile.is_admin ?? false,
          created_at: profile.created_at,
          last_sign_in_at: profile.last_sign_in_at,
          stats: {
            orders: 0,
            comments: 0,
            playlists: 0,
            favorites: 0
          }
        });
      });

      // Fetch stats for each user
      const usersArray = Array.from(usersMap.values());
      
      // Get order counts (handle missing table gracefully)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('user_id')
        .eq('payment_status', 'completed');
      if (ordersError && ordersError.code !== 'PGRST116' && ordersError.code !== '42P01') {
        console.warn('Could not fetch orders:', ordersError);
      }

      // Get comment counts (handle missing table gracefully)
      const { data: commentsData, error: commentsError } = await supabase
        .from('track_comments')
        .select('user_id');
      if (commentsError && commentsError.code !== 'PGRST116' && commentsError.code !== '42P01') {
        console.warn('Could not fetch comments:', commentsError);
      }

      // Get playlist counts (handle missing table gracefully)
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('playlists')
        .select('user_id');
      if (playlistsError && playlistsError.code !== 'PGRST116' && playlistsError.code !== '42P01') {
        console.warn('Could not fetch playlists:', playlistsError);
      }

      // Get favorite counts (handle missing table gracefully)
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('user_id');
      if (favoritesError && favoritesError.code !== 'PGRST116' && favoritesError.code !== '42P01') {
        console.warn('Could not fetch favorites:', favoritesError);
      }

      // Count stats
      const orderCounts = new Map<string, number>();
      (ordersData || []).forEach((order: any) => {
        orderCounts.set(order.user_id, (orderCounts.get(order.user_id) || 0) + 1);
      });

      const commentCounts = new Map<string, number>();
      (commentsData || []).forEach((comment: any) => {
        commentCounts.set(comment.user_id, (commentCounts.get(comment.user_id) || 0) + 1);
      });

      const playlistCounts = new Map<string, number>();
      (playlistsData || []).forEach((playlist: any) => {
        playlistCounts.set(playlist.user_id, (playlistCounts.get(playlist.user_id) || 0) + 1);
      });

      const favoriteCounts = new Map<string, number>();
      (favoritesData || []).forEach((favorite: any) => {
        favoriteCounts.set(favorite.user_id, (favoriteCounts.get(favorite.user_id) || 0) + 1);
      });

      // Update users with stats
      usersArray.forEach((user) => {
        user.stats.orders = orderCounts.get(user.id) || 0;
        user.stats.comments = commentCounts.get(user.id) || 0;
        user.stats.playlists = playlistCounts.get(user.id) || 0;
        user.stats.favorites = favoriteCounts.get(user.id) || 0;
      });

      setUsers(usersArray);
    } catch (error: any) {
      console.error('Error loading users:', error);
      // Show error toast if it's a real error (not just missing table)
      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        setToast({ message: 'Failed to load users. Please try again.', type: 'error' });
        setTimeout(() => setToast(null), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: UserWithStats) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditIsAdmin(user.isAdmin || false);
    setEditIsPro(user.isPro || false);
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      setSaving(true);

      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: editingUser.id,
          name: editName,
          is_admin: editIsAdmin,
          is_pro: editIsPro,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        throw error;
      }

      // Update local state
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, name: editName, isAdmin: editIsAdmin, isPro: editIsPro }
          : u
      ));

      setToast({ message: 'User updated successfully!', type: 'success' });
      setTimeout(() => {
        setToast(null);
        setEditingUser(null);
      }, 2000);
    } catch (error: any) {
      console.error('Error updating user:', error);
      setToast({ message: error.message || 'Failed to update user', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="mt-4 text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white flex items-center gap-2`}>
          {toast.type === 'success' ? <Check size={20} /> : <X size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6" />
          User Management
        </h2>
        <div className="text-sm text-gray-400">
          {users.length} total users
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">User</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Role</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Activity</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Last Active</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-gray-400 text-sm flex items-center gap-1">
                            <Mail size={12} />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {user.isAdmin && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">
                            <Shield size={12} />
                            Admin
                          </span>
                        )}
                        {user.isPro && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs">
                            <Crown size={12} />
                            Pro
                          </span>
                        )}
                        {!user.isAdmin && !user.isPro && (
                          <span className="text-gray-500 text-xs">User</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-400">
                          <ShoppingBag size={14} />
                          {user.stats.orders}
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <MessageSquare size={14} />
                          {user.stats.comments}
                        </div>
                        <div className="text-gray-400">
                          {user.stats.playlists} playlists
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(user.last_sign_in_at)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                        title="Edit User"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Edit User</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsAdmin}
                    onChange={(e) => setEditIsAdmin(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-300 flex items-center gap-1">
                    <Shield size={14} />
                    Admin Access
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsPro}
                    onChange={(e) => setEditIsPro(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-300 flex items-center gap-1">
                    <Crown size={14} />
                    Pro Membership
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-gray-700 text-white font-semibold rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
