// Integration service for Spotify, Apple Music, and other streaming platforms

export interface StreamingPlatform {
  name: string;
  icon: string;
  url: string;
  embedUrl?: string;
}

export interface PlaylistSync {
  platform: string;
  playlistId: string;
  tracks: string[];
}

class IntegrationService {
  /**
   * Generate Spotify search URL
   */
  getSpotifySearchUrl(trackTitle: string, artist?: string): string {
    const query = artist ? `${artist} ${trackTitle}` : trackTitle;
    return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
  }

  /**
   * Generate Spotify embed URL
   */
  getSpotifyEmbedUrl(trackId: string): string {
    return `https://open.spotify.com/embed/track/${trackId}`;
  }

  /**
   * Generate Apple Music search URL
   */
  getAppleMusicSearchUrl(trackTitle: string, artist?: string): string {
    const query = artist ? `${artist} ${trackTitle}` : trackTitle;
    return `https://music.apple.com/search?term=${encodeURIComponent(query)}`;
  }

  /**
   * Generate YouTube Music search URL
   */
  getYouTubeMusicSearchUrl(trackTitle: string, artist?: string): string {
    const query = artist ? `${artist} ${trackTitle}` : trackTitle;
    return `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;
  }

  /**
   * Get all streaming platform links for a track
   */
  getStreamingLinks(trackTitle: string, artist?: string): StreamingPlatform[] {
    return [
      {
        name: 'Spotify',
        icon: '🎵',
        url: this.getSpotifySearchUrl(trackTitle, artist),
      },
      {
        name: 'Apple Music',
        icon: '🍎',
        url: this.getAppleMusicSearchUrl(trackTitle, artist),
      },
      {
        name: 'YouTube Music',
        icon: '▶️',
        url: this.getYouTubeMusicSearchUrl(trackTitle, artist),
      },
    ];
  }

  /**
   * Generate share links for social media
   */
  getShareLinks(trackTitle: string, trackUrl: string, artist?: string): Record<string, string> {
    const text = artist ? `${trackTitle} by ${artist}` : trackTitle;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(trackUrl);

    return {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      email: `mailto:?subject=${encodedText}&body=${encodedText}%20${encodedUrl}`,
    };
  }

  /**
   * Sync playlist to external platform (placeholder - would need API keys)
   */
  async syncPlaylistToPlatform(
    platform: 'spotify' | 'apple' | 'youtube',
    playlistId: string,
    tracks: Array<{ title: string; artist?: string }>
  ): Promise<boolean> {
    // This would require OAuth and API integration
    // Placeholder implementation
    console.log(`Syncing playlist to ${platform}`, { playlistId, tracks });
    return false;
  }

  /**
   * Embed Spotify player
   */
  createSpotifyEmbed(trackId: string, width: number = 300, height: number = 380): string {
    return `<iframe 
      style="border-radius:12px" 
      src="https://open.spotify.com/embed/track/${trackId}?utm_source=generator" 
      width="${width}" 
      height="${height}" 
      frameBorder="0" 
      allowfullscreen="" 
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
      loading="lazy">
    </iframe>`;
  }

  /**
   * Embed Apple Music player
   */
  createAppleMusicEmbed(trackId: string, width: number = 300, height: number = 150): string {
    return `<iframe 
      allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" 
      frameborder="0" 
      height="${height}" 
      style="width:100%;max-width:660px;overflow:hidden;background:transparent;" 
      sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" 
      src="https://embed.music.apple.com/us/album/track/${trackId}">
    </iframe>`;
  }
}

export const integrationService = new IntegrationService();
