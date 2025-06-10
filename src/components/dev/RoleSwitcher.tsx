/**
 * Role Switcher Component (for development/testing)
 * Allows switching between user roles to test different dashboards
 */

import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';

const roles = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'CREATOR', label: 'Creator' },
  { value: 'CLIENT', label: 'Client' },
];

export function RoleSwitcher() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const switchRole = async (newRole: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      await apiClient.post('/users/switch-role', {
        role: newRole,
        userId: user.id,
      });

      // Refresh the page to get updated session
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
      <div className="text-sm font-medium mb-2">Dev: Switch Role</div>
      <div className="text-xs text-gray-600 mb-3">Current: {user?.role || 'None'}</div>
      <div className="space-y-2">
        {roles.map((role) => (
          <button
            key={role.value}
            onClick={() => switchRole(role.value)}
            disabled={isLoading || user?.role === role.value}
            className={`w-full text-left px-3 py-1 text-sm rounded ${
              user?.role === role.value ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            } disabled:opacity-50`}
          >
            {role.label}
          </button>
        ))}
      </div>
    </div>
  );
}
