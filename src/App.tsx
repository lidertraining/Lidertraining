import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@config/routes';
import { AppShell } from '@shared/layout/AppShell';
import { RequireAuth } from '@features/auth/guards/RequireAuth';
import { RequireOnboarded } from '@features/auth/guards/RequireOnboarded';
import { LoginPage } from '@features/auth/routes/LoginPage';
import { InviteLandingPage } from '@features/auth/routes/InviteLandingPage';
import { OnboardingPage } from '@features/onboarding/routes/OnboardingPage';
import { FIRPage } from '@features/fir/routes/FIRPage';
import { DashboardPage } from '@features/dashboard/routes/DashboardPage';
import { JourneyListPage } from '@features/journey/routes/JourneyListPage';
import { JourneyStepPage } from '@features/journey/routes/JourneyStepPage';
import { ProspectorPage } from '@features/prospector/routes/ProspectorPage';
import { AcademyPage } from '@features/academy/routes/AcademyPage';
import { RankingPage } from '@features/ranking/routes/RankingPage';
import { ArenaPage } from '@features/arena/routes/ArenaPage';
import { LeaderPage } from '@features/leader/routes/LeaderPage';
import { NetworkPage } from '@features/network/routes/NetworkPage';
import { ProfilePage } from '@features/profile/routes/ProfilePage';

export default function App() {
  return (
    <Routes>
      {/* P\u00fablicas */}
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
            <Route path={ROUTES.NETWORK} element={<NetworkPage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}
