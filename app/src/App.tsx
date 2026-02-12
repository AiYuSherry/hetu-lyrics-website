import { useState, useEffect, useMemo, useCallback } from 'react';
import { Hero } from './sections/Hero';
import { Navigation } from './sections/Navigation';
import { SongList } from './sections/SongList';
import { SongDetail } from './sections/SongDetail';
import { Statistics } from './sections/Statistics';
import { LyricistView } from './sections/LyricistView';
import { LyricSnippetsView } from './sections/LyricSnippetsView';
import { GlobalSearch } from './sections/GlobalSearch';
import { Footer } from './sections/Footer';
import { useFavorites } from './hooks/useFavorites';
import { useLyricistFavorites } from './hooks/useLyricistFavorites';
import { useComments } from './hooks/useComments';
import { useLyricSnippets } from './hooks/useLyricSnippets';
import type { Song, ViewMode } from './types';
import songsData from './data/songs_data.json';
import './App.css';

function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('timeline');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedLyricist, setSelectedLyricist] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'name' | 'lyrics' | 'all' | 'wordfreq'>('all');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const songs = useMemo(() => songsData as Song[], []);
  
  // 歌曲收藏功能
  const { 
    favorites, 
    toggleFavorite: toggleSongFavorite, 
    isFavorite: isSongFavorite, 
    favoritesCount: songFavoritesCount 
  } = useFavorites();

  // 词作人收藏功能
  const {
    favorites: lyricistFavorites,
    toggleFavorite: toggleLyricistFavorite,
  } = useLyricistFavorites();

  // 歌词片段收藏功能
  const {
    snippets: lyricSnippets,
    snippetsCount: lyricSnippetsCount,
    addSnippet: addLyricSnippet,
    deleteSnippet: deleteLyricSnippet,
    getSnippetsBySongId,
  } = useLyricSnippets();

  // 评论功能
  const {
    getCommentsBySongId,
    addComment,
    deleteComment,
    getCommentCount,
  } = useComments();

  // 计算评论总数
  const commentsCount = useMemo(() => {
    return songs.reduce((sum, song) => sum + getCommentCount(song.id), 0);
  }, [songs, getCommentCount]);

  // 处理歌曲选择
  const handleSelectSong = useCallback((song: Song) => {
    setSelectedSong(song);
    setIsDetailOpen(true);
  }, []);

  // 根据歌曲ID选择歌曲（用于歌词片段收藏跳转）
  const handleSelectSongById = useCallback((songId: number) => {
    const song = songs.find(s => s.id === songId);
    if (song) {
      setSelectedSong(song);
      setIsDetailOpen(true);
    }
  }, [songs]);

  // 处理关闭详情
  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedSong(null), 300);
  }, []);

  // 获取当前歌曲的评论
  const currentComments = selectedSong 
    ? getCommentsBySongId(selectedSong.id) 
    : [];

  // 获取当前歌曲的收藏片段文本列表
  const currentSongFavoritedSnippets = useMemo(() => {
    if (!selectedSong) return [];
    return getSnippetsBySongId(selectedSong.id).map(s => s.snippetText);
  }, [selectedSong, getSnippetsBySongId]);

  // 处理添加评论
  const handleAddComment = useCallback((content: string) => {
    if (selectedSong) {
      addComment(selectedSong.id, content);
    }
  }, [selectedSong, addComment]);

  // 处理添加歌词片段收藏
  const handleAddLyricSnippet = useCallback((snippet: { snippetText: string; songId: number; songTitle: string; lyricist: string }) => {
    addLyricSnippet(snippet);
  }, [addLyricSnippet]);

  // 清除搜索
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // 处理视图切换 - 清除搜索
  const handleViewChange = useCallback((view: ViewMode) => {
    setCurrentView(view);
    setSearchQuery('');
    setSelectedYear(null);
    setSelectedAlbum(null);
    setSelectedLyricist(null);
  }, []);

  // 获取视图标题
  const getViewTitle = () => {
    if (searchQuery.trim()) {
      return '搜索结果';
    }
    switch (currentView) {
      case 'favorites': return '我的收藏';
      case 'album': return '专辑浏览';
      case 'lyricist': return '词作人';
      case 'statistics': return '数据统计';
      case 'alphabet': return '首字母排序';
      case 'lyricSnippets': return '歌词片段收藏';
      default: return '时间线';
    }
  };

  // 判断是否显示搜索结果
  const showSearchResults = searchQuery.trim().length > 0;

  // 如果没有进入，显示Hero
  if (!hasEntered) {
    return (
      <Hero 
        onEnter={() => setHasEntered(true)} 
        songCount={songs.length}
        favoriteCount={songFavoritesCount}
      />
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* 导航 */}
      <Navigation
        currentView={currentView}
        onViewChange={handleViewChange}
        selectedYear={selectedYear}
        onYearSelect={setSelectedYear}
        selectedAlbum={selectedAlbum}
        onAlbumSelect={setSelectedAlbum}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchScope={searchScope}
        onSearchScopeChange={setSearchScope}
        songs={songs}
        favoritesCount={songFavoritesCount}
        commentsCount={commentsCount}
        lyricSnippetsCount={lyricSnippetsCount}
      />

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 标题区域 */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-ink mb-2">
            {getViewTitle()}
          </h1>
          {!showSearchResults && currentView !== 'statistics' && currentView !== 'lyricist' && currentView !== 'lyricSnippets' && (
            <p className="text-sm text-ink-light">
              {currentView === 'favorites' 
                ? `共收藏 ${songFavoritesCount} 首歌曲`
                : `共 ${songs.length} 首歌曲`
              }
            </p>
          )}
          {currentView === 'lyricSnippets' && (
            <p className="text-sm text-ink-light">
              共收藏 {lyricSnippetsCount} 条歌词片段
            </p>
          )}
        </div>

        {/* 搜索结果 - 全局显示 */}
        {showSearchResults && (
          <GlobalSearch
            songs={songs}
            searchQuery={searchQuery}
            searchScope={searchScope}
            favorites={favorites.map(f => f.songId)}
            onToggleFavorite={toggleSongFavorite}
            onSelectSong={handleSelectSong}
            onClearSearch={handleClearSearch}
          />
        )}

        {/* 统计视图 */}
        {!showSearchResults && currentView === 'statistics' && (
          <Statistics songs={songs} onSelectSong={handleSelectSong} />
        )}

        {/* 词作人视图 */}
        {!showSearchResults && currentView === 'lyricist' && (
          <LyricistView
            songs={songs}
            selectedLyricist={selectedLyricist}
            onLyricistSelect={setSelectedLyricist}
            favoriteLyricists={lyricistFavorites.map(f => f.lyricist)}
            onToggleFavorite={toggleLyricistFavorite}
            onSelectSong={handleSelectSong}
          />
        )}

        {/* 歌词片段收藏视图 */}
        {!showSearchResults && currentView === 'lyricSnippets' && (
          <LyricSnippetsView
            snippets={lyricSnippets}
            onDeleteSnippet={deleteLyricSnippet}
            onSelectSong={handleSelectSongById}
          />
        )}

        {/* 歌曲列表 (时间线、专辑、收藏、首字母) */}
        {!showSearchResults && currentView !== 'statistics' && currentView !== 'lyricist' && currentView !== 'lyricSnippets' && (
          <SongList
            songs={songs}
            viewMode={currentView}
            selectedYear={selectedYear}
            selectedAlbum={selectedAlbum}
            searchQuery=""
            searchScope="all"
            favorites={favorites.map(f => f.songId)}
            onToggleFavorite={toggleSongFavorite}
            onSelectSong={handleSelectSong}
            getCommentCount={getCommentCount}
          />
        )}
      </main>

      {/* 页脚 */}
      <Footer />

      {/* 歌曲详情模态框 */}
      <SongDetail
        song={selectedSong}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        isFavorite={selectedSong ? isSongFavorite(selectedSong.id) : false}
        onToggleFavorite={() => selectedSong && toggleSongFavorite(selectedSong.id)}
        comments={currentComments}
        onAddComment={handleAddComment}
        onDeleteComment={deleteComment}
        onAddLyricSnippet={handleAddLyricSnippet}
        favoritedSnippets={currentSongFavoritedSnippets}
      />

      {/* 返回顶部按钮 */}
      <BackToTop />
    </div>
  );
}

// 返回顶部组件
function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 w-10 h-10 bg-cinnabar text-white rounded-full shadow-lg hover:bg-cinnabar-dark hover:shadow-xl transition-all hover:-translate-y-1 z-40"
      title="返回顶部"
    >
      <svg 
        className="w-5 h-5 mx-auto" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>
    </button>
  );
}

export default App;
