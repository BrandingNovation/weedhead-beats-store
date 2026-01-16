// AI-powered recommendation service based on listening history

import { Track } from '../types';

interface ListeningHistoryItem {
  trackId: string;
  playedAt: string;
  playCount?: number;
  completed?: boolean;
}

interface UserPreferences {
  favoriteCategories?: string[];
  favoriteMoods?: string[];
  averageBPM?: number;
  favoriteProducers?: string[];
  priceRange?: { min: number; max: number };
}

class RecommendationService {
  /**
   * Generate recommendations based on listening history
   */
  getRecommendations(
    tracks: Track[],
    listeningHistory: ListeningHistoryItem[],
    userPreferences?: UserPreferences
  ): Track[] {
    if (listeningHistory.length === 0) {
      // Return popular tracks if no history
      return this.getPopularTracks(tracks);
    }

    // Analyze listening patterns
    const preferences = this.analyzePreferences(tracks, listeningHistory, userPreferences);
    
    // Score all tracks
    const scoredTracks = tracks
      .filter((track) => {
        // Exclude already played tracks
        return !listeningHistory.some((item) => item.trackId === track.id);
      })
      .map((track) => ({
        track,
        score: this.calculateScore(track, preferences, listeningHistory),
      }))
      .sort((a, b) => b.score - a.score);

    return scoredTracks.slice(0, 20).map((item) => item.track);
  }

  /**
   * Analyze user preferences from listening history
   */
  private analyzePreferences(
    tracks: Track[],
    history: ListeningHistoryItem[],
    userPrefs?: UserPreferences
  ): UserPreferences {
    const playedTracks = tracks.filter((track) =>
      history.some((item) => item.trackId === track.id)
    );

    const categories: Record<string, number> = {};
    const moods: Record<string, number> = {};
    const producers: Record<string, number> = {};
    const bpms: number[] = [];
    const prices: number[] = [];

    playedTracks.forEach((track) => {
      if (track.category) categories[track.category] = (categories[track.category] || 0) + 1;
      if (track.mood) moods[track.mood] = (moods[track.mood] || 0) + 1;
      if (track.producer) producers[track.producer] = (producers[track.producer] || 0) + 1;
      if (track.bpm) {
        const bpm = typeof track.bpm === 'string' ? parseFloat(track.bpm) : track.bpm;
        if (bpm) bpms.push(bpm);
      }
      if (track.price) {
        const price = typeof track.price === 'string' ? parseFloat(track.price) : track.price;
        if (price) prices.push(price);
      }
    });

    // Get top preferences
    const favoriteCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

    const favoriteMoods = Object.entries(moods)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([mood]) => mood);

    const favoriteProducers = Object.entries(producers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([producer]) => producer);

    const averageBPM = bpms.length > 0 ? bpms.reduce((a, b) => a + b, 0) / bpms.length : undefined;

    const priceRange = prices.length > 0
      ? {
          min: Math.min(...prices),
          max: Math.max(...prices),
        }
      : undefined;

    return {
      favoriteCategories: userPrefs?.favoriteCategories || favoriteCategories,
      favoriteMoods: userPrefs?.favoriteMoods || favoriteMoods,
      favoriteProducers: userPrefs?.favoriteProducers || favoriteProducers,
      averageBPM: userPrefs?.averageBPM || averageBPM,
      priceRange: userPrefs?.priceRange || priceRange,
    };
  }

  /**
   * Calculate recommendation score for a track
   */
  private calculateScore(
    track: Track,
    preferences: UserPreferences,
    history: ListeningHistoryItem[]
  ): number {
    let score = 0;

    // Category match (high weight) - WeedheadBeats uses category instead of genre
    if (track.category && preferences.favoriteCategories?.includes(track.category)) {
      score += 30;
    }

    // Mood match (high weight)
    if (track.mood && preferences.favoriteMoods?.includes(track.mood)) {
      score += 30;
    }

    // Producer match (very high weight)
    if (track.producer && preferences.favoriteProducers?.includes(track.producer)) {
      score += 40;
    }

    // BPM similarity (medium weight)
    if (preferences.averageBPM && track.bpm) {
      const trackBpm = typeof track.bpm === 'string' ? parseFloat(track.bpm) : track.bpm;
      if (trackBpm) {
        const bpmDiff = Math.abs(trackBpm - preferences.averageBPM);
        if (bpmDiff < 10) score += 20;
        else if (bpmDiff < 20) score += 10;
        else if (bpmDiff < 30) score += 5;
      }
    }

    // Price range match (low weight)
    if (preferences.priceRange && track.price) {
      const price = typeof track.price === 'string' ? parseFloat(track.price) : (typeof track.price === 'number' ? track.price : 0);
      if (
        price >= preferences.priceRange.min &&
        price <= preferences.priceRange.max
      ) {
        score += 10;
      }
    }

    // Popularity boost (based on stats: plays, sales)
    if (track.stats?.plays && track.stats.plays > 100) score += 5;
    if (track.stats?.sales && track.stats.sales > 10) score += 5;

    return score;
  }

  /**
   * Get popular tracks (fallback when no history)
   */
  private getPopularTracks(tracks: Track[]): Track[] {
    return tracks
      .map((track) => ({
        track,
        popularity: this.calculatePopularity(track),
      }))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 20)
      .map((item) => item.track);
  }

  /**
   * Calculate popularity score
   */
  private calculatePopularity(track: Track): number {
    let score = 0;
    if (track.stats?.plays) score += track.stats.plays * 0.1;
    if (track.stats?.sales) score += track.stats.sales * 5;
    if (track.stats?.revenue) score += track.stats.revenue * 0.01;
    return score;
  }

  /**
   * Get "More like this" recommendations
   */
  getSimilarTracks(track: Track, allTracks: Track[], limit: number = 10): Track[] {
    return allTracks
      .filter((t) => t.id !== track.id)
      .map((t) => ({
        track: t,
        similarity: this.calculateSimilarity(track, t),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((item) => item.track);
  }

  /**
   * Calculate similarity between two tracks
   */
  private calculateSimilarity(track1: Track, track2: Track): number {
    let score = 0;

    // Category match (WeedheadBeats uses category instead of genre)
    if (track1.category && track2.category && track1.category === track2.category) score += 30;

    // Mood match
    if (track1.mood && track2.mood && track1.mood === track2.mood) score += 30;

    // Producer match
    if (track1.producer && track2.producer && track1.producer === track2.producer) score += 40;

    // BPM similarity
    if (track1.bpm && track2.bpm) {
      const bpm1 = typeof track1.bpm === 'string' ? parseFloat(track1.bpm) : track1.bpm;
      const bpm2 = typeof track2.bpm === 'string' ? parseFloat(track2.bpm) : track2.bpm;
      if (bpm1 && bpm2) {
        const diff = Math.abs(bpm1 - bpm2);
        if (diff < 5) score += 20;
        else if (diff < 10) score += 10;
        else if (diff < 20) score += 5;
      }
    }

    // Key match
    if (track1.key && track2.key && track1.key === track2.key) score += 10;

    // Tag overlap
    if (track1.tags && track2.tags) {
      const commonTags = track1.tags.filter((tag) => track2.tags?.includes(tag));
      score += commonTags.length * 5;
    }

    return score;
  }
}

export const recommendationService = new RecommendationService();
