'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../axios';
import type { SwitchComment, CommentType } from '@/types/switch';

export const useComments = (switchId: string) => {
  return useQuery<SwitchComment[]>({
    queryKey: ['comments', switchId],
    queryFn: async () => {
      const { data } = await api.get(`/comments?switchId=${switchId}`);
      return data;
    },
    enabled: !!switchId,
  });
};

export const useCreateComment = (switchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      content: string;
      author: string;
      type: CommentType;
      soundUrl?: string;
    }) => {
      const { data } = await api.post('/comments', { switchId, ...payload });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', switchId] });
    },
  });
};
