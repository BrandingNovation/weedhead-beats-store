import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Purchase, Track } from '../types';
import { supabase } from '../lib/supabaseClient';

interface OrderItem {
  id: string;
  order_id: string;
  track_id: string;
  license_type: string;
  price: number;
  track?: Track;
}

interface Order {
  id: string;
  user_id: string;
  total: number;
  payment_status: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
}

interface PurchaseHistoryContextType {
  orders: Order[];
  purchases: Purchase[];
  isLoading: boolean;
  error: string | null;
  refreshPurchases: () => Promise<void>;
  getDownloadUrl: (trackId: string, licenseType: string) => Promise<string | null>;
}

const PurchaseHistoryContext = createContext<PurchaseHistoryContextType | undefined>(undefined);

export const PurchaseHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user from Supabase
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshPurchases = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      setPurchases([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch orders for the user
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .eq('payment_status', 'completed')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        setError('Failed to load purchase history');
        setIsLoading(false);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setPurchases([]);
        setIsLoading(false);
        return;
      }

      // Fetch order items for each order
      const orderIds = ordersData.map(o => o.id);
      const { data: orderItemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        setError('Failed to load order items');
        setIsLoading(false);
        return;
      }

      // Fetch track details for each order item
      const trackIds = orderItemsData?.map(item => item.track_id).filter(Boolean) || [];
      let tracksData: any[] = [];

      if (trackIds.length > 0) {
        const { data: tracks, error: tracksError } = await supabase
          .from('tracks')
          .select('*')
          .in('id', trackIds);

        if (tracksError) {
          console.error('Error fetching tracks:', tracksError);
        } else if (tracks) {
          tracksData = tracks;
        }
      }

      // Combine orders with their items and track details
      const ordersWithItems: Order[] = ordersData.map(order => {
        const items = (orderItemsData || [])
          .filter(item => item.order_id === order.id)
          .map(item => {
            const track = tracksData.find(t => t.id === item.track_id);
            return {
              ...item,
              track: track ? {
                id: track.id,
                title: track.title || track.name || 'Untitled',
                producer: track.producer || track.artist || 'Unknown',
                bpm: track.bpm || 0,
                key: track.key || '',
                price: track.price || item.price || 0,
                mood: track.mood || track.genre || 'Dark',
                tags: track.tags || [],
                cover: track.cover_image || track.image_url || '',
                audio: track.audio_url || track.url || '',
                description: track.description || '',
                category: (track.category || 'beat') as any,
                youtubeUrl: track.youtube_url || '',
              } : undefined,
            };
          });

        return {
          id: order.id,
          user_id: order.user_id,
          total: order.total || 0,
          payment_status: order.payment_status || 'completed',
          payment_method: order.payment_method || 'unknown',
          created_at: order.created_at || order.created_at,
          items,
        };
      });

      setOrders(ordersWithItems);

      // Convert to Purchase format for compatibility
      const purchasesList: Purchase[] = [];
      ordersWithItems.forEach(order => {
        order.items.forEach(item => {
          if (item.track) {
            purchasesList.push({
              id: item.id,
              userId: order.user_id,
              trackId: item.track_id,
              licenseType: (item.license_type || 'basic') as any,
              purchaseDate: order.created_at,
              price: item.price || 0,
              downloadUrls: item.track.audio ? [item.track.audio] : undefined,
            });
          }
        });
      });

      setPurchases(purchasesList);
    } catch (err) {
      console.error('Error in refreshPurchases:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load purchases when user changes
  useEffect(() => {
    refreshPurchases();
  }, [refreshPurchases]);

  const getDownloadUrl = useCallback(async (trackId: string, licenseType: string): Promise<string | null> => {
    try {
      // For now, return the track audio URL
      // In a real implementation, this would generate a signed download URL
      const { data: trackData, error } = await supabase
        .from('tracks')
        .select('audio_url, url, stems_url')
        .eq('id', trackId)
        .single();

      if (error || !trackData) {
        console.error('Error fetching track for download:', error);
        return null;
      }

      // Return appropriate URL based on license type
      if (licenseType === 'premium' || licenseType === 'exclusive') {
        return trackData.stems_url || trackData.audio_url || trackData.url || null;
      }
      return trackData.audio_url || trackData.url || null;
    } catch (err) {
      console.error('Error in getDownloadUrl:', err);
      return null;
    }
  }, []);

  return (
    <PurchaseHistoryContext.Provider value={{
      orders,
      purchases,
      isLoading,
      error,
      refreshPurchases,
      getDownloadUrl,
    }}>
      {children}
    </PurchaseHistoryContext.Provider>
  );
};

export const usePurchaseHistory = () => {
  const context = useContext(PurchaseHistoryContext);
  if (context === undefined) {
    throw new Error('usePurchaseHistory must be used within a PurchaseHistoryProvider');
  }
  return context;
};
