/**
 * App routing setup
 * Configures all routes for the application
 */

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShellLayout } from '@/components/layouts/AppShell';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { RootLayout } from '@/components/layouts/RootLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { Role } from '@/types/auth.types';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

// Lazy load pages for better performance
import { Suspense, lazy } from 'react';

// Dashboard pages
const DashboardPage = lazy(() =>
  import('@/pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const CampaignsPage = lazy(() =>
  import('@/pages/campaigns/CampaignsPage').then((m) => ({ default: m.CampaignsPage }))
);
const CampaignDetailPage = lazy(() =>
  import('@/pages/campaigns/CampaignDetailPage').then((m) => ({ default: m.CampaignDetailPage }))
);
const CreatorsPage = lazy(() =>
  import('@/pages/creators/CreatorsPage').then((m) => ({ default: m.CreatorsPage }))
);
const CreatorDetailPage = lazy(() =>
  import('@/pages/creators/CreatorDetailPage').then((m) => ({ default: m.CreatorDetailPage }))
);
const ClientsPage = lazy(() =>
  import('@/pages/clients/ClientsPage').then((m) => ({ default: m.ClientsPage }))
);
const ClientDetailPage = lazy(() =>
  import('@/pages/clients/ClientDetailPage').then((m) => ({ default: m.ClientDetailPage }))
);
const SettingsPage = lazy(() =>
  import('@/pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const ProfilePage = lazy(() =>
  import('@/pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const MediaPage = lazy(() =>
  import('@/pages/media/MediaPage').then((m) => ({ default: m.MediaPage }))
);
const MessagesPage = lazy(() =>
  import('@/pages/messages/MessagesPage').then((m) => ({ default: m.MessagesPage }))
);
const OrganizationsPage = lazy(() =>
  import('@/pages/organizations/OrganizationsPage').then((m) => ({ default: m.OrganizationsPage }))
);
const CampaignFormPage = lazy(() =>
  import('@/pages/campaigns/CampaignFormPage').then((m) => ({ default: m.CampaignFormPage }))
);
const ClientEditPage = lazy(() =>
  import('@/pages/clients/ClientEditPage').then((m) => ({ default: m.ClientEditPage }))
);
const CreatorEditPage = lazy(() =>
  import('@/pages/creators/CreatorEditPage').then((m) => ({ default: m.CreatorEditPage }))
);
const CampaignEditPage = lazy(() =>
  import('@/pages/campaigns/CampaignEditPage').then((m) => ({ default: m.CampaignEditPage }))
);
const AnalyticsPage = lazy(() =>
  import('@/pages/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);

// Loading component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
    </div>
  );
}

// Router configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />, // Only handles auth sync now
    children: [
      // Redirect root to dashboard
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },

      // Auth routes with clean layout
      {
        path: 'auth',
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'register',
            element: <RegisterPage />,
          },
        ],
      },

      // Protected routes with AppShell
      {
        element: (
          <ProtectedRoute>
            <AppShellLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: 'campaigns',
            element: (
              <Suspense fallback={<PageLoader />}>
                <CampaignsPage />
              </Suspense>
            ),
          },
          {
            path: 'campaigns/:id',
            element: (
              <Suspense fallback={<PageLoader />}>
                <CampaignDetailPage />
              </Suspense>
            ),
          },
          {
            path: 'campaigns/new',
            element: (
              <Suspense fallback={<PageLoader />}>
                <CampaignFormPage />
              </Suspense>
            ),
          },
          {
            path: 'campaigns/:id/edit',
            element: (
              <Suspense fallback={<PageLoader />}>
                <CampaignEditPage />
              </Suspense>
            ),
          },
          {
            path: 'creators',
            element: (
              <ProtectedRoute roles={[Role.ADMIN, Role.STAFF]}>
                <Suspense fallback={<PageLoader />}>
                  <CreatorsPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'creators/:id',
            element: (
              <ProtectedRoute roles={[Role.ADMIN, Role.STAFF]}>
                <Suspense fallback={<PageLoader />}>
                  <CreatorDetailPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'creators/:id/edit',
            element: (
              <ProtectedRoute roles={[Role.ADMIN, Role.STAFF]}>
                <Suspense fallback={<PageLoader />}>
                  <CreatorEditPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'clients',
            element: (
              <ProtectedRoute roles={[Role.ADMIN, Role.STAFF]}>
                <Suspense fallback={<PageLoader />}>
                  <ClientsPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'clients/:id',
            element: (
              <ProtectedRoute roles={[Role.ADMIN, Role.STAFF]}>
                <Suspense fallback={<PageLoader />}>
                  <ClientDetailPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'clients/:id/edit',
            element: (
              <ProtectedRoute roles={[Role.ADMIN, Role.STAFF]}>
                <Suspense fallback={<PageLoader />}>
                  <ClientEditPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'analytics',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AnalyticsPage />
              </Suspense>
            ),
          },
          {
            path: 'settings',
            element: (
              <Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </Suspense>
            ),
          },
          {
            path: 'profile',
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProfilePage />
              </Suspense>
            ),
          },
          {
            path: 'media',
            element: (
              <Suspense fallback={<PageLoader />}>
                <MediaPage />
              </Suspense>
            ),
          },
          {
            path: 'messages',
            element: (
              <Suspense fallback={<PageLoader />}>
                <MessagesPage />
              </Suspense>
            ),
          },
          {
            path: 'organizations',
            element: (
              <ProtectedRoute roles={[Role.ADMIN, Role.STAFF]}>
                <Suspense fallback={<PageLoader />}>
                  <OrganizationsPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
        ],
      },

      // 404 page
      {
        path: '*',
        element: (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Page not found</p>
              <button onClick={() => window.history.back()} className="btn btn-primary">
                Go Back
              </button>
            </div>
          </div>
        ),
      },
    ],
  },
]);

// Root router component
export function Router() {
  return <RouterProvider router={router} />;
}
