import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Favorite } from '@/types';

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<Favorite[]>('hetu-favorites', []);

  const isFavorite = useCallback((songId: number): boolean => {
    return favorites.some(f => f.songId === songId);
  }, [favorites]);

  const addFavorite = useCallback((songId: number) => {
    setFavorites(prev => {
      if (prev.some(f => f.songId === songId)) return prev;
      return [...prev, { songId, addedAt: new Date().toISOString() }];
    });
  }, [setFavorites]);

  const removeFavorite = useCallback((songId: number) => {
    setFavorites(prev => prev.filter(f => f.songId !== songId));
  }, [setFavorites]);

  const toggleFavorite = useCallback((songId: number) => {
    if (isFavorite(songId)) {
      removeFavorite(songId);
    } else {
      addFavorite(songId);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  const getFavoriteSongs = useCallback((allSongs: { id: number }[]) => {
    return allSongs.filter(song => favorites.some(f => f.songId === song.id));
  }, [favorites]);

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    getFavoriteSongs,
    favoritesCount: favorites.length,
  };
}
