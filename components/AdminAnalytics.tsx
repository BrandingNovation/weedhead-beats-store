import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { DollarSign, BarChart3, TrendingUp, Music } from 'lucide-react';

interface OrderItem {
  id: string;
  order_id: string;
  track_id: string;
  license_type: string;
  price: number;
  track?: {
    id: string;
    title: string;
    artist: string;
  };
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

interface AnalyticsStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingTracks: Array<{ trackId: string; title: string; artist: string; sales: number; revenue: number }>;
  licenseBreakdown: Record<string, { count: number; revenue: number }>;
}

const AdminAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topSellingTracks: [],
    licenseBreakdown: {}
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all completed orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*, order_items(*, tracks(id, title, artist))')
        .eq('payment_status', 'completed')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST116' || error.code === '42P01') {
          console.warn('Orders table does not exist yet');
          setLoading(false);
          return;
        }
        throw error;
      }

      if (!orders || orders.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate statistics
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Track sales by track
      const trackSales: Record<string, { title: string; artist: string; sales: number; revenue: number }> = {};
      const licenseStats: Record<string, { count: number; revenue: number }> = {};

      orders.forEach((order: any) => {
        if (order.order_items && Array.isArray(order.order_items)) {
          order.order_items.forEach((item: any) => {
            // Track sales
            if (item.track_id && item.tracks) {
              const trackId = item.track_id;
              if (!trackSales[trackId]) {
                trackSales[trackId] = {
                  title: item.tracks.title || 'Unknown',
                  artist: item.tracks.artist || 'Unknown',
                  sales: 0,
                  revenue: 0
                };
              }
              trackSales[trackId].sales += 1;
              trackSales[trackId].revenue += item.price || 0;
            }

            // License breakdown
            const licenseType = item.license_type || 'unknown';
            if (!licenseStats[licenseType]) {
              licenseStats[licenseType] = { count: 0, revenue: 0 };
            }
            licenseStats[licenseType].count += 1;
            licenseStats[licenseType].revenue += item.price || 0;
          });
        }
      });

      // Sort top selling tracks
      const topSellingTracks = Object.entries(trackSales)
        .map(([trackId, data]) => ({ trackId, ...data }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10);

      setStats({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        topSellingTracks,
        licenseBreakdown: licenseStats
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="mt-4 text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Sales Analytics
        </h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalOrders}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Average Order Value</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.averageOrderValue)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Top Selling Tracks */}
      {stats.topSellingTracks.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Music className="w-5 h-5" />
            Top Selling Tracks
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Track</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-semibold">Sales</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.topSellingTracks.map((track) => (
                  <tr key={track.trackId} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">{track.title}</p>
                        <p className="text-gray-400 text-sm">{track.artist}</p>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-white">{track.sales}</td>
                    <td className="text-right py-3 px-4 text-green-400 font-semibold">{formatCurrency(track.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* License Breakdown */}
      {Object.keys(stats.licenseBreakdown).length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">License Type Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(stats.licenseBreakdown).map(([licenseType, data]) => (
              <div key={licenseType} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium capitalize">{licenseType}</p>
                  <p className="text-gray-400 text-sm">{data.count} sales</p>
                </div>
                <p className="text-green-400 font-semibold">{formatCurrency(data.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.totalOrders === 0 && (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No sales data available yet</p>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
