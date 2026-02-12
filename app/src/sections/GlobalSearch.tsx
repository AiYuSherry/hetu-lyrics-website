import { useMemo } from 'react';
import { Search, User, Calendar, Disc, Heart, Music, X } from 'lucide-react';
import type { Song } from '@/types';

interface SearchMatch {
  song: Song;
  matchType: 'name' | 'lyrics' | 'lyricist' | 'composer' | 'album';
  matchCount: number;
  snippets: { text: string; highlightStart: number; highlightEnd: number }[];
}

interface GlobalSearchProps {
  songs: Song[];
  searchQuery: string;
  searchScope: 'name' | 'lyrics' | 'all' | 'wordfreq';
  favorites: number[];
  onToggleFavorite: (songId: number) => void;
  onSelectSong: (song: Song) => void;
  onClearSearch: () => void;
}

// 提取匹配片段
function extractSnippets(lyrics: string, query: string, maxSnippets = 3): { text: string; highlightStart: number; highlightEnd: number }[] {
  const snippets: { text: string; highlightStart: number; highlightEnd: number }[] = [];
  const lowerLyrics = lyrics.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  let index = 0;
  while (snippets.length < maxSnippets && index < lowerLyrics.length) {
    const matchIndex = lowerLyrics.indexOf(lowerQuery, index);
    if (matchIndex === -1) break;
    
    // 提取前后25个字符
    const start = Math.max(0, matchIndex - 25);
    const end = Math.min(lyrics.length, matchIndex + query.length + 25);
    const snippet = lyrics.substring(start, end);
    
    snippets.push({
      text: snippet,
      highlightStart: matchIndex - start,
      highlightEnd: matchIndex - start + query.length
    });
    
    index = matchIndex + 1;
  }
  
  return snippets;
}

// 统计匹配次数
function countMatches(text: string, query: string): number {
  if (!text || !query) return 0;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let count = 0;
  let index = 0;
  
  while ((index = lowerText.indexOf(lowerQuery, index)) !== -1) {
    count++;
    index += 1;
  }
  
  return count;
}

