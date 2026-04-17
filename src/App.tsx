import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@config/routes';
import { AppShell } from '@shared/layout/AppShell';
import { ErrorBoundary } from '@shared/layout/ErrorBoundary';
import { PageSpinner } from '@shared/ui/PageSpinner';
import { RequireAuth } from '@features/auth/guards/RequireAuth';
import { RequireOnboarded } from '@features/auth/guards/RequireOnboarded';
import { RequireAdmin } from '@features/auth/guards/RequireAdmin';

// Auth (eager: sempre acessadas)
import { LoginPage } from '@features/auth/routes/LoginPage';
import { InviteLandingPage } from '@features/auth/routes/InviteLandingPage';

// Pages com code-split
const OnboardingPage = lazy(() =>
  import('@features/onboarding/routes/OnboardingPage').then((m) => ({ default: m.OnboardingPage })),
);
const FIRPage = lazy(() =>
  import('@features/fir/routes/FIRPage').then((m) => ({ default: m.FIRPage })),
);
const DashboardPage = lazy(() =>
  import('@features/dashboard/routes/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const JourneyListPage = lazy(() =>
  import('@features/journey/routes/JourneyListPage').then((m) => ({
    default: m.JourneyListPage,
  })),
);
const JourneyStepPage = lazy(() =>
  import('@features/journey/routes/JourneyStepPage').then((m) => ({
    default: m.JourneyStepPage,
  })),
);
const ProspectorPage = lazy(() =>
  import('@features/prospector/routes/ProspectorPage').then((m) => ({
    default: m.ProspectorPage,
  })),
);
const AcademyPage = lazy(() =>
  import('@features/academy/routes/AcademyPage').then((m) => ({ default: m.AcademyPage })),
);
const RankingPage = lazy(() =>
  import('@features/ranking/routes/RankingPage').then((m) => ({ default: m.RankingPage })),
);
const ArenaPage = lazy(() =>
  import('@features/arena/routes/ArenaPage').then((m) => ({ default: m.ArenaPage })),
);
const LeaderPage = lazy(() =>
  import('@features/leader/routes/LeaderPage').then((m) => ({ default: m.LeaderPage })),
);
const MemberDetailPage = lazy(() =>
  import('@features/leader/routes/MemberDetailPage').then((m) => ({
    default: m.MemberDetailPage,
  })),
);
const NetworkPage = lazy(() =>
  import('@features/network/routes/NetworkPage').then((m) => ({ default: m.NetworkPage })),
);
const ProfilePage = lazy(() =>
  import('@features/profile/routes/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const AdminImportarPage = lazy(() =>
  import('@features/conhecimentos/routes/AdminImportarPage').then((m) => ({
    default: m.AdminImportarPage,
  })),
);
const AudiosPage = lazy(() =>
  import('@features/conhecimentos/routes/AudiosPage').then((m) => ({
    default: m.AudiosPage,
  })),
);
const AdminVideosAutoridadePage = lazy(() =>
  import('@features/videos-autoridade/routes/AdminVideosAutoridadePage').then((m) => ({
    default: m.AdminVideosAutoridadePage,
  })),
);

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          {/* Públicas */}
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.SIGNUP} element={<InviteLandingPage />} />

          {/* Autenticadas */}
          <Route element={<RequireAuth />}>
            <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />

            <Route element={<RequireOnboarded />}>
              <Route path={ROUTES.FIR} element={<FIRPage />} />

              <Route element={<AppShell />}>
                <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                <Route path={ROUTES.JOURNEY} element={<JourneyListPage />} />
                <Route path={ROUTES.JOURNEY_STEP} element={<JourneyStepPage />} />
                <Route path={ROUTES.PROSPECTOR} element={<ProspectorPage />} />
                <Route path={ROUTES.ACADEMY} element={<AcademyPage />} />
                <Route path={ROUTES.RANKING} element={<RankingPage />} />
                <Route path={ROUTES.ARENA} element={<ArenaPage />} />
                <Route path={ROUTES.LEADER} element={<LeaderPage />} />
                <Route path="/leader/team/:id" element={<MemberDetailPage />} />
                <Route path={ROUTES.NETWORK} element={<NetworkPage />} />
                <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                <Route path="/audios" element={<AudiosPage />} />

                {/* Admin */}
                <Route element={<RequireAdmin />}>
                  <Route path="/admin/importar-conhecimento" element={<AdminImportarPage />} />
                  <Route path="/admin/videos-autoridade" element={<AdminVideosAutoridadePage />} />
                </Route>
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
