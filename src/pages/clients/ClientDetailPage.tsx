/**
 * Client Detail Page - View comprehensive client information
 */

import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Grid,
  Group,
  Loader,
  Menu,
  Paper,
  Progress,
  RingProgress,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  ThemeIcon,
  Timeline,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconArchive,
  IconArrowLeft,
  IconBrandGoogleDrive,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconChartBar,
  IconCheck,
  IconClock,
  IconCurrencyDollar,
  IconDots,
  IconEdit,
  IconExternalLink,
  IconFileDescription,
  IconMail,
  IconMapPin,
  IconMessage,
  IconPhone,
  IconPlus,
  IconTrash,
  IconTrendingUp,
  IconUser,
  IconVideo,
  IconWorld,
  IconX,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { campaignService } from '@/services/campaign.service';
import { clientService } from '@/services/client.service';
import { creatorService } from '@/services/creator.service';

const statusColors = {
  ACTIVE: 'green',
  INACTIVE: 'yellow',
  ARCHIVED: 'gray',
};

const campaignStatusColors = {
  DRAFT: 'gray',
  ACTIVE: 'blue',
  IN_PROGRESS: 'cyan',
  REVIEW: 'yellow',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Fetch client details
  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientService.getClient(id!),
    enabled: !!id,
  });

  // Fetch client's campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['client-campaigns', id],
    queryFn: () => campaignService.getCampaigns({ clientId: id }),
    enabled: !!id,
  });

  // Fetch creators who worked with this client
  const { data: creators, isLoading: creatorsLoading } = useQuery({
    queryKey: ['client-creators', id],
    queryFn: async () => {
      // Get all campaigns for this client
      const clientCampaigns = await campaignService.getCampaigns({ clientId: id });
      // Extract unique creator IDs from orders
      const creatorIds = new Set<string>();
      clientCampaigns.campaigns.forEach((campaign: any) => {
        campaign.orders?.forEach((order: any) => {
          creatorIds.add(order.creatorId);
        });
      });
      // Fetch creator details
      const creatorPromises = Array.from(creatorIds).map((creatorId) =>
        creatorService.getCreator(creatorId)
      );
      return Promise.all(creatorPromises);
    },
    enabled: !!id,
  });

  if (clientLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!client) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Text>Client not found</Text>
        </Center>
      </Container>
    );
  }

  const totalSpent =
    campaigns?.campaigns.reduce(
      (sum: number, campaign: any) => sum + Number(campaign.budget || 0),
      0
    ) || 0;
  const activeCampaigns =
    campaigns?.campaigns.filter((c: any) => c.status === 'ACTIVE' || c.status === 'IN_PROGRESS')
      .length || 0;
  const completedCampaigns =
    campaigns?.campaigns.filter((c: any) => c.status === 'COMPLETED').length || 0;

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Anchor component={Link} to="/clients" size="sm">
            Clients
          </Anchor>
          <Text size="sm">{client.name}</Text>
        </Breadcrumbs>

        {/* Header */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Group align="flex-start" gap="lg">
              <Avatar size={80} radius="md" color="blue">
                <IconBuilding size={36} />
              </Avatar>
              <div style={{ flex: 1 }}>
                <Group gap="sm" align="center" mb="xs">
                  <Title order={2}>{client.name}</Title>
                  <Badge color={statusColors[client.status]} variant="light">
                    {client.status}
                  </Badge>
                </Group>
                <Text size="lg" fw={500} c="blue.7" mb="xs">
                  {client.company}
                </Text>
                <Group gap="xl">
                  <Group gap="xs">
                    <IconMail size={16} className="text-gray-400" />
                    <Text size="sm">{client.email}</Text>
                  </Group>
                  {client.phone && (
                    <Group gap="xs">
                      <IconPhone size={16} className="text-gray-400" />
                      <Text size="sm">{client.phone}</Text>
                    </Group>
                  )}
                  {client.website && (
                    <Group gap="xs">
                      <IconWorld size={16} className="text-gray-400" />
                      <Anchor href={client.website} target="_blank" size="sm">
                        Website
                      </Anchor>
                    </Group>
                  )}
                </Group>
              </div>
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Group justify="flex-end">
              <Button
                variant="light"
                leftSection={<IconMessage size={16} />}
                onClick={() => navigate('/messages', { state: { clientId: client.id } })}
              >
                Message
              </Button>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => navigate('/campaigns/new', { state: { clientId: client.id } })}
              >
                New Campaign
              </Button>
              <Menu position="bottom-end" withArrow>
                <Menu.Target>
                  <ActionIcon variant="light" size="lg">
                    <IconDots size={20} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconEdit size={16} />}
                    onClick={() => navigate(`/clients/${client.id}/edit`)}
                  >
                    Edit Client
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconArchive size={16} />}
                    color={client.status === 'ARCHIVED' ? 'green' : 'yellow'}
                  >
                    {client.status === 'ARCHIVED' ? 'Reactivate' : 'Archive'}
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item leftSection={<IconTrash size={16} />} color="red">
                    Delete Client
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Grid.Col>
        </Grid>

        {/* Stats Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Total Campaigns
                </Text>
                <ThemeIcon size="sm" radius="md" variant="light" color="blue">
                  <IconBriefcase size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>
                {campaigns?.campaigns.length || 0}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {activeCampaigns} active
              </Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Total Spent
                </Text>
                <ThemeIcon size="sm" radius="md" variant="light" color="green">
                  <IconCurrencyDollar size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>
                ${totalSpent.toLocaleString()}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                All time
              </Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Creators Worked
                </Text>
                <ThemeIcon size="sm" radius="md" variant="light" color="purple">
                  <IconUser size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>
                {creators?.length || 0}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Unique creators
              </Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Success Rate
                </Text>
                <ThemeIcon size="sm" radius="md" variant="light" color="yellow">
                  <IconChartBar size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>
                {campaigns?.campaigns.length > 0
                  ? Math.round((completedCampaigns / campaigns.campaigns.length) * 100)
                  : 0}
                %
              </Text>
              <Progress
                value={
                  campaigns?.campaigns.length > 0
                    ? (completedCampaigns / campaigns.campaigns.length) * 100
                    : 0
                }
                size="xs"
                radius="xl"
                color="yellow"
                mt={8}
              />
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="campaigns" leftSection={<IconBriefcase size={16} />}>
              Campaigns ({campaigns?.campaigns.length || 0})
            </Tabs.Tab>
            <Tabs.Tab value="creators" leftSection={<IconUser size={16} />}>
              Creators ({creators?.length || 0})
            </Tabs.Tab>
            <Tabs.Tab value="activity" leftSection={<IconClock size={16} />}>
              Activity
            </Tabs.Tab>
            <Tabs.Tab value="details" leftSection={<IconFileDescription size={16} />}>
              Details
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Grid>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap="lg">
                  {/* Recent Campaigns */}
                  <Paper p="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <Text fw={600} size="lg">
                        Recent Campaigns
                      </Text>
                      <Button variant="subtle" size="sm" onClick={() => setActiveTab('campaigns')}>
                        View all
                      </Button>
                    </Group>
                    {campaignsLoading ? (
                      <Center h={100}>
                        <Loader size="sm" />
                      </Center>
                    ) : campaigns?.campaigns.length === 0 ? (
                      <Text c="dimmed" ta="center" py="xl">
                        No campaigns yet
                      </Text>
                    ) : (
                      <Stack gap="sm">
                        {campaigns?.campaigns.slice(0, 3).map((campaign: any) => (
                          <Paper key={campaign.id} p="sm" radius="md" withBorder>
                            <Group justify="space-between">
                              <div>
                                <Group gap="xs" mb={4}>
                                  <Text fw={500}>{campaign.title}</Text>
                                  <Badge
                                    color={campaignStatusColors[campaign.status]}
                                    variant="light"
                                    size="xs"
                                  >
                                    {campaign.status}
                                  </Badge>
                                </Group>
                                <Group gap="xl">
                                  <Text size="sm" c="dimmed">
                                    Budget: ${Number(campaign.budget).toLocaleString()}
                                  </Text>
                                  {campaign.deadline && (
                                    <Text size="sm" c="dimmed">
                                      Due: {new Date(campaign.deadline).toLocaleDateString()}
                                    </Text>
                                  )}
                                </Group>
                              </div>
                              <ActionIcon
                                variant="subtle"
                                onClick={() => navigate(`/campaigns/${campaign.id}`)}
                              >
                                <IconExternalLink size={16} />
                              </ActionIcon>
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </Paper>

                  {/* Performance Chart */}
                  <Paper p="lg" radius="md" withBorder>
                    <Text fw={600} size="lg" mb="md">
                      Campaign Performance
                    </Text>
                    <SimpleGrid cols={2}>
                      <div>
                        <Text size="sm" c="dimmed" mb="xs">
                          Status Distribution
                        </Text>
                        <RingProgress
                          size={150}
                          thickness={16}
                          sections={[
                            {
                              value:
                                (completedCampaigns / (campaigns?.campaigns.length || 1)) * 100,
                              color: 'green',
                            },
                            {
                              value: (activeCampaigns / (campaigns?.campaigns.length || 1)) * 100,
                              color: 'blue',
                            },
                            {
                              value:
                                (((campaigns?.campaigns.length || 0) -
                                  completedCampaigns -
                                  activeCampaigns) /
                                  (campaigns?.campaigns.length || 1)) *
                                100,
                              color: 'gray',
                            },
                          ]}
                          label={
                            <Text ta="center" size="lg" fw={700}>
                              {campaigns?.campaigns.length || 0}
                              <Text size="xs" c="dimmed">
                                Total
                              </Text>
                            </Text>
                          }
                        />
                      </div>
                      <Stack gap="xs" justify="center">
                        <Group gap="xs">
                          <Box w={12} h={12} bg="green" style={{ borderRadius: 2 }} />
                          <Text size="sm">Completed ({completedCampaigns})</Text>
                        </Group>
                        <Group gap="xs">
                          <Box w={12} h={12} bg="blue" style={{ borderRadius: 2 }} />
                          <Text size="sm">Active ({activeCampaigns})</Text>
                        </Group>
                        <Group gap="xs">
                          <Box w={12} h={12} bg="gray" style={{ borderRadius: 2 }} />
                          <Text size="sm">
                            Other (
                            {(campaigns?.campaigns.length || 0) -
                              completedCampaigns -
                              activeCampaigns}
                            )
                          </Text>
                        </Group>
                      </Stack>
                    </SimpleGrid>
                  </Paper>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack gap="lg">
                  {/* Quick Stats */}
                  <Paper p="lg" radius="md" withBorder>
                    <Text fw={600} size="lg" mb="md">
                      Quick Stats
                    </Text>
                    <Stack gap="md">
                      <div>
                        <Text size="sm" c="dimmed">
                          Average Campaign Budget
                        </Text>
                        <Text size="xl" fw={700}>
                          $
                          {campaigns?.campaigns.length > 0
                            ? Math.round(totalSpent / campaigns.campaigns.length).toLocaleString()
                            : 0}
                        </Text>
                      </div>
                      <Divider />
                      <div>
                        <Text size="sm" c="dimmed">
                          Client Since
                        </Text>
                        <Text size="lg" fw={500}>
                          {new Date(client.createdAt).toLocaleDateString()}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}
                        </Text>
                      </div>
                      <Divider />
                      <div>
                        <Text size="sm" c="dimmed">
                          Industry
                        </Text>
                        <Badge size="lg" variant="light" color="grape">
                          {client.industry || 'Not specified'}
                        </Badge>
                      </div>
                    </Stack>
                  </Paper>

                  {/* Contact Info */}
                  <Paper p="lg" radius="md" withBorder>
                    <Text fw={600} size="lg" mb="md">
                      Contact Information
                    </Text>
                    <Stack gap="sm">
                      <Group gap="xs">
                        <IconMail size={16} className="text-gray-400" />
                        <Text size="sm">{client.email}</Text>
                      </Group>
                      {client.phone && (
                        <Group gap="xs">
                          <IconPhone size={16} className="text-gray-400" />
                          <Text size="sm">{client.phone}</Text>
                        </Group>
                      )}
                      {client.website && (
                        <Group gap="xs">
                          <IconWorld size={16} className="text-gray-400" />
                          <Anchor href={client.website} target="_blank" size="sm">
                            {client.website}
                          </Anchor>
                        </Group>
                      )}
                      {client.location && (
                        <Group gap="xs">
                          <IconMapPin size={16} className="text-gray-400" />
                          <Text size="sm">{client.location}</Text>
                        </Group>
                      )}
                    </Stack>
                  </Paper>
                </Stack>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="campaigns" pt="md">
            {campaignsLoading ? (
              <Center h={200}>
                <Loader />
              </Center>
            ) : campaigns?.campaigns.length === 0 ? (
              <Paper p="xl" radius="md" withBorder ta="center">
                <IconBriefcase size={48} className="text-gray-300 mx-auto mb-4" />
                <Text c="dimmed" mb="md">
                  No campaigns yet
                </Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => navigate('/campaigns/new', { state: { clientId: client.id } })}
                >
                  Create First Campaign
                </Button>
              </Paper>
            ) : (
              <Stack gap="md">
                {campaigns?.campaigns.map((campaign: any) => (
                  <Paper key={campaign.id} p="lg" radius="md" withBorder>
                    <Grid align="center">
                      <Grid.Col span={{ base: 12, md: 8 }}>
                        <Group gap="xs" mb="xs">
                          <Text size="lg" fw={600}>
                            {campaign.title}
                          </Text>
                          <Badge color={campaignStatusColors[campaign.status]} variant="light">
                            {campaign.status}
                          </Badge>
                        </Group>
                        <Text size="sm" c="dimmed" mb="md">
                          {campaign.brief}
                        </Text>
                        <Group gap="xl">
                          <div>
                            <Text size="xs" c="dimmed">
                              Budget
                            </Text>
                            <Text fw={500}>${Number(campaign.budget).toLocaleString()}</Text>
                          </div>
                          <div>
                            <Text size="xs" c="dimmed">
                              Created
                            </Text>
                            <Text fw={500}>
                              {new Date(campaign.createdAt).toLocaleDateString()}
                            </Text>
                          </div>
                          {campaign.deadline && (
                            <div>
                              <Text size="xs" c="dimmed">
                                Deadline
                              </Text>
                              <Text fw={500}>
                                {new Date(campaign.deadline).toLocaleDateString()}
                              </Text>
                            </div>
                          )}
                          <div>
                            <Text size="xs" c="dimmed">
                              Orders
                            </Text>
                            <Text fw={500}>{campaign._count?.orders || 0}</Text>
                          </div>
                        </Group>
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 4 }}>
                        <Group justify="flex-end">
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => navigate(`/campaigns/${campaign.id}`)}
                          >
                            View Details
                          </Button>
                        </Group>
                      </Grid.Col>
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="creators" pt="md">
            {creatorsLoading ? (
              <Center h={200}>
                <Loader />
              </Center>
            ) : creators?.length === 0 ? (
              <Paper p="xl" radius="md" withBorder ta="center">
                <IconUser size={48} className="text-gray-300 mx-auto mb-4" />
                <Text c="dimmed">No creators have worked with this client yet</Text>
              </Paper>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                {creators?.map((creator: any) => (
                  <Card key={creator.id} shadow="sm" radius="md" withBorder>
                    <Group mb="md">
                      <Avatar size={50} radius="xl" color="blue">
                        {creator.name?.charAt(0) || <IconUser size={24} />}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Text fw={500}>{creator.name}</Text>
                        <Text size="sm" c="dimmed">
                          {creator.email}
                        </Text>
                      </div>
                    </Group>
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Campaigns
                        </Text>
                        <Text size="sm" fw={500}>
                          {campaigns?.campaigns.filter((c: any) =>
                            c.orders?.some((o: any) => o.creatorId === creator.id)
                          ).length || 0}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Rate
                        </Text>
                        <Text size="sm" fw={500} c="green">
                          ${creator.rates || 0}/project
                        </Text>
                      </Group>
                    </Stack>
                    <Button
                      variant="light"
                      size="sm"
                      fullWidth
                      mt="md"
                      onClick={() => navigate(`/creators/${creator.id}`)}
                    >
                      View Profile
                    </Button>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="activity" pt="md">
            <Timeline active={-1} bulletSize={24} lineWidth={2}>
              <Timeline.Item bullet={<IconPlus size={12} />} title="Client Added">
                <Text c="dimmed" size="sm">
                  {new Date(client.createdAt).toLocaleDateString()}
                </Text>
                <Text size="sm" mt={4}>
                  {client.name} was added as a new client
                </Text>
              </Timeline.Item>
              {campaigns?.campaigns.slice(0, 5).map((campaign: any) => (
                <Timeline.Item
                  key={campaign.id}
                  bullet={<IconBriefcase size={12} />}
                  title={`Campaign Created: ${campaign.title}`}
                >
                  <Text c="dimmed" size="sm">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </Text>
                  <Text size="sm" mt={4}>
                    Budget: ${Number(campaign.budget).toLocaleString()} • Status: {campaign.status}
                  </Text>
                </Timeline.Item>
              ))}
            </Timeline>
          </Tabs.Panel>

          <Tabs.Panel value="details" pt="md">
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper p="lg" radius="md" withBorder>
                  <Text fw={600} size="lg" mb="md">
                    Company Information
                  </Text>
                  <Stack gap="md">
                    <div>
                      <Text size="sm" c="dimmed">
                        Company Name
                      </Text>
                      <Text fw={500}>{client.company}</Text>
                    </div>
                    {client.industry && (
                      <div>
                        <Text size="sm" c="dimmed">
                          Industry
                        </Text>
                        <Badge variant="light" color="grape">
                          {client.industry}
                        </Badge>
                      </div>
                    )}
                    {client.website && (
                      <div>
                        <Text size="sm" c="dimmed">
                          Website
                        </Text>
                        <Anchor href={client.website} target="_blank" size="sm">
                          {client.website}
                        </Anchor>
                      </div>
                    )}
                    {client.budget && (
                      <div>
                        <Text size="sm" c="dimmed">
                          Annual Budget
                        </Text>
                        <Text fw={500}>${Number(client.budget).toLocaleString()}</Text>
                      </div>
                    )}
                  </Stack>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper p="lg" radius="md" withBorder>
                  <Text fw={600} size="lg" mb="md">
                    Notes
                  </Text>
                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                    {client.notes || 'No notes added yet'}
                  </Text>
                </Paper>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
