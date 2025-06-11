/**
 * Dashboard page
 * Main dashboard for all user roles with real data
 */

import { ActivityCard } from '@/components/dashboard/ActivityCard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useAuth } from '@/hooks/useAuth';
import { dashboardService } from '@/services/dashboard.service';
import {
  Button,
  Card,
  Container,
  Grid,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  Check,
  Clock,
  DollarSign,
  Eye,
  Plus,
  TrendingUp,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch real dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: () => dashboardService.getActivities(),
  });

  // Get role-specific quick actions
  const getQuickAction = () => {
    const userRole = user?.role;
    switch (userRole) {
      case 'ADMIN':
      case 'STAFF':
        return { label: 'Create Campaign', path: '/campaigns', icon: Plus };
      case 'CREATOR':
        return { label: 'View My Orders', path: '/orders', icon: Briefcase };
      case 'CLIENT':
        return { label: 'New Campaign', path: '/campaigns', icon: Plus };
      default:
        return { label: 'Get Started', path: '/profile', icon: Plus };
    }
  };

  const quickAction = getQuickAction();

  // Role-specific dashboard content
  const getDashboardContent = () => {
    if (!user) return null;

    const userRole = user.role;

    switch (userRole) {
      case 'ADMIN':
      case 'STAFF':
        return (
          <AdminDashboard
            stats={stats}
            activities={activities}
            isLoading={statsLoading || activitiesLoading}
          />
        );
      case 'CREATOR':
        return <CreatorDashboard stats={stats} isLoading={statsLoading} />;
      case 'CLIENT':
        return <ClientDashboard stats={stats} isLoading={statsLoading} />;
      default:
        return <DefaultDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Container size="xl" className="py-6">
        <Stack gap="lg">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Title order={1} className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.name}!
                </Title>
                <Text c="dimmed" size="sm" mt="xs">
                  Here's what's happening with your {user?.role?.toLowerCase()} dashboard today
                </Text>
              </div>
              <Group gap="sm">
                <Button
                  leftSection={<Eye size={16} />}
                  variant="light"
                  size="sm"
                  className="hover:shadow-sm transition-all"
                  onClick={() => navigate('/analytics')}
                >
                  View Analytics
                </Button>
                <Button
                  leftSection={<quickAction.icon size={16} />}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all"
                  onClick={() => navigate(quickAction.path)}
                >
                  {quickAction.label}
                </Button>
              </Group>
            </div>
          </div>

          {getDashboardContent()}

          {/* Development Role Switcher */}
          {/* <RoleSwitcher /> */}
        </Stack>
      </Container>
    </div>
  );
}

