import { useMemo } from 'react';
import { Heart, User, Music, ChevronLeft } from 'lucide-react';
import type { Song } from '@/types';
import statsData from '@/data/stats_data.json';

interface LyricistPhrase {
  phrase: string;
  count: number;
}

interface LyricistPhrasesData {
  [key: string]: LyricistPhrase[];
}

interface LyricistViewProps {
  songs: Song[];
  selectedLyricist: string | null;
  onLyricistSelect: (lyricist: string | null) => void;
  favoriteLyricists: string[];
  onToggleFavorite: (lyricist: string) => void;
  onSelectSong: (song: Song) => void;
}

export function LyricistView({
  songs,
  selectedLyricist,
  onLyricistSelect,
  favoriteLyricists,
  onToggleFavorite,
  onSelectSong,
}: LyricistViewProps) {

  // 统计词作人数据 - 按作品数量排序
  const lyricistStats = useMemo(() => {
    const stats: Record<string, { count: number; songs: Song[] }> = {};
    songs.forEach(song => {
      if (song.lyricist && song.lyricist !== '未知') {
        if (!stats[song.lyricist]) {
          stats[song.lyricist] = { count: 0, songs: [] };
        }
        stats[song.lyricist].count++;
        stats[song.lyricist].songs.push(song);
      }
    });
    // 按作品数量降序排序
    return Object.entries(stats).sort(([, a], [, b]) => b.count - a.count);
  }, [songs]);

  // 获取所有词作人名字列表（用于顶部索引）
  const lyricistNames = useMemo(() => {
    return lyricistStats.map(([name]) => name);
  }, [lyricistStats]);

  // 收藏的词作人
  const favoriteLyricistStats = useMemo(() => {
    return lyricistStats.filter(([lyricist]) => favoriteLyricists.includes(lyricist));
  }, [lyricistStats, favoriteLyricists]);

  // 当前选中的词作人歌曲列表（按年份倒序）
  const selectedLyricistSongs = useMemo(() => {
    if (!selectedLyricist) return [];
    const entry = lyricistStats.find(([name]) => name === selectedLyricist);
    return entry ? entry[1].songs.sort((a, b) => b.year_only.localeCompare(a.year_only)) : [];
  }, [selectedLyricist, lyricistStats]);

  // 获取词作人的高频词组
  const lyricistPhrasesData = statsData.lyricist_phrases as LyricistPhrasesData;
  const getLyricistTopPhrases = (lyricist: string): LyricistPhrase[] => {
    return lyricistPhrasesData[lyricist]?.slice(0, 10) || [];
  };

  // 处理词作人点击
  const handleLyricistClick = (lyricist: string) => {
    onLyricistSelect(lyricist);
  };

  // 处理收藏点击
  const handleFavoriteClick = (e: React.MouseEvent, lyricist: string) => {
    e.stopPropagation();
    onToggleFavorite(lyricist);
  };

  // 返回词作人列表
  const handleBackToList = () => {
    onLyricistSelect(null);
  };

  // 滚动到指定词作人 - 修复移动端跳转
  const scrollToLyricist = (lyricist: string) => {
    // 使用 setTimeout 确保在移动端的渲染完成后执行
    setTimeout(() => {
      const element = document.getElementById(`lyricist-${lyricist}`);
      if (element) {
        const headerOffset = 120; // 考虑固定头部的高度
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 50);
  };

  // 显示的歌曲列表（选中词作人时）
  if (selectedLyricist) {
    return (
      <div className="space-y-6 pb-20 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* 返回按钮 */}
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-ink-light hover:text-cinnabar transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>返回词作人列表</span>
        </button>

        {/* 词作人标题 */}
        <div className="flex items-center gap-4 p-4 bg-paper-light rounded-lg border border-ink-pale/20">
          <div className="w-12 h-12 rounded-full bg-cinnabar/10 flex items-center justify-center">
            <User className="w-6 h-6 text-cinnabar" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-ink">{selectedLyricist}</h2>
            <p className="text-sm text-ink-light">{selectedLyricistSongs.length} 首作品</p>
          </div>
          <button
            onClick={() => onToggleFavorite(selectedLyricist)}
            className={`p-2 rounded-lg transition-all ${
              favoriteLyricists.includes(selectedLyricist)
                ? 'text-cinnabar bg-cinnabar/10'
                : 'text-ink-pale hover:text-cinnabar hover:bg-cinnabar/5'
            }`}
          >
            <Heart className={`w-5 h-5 ${favoriteLyricists.includes(selectedLyricist) ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* 常用词组 */}
        {getLyricistTopPhrases(selectedLyricist).length > 0 && (
          <div className="bg-paper-light rounded-lg border border-ink-pale/20 p-4">
            <h3 className="text-sm font-medium text-ink mb-3">常用词组（Top 10）</h3>
            <div className="flex flex-wrap gap-2">
              {getLyricistTopPhrases(selectedLyricist).map((item: LyricistPhrase, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-cinnabar/10 text-cinnabar text-xs rounded-full"
                >
                  {item.phrase} ({item.count}次)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 歌曲列表 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {selectedLyricistSongs.map(song => (
            <div
              key={song.id}
              onClick={() => onSelectSong(song)}
              className="group p-4 bg-paper-light rounded-lg border border-ink-pale/20 hover:border-cinnabar/30 hover:shadow-md cursor-pointer transition-all"
            >
              <div className="font-medium text-ink group-hover:text-cinnabar transition-colors truncate">
                {song.name}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-ink-light">
                <span>{song.year_only}</span>
                {song.album && (
                  <span className="text-cinnabar/70">{song.album}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* 页面标题 */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-ink">词作人</h2>
        <p className="text-sm text-ink-light">共{lyricistStats.length}位词作人（按作品数量排序）</p>
      </div>

      {/* 顶部词作人名字索引栏 - 紧凑排列 */}
      <div className="sticky top-16 z-20 bg-paper/95 backdrop-blur-sm py-3 border-b border-ink-pale/10">
        <div className="flex flex-wrap gap-1.5 justify-center max-h-32 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {lyricistNames.map(name => (
            <button
              key={name}
              onClick={() => scrollToLyricist(name)}
              className="px-2 py-1 rounded-md bg-paper-light border border-ink-pale/20 
                text-ink text-xs font-medium hover:bg-cinnabar/10 hover:border-cinnabar/30 
                hover:text-cinnabar transition-all duration-200 whitespace-nowrap"
              title={`跳转到 ${name}`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* 收藏的词作人 */}
      {favoriteLyricistStats.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-cinnabar flex items-center gap-2">
            <Heart className="w-5 h-5 fill-current" />
            收藏的词作人 ({favoriteLyricistStats.length}位)
          </h3>
          <div className="flex flex-wrap gap-2">
            {favoriteLyricistStats.map(([lyricist, data]) => (
              <div
                key={lyricist}
                onClick={() => handleLyricistClick(lyricist)}
                className="group relative w-[120px] h-[60px] p-2 bg-cinnabar/5 rounded-lg border border-cinnabar/20 hover:bg-cinnabar/10 cursor-pointer transition-all flex flex-col items-center justify-center"
              >
                <button
                  onClick={(e) => handleFavoriteClick(e, lyricist)}
                  className="absolute top-1 right-1 p-0.5 text-cinnabar"
                >
                  <Heart className="w-3 h-3 fill-current" />
                </button>
                <div className="font-medium text-ink text-sm text-center truncate w-full px-1">
                  {lyricist}
                </div>
                <div className="text-[10px] text-ink-light">{data.count}首</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 按作品数量排序的词作人列表 */}
      <div className="space-y-6">
        {lyricistStats.map(([lyricist, data]) => (
          <div key={lyricist} id={`lyricist-${lyricist}`} className="space-y-3 scroll-mt-32">
            {/* 词作人标题 */}
            <div className="flex items-center gap-3 sticky top-28 bg-paper/95 backdrop-blur-sm py-2 z-10">
              <div className="px-3 py-1 rounded bg-cinnabar/10 flex items-center justify-center whitespace-nowrap">
                <span className="text-cinnabar font-bold text-sm">{lyricist}</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-ink-pale/30 to-transparent" />
              <span className="text-xs text-ink-light whitespace-nowrap">{data.count} 首作品</span>
            </div>

            {/* 歌曲卡片网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {data.songs.sort((a, b) => b.year_only.localeCompare(a.year_only)).map(song => (
                <div
                  key={song.id}
                  onClick={() => onSelectSong(song)}
                  className="group p-4 bg-paper-light rounded-lg border border-ink-pale/20 hover:border-cinnabar/30 hover:shadow-md cursor-pointer transition-all"
                >
                  <div className="font-medium text-ink group-hover:text-cinnabar transition-colors truncate">
                    {song.name}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-ink-light">
                    <span>{song.year_only}</span>
                    {song.album && (
                      <span className="text-cinnabar/70">{song.album}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 提示信息 */}
      <div className="text-center py-8 text-ink-light text-sm">
        <Music className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p>点击词作人名字可查看其作品列表</p>
      </div>
    </div>
  );
}