export function GlobalSearch({
  songs,
  searchQuery,
  searchScope,
  favorites,
  onToggleFavorite,
  onSelectSong,
  onClearSearch,
}: GlobalSearchProps) {
  // 搜索过滤和增强
  const searchResults = useMemo<SearchMatch[]>(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const results: SearchMatch[] = [];
    
    songs.forEach(song => {
      let matchType: SearchMatch['matchType'] | null = null;
      let matchCount = 0;
      let snippets: SearchMatch['snippets'] = [];
      
      // 检查歌名匹配
      if (searchScope === 'all' || searchScope === 'name') {
        const nameMatches = countMatches(song.name, query);
        if (nameMatches > 0) {
          matchType = 'name';
          matchCount = nameMatches;
        }
      }
      
      // 检查歌词匹配
      if ((searchScope === 'all' || searchScope === 'lyrics' || searchScope === 'wordfreq') && song.lyrics) {
        const lyricsMatches = countMatches(song.lyrics, query);
        if (lyricsMatches > 0) {
          matchType = matchType || 'lyrics';
          matchCount = Math.max(matchCount, lyricsMatches);
          snippets = extractSnippets(song.lyrics, query);
        }
      }
      
      // 检查词作人匹配
      if ((searchScope === 'all' || searchScope === 'wordfreq') && song.lyricist) {
        const lyricistMatches = countMatches(song.lyricist, query);
        if (lyricistMatches > 0) {
          matchType = matchType || 'lyricist';
          matchCount = Math.max(matchCount, lyricistMatches);
        }
      }
      
      // 检查曲作人匹配
      if ((searchScope === 'all' || searchScope === 'wordfreq') && song.composer) {
        const composerMatches = countMatches(song.composer, query);
        if (composerMatches > 0) {
          matchType = matchType || 'composer';
          matchCount = Math.max(matchCount, composerMatches);
        }
      }

      // 检查专辑匹配
      if (searchScope === 'all' && song.album) {
        const albumMatches = countMatches(song.album, query);
        if (albumMatches > 0) {
          matchType = matchType || 'album';
          matchCount = Math.max(matchCount, albumMatches);
        }
      }
      
      if (matchType) {
        results.push({ song, matchType, matchCount, snippets });
      }
    });
    
    // 按匹配次数排序
    return results.sort((a, b) => b.matchCount - a.matchCount);
  }, [songs, searchQuery, searchScope]);

  // 渲染高亮文本
  const renderHighlightedSnippet = (snippet: { text: string; highlightStart: number; highlightEnd: number }) => {
    const before = snippet.text.substring(0, snippet.highlightStart);
    const highlight = snippet.text.substring(snippet.highlightStart, snippet.highlightEnd);
    const after = snippet.text.substring(snippet.highlightEnd);
    
    return (
      <span>
        {before.length > 0 && <span className="text-ink-light">...{before}</span>}
        <span className="bg-[#FFF9C4] text-ink font-medium px-0.5">{highlight}</span>
        {after.length > 0 && <span className="text-ink-light">{after}...</span>}
      </span>
    );
  };

  // 获取匹配类型标签
  const getMatchTypeLabel = (matchType: SearchMatch['matchType']) => {
    const labels: Record<string, string> = {
      name: '歌名',
      lyrics: '歌词',
      lyricist: '词作人',
      composer: '曲作人',
      album: '专辑',
    };
    return labels[matchType] || matchType;
  };

  if (!searchQuery.trim()) {
    return null;
  }

  if (searchResults.length === 0) {
    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-cinnabar" />
            <span className="text-sm text-ink-light">
              搜索 "{searchQuery}" - 未找到匹配结果
            </span>
          </div>
          <button
            onClick={onClearSearch}
            className="flex items-center gap-1 px-3 py-1 text-xs text-ink-light hover:text-cinnabar transition-colors"
          >
            <X className="w-3 h-3" />
            清除搜索
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-ink-light">
          <Search className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg">未找到匹配的歌曲</p>
          <p className="text-sm mt-2">尝试使用其他关键词</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-cinnabar" />
          <span className="text-sm text-ink-light">
            搜索 "{searchQuery}"（共 {searchResults.length} 条结果）
          </span>
        </div>
        <button
          onClick={onClearSearch}
          className="flex items-center gap-1 px-3 py-1 text-xs text-ink-light hover:text-cinnabar transition-colors"
        >
          <X className="w-3 h-3" />
          清除搜索
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {searchResults.map(({ song, matchType, matchCount, snippets }) => (
          <div
            key={song.id}
            onClick={() => onSelectSong(song)}
            className="group p-4 bg-paper-light rounded-lg border border-ink-pale/20 hover:border-cinnabar/30 hover:shadow-md cursor-pointer transition-all"
          >
            {/* 歌曲信息 */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-ink group-hover:text-cinnabar transition-colors">
                    {song.name}
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 bg-cinnabar/10 text-cinnabar rounded">
                    {getMatchTypeLabel(matchType)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-ink-light flex-wrap">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {song.lyricist || '未知'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {song.year_only}
                  </span>
                  {song.album && (
                    <span className="flex items-center gap-1">
                      <Disc className="w-3 h-3" />
                      {song.album}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs px-2 py-1 bg-cinnabar/10 text-cinnabar rounded-full">
                  {matchCount} 次匹配
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(song.id);
                  }}
                  className={`p-1.5 rounded transition-all ${
                    favorites.includes(song.id)
                      ? 'text-cinnabar'
                      : 'text-ink-pale hover:text-cinnabar'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(song.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* 匹配片段 */}
            {snippets.length > 0 && (
              <div className="mt-3 pt-3 border-t border-ink-pale/10">
                <div className="text-xs text-ink-light mb-2 flex items-center gap-1">
                  <Music className="w-3 h-3" />
                  匹配片段：
                </div>
                <div className="space-y-1.5">
                  {snippets.map((snippet, idx) => (
                    <div key={idx} className="text-sm leading-relaxed">
                      {renderHighlightedSnippet(snippet)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
