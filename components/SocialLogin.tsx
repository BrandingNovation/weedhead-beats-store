import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Chrome, Apple, Facebook, Mail } from 'lucide-react';

interface SocialLoginProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

const SocialLogin: React.FC<SocialLoginProps> = ({
  onSuccess,
  onError,
  className = '',
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading('google');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Google login error:', error);
      if (onError) onError(error as Error);
    } finally {
      setLoading(null);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setLoading('apple');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Apple login error:', error);
      if (onError) onError(error as Error);
    } finally {
      setLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading('facebook');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Facebook login error:', error);
      if (onError) onError(error as Error);
    } finally {
      setLoading(null);
    }
  };

  const handleEmailLogin = () => {
    // Navigate to email login page or show email form
    // This would typically open a modal or navigate to a login page
    if (onError) {
      onError(new Error('Email login not implemented. Please use social login.'));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        onClick={handleGoogleLogin}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Chrome className="w-5 h-5" />
        <span>{loading === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
      </button>

      <button
        onClick={handleAppleLogin}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black hover:bg-gray-900 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Apple className="w-5 h-5" />
        <span>{loading === 'apple' ? 'Connecting...' : 'Continue with Apple'}</span>
      </button>

      <button
        onClick={handleFacebookLogin}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Facebook className="w-5 h-5" />
        <span>{loading === 'facebook' ? 'Connecting...' : 'Continue with Facebook'}</span>
      </button>

      <button
        onClick={handleEmailLogin}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-surface hover:bg-surface-highlight text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Mail className="w-5 h-5" />
        <span>Continue with Email</span>
      </button>
    </div>
  );
};

export default SocialLogin;
