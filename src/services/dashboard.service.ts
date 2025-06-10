/**
 * Dashboard service layer
 * Handles all dashboard-related API calls
 */

import { apiClient } from '@/lib/api-client';

export interface DashboardStats {
  campaigns: {
    total: number;
    active: number;
  };
  clients: {
    total: number;
    active: number;
  };
  creators: {
    total: number;
  };
  orders: {
    total: number;
    inProgress: number;
    completed: number;
  };
  revenue: {
    total: number;
  };
}

export interface DashboardActivities {
  recentCampaigns: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    client: { name: string };
    createdBy: { name: string };
  }>;
  recentOrders: Array<{
    id: string;
    status: string;
    assignedAt: string;
    campaign: { title: string };
    creator: { name: string };
  }>;
  recentClients: Array<{
    id: string;
    name: string;
    email: string;
    company?: string;
    status: string;
    createdAt: string;
  }>;
}

class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  }

  /**
   * Get recent activities
   */
  async getActivities(): Promise<DashboardActivities> {
    const response = await apiClient.get('/dashboard/activities');
    return response.data;
  }
}

export const dashboardService = new DashboardService();
