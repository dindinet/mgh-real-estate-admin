import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { PropertiesPage } from '@/pages/PropertiesPage'
import { PropertyEditorPage } from '@/pages/PropertyEditorPage'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/properties",
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <PropertiesPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/properties/new",
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <PropertyEditorPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/properties/:ref/edit",
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <PropertyEditorPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <AdminLayout>
          <div className="p-8 text-center text-muted-foreground">Settings coming soon...</div>
        </AdminLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  }
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)