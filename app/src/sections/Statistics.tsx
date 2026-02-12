import { useState, useMemo, useEffect } from 'react';
import { Calendar, Disc, User, Music, TrendingUp, BarChart3, BookOpen, ChevronDown, ChevronUp, ExternalLink, Hash, PieChart } from 'lucide-react';
import type { Song } from '@/types';
import statsData from '@/data/stats_data.json';

interface StatisticsProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
}

// 从统计数据获取词组信息
interface PhraseData {
  rank: number;
  phrase: string;
  count: number;
  song_count: number;
  songs: { id: number; name: string; lyricist: string; year: string }[];
}

interface LyricistPhraseData {
  phrase: string;
  count: number;
}

export function Statistics({ songs, onSelectSong }: StatisticsProps) {
  const [expandedLyricist, setExpandedLyricist] = useState<string | null>(null);
  const [expandedPhrase, setExpandedPhrase] = useState<string | null>(null);
  const [showTopPhrases, setShowTopPhrases] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('overview');

  // 获取统计数据
  const top50Phrases: PhraseData[] = statsData.top50_phrases;
  const lyricistPhrases: Record<string, LyricistPhraseData[]> = statsData.lyricist_phrases;

  // 总体统计数据
  const stats = useMemo(() => {
    // 每年歌曲数
    const yearCounts: Record<string, number> = {};
    songs.forEach(song => {
      const year = song.year_only;
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    const yearData = Object.entries(yearCounts).sort(([a], [b]) => a.localeCompare(b));
    
    // 专辑统计
    const albumSongs = songs.filter(s => s.album);
    const singleSongs = songs.filter(s => !s.album);
    const albumCounts: Record<string, number> = {};
    albumSongs.forEach(song => {
      albumCounts[song.album] = (albumCounts[song.album] || 0) + 1;
    });
    const albumData = Object.entries(albumCounts).sort(([, a], [, b]) => b - a);
    
    // 词作人统计
    const lyricistCounts: Record<string, number> = {};
    songs.forEach(song => {
      if (song.lyricist && song.lyricist !== '未知') {
        lyricistCounts[song.lyricist] = (lyricistCounts[song.lyricist] || 0) + 1;
      }
    });
    const lyricistData = Object.entries(lyricistCounts).sort(([, a], [, b]) => b - a);
    
    // 总体统计
    const totalSongs = songs.length;
    const totalAlbums = Object.keys(albumCounts).length;
    const totalLyricists = Object.keys(lyricistCounts).length;
    const yearRange = `${Math.min(...Object.keys(yearCounts).map(Number))}-${Math.max(...Object.keys(yearCounts).map(Number))}`;
    
    // 计算折线图数据
    const maxYearCount = Math.max(...Object.values(yearCounts));
    
    return {
      yearData,
      albumData,
      lyricistData,
      totalSongs,
      totalAlbums,
      totalLyricists,
      yearRange,
      singleSongs: singleSongs.length,
      albumSongs: albumSongs.length,
      maxYearCount,
    };
  }, [songs]);

  // 获取歌曲详情
  const getSongById = (id: number) => songs.find(s => s.id === id);

  // 获取词作人的高频二字词组
  const getLyricistTopPhrases = (lyricist: string): LyricistPhraseData[] => {
    return lyricistPhrases[lyricist] || [];
  };

  // 滚动监听 - 高亮当前可见章节
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'phrases', 'lyricist', 'timeline', 'album'];
      let current = 'overview';
      
      for (const section of sections) {
        const element = document.getElementById(`stats-${section}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 快速导航点击
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`stats-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 导航项配置
  const navItems = [
    { id: 'overview', label: '概览', icon: PieChart },
    { id: 'phrases', label: '高频词组', icon: Hash },
    { id: 'lyricist', label: '词作人', icon: User },
    { id: 'timeline', label: '时间线', icon: TrendingUp },
    { id: 'album', label: '专辑', icon: Disc },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* 快速跳转导航 */}
      <div className="sticky top-14 z-30 bg-paper/95 backdrop-blur-sm border-b border-ink-pale/10 py-3">
        <div className="flex flex-wrap gap-2 justify-center">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                activeSection === id
                  ? 'bg-cinnabar text-white'
                  : 'bg-paper-light text-ink-light hover:text-ink hover:bg-ink-pale/10 border border-ink-pale/20'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 概览统计 */}
      <div id="stats-overview" className="space-y-8">
        {/* 总体统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-paper-light rounded-lg border border-ink-pale/20 p-4 text-center">
            <Music className="w-6 h-6 mx-auto mb-2 text-cinnabar" />
            <div className="text-2xl font-bold text-ink">{stats.totalSongs}</div>
            <div className="text-xs text-ink-light">总歌曲数</div>
          </div>
          <div className="bg-paper-light rounded-lg border border-ink-pale/20 p-4 text-center">
            <Disc className="w-6 h-6 mx-auto mb-2 text-cinnabar" />
            <div className="text-2xl font-bold text-ink">{stats.totalAlbums}</div>
            <div className="text-xs text-ink-light">专辑数</div>
          </div>
          <div className="bg-paper-light rounded-lg border border-ink-pale/20 p-4 text-center">
            <User className="w-6 h-6 mx-auto mb-2 text-cinnabar" />
            <div className="text-2xl font-bold text-ink">{stats.totalLyricists}</div>
            <div className="text-xs text-ink-light">词作人数</div>
          </div>
          <div className="bg-paper-light rounded-lg border border-ink-pale/20 p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-cinnabar" />
            <div className="text-2xl font-bold text-ink">{stats.yearRange}</div>
            <div className="text-xs text-ink-light">时间跨度</div>
          </div>
        </div>

        {/* 单曲 vs 专辑 */}
        <div className="bg-paper-light rounded-lg border border-ink-pale/20 p-6">
          <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
            <Disc className="w-5 h-5 text-cinnabar" />
            单曲与专辑分布
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-ink-light">单曲</span>
                <span className="text-sm font-medium text-ink">{stats.singleSongs}首 ({Math.round(stats.singleSongs/stats.totalSongs*100)}%)</span>
              </div>
              <div className="h-4 bg-ink-pale/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-ink-pale/50 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.singleSongs/stats.totalSongs)*100}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-ink-light">专辑歌曲</span>
                <span className="text-sm font-medium text-ink">{stats.albumSongs}首 ({Math.round(stats.albumSongs/stats.totalSongs*100)}%)</span>
              </div>
              <div className="h-4 bg-cinnabar/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cinnabar rounded-full transition-all duration-500"
                  style={{ width: `${(stats.albumSongs/stats.totalSongs)*100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 高频二字词组 - Top 50 */}
      <div id="stats-phrases" className="bg-gradient-to-br from-cinnabar/5 to-paper-light rounded-lg border-2 border-cinnabar/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-ink flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cinnabar" />
            经典词组排行 (Top 50)
            <span className="text-xs px-2 py-0.5 bg-cinnabar/10 text-cinnabar rounded-full">两字词组</span>
          </h3>
          <button
            onClick={() => setShowTopPhrases(!showTopPhrases)}
            className="flex items-center gap-1 text-sm text-cinnabar hover:underline"
          >
            {showTopPhrases ? (
              <><ChevronUp className="w-4 h-4" /> 收起</>
            ) : (
              <><ChevronDown className="w-4 h-4" /> 展开</>
            )}
          </button>
        </div>
        
        {showTopPhrases && (
          <>
            {/* 紧凑网格展示 - 每行8-10个 */}
            <div className="mb-6">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {top50Phrases.map((item, index) => (
                  <button
                    key={item.phrase}
                    onClick={() => setExpandedPhrase(expandedPhrase === item.phrase ? null : item.phrase)}
                    className={`
                      relative px-2 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-center
                      ${index < 3 ? 'bg-cinnabar/20 text-cinnabar font-bold' : 
                        index < 10 ? 'bg-cinnabar/15 text-cinnabar/90 font-medium' :
                        index < 20 ? 'bg-cinnabar/10 text-cinnabar/80' :
                        'bg-cinnabar/5 text-cinnabar/70 text-sm'}
                    `}
                  >
                    <div className="text-sm">{item.phrase}</div>
                    <div className="text-[10px] opacity-70">{item.count}次</div>
                    {index < 3 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-cinnabar text-white text-[10px] rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 详细列表 */}
            <div className="space-y-2">
              {top50Phrases.map((item, index) => (
                <div key={item.phrase} className="border border-cinnabar/10 rounded-lg overflow-hidden bg-white/50">
                  <div 
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-cinnabar/5"
                    onClick={() => setExpandedPhrase(expandedPhrase === item.phrase ? null : item.phrase)}
                  >
                    <span className={`
                      text-sm w-6 h-6 rounded-full flex items-center justify-center
                      ${index < 3 ? 'bg-cinnabar text-white' : 'text-ink-light'}
                    `}>
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-cinnabar w-16">{item.phrase}</span>
                    <div className="flex-1 h-4 bg-ink-pale/10 rounded overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cinnabar/80 to-cinnabar/40 rounded transition-all duration-500"
                        style={{ width: `${(item.count / top50Phrases[0].count) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-ink-light w-16 text-right">{item.count}次</span>
                    <span className="text-xs text-ink-light">{item.song_count}首</span>
                    {expandedPhrase === item.phrase ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                  
                  {expandedPhrase === item.phrase && (
                    <div className="px-4 pb-3 bg-paper/50">
                      <div className="text-xs text-ink-light mb-2">出现作品：</div>
                      <div className="flex flex-wrap gap-2">
                        {item.songs.map(song => (
                          <button
                            key={song.id}
                            onClick={() => {
                              const fullSong = getSongById(song.id);
                              if (fullSong) onSelectSong(fullSong);
                            }}
                            className="text-xs px-2 py-1 bg-cinnabar/10 text-cinnabar rounded hover:bg-cinnabar/20 flex items-center gap-1"
                          >
                            {song.name}
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 词作人统计 */}
      <div id="stats-lyricist" className="bg-paper-light rounded-lg border border-ink-pale/20 p-6">
        <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cinnabar" />
          词作人作品分析
        </h3>
        <div className="space-y-2">
          {stats.lyricistData.map(([lyricist, count], index) => (
            <div key={lyricist} className="border border-ink-pale/10 rounded-lg overflow-hidden">
              <div 
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-ink-pale/5"
                onClick={() => setExpandedLyricist(expandedLyricist === lyricist ? null : lyricist)}
              >
                <span className="text-sm text-ink-light w-6">{index + 1}</span>
                <span className="text-sm text-ink w-24 truncate">{lyricist}</span>
                <div className="flex-1 h-4 bg-ink-pale/10 rounded overflow-hidden">
                  <div 
                    className="h-full bg-cinnabar/60 rounded transition-all duration-500"
                    style={{ width: `${(count / stats.lyricistData[0][1]) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-ink-light w-10 text-right">{count}首</span>
                {expandedLyricist === lyricist ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
              
              {expandedLyricist === lyricist && (
                <div className="px-4 pb-3 bg-paper/50">
                  {/* 该词作人的作品列表 */}
                  <div className="mb-4">
                    <div className="text-xs text-ink-light mb-2">作品列表：</div>
                    <div className="flex flex-wrap gap-2">
                      {songs
                        .filter(s => s.lyricist === lyricist)
                        .map(song => (
                          <button
                            key={song.id}
                            onClick={() => onSelectSong(song)}
                            className="text-xs px-2 py-1 bg-cinnabar/10 text-cinnabar rounded hover:bg-cinnabar/20 flex items-center gap-1"
                          >
                            {song.name}
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ))}
                    </div>
                  </div>
                  
                  {/* 该词作人的高频二字词组分析 - 改为显示二字词组 */}
                  <div>
                    <div className="text-xs text-ink-light mb-2">常用词组（Top 10）：</div>
                    <div className="space-y-1">
                      {getLyricistTopPhrases(lyricist).slice(0, 10).map((item, i) => (
                        <div key={item.phrase} className="flex items-center gap-2">
                          <span className="text-xs text-ink-light w-4">{i + 1}</span>
                          <span className="text-xs text-cinnabar w-12">{item.phrase}</span>
                          <div className="flex-1 h-2 bg-ink-pale/10 rounded overflow-hidden">
                            <div 
                              className="h-full bg-cinnabar/40 rounded"
                              style={{ width: `${(item.count / (getLyricistTopPhrases(lyricist)[0]?.count || 1)) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-ink-light w-10 text-right">{item.count}次</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 每年歌曲数 - 折线图 */}
      <div id="stats-timeline" className="bg-paper-light rounded-lg border border-ink-pale/20 p-6">
        <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cinnabar" />
          每年歌曲数
        </h3>
        <div className="relative h-48 md:h-64">
          {/* 折线图 SVG */}
          <svg className="w-full h-full" viewBox={`0 0 ${stats.yearData.length * 60} 200`} preserveAspectRatio="none">
            {/* 网格线 */}
            {[0, 50, 100, 150].map(y => (
              <line key={y} x1="0" y1={200 - y} x2={stats.yearData.length * 60} y2={200 - y} stroke="#e5e5e5" strokeWidth="1" />
            ))}
            
            {/* 折线 */}
            <polyline
              fill="none"
              stroke="#8B1E1E"
              strokeWidth="2"
              points={stats.yearData.map(([, count], i) => {
                const x = i * 60 + 30;
                const y = 200 - (count / stats.maxYearCount) * 180;
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* 数据点 */}
            {stats.yearData.map(([yr, count], i) => {
              const x = i * 60 + 30;
              const y = 200 - (count / stats.maxYearCount) * 180;
              return (
                <g key={yr}>
                  <circle cx={x} cy={y} r="4" fill="#8B1E1E" />
                  <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fill="#8B1E1E">{count}</text>
                </g>
              );
            })}
          </svg>
          
          {/* X轴年份标签 */}
          <div className="flex justify-between mt-2 text-xs text-ink-light">
            {stats.yearData.map(([year]) => (
              <span key={year} className="flex-1 text-center">{year}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 专辑分布 */}
      <div id="stats-album" className="bg-paper-light rounded-lg border border-ink-pale/20 p-6">
        <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
          <Disc className="w-5 h-5 text-cinnabar" />
          专辑歌曲分布
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.albumData.map(([album, count]) => (
            <div key={album} className="bg-paper rounded-lg p-4 border border-ink-pale/10">
              <div className="text-lg font-bold text-cinnabar">{count}</div>
              <div className="text-sm text-ink truncate">{album}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
