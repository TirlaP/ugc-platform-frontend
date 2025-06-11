/**
 * Analytics page
 * Displays comprehensive analytics and insights
 */

import { StatsCard } from '@/components/dashboard/StatsCard';
import { useAuth } from '@/hooks/useAuth';
import {
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Paper,
  Progress,
  Select,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  Briefcase,
  Calendar,
  BarChart3 as IconChartBar,
  LineChart,
  PieChart,
  DollarSign,
  Download,
  Filter,
  TrendingUp,
  Users
} from 'lucide-react';
import { useState } from 'react';

// Mock data for charts
const mockChartData = {
  revenue: [
    { month: 'Jan', value: 45000 },
    { month: 'Feb', value: 52000 },
    { month: 'Mar', value: 48000 },
    { month: 'Apr', value: 61000 },
    { month: 'May', value: 55000 },
    { month: 'Jun', value: 67000 },
  ],
  campaigns: [
    { status: 'Active', value: 12, color: 'green' },
    { status: 'Pending', value: 5, color: 'yellow' },
    { status: 'Completed', value: 23, color: 'blue' },
    { status: 'Cancelled', value: 2, color: 'red' },
  ],
  topCreators: [
    { name: 'Sarah Johnson', orders: 45, revenue: 12500 },
    { name: 'Mike Chen', orders: 38, revenue: 10200 },
    { name: 'Emma Davis', orders: 34, revenue: 9800 },
    { name: 'Alex Smith', orders: 29, revenue: 8500 },
    { name: 'Lisa Brown', orders: 27, revenue: 7900 },
  ],
};

export function AnalyticsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30');

  // Calculate total values for pie chart
  const totalCampaigns = mockChartData.campaigns.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Container size="xl" className="py-6">
        <Stack gap="lg">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Title order={1} className="text-2xl font-bold text-gray-900">
                  Analytics Dashboard
                </Title>
                <Text c="dimmed" size="sm" mt="xs">
                  Track performance and gain insights into your campaigns
                </Text>
              </div>
              <Group gap="sm">
                <Select
                  value={timeRange}
                  onChange={(value) => setTimeRange(value || '30')}
                  data={[
                    { value: '7', label: 'Last 7 days' },
                    { value: '30', label: 'Last 30 days' },
                    { value: '90', label: 'Last 90 days' },
                    { value: '365', label: 'Last year' },
                  ]}
                  size="sm"
                  className="w-40"
                />
                <Button leftSection={<Download size={16} />} variant="light" size="sm">
                  Export Report
                </Button>
              </Group>
            </div>
          </div>

          {/* Key Metrics */}
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
              <StatsCard
                title="Total Revenue"
                value="$328k"
                subtitle="All time earnings"
                icon={DollarSign}
                color="green"
                trend={{ value: 23, label: 'vs last period' }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
              <StatsCard
                title="Active Campaigns"
                value="12"
                subtitle="Currently running"
                icon={Briefcase}
                color="blue"
                trend={{ value: 8, label: 'vs last period' }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
              <StatsCard
                title="Total Orders"
                value="248"
                subtitle="Content pieces"
                icon={IconChartBar}
                color="purple"
                trend={{ value: 15, label: 'vs last period' }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
              <StatsCard
                title="Active Creators"
                value="45"
                subtitle="Working on campaigns"
                icon={Users}
                color="orange"
                trend={{ value: 12, label: 'vs last period' }}
              />
            </Grid.Col>
          </Grid>

          {/* Charts Section */}
          <Grid gutter="md">
            {/* Revenue Chart */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Card
                shadow="xs"
                padding="lg"
                radius="md"
                withBorder
                className="h-full border-gray-200"
              >
                <Group justify="space-between" mb="md">
                  <Title order={5} className="text-gray-900 font-semibold">
                    Revenue Overview
                  </Title>
                  <ThemeIcon size="sm" radius="md" variant="light" color="blue">
                    <LineChart size={16} />
                  </ThemeIcon>
                </Group>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
                  <Text c="dimmed" size="sm">
                    Revenue chart visualization
                  </Text>
                </div>
              </Card>
            </Grid.Col>

            {/* Campaign Status */}
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Card
                shadow="xs"
                padding="lg"
                radius="md"
                withBorder
                className="h-full border-gray-200"
              >
                <Group justify="space-between" mb="md">
                  <Title order={5} className="text-gray-900 font-semibold">
                    Campaign Status
                  </Title>
                  <ThemeIcon size="sm" radius="md" variant="light" color="purple">
                    <PieChart size={16} />
                  </ThemeIcon>
                </Group>
                <Stack gap="sm">
                  {mockChartData.campaigns.map((item) => (
                    <div key={item.status}>
                      <Group justify="space-between" mb={4}>
                        <Group gap="xs">
                          <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                          <Text size="sm">{item.status}</Text>
                        </Group>
                        <Text size="sm" fw={500}>
                          {item.value}
                        </Text>
                      </Group>
                      <Progress
                        value={(item.value / totalCampaigns) * 100}
                        color={item.color}
                        size="sm"
                        radius="xl"
                      />
                    </div>
                  ))}
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          {/* Top Performers */}
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Card shadow="xs" padding="lg" radius="md" withBorder className="border-gray-200">
                <Title order={5} className="text-gray-900 font-semibold mb-4">
                  Top Performing Creators
                </Title>
                <Stack gap="sm">
                  {mockChartData.topCreators.map((creator, index) => (
                    <div
                      key={creator.name}
                      className="flex items-center justify-between py-2 px-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      <Group gap="sm">
                        <Text fw={500} size="sm" c="dimmed">
                          #{index + 1}
                        </Text>
                        <div>
                          <Text size="sm" fw={500}>
                            {creator.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {creator.orders} orders completed
                          </Text>
                        </div>
                      </Group>
                      <Badge variant="light" color="green">
                        ${creator.revenue.toLocaleString()}
                      </Badge>
                    </div>
                  ))}
                </Stack>
              </Card>
            </Grid.Col>

            {/* Performance Metrics */}
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Card shadow="xs" padding="lg" radius="md" withBorder className="border-gray-200">
                <Title order={5} className="text-gray-900 font-semibold mb-4">
                  Performance Metrics
                </Title>
                <Stack gap="md">
                  <div>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm">Average Order Value</Text>
                      <Text size="sm" fw={600}>
                        $285
                      </Text>
                    </Group>
                    <Progress value={75} size="sm" radius="xl" color="blue" />
                  </div>
                  <div>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm">Campaign Success Rate</Text>
                      <Text size="sm" fw={600}>
                        92%
                      </Text>
                    </Group>
                    <Progress value={92} size="sm" radius="xl" color="green" />
                  </div>
                  <div>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm">Creator Satisfaction</Text>
                      <Text size="sm" fw={600}>
                        4.8/5
                      </Text>
                    </Group>
                    <Progress value={96} size="sm" radius="xl" color="purple" />
                  </div>
                  <div>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm">On-time Delivery Rate</Text>
                      <Text size="sm" fw={600}>
                        88%
                      </Text>
                    </Group>
                    <Progress value={88} size="sm" radius="xl" color="orange" />
                  </div>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </div>
  );
}
