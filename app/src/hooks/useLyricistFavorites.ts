import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { LyricistFavorite } from '@/types';

export function useLyricistFavorites() {
  const [favorites, setFavorites] = useLocalStorage<LyricistFavorite[]>('hetu-lyricist-favorites', []);

  const isFavorite = useCallback((lyricist: string): boolean => {
    return favorites.some(f => f.lyricist === lyricist);
  }, [favorites]);

  const addFavorite = useCallback((lyricist: string) => {
    setFavorites(prev => {
      if (prev.some(f => f.lyricist === lyricist)) return prev;
      return [...prev, { lyricist, addedAt: new Date().toISOString() }];
    });
  }, [setFavorites]);

  const removeFavorite = useCallback((lyricist: string) => {
    setFavorites(prev => prev.filter(f => f.lyricist !== lyricist));
  }, [setFavorites]);

  const toggleFavorite = useCallback((lyricist: string) => {
    if (isFavorite(lyricist)) {
      removeFavorite(lyricist);
    } else {
      addFavorite(lyricist);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    favoritesCount: favorites.length,
  };
}
