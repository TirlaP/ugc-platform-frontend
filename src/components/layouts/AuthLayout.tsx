/**
 * Simple layout for authentication pages
 * Clean design without sidebar navigation
 */

import { Text } from '@mantine/core';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Simple header */}
      <header className="py-6">
        <div className="container mx-auto px-6">
          <Text
            size="xl"
            fw={700}
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            UGC Platform
          </Text>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Simple footer */}
      <footer className="py-6 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <Text size="sm" c="dimmed">
            © 2025 UGC Agency Platform. All rights reserved.
          </Text>
        </div>
      </footer>
    </div>
  );
}
