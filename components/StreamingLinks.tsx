import React from 'react';
import { Music, ExternalLink } from 'lucide-react';
import { integrationService } from '../services/integrationService';

interface StreamingLinksProps {
  trackTitle: string;
  artist?: string;
  className?: string;
}

const StreamingLinks: React.FC<StreamingLinksProps> = ({
  trackTitle,
  artist,
  className = '',
}) => {
  const links = integrationService.getStreamingLinks(trackTitle, artist);
  const shareLinks = integrationService.getShareLinks(trackTitle, window.location.href, artist);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Streaming Platforms */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Music className="w-4 h-4" />
          Listen on
        </h3>
        <div className="flex flex-wrap gap-2">
          {links.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-highlight rounded-lg transition-colors text-sm"
            >
              <span>{platform.icon}</span>
              <span>{platform.name}</span>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          ))}
        </div>
      </div>

      {/* Share Links */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Share</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(shareLinks).map(([platform, url]) => (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-surface hover:bg-surface-highlight rounded-lg transition-colors text-sm capitalize"
            >
              {platform === 'whatsapp' ? 'WhatsApp' : platform}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StreamingLinks;
