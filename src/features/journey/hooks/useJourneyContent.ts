import { useQuery } from '@tanstack/react-query';
import {
  listJourneySteps,
  listObjections,
  listIcebreakers,
  listClosingLaws,
  listClosingScripts,
} from '../api/journey';

// Content version — bump pra invalidar caches antigos quando o conteúdo
// dos passos/scripts/objeções for reescrito. Cada incremento força refetch
// nos clientes que ainda têm o bundle velho em aba aberta.
const CONTENT_VERSION = 'v2-rich';
const LONG_STALE = 1000 * 60 * 60; // 1h — conteúdo muda pouco entre versões

export function useJourneySteps() {
  return useQuery({
    queryKey: ['content', 'journey-steps', CONTENT_VERSION],
    queryFn: listJourneySteps,
    staleTime: LONG_STALE,
  });
}

export function useObjections() {
  return useQuery({
    queryKey: ['content', 'objections', CONTENT_VERSION],
    queryFn: listObjections,
    staleTime: LONG_STALE,
  });
}

export function useIcebreakers() {
  return useQuery({
    queryKey: ['content', 'icebreakers', CONTENT_VERSION],
    queryFn: listIcebreakers,
    staleTime: LONG_STALE,
  });
}

export function useClosingLaws() {
  return useQuery({
    queryKey: ['content', 'closing-laws', CONTENT_VERSION],
    queryFn: listClosingLaws,
    staleTime: LONG_STALE,
  });
}

export function useClosingScripts() {
  return useQuery({
    queryKey: ['content', 'closing-scripts', CONTENT_VERSION],
    queryFn: listClosingScripts,
    staleTime: LONG_STALE,
  });
}
