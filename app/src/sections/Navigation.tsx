import { useState, useMemo } from 'react';
import { Menu, Search, X, Disc, User, Calendar, BarChart3, Heart, Music, Type, Quote } from 'lucide-react';
import type { Song, ViewMode } from '@/types';

interface NavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchScope: 'name' | 'lyrics' | 'all' | 'wordfreq';
  onSearchScopeChange: (scope: 'name' | 'lyrics' | 'all' | 'wordfreq') => void;
  selectedYear: string | null;
  onYearSelect: (year: string | null) => void;
  selectedAlbum: string | null;
  onAlbumSelect: (album: string | null) => void;
  songs: Song[];
  favoritesCount: number;
  commentsCount: number;
  lyricSnippetsCount?: number;
}

export function Navigation({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  searchScope,
  onSearchScopeChange,
  selectedYear,
  onYearSelect,
  selectedAlbum,
  onAlbumSelect,
  songs,
  favoritesCount,
  lyricSnippetsCount = 0,
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 获取所有年份（按倒序）
  const years = useMemo(() => {
    const yearSet = new Set(songs.map(s => s.year_only));
    return Array.from(yearSet).sort((a, b) => b.localeCompare(a));
  }, [songs]);

  // 获取所有专辑（修正单曲计算逻辑）
  const albums = useMemo(() => {
    const albumSet = new Set<string>();
    songs.forEach(song => {
      if (song.album) {
        albumSet.add(song.album);
      }
    });
    return Array.from(albumSet).sort();
  }, [songs]);

  // 计算单曲数量
  const singleCount = useMemo(() => {
    return songs.filter(s => !s.album).length;
  }, [songs]);

  // 计算各专辑歌曲数量
  const albumCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    songs.forEach(song => {
      if (song.album) {
        counts[song.album] = (counts[song.album] || 0) + 1;
      }
    });
    return counts;
  }, [songs]);

  // 计算各年份歌曲数量
  const yearCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    songs.forEach(song => {
      counts[song.year_only] = (counts[song.year_only] || 0) + 1;
    });
    return counts;
  }, [songs]);

  const navItems: { id: ViewMode; label: string; icon: typeof Music }[] = [
    { id: 'timeline', label: '时间线', icon: Calendar },
    { id: 'alphabet', label: '首字母', icon: Type },
    { id: 'album', label: '专辑', icon: Disc },
    { id: 'lyricist', label: '词作人', icon: User },
    { id: 'favorites', label: `收藏(${favoritesCount})`, icon: Heart },
    { id: 'lyricSnippets', label: `句子(${lyricSnippetsCount})`, icon: Quote },
    { id: 'statistics', label: '统计', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm border-b border-ink-pale/20">
      {/* 主导航 */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <button 
          onClick={() => onViewChange('timeline')}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded bg-cinnabar flex items-center justify-center">
            <Music className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-ink hidden sm:inline">河图歌词集</span>
        </button>

        {/* 桌面端导航 */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                currentView === id
                  ? 'bg-cinnabar/10 text-cinnabar'
                  : 'text-ink-light hover:text-ink hover:bg-ink-pale/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* 搜索框 */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜索歌名、歌词、词作人..."
              className="w-32 sm:w-48 lg:w-64 pl-9 pr-4 py-1.5 text-sm bg-paper-light border border-ink-pale/20 rounded-lg
                focus:outline-none focus:border-cinnabar/50 focus:ring-1 focus:ring-cinnabar/20
                placeholder:text-ink-light/60"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-ink-pale/10"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 搜索范围选择 */}
      {searchQuery && (
        <div className="px-4 pb-2 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'all', label: '全部' },
            { id: 'name', label: '歌名' },
            { id: 'lyrics', label: '歌词' },
            { id: 'wordfreq', label: '词作人' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onSearchScopeChange(id as typeof searchScope)}
              className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap transition-all ${
                searchScope === id
                  ? 'bg-cinnabar text-white'
                  : 'bg-ink-pale/10 text-ink-light hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* 年份筛选 - 紧凑索引样式 */}
      {currentView === 'timeline' && (
        <div className="px-4 py-2 border-t border-ink-pale/10">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onYearSelect(null)}
              className={`px-2 py-1 text-xs rounded-md transition-all ${
                selectedYear === null
                  ? 'bg-cinnabar text-white'
                  : 'bg-paper-light border border-ink-pale/20 text-ink-light hover:text-ink hover:border-cinnabar/30'
              }`}
            >
              全部({songs.length})
            </button>
            {years.map(year => (
              <button
                key={year}
                onClick={() => onYearSelect(year === selectedYear ? null : year)}
                className={`px-2 py-1 text-xs rounded-md transition-all ${
                  selectedYear === year
                    ? 'bg-cinnabar text-white'
                    : 'bg-paper-light border border-ink-pale/20 text-ink-light hover:text-ink hover:border-cinnabar/30'
                }`}
              >
                {year}({yearCounts[year]})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 专辑筛选 - 紧凑索引样式 */}
      {currentView === 'album' && (
        <div className="px-4 py-2 border-t border-ink-pale/10">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                onAlbumSelect(null);
                // 强制刷新视图状态
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
              }}
              className={`px-2 py-1 text-xs rounded-md transition-all ${
                selectedAlbum === null
                  ? 'bg-cinnabar text-white'
                  : 'bg-paper-light border border-ink-pale/20 text-ink-light hover:text-ink hover:border-cinnabar/30'
              }`}
            >
              全部({songs.length})
            </button>
            <button
              onClick={() => onAlbumSelect('单曲')}
              className={`px-2 py-1 text-xs rounded-md transition-all ${
                selectedAlbum === '单曲'
                  ? 'bg-cinnabar text-white'
                  : 'bg-paper-light border border-ink-pale/20 text-ink-light hover:text-ink hover:border-cinnabar/30'
              }`}
            >
              单曲({singleCount})
            </button>
            {albums.map(album => (
              <button
                key={album}
                onClick={() => onAlbumSelect(album === selectedAlbum ? null : album)}
                className={`px-2 py-1 text-xs rounded-md transition-all ${
                  selectedAlbum === album
                    ? 'bg-cinnabar text-white'
                    : 'bg-paper-light border border-ink-pale/20 text-ink-light hover:text-ink hover:border-cinnabar/30'
                }`}
              >
                {album}({albumCounts[album]})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 移动端菜单 */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-ink-pale/10 bg-paper">
          <nav className="p-4 space-y-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  onViewChange(id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  currentView === id
                    ? 'bg-cinnabar/10 text-cinnabar'
                    : 'text-ink-light hover:text-ink hover:bg-ink-pale/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
