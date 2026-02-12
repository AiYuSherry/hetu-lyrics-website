import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Comment } from '@/types';

export function useComments() {
  const [comments, setComments] = useLocalStorage<Comment[]>('hetu-comments', []);

  const getCommentsBySongId = useCallback((songId: number): Comment[] => {
    return comments
      .filter(c => c.songId === songId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [comments]);

  const addComment = useCallback((songId: number, content: string, author: string = '访客') => {
    const newComment: Comment = {
      id: Date.now().toString(),
      songId,
      content,
      author,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [newComment, ...prev]);
    return newComment;
  }, [setComments]);

  const deleteComment = useCallback((commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  }, [setComments]);

  const getCommentCount = useCallback((songId: number): number => {
    return comments.filter(c => c.songId === songId).length;
  }, [comments]);

  return {
    comments,
    getCommentsBySongId,
    addComment,
    deleteComment,
    getCommentCount,
    totalComments: comments.length,
  };
}
