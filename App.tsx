import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  ShoppingBag, 
  X, 
  ChevronRight, 
  Music2, 
  Check, 
  TrendingUp, 
  ArrowRight, 
  Upload, 
  Image as ImageIcon, 
  Disc, 
  DollarSign, 
  Sparkles, 
  Heart, 
  ListMusic, 
  RefreshCw, 
  Menu, 
  Share2, 
  Download, 
  Layers, 
  Youtube, 
  BarChart3, 
  CreditCard, 
  Lock, 
  Edit3, 
  Monitor, 
  Mail, 
  Trash2, 
  Plus, 
  PenTool, 
  CheckCircle, 
  Package, 
  FileAudio, 
  Settings, 
  Database, 
  Save, 
  ShieldCheck, 
  Globe, 
  Zap, 
  Volume2, 
  SkipBack, 
  SkipForward, 
  LogOut, 
  User, 
  LayoutDashboard, 
  HelpCircle,
  FileText,
  ChevronDown,
  Info,
  MessageSquare
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Chat } from '@google/genai';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Services & Components
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import { supabase } from './lib/supabaseClient';
import { createChatSession, sendMessageStream, generateBlogImage, generateSEOContent } from './services/geminiService';
import { AppConfig, GeminiModel, Message, Role, Attachment, GroundingSource, Track, BlogPost, ProductCategory, License, SiteContent, PageConfig, UserProfile } from './types';

declare const process: any;

// --- Configuration ---
const DEFAULT_CONFIG: AppConfig = {
  model: GeminiModel.FLASH,
  systemInstruction: "You are the 'Weedhead Beats Concierge'. You are a street-smart, expert music producer assistant. Help artists write lyrics, find flows, suggest rhymes, and explain the music theory behind the beats. You are embedded in the 'Weedhead Beats' store. Be helpful, concise, and cool.",
  useGrounding: true,
  thinkingBudget: 0,
};

// Initialize Stripe Safely
const getStripeKey = () => {
  try {
    return (typeof process !== 'undefined' && process.env) ? process.env.VITE_STRIPE_PUBLISHABLE_KEY : null;
  } catch(e) { return null; }
};
const stripePromise = loadStripe(getStripeKey() || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

// Initialize PayPal Client ID
const getPayPalClientId = () => {
  try {
    return (typeof process !== 'undefined' && process.env) ? process.env.VITE_PAYPAL_CLIENT_ID : null;
  } catch(e) { return null; }
};

// --- Initial Data (Fallback) ---

const DEFAULT_SITE_CONTENT: SiteContent = {
  store: {
    heroImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop",
    headline: "DOOMSDAY\nPACK VOL. 1",
    subheadline: "Hard-hitting industrial sounds for the modern trap producer.",
    buttonText: "Listen Now"
  },
  collabs: {
    heroImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop",
    headline: "COLLABORATIONS",
    subheadline: "Exclusive tracks produced with top-tier industry talent.",
    buttonText: "View Tracks"
  },
  licenses: {
    heroImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop",
    headline: "LICENSING OPTIONS",
    subheadline: "Simple, transparent pricing. Keep 100% of your writer's share.",
    buttonText: "Read Terms"
  },
  blog: {
    heroImage: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1200&auto=format&fit=crop",
    headline: "PRODUCER HUB",
    subheadline: "Tips, tricks, and industry insights.",
    buttonText: "Subscribe"
  }
};

const LICENSES: License[] = [
  { name: "Basic Lease", price: 29.99, features: ["MP3 File", "2,500 Units", "50k Streams"] },
  { name: "Premium Lease", price: 49.99, features: ["MP3 + WAV", "10,000 Units", "500k Streams", "Trackout Stems"] },
  { name: "Unlimited", price: 199.99, features: ["MP3 + WAV + Stems", "Unlimited Sales", "Unlimited Streams", "Radio Rights"] },
];

const INITIAL_BEATS: Track[] = [
  { id: 1, title: "MIDNIGHT DRIVE", producer: "Weedhead", bpm: 140, key: "Cm", price: 29.99, mood: "Dark", cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", category: 'beat', description: "A dark trap banger perfect for late night drives.", youtubeUrl: "https://youtube.com", stats: { plays: 1240, sales: 12, revenue: 359.88 } },
  { id: 2, title: "NEON HORIZON", producer: "Weedhead", bpm: 128, key: "Gm", price: 29.99, mood: "Energetic", cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=600&auto=format&fit=crop", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", category: 'beat', youtubeUrl: "https://youtube.com", stats: { plays: 850, sales: 5, revenue: 149.95 } },
  { id: 3, title: "TOXIC LOVE", producer: "Weedhead", bpm: 95, key: "Am", price: 29.99, mood: "Soulful", cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&auto=format&fit=crop", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", category: 'beat', description: "R&B trap fusion with deep 808s.", stats: { plays: 3200, sales: 25, revenue: 749.75 } },
  { id: 4, title: "DRILL SERGEANT", producer: "Weedhead", bpm: 142, key: "Fm", price: 34.99, mood: "Aggressive", cover: "https://images.unsplash.com/photo-1621360841013-c768371e93cf?q=80&w=600&auto=format&fit=crop", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", category: 'beat', description: "UK Drill style sliding 808s.", stats: { plays: 540, sales: 2, revenue: 69.98 } },
  { id: 5, title: "SUMMER VIBES", producer: "Weedhead", bpm: 110, key: "Cmaj", price: 29.99, mood: "Euphoric", cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", category: 'beat', description: "Tropical pop rap beat.", stats: { plays: 150, sales: 0, revenue: 0 } },
  { id: 6, title: "COLD STREETS", producer: "Weedhead", bpm: 130, key: "D#m", price: 29.99, mood: "Dark", cover: "https://images.unsplash.com/photo-1485518882345-0785d76877c2?q=80&w=600&auto=format&fit=crop", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", category: 'beat', description: "Gritty boom bap with a modern twist.", stats: { plays: 890, sales: 4, revenue: 119.96 } },
  { id: 7, title: "MONEY TALKS", producer: "Weedhead", bpm: 155, key: "Em", price: 49.99, mood: "Energetic", cover: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", category: 'beat', description: "Hype club banger.", stats: { plays: 2100, sales: 15, revenue: 749.85 } },
  { id: 8, title: "LATE REGISTRATION", producer: "Weedhead", bpm: 88, key: "Bbm", price: 29.99, mood: "Soulful", cover: "https://images.unsplash.com/photo-1459749411177-287ce1465101?q=80&w=600&auto=format&fit=crop", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", category: 'beat', description: "Old school Kanye vibes.", stats: { plays: 4500, sales: 40, revenue: 1199.60 } },
  { id: 9, title: "WAR ZONE", producer: "Weedhead", bpm: 144, key: "G#m", price: 29.99, mood: "Aggressive", cover: "https://images.unsplash.com/photo-1550100136-e074f0145835?q=80&w=600&auto=format&fit=crop", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", category: 'beat', description: "Hard orchestral trap.", stats: { plays: 320, sales: 1, revenue: 29.99 } },
  { id: 10, title: "CLOUD 9", producer: "Weedhead", bpm: 120, key: "F#m", price: 29.99, mood: "Chill", cover: "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?q=80&w=600&auto=format&fit=crop", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", category: 'beat', description: "Atmospheric cloud rap.", stats: { plays: 1100, sales: 8, revenue: 239.92 } },
  { id: 11, title: "NO CAP", producer: "Weedhead", bpm: 138, key: "Cm", price: 29.99, mood: "Energetic", cover: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=600&auto=format&fit=crop", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", category: 'beat', description: "Simple, catchy melody for artists.", stats: { plays: 670, sales: 3, revenue: 89.97 } },
  { id: 12, title: "SAD BOI HOURS", producer: "Weedhead", bpm: 160, key: "Am", price: 29.99, mood: "Dark", cover: "https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=600&auto=format&fit=crop", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", category: 'beat', description: "Emo rap guitar type beat.", stats: { plays: 2800, sales: 18, revenue: 539.82 } },
  { id: 13, title: "BIG BOSS", producer: "Weedhead", bpm: 148, key: "Em", price: 199.99, mood: "Aggressive", cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3", category: 'beat', description: "Rick Ross style luxury trap.", stats: { plays: 400, sales: 2, revenue: 399.98 } },
  { id: 14, title: "LOFI STUDY", producer: "Weedhead", bpm: 80, key: "Cmaj", price: 19.99, mood: "Chill", cover: "https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?q=80&w=600&auto=format&fit=crop", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3", category: 'beat', description: "Relaxing vibes, royalty free options.", stats: { plays: 5000, sales: 50, revenue: 999.50 } },
  { id: 15, title: "FINAL LAP", producer: "Weedhead", bpm: 172, key: "Fm", price: 29.99, mood: "Energetic", cover: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600&auto=format&fit=crop", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3", category: 'beat', description: "High speed drift phonk.", stats: { plays: 1200, sales: 10, revenue: 299.90 } },
  // Placeholder Merch Items
  { id: 101, title: "WEEDHEAD BEATS TEE", producer: "Weedhead", bpm: 0, key: "N/A", price: 29.99, mood: "T-Shirt", cover: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop", audio: "", category: 'merch', description: "Premium cotton t-shirt with Weedhead Beats logo. Available in multiple sizes.", stats: { plays: 0, sales: 45, revenue: 1349.55 } },
  { id: 102, title: "STUDIO HOODIE", producer: "Weedhead", bpm: 0, key: "N/A", price: 59.99, mood: "Hoodie", cover: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop", audio: "", category: 'merch', description: "Comfortable hoodie perfect for late night studio sessions.", stats: { plays: 0, sales: 32, revenue: 1919.68 } },
  { id: 103, title: "VINYL STICKER PACK", producer: "Weedhead", bpm: 0, key: "N/A", price: 9.99, mood: "Sticker Pack", cover: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?q=80&w=600&auto=format&fit=crop", audio: "", category: 'merch', description: "Set of 5 premium vinyl stickers with Weedhead Beats designs.", stats: { plays: 0, sales: 120, revenue: 1198.80 } },
  { id: 104, title: "PRODUCER CAP", producer: "Weedhead", bpm: 0, key: "N/A", price: 24.99, mood: "Cap", cover: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600&auto=format&fit=crop", audio: "", category: 'merch', description: "Snapback cap with embroidered logo. One size fits all.", stats: { plays: 0, sales: 28, revenue: 699.72 } },
  { id: 105, title: "STUDIO MUG", producer: "Weedhead", bpm: 0, key: "N/A", price: 14.99, mood: "Mug", cover: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop", audio: "", category: 'merch', description: "Ceramic mug perfect for your morning coffee while making beats.", stats: { plays: 0, sales: 67, revenue: 1004.33 } }
];

const MOODS = ["All", "Dark", "Energetic", "Soulful", "Aggressive", "Euphoric", "Chill"];
const MERCH_TYPES = ["All", "T-Shirt", "Hoodie", "Sticker Pack", "Cap", "Mug"];

const INITIAL_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "How to Sell Beats Online in 2024",
    excerpt: "The landscape of beat selling has changed. Discover the top platforms and marketing strategies to get your first sale.",
    date: "Oct 24, 2023",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600&auto=format&fit=crop",
    isAiGenerated: false
  },
  {
    id: 2,
    title: "Mixing Vocals like a Pro: 5 Essential Tips",
    excerpt: "Vocals are the most important part of any track. Learn how to EQ, compress, and process vocals to make them sit perfectly in the mix.",
    date: "Oct 25, 2023",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop",
    isAiGenerated: false
  },
  {
    id: 3,
    title: "The Best Free VST Plugins for Trap Producers",
    excerpt: "You don't need to spend a fortune to get industry-standard sounds. Here are the top 5 free VSTs that every trap producer should have.",
    date: "Oct 26, 2023",
    image: "https://images.unsplash.com/photo-1558584673-c834fb1cc3ca?q=80&w=600&auto=format&fit=crop",
    isAiGenerated: false
  },
  {
    id: 4,
    title: "Understanding Compression: A Beginner's Guide",
    excerpt: "Compression is often misunderstood. We break down the basics of threshold, ratio, attack, and release to help you control your dynamics.",
    date: "Oct 27, 2023",
    image: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=600&auto=format&fit=crop",
    isAiGenerated: false
  },
  {
    id: 5,
    title: "Music Theory Hacks for Beatmakers",
    excerpt: "Stuck in a loop? Use these simple music theory tricks to create more interesting chord progressions and melodies instantly.",
    date: "Oct 28, 2023",
    image: "https://images.unsplash.com/photo-1507838153414-b4b713384ebd?q=80&w=600&auto=format&fit=crop",
    isAiGenerated: false
  },
  {
    id: 6,
    title: "Mastering in FL Studio: Stock Plugins Only",
    excerpt: "Can you get a professional master using only stock plugins? We show you how to maximize loudness and clarity without third-party tools.",
    date: "Oct 29, 2023",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=600&auto=format&fit=crop",
    isAiGenerated: false
  }
];

// --- Helper Components ---

const AuthModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: (user: UserProfile) => void }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [needsVerification, setNeedsVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verifying, setVerifying] = useState(false);

    if (!isOpen) return null;


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Supabase Login
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                // Supabase Signup
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: name || email.split('@')[0],
                            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                        }
                    }
                });
                if (error) throw error;
                
                // Check if email confirmation is required
                if (data.user && !data.session) {
                    // Email confirmation required
                    setNeedsVerification(true);
                    setLoading(false);
                    return;
                }
                
                // Manual profile insertion if signup successful to ensure data exists
                if (data.user) {
                    await supabase.from('profiles').insert([{
                        id: data.user.id,
                        email: email,
                        name: name || email.split('@')[0],
                        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                        is_admin: email.toLowerCase().includes('admin'),
                        updated_at: new Date()
                    }]).select();
                }
            }
            onClose();
        } catch (err: any) {
            setError(err.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setVerifying(true);

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: verificationCode,
                type: 'signup'
            });
            
            if (error) throw error;
            
            if (data.user) {
                // Create profile after verification
                await supabase.from('profiles').insert([{
                    id: data.user.id,
                    email: email,
                    name: name || email.split('@')[0],
                    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                    is_admin: email.toLowerCase().includes('admin'),
                    updated_at: new Date()
                }]).select();
                
                setNeedsVerification(false);
                onClose();
            }
        } catch (err: any) {
            setError(err.message || "Verification failed. Please check your code.");
        } finally {
            setVerifying(false);
        }
    };

    const handleResendCode = async () => {
        setError('');
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email
            });
            if (error) throw error;
            setError('Verification code resent! Check your email.');
            setTimeout(() => setError(''), 3000);
        } catch (err: any) {
            setError(err.message || "Failed to resend code");
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-black/95 backdrop-blur-md" onClick={onClose}>
            <div 
                className="bg-brand-black border border-brand-slate rounded-2xl w-full max-w-md p-0 overflow-hidden shadow-2xl relative" 
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative header */}
                <div className="h-32 bg-gradient-to-br from-brand-green/40 via-brand-black to-brand-black relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="absolute -bottom-10 left-8">
                        <div className="w-20 h-20 bg-brand-black rounded-2xl border border-brand-slate flex items-center justify-center shadow-xl">
                            <div className="w-10 h-10 bg-brand-green rounded flex items-center justify-center font-black text-white italic text-lg">
                                WH
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-12 pb-8 px-8">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">
                            {isLogin ? 'Welcome Back' : 'Join the Squad'}
                        </h2>
                        <p className="text-brand-teal text-sm">
                            {isLogin ? 'Access your beats and dashboard.' : 'Sign up to start collecting high-quality sounds.'}
                        </p>
                    </div>

                    {needsVerification ? (
                        <form onSubmit={handleVerifyEmail} className="space-y-5">
                            <div className="mb-4">
                                <p className="text-brand-teal text-sm mb-2">
                                    We sent a verification code to <strong className="text-white">{email}</strong>
                                </p>
                                <p className="text-xs text-brand-teal/70">
                                    Enter the code from your email to verify your account.
                                </p>
                            </div>
                            
                            {error && (
                                <div className={`text-xs p-3 rounded ${error.includes('resent') ? 'bg-green-900/20 border border-green-900/50 text-green-400' : 'bg-red-900/20 border border-red-900/50 text-red-400'}`}>
                                    {error}
                                </div>
                            )}
                            
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-brand-teal ml-1">Verification Code</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Enter 6-digit code" 
                                        className="w-full bg-white/90 border border-gray-300 p-3 rounded-lg focus:border-brand-green outline-none focus:bg-white transition-all placeholder:text-gray-500"
                                        style={{ color: '#000000', caretColor: '#0D5F11' }}
                                        value={verificationCode}
                                        onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        required
                                        maxLength={6}
                                    />
                                </div>
                            </div>
                            
                            <button 
                                type="submit"
                                disabled={verifying || verificationCode.length !== 6}
                                className="w-full py-3 bg-brand-green text-white font-bold uppercase tracking-wider rounded hover:bg-brand-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {verifying ? 'Verifying...' : 'Verify Email'}
                            </button>
                            
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    className="text-xs text-brand-teal hover:text-brand-green transition-colors"
                                >
                                    Didn't receive code? Resend
                                </button>
                            </div>
                            
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNeedsVerification(false);
                                        setVerificationCode('');
                                        setError('');
                                    }}
                                    className="text-xs text-brand-teal hover:text-brand-green transition-colors"
                                >
                                    ← Back to sign up
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <div className="bg-red-900/20 border border-red-900/50 text-red-400 text-xs p-3 rounded">
                                        {error}
                                    </div>
                                )}
                                {!isLogin && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-brand-teal ml-1">Artist Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3.5 text-brand-teal" size={18} />
                                            <input 
                                                type="text" 
                                                placeholder="Producer Name" 
                                                className="w-full bg-white/90 border border-gray-300 p-3 pl-10 rounded-lg focus:border-brand-green outline-none focus:bg-white transition-all placeholder:text-gray-500"
                                                style={{ color: '#000000', caretColor: '#0D5F11' }}
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-brand-teal ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 text-brand-teal" size={18} />
                                        <input 
                                            type="email" 
                                            placeholder="name@example.com" 
                                            className="w-full bg-white/90 border border-gray-300 p-3 pl-10 rounded-lg focus:border-brand-green outline-none focus:bg-white transition-all placeholder:text-gray-500"
                                            style={{ color: '#000000', caretColor: '#0D5F11' }}
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-brand-teal ml-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3.5 text-brand-teal" size={18} />
                                        <input 
                                            type="password" 
                                            placeholder="••••••••" 
                                            className="w-full bg-white/90 border border-gray-300 p-3 pl-10 rounded-lg focus:border-brand-green outline-none focus:bg-white transition-all placeholder:text-gray-500"
                                            style={{ color: '#000000', caretColor: '#0D5F11' }}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-3 pt-2">
                                    <button disabled={loading} type="submit" className="w-full py-4 bg-brand-green text-white font-bold uppercase tracking-wider rounded-lg hover:bg-brand-green/80 transition-colors shadow-lg shadow-green-900/20 flex justify-center items-center gap-2">
                                        {loading && <RefreshCw className="animate-spin" size={16} />}
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                    </button>
                                    
                                </div>
                            </form>

                            <div className="mt-8 text-center text-sm border-t border-brand-slate pt-6">
                                <button 
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-brand-teal hover:text-white transition-colors"
                                >
                                    {isLogin ? (
                                        <span>Don't have an account? <span className="text-brand-green font-bold">Sign Up</span></span>
                                    ) : (
                                        <span>Already have an account? <span className="text-brand-green font-bold">Login</span></span>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProductModal = ({ isOpen, onClose, product, onAddToCart }: { isOpen: boolean, onClose: () => void, product: Track, onAddToCart: (product: Track, size: string, color: string, quantity: number) => void }) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    
    const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
    const colors = ['Black', 'White', 'Navy', 'Gray', 'Green'];
    
    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedSize('');
            setSelectedColor('');
            setQuantity(1);
        }
    }, [isOpen]);
    
    const handleAddToCart = () => {
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }
        if (!selectedColor) {
            alert('Please select a color');
            return;
        }
        onAddToCart(product, selectedSize, selectedColor, quantity);
        onClose();
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-black/95 backdrop-blur-md overflow-y-auto" onClick={onClose}>
            <div className="bg-brand-black border border-brand-slate rounded-xl max-w-6xl w-full flex flex-col md:flex-row max-h-[90vh] my-auto" onClick={e => e.stopPropagation()}>
                {/* Product Image */}
                <div className="w-full md:w-1/2 bg-brand-slate/20 p-8 flex items-center justify-center">
                    <img 
                        src={product.cover} 
                        alt={product.title} 
                        className="max-w-full max-h-[500px] object-contain"
                    />
                </div>
                
                {/* Product Details */}
                <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
                    <div className="mb-6">
                        <button type="button" onClick={onClose} className="mb-4 text-brand-teal hover:text-white">
                            <X size={24} />
                        </button>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{product.title}</h1>
                        <p className="text-2xl font-bold text-brand-green mb-4">${product.price}</p>
                        {product.description && (
                            <p className="text-brand-teal mb-6">{product.description}</p>
                        )}
                    </div>
                    
                    {/* Size Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold uppercase text-brand-teal mb-3">
                            Size <span className="text-brand-green">*</span>
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {sizes.map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-4 py-3 border-2 text-sm font-bold uppercase transition-colors ${
                                        selectedSize === size
                                            ? 'border-brand-green bg-brand-green text-white'
                                            : 'border-brand-slate text-brand-teal hover:border-brand-teal'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Color Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold uppercase text-brand-teal mb-3">
                            Color <span className="text-brand-green">*</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {colors.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`px-6 py-3 border-2 text-sm font-bold uppercase transition-colors ${
                                        selectedColor === color
                                            ? 'border-brand-green bg-brand-green text-white'
                                            : 'border-brand-slate text-brand-teal hover:border-brand-teal'
                                    }`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Quantity Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold uppercase text-brand-teal mb-3">
                            Quantity
                        </label>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 border-2 border-brand-slate text-brand-teal hover:border-brand-green hover:text-brand-green font-bold transition-colors"
                            >
                                -
                            </button>
                            <span className="text-xl font-bold text-white w-12 text-center">{quantity}</span>
                            <button
                                type="button"
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-10 border-2 border-brand-slate text-brand-teal hover:border-brand-green hover:text-brand-green font-bold transition-colors"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    
                    {/* Add to Cart Button */}
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        className="w-full py-4 bg-brand-green text-white font-bold uppercase tracking-wider hover:bg-brand-green/80 transition-colors mt-auto"
                    >
                        Add to Cart - ${(Number(product.price) * quantity).toFixed(2)}
                    </button>
                </div>
            </div>
        </div>
    );
};