// Admin/Staff Dashboard
function AdminDashboard({ stats, activities, isLoading }: any) {
  if (isLoading) {
    return (
      <Stack gap="md">
        <Grid gutter="md">
          {[...Array(4)].map((_, i) => (
            <Grid.Col key={i} span={{ base: 12, sm: 6, lg: 3 }}>
              <Card padding="lg" radius="md" withBorder className="h-full border-gray-200">
                <Skeleton height={8} mb="xs" width="60%" />
                <Skeleton height={28} mb="xs" width="40%" />
                <Skeleton height={6} width="80%" />
              </Card>
            </Grid.Col>
          ))}
        </Grid>
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Card padding="lg" radius="md" withBorder className="h-full border-gray-200">
              <Skeleton height={180} />
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Card padding="lg" radius="md" withBorder className="h-full border-gray-200">
              <Skeleton height={180} />
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {/* Stats Grid */}
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <StatsCard
            title="Total Campaigns"
            value={stats?.campaigns?.total || 0}
            subtitle={`${stats?.campaigns?.active || 0} active`}
            icon={Briefcase}
            color="blue"
            trend={{ value: 12, label: 'vs last month' }}
            delay={0}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <StatsCard
            title="Active Creators"
            value={stats?.creators?.total || 0}
            subtitle="Content creators"
            icon={Users}
            color="green"
            trend={{ value: 8, label: 'vs last month' }}
            delay={100}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <StatsCard
            title="Total Clients"
            value={stats?.clients?.total || 0}
            subtitle={`${stats?.clients?.active || 0} active`}
            icon={TrendingUp}
            color="purple"
            trend={{ value: 5, label: 'vs last month' }}
            delay={200}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <StatsCard
            title="Revenue"
            value={`$${stats?.revenue?.total ? (Number(stats.revenue.total) / 1000).toFixed(1) : 0}k`}
            subtitle="Campaign budgets"
            icon={DollarSign}
            color="orange"
            trend={{ value: 23, label: 'vs last month' }}
            delay={300}
          />
        </Grid.Col>
      </Grid>

      {/* Recent Activities */}
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <ActivityCard
            title="Recent Campaigns"
            items={
              activities?.recentCampaigns?.map((campaign: any) => ({
                id: campaign.id,
                title: campaign.title,
                subtitle: campaign.client.name,
                timestamp: campaign.createdAt,
                status: campaign.status,
                statusColor: campaign.status === 'ACTIVE' ? 'green' : 'blue',
              })) || []
            }
            emptyMessage="No recent campaigns"
            delay={400}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          <ActivityCard
            title="Recent Orders"
            items={
              activities?.recentOrders?.map((order: any) => ({
                id: order.id,
                title: order.campaign.title,
                subtitle: order.creator.name,
                timestamp: order.assignedAt,
                status: order.status,
                statusColor:
                  order.status === 'IN_PROGRESS'
                    ? 'yellow'
                    : order.status === 'COMPLETED'
                      ? 'green'
                      : 'blue',
              })) || []
            }
            emptyMessage="No recent orders"
            delay={500}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

// Creator Dashboard
function CreatorDashboard({ stats, isLoading }: any) {
  if (isLoading) {
    return (
      <Grid gutter="md">
        {[...Array(3)].map((_, i) => (
          <Grid.Col key={i} span={{ base: 12, sm: 4 }}>
            <Card padding="lg" radius="md" withBorder className="h-full border-gray-200">
              <Skeleton height={8} mb="xs" width="60%" />
              <Skeleton height={28} mb="xs" width="40%" />
              <Skeleton height={6} width="80%" />
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <StatsCard
          title="Active Orders"
          value={stats?.orders?.inProgress || 0}
          subtitle="Orders in progress"
          icon={Clock}
          color="yellow"
          trend={{ value: 15, label: 'vs last week' }}
          delay={0}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 4 }}>
        <StatsCard
          title="Completed"
          value={stats?.orders?.completed || 0}
          subtitle="Orders completed"
          icon={Check}
          color="green"
          trend={{ value: 20, label: 'vs last week' }}
          delay={100}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 4 }}>
        <StatsCard
          title="Total Revenue"
          value={`$${stats?.revenue?.total ? (Number(stats.revenue.total) / 1000).toFixed(1) : 0}k`}
          subtitle="From campaigns"
          icon={DollarSign}
          color="green"
          trend={{ value: 18, label: 'vs last week' }}
          delay={200}
        />
      </Grid.Col>
    </Grid>
  );
}

// Client Dashboard
function ClientDashboard({ stats, isLoading }: any) {
  if (isLoading) {
    return (
      <Grid gutter="md">
        {[...Array(3)].map((_, i) => (
          <Grid.Col key={i} span={{ base: 12, sm: 4 }}>
            <Card padding="lg" radius="md" withBorder className="h-full border-gray-200">
              <Skeleton height={8} mb="xs" width="60%" />
              <Skeleton height={28} mb="xs" width="40%" />
              <Skeleton height={6} width="80%" />
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <StatsCard
          title="Active Campaigns"
          value={stats?.campaigns?.active || 0}
          subtitle="In progress"
          icon={Briefcase}
          color="blue"
          trend={{ value: 10, label: 'vs last month' }}
          delay={0}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 4 }}>
        <StatsCard
          title="Total Orders"
          value={stats?.orders?.total || 0}
          subtitle="Content pieces"
          icon={Check}
          color="purple"
          trend={{ value: 25, label: 'vs last month' }}
          delay={100}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 4 }}>
        <StatsCard
          title="Creators Working"
          value={stats?.creators?.total || 0}
          subtitle="Available creators"
          icon={Users}
          color="green"
          trend={{ value: 5, label: 'vs last month' }}
          delay={200}
        />
      </Grid.Col>
    </Grid>
  );
}

// Default Dashboard
function DefaultDashboard() {
  return (
    <Paper p="md" shadow="sm" withBorder>
      <Text c="dimmed">Welcome to UGC Agency Platform!</Text>
    </Paper>
  );
}
