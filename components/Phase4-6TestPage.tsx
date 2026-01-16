import React, { useState } from 'react';
import AdvancedSearch from './AdvancedSearch';
import Recommendations from './Recommendations';
import SocialFeatures from './SocialFeatures';
import AudioPlayerWithTempo from './AudioPlayerWithTempo';
import WaveformVisualizer from './WaveformVisualizer';
import AnalyticsExport from './AnalyticsExport';
import { Track } from '../types';

// Mock data for testing
const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Test Beat 1',
    producer: 'Test Producer',
    bpm: 140,
    key: 'C',
    price: 29.99,
    mood: 'energetic',
    tags: ['hip-hop', 'trap'],
    cover: 'https://via.placeholder.com/300',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: 'A test beat for Phase 4-6 testing',
    category: 'beat',
  },
  {
    id: '2',
    title: 'Test Beat 2',
    producer: 'Another Producer',
    bpm: 120,
    key: 'D',
    price: 39.99,
    mood: 'chill',
    tags: ['lofi', 'jazz'],
    cover: 'https://via.placeholder.com/300',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    description: 'Another test beat',
    category: 'beat',
  },
];

const Phase46TestPage: React.FC = () => {
  const [tracks] = useState<Track[]>(mockTracks);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>(mockTracks);
  const [currentTrack, setCurrentTrack] = useState<Track | undefined>(mockTracks[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Update duration when track changes
  React.useEffect(() => {
    if (currentTrack?.audio) {
      const audio = new Audio(currentTrack.audio);
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      audio.load();
    }
  }, [currentTrack]);

  return (
    <div className="min-h-screen bg-black text-brand-teal p-8 space-y-8">
      <h1 className="text-4xl font-bold text-brand-green mb-8">
        Phase 4-6 Features Test Page
      </h1>

      {/* Advanced Search */}
      <section className="bg-brand-slate p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">1. Advanced Search</h2>
        <AdvancedSearch
          tracks={tracks}
          onSearch={(results) => {
            setFilteredTracks(results);
            console.log('Search results:', results);
          }}
          onSelectTrack={(track) => {
            setCurrentTrack(track);
            console.log('Selected track:', track);
          }}
        />
        <div className="mt-4">
          <p className="text-sm text-gray-400">
            Results: {filteredTracks.length} tracks
          </p>
        </div>
      </section>

      {/* Recommendations */}
      <section className="bg-brand-slate p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">2. Recommendations</h2>
        <Recommendations
          tracks={tracks}
          listeningHistory={[]}
          currentTrack={currentTrack}
          onSelectTrack={(track) => {
            setCurrentTrack(track);
            console.log('Recommended track selected:', track);
          }}
        />
      </section>

      {/* Audio Player with Tempo */}
      {currentTrack && (
        <section className="bg-brand-slate p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">3. Audio Player with Tempo</h2>
          <AudioPlayerWithTempo
            audioUrl={currentTrack.audio || ''}
            title={currentTrack.title}
            artist={currentTrack.producer}
            onTimeUpdate={(time) => {
              setCurrentTime(time);
            }}
            onEnded={() => {
              console.log('Track ended');
            }}
          />
        </section>
      )}

      {/* Waveform Visualizer */}
      {currentTrack && (
        <section className="bg-brand-slate p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">4. Waveform Visualizer</h2>
          <WaveformVisualizer
            audioUrl={currentTrack.audio || ''}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onSeek={(time) => {
              setCurrentTime(time);
              console.log('Seeked to:', time);
            }}
            onPlayPause={() => {
              setIsPlaying(!isPlaying);
              console.log('Play/Pause toggled');
            }}
          />
        </section>
      )}

      {/* Social Features */}
      {currentTrack && (
        <section className="bg-brand-slate p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">5. Social Features</h2>
          <SocialFeatures
            currentUserId="test-user-id"
            producerId="test-producer-id"
            track={currentTrack}
          />
        </section>
      )}

      {/* Analytics Export */}
      <section className="bg-brand-slate p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">6. Analytics Export</h2>
        <AnalyticsExport
          data={{
            orders: [],
            tracks: tracks,
            revenue: {
              total: 1000,
              byPeriod: [
                { period: '2024-01', amount: 500 },
                { period: '2024-02', amount: 500 },
              ],
            },
            sales: {
              total: 10,
              byTrack: [
                { trackId: '1', trackName: 'Test Beat 1', count: 5, revenue: 150 },
                { trackId: '2', trackName: 'Test Beat 2', count: 5, revenue: 200 },
              ],
            },
          }}
          filename="test-analytics"
        />
      </section>

      {/* Test Results */}
      <section className="bg-brand-slate p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Test Status</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span>All components loaded</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span>No import errors</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span>Check browser console for interaction logs</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Phase46TestPage;
