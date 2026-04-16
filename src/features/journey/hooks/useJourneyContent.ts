import { useQuery } from '@tanstack/react-query';
import {
  listJourneySteps,
  listObjections,
  listIcebreakers,
  listClosingLaws,
  listClosingScripts,
} from '../api/journey';

const LONG_STALE = 1000 * 60 * 60; // 1h — conteúdo muda pouco

export function useJourneySteps() {
  return useQuery({
    queryKey: ['content', 'journey-steps'],
    queryFn: listJourneySteps,
    staleTime: LONG_STALE,
  });
}

export function useObjections() {
  return useQuery({
    queryKey: ['content', 'objections'],
    queryFn: listObjections,
    staleTime: LONG_STALE,
  });
}

export function useIcebreakers() {
  return useQuery({
    queryKey: ['content', 'icebreakers'],
    queryFn: listIcebreakers,
    staleTime: LONG_STALE,
  });
}

export function useClosingLaws() {
  return useQuery({
    queryKey: ['content', 'closing-laws'],
    queryFn: listClosingLaws,
    staleTime: LONG_STALE,
  });
}

export function useClosingScripts() {
  return useQuery({
    queryKey: ['content', 'closing-scripts'],
    queryFn: listClosingScripts,
    staleTime: LONG_STALE,
  });
}
