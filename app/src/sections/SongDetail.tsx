import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Heart, MessageCircle, Copy, 
  Calendar, Disc, Music, PenTool, 
  BarChart3, ChevronLeft, BookmarkPlus, Check
} from 'lucide-react';
import type { Song, Comment } from '@/types';

interface SongDetailProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  comments: Comment[];
  onAddComment: (content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onAddLyricSnippet?: (snippet: { snippetText: string; songId: number; songTitle: string; lyricist: string }) => void;
  favoritedSnippets?: string[];
}

// 歌词分析
function analyzeLyrics(lyrics: string) {
  if (!lyrics) return null;
  
  const lines = lyrics.split('\n').filter(l => l.trim());
  const wordCount = lyrics.replace(/\s/g, '').length;
  
  // 找出重复的行
  const lineCounts: Record<string, number> = {};
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.length > 3) {
      lineCounts[trimmed] = (lineCounts[trimmed] || 0) + 1;
    }
  });
  const repeatedLines = Object.entries(lineCounts)
    .filter(([, count]) => count > 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([line]) => line);
  
  // 提取关键词（简单实现）
  const keywords = ['风', '月', '花', '雪', '梦', '情', '爱', '心', '人', '天', '地', '江', '山', '水'];
  const foundKeywords = keywords.filter(k => lyrics.includes(k)).slice(0, 8);
  
  return {
    lineCount: lines.length,
    wordCount,
    repeatedLines,
    keywords: foundKeywords,
  };
}

