import { useState } from 'react';
import { Music, User, Calendar, Trash2, Quote } from 'lucide-react';

interface LyricSnippet {
  id: string;
  snippetText: string;
  songId: number;
  songTitle: string;
  lyricist: string;
  timestamp: string;
}

interface LyricSnippetsViewProps {
  snippets: LyricSnippet[];
  onDeleteSnippet: (id: string) => void;
  onSelectSong: (songId: number) => void;
}

export function LyricSnippetsView({
  snippets,
  onDeleteSnippet,
  onSelectSong,
}: LyricSnippetsViewProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 按时间倒序排列
  const sortedSnippets = [...snippets].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // 处理跳转到歌曲
  const handleGoToSong = (songId: number) => {
    onSelectSong(songId);
  };

  // 处理删除
  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      onDeleteSnippet(id);
      setDeletingId(null);
    }, 200);
  };

  // 格式化日期
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (snippets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-ink-light">
        <Quote className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg mb-2">暂无收藏的歌词片段</p>
        <p className="text-sm">在歌曲详情页选中歌词句子即可收藏</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* 统计信息 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-light">
          共收藏 <span className="text-cinnabar font-medium">{snippets.length}</span> 条歌词片段
        </p>
      </div>

      {/* 收藏列表 */}
      <div className="grid grid-cols-1 gap-4">
        {sortedSnippets.map((snippet) => (
          <div
            key={snippet.id}
            className={`group relative p-5 bg-paper-light rounded-lg border border-ink-pale/20 hover:border-cinnabar/30 transition-all duration-200 ${
              deletingId === snippet.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {/* 引号装饰 */}
            <div className="absolute top-3 left-3 text-cinnabar/20">
              <Quote className="w-8 h-8" />
            </div>

            {/* 歌词内容 */}
            <div className="pl-8 pr-12">
              <p className="text-lg text-ink leading-relaxed font-medium mb-4">
                {snippet.snippetText}
              </p>

              {/* 出处信息 */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-ink-light">
                <button
                  onClick={() => handleGoToSong(snippet.songId)}
                  className="flex items-center gap-1 hover:text-cinnabar transition-colors"
                >
                  <Music className="w-3.5 h-3.5" />
                  <span className="underline underline-offset-2">{snippet.songTitle}</span>
                </button>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {snippet.lyricist}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(snippet.timestamp)}
                </span>
              </div>
            </div>

            {/* 删除按钮 */}
            <button
              onClick={() => handleDelete(snippet.id)}
              className="absolute top-4 right-4 p-2 rounded-full text-ink-light hover:text-cinnabar hover:bg-cinnabar/10 opacity-0 group-hover:opacity-100 transition-all"
              title="删除收藏"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="text-center text-xs text-ink-light pt-4">
        <p>点击歌曲名可跳转到歌曲详情</p>
      </div>
    </div>
  );
}
