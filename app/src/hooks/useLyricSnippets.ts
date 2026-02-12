import { useState, useEffect, useCallback } from 'react';

export interface LyricSnippet {
  id: string;
  snippetText: string;
  songId: number;
  songTitle: string;
  lyricist: string;
  timestamp: string;
}

const STORAGE_KEY = 'hetu-lyric-snippets';

export function useLyricSnippets() {
  const [snippets, setSnippets] = useState<LyricSnippet[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载收藏
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSnippets(parsed);
      } catch (e) {
        console.error('Failed to parse lyric snippets:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
    }
  }, [snippets, isLoaded]);

  // 添加收藏
  const addSnippet = useCallback((snippet: Omit<LyricSnippet, 'id' | 'timestamp'>) => {
    const newSnippet: LyricSnippet = {
      ...snippet,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    setSnippets(prev => [newSnippet, ...prev]);
    return newSnippet.id;
  }, []);

  // 删除收藏
  const deleteSnippet = useCallback((id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
  }, []);

  // 检查是否已收藏
  const isSnippetFavorited = useCallback((snippetText: string, songId: number) => {
    return snippets.some(s => 
      s.snippetText === snippetText && s.songId === songId
    );
  }, [snippets]);

  // 获取某歌曲的收藏片段
  const getSnippetsBySongId = useCallback((songId: number) => {
    return snippets.filter(s => s.songId === songId);
  }, [snippets]);

  // 获取收藏数量
  const snippetsCount = snippets.length;

  return {
    snippets,
    snippetsCount,
    addSnippet,
    deleteSnippet,
    isSnippetFavorited,
    getSnippetsBySongId,
    isLoaded,
  };
}