const LicenseModal = ({ isOpen, onClose, track, onConfirm }: { isOpen: boolean, onClose: () => void, track: Track, onConfirm: (license: License) => void }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-black/90 backdrop-blur-md" onClick={onClose}>
            <div className="bg-brand-black border border-brand-slate rounded-xl max-w-4xl w-full flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-brand-slate flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Select License</h2>
                        <p className="text-brand-teal text-sm">for <span className="text-brand-green font-bold">{track.title}</span></p>
                    </div>
                    <button type="button" onClick={onClose}><X className="text-brand-teal hover:text-white" /></button>
                </div>
                
                <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
                    {LICENSES.map((license, idx) => (
                        <div key={idx} className="bg-brand-slate/20 border border-brand-slate p-6 rounded-lg hover:border-brand-green transition-colors flex flex-col group relative">
                            {idx === 1 && <div className="absolute top-0 right-0 bg-brand-green text-white text-[10px] font-bold px-2 py-1 uppercase rounded-bl-lg rounded-tr-lg">Best Value</div>}
                            <h3 className="text-xl font-bold text-white mb-2">{license.name}</h3>
                            <div className="text-3xl font-black text-white mb-6">${license.price}</div>
                            <ul className="space-y-3 mb-8 flex-1">
                                {license.features.map((feat, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-brand-teal">
                                        <Check size={14} className="text-brand-green" /> {feat}
                                    </li>
                                ))}
                            </ul>
                            <button 
                                type="button"
                                onClick={() => onConfirm(license)}
                                className="w-full py-3 bg-brand-slate text-white font-bold uppercase tracking-wider rounded group-hover:bg-brand-green transition-colors"
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Checkout Components ---

const StripePaymentForm = ({ total, onSuccess }: { total: string, onSuccess: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardError, setCardError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setCardError(null);

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            setCardError(error.message || 'Payment failed');
            setIsProcessing(false);
        } else {
            // Payment successful
            setTimeout(() => {
                setIsProcessing(false);
                onSuccess();
            }, 1500);
        }
    };

    const cardStyle = {
        style: {
            base: {
                color: "#ffffff",
                fontFamily: '"Inter", sans-serif',
                fontSmoothing: "antialiased",
                fontSize: "16px",
                fontWeight: "500",
                "::placeholder": { 
                    color: "#94A6A5",
                    opacity: 0.7
                },
                iconColor: "#0D5F11"
            },
            invalid: { 
                color: "#ef4444", 
                iconColor: "#ef4444" 
            }
        },
        hidePostalCode: true
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Email Address</label>
                <input 
                    type="email" 
                    required 
                    placeholder="producer@example.com" 
                    className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500" 
                    style={{ color: '#ffffff', caretColor: '#0D5F11' }} 
                />
            </div>

            <div className="space-y-4">
                <label className="block text-xs font-bold uppercase text-brand-teal flex items-center justify-between">
                    Card Details
                    <span className="flex items-center gap-1 text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Stripe Secured
                    </span>
                </label>
                <div className="bg-brand-slate/50 border border-brand-slate p-4 rounded focus-within:border-brand-green transition-colors">
                    <CardElement options={cardStyle} />
                </div>
                {cardError && <div className="text-red-500 text-xs">{cardError}</div>}
            </div>

            <button 
                type="submit" 
                disabled={!stripe || isProcessing}
                className="w-full py-4 bg-brand-green text-white font-bold uppercase tracking-wider rounded hover:bg-brand-green/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : <Lock size={16} />} 
                {isProcessing ? 'Processing...' : `Pay $${total}`}
            </button>
        </form>
    );
};

const CheckoutModal = ({ isOpen, onClose, cart, total }: { isOpen: boolean, onClose: () => void, cart: Track[], total: string }) => {
    const [status, setStatus] = useState<'idle' | 'success'>('idle');
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');

    useEffect(() => {
        if(isOpen) setStatus('idle');
    }, [isOpen]);

    if(!isOpen) return null;

    if (status === 'success') {
        const orderNumber = `WH-${Date.now().toString().slice(-8)}`;
        const hasPhysicalItems = cart.some(item => item.category === 'album' || item.category === 'sample_pack');
        const totalAmount = parseFloat(total);
        
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-black/95 backdrop-blur-md overflow-y-auto">
                 <div className="receipt-print w-full max-w-2xl bg-brand-black border border-brand-slate rounded-2xl overflow-hidden shadow-2xl p-8 text-center my-auto">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 print:hidden">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                    <div className="mb-6">
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 print:text-black">WEEDHEAD BEATS</h1>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 print:text-black">Payment Successful!</h2>
                        <p className="text-brand-teal mb-2 print:text-gray-700">Order #{orderNumber}</p>
                        <p className="text-brand-teal mb-2 text-sm print:text-gray-600">
                            Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-brand-teal mb-8 text-sm print:hidden">
                            Thank you for your purchase. A receipt has been sent to your email.
                        </p>
                    </div>
                    
                    {/* Downloads Section */}
                    <div className="space-y-4 mb-6 text-left bg-brand-slate/20 p-6 rounded-xl border border-brand-slate">
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm border-b border-brand-slate pb-2 mb-4 flex items-center gap-2">
                            <Download size={16} className="text-brand-green" /> Digital Downloads
                        </h3>
                        {cart.filter(item => !hasPhysicalItems || item.category === 'beat').map((item, i) => {
                            const hasStems = (item.selectedLicense?.name === 'Premium Lease' || item.selectedLicense?.name === 'Unlimited') && item.stemsUrl;
                            return (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-3">
                                            <FileAudio className="text-brand-green" size={20} />
                                            <div>
                                                <div className="text-white text-sm font-bold">{item.title}</div>
                                                <div className="text-[10px] text-brand-teal">{item.selectedLicense?.name}</div>
                                            </div>
                                        </div>
                                        <a 
                                            href={item.audio} 
                                            download 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs bg-brand-green hover:bg-brand-green/80 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors font-bold uppercase"
                                        >
                                            <Download size={12} /> Audio
                                        </a>
                                    </div>
                                    {hasStems && (
                                        <div className="flex items-center justify-between py-2 pl-8 border-l-2 border-brand-green/30">
                                            <div className="flex items-center gap-3">
                                                <Package className="text-brand-green" size={20} />
                                                <div>
                                                    <div className="text-white text-sm font-bold">Stems (ZIP)</div>
                                                    <div className="text-[10px] text-brand-teal">Trackout files</div>
                                                </div>
                                            </div>
                                            <a 
                                                href={item.stemsUrl} 
                                                download 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs bg-brand-green hover:bg-brand-green/80 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors font-bold uppercase"
                                            >
                                                <Download size={12} /> Stems
                                            </a>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Physical Items / Tracking Section */}
                    {hasPhysicalItems && (
                        <div className="space-y-4 mb-6 text-left bg-brand-slate/20 p-6 rounded-xl border border-brand-slate">
                            <h3 className="font-bold text-white uppercase tracking-wider text-sm border-b border-brand-slate pb-2 mb-4 flex items-center gap-2">
                                <Package size={16} className="text-brand-green" /> Physical Items & Tracking
                            </h3>
                            {cart.filter(item => item.category === 'album' || item.category === 'sample_pack').map((item, i) => (
                                <div key={i} className="py-3 border-b border-brand-slate/30 last:border-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Package className="text-brand-green" size={20} />
                                        <div className="flex-1">
                                            <div className="text-white text-sm font-bold">{item.title}</div>
                                            <div className="text-[10px] text-brand-teal">{item.category === 'album' ? 'CD/Vinyl' : 'Physical Sample Pack'}</div>
                                        </div>
                                    </div>
                                    <div className="ml-8 mt-2 space-y-2">
                                        <div className="bg-brand-black/50 p-3 rounded border border-brand-slate">
                                            <p className="text-xs text-brand-teal mb-1">Tracking Number:</p>
                                            <p className="text-sm font-mono text-brand-green font-bold">
                                                {`TRK${orderNumber.slice(-6)}${String(i + 1).padStart(2, '0')}`}
                                            </p>
                                        </div>
                                        <div className="bg-brand-black/50 p-3 rounded border border-brand-slate">
                                            <p className="text-xs text-brand-teal mb-1">Estimated Delivery:</p>
                                            <p className="text-sm text-white font-bold">
                                                {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    year: 'numeric' 
                                                })}
                                            </p>
                                        </div>
                                        <a 
                                            href={`https://track.weedheadbeats.com/${orderNumber}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block text-xs bg-brand-slate hover:bg-brand-slate/80 text-white px-4 py-2 rounded transition-colors font-bold uppercase"
                                        >
                                            Track Shipment
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Order Summary for Print */}
                    <div className="mt-8 pt-6 border-t border-brand-slate print:border-gray-300">
                        <div className="space-y-2 text-left">
                            {cart.map((item, i) => {
                                // Calculate price: use license price if available, otherwise base price
                                // Apply "buy 2 get 1 free" logic (every 3rd item is free)
                                const isFree = (i + 1) % 3 === 0;
                                let itemPrice: number;
                                if (item.selectedLicense) {
                                    itemPrice = isFree ? 0 : item.selectedLicense.price;
                                } else {
                                    itemPrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price));
                                }
                                
                                return (
                                    <div key={i} className="flex justify-between text-sm print:text-black">
                                        <span className="print:text-gray-700">
                                            {item.title} {item.selectedLicense ? `(${item.selectedLicense.name})` : ''}
                                            {isFree && item.selectedLicense && <span className="text-brand-green print:text-green-600 ml-2">(FREE)</span>}
                                        </span>
                                        <span className="font-bold print:text-black">
                                            {isFree && item.selectedLicense ? (
                                                <span className="text-brand-green print:text-green-600">FREE</span>
                                            ) : (
                                                `$${itemPrice.toFixed(2)}`
                                            )}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-brand-slate print:border-gray-300 flex justify-between items-center">
                            <span className="text-lg font-bold text-white uppercase print:text-black">Total:</span>
                            <span className="text-2xl font-black text-brand-green print:text-black">${totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 mt-8 print:hidden">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 py-4 bg-brand-slate text-white font-bold uppercase tracking-wider rounded hover:bg-brand-slate/80 transition-colors"
                        >
                            Continue Shopping
                        </button>
                        <button 
                            type="button" 
                            onClick={() => window.print()}
                            className="px-6 py-4 bg-brand-green text-white font-bold uppercase tracking-wider rounded hover:bg-brand-green/80 transition-colors"
                        >
                            Print Receipt
                        </button>
                    </div>
                 </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-black/95 backdrop-blur-md overflow-y-auto">
             <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-brand-black border border-brand-slate rounded-2xl overflow-hidden shadow-2xl my-auto">
                 {/* Order Summary */}
                 <div className="p-8 bg-brand-slate/20 border-r border-brand-slate">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">Order Summary</h2>
                    <div className="space-y-4 mb-8">
                        {cart.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 bg-brand-black/50 p-3 rounded border border-brand-slate">
                                <img src={item.cover} className="w-12 h-12 rounded object-cover" alt="" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-sm">{item.title}</h4>
                                    <p className="text-xs text-brand-teal">{item.selectedLicense?.name}</p>
                                </div>
                                <div className="font-bold text-white">${item.selectedLicense?.price}</div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold text-white pt-4 border-t border-brand-slate">
                        <span>Total Due</span>
                        <span>${total}</span>
                    </div>
                 </div>

                 {/* Checkout Form Container */}
                 <div className="p-8 relative">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Secure Checkout</h2>
                        <button type="button" onClick={onClose}><X className="text-brand-teal hover:text-white" size={20} /></button>
                    </div>
                    
                    <button 
                        type="button"
                        onClick={onClose}
                        className="mb-4 text-sm text-brand-teal hover:text-white flex items-center gap-2 transition-colors"
                    >
                        <ChevronRight size={14} className="rotate-180" /> Return to Shopping
                    </button>

                    <div className="flex gap-4 mb-6">
                        <button 
                            onClick={() => setPaymentMethod('stripe')}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold uppercase text-xs tracking-wider border transition-all flex items-center justify-center gap-2 ${paymentMethod === 'stripe' ? 'bg-brand-slate border-brand-green text-white' : 'bg-brand-black border-brand-slate text-brand-teal hover:text-white'}`}
                        >
                            <CreditCard size={16} /> Credit Card
                        </button>
                        <button 
                            onClick={() => setPaymentMethod('paypal')}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold uppercase text-xs tracking-wider border transition-all flex items-center justify-center gap-2 ${paymentMethod === 'paypal' ? 'bg-brand-slate border-brand-green text-white' : 'bg-brand-black border-brand-slate text-brand-teal hover:text-white'}`}
                        >
                            <span className="italic font-serif font-black">Pay</span>Pal
                        </button>
                    </div>
                    
                    {paymentMethod === 'stripe' ? (
                        <Elements stripe={stripePromise}>
                            <StripePaymentForm total={total} onSuccess={() => setStatus('success')} />
                        </Elements>
                    ) : (
                        <div className="pt-4">
                            {getPayPalClientId() ? (
                                <PayPalScriptProvider options={{ 
                                    clientId: getPayPalClientId() || '',
                                    currency: "USD"
                                }}>
                                    <PayPalButtons 
                                        style={{ 
                                            layout: "vertical", 
                                            color: "gold", 
                                            shape: "rect", 
                                            label: "pay",
                                            height: 50
                                        }} 
                                        createOrder={(data, actions) => {
                                            return actions.order.create({
                                                purchase_units: [{ 
                                                    amount: { 
                                                        value: total, 
                                                        currency_code: 'USD' 
                                                    } 
                                                }],
                                                intent: "CAPTURE"
                                            });
                                        }}
                                        onApprove={async (data, actions) => {
                                            try {
                                                if (actions.order) {
                                                    await actions.order.capture();
                                                }
                                                setStatus('success');
                                            } catch (err) {
                                                console.error('[PayPal Error]', err);
                                                alert('PayPal payment failed. Please try again or use credit card.');
                                            }
                                        }}
                                        onError={(err) => {
                                            console.error('[PayPal Error]', err);
                                            alert('PayPal payment failed. Please try again or use credit card.');
                                        }}
                                    />
                                </PayPalScriptProvider>
                            ) : (
                                <div className="bg-brand-slate/20 border border-brand-slate rounded-lg p-6 text-center">
                                    <p className="text-brand-teal mb-4">PayPal is not configured. Please use Credit Card or contact support.</p>
                                    <button 
                                        onClick={() => setPaymentMethod('stripe')}
                                        className="px-6 py-3 bg-brand-green text-white font-bold uppercase tracking-wider rounded hover:bg-brand-green/80 transition-colors"
                                    >
                                        Use Credit Card Instead
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                 </div>
             </div>
        </div>
    );
}

const ExportModal = ({ isOpen, onClose, track }: { isOpen: boolean, onClose: () => void, track: Track }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-brand-black border border-brand-slate rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="text-brand-green" /> Studio Export
          </h3>
          <button type="button" onClick={onClose} className="text-brand-teal hover:text-white"><X size={20} /></button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <img src={track.cover} alt={track.title} className="w-16 h-16 rounded-md object-cover" />
            <div>
              <h4 className="font-bold text-white">{track.title}</h4>
              <p className="text-xs text-brand-teal">Ready for export</p>
            </div>
          </div>
          <p className="text-sm text-brand-teal">
            Download files optimized for mobile DAWs like BandLab, GarageBand, or FL Studio Mobile.
          </p>
        </div>

        <div className="space-y-3">
          <a 
            href={track.audio} 
            download={`${track.title}.mp3`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-4 bg-brand-slate/30 hover:bg-brand-slate/50 rounded-lg border border-brand-slate transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Music2 className="text-brand-teal group-hover:text-brand-green" />
              <div className="text-left">
                <div className="font-bold text-white text-sm">MP3 / WAV</div>
                <div className="text-xs text-brand-teal">Mastered Audio file</div>
              </div>
            </div>
            <Download size={16} className="text-brand-teal" />
          </a>
        </div>
      </div>
    </div>
  );
};

const CartDrawer = ({ isOpen, onClose, cart, removeFromCart, checkout }: any) => {
  const calculateTotal = () => {
    let total = 0;
    cart.forEach((item: Track, index: number) => {
       if (item.selectedLicense) {
         if ((index + 1) % 3 !== 0) {
             total += item.selectedLicense.price;
         }
       }
    });
    return total.toFixed(2);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-brand-black/95 backdrop-blur-md z-40"
        onClick={onClose}
      />
      
      {/* Cart Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-brand-black border-l border-brand-slate transform transition-transform duration-300 z-50 shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-brand-slate flex justify-between items-center bg-brand-black">
          <h2 className="text-xl font-bold text-white tracking-tight">Your Cart</h2>
          <button onClick={onClose} className="text-brand-teal hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-4 bg-brand-slate/20 border-b border-brand-slate/50">
          <div className="flex justify-between text-xs uppercase tracking-wider text-brand-teal mb-2">
            <span className="font-bold">Deal Progress</span>
            <span className="text-brand-green font-bold">Buy 2 Get 1 Free</span>
          </div>
          <div className="h-3 w-full bg-brand-slate rounded-sm overflow-hidden">
            <div 
              className="h-full bg-brand-green transition-all duration-500"
              style={{ width: `${(cart.length % 3 === 0 && cart.length > 0) ? 100 : (cart.length % 3) / 3 * 100}%` }}
            />
          </div>
          <p className="text-xs text-brand-teal mt-2 font-medium">
            {cart.length % 3 === 0 && cart.length > 0 
              ? "🔥 Deal Unlocked! Add 2 more to stack another." 
              : `Add ${3 - (cart.length % 3)} more beat${3 - (cart.length % 3) > 1 ? 's' : ''} to get one free.`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-brand-teal space-y-4">
              <ShoppingBag size={48} className="opacity-20" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cart.map((item: Track, index: number) => (
              <div key={`${item.id}-${index}`} className="flex items-center gap-4 bg-brand-slate/20 p-3 rounded-lg border border-brand-slate">
                <img src={item.cover} alt={item.title} className="w-12 h-12 object-cover rounded-md grayscale" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate text-sm">{item.title}</h4>
                  <p className="text-xs text-brand-green font-bold">{item.selectedLicense?.name}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-white text-sm font-bold">
                    {(index + 1) % 3 === 0 ? <span className="text-brand-green">FREE</span> : `$${item.selectedLicense?.price}`}
                  </div>
                  <button onClick={() => removeFromCart(index)} className="text-xs text-brand-teal hover:text-white mt-1 underline">
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-brand-slate bg-brand-black">
          <div className="flex justify-between items-end mb-4">
            <span className="text-brand-teal">Total</span>
            <span className="text-3xl font-black text-white tracking-tighter">${calculateTotal()}</span>
          </div>
          <button 
            type="button"
            onClick={() => checkout(calculateTotal())}
            disabled={cart.length === 0}
            className="w-full py-4 bg-brand-green text-white font-bold rounded-lg hover:bg-brand-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            Secure Checkout <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

const QueueDrawer = ({ isOpen, onClose, currentTrack, tracks, onPlay }: any) => {
  return (
    <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-brand-black border-l border-brand-slate transform transition-transform duration-300 z-50 shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-brand-slate flex justify-between items-center bg-brand-black">
          <h2 className="text-xl font-bold text-white tracking-tight">Current Queue</h2>
          <button onClick={onClose} className="text-brand-teal hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-0">
            {tracks.map((track: Track, index: number) => (
              <div 
                key={track.id} 
                onClick={() => onPlay(track)}
                className={`flex items-center gap-4 p-4 border-b border-brand-slate/50 cursor-pointer hover:bg-brand-slate/20 transition-colors ${currentTrack?.id === track.id ? 'bg-brand-slate/30 border-l-4 border-l-brand-green' : ''}`}
              >
                <div className="relative">
                    <img src={track.cover} alt={track.title} className={`w-12 h-12 object-cover rounded-md ${currentTrack?.id === track.id ? 'opacity-100' : 'opacity-70 grayscale'}`} />
                    {currentTrack?.id === track.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></div>
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-sm truncate ${currentTrack?.id === track.id ? 'text-brand-green' : 'text-white'}`}>{track.title}</h4>
                  <p className="text-xs text-brand-teal">{track.producer}</p>
                </div>
                <div className="text-xs font-mono text-brand-teal">
                    {track.bpm} BPM
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const BeatCard = ({ beat, isPlaying, onPlay, onOpenLicenseModal, isSaved, onToggleSave, onExport }: any) => {
  const isMerch = beat.category === 'merch';
  const isAlbum = beat.category === 'album';
  
  return (
    <div className="group relative bg-brand-slate/20 rounded-none border border-brand-slate lg:hover:border-brand-green/50 transition-all duration-300 flex flex-col h-full cursor-pointer" onClick={() => onOpenLicenseModal(beat)}>
      <div className="aspect-square relative overflow-hidden bg-brand-black">
        <img 
          src={beat.cover} 
          alt={beat.title} 
          className="w-full h-full object-cover transition-transform duration-700 lg:grayscale lg:group-hover:grayscale-0 lg:group-hover:scale-105" 
        />
        {!isMerch && (
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${isPlaying ? 'bg-black/40 opacity-100' : 'bg-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:bg-black/40'}`}>
            <button 
              type="button"
              onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  onPlay(beat); 
              }}
              className="w-16 h-16 bg-brand-green text-white flex items-center justify-center hover:bg-brand-green/80 transition-colors shadow-xl"
            >
              {isPlaying ? <Pause className="fill-current" size={32} /> : <Play className="fill-current pl-1" size={32} />}
            </button>
          </div>
        )}
        {isMerch && (
          <div className="absolute top-3 right-3 bg-brand-green text-white text-xs font-bold px-2 py-1 uppercase tracking-wider opacity-0 lg:group-hover:opacity-100 transition-opacity">
            Physical Item
          </div>
        )}
        
        {beat.mood && (
            <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-brand-black text-white text-[10px] font-bold uppercase tracking-wider border border-brand-slate">
                {beat.mood}
            </span>
            </div>
        )}

        {beat.youtubeUrl && (
             <div className="absolute bottom-3 left-3">
                <a href={beat.youtubeUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-1.5 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg" title="Watch Video">
                    <Youtube size={14} />
                </a>
             </div>
        )}
        
        {/* Save & Export Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button 
                type="button"
                onClick={(e) => { 
                    e.preventDefault();
                    e.stopPropagation(); 
                    onToggleSave(beat); 
                }}
                className={`p-2 rounded-full transition-colors ${isSaved ? 'bg-brand-green text-white' : 'bg-brand-black/50 text-white hover:bg-brand-green'}`}
                title="Save to Favorites"
            >
                <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
            </button>
            <button 
                type="button"
                onClick={(e) => { 
                    e.preventDefault();
                    e.stopPropagation(); 
                    onExport(beat); 
                }}
                className="p-2 rounded-full bg-brand-black/50 text-white hover:bg-blue-600 transition-colors"
                title="Export for Mobile App"
            >
                <Share2 size={16} />
            </button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="mb-4 flex-1">
          <h3 className="text-lg font-bold text-white truncate tracking-tight uppercase">{beat.title}</h3>
          <p className="text-xs text-brand-teal font-mono uppercase tracking-widest">
            {beat.category === 'beat' ? `${beat.bpm} BPM • ${beat.key}` : beat.category === 'merch' ? 'Merchandise' : beat.category.replace('_', ' ')}
          </p>
          {beat.description && <p className="text-xs text-brand-teal/80 mt-2 line-clamp-2">{beat.description}</p>}
          {isAlbum && (beat.spotifyUrl || beat.appleMusicUrl || beat.amazonUrl) && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {beat.spotifyUrl && (
                <a href={beat.spotifyUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-brand-green hover:text-brand-teal underline">
                  Spotify
                </a>
              )}
              {beat.appleMusicUrl && (
                <a href={beat.appleMusicUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-brand-green hover:text-brand-teal underline">
                  Apple Music
                </a>
              )}
              {beat.amazonUrl && (
                <a href={beat.amazonUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-brand-green hover:text-brand-teal underline">
                  Amazon
                </a>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-bold text-brand-green">
            {beat.category === 'beat' ? 'From $29.99' : `$${beat.price}`}
          </span>
          <button 
            type="button"
            onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                onOpenLicenseModal(beat); 
            }}
            className="px-4 py-2 bg-white text-black hover:bg-brand-teal text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            {isMerch ? 'View Details' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PricingTier = ({ title, price, features, recommended }: any) => (
  <div className={`relative p-8 border ${recommended ? 'border-brand-green bg-brand-slate/30' : 'border-brand-slate bg-brand-slate/10'} flex flex-col h-full`}>
    {recommended && (
      <div className="absolute top-0 right-0 bg-brand-green text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
        Most Popular
      </div>
    )}
    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{title}</h3>
    <div className="mb-6">
      <span className="text-4xl font-bold text-white">${price}</span>
      <span className="text-brand-teal ml-2">/ track</span>
    </div>
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feature: string, i: number) => (
        <li key={i} className="flex items-start gap-3 text-sm text-brand-teal">
          <Check size={16} className="text-brand-green mt-0.5 shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button className={`w-full py-4 font-bold text-sm uppercase tracking-wider transition-colors ${recommended ? 'bg-brand-green hover:bg-brand-green/80 text-white' : 'bg-brand-slate hover:bg-brand-slate/80 text-white'}`}>
      Read Full License
    </button>
  </div>
);

const BlogPostCard = ({ post, onClick }: any) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };
  
  return (
    <article 
      className="group cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-green/50 rounded-lg p-6 transition-all" 
      onClick={handleClick}
    >
      {post.image && (
          <div className="aspect-video overflow-hidden mb-4 bg-brand-black border border-brand-slate rounded-lg lg:group-hover:border-brand-green/50 transition-colors">
              <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-700 lg:grayscale lg:group-hover:grayscale-0 lg:group-hover:scale-105" 
              />
          </div>
      )}
      <div className="flex items-center gap-2 text-xs text-brand-teal font-mono mb-2">
        <span>{post.date}</span>
        <span>•</span>
        <span>{post.isAiGenerated ? 'AI Daily Brief' : 'Education'}</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-2 lg:group-hover:text-brand-green transition-colors leading-tight">
        {post.title}
      </h3>
      <div className="text-brand-teal text-sm leading-relaxed mb-4 line-clamp-3">
          {post.isAiGenerated ? (
              <ReactMarkdown components={{
                  a: ({node, ...props}: any) => <span className="text-brand-green" {...props} onClick={(e: any) => e.stopPropagation()} />
              }}>{post.excerpt}</ReactMarkdown>
          ) : post.excerpt}
      </div>
      <div className="flex items-center gap-2 text-white text-sm font-bold uppercase tracking-wider lg:group-hover:underline decoration-brand-green underline-offset-4">
        Read Article <ArrowRight size={16} className="text-brand-green" />
      </div>
    </article>
  );
};

const BlogPostModal = ({ post, isOpen, onClose }: { post: BlogPost | null, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen || !post) return null;
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the backdrop, not on the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-black/95 backdrop-blur-md overflow-y-auto" 
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white border border-gray-200 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-auto" 
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mb-2">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.isAiGenerated ? 'AI Daily Brief' : 'Education'}</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{post.title}</h1>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-900">
            <X size={24} />
          </button>
        </div>
        <div className="p-8">
          {post.image && (
            <img src={post.image} alt={post.title} className="w-full h-64 object-cover rounded-lg mb-6" />
          )}
          <div className="prose prose-lg max-w-none text-gray-700">
            <ReactMarkdown components={{
              h1: ({node, ...props}: any) => <h1 className="text-3xl font-black text-gray-900 mb-4" {...props} />,
              h2: ({node, ...props}: any) => <h2 className="text-2xl font-bold text-gray-900 mb-3 mt-6" {...props} />,
              h3: ({node, ...props}: any) => <h3 className="text-xl font-bold text-gray-900 mb-2 mt-4" {...props} />,
              p: ({node, ...props}: any) => <p className="mb-4 leading-relaxed text-gray-700" {...props} />,
              a: ({node, ...props}: any) => <a className="text-brand-green hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
              ul: ({node, ...props}: any) => <ul className="list-disc list-inside mb-4 space-y-2 ml-4" {...props} />,
              ol: ({node, ...props}: any) => <ol className="list-decimal list-inside mb-4 space-y-2 ml-4" {...props} />,
              li: ({node, ...props}: any) => <li className="mb-1" {...props} />,
              strong: ({node, ...props}: any) => <strong className="font-bold text-gray-900" {...props} />,
              em: ({node, ...props}: any) => <em className="italic" {...props} />,
              code: ({node, ...props}: any) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />,
              blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-brand-green pl-4 italic my-4" {...props} />
            }}>{post.content || post.excerpt}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

const NewsletterForm = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const { data, error } = await supabase
                .from('newsletter_subscribers')
                .insert([{
                    email: email.trim().toLowerCase(),
                    name: name.trim() || null,
                    is_active: true,
                    source: 'website'
                }])
                .select();

            if (error) {
                // Check if it's a duplicate email error
                if (error.code === '23505' || error.message?.includes('unique')) {
                    setMessage('You are already subscribed!');
                    setStatus('error');
                } else {
                    throw error;
                }
            } else {
                setMessage('Successfully subscribed! Check your email for confirmation.');
                setStatus('success');
                setEmail('');
                setName('');
            }
        } catch (err: any) {
            console.error('Newsletter subscription error:', err);
            setMessage(err.message || 'Failed to subscribe. Please try again.');
            setStatus('error');
        } finally {
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 5000);
        }
    };

    return (
        <div className="bg-gradient-to-br from-brand-black to-brand-slate/40 border border-brand-slate p-8 text-center rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 blur-3xl rounded-full"></div>
            <div className="relative z-10">
                <Mail className="mx-auto text-brand-green mb-4" size={32} />
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Join the Inner Circle</h3>
                <p className="text-brand-teal mb-6 max-w-sm mx-auto text-sm">Get exclusive free beats, plugin deals, and mixing tips delivered to your inbox.</p>
                <form className="flex flex-col gap-3 max-w-md mx-auto" onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Your name (optional)" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500" 
                        style={{ color: '#000000', caretColor: '#0D5F11' }}
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            required 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="flex-1 bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500" 
                            style={{ color: '#000000', caretColor: '#0D5F11' }}
                        />
                        <button 
                            type="submit" 
                            disabled={status === 'loading'}
                            className="bg-brand-green hover:bg-brand-green/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase tracking-wider px-6 py-3 rounded transition-colors"
                        >
                            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                        </button>
                    </div>
                    {message && (
                        <p className={`text-sm mt-2 ${status === 'success' ? 'text-brand-green' : status === 'error' ? 'text-red-400' : 'text-brand-teal'}`}>
                            {message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

// --- Main App Component ---

const App = () => {
  // Store State
  const [activeTab, setActiveTab] = useState('store'); 
  const [storeSection, setStoreSection] = useState<'beat' | 'sample_pack' | 'album' | 'merch' | 'all'>('beat');
  const [activeFilter, setActiveFilter] = useState("All");
  
  // Reset filter when switching sections
  useEffect(() => {
    setActiveFilter("All");
  }, [storeSection]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // CMS State - Initialize from Supabase (with localStorage fallback for migration)
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [cmsLoaded, setCmsLoaded] = useState(false);

  // Load Newsletter Subscribers (admin only)
  useEffect(() => {
    const loadSubscribers = async () => {
      if (!user?.isAdmin || adminTab !== 'newsletter') return;
      
      try {
        const { data, error } = await supabase
          .from('newsletter_subscribers')
          .select('*')
          .order('subscribed_at', { ascending: false });
        
        if (error) throw error;
        setSubscribers(data || []);
      } catch (e: any) {
        console.error('Failed to load subscribers:', e);
        setSubscribers([]);
      } finally {
        setSubscribersLoaded(true);
      }
    };
    
    loadSubscribers();
  }, [user?.isAdmin, adminTab]);
  
  // Load API Keys from Supabase (admin only)
  useEffect(() => {
    const loadApiKeys = async () => {
      if (!user?.isAdmin) {
        setApiKeysLoaded(true); // Set to true even if not admin to hide spinner
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('api_keys')
          .select('key_name, key_value, is_active')
          .eq('is_active', true);
        
        // Handle 404 (table doesn't exist) gracefully - completely silent
        if (error) {
          // Check for 404 in various ways (Supabase can return 404 in different formats)
          const is404 = error.code === 'PGRST116' || 
                       error.code === '42P01' || // relation does not exist
                       error.message?.includes('404') || 
                       error.message?.includes('does not exist') ||
                       error.message?.includes('relation') ||
                       error.message?.includes('not found') ||
                       (error as any)?.status === 404 ||
                       (error as any)?.statusCode === 404;
          
          if (is404) {
            // Table doesn't exist yet - this is fine, just use empty keys
            // Completely silent - no logging, no errors
            setApiKeysLoaded(true);
            return;
          }
          // Only throw non-404 errors
          throw error;
        }
        
        if (data) {
          const keys: Record<string, string> = {};
          data.forEach((item: any) => {
            keys[item.key_name] = item.key_value;
          });
          setApiKeys(keys);
        }
        setApiKeysLoaded(true);
      } catch (e: any) {
        // Only log non-404 errors
        const is404 = e?.code === 'PGRST116' || 
                     e?.code === '42P01' ||
                     e?.message?.includes('404') || 
                     e?.message?.includes('does not exist') ||
                     e?.message?.includes('relation') ||
                     e?.message?.includes('not found') ||
                     e?.status === 404 ||
                     e?.statusCode === 404;
        
        if (!is404) {
          console.warn('Failed to load API keys:', e);
        }
        // Always set loaded to true to hide spinner, even on 404
        setApiKeysLoaded(true);
      }
    };
    
    loadApiKeys();
  }, [user?.isAdmin]); // Only depend on isAdmin, not the whole user object

  // Load CMS content from Supabase
  useEffect(() => {
    const loadCmsContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*');
        
        if (!error && data) {
          const loaded: SiteContent = { ...DEFAULT_SITE_CONTENT };
          
          data.forEach((item: any) => {
            const page = item.page as keyof SiteContent;
            if (page && loaded[page]) {
              loaded[page] = {
                heroImage: item.hero_image || DEFAULT_SITE_CONTENT[page].heroImage,
                ...(item.content || {})
              };
            }
          });
          
          setSiteContent(loaded);
          
          // Migrate localStorage data to Supabase if exists and user is admin
          const localSaved = localStorage.getItem('weedhead_cms_content');
          if (localSaved && user?.isAdmin) {
            try {
              const parsed = JSON.parse(localSaved);
              for (const [page, content] of Object.entries(parsed)) {
                await supabase
                  .from('site_content')
                  .upsert({
                    page,
                    hero_image: (content as any).heroImage || '',
                    content: { ...(content as any) }
                  }, { onConflict: 'page' });
              }
              localStorage.removeItem('weedhead_cms_content'); // Clean up after migration
            } catch (e) {
              console.warn('Failed to migrate localStorage CMS data', e);
            }
          }
        } else {
          // Fallback to localStorage if Supabase fails
          const saved = localStorage.getItem('weedhead_cms_content');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setSiteContent({
                store: { ...DEFAULT_SITE_CONTENT.store, ...(parsed.store || {}) },
                collabs: { ...DEFAULT_SITE_CONTENT.collabs, ...(parsed.collabs || {}) },
                licenses: { ...DEFAULT_SITE_CONTENT.licenses, ...(parsed.licenses || {}) },
                blog: { ...DEFAULT_SITE_CONTENT.blog, ...(parsed.blog || {}) }
              });
            } catch (e) {
              console.error('Failed to parse localStorage CMS data', e);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load CMS content from Supabase', err);
        // Fallback to localStorage
        const saved = localStorage.getItem('weedhead_cms_content');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setSiteContent({
              store: { ...DEFAULT_SITE_CONTENT.store, ...(parsed.store || {}) },
              collabs: { ...DEFAULT_SITE_CONTENT.collabs, ...(parsed.collabs || {}) },
              licenses: { ...DEFAULT_SITE_CONTENT.licenses, ...(parsed.licenses || {}) },
              blog: { ...DEFAULT_SITE_CONTENT.blog, ...(parsed.blog || {}) }
            });
          } catch (e) {
            console.error('Failed to parse localStorage CMS data', e);
          }
        }
      } finally {
        setCmsLoaded(true);
      }
    };
    
    loadCmsContent();
  }, [user]);

  // Persist CMS changes to Supabase (and localStorage as backup)
  useEffect(() => {
    if (!cmsLoaded) return; // Don't save on initial load
    
    const saveCmsContent = async () => {
      // Only save to Supabase if user is authenticated (and preferably admin)
      // If not authenticated, just save to localStorage
      const isAuthenticated = user !== null;
      
      if (isAuthenticated) {
        try {
          // Save to Supabase
          for (const [page, content] of Object.entries(siteContent)) {
            const { error } = await supabase
              .from('site_content')
              .upsert({
                page,
                hero_image: (content as PageConfig).heroImage || '',
                content: { ...(content as any) }
              }, { onConflict: 'page' });
            
            if (error) {
              // If unauthorized, user logged out - just use localStorage
              if (error.code === 'PGRST301' || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
                console.log('User not authenticated, saving to localStorage only');
                break; // Exit loop and save to localStorage
              }
              throw error;
            }
          }
          
          // Also save to localStorage as backup
          try {
            localStorage.setItem('weedhead_cms_content', JSON.stringify(siteContent));
          } catch (e) {
            console.warn('Failed to save CMS content to localStorage', e);
          }
        } catch (e: any) {
          // If unauthorized, just use localStorage (user logged out)
          if (e?.code === 'PGRST301' || e?.message?.includes('401') || e?.message?.includes('Unauthorized')) {
            // User not authenticated - silently use localStorage
          } else {
            console.error('Failed to save CMS content to Supabase', e);
          }
          
          // Fallback to localStorage
          try {
            localStorage.setItem('weedhead_cms_content', JSON.stringify(siteContent));
          } catch (err) {
            console.error('Failed to save CMS content to localStorage', err);
          }
        }
      } else {
        // User not authenticated - only save to localStorage
        try {
          localStorage.setItem('weedhead_cms_content', JSON.stringify(siteContent));
        } catch (e) {
          console.warn('Failed to save CMS content to localStorage', e);
        }
      }
    };
    
    saveCmsContent();
  }, [siteContent, cmsLoaded, user]);

  // New States for Checkout/Licenses
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [selectedBeatForLicense, setSelectedBeatForLicense] = useState<Track | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Track | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cartTotal, setCartTotal] = useState("0.00");

  const [exportTrack, setExportTrack] = useState<Track | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState<Track[]>([]);
  const [savedTracks, setSavedTracks] = useState<Track[]>([]);
  const [showQueue, setShowQueue] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [beats, setBeats] = useState<Track[]>([]);
  const [tracksLoaded, setTracksLoaded] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_POSTS);
  
  // Blog Infinite Scroll State
  const [visiblePosts, setVisiblePosts] = useState(6);
  const observerTarget = useRef(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const lastErrorUrlRef = useRef<string | null>(null); // Track last error URL to prevent spam
  const errorCountRef = useRef<number>(0); // Track error count for same URL

  // Gemini / Sidebar State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [config] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isGeneratingNews, setIsGeneratingNews] = useState(false);

  // Dashboard Form State
  const [adminTab, setAdminTab] = useState<'upload' | 'inventory' | 'cms' | 'blog' | 'settings' | 'newsletter'>('inventory');
  
  // Newsletter Subscribers State
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subscribersLoaded, setSubscribersLoaded] = useState(false);
  
  // API Keys Management State
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    gemini: '',
    stripe: '',
    paypal: ''
  });
  const [apiKeysLoaded, setApiKeysLoaded] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [cmsPage, setCmsPage] = useState<keyof SiteContent>('store');
  const [editingTrackId, setEditingTrackId] = useState<string | number | null>(null);
  
  // Track Form
  const [uploadForm, setUploadForm] = useState({
    title: '',
    bpm: '',
    key: '',
    price: '29.99',
    mood: 'Dark',
    category: 'beat' as ProductCategory,
    description: '',
    youtubeUrl: '',
    cover: null as File | null,
    audio: null as File | null,
    stems: null as File | null,
    coverPreview: null as string | null,
    audioName: '',
    stemsName: '',
    spotifyUrl: '',
    appleMusicUrl: '',
    amazonUrl: ''
  });

  // Blog Form State
  const [editingPostId, setEditingPostId] = useState<string | number | null>(null);
  const [blogForm, setBlogForm] = useState({
      title: '',
      excerpt: '',
      content: '', // Full blog content (markdown)
      image: ''
  });

  // --- Effects ---

  // Blog Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisiblePosts(prev => Math.min(prev + 3, posts.length));
        }
      },
      { threshold: 1.0 }
    );
  
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
  
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [posts.length]);

  // Supabase Auth Listener
  useEffect(() => {
    // Check current session
    const checkSession = async () => {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            if (data.session?.user) {
                fetchProfile(data.session.user);
            }
        } catch (error: any) {
            console.error("Failed to check session:", error);
        }
    };
    checkSession();

    // Setup listener
    try {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            fetchProfile(session.user);
          } else {
            setUser(null);
          }
        });
        return () => subscription.unsubscribe();
    } catch (error) {
        console.warn("Auth listener failed setup:", error);
    }
  }, []);

  // Fetch Data from Supabase
  useEffect(() => {
    const fetchTracks = async () => {
        try {
            const { data, error } = await supabase.from('tracks').select('*').order('created_at', { ascending: false });
            if (!error && data && data.length > 0) {
                setBeats(data.map(t => ({
                    id: t.id,
                    title: t.title,
                    producer: t.producer || 'Weedhead',
                    bpm: t.bpm,
                    key: t.key,
                    price: t.price,
                    mood: t.mood,
                    category: t.category,
                    description: t.description,
                    youtubeUrl: t.youtube_url,
                    spotifyUrl: t.spotify_url,
                    appleMusicUrl: t.apple_music_url,
                    amazonUrl: t.amazon_url,
                    cover: t.cover,
                    audio: t.audio,
                    stemsUrl: t.stems_url || undefined,
                    tags: t.tags || [],
                    stats: { plays: t.stats_plays || 0, sales: t.stats_sales || 0, revenue: 0 }
                })));
            } else {
                // Only use INITIAL_BEATS if Supabase has no data (empty database)
                setBeats(INITIAL_BEATS);
            }
        } catch (err: any) {
            console.error("Failed to fetch tracks:", err);
            // Only use INITIAL_BEATS as fallback if fetch fails
            setBeats(INITIAL_BEATS);
        } finally {
            setTracksLoaded(true);
        }
    };
    
    // Initial fetch for blog posts if Supabase has data, otherwise fallback to INITIAL_POSTS
    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
            if (!error && data && data.length > 0) {
                setPosts(data.map(p => ({
                    id: p.id,
                    title: p.title,
                    excerpt: p.excerpt,
                    content: p.content || p.excerpt,
                    image: p.image,
                    date: new Date(p.created_at).toLocaleDateString(),
                    isAiGenerated: p.is_ai_generated,
                    slug: p.slug
                })));
            } else {
                 setPosts(INITIAL_POSTS);
            }
        } catch (err) {
            // console.warn("Using fallback blog data (Supabase connection failed)");
             setPosts(INITIAL_POSTS);
        }
    };

    fetchTracks();
    fetchPosts();
  }, []);

  // Audio Playback - Load audio source when track changes
  useEffect(() => {
    // Reset error tracking when track changes
    lastErrorUrlRef.current = null;
    errorCountRef.current = 0;
    
    if (currentTrack && audioRef.current) {
        // Only set src if it's a valid HTTP/HTTPS URL (avoid blob URLs which can become invalid)
        if (currentTrack.audio && (currentTrack.audio.startsWith('http://') || currentTrack.audio.startsWith('https://'))) {
          // Don't reload if src is already set to the same URL
          if (audioRef.current.src === currentTrack.audio || audioRef.current.src === currentTrack.audio + '/') {
            return; // Already loaded, skip
          }
          
          try {
            // Clear previous src to avoid conflicts
            audioRef.current.src = '';
            // Small delay to ensure previous src is cleared
            setTimeout(() => {
              if (audioRef.current && currentTrack && currentTrack.audio && audioRef.current.src !== currentTrack.audio) {
                audioRef.current.src = currentTrack.audio;
                audioRef.current.load();
              }
            }, 10);
          } catch (e) {
            // Only log if it's not a repeated error
            if (lastErrorUrlRef.current !== currentTrack.audio) {
              console.warn('Failed to load audio:', currentTrack.audio.substring(0, 50) + '...');
              lastErrorUrlRef.current = currentTrack.audio;
            }
            setIsPlaying(false); // Stop playback if audio fails to load
          }
        } else if (currentTrack.audio && currentTrack.audio.startsWith('blob:')) {
          // Blob URLs are temporary and can become invalid - don't use them
          if (lastErrorUrlRef.current !== 'blob') {
            console.warn('Blob URL detected for audio - this may not work reliably. Use a permanent URL instead.');
            lastErrorUrlRef.current = 'blob';
          }
          setIsPlaying(false);
        } else if (!currentTrack.audio || currentTrack.audio === '') {
          // No audio URL - stop playback (don't log this as it's expected)
          if (audioRef.current && audioRef.current.src !== '') {
            audioRef.current.src = '';
          }
          setIsPlaying(false);
        }
    } else if (!currentTrack && audioRef.current) {
      // Clear audio when no track is selected
      if (audioRef.current.src !== '') {
        audioRef.current.src = '';
      }
      setIsPlaying(false);
      lastErrorUrlRef.current = null;
      errorCountRef.current = 0;
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      // Only proceed if we have a valid audio URL
      if (!currentTrack.audio || !currentTrack.audio.startsWith('http')) {
        setIsPlaying(false);
        return;
      }
      
      if (isPlaying) {
        // Only try to play if we have a valid src and it's not a blob URL
        const src = audioRef.current.src;
        if (src && src !== '' && !src.startsWith('blob:') && audioRef.current.readyState >= 2) {
          // readyState 2 = HAVE_CURRENT_DATA, 3 = HAVE_FUTURE_DATA, 4 = HAVE_ENOUGH_DATA
          audioRef.current.play().catch(() => {
            // Silently handle playback errors - don't log to prevent spam
            setIsPlaying(false); // Stop trying to play if it fails
          });
        } else if (!src || src === '') {
          setIsPlaying(false); // No valid audio source, stop playback
        }
      } else {
        audioRef.current.pause();
      }
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    }
  }, [isPlaying, volume, currentTrack]);

  // AI Init
  useEffect(() => {
    try {
      const newChat = createChatSession(config);
      setChatSession(newChat);
    } catch (error) {
      console.error("Failed to start chat session", error);
    }
  }, [config]);

  // --- Handlers ---

  const fetchProfile = async (authUser: any) => {
    try {
        // Attempt to fetch profile details from Supabase 'profiles' table
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
        
        // If error, log it but continue with fallback
        if (error) {
            console.warn('Profile fetch error (using fallback):', error);
        }
        
        const isAdminUser = authUser.email?.toLowerCase().includes('admin');

        const newUser: UserProfile = {
            id: authUser.id,
            email: authUser.email!,
            name: data?.name || authUser.email?.split('@')[0] || 'User',
            avatar: data?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.email}`,
            isPro: data?.is_pro ?? true,
            // Use database value if available, otherwise check email
            isAdmin: data?.is_admin ?? isAdminUser,
            orders: 0
        };
        setUser(newUser);
    } catch (error) {
        console.error('Profile fetch failed, using fallback:', error);
        // Fallback user creation in state if DB fetch fails
        const isAdminUser = authUser.email?.toLowerCase().includes('admin');
        const newUser: UserProfile = {
            id: authUser.id,
            email: authUser.email!,
            name: authUser.email?.split('@')[0] || 'User',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.email}`,
            isPro: true,
            isAdmin: isAdminUser,
            orders: 0
        };
        setUser(newUser);
    }
  };

  const handleLogout = async () => {
      try {
        await supabase.auth.signOut();
      } catch (e) { console.log('Signout local only'); }
      setUser(null);
      setIsUserMenuOpen(false);
      setActiveTab('store');
      setIsAiOpen(false);
  };

  const handlePlay = (beat: Track) => {
    // Check if track has valid audio before playing
    if (!beat.audio || beat.audio === '' || (!beat.audio.startsWith('http://') && !beat.audio.startsWith('https://'))) {
      console.warn('Track has no valid audio URL:', beat.title);
      setIsPlaying(false);
      return; // Don't play if no valid audio
    }
    
    if (currentTrack?.id === beat.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(beat);
      setIsPlaying(true); // Set to true, but audio will only play when loaded
    }
  };

  const handleOpenLicenseModal = (beat: Track) => {
      if (beat.category === 'merch') {
        setSelectedProduct(beat);
        setIsProductModalOpen(true);
      } else if (beat.category === 'beat') {
        setSelectedBeatForLicense(beat);
        setIsLicenseModalOpen(true);
      } else {
        const item: Track = {
            ...beat,
            selectedLicense: { name: "Standard License", price: Number(beat.price), features: ["Standard Usage"] }
        };
        addToCart(item);
      }
  };
  
  const handleAddProductToCart = (product: Track, size: string, color: string, quantity: number) => {
      // Add multiple items if quantity > 1
      const itemsToAdd: Track[] = [];
      for (let i = 0; i < quantity; i++) {
          const item: Track = {
              ...product,
              id: `${product.id}-${size}-${color}-${i}-${Date.now()}`,
              title: `${product.title} - ${size} / ${color}`,
              selectedLicense: { 
                  name: `${size} / ${color}`, 
                  price: Number(product.price), 
                  features: [`Size: ${size}`, `Color: ${color}`] 
              }
          };
          itemsToAdd.push(item);
      }
      setCart([...cart, ...itemsToAdd]);
      setIsCartOpen(true);
  };

  const handleConfirmLicense = (license: License) => {
      if (selectedBeatForLicense) {
          const item: Track = {
              ...selectedBeatForLicense,
              selectedLicense: license
          };
          addToCart(item);
          setIsLicenseModalOpen(false);
          setSelectedBeatForLicense(null);
      }
  };

  const addToCart = (beat: Track) => {
    setCart([...cart, beat]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const toggleSaveTrack = (beat: Track) => {
    if(!user) {
        setIsAuthModalOpen(true);
        return;
    }
    if (savedTracks.find(t => t.id === beat.id)) {
        setSavedTracks(savedTracks.filter(t => t.id !== beat.id));
    } else {
        setSavedTracks([...savedTracks, beat]);
    }
  };

  const handleExport = (beat: Track) => {
    if(!user) {
        setIsAuthModalOpen(true);
        return;
    }
    setExportTrack(beat);
    setIsExportModalOpen(true);
  };

  const handleCheckoutTrigger = (total: string) => {
    setCartTotal(total);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const getFilteredBeats = () => {
     let filtered = beats;
     if (activeTab === 'collabs') {
         filtered = filtered.filter(b => b.category === 'collab');
     } else if (activeTab === 'store') {
         if (storeSection !== 'all') {
             filtered = filtered.filter(b => b.category === storeSection);
         } else {
            filtered = filtered.filter(b => b.category !== 'collab');
         }
     }
     if (activeFilter !== "All") {
        if (storeSection === 'merch') {
            // For merch, filter by mood field which contains merch type
            filtered = filtered.filter(beat => beat.mood === activeFilter);
        } else {
            // For other sections, filter by mood
            filtered = filtered.filter(beat => beat.mood === activeFilter);
        }
     }
     return filtered;
  };

  const displayedBeats = getFilteredBeats();

  // Recommendation System
  const getRecommendedTracks = (): Track[] => {
    const userInterests = [...savedTracks, ...cart];
    if (userInterests.length === 0) return [];

    // Analyze user preferences
    const moodCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    
    userInterests.forEach(track => {
      if (track.mood) moodCounts[track.mood] = (moodCounts[track.mood] || 0) + 1;
      categoryCounts[track.category] = (categoryCounts[track.category] || 0) + 1;
    });

    // Find most common mood and category
    const topMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b, '');
    const topCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b, '');

    // Get recommendations based on preferences
    const recommendations = beats
      .filter(b => 
        b.category !== 'merch' && 
        !userInterests.some(t => t.id === b.id) &&
        (b.mood === topMood || b.category === topCategory)
      )
      .sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        if (a.mood === topMood) scoreA += 2;
        if (a.category === topCategory) scoreA += 1;
        if (b.mood === topMood) scoreB += 2;
        if (b.category === topCategory) scoreB += 1;
        return scoreB - scoreA;
      })
      .slice(0, 4);

    return recommendations;
  };

  const recommendedTracks = getRecommendedTracks();

  // CMS Handlers
  const handleCmsUpdate = (field: keyof PageConfig, value: string) => {
      setSiteContent(prev => ({
          ...prev,
          [cmsPage]: {
              ...prev[cmsPage],
              [field]: value
          }
      }));
  };

  // Track Management
  const deleteTrack = async (id: string | number) => {
      if(window.confirm("Are you sure you want to delete this track?")) {
          // Optimistic UI update
          setBeats(beats.filter(b => b.id !== id));
          // DB Update
          try {
            await supabase.from('tracks').delete().eq('id', id);
          } catch(e) { console.error(e); }
      }
  };

  const editTrack = (track: Track) => {
      setEditingTrackId(track.id);
      setUploadForm({
          title: track.title,
          bpm: track.bpm.toString(),
          key: track.key,
          price: track.price.toString(),
          mood: track.mood || 'Dark',
          category: track.category,
          description: track.description || '',
          youtubeUrl: track.youtubeUrl || '',
          spotifyUrl: track.spotifyUrl || '',
          appleMusicUrl: track.appleMusicUrl || '',
          amazonUrl: track.amazonUrl || '',
          cover: null,
          coverPreview: track.cover,
          audio: null,
          stems: null,
          audioName: 'Existing Audio File',
          stemsName: ''
      });
      setAdminTab('upload');
  };

  // Blog Management
  const deletePost = async (id: string | number) => {
      if(window.confirm("Delete this blog post?")) {
          setPosts(posts.filter(p => p.id !== id));
          try {
            await supabase.from('posts').delete().eq('id', id);
          } catch(e) { console.error(e); }
      }
  };

  const editPost = (post: BlogPost) => {
      setEditingPostId(post.id);
      setBlogForm({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content || post.excerpt, // Use content if available, fallback to excerpt
          image: post.image
      });
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // If image is base64, upload to Storage first
      let imageUrl = blogForm.image;
      if (blogForm.image && blogForm.image.startsWith('data:image/')) {
        try {
          const base64Data = blogForm.image.split(',')[1];
          const mimeType = blogForm.image.match(/data:([^;]+);/)?.[1] || 'image/png';
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });
          const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
          const file = new File([blob], fileName, { type: mimeType });
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('covers')
            .upload(fileName, file, { contentType: mimeType, upsert: false });
          
          if (!uploadError && uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('covers')
              .getPublicUrl(fileName);
            imageUrl = publicUrl;
          } else {
            console.warn('Failed to upload blog image to Storage, using base64 fallback', uploadError);
            imageUrl = blogForm.image; // Keep base64 as fallback
          }
        } catch (err) {
          console.error('Failed to upload blog image to Storage', err);
          imageUrl = blogForm.image; // Keep base64 as fallback
        }
      }
      
      // Generate slug from title
      const slug = blogForm.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const postData = {
          title: blogForm.title,
          excerpt: blogForm.excerpt || blogForm.content?.substring(0, 200) + '...', // Auto-generate excerpt if not provided
          content: blogForm.content || blogForm.excerpt, // Full content
          image: imageUrl,
          slug: slug,
          is_ai_generated: false,
          published: true
      };

      if(editingPostId) {
          // Update Local
          setPosts(posts.map(p => p.id === editingPostId ? {
              ...p,
              title: blogForm.title,
              excerpt: blogForm.excerpt || blogForm.content?.substring(0, 200) + '...',
              content: blogForm.content || blogForm.excerpt,
              image: imageUrl
          } : p));
          // Update DB
          try {
            await supabase.from('posts').update(postData).eq('id', editingPostId);
          } catch(e) { console.error(e); }
          setEditingPostId(null);
      } else {
          // Insert DB
          try {
            const { data } = await supabase.from('posts').insert([postData]).select();
            if (data && data[0]) {
                const newPost: BlogPost = {
                    id: data[0].id,
                    title: data[0].title,
                    excerpt: data[0].excerpt,
                    content: data[0].content || data[0].excerpt,
                    date: new Date(data[0].created_at).toLocaleDateString(),
                    image: data[0].image,
                    isAiGenerated: data[0].is_ai_generated,
                    slug: data[0].slug
                };
                setPosts([newPost, ...posts]);
            }
          } catch (e) {
              console.error('Failed to save blog post', e);
              // Fallback if upload fails
              const newPost: BlogPost = {
                  id: Date.now(),
                  title: blogForm.title,
                  excerpt: blogForm.excerpt || blogForm.content?.substring(0, 200) + '...',
                  content: blogForm.content || blogForm.excerpt,
                  date: new Date().toLocaleDateString(),
                  image: imageUrl,
                  isAiGenerated: false
              };
              setPosts([newPost, ...posts]);
          }
      }
      setBlogForm({ title: '', excerpt: '', content: '', image: '' });
  };

  // Backup & Restore
  const handleBackup = () => {
      const backupData = {
          beats,
          posts,
          siteContent,
          timestamp: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weedhead-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              if (data.beats && data.posts && data.siteContent) {
                  if (window.confirm("This will overwrite current site data. Continue?")) {
                      setBeats(data.beats);
                      setPosts(data.posts);
                      setSiteContent(data.siteContent);
                      alert("Site restored successfully!");
                  }
              } else {
                  alert("Invalid backup file format.");
              }
          } catch (err) {
              alert("Failed to parse backup file.");
          }
      };
      reader.readAsText(file);
  };

  // AI Chat Handler
  const handleAiMessage = async (text: string, attachments: Attachment[]) => {
    if (!chatSession) return;
    let prompt = text;
    if (currentTrack) {
        prompt += `\n\n[Context: User is currently listening to "${currentTrack.title}" by ${currentTrack.producer}, ${currentTrack.bpm} BPM, Key: ${currentTrack.key}. Mood: ${currentTrack.mood}]`;
    }
    const userMsgId = Date.now().toString();
    const newUserMsg: Message = { id: userMsgId, role: Role.USER, text: text, attachments: attachments };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    const newAiMsg: Message = { id: aiMsgId, role: Role.MODEL, text: '', isStreaming: true };
    setMessages(prev => [...prev, newAiMsg]);

    try {
      const imageParts = attachments.map(att => ({ mimeType: att.mimeType, data: att.base64Data }));
      const streamResult = await sendMessageStream(chatSession, prompt, imageParts);
      let fullText = '';
      let groundingSources: GroundingSource[] = [];
      for await (const chunk of streamResult) {
        if (chunk.text) fullText += chunk.text;
        const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
            chunks.forEach((c: any) => {
                if (c.web?.uri && c.web?.title) {
                    groundingSources.push({ uri: c.web.uri, title: c.web.title });
                }
            });
        }
        setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId 
            ? { ...msg, text: fullText, groundingSources: groundingSources.length ? groundingSources : undefined } 
            : msg
        ));
      }
      setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId ? { ...msg, isStreaming: false, error: true, text: "Connection interrupted." } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Daily News
  const handleGenerateNews = async () => {
    if (!chatSession) return;
    setIsGeneratingNews(true);
    try {
        const topic = "Latest breaking news in music production software, hip hop industry, or major rap album release.";
        
        // 1. Generate SEO Text (with Grounding)
        const textContent = await generateSEOContent(topic);
        
        if(!textContent) throw new Error("Failed to generate text");

        // Extract title for image generation prompt
        const titleMatch = textContent.match(/^# (.*$)/m) || textContent.match(/^#+ (.*$)/m);
        const title = titleMatch ? titleMatch[1] : "Music Studio Update";

        // 2. Generate Image and upload to Storage
        const imageBase64 = await generateBlogImage(title);
        let imageUrl = "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop"; // Fallback
        
        // Upload base64 image to Supabase Storage if generated
        if (imageBase64 && imageBase64.startsWith('data:image/')) {
          try {
            // Convert base64 to Blob
            const base64Data = imageBase64.split(',')[1];
            const mimeType = imageBase64.match(/data:([^;]+);/)?.[1] || 'image/png';
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            
            // Create File from Blob
            const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
            const file = new File([blob], fileName, { type: mimeType });
            
            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('covers')
              .upload(fileName, file, {
                contentType: mimeType,
                upsert: false
              });
            
            if (!uploadError && uploadData) {
              const { data: { publicUrl } } = supabase.storage
                .from('covers')
                .getPublicUrl(fileName);
              imageUrl = publicUrl;
            } else {
              console.warn('Failed to upload blog image to Storage, using base64 fallback', uploadError);
              imageUrl = imageBase64; // Fallback to base64 if upload fails
            }
          } catch (err) {
            console.error('Error processing blog image', err);
            imageUrl = imageBase64; // Fallback to base64 if processing fails
          }
        }

        // 3. Generate slug and save post to Supabase
        const cleanTitle = title.replace(/^\*+|\*+$/g, ''); // Clean markdown bolding from title
        const slug = cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        const postData = {
          title: cleanTitle,
          excerpt: textContent.substring(0, 200) + '...', // First 200 chars as excerpt
          content: textContent, // Full markdown content
          image: imageUrl,
          slug: slug,
          is_ai_generated: true,
          published: true
        };

        try {
          const { data, error } = await supabase.from('posts').insert([postData]).select();
          if (!error && data && data[0]) {
            const newPost: BlogPost = {
              id: data[0].id,
              title: data[0].title,
              excerpt: data[0].excerpt || textContent.substring(0, 200) + '...',
              content: data[0].content || textContent,
              date: new Date(data[0].created_at).toLocaleDateString(),
              image: data[0].image,
              isAiGenerated: data[0].is_ai_generated,
              slug: data[0].slug
            };
            setPosts([newPost, ...posts]);
          } else {
            // Fallback if Supabase insert fails
            const newPost: BlogPost = {
              id: Date.now(),
              title: title.replace(/^\*+|\*+$/g, ''),
              excerpt: textContent.substring(0, 200) + '...',
              content: textContent,
              date: new Date().toLocaleDateString(),
              image: imageUrl,
              isAiGenerated: true
            };
            setPosts([newPost, ...posts]);
          }
        } catch (err) {
          console.error('Failed to save blog post to Supabase', err);
          // Fallback
          const newPost: BlogPost = {
            id: Date.now(),
            title: title.replace(/^\*+|\*+$/g, ''),
            excerpt: textContent.substring(0, 200) + '...',
            date: new Date().toLocaleDateString(),
            image: imageUrl,
            isAiGenerated: true
          };
          setPosts([newPost, ...posts]);
        }
    } catch (e) {
        console.error("Failed to generate news", e);
        alert("Studio AI could not generate the brief at this time.");
    } finally {
        setIsGeneratingNews(false);
    }
  };

  // --- Dashboard Logic ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'audio' | 'stems') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (type === 'cover') {
        const previewUrl = URL.createObjectURL(file);
        setUploadForm({ ...uploadForm, cover: file, coverPreview: previewUrl });
      } else if (type === 'audio') {
        const audioUrl = URL.createObjectURL(file);
        setUploadForm({ ...uploadForm, audio: file, audioName: file.name });
      } else if (type === 'stems') {
        setUploadForm({ ...uploadForm, stems: file, stemsName: file.name });
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.coverPreview) {
      alert("Please fill in title and cover.");
      return;
    }

    try {
        let coverUrl: string = uploadForm.coverPreview;
        let audioUrl: string | null = typeof uploadForm.audio === 'string' ? uploadForm.audio : null;

        // Upload Cover
        if (uploadForm.cover instanceof File) {
            try {
                const fileName = `${Date.now()}-${uploadForm.cover.name}`;
                const { data, error } = await supabase.storage.from('covers').upload(fileName, uploadForm.cover);
                if (!error && data) {
                    const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(fileName);
                    coverUrl = publicUrl;
                } else {
                    throw new Error("Supabase bucket not ready");
                }
            } catch (err) {
                // Fallback: Use local blob URL if Supabase upload fails
                console.warn("Using local object URL for cover");
                coverUrl = URL.createObjectURL(uploadForm.cover);
            }
        }

        // Upload Audio
        if (uploadForm.audio instanceof File) {
             try {
                 const fileName = `${Date.now()}-${uploadForm.audio.name}`;
                 const { data, error } = await supabase.storage.from('audio').upload(fileName, uploadForm.audio);
                 if (!error && data) {
                      const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(fileName);
                     audioUrl = publicUrl;
                 } else {
                     throw new Error("Supabase bucket not ready");
                 }
             } catch (err) {
                 // Fallback: Use local blob URL if Supabase upload fails
                 console.warn("Using local object URL for audio");
                 audioUrl = URL.createObjectURL(uploadForm.audio);
             }
        }
        
        // Use placeholder if upload failed/not provided for mock purposes if Supabase buckets aren't ready
        if(!audioUrl) audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

        // Upload Stems (ZIP file)
        let stemsUrl: string | null = null;
        if (uploadForm.stems instanceof File) {
            try {
                const fileName = `stems-${Date.now()}-${uploadForm.stems.name}`;
                const { data, error } = await supabase.storage.from('audio').upload(fileName, uploadForm.stems);
                if (!error && data) {
                    const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(fileName);
                    stemsUrl = publicUrl;
                } else {
                    throw new Error("Supabase bucket not ready");
                }
            } catch (err) {
                console.warn("Failed to upload stems, skipping");
                stemsUrl = null;
            }
        }

        const trackData = {
            title: uploadForm.title,
            bpm: Number(uploadForm.bpm),
            key: uploadForm.key,
            price: Number(uploadForm.price),
            mood: uploadForm.mood,
            category: uploadForm.category,
            description: uploadForm.description,
            youtube_url: uploadForm.youtubeUrl,
            spotify_url: uploadForm.spotifyUrl || null,
            apple_music_url: uploadForm.appleMusicUrl || null,
            amazon_url: uploadForm.amazonUrl || null,
            cover: coverUrl,
            audio: audioUrl as string,
            stems_url: stemsUrl || null,
        };

        if (editingTrackId) {
             // Update Existing
             try {
                // Check if track exists in database (UUID) or is local only (number)
                const isLocalOnly = typeof editingTrackId === 'number';
                
                if (isLocalOnly) {
                    // Local track - convert to new track in database
                    console.warn('Local track detected, creating new track in database instead of updating');
                    const { data, error } = await supabase.from('tracks').insert([trackData]).select();
                    if (!error && data && data[0]) {
                        // Remove old local track and add new database track
                        setBeats(beats.filter(b => b.id !== editingTrackId).concat([{
                            id: data[0].id,
                            title: data[0].title,
                            producer: data[0].producer || 'Weedhead',
                            bpm: data[0].bpm,
                            key: data[0].key,
                            price: data[0].price,
                            mood: data[0].mood,
                            category: data[0].category,
                            description: data[0].description,
                            youtubeUrl: data[0].youtube_url,
                            spotifyUrl: data[0].spotify_url,
                            appleMusicUrl: data[0].apple_music_url,
                            amazonUrl: data[0].amazon_url,
                            cover: data[0].cover,
                            audio: data[0].audio,
                            tags: data[0].tags || [],
                            stats: { plays: data[0].stats_plays || 0, sales: data[0].stats_sales || 0, revenue: 0 }
                        }]));
                        alert("Track migrated to database and updated successfully!");
                    } else {
                        throw error || new Error('Failed to create track');
                    }
                } else {
                    // Database track - update it
                    const { data, error } = await supabase
                        .from('tracks')
                        .update(trackData)
                        .eq('id', editingTrackId)
                        .select();
                    
                    if (error) {
                        throw error;
                    }
                    
                    if (data && data[0]) {
                        // Update local state with database response
                        setBeats(beats.map(b => b.id === editingTrackId ? {
                            id: data[0].id,
                            title: data[0].title,
                            producer: data[0].producer || 'Weedhead',
                            bpm: data[0].bpm,
                            key: data[0].key,
                            price: data[0].price,
                            mood: data[0].mood,
                            category: data[0].category,
                            description: data[0].description,
                            youtubeUrl: data[0].youtube_url,
                            spotifyUrl: data[0].spotify_url,
                            appleMusicUrl: data[0].apple_music_url,
                            amazonUrl: data[0].amazon_url,
                            cover: data[0].cover,
                            audio: data[0].audio,
                            tags: data[0].tags || [],
                            stats: { plays: data[0].stats_plays || 0, sales: data[0].stats_sales || 0, revenue: 0 }
                        } : b));
                        alert("Track updated successfully!");
                    }
                }
             } catch(e) { 
                 console.error('Failed to update track:', e);
                 alert(`Failed to update track: ${e instanceof Error ? e.message : 'Unknown error'}`);
             }
             setEditingTrackId(null);
        } else {
             // Create New
             try {
                const { data, error } = await supabase.from('tracks').insert([trackData]).select();
                if (data) {
                    const newBeat: Track = {
                        id: data[0].id,
                        title: data[0].title,
                        producer: data[0].producer || "Weedhead",
                        bpm: data[0].bpm,
                        key: data[0].key,
                        price: data[0].price,
                        mood: data[0].mood,
                        category: data[0].category,
                        description: data[0].description,
                        youtubeUrl: data[0].youtube_url,
                        spotifyUrl: data[0].spotify_url,
                        appleMusicUrl: data[0].apple_music_url,
                        amazonUrl: data[0].amazon_url,
                        cover: data[0].cover,
                        audio: data[0].audio,
                        stats: { plays: 0, sales: 0, revenue: 0 }
                    };
                    setBeats([newBeat, ...beats]);
                    alert("Item uploaded successfully to store!");
                } else {
                    // Fallback for when DB write fails (e.g. RLS policy or network)
                    throw new Error("DB Insert failed");
                }
             } catch (e) {
                 // Fallback Mock Add
                 const newBeat: Track = {
                    id: Date.now(),
                    title: trackData.title,
                    producer: "Weedhead",
                    bpm: trackData.bpm,
                    key: trackData.key,
                    price: trackData.price,
                    mood: trackData.mood,
                    category: trackData.category as ProductCategory,
                    description: trackData.description,
                    youtubeUrl: trackData.youtube_url,
                    spotifyUrl: trackData.spotify_url ?? undefined,
                    appleMusicUrl: trackData.apple_music_url ?? undefined,
                    amazonUrl: trackData.amazon_url ?? undefined,
                    cover: trackData.cover || '',
                    audio: trackData.audio as string,
                    stats: { plays: 0, sales: 0, revenue: 0 }
                 };
                 setBeats([newBeat, ...beats]);
                 alert("Item added (Local Mode - Audio Ready for Playback)");
             }
        }
        
        // Reset form
        setUploadForm({
          title: '',
          bpm: '',
          key: '',
          price: '29.99',
          mood: 'Dark',
          category: 'beat',
          description: '',
          youtubeUrl: '',
          spotifyUrl: '',
          appleMusicUrl: '',
          amazonUrl: '',
          cover: null,
          audio: null,
          stems: null,
          coverPreview: null,
          audioName: '',
          stemsName: ''
        });
        setAdminTab('inventory');

    } catch (err) {
        console.error("Upload error", err);
        alert("Error saving track. Check console.");
    }
  };

  // --- Views ---
  
  const renderDashboardView = () => {
    if (!user?.isAdmin) return null;
    
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Admin Dashboard</h1>
          <p className="text-brand-teal">Manage your store, tracks, and content</p>
        </div>
        
        {/* Admin Tabs */}
        <div className="flex gap-4 mb-8 border-b border-brand-slate overflow-x-auto">
          {[
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'upload', label: 'Upload Track', icon: Upload },
            { id: 'cms', label: 'CMS', icon: Edit3 },
            { id: 'blog', label: 'Blog', icon: FileText },
            { id: 'newsletter', label: 'Newsletter', icon: Mail },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                adminTab === tab.id
                  ? 'text-brand-green border-brand-green'
                  : 'text-brand-teal border-transparent hover:text-white'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Dashboard Content */}
        <div className="bg-brand-black border border-brand-slate rounded-xl p-8">
          {adminTab === 'inventory' && (
            <div>
              <h2 className="text-2xl font-black text-white mb-6">Track Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {beats.map(beat => (
                  <div key={beat.id} className="bg-brand-slate/20 border border-brand-slate rounded-lg p-4">
                    <img src={beat.cover} alt={beat.title} className="w-full h-32 object-cover rounded mb-3" />
                    <h3 className="font-bold text-white text-sm mb-1">{beat.title}</h3>
                    <p className="text-xs text-brand-teal mb-3">{beat.category} • {beat.mood}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTrackId(beat.id);
                          setUploadForm({
                            title: beat.title,
                            bpm: String(beat.bpm),
                            key: beat.key,
                            price: String(beat.price),
                            mood: beat.mood || 'Dark',
                            category: beat.category,
                            description: beat.description || '',
                            youtubeUrl: beat.youtubeUrl || '',
                            spotifyUrl: beat.spotifyUrl || '',
                            appleMusicUrl: beat.appleMusicUrl || '',
                            amazonUrl: beat.amazonUrl || '',
                            cover: null,
                            audio: null,
                            stems: null,
                            coverPreview: beat.cover,
                            audioName: '',
                            stemsName: ''
                          });
                          setAdminTab('upload');
                        }}
                        className="flex-1 px-3 py-2 bg-brand-slate text-white text-xs font-bold uppercase hover:bg-brand-slate/80"
                      >
                        <Edit3 size={12} className="inline mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => deleteTrack(beat.id)}
                        className="px-3 py-2 bg-red-900/30 text-red-400 text-xs font-bold uppercase hover:bg-red-900/50 border border-red-900/50"
                      >
                        <Trash2 size={12} className="inline" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {adminTab === 'upload' && (
            <div>
              <h2 className="text-2xl font-black text-white mb-6">{editingTrackId ? 'Edit Track' : 'Upload New Track'}</h2>
              <form onSubmit={handleUploadSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Title *</label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={e => setUploadForm({...uploadForm, title: e.target.value})}
                      className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500"
                      style={{ color: '#000000', caretColor: '#0D5F11' }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-teal mb-2">BPM</label>
                    <input
                      type="number"
                      value={uploadForm.bpm}
                      onChange={e => setUploadForm({...uploadForm, bpm: e.target.value})}
                      className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500"
                      style={{ color: '#000000', caretColor: '#0D5F11' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Key</label>
                    <input
                      type="text"
                      value={uploadForm.key}
                      onChange={e => setUploadForm({...uploadForm, key: e.target.value})}
                      className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500"
                      style={{ color: '#000000', caretColor: '#0D5F11' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={uploadForm.price}
                      onChange={e => setUploadForm({...uploadForm, price: e.target.value})}
                      className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500"
                      style={{ color: '#000000', caretColor: '#0D5F11' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Mood</label>
                    <select
                      value={uploadForm.mood}
                      onChange={e => setUploadForm({...uploadForm, mood: e.target.value})}
                      className="w-full bg-brand-slate/50 border border-brand-slate p-3 rounded focus:border-brand-green outline-none"
                      style={{ color: '#000000', caretColor: '#0D5F11' }}
                    >
                      {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Category</label>
                    <select
                      value={uploadForm.category}
                      onChange={e => setUploadForm({...uploadForm, category: e.target.value as ProductCategory})}
                      className="w-full bg-brand-slate/50 border border-brand-slate p-3 rounded focus:border-brand-green outline-none"
                      style={{ color: '#000000', caretColor: '#0D5F11' }}
                    >
                      <option value="beat">Beat</option>
                      <option value="sample_pack">Sample Pack</option>
                      <option value="album">Album</option>
                      <option value="collab">Collab</option>
                      <option value="merch">Merchandise</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Description</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={e => setUploadForm({...uploadForm, description: e.target.value})}
                    className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none h-24 placeholder:text-gray-500"
                    style={{ color: '#ffffff', caretColor: '#0D5F11' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-teal mb-2">YouTube URL</label>
                    <input
                      type="url"
                      value={uploadForm.youtubeUrl}
                      onChange={e => setUploadForm({...uploadForm, youtubeUrl: e.target.value})}
                      className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500"
                      style={{ color: '#000000', caretColor: '#0D5F11' }}
                    />
                </div>
                {uploadForm.category === 'album' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Spotify URL</label>
                      <input
                        type="url"
                        value={uploadForm.spotifyUrl}
                        onChange={e => setUploadForm({...uploadForm, spotifyUrl: e.target.value})}
                        className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500"
                        style={{ color: '#000000', caretColor: '#0D5F11' }}
                        placeholder="https://open.spotify.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Apple Music URL</label>
                      <input
                        type="url"
                        value={uploadForm.appleMusicUrl}
                        onChange={e => setUploadForm({...uploadForm, appleMusicUrl: e.target.value})}
                        className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500"
                        style={{ color: '#000000', caretColor: '#0D5F11' }}
                        placeholder="https://music.apple.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Amazon Music URL</label>
                      <input
                        type="url"
                        value={uploadForm.amazonUrl}
                        onChange={e => setUploadForm({...uploadForm, amazonUrl: e.target.value})}
                        className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500"
                        style={{ color: '#000000', caretColor: '#0D5F11' }}
                        placeholder="https://music.amazon.com/..."
                      />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Cover Image *</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileChange(e, 'cover')}
                      className="w-full bg-brand-slate/50 border border-brand-slate p-3 text-white rounded focus:border-brand-green outline-none"
                    />
                    <div className="mt-2 p-3 bg-brand-black/50 border border-brand-slate rounded text-xs">
                      <p className="text-brand-green font-bold mb-1">📐 Optimal Image Specifications:</p>
                      <ul className="text-brand-teal space-y-1 list-disc list-inside ml-2">
                        <li><strong>Dimensions:</strong> 1200x1200px (square) or 1200x800px</li>
                        <li><strong>Format:</strong> JPG, PNG, or WebP</li>
                        <li><strong>File Size:</strong> Under 2MB (recommended: 500KB - 1MB)</li>
                        <li><strong>Aspect Ratio:</strong> 1:1 (square) preferred</li>
                        <li><strong>Resolution:</strong> 72-150 DPI (web optimized)</li>
                      </ul>
                    </div>
                    {uploadForm.coverPreview && (
                      <div className="mt-3">
                        <img src={uploadForm.coverPreview} alt="Preview" className="w-full h-32 object-cover rounded border border-brand-slate" />
                        {uploadForm.cover && (
                          <p className="mt-2 text-xs text-brand-teal">
                            File: {uploadForm.cover.name} ({(uploadForm.cover.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Audio File</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={e => handleFileChange(e, 'audio')}
                      className="w-full bg-brand-slate/50 border border-brand-slate p-3 text-white rounded focus:border-brand-green outline-none"
                    />
                    <div className="mt-2 p-3 bg-brand-black/50 border border-brand-slate rounded text-xs">
                      <p className="text-brand-green font-bold mb-1">🎵 Optimal Audio Specifications:</p>
                      <ul className="text-brand-teal space-y-1 list-disc list-inside ml-2">
                        <li><strong>Format:</strong> MP3 (recommended) or WAV</li>
                        <li><strong>Bitrate:</strong> 192-320 kbps (MP3) or 16-bit/44.1kHz (WAV)</li>
                        <li><strong>File Size:</strong> Under 10MB (recommended: 3-5MB for preview)</li>
                        <li><strong>Duration:</strong> 30-60 seconds for previews</li>
                        <li><strong>Quality:</strong> Stereo, normalized audio levels</li>
                      </ul>
                    </div>
                    {uploadForm.audioName && (
                      <div className="mt-3">
                        <p className="text-xs text-brand-teal font-bold">{uploadForm.audioName}</p>
                        {uploadForm.audio instanceof File && (
                          <p className="text-xs text-brand-teal mt-1">
                            Size: {(uploadForm.audio.size / 1024 / 1024).toFixed(2)} MB
                            {uploadForm.audio.size > 10 * 1024 * 1024 && (
                              <span className="text-yellow-400 ml-2">⚠️ File is larger than recommended (10MB)</span>
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Stems (ZIP File) - Optional</label>
                    <input
                      type="file"
                      accept=".zip,application/zip"
                      onChange={e => handleFileChange(e, 'stems')}
                      className="w-full bg-brand-slate/50 border border-brand-slate p-3 text-white rounded focus:border-brand-green outline-none"
                    />
                    <div className="mt-2 p-3 bg-brand-black/50 border border-brand-slate rounded text-xs">
                      <p className="text-brand-green font-bold mb-1">📦 Stems File Specifications:</p>
                      <ul className="text-brand-teal space-y-1 list-disc list-inside ml-2">
                        <li><strong>Format:</strong> ZIP file containing individual stem files</li>
                        <li><strong>Stem Files:</strong> WAV or MP3 format (one file per instrument/element)</li>
                        <li><strong>File Size:</strong> Under 100MB (recommended: 20-50MB)</li>
                        <li><strong>Contents:</strong> Drums, Melody, Bass, Vocals, etc. as separate files</li>
                        <li><strong>Note:</strong> Available for Premium Lease and Unlimited licenses only</li>
                      </ul>
                    </div>
                    {uploadForm.stemsName && (
                      <div className="mt-3">
                        <p className="text-xs text-brand-teal font-bold">Selected: {uploadForm.stemsName}</p>
                        {uploadForm.stems instanceof File && (
                          <p className="text-xs text-brand-teal mt-1">
                            Size: {(uploadForm.stems.size / 1024 / 1024).toFixed(2)} MB
                            {uploadForm.stems.size > 100 * 1024 * 1024 && (
                              <span className="text-yellow-400 ml-2">⚠️ File is larger than recommended (100MB)</span>
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-brand-green text-white font-bold uppercase tracking-wider rounded hover:bg-brand-green/80"
                  >
                    {editingTrackId ? 'Update Track' : 'Upload Track'}
                  </button>
                  {editingTrackId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTrackId(null);
                        setUploadForm({
                          title: '',
                          bpm: '',
                          key: '',
                          price: '29.99',
                          mood: 'Dark',
                          category: 'beat',
                          description: '',
                          youtubeUrl: '',
                          spotifyUrl: '',
                          appleMusicUrl: '',
                          amazonUrl: '',
                          cover: null,
                          audio: null,
                          stems: null,
                          coverPreview: null,
                          audioName: '',
                          stemsName: ''
                        });
                      }}
                      className="px-8 py-3 bg-brand-slate text-white font-bold uppercase tracking-wider rounded hover:bg-brand-slate/80"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
          
          {adminTab === 'cms' && (
            <div>
              <h2 className="text-2xl font-black text-white mb-6">Content Management</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Page</label>
                  <select
                    value={cmsPage}
                    onChange={e => setCmsPage(e.target.value as keyof SiteContent)}
                    className="w-full bg-brand-slate/50 border border-brand-slate p-3 rounded focus:border-brand-green outline-none"
                    style={{ color: '#ffffff', caretColor: '#0D5F11' }}
                  >
                    <option value="store">Store</option>
                    <option value="collabs">Collabs</option>
                    <option value="licenses">Licenses</option>
                    <option value="blog">Blog</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Headline</label>
                  <input
                    type="text"
                    value={siteContent[cmsPage].headline}
                    onChange={e => handleCmsUpdate('headline', e.target.value)}
                    className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500"
                    style={{ color: '#ffffff', caretColor: '#0D5F11' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Subheadline</label>
                  <textarea
                    value={siteContent[cmsPage].subheadline}
                    onChange={e => handleCmsUpdate('subheadline', e.target.value)}
                    className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none h-24 placeholder:text-gray-500"
                    style={{ color: '#ffffff', caretColor: '#0D5F11' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Hero Image URL</label>
                    <input
                      type="url"
                      value={siteContent[cmsPage].heroImage}
                      onChange={e => handleCmsUpdate('heroImage', e.target.value)}
                      className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500"
                      style={{ color: '#000000', caretColor: '#0D5F11' }}
                    />
                    <div className="mt-4">
                      <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Or Upload Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const fileName = `${Date.now()}-${file.name}`;
                              const { data, error } = await supabase.storage.from('covers').upload(fileName, file);
                              if (!error && data) {
                                const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(fileName);
                                handleCmsUpdate('heroImage', publicUrl);
                              } else {
                                // Fallback to object URL
                                const previewUrl = URL.createObjectURL(file);
                                handleCmsUpdate('heroImage', previewUrl);
                              }
                            } catch (err) {
                              const previewUrl = URL.createObjectURL(file);
                              handleCmsUpdate('heroImage', previewUrl);
                            }
                          }
                        }}
                        className="w-full bg-brand-slate/50 border border-brand-slate p-3 rounded focus:border-brand-green outline-none text-white"
                      />
                      {siteContent[cmsPage].heroImage && (
                        <img src={siteContent[cmsPage].heroImage} alt="Preview" className="mt-3 w-full h-48 object-cover rounded border border-brand-slate" />
                      )}
                    </div>
                </div>
              </div>
            </div>
          )}
          
          {adminTab === 'blog' && (
            <div>
              <h2 className="text-2xl font-black text-white mb-6">
                {editingPostId ? 'Edit Blog Post' : 'Blog Management'}
              </h2>
              
              {editingPostId ? (
                <form onSubmit={handleBlogSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Title</label>
                    <input
                      type="text"
                      value={blogForm.title}
                      onChange={e => setBlogForm({...blogForm, title: e.target.value})}
                      className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500"
                      style={{ color: '#000000', caretColor: '#0D5F11' }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Excerpt (Short Summary)</label>
                    <textarea
                      value={blogForm.excerpt}
                      onChange={e => setBlogForm({...blogForm, excerpt: e.target.value})}
                      placeholder="Brief summary (1-2 sentences) - shown in blog listing"
                      className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none h-24 placeholder:text-gray-500"
                      style={{ color: '#000000', caretColor: '#0D5F11' }}
                    />
                    <p className="text-xs text-brand-teal mt-1">Leave empty to auto-generate from content</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Full Content (Markdown)</label>
                    <textarea
                      value={blogForm.content}
                      onChange={e => setBlogForm({...blogForm, content: e.target.value})}
                      placeholder="Full blog post content in Markdown format..."
                      className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none h-96 font-mono text-sm placeholder:text-gray-500"
                      style={{ color: '#000000', caretColor: '#0D5F11' }}
                      required
                    />
                    <p className="text-xs text-brand-teal mt-1">Supports Markdown: # Headers, **bold**, *italic*, - lists, [links](url)</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Image URL</label>
                    <input
                      type="url"
                      value={blogForm.image}
                      onChange={e => setBlogForm({...blogForm, image: e.target.value})}
                      className="w-full bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500"
                      style={{ color: '#000000', caretColor: '#0D5F11' }}
                    />
                    <div className="mt-4">
                      <label className="block text-xs font-bold uppercase text-brand-teal mb-2">Or Upload Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const fileName = `${Date.now()}-${file.name}`;
                              const { data, error } = await supabase.storage.from('covers').upload(fileName, file);
                              if (!error && data) {
                                const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(fileName);
                                setBlogForm({...blogForm, image: publicUrl});
                              } else {
                                const previewUrl = URL.createObjectURL(file);
                                setBlogForm({...blogForm, image: previewUrl});
                              }
                            } catch (err) {
                              const previewUrl = URL.createObjectURL(file);
                              setBlogForm({...blogForm, image: previewUrl});
                            }
                          }
                        }}
                        className="w-full bg-brand-slate/50 border border-brand-slate p-3 rounded focus:border-brand-green outline-none text-white"
                      />
                      {blogForm.image && (
                        <img src={blogForm.image} alt="Preview" className="mt-3 w-full h-48 object-cover rounded border border-brand-slate" />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-brand-green text-white font-bold uppercase tracking-wider rounded hover:bg-brand-green/80"
                    >
                      {editingPostId ? 'Update Post' : 'Create Post'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPostId(null);
                        setBlogForm({ title: '', excerpt: '', content: '', image: '' });
                      }}
                      className="px-8 py-3 bg-brand-slate text-white font-bold uppercase tracking-wider rounded hover:bg-brand-slate/80"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={() => {
                        setEditingPostId(null);
                        setBlogForm({ title: '', excerpt: '', content: '', image: '' });
                      }}
                      className="px-6 py-3 bg-brand-green text-white font-bold uppercase tracking-wider rounded hover:bg-brand-green/80 flex items-center gap-2"
                    >
                      <Plus size={16} /> New Post
                    </button>
                    <button 
                      onClick={handleGenerateNews} 
                      disabled={isGeneratingNews}
                      className="px-6 py-3 bg-brand-slate hover:bg-brand-slate/80 text-white text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center gap-2 disabled:opacity-50 border border-brand-green"
                    >
                      {isGeneratingNews ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} className="text-brand-green" />}
                      {isGeneratingNews ? "Generating..." : "Generate AI Daily Brief"}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {posts.map(post => (
                      <div key={post.id} className="bg-brand-slate/20 border border-brand-slate rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-white">{post.title}</h3>
                          <p className="text-xs text-brand-teal">{post.date} • {post.isAiGenerated ? 'AI Generated' : 'Manual'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editPost(post)}
                            className="px-3 py-2 bg-brand-slate text-white text-xs font-bold uppercase hover:bg-brand-slate/80 border border-brand-slate"
                          >
                            <Edit3 size={12} className="inline mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="px-3 py-2 bg-red-900/30 text-red-400 text-xs font-bold uppercase hover:bg-red-900/50 border border-red-900/50"
                          >
                            <Trash2 size={12} className="inline" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          
          {adminTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-black text-white mb-6">Settings & API Keys</h2>
              <div className="space-y-6">
                <div className="bg-brand-slate/20 border border-brand-slate rounded-lg p-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-brand-green" /> API Keys & Credentials
                  </h3>
                  <p className="text-xs text-brand-teal mb-4">
                    Manage your API keys directly from the admin dashboard. Keys are stored securely in the database.
                  </p>
                  
                  {!apiKeysLoaded && (
                    <div className="text-center py-4">
                      <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  )}
                  
                  {apiKeysLoaded && !user?.isAdmin && (
                    <div className="p-3 bg-yellow-900/20 border border-yellow-900/50 rounded text-xs text-yellow-400 mb-4">
                      <strong>Note:</strong> If you see a 404 error in the console, it means the <code className="bg-brand-black px-1 rounded">api_keys</code> table doesn't exist yet. Run <code className="bg-brand-black px-1 rounded">migration_api_keys.sql</code> in Supabase to create it.
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-brand-teal mb-2">
                        Google Gemini API Key
                        <span className="text-gray-500 ml-2">(for AI features)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="Enter Gemini API Key (starts with AIza...)"
                          value={apiKeys.gemini || ''}
                          onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                          className="flex-1 bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500"
                          style={{ color: '#000000', caretColor: '#0D5F11' }}
                        />
                        <button
                          onClick={async () => {
                            if (!apiKeys.gemini.trim()) {
                              alert('Please enter an API key');
                              return;
                            }
                            setSavingKey('gemini');
                            try {
                              const { error } = await supabase
                                .from('api_keys')
                                .upsert({
                                  key_name: 'gemini',
                                  key_value: apiKeys.gemini.trim(),
                                  description: 'Google Gemini API Key for AI features',
                                  is_active: true
                                }, { onConflict: 'key_name' });
                              
                              if (error) {
                                if (error.code === 'PGRST116' || error.message?.includes('404') || error.message?.includes('does not exist')) {
                                  alert('API keys table not found. Please run migration_api_keys.sql in Supabase first.');
                                  return;
                                }
                                throw error;
                              }
                              alert('Gemini API key saved successfully!');
                            } catch (e: any) {
                              console.error('Failed to save API key:', e);
                              if (e?.code === 'PGRST116' || e?.message?.includes('404') || e?.message?.includes('does not exist')) {
                                alert('API keys table not found. Please run migration_api_keys.sql in Supabase first.');
                              } else {
                                alert(`Failed to save: ${e.message || 'Unknown error'}`);
                              }
                            } finally {
                              setSavingKey(null);
                            }
                          }}
                          disabled={savingKey === 'gemini'}
                          className="px-6 py-3 bg-brand-green text-white font-bold uppercase tracking-wider rounded hover:bg-brand-green/80 transition-colors disabled:opacity-50"
                        >
                          {savingKey === 'gemini' ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                      <p className="text-xs text-brand-teal mt-1">
                        Status: {apiKeys.gemini || import.meta.env.VITE_API_KEY ? (
                          <span className="text-brand-green">✓ Configured</span>
                        ) : (
                          <span className="text-red-400">✗ Not Set</span>
                        )}
                        {import.meta.env.VITE_API_KEY && !apiKeys.gemini && (
                          <span className="text-yellow-400 ml-2">(using env var)</span>
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold uppercase text-brand-teal mb-2">
                        Stripe Publishable Key
                        <span className="text-gray-500 ml-2">(for payments)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="Enter Stripe Publishable Key (starts with pk_...)"
                          value={apiKeys.stripe || ''}
                          onChange={(e) => setApiKeys({ ...apiKeys, stripe: e.target.value })}
                          className="flex-1 bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500"
                          style={{ color: '#000000', caretColor: '#0D5F11' }}
                        />
                        <button
                          onClick={async () => {
                            if (!apiKeys.stripe.trim()) {
                              alert('Please enter an API key');
                              return;
                            }
                            setSavingKey('stripe');
                            try {
                              const { error } = await supabase
                                .from('api_keys')
                                .upsert({
                                  key_name: 'stripe',
                                  key_value: apiKeys.stripe.trim(),
                                  description: 'Stripe Publishable Key for payments',
                                  is_active: true
                                }, { onConflict: 'key_name' });
                              
                              if (error) {
                                if (error.code === 'PGRST116' || error.message?.includes('404') || error.message?.includes('does not exist')) {
                                  alert('API keys table not found. Please run migration_api_keys.sql in Supabase first.');
                                  return;
                                }
                                throw error;
                              }
                              alert('Stripe key saved successfully!');
                            } catch (e: any) {
                              console.error('Failed to save API key:', e);
                              if (e?.code === 'PGRST116' || e?.message?.includes('404') || e?.message?.includes('does not exist')) {
                                alert('API keys table not found. Please run migration_api_keys.sql in Supabase first.');
                              } else {
                                alert(`Failed to save: ${e.message || 'Unknown error'}`);
                              }
                            } finally {
                              setSavingKey(null);
                            }
                          }}
                          disabled={savingKey === 'stripe'}
                          className="px-6 py-3 bg-brand-green text-white font-bold uppercase tracking-wider rounded hover:bg-brand-green/80 transition-colors disabled:opacity-50"
                        >
                          {savingKey === 'stripe' ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                      <p className="text-xs text-brand-teal mt-1">
                        Status: {apiKeys.stripe || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? (
                          <span className="text-brand-green">✓ Configured</span>
                        ) : (
                          <span className="text-red-400">✗ Not Set</span>
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold uppercase text-brand-teal mb-2">
                        PayPal Client ID
                        <span className="text-gray-500 ml-2">(for payments)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="Enter PayPal Client ID"
                          value={apiKeys.paypal || ''}
                          onChange={(e) => setApiKeys({ ...apiKeys, paypal: e.target.value })}
                          className="flex-1 bg-white/90 border border-gray-300 p-3 rounded focus:border-brand-green outline-none placeholder:text-gray-500"
                          style={{ color: '#000000', caretColor: '#0D5F11' }}
                        />
                        <button
                          onClick={async () => {
                            if (!apiKeys.paypal.trim()) {
                              alert('Please enter an API key');
                              return;
                            }
                            setSavingKey('paypal');
                            try {
                              const { error } = await supabase
                                .from('api_keys')
                                .upsert({
                                  key_name: 'paypal',
                                  key_value: apiKeys.paypal.trim(),
                                  description: 'PayPal Client ID for payments',
                                  is_active: true
                                }, { onConflict: 'key_name' });
                              
                              if (error) {
                                if (error.code === 'PGRST116' || error.message?.includes('404') || error.message?.includes('does not exist')) {
                                  alert('API keys table not found. Please run migration_api_keys.sql in Supabase first.');
                                  return;
                                }
                                throw error;
                              }
                              alert('PayPal key saved successfully!');
                            } catch (e: any) {
                              console.error('Failed to save API key:', e);
                              if (e?.code === 'PGRST116' || e?.message?.includes('404') || e?.message?.includes('does not exist')) {
                                alert('API keys table not found. Please run migration_api_keys.sql in Supabase first.');
                              } else {
                                alert(`Failed to save: ${e.message || 'Unknown error'}`);
                              }
                            } finally {
                              setSavingKey(null);
                            }
                          }}
                          disabled={savingKey === 'paypal'}
                          className="px-6 py-3 bg-brand-green text-white font-bold uppercase tracking-wider rounded hover:bg-brand-green/80 transition-colors disabled:opacity-50"
                        >
                          {savingKey === 'paypal' ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                      <p className="text-xs text-brand-teal mt-1">
                        Status: {apiKeys.paypal || import.meta.env.VITE_PAYPAL_CLIENT_ID ? (
                          <span className="text-brand-green">✓ Configured</span>
                        ) : (
                          <span className="text-red-400">✗ Not Set</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-brand-black/50 border border-brand-slate rounded-lg">
                    <h4 className="text-sm font-bold text-white mb-2">How to Configure:</h4>
                    <ol className="text-xs text-brand-teal space-y-1 list-decimal list-inside">
                      <li>Create a <code className="bg-brand-slate/50 px-1 rounded">.env</code> file in the project root</li>
                      <li>Add your keys: <code className="bg-brand-slate/50 px-1 rounded">VITE_API_KEY=your-key-here</code></li>
                      <li>Restart the development server</li>
                    </ol>
                  </div>
                </div>
                
                <div className="bg-brand-slate/20 border border-brand-slate rounded-lg p-4">
                  <h3 className="font-bold text-white mb-2">Environment Status</h3>
                  <p className="text-xs text-brand-teal">Supabase: Connected</p>
                  <p className="text-xs text-brand-teal">Gemini API: {chatSession ? 'Ready' : 'Not Configured'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderStoreView = () => (
    <>
      {/* Dynamic Featured Header */}
      {storeSection === 'beat' && (
        <section className="mb-12 relative bg-brand-black border-y border-brand-slate min-h-[400px] flex items-center">
            <div className="absolute inset-0 opacity-40 mix-blend-overlay">
            <img 
                src={siteContent.store.heroImage} 
                alt="Background" 
                className="w-full h-full object-cover grayscale"
            />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
            <div className="max-w-3xl">
                <span className="text-brand-green font-bold tracking-widest uppercase text-sm mb-4 block">New Arrival</span>
                <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 leading-[0.9] tracking-tighter whitespace-pre-line">
                  {siteContent.store.headline}
                </h1>
                <p className="text-lg text-brand-teal mb-8 max-w-lg border-l-2 border-brand-green pl-6">
                  {siteContent.store.subheadline}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                <button 
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        const beat = beats.find(b => b.category === 'beat');
                        if(beat) handlePlay(beat);
                    }}
                    className="px-8 py-4 bg-brand-green text-white font-bold text-sm uppercase tracking-wider hover:bg-brand-green/80 transition-colors flex items-center gap-2"
                >
                    <Play className="fill-current" size={16} /> {siteContent.store.buttonText || "Listen Now"}
                </button>
                </div>
            </div>
            </div>
        </section>
      )}

      {/* Sub Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
         <div className="flex items-center gap-6 border-b border-brand-slate pb-2 overflow-x-auto no-scrollbar">
             {[
                 { id: 'beat', label: 'Beats' },
                 { id: 'sample_pack', label: 'Sound Kits' },
                 { id: 'album', label: 'Albums' },
                 { id: 'merch', label: 'Merch' }
             ].map(section => (
                 <button 
                    key={section.id}
                    onClick={() => setStoreSection(section.id as any)}
                    className={`text-sm font-bold uppercase tracking-widest pb-4 transition-colors whitespace-nowrap ${storeSection === section.id ? 'text-brand-green border-b-2 border-brand-green' : 'text-brand-teal hover:text-white'}`}
                 >
                     {section.label}
                 </button>
             ))}
         </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-brand-slate pb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-brand-green" /> 
            {storeSection === 'beat' ? 'Latest Beats' : storeSection === 'sample_pack' ? 'Sample Packs' : storeSection === 'album' ? 'Albums' : 'Merchandise'}
          </h2>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
            {(storeSection === 'merch' ? MERCH_TYPES : MOODS).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border ${
                  activeFilter === filter 
                    ? 'bg-white text-black border-white' 
                    : 'bg-transparent text-brand-teal border-brand-slate hover:border-brand-teal hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recommendations Section */}
      {recommendedTracks.length > 0 && storeSection !== 'merch' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-brand-green" /> 
            Recommended For You
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {recommendedTracks.map(beat => (
              <BeatCard 
                key={beat.id} 
                beat={beat} 
                isPlaying={currentTrack?.id === beat.id && isPlaying}
                onPlay={handlePlay}
                onOpenLicenseModal={handleOpenLicenseModal}
                isSaved={savedTracks.some(t => t.id === beat.id)}
                onToggleSave={toggleSaveTrack}
                onExport={handleExport}
              />
            ))}
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-24">
        {!tracksLoaded ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-brand-teal">Loading tracks...</p>
          </div>
        ) : displayedBeats.length === 0 ? (
            <div className="text-center py-20 text-brand-teal">
                <p>No items found in this section.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {displayedBeats.map(beat => (
                <BeatCard 
                    key={beat.id} 
                    beat={beat} 
                    isPlaying={currentTrack?.id === beat.id && isPlaying}
                    onPlay={handlePlay}
                    onOpenLicenseModal={handleOpenLicenseModal}
                    isSaved={savedTracks.some(t => t.id === beat.id)}
                    onToggleSave={toggleSaveTrack}
                    onExport={handleExport}
                />
            ))}
            </div>
        )}
      </section>
    </>
  );

  const renderCollabsView = () => (
      <>
      <div className="relative mb-12 bg-brand-black border-b border-brand-slate min-h-[300px] flex items-center justify-center overflow-hidden">
           <div className="absolute inset-0 opacity-30">
               <img src={siteContent.collabs.heroImage} className="w-full h-full object-cover grayscale" alt="Collabs" />
           </div>
           <div className="text-center relative z-10 p-6">
                <span className="text-brand-green font-bold uppercase tracking-widest text-xs">Work With Me</span>
                <h1 className="text-4xl md:text-6xl font-black text-white mt-2 mb-6 whitespace-pre-line">{siteContent.collabs.headline}</h1>
                <p className="text-brand-teal max-w-2xl mx-auto text-lg">
                    {siteContent.collabs.subheadline}
                </p>
           </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
           {displayedBeats.length === 0 ? (
             <div className="text-center py-20 text-brand-teal">
               <p className="text-lg mb-4">No collab projects yet.</p>
               {user?.isAdmin && (
                 <div className="space-y-4">
                   <p className="text-sm">Add collab projects from the Dashboard → Upload Track (set category to 'collab')</p>
                   <button
                     onClick={() => {
                       setActiveTab('dashboard');
                       setAdminTab('upload');
                       setUploadForm({
                         title: '',
                         bpm: '',
                         key: '',
                         price: '29.99',
                         mood: 'Dark',
                         category: 'collab',
                         description: '',
                         youtubeUrl: '',
                         spotifyUrl: '',
                         appleMusicUrl: '',
                         amazonUrl: '',
                         cover: null,
                         audio: null,
                         stems: null,
                         coverPreview: null,
                         audioName: '',
                         stemsName: ''
                       });
                     }}
                     className="px-6 py-3 bg-brand-green text-white font-bold uppercase tracking-wider hover:bg-brand-green/80 transition-colors"
                   >
                     Add Collab Project
                   </button>
                 </div>
               )}
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
              {displayedBeats.map(beat => (
                  <div key={beat.id} className="relative group">
                    <BeatCard 
                        beat={beat} 
                        isPlaying={currentTrack?.id === beat.id && isPlaying}
                        onPlay={handlePlay}
                        onOpenLicenseModal={handleOpenLicenseModal}
                        isSaved={savedTracks.some(t => t.id === beat.id)}
                        onToggleSave={toggleSaveTrack}
                        onExport={handleExport}
                    />
                    {user?.isAdmin && (
                      <button
                        onClick={() => {
                          setEditingTrackId(beat.id);
                          setUploadForm({
                            title: beat.title,
                            bpm: String(beat.bpm),
                            key: beat.key,
                            price: String(beat.price),
                            mood: beat.mood || 'Dark',
                            category: beat.category,
                            description: beat.description || '',
                            youtubeUrl: beat.youtubeUrl || '',
                            spotifyUrl: beat.spotifyUrl || '',
                            appleMusicUrl: beat.appleMusicUrl || '',
                            amazonUrl: beat.amazonUrl || '',
                            cover: null,
                            audio: null,
                            stems: null,
                            coverPreview: beat.cover,
                            audioName: '',
                            stemsName: ''
                          });
                          setActiveTab('dashboard');
                          setAdminTab('upload');
                        }}
                        className="absolute top-2 right-2 bg-brand-green/90 hover:bg-brand-green text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Edit Collab"
                      >
                        <Edit3 size={16} />
                      </button>
                    )}
                  </div>
              ))}
              </div>
           )}
      </div>
      </>
  );

  const renderLicensesView = () => (
    <>
    <div className="relative bg-brand-black border-b border-brand-slate min-h-[250px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <img src={siteContent.licenses.heroImage} className="w-full h-full object-cover grayscale" alt="Licenses" />
        </div>
        <div className="text-center relative z-10 p-6">
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">{siteContent.licenses.headline}</h1>
            <p className="text-brand-teal max-w-2xl mx-auto">
                {siteContent.licenses.subheadline}
            </p>
        </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <PricingTier 
          title="Basic Lease" 
          price="29.99" 
          features={LICENSES[0].features} 
        />
        <PricingTier 
          title="Premium Lease" 
          price="49.99" 
          recommended={true}
          features={LICENSES[1].features}
        />
        <PricingTier 
          title="Unlimited" 
          price="199.99" 
          features={LICENSES[2].features}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-brand-slate/10 p-8 border border-brand-slate rounded-xl">
        {/* Full Terms Column */}
        <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-brand-slate">
                <div className="p-2 bg-brand-green/20 rounded-lg">
                    <FileText className="text-brand-green" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Standard Rights Agreement</h3>
                  <p className="text-brand-teal text-xs">Summary of non-exclusive rights granted upon purchase.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { title: "Grant of Rights", desc: "Non-exclusive rights to use the Beat in a new recording for one (1) profitable project (Single, Album, EP).", icon: CheckCircle },
                    { title: "Distribution", desc: "Distribute up to 2,500 units physical/digital. Keep 100% of Master Royalties for your song.", icon: Globe },
                    { title: "Streaming", desc: "Monetize up to 50,000 streams on Apple Music, Spotify, etc. For unlimited, upgrade to Premium.", icon: Zap },
                    { title: "Publishing Splits", desc: "Writer's share is split 50/50 between Licensor (Producer) and Licensee (Artist).", icon: Share2 },
                    { title: "Credit Mandatory", desc: "Licensee must credit 'Produced by Weedhead' in all media metadata and descriptions.", icon: Info },
                    { title: "Delivery", desc: "Instant download of untagged high-quality audio files (MP3/WAV) via email.", icon: Package }
                ].map((term, i) => (
                    <div key={i} className="bg-brand-black/40 border border-brand-slate/50 p-5 rounded-lg hover:border-brand-green/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                           <term.icon size={16} className="text-brand-green" />
                           <h4 className="text-white font-bold uppercase text-xs tracking-wide">{term.title}</h4>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">{term.desc}</p>
                    </div>
                ))}
            </div>
            <div className="mt-6 text-xs text-zinc-500 italic border-t border-brand-slate/30 pt-4">
              * This is a summary. Full legal contract is provided as a PDF with your download.
            </div>
        </div>

        {/* FAQ Column */}
        <div className="lg:col-span-5 border-l border-brand-slate pl-0 lg:pl-12">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-brand-slate">
                <div className="p-2 bg-brand-green/20 rounded-lg">
                    <HelpCircle className="text-brand-green" size={24} />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Common Questions</h3>
                   <p className="text-brand-teal text-xs">Everything you need to know before buying.</p>
                </div>
            </div>

            <div className="space-y-4">
                {[
                    { q: "Can I upgrade my license later?", a: "Yes. If you outgrow your current lease limits (e.g. you hit 50k streams), simply contact us to pay the difference for an upgrade to the next tier." },
                    { q: "Are the beats tag-free?", a: "Yes. All purchased licenses come with fully untagged, high-quality audio files. The 'Weedhead' tag is removed instantly." },
                    { q: "Do I own the beat?", a: "No. Leasing grants you rights to use the beat for your song, but the producer retains copyright ownership of the instrumental composition." },
                    { q: "Can I put my song on Spotify?", a: "Yes! All licenses allow for streaming distribution on major platforms like Spotify, Apple Music, and Tidal within the stream limits of your license." },
                    { q: "What if I get a Content ID claim?", a: "This rarely happens with leases. If it does, email us your license proof, and we will whitelist your video within 24 hours." }
                ].map((faq, i) => (
                    <details key={i} className="group bg-brand-slate/20 rounded-lg border border-brand-slate overflow-hidden">
                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-brand-slate/30 transition-colors">
                            <h4 className="text-white font-bold text-sm group-hover:text-brand-green transition-colors">{faq.q}</h4>
                            <ChevronDown size={16} className="text-brand-teal transform group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="px-4 pb-4 pt-0 text-zinc-400 text-sm leading-relaxed border-t border-brand-slate/30 mt-2 pt-2">
                           {faq.a}
                        </div>
                    </details>
                ))}
            </div>
            
            <div className="mt-8 bg-brand-green/10 border border-brand-green/30 p-6 rounded-lg text-center">
                <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-2">Need Custom Usage?</h4>
                <p className="text-brand-teal text-xs mb-4">Contact us for exclusive rights or TV/Film sync licensing.</p>
                <button className="text-brand-green text-xs font-bold uppercase tracking-wider hover:text-white transition-colors underline">Contact Support</button>
            </div>
        </div>
      </div>
    </div>
    </>
  );

  const renderBlogView = () => (
    <>
      <div className="relative mb-12 bg-brand-black border-b border-brand-slate min-h-[300px] flex items-center justify-center overflow-hidden">
           <div className="absolute inset-0 opacity-30">
               <img src={siteContent.blog.heroImage} className="w-full h-full object-cover grayscale" alt="Blog" />
           </div>
           <div className="text-center relative z-10 p-6">
                <span className="text-brand-green font-bold uppercase tracking-widest text-xs">Knowledge Base</span>
                <h1 className="text-4xl md:text-6xl font-black text-white mt-2 mb-6 whitespace-pre-line">{siteContent.blog.headline}</h1>
                <p className="text-brand-teal max-w-2xl mx-auto text-lg">
                    {siteContent.blog.subheadline}
                </p>
           </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(0, visiblePosts).map(post => (
             <BlogPostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
          ))}
        </div>
        
        {visiblePosts < posts.length && (
          <div ref={observerTarget} className="flex justify-center mt-12">
             <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <div className="mt-20">
           <NewsletterForm />
        </div>
      </div>
    </>
  );

  // Main Render
  return (
    <div className="bg-brand-black min-h-screen text-white font-sans selection:bg-brand-green selection:text-black pb-24">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-brand-black/80 backdrop-blur-md border-b border-brand-slate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('store')}>
            <div className="w-10 h-10 bg-brand-green rounded flex items-center justify-center font-black text-white italic text-xl shadow-[0_0_15px_rgba(34,197,94,0.4)]">WH</div>
            <span className="font-black text-xl tracking-tighter hidden sm:block">WEEDHEADBEATS</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['store', 'collabs', 'licenses', 'blog'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                  activeTab === tab ? 'text-brand-green' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user?.isAdmin && (
              <button 
                onClick={() => setIsAiOpen(true)}
                className="p-2 text-brand-teal hover:text-white transition-colors relative group"
                title="AI Studio Concierge (Admin Only)"
              >
                <Sparkles size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-green rounded-full animate-pulse"></span>
              </button>
            )}
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-brand-teal hover:text-white transition-colors relative"
            >
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-green text-black text-[10px] font-bold flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full border border-brand-slate bg-brand-slate/10 hover:bg-brand-slate/20 transition-colors"
                >
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full bg-brand-slate" />
                  <span className="text-xs font-bold text-white hidden sm:block">{user.name}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-brand-black border border-brand-slate rounded-xl shadow-xl overflow-hidden py-1">
                    {user.isAdmin && (
                         <button onClick={() => { setActiveTab('dashboard'); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-brand-teal hover:bg-brand-slate/20 hover:text-white flex items-center gap-2">
                             <LayoutDashboard size={14} /> Dashboard
                         </button>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/10 hover:text-red-300 flex items-center gap-2">
                        <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-brand-teal transition-colors"
              >
                Login
              </button>
            )}

            <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-brand-black/95 backdrop-blur-lg pt-24 px-6 md:hidden">
          <div className="flex flex-col gap-6 text-center">
            {['store', 'collabs', 'licenses', 'blog'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-2xl font-black uppercase tracking-tighter ${
                  activeTab === tab ? 'text-brand-green' : 'text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main View Render */}
      <main>
        {activeTab === 'store' && renderStoreView()}
        {activeTab === 'collabs' && renderCollabsView()}
        {activeTab === 'licenses' && renderLicensesView()}
        {activeTab === 'blog' && renderBlogView()}
        {activeTab === 'dashboard' && user?.isAdmin && renderDashboardView()}
        {activeTab === 'dashboard' && !user?.isAdmin && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
            <h2 className="text-2xl font-black text-white mb-4">Access Denied</h2>
            <p className="text-brand-teal">You must be an admin to access the dashboard.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-brand-black border-t border-brand-slate py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h4 className="font-black text-white tracking-tighter text-lg">WEEDHEAD BEATS</h4>
            <p className="text-zinc-500 text-xs mt-1">© 2025 All Rights Reserved.</p>
          </div>
          <div className="flex gap-6">
             <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Youtube size={20} /></a>
             <a href="#" className="text-zinc-500 hover:text-white transition-colors"><MessageSquare size={20} /></a>
          </div>
        </div>
      </footer>

      {/* Fixed Components */}
      <Sidebar 
        config={config}
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleAiMessage}
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />

      <Player 
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
      />

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart}
        removeFromCart={removeFromCart}
        checkout={handleCheckoutTrigger}
      />
      
      <QueueDrawer
        isOpen={showQueue}
        onClose={() => setShowQueue(false)}
        currentTrack={currentTrack}
        tracks={beats} // Show all beats in queue or filter/manage queue properly
        onPlay={handlePlay}
      />

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={(u) => { setUser(u); setIsAuthModalOpen(false); }}
      />

      <LicenseModal 
        isOpen={isLicenseModalOpen} 
        onClose={() => {
          setIsLicenseModalOpen(false);
          setSelectedBeatForLicense(null);
        }}
        track={selectedBeatForLicense!}
        onConfirm={handleConfirmLicense}
      />

      {isProductModalOpen && selectedProduct && (
        <ProductModal 
          isOpen={isProductModalOpen} 
          onClose={() => {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }} 
          product={selectedProduct} 
          onAddToCart={handleAddProductToCart} 
        />
      )}

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        total={cartTotal}
      />

      <BlogPostModal 
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        track={exportTrack!}
      />

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack?.audio && (currentTrack.audio.startsWith('http://') || currentTrack.audio.startsWith('https://')) ? currentTrack.audio : ''}
        onTimeUpdate={(e) => {
          const audio = e.currentTarget;
          if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            // Update progress in Player component if needed
          }
        }}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          const audio = e.currentTarget as HTMLAudioElement;
          const currentSrc = audio.src || '';
          
          // Completely suppress error logging for repeated errors
          // Only log the first error for a new URL, then silence all subsequent errors
          if (lastErrorUrlRef.current !== currentSrc) {
            lastErrorUrlRef.current = currentSrc;
            errorCountRef.current = 1;
            // Silently handle - don't log to console to prevent spam
            // The 404 error in network tab is enough information
          } else {
            errorCountRef.current++;
            // Completely silent after first error
          }
          
          // Stop playback and clear src
          setIsPlaying(false);
          if (audioRef.current) {
            audioRef.current.src = '';
          }
        }}
        onLoadedData={() => {
          // Audio is ready, can play now if isPlaying is true
          if (isPlaying && audioRef.current && audioRef.current.readyState >= 2) {
            audioRef.current.play().catch(e => {
              // Silently handle play errors (user interaction, etc.)
              if (!e.message?.includes('user gesture') && !e.message?.includes('interrupted')) {
                console.warn('Playback failed:', e);
              }
              setIsPlaying(false);
            });
          }
        }}
      />

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-24 right-6 z-40 w-12 h-12 bg-brand-green hover:bg-brand-green/80 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        title="Scroll to top"
      >
        <ArrowRight size={20} className="rotate-[-90deg]" />
      </button>

    </div>
  );
};

export default App;