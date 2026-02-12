export interface Song {
  id: number;
  name: string;
  year: string;
  year_only: string;
  album: string;
  lyricist: string;
  composer: string;
  arranger: string;
  singer?: string;
  initial: string;
  lyrics?: string;
}

export interface Comment {
  id: string;
  songId: number;
  content: string;
  author: string;
  createdAt: string;
}

export interface Favorite {
  songId: number;
  addedAt: string;
}

export interface LyricistFavorite {
  lyricist: string;
  addedAt: string;
}

export interface SongAnalysis {
  songId: number;
  wordCount: number;
  lineCount: number;
  repeatedLines: string[];
  keywords: string[];
}

export interface ImageStat {
  word: string;
  count: number;
  songs: { id: number; name: string; lyricist: string }[];
}

export type ViewMode = 'statistics' | 'timeline' | 'album' | 'lyricist' | 'favorites' | 'alphabet' | 'lyricSnippets';

export interface NavItem {
  id: string;
  label: string;
  icon?: string;
}