export function SongDetail({
  song,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  comments,
  onAddComment,
  onDeleteComment,
  onAddLyricSnippet,
  favoritedSnippets = [],
}: SongDetailProps) {
  const [activeTab, setActiveTab] = useState<'lyrics' | 'comments' | 'analysis'>('lyrics');
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showFloatButton, setShowFloatButton] = useState(false);
  const [floatPosition, setFloatPosition] = useState({ x: 0, y: 0 });
  const [justAddedSnippet, setJustAddedSnippet] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);

  // 获取歌词
  const lyrics = song?.lyrics || '歌词加载中...';
  const analysis = analyzeLyrics(lyrics);

  // ESC关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // 处理文本选择
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';
    
    if (text.length > 0 && text.length < 200) {
      setSelectedText(text);
      
      // 获取选中文本的位置
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      
      if (rect) {
        setFloatPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 50,
        });
        setShowFloatButton(true);
      }
    } else {
      setShowFloatButton(false);
      setSelectedText('');
    }
  }, []);

  // 添加歌词片段收藏
  const handleAddSnippet = useCallback(() => {
    if (!song || !selectedText || !onAddLyricSnippet) return;
    
    onAddLyricSnippet({
      snippetText: selectedText,
      songId: song.id,
      songTitle: song.name,
      lyricist: song.lyricist || '未知',
    });
    
    // 清除选择
    window.getSelection()?.removeAllRanges();
    setShowFloatButton(false);
    setSelectedText('');
    setJustAddedSnippet(true);
    setTimeout(() => setJustAddedSnippet(false), 2000);
  }, [song, selectedText, onAddLyricSnippet]);

  // 点击其他地方隐藏浮动按钮
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showFloatButton && !(e.target as HTMLElement).closest('.float-button')) {
        setShowFloatButton(false);
        window.getSelection()?.removeAllRanges();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFloatButton]);

  // 复制歌词
  const handleCopy = async () => {
    if (!song) return;
    const text = `${song.name}\n作词：${song.lyricist || '未知'}\n作曲：${song.composer || '未知'}\n\n${lyrics}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 提交评论
  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText('');
  };

  // 检查当前选中的文本是否已收藏
  const isCurrentSnippetFavorited = favoritedSnippets.includes(selectedText);

  if (!isOpen || !song) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 模态框 */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-3xl max-h-[90vh] bg-paper-light rounded-lg shadow-2xl overflow-hidden animate-fade-in-up"
      >
        {/* 顶部装饰条 */}
        <div className="h-1 bg-gradient-to-r from-transparent via-cinnabar/30 to-transparent" />
        
        {/* 头部 */}
        <div className="flex items-start justify-between p-6 border-b border-ink-pale/20">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-ink-pale/10 text-ink-light hover:text-ink transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-ink">{song.name}</h2>
            </div>
            
            {/* 歌曲信息 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-ink-light ml-10">
              {song.album && (
                <span className="flex items-center gap-1">
                  <Disc className="w-3.5 h-3.5" />
                  {song.album.replace('专辑《', '').replace('》', '')}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {song.year}
              </span>
              {song.lyricist && (
                <span className="flex items-center gap-1">
                  <PenTool className="w-3.5 h-3.5" />
                  词：{song.lyricist}
                </span>
              )}
              {song.composer && (
                <span className="flex items-center gap-1">
                  <Music className="w-3.5 h-3.5" />
                  曲：{song.composer}
                </span>
              )}
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded transition-all ${
                isFavorite 
                  ? 'text-cinnabar bg-cinnabar/10 animate-seal-stamp' 
                  : 'text-ink-light hover:text-cinnabar hover:bg-cinnabar/5'
              }`}
              title={isFavorite ? '取消收藏' : '收藏'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleCopy}
              className="p-2 rounded text-ink-light hover:text-ink hover:bg-ink-pale/10 transition-colors"
              title="复制歌词"
            >
              {copied ? <span className="text-xs text-cinnabar">已复制</span> : <Copy className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded text-ink-light hover:text-ink hover:bg-ink-pale/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* 标签页切换 */}
        <div className="flex items-center gap-1 px-6 border-b border-ink-pale/20">
          {[
            { id: 'lyrics', label: '歌词', icon: Music },
            { id: 'comments', label: `评论 (${comments.length})`, icon: MessageCircle },
            { id: 'analysis', label: '分析', icon: BarChart3 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm transition-all relative ${
                activeTab === id
                  ? 'text-cinnabar'
                  : 'text-ink-light hover:text-ink'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {activeTab === id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cinnabar" />
              )}
            </button>
          ))}
        </div>
        
        {/* 内容区域 */}
        <div 
          className="p-6 overflow-y-auto"
          style={{ 
            maxHeight: 'calc(90vh - 200px)',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >
          {/* 歌词 */}
          {activeTab === 'lyrics' && (
            <div 
              className="space-y-4 relative"
              style={{
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                paddingBottom: '100px'
              }}
            >
              <div 
                ref={lyricsRef}
                className="lyric-text text-ink leading-loose whitespace-pre-wrap pb-20 select-text"
                onMouseUp={handleTextSelection}
                onTouchEnd={handleTextSelection}
                style={{ userSelect: 'text' }}
              >
                {lyrics}
              </div>
              
              {/* 浮动收藏按钮 */}
              {showFloatButton && onAddLyricSnippet && (
                <div 
                  className="float-button fixed z-[200] transform -translate-x-1/2"
                  style={{ 
                    left: floatPosition.x, 
                    top: Math.max(floatPosition.y, 100),
                  }}
                >
                  <button
                    onClick={handleAddSnippet}
                    disabled={isCurrentSnippetFavorited || justAddedSnippet}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full shadow-lg text-sm font-medium transition-all ${
                      isCurrentSnippetFavorited || justAddedSnippet
                        ? 'bg-green-500 text-white'
                        : 'bg-cinnabar text-white hover:bg-cinnabar-dark'
                    }`}
                  >
                    {justAddedSnippet || isCurrentSnippetFavorited ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>已收藏</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-4 h-4" />
                        <span>收藏此句</span>
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {/* 提示文字 */}
              <div className="text-xs text-ink-light text-center pt-4">
                选中歌词句子可快速收藏
              </div>
            </div>
          )}
          
          {/* 评论 */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              {/* 添加评论 */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="写下你的感想..."
                    className="w-full px-3 py-2 text-sm bg-transparent border border-ink-pale/30 rounded resize-none focus:outline-none focus:border-cinnabar/50"
                    rows={3}
                  />
                </div>
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-cinnabar text-white text-sm rounded hover:bg-cinnabar-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  发表
                </button>
              </div>
              
              {/* 评论列表 */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <div className="text-center py-10 text-ink-light">
                    <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>暂无评论，来发表第一条吧</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className="p-4 bg-paper rounded border border-ink-pale/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-ink">{comment.author}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-ink-light">
                            {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                          <button
                            onClick={() => onDeleteComment(comment.id)}
                            className="text-xs text-ink-light hover:text-cinnabar transition-colors"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-ink-light leading-relaxed">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {/* 分析 */}
          {activeTab === 'analysis' && analysis && (
            <div className="space-y-6">
              {/* 基础统计 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-paper rounded border border-ink-pale/10 text-center">
                  <div className="text-3xl font-bold text-cinnabar mb-1">{analysis.wordCount}</div>
                  <div className="text-xs text-ink-light">总字数</div>
                </div>
                <div className="p-4 bg-paper rounded border border-ink-pale/10 text-center">
                  <div className="text-3xl font-bold text-cinnabar mb-1">{analysis.lineCount}</div>
                  <div className="text-xs text-ink-light">总行数</div>
                </div>
              </div>
              
              {/* 关键词 */}
              <div>
                <h4 className="text-sm font-medium text-ink mb-3">意象关键词</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.map((keyword, index) => (
                    <span 
                      key={keyword}
                      className="px-3 py-1 text-sm bg-cinnabar/10 text-cinnabar rounded-full"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* 重复句 */}
              {analysis.repeatedLines.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-ink mb-3">重复出现的句子</h4>
                  <div className="space-y-2">
                    {analysis.repeatedLines.map((line, index) => (
                      <div 
                        key={index}
                        className="p-3 bg-paper rounded border border-ink-pale/10 text-sm text-ink-light italic"
                      >
                        "{line}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
