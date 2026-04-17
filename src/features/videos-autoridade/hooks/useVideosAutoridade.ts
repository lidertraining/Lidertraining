import { useQuery } from '@tanstack/react-query';
import {
  listAutoridades,
  listContextos,
  listVideos,
  listVideosAdmin,
} from '../api/videosAutoridade';

const STALE = 5 * 60 * 1000;

export function useAutoridades() {
  return useQuery({
    queryKey: ['autoridades'],
    queryFn: listAutoridades,
    staleTime: STALE,
  });
}

export function useContextosVideo() {
  return useQuery({
    queryKey: ['contextos_video'],
    queryFn: listContextos,
    staleTime: STALE,
  });
}

export function useVideosAutoridade(filtros?: { contexto?: string; autoridade?: string }) {
  return useQuery({
    queryKey: ['videos_autoridade', filtros],
    queryFn: () => listVideos(filtros),
    staleTime: 30_000,
  });
}

export function useVideosAutoridadeAdmin() {
  return useQuery({
    queryKey: ['videos_autoridade', 'admin'],
    queryFn: listVideosAdmin,
    staleTime: 30_000,
  });
}
