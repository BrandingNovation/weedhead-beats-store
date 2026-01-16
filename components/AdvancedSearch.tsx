import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Filter, Save, Clock, TrendingUp, Music, User } from 'lucide-react';
import { Track } from '../types';

interface SearchFilters {
  category?: string[];
  mood?: string[];
  bpm?: { min: number; max: number };
  key?: string[];
  priceRange?: { min: number; max: number };
  producer?: string;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: string;
}

interface AdvancedSearchProps {
  tracks: Track[];
  onSearch: (results: Track[]) => void;
  onSelectTrack?: (track: Track) => void;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  tracks,
  onSearch,
  onSelectTrack,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<Track[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved searches:', e);
      }
    }

    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      try {
        setRecentSearches(JSON.parse(recent));
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }
  }, []);

  // Generate autocomplete suggestions
  const generateSuggestions = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const queryLower = searchQuery.toLowerCase();
    const matches = tracks
      .filter((track) => {
        const titleMatch = track.title?.toLowerCase().includes(queryLower);
        const producerMatch = track.producer?.toLowerCase().includes(queryLower);
        const categoryMatch = track.category?.toLowerCase().includes(queryLower);
        const tagMatch = track.tags?.some((tag) => tag.toLowerCase().includes(queryLower));
        return titleMatch || producerMatch || categoryMatch || tagMatch;
      })
      .slice(0, 8);

    setSuggestions(matches);
  }, [tracks]);

  // Perform search with filters
  const performSearch = useCallback((searchQuery: string, searchFilters: SearchFilters) => {
    const queryLower = searchQuery.toLowerCase();
    
    let results = tracks.filter((track) => {
      // Text search
      const matchesQuery = !searchQuery.trim() ||
        track.title?.toLowerCase().includes(queryLower) ||
        track.producer?.toLowerCase().includes(queryLower) ||
        track.description?.toLowerCase().includes(queryLower) ||
        track.tags?.some((tag) => tag.toLowerCase().includes(queryLower));

      if (!matchesQuery) return false;

      // Category filter (WeedheadBeats uses category instead of genre)
      if (searchFilters.category && searchFilters.category.length > 0) {
        if (!track.category || !searchFilters.category.includes(track.category)) {
          return false;
        }
      }

      // Mood filter
      if (searchFilters.mood && searchFilters.mood.length > 0) {
        if (!track.mood || !searchFilters.mood.includes(track.mood.toLowerCase())) {
          return false;
        }
      }

      // BPM filter
      if (searchFilters.bpm) {
        const trackBpm = typeof track.bpm === 'string' ? parseFloat(track.bpm) : (typeof track.bpm === 'number' ? track.bpm : 0);
        if (trackBpm) {
          if (trackBpm < searchFilters.bpm.min || trackBpm > searchFilters.bpm.max) {
            return false;
          }
        }
      }

      // Key filter
      if (searchFilters.key && searchFilters.key.length > 0) {
        if (!track.key || !searchFilters.key.includes(track.key)) {
          return false;
        }
      }

      // Price range filter
      if (searchFilters.priceRange) {
        const price = typeof track.price === 'string' ? parseFloat(track.price) : (typeof track.price === 'number' ? track.price : 0);
        if (price < searchFilters.priceRange.min || price > searchFilters.priceRange.max) {
          return false;
        }
      }

      // License type filter - removed (WeedheadBeats doesn't have licenseType on Track)

      // Producer filter
      if (searchFilters.producer) {
        if (!track.producer?.toLowerCase().includes(searchFilters.producer.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    // Sort by relevance (title matches first, then producer, then tags)
    results.sort((a, b) => {
      const aScore = getRelevanceScore(a, queryLower);
      const bScore = getRelevanceScore(b, queryLower);
      return bScore - aScore;
    });

    onSearch(results);
  }, [tracks, onSearch]);

  const getRelevanceScore = (track: Track, query: string): number => {
    let score = 0;
    if (track.title?.toLowerCase().includes(query)) score += 10;
    if (track.title?.toLowerCase().startsWith(query)) score += 5;
    if (track.producer?.toLowerCase().includes(query)) score += 5;
    if (track.tags?.some((tag) => tag.toLowerCase().includes(query))) score += 3;
    if (track.description?.toLowerCase().includes(query)) score += 1;
    return score;
  };

  // Handle search input
  const handleQueryChange = (value: string) => {
    setQuery(value);
    generateSuggestions(value);
    setShowSuggestions(value.length > 0);
  };

  // Handle search execution
  const handleSearch = () => {
    if (query.trim()) {
      // Save to recent searches
      const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
    performSearch(query, filters);
    setShowSuggestions(false);
  };

  // Save current search
  const handleSaveSearch = () => {
    const name = prompt('Name this search:');
    if (!name) return;

    const saved: SavedSearch = {
      id: Date.now().toString(),
      name,
      query,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    };

    const updated = [saved, ...savedSearches];
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  // Load saved search
  const handleLoadSavedSearch = (saved: SavedSearch) => {
    setQuery(saved.query);
    setFilters(saved.filters);
    performSearch(saved.query, saved.filters);
    setShowSavedSearches(false);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({});
    performSearch(query, {});
  };

  // Get unique values for filter options
  const categories = [...new Set(tracks.map((t) => t.category).filter(Boolean))] as string[];
  const moods = [...new Set(tracks.map((t) => t.mood).filter(Boolean))] as string[];
  const keys = [...new Set(tracks.map((t) => t.key).filter(Boolean))] as string[];
  const producers = [...new Set(tracks.map((t) => t.producer).filter(Boolean))] as string[];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
                if (e.key === 'Escape') setShowSuggestions(false);
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Search tracks, artists, genres..."
              className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-primary hover:bg-primary-dark rounded-xl transition-colors font-medium"
          >
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl transition-colors ${
              showFilters
                ? 'bg-primary text-white'
                : 'bg-surface border border-white/10 text-gray-300 hover:bg-surface-highlight'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-2 bg-surface border border-white/10 rounded-xl shadow-xl max-h-96 overflow-y-auto"
          >
            {suggestions.map((track) => (
              <button
                key={track.id}
                onClick={() => {
                  setQuery(track.title || '');
                  setShowSuggestions(false);
                  if (onSelectTrack) onSelectTrack(track);
                }}
                className="w-full px-4 py-3 text-left hover:bg-surface-highlight transition-colors flex items-center gap-3"
              >
                <Music className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{track.title}</div>
                  {track.producer && (
                    <div className="text-sm text-gray-400 truncate">{track.producer}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Recent Searches */}
        {showSuggestions && suggestions.length === 0 && query === '' && recentSearches.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-surface border border-white/10 rounded-xl shadow-xl">
            <div className="px-4 py-2 text-xs text-gray-400 border-b border-white/10 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Searches
            </div>
            {recentSearches.map((search, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(search);
                  handleSearch();
                }}
                className="w-full px-4 py-2 text-left hover:bg-surface-highlight transition-colors text-gray-300"
              >
                {search}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-surface border border-white/10 rounded-xl p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Filters</h3>
            <div className="flex gap-2">
              <button
                onClick={handleSaveSearch}
                className="px-3 py-1.5 text-sm bg-surface-highlight hover:bg-surface-highlight/80 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Search
              </button>
              <button
                onClick={() => setShowSavedSearches(!showSavedSearches)}
                className="px-3 py-1.5 text-sm bg-surface-highlight hover:bg-surface-highlight/80 rounded-lg transition-colors flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Saved ({savedSearches.length})
              </button>
              <button
                onClick={handleClearFilters}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Saved Searches Dropdown */}
          {showSavedSearches && savedSearches.length > 0 && (
            <div className="bg-surface-highlight border border-white/10 rounded-lg p-3 space-y-2">
              {savedSearches.map((saved) => (
                <button
                  key={saved.id}
                  onClick={() => handleLoadSavedSearch(saved)}
                  className="w-full px-3 py-2 text-left hover:bg-surface rounded-lg transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-white font-medium">{saved.name}</div>
                    <div className="text-xs text-gray-400">{saved.query}</div>
                  </div>
                  <X
                    className="w-4 h-4 text-gray-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = savedSearches.filter((s) => s.id !== saved.id);
                      setSavedSearches(updated);
                      localStorage.setItem('savedSearches', JSON.stringify(updated));
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        const current = filters.category || [];
                        const updated = current.includes(category)
                          ? current.filter((c) => c !== category)
                          : [...current, category];
                        setFilters({ ...filters, category: updated });
                        performSearch(query, { ...filters, category: updated });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        filters.category?.includes(category)
                          ? 'bg-primary text-white'
                          : 'bg-surface-highlight text-gray-300 hover:bg-surface-highlight/80'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mood Filter */}
            {moods.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mood</label>
                <div className="flex flex-wrap gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => {
                        const current = filters.mood || [];
                        const updated = current.includes(mood)
                          ? current.filter((m) => m !== mood)
                          : [...current, mood];
                        setFilters({ ...filters, mood: updated });
                        performSearch(query, { ...filters, mood: updated });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        filters.mood?.includes(mood)
                          ? 'bg-primary text-white'
                          : 'bg-surface-highlight text-gray-300 hover:bg-surface-highlight/80'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* BPM Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                BPM: {filters.bpm?.min || 60} - {filters.bpm?.max || 200}
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="60"
                  max="200"
                  value={filters.bpm?.min || 60}
                  onChange={(e) => {
                    const min = parseInt(e.target.value);
                    setFilters({
                      ...filters,
                      bpm: { min, max: filters.bpm?.max || 200 },
                    });
                    performSearch(query, {
                      ...filters,
                      bpm: { min, max: filters.bpm?.max || 200 },
                    });
                  }}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="60"
                  max="200"
                  value={filters.bpm?.max || 200}
                  onChange={(e) => {
                    const max = parseInt(e.target.value);
                    setFilters({
                      ...filters,
                      bpm: { min: filters.bpm?.min || 60, max },
                    });
                    performSearch(query, {
                      ...filters,
                      bpm: { min: filters.bpm?.min || 60, max },
                    });
                  }}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price: ${filters.priceRange?.min || 0} - ${filters.priceRange?.max || 1000}
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={filters.priceRange?.min || 0}
                  onChange={(e) => {
                    const min = parseInt(e.target.value);
                    setFilters({
                      ...filters,
                      priceRange: { min, max: filters.priceRange?.max || 1000 },
                    });
                    performSearch(query, {
                      ...filters,
                      priceRange: { min, max: filters.priceRange?.max || 1000 },
                    });
                  }}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={filters.priceRange?.max || 1000}
                  onChange={(e) => {
                    const max = parseInt(e.target.value);
                    setFilters({
                      ...filters,
                      priceRange: { min: filters.priceRange?.min || 0, max },
                    });
                    performSearch(query, {
                      ...filters,
                      priceRange: { min: filters.priceRange?.min || 0, max },
                    });
                  }}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
