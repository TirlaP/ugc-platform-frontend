/**
 * Development component to manually switch organizations
 * Only shown in development mode
 */

import { useState, useEffect } from 'react';
import { organizationService } from '@/services/organization.service';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

export function OrgSwitcher() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrganizations();
    const orgId = localStorage.getItem('current_organization_id') || '';
    setCurrentOrgId(orgId);
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const orgs = await organizationService.getMyOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrgChange = (orgId: string) => {
    localStorage.setItem('current_organization_id', orgId);
    setCurrentOrgId(orgId);
    // Reload page to apply new org context
    window.location.reload();
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="text-sm font-medium mb-2">Dev: Switch Organization</div>
      <div className="space-y-2">
        <select
          value={currentOrgId}
          onChange={(e) => handleOrgChange(e.target.value)}
          className="w-full p-2 text-black rounded"
          disabled={loading}
        >
          <option value="">Select organization...</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name} ({org.slug})
            </option>
          ))}
        </select>
        <button
          onClick={loadOrganizations}
          className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        <div className="text-xs text-gray-300">
          Current: {currentOrgId || 'None'}
        </div>
      </div>
    </div>
  );
}