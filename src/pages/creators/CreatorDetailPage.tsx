/**
 * Creator Detail Page - View comprehensive creator information
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
  Rating,
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
  ArrowLeft,
  HardDrive,
  Instagram,
  Linkedin,
  Briefcase,
  Building,
  Calendar,
  BarChart3 as IconChartBar,
  Check,
  Clock,
  DollarSign,
  MoreVertical,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  FolderOpen,
  Mail,
  MapPin,
  MessageSquare,
  Mic,
  Edit3,
  Phone,
  Image,
  Plus,
  Star,
  Trash2,
  TrendingUp,
  User,
  Video,
  Globe,
  X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { AssignToCampaignModal } from '@/components/creators/AssignToCampaignModal';
import { campaignService } from '@/services/campaign.service';
import { clientService } from '@/services/client.service';
import { creatorService } from '@/services/creator.service';
import { driveService } from '@/services/drive.service';
import { mediaService } from '@/services/media.service';

const statusColors = {
  ACTIVE: 'green',
  INACTIVE: 'gray',
  BUSY: 'yellow',
  VACATION: 'blue',
};

const orderStatusColors = {
  NEW: 'blue',
  ASSIGNED: 'cyan',
  IN_PROGRESS: 'yellow',
  SUBMITTED: 'orange',
  REVISION_REQUESTED: 'red',
  APPROVED: 'green',
  COMPLETED: 'green',
  CANCELLED: 'gray',
};

const skillIcons: Record<string, any> = {
  'video-editing': Video,
  photography: Image,
  copywriting: Edit3,
  'voice-over': Mic,
};

export function CreatorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [assignModalOpened, setAssignModalOpened] = useState(false);

  // Fetch creator details
  const { data: creator, isLoading: creatorLoading } = useQuery({
    queryKey: ['creator', id],
    queryFn: () => creatorService.getCreator(id!),
    enabled: !!id,
  });

  // Fetch creator's orders/campaigns
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['creator-orders', id],
    queryFn: async () => {
      // Get all campaigns and filter orders for this creator
      const allCampaigns = await campaignService.getCampaigns();
      const creatorOrders: any[] = [];

      allCampaigns.campaigns.forEach((campaign: any) => {
        campaign.orders?.forEach((order: any) => {
          if (order.creatorId === id) {
            creatorOrders.push({
              ...order,
              campaign,
            });
          }
        });
      });

      return creatorOrders;
    },
    enabled: !!id,
  });

  // Fetch unique clients this creator worked with
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['creator-clients', id],
    queryFn: async () => {
      if (!orders) return [];

      const clientIds = new Set<string>();
      orders.forEach((order: any) => {
        if (order.campaign?.clientId) {
          clientIds.add(order.campaign.clientId);
        }
      });

      const clientPromises = Array.from(clientIds).map((clientId) =>
        clientService.getClient(clientId)
      );

      return Promise.all(clientPromises);
    },
    enabled: !!orders,
  });

  // Fetch creator's media/content
  const { data: media, isLoading: mediaLoading } = useQuery({
    queryKey: ['creator-media', id],
    queryFn: () => mediaService.getAllMedia({ uploadedBy: id }),
    enabled: !!id,
  });

  // Fetch Google Drive folder info
  const { data: driveInfo } = useQuery({
    queryKey: ['creator-drive', id],
    queryFn: () => driveService.getCreatorFolder(id!),
    enabled: !!id,
  });

  if (creatorLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!creator) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Text>Creator not found</Text>
        </Center>
      </Container>
    );
  }

  const totalEarnings =
    orders?.reduce(
      (sum: number, order: any) =>
        sum +
        (order.campaign?.budget
          ? Number(order.campaign.budget) / (order.campaign._count?.orders || 1)
          : 0),
      0
    ) || 0;
  const completedOrders = orders?.filter((o: any) => o.status === 'COMPLETED').length || 0;
  const activeOrders =
    orders?.filter((o: any) => o.status === 'IN_PROGRESS' || o.status === 'ASSIGNED').length || 0;
  const rating = creator.rating || 4.8;
  const completionRate =
    orders?.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 0;

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Anchor component={Link} to="/creators" size="sm">
            Creators
          </Anchor>
          <Text size="sm">{creator.name}</Text>
        </Breadcrumbs>

        {/* Header */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Group align="flex-start" gap="lg">
              <Avatar
                src={creator.image}
                size={80}
                radius="xl"
                color="blue"
                className="ring-4 ring-blue-100"
              >
                {creator.name?.charAt(0).toUpperCase() || <User size={36} />}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Group gap="sm" align="center" mb="xs">
                  <Title order={2}>{creator.name}</Title>
                  <Badge color={statusColors[creator.status || 'ACTIVE']} variant="light">
                    {creator.status || 'Active'}
                  </Badge>
                  <Group gap={4}>
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <Text fw={500}>{rating.toFixed(1)}</Text>
                  </Group>
                </Group>
                <Group gap="xl" mb="sm">
                  <Group gap="xs">
                    <Mail size={16} className="text-gray-400" />
                    <Text size="sm">{creator.email}</Text>
                  </Group>
                  {creator.phone && (
                    <Group gap="xs">
                      <Phone size={16} className="text-gray-400" />
                      <Text size="sm">{creator.phone}</Text>
                    </Group>
                  )}
                  {creator.socialMedia && (
                    <Group gap="xs">
                      <Instagram size={16} className="text-gray-400" />
                      <Text size="sm">{creator.socialMedia}</Text>
                    </Group>
                  )}
                </Group>
                {creator.skills && creator.skills.length > 0 && (
                  <Group gap="xs">
                    {creator.skills.map((skill: string) => {
                      const IconComponent = skillIcons[skill] || IconStar;
                      return (
                        <Badge
                          key={skill}
                          leftSection={<IconComponent size={12} />}
                          variant="light"
                          color="blue"
                        >
                          {skill}
                        </Badge>
                      );
                    })}
                  </Group>
                )}
              </div>
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Group justify="flex-end">
              <Button
                variant="light"
                leftSection={<MessageSquare size={16} />}
                onClick={() => navigate('/messages', { state: { creatorId: creator.id } })}
              >
                Message
              </Button>
              <Button
                leftSection={<Briefcase size={16} />}
                onClick={() => setAssignModalOpened(true)}
              >
                Assign to Campaign
              </Button>
              <Menu position="bottom-end" withArrow>
                <Menu.Target>
                  <ActionIcon variant="light" size="lg">
                    <MoreVertical size={20} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<Edit size={16} />}
                    onClick={() => navigate(`/creators/${creator.id}/edit`)}
                  >
                    Edit Creator
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<FolderOpen size={16} />}
                    onClick={() => window.open(driveInfo?.folderLink, '_blank')}
                    disabled={!driveInfo?.folderLink}
                  >
                    Open Media Folder
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<Trash2 size={16} />}
                    color="red"
                    disabled={orders && orders.length > 0}
                  >
                    Remove Creator
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
                  Total Orders
                </Text>
                <ThemeIcon size="sm" radius="md" variant="light" color="blue">
                  <Briefcase size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>
                {orders?.length || 0}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {activeOrders} active
              </Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Total Earnings
                </Text>
                <ThemeIcon size="sm" radius="md" variant="light" color="green">
                  <DollarSign size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>
                ${Math.round(totalEarnings).toLocaleString()}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                ${creator.rates || 0}/project
              </Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Completion Rate
                </Text>
                <ThemeIcon size="sm" radius="md" variant="light" color="yellow">
                  <IconChartBar size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>
                {completionRate}%
              </Text>
              <Progress
                value={completionRate}
                size="xs"
                radius="xl"
                color={completionRate > 90 ? 'green' : completionRate > 70 ? 'yellow' : 'red'}
                mt={8}
              />
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Content Pieces
                </Text>
                <ThemeIcon size="sm" radius="md" variant="light" color="purple">
                  <Video size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>
                {media?.media?.length || 0}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Uploaded files
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="orders" leftSection={<Briefcase size={16} />}>
              Orders ({orders?.length || 0})
            </Tabs.Tab>
            <Tabs.Tab value="clients" leftSection={<Building size={16} />}>
              Clients ({clients?.length || 0})
            </Tabs.Tab>
            <Tabs.Tab value="content" leftSection={<Video size={16} />}>
              Content ({media?.media?.length || 0})
            </Tabs.Tab>
            <Tabs.Tab value="profile" leftSection={<User size={16} />}>
              Profile
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Grid>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap="lg">
                  {/* Recent Orders */}
                  <Paper p="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <Text fw={600} size="lg">
                        Recent Orders
                      </Text>
                      <Button variant="subtle" size="sm" onClick={() => setActiveTab('orders')}>
                        View all
                      </Button>
                    </Group>
                    {ordersLoading ? (
                      <Center h={100}>
                        <Loader size="sm" />
                      </Center>
                    ) : orders?.length === 0 ? (
                      <Text c="dimmed" ta="center" py="xl">
                        No orders yet
                      </Text>
                    ) : (
                      <Stack gap="sm">
                        {orders?.slice(0, 3).map((order: any) => (
                          <Paper key={order.id} p="sm" radius="md" withBorder>
                            <Group justify="space-between">
                              <div>
                                <Group gap="xs" mb={4}>
                                  <Text fw={500}>{order.campaign?.title}</Text>
                                  <Badge
                                    color={orderStatusColors[order.status]}
                                    variant="light"
                                    size="xs"
                                  >
                                    {order.status}
                                  </Badge>
                                </Group>
                                <Group gap="xl">
                                  <Text size="sm" c="dimmed">
                                    Client: {order.campaign?.client?.name}
                                  </Text>
                                  <Text size="sm" c="dimmed">
                                    Assigned: {new Date(order.assignedAt).toLocaleDateString()}
                                  </Text>
                                </Group>
                              </div>
                              <ActionIcon
                                variant="subtle"
                                onClick={() => navigate(`/campaigns/${order.campaign?.id}`)}
                              >
                                <ExternalLink size={16} />
                              </ActionIcon>
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </Paper>

                  {/* Performance Overview */}
                  <Paper p="lg" radius="md" withBorder>
                    <Text fw={600} size="lg" mb="md">
                      Performance Overview
                    </Text>
                    <Grid>
                      <Grid.Col span={6}>
                        <Stack gap="md">
                          <div>
                            <Text size="sm" c="dimmed" mb="xs">
                              Rating
                            </Text>
                            <Group gap="xs">
                              <Rating value={rating} fractions={2} readOnly />
                              <Text size="sm" fw={500}>
                                ({rating.toFixed(1)})
                              </Text>
                            </Group>
                          </div>
                          <div>
                            <Text size="sm" c="dimmed" mb="xs">
                              Order Status Distribution
                            </Text>
                            <Stack gap="xs">
                              <Group justify="space-between">
                                <Text size="sm">Completed</Text>
                                <Text size="sm" fw={500}>
                                  {completedOrders}
                                </Text>
                              </Group>
                              <Group justify="space-between">
                                <Text size="sm">In Progress</Text>
                                <Text size="sm" fw={500}>
                                  {activeOrders}
                                </Text>
                              </Group>
                              <Group justify="space-between">
                                <Text size="sm">Other</Text>
                                <Text size="sm" fw={500}>
                                  {(orders?.length || 0) - completedOrders - activeOrders}
                                </Text>
                              </Group>
                            </Stack>
                          </div>
                        </Stack>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <div>
                          <Text size="sm" c="dimmed" mb="xs">
                            Order Completion
                          </Text>
                          <RingProgress
                            size={150}
                            thickness={16}
                            sections={[
                              {
                                value: completionRate,
                                color:
                                  completionRate > 90
                                    ? 'green'
                                    : completionRate > 70
                                      ? 'yellow'
                                      : 'red',
                              },
                            ]}
                            label={
                              <Text ta="center" size="lg" fw={700}>
                                {completionRate}%
                                <Text size="xs" c="dimmed">
                                  Completed
                                </Text>
                              </Text>
                            }
                          />
                        </div>
                      </Grid.Col>
                    </Grid>
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
                          Average Order Value
                        </Text>
                        <Text size="xl" fw={700}>
                          $
                          {orders?.length > 0
                            ? Math.round(totalEarnings / orders.length).toLocaleString()
                            : 0}
                        </Text>
                      </div>
                      <Divider />
                      <div>
                        <Text size="sm" c="dimmed">
                          Member Since
                        </Text>
                        <Text size="lg" fw={500}>
                          {new Date(creator.createdAt).toLocaleDateString()}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatDistanceToNow(new Date(creator.createdAt), { addSuffix: true })}
                        </Text>
                      </div>
                      <Divider />
                      <div>
                        <Text size="sm" c="dimmed">
                          Response Time
                        </Text>
                        <Badge size="lg" variant="light" color="green">
                          Fast (2-4 hours)
                        </Badge>
                      </div>
                    </Stack>
                  </Paper>

                  {/* Media Folder */}
                  {driveInfo && (
                    <Paper p="lg" radius="md" withBorder>
                      <Group justify="space-between" mb="md">
                        <Text fw={600} size="lg">
                          Media Folder
                        </Text>
                        <ActionIcon variant="light" color="blue">
                          <HardDrive size={20} />
                        </ActionIcon>
                      </Group>
                      <Stack gap="sm">
                        <Button
                          variant="light"
                          leftSection={<FolderOpen size={16} />}
                          fullWidth
                          onClick={() => window.open(driveInfo.folderLink, '_blank')}
                        >
                          Open in Google Drive
                        </Button>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Files
                          </Text>
                          <Text size="sm" fw={500}>
                            {driveInfo.fileCount || 0}
                          </Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Storage
                          </Text>
                          <Text size="sm" fw={500}>
                            {driveInfo.storageUsed || '0 MB'}
                          </Text>
                        </Group>
                      </Stack>
                    </Paper>
                  )}
                </Stack>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="orders" pt="md">
            {ordersLoading ? (
              <Center h={200}>
                <Loader />
              </Center>
            ) : orders?.length === 0 ? (
              <Paper p="xl" radius="md" withBorder ta="center">
                <Briefcase size={48} className="text-gray-300 mx-auto mb-4" />
                <Text c="dimmed" mb="md">
                  No orders assigned yet
                </Text>
                <Button
                  leftSection={<Briefcase size={16} />}
                  onClick={() => setAssignModalOpened(true)}
                >
                  Assign to Campaign
                </Button>
              </Paper>
            ) : (
              <Stack gap="md">
                {orders?.map((order: any) => (
                  <Paper key={order.id} p="lg" radius="md" withBorder>
                    <Grid align="center">
                      <Grid.Col span={{ base: 12, md: 8 }}>
                        <Group gap="xs" mb="xs">
                          <Text size="lg" fw={600}>
                            {order.campaign?.title}
                          </Text>
                          <Badge color={orderStatusColors[order.status]} variant="light">
                            {order.status}
                          </Badge>
                        </Group>
                        <Text size="sm" c="blue.7" fw={500} mb="xs">
                          {order.campaign?.client?.name}
                        </Text>
                        <Text size="sm" c="dimmed" mb="md">
                          {order.campaign?.brief}
                        </Text>
                        <Group gap="xl">
                          <div>
                            <Text size="xs" c="dimmed">
                              Assigned
                            </Text>
                            <Text fw={500}>{new Date(order.assignedAt).toLocaleDateString()}</Text>
                          </div>
                          {order.completedAt && (
                            <div>
                              <Text size="xs" c="dimmed">
                                Completed
                              </Text>
                              <Text fw={500}>
                                {new Date(order.completedAt).toLocaleDateString()}
                              </Text>
                            </div>
                          )}
                          <div>
                            <Text size="xs" c="dimmed">
                              Budget Share
                            </Text>
                            <Text fw={500}>
                              $
                              {Math.round(
                                Number(order.campaign?.budget || 0) /
                                  (order.campaign?._count?.orders || 1)
                              ).toLocaleString()}
                            </Text>
                          </div>
                        </Group>
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 4 }}>
                        <Group justify="flex-end">
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => navigate(`/campaigns/${order.campaign?.id}`)}
                          >
                            View Campaign
                          </Button>
                        </Group>
                      </Grid.Col>
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="clients" pt="md">
            {clientsLoading ? (
              <Center h={200}>
                <Loader />
              </Center>
            ) : clients?.length === 0 ? (
              <Paper p="xl" radius="md" withBorder ta="center">
                <Building size={48} className="text-gray-300 mx-auto mb-4" />
                <Text c="dimmed">No clients worked with yet</Text>
              </Paper>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                {clients?.map((client: any) => (
                  <Card key={client.id} shadow="sm" radius="md" withBorder>
                    <Group mb="md">
                      <Avatar size={50} radius="md" color="blue">
                        <Building size={24} />
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Text fw={500}>{client.name}</Text>
                        <Text size="sm" c="blue.7" fw={500}>
                          {client.company}
                        </Text>
                      </div>
                    </Group>
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Campaigns
                        </Text>
                        <Text size="sm" fw={500}>
                          {orders?.filter((o: any) => o.campaign?.clientId === client.id).length ||
                            0}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Total Value
                        </Text>
                        <Text size="sm" fw={500} c="green">
                          $
                          {orders
                            ?.filter((o: any) => o.campaign?.clientId === client.id)
                            .reduce(
                              (sum: number, o: any) =>
                                sum +
                                Number(o.campaign?.budget || 0) / (o.campaign?._count?.orders || 1),
                              0
                            )
                            .toLocaleString() || 0}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Status
                        </Text>
                        <Badge size="sm" color={statusColors[client.status]} variant="light">
                          {client.status}
                        </Badge>
                      </Group>
                    </Stack>
                    <Button
                      variant="light"
                      size="sm"
                      fullWidth
                      mt="md"
                      onClick={() => navigate(`/clients/${client.id}`)}
                    >
                      View Client
                    </Button>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="content" pt="md">
            {mediaLoading ? (
              <Center h={200}>
                <Loader />
              </Center>
            ) : media?.media?.length === 0 ? (
              <Paper p="xl" radius="md" withBorder ta="center">
                <Video size={48} className="text-gray-300 mx-auto mb-4" />
                <Text c="dimmed" mb="md">
                  No content uploaded yet
                </Text>
                <Button leftSection={<Video size={16} />} onClick={() => navigate('/media')}>
                  Upload Content
                </Button>
              </Paper>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                {media?.media?.map((item: any) => (
                  <Card key={item.id} shadow="sm" radius="md" withBorder>
                    {item.type === 'IMAGE' ? (
                      <Card.Section>
                        <img
                          src={item.url}
                          alt={item.filename}
                          style={{ width: '100%', height: 200, objectFit: 'cover' }}
                        />
                      </Card.Section>
                    ) : (
                      <Card.Section
                        h={200}
                        className="bg-gray-100 flex items-center justify-center"
                      >
                        <Video size={48} className="text-gray-400" />
                      </Card.Section>
                    )}
                    <Stack gap="xs" mt="md">
                      <Text size="sm" fw={500} lineClamp={1}>
                        {item.filename}
                      </Text>
                      <Group justify="space-between">
                        <Badge size="xs" variant="light">
                          {item.type}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </Group>
                      <Group gap="xs">
                        <Button
                          variant="light"
                          size="xs"
                          leftSection={<Eye size={14} />}
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          View
                        </Button>
                        <Button
                          variant="light"
                          size="xs"
                          leftSection={<Download size={14} />}
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = item.url;
                            a.download = item.filename;
                            a.click();
                          }}
                        >
                          Download
                        </Button>
                      </Group>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="profile" pt="md">
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper p="lg" radius="md" withBorder>
                  <Text fw={600} size="lg" mb="md">
                    Personal Information
                  </Text>
                  <Stack gap="md">
                    <div>
                      <Text size="sm" c="dimmed">
                        Full Name
                      </Text>
                      <Text fw={500}>{creator.name}</Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">
                        Email
                      </Text>
                      <Text fw={500}>{creator.email}</Text>
                    </div>
                    {creator.phone && (
                      <div>
                        <Text size="sm" c="dimmed">
                          Phone
                        </Text>
                        <Text fw={500}>{creator.phone}</Text>
                      </div>
                    )}
                    <div>
                      <Text size="sm" c="dimmed">
                        Rate per Project
                      </Text>
                      <Text fw={500} c="green">
                        ${creator.rates || 0}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">
                        Member Since
                      </Text>
                      <Text fw={500}>{new Date(creator.createdAt).toLocaleDateString()}</Text>
                    </div>
                  </Stack>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="lg">
                  <Paper p="lg" radius="md" withBorder>
                    <Text fw={600} size="lg" mb="md">
                      Professional Info
                    </Text>
                    <Stack gap="md">
                      {creator.portfolioUrl && (
                        <div>
                          <Text size="sm" c="dimmed">
                            Portfolio
                          </Text>
                          <Anchor href={creator.portfolioUrl} target="_blank" size="sm">
                            {creator.portfolioUrl}
                          </Anchor>
                        </div>
                      )}
                      {creator.socialMedia && (
                        <div>
                          <Text size="sm" c="dimmed">
                            Social Media
                          </Text>
                          <Group gap="xs">
                            <Instagram size={16} />
                            <Text size="sm">{creator.socialMedia}</Text>
                          </Group>
                        </div>
                      )}
                      {creator.skills && creator.skills.length > 0 && (
                        <div>
                          <Text size="sm" c="dimmed" mb="xs">
                            Skills
                          </Text>
                          <Group gap="xs">
                            {creator.skills.map((skill: string) => (
                              <Badge key={skill} variant="light">
                                {skill}
                              </Badge>
                            ))}
                          </Group>
                        </div>
                      )}
                    </Stack>
                  </Paper>
                  {creator.bio && (
                    <Paper p="lg" radius="md" withBorder>
                      <Text fw={600} size="lg" mb="md">
                        Bio
                      </Text>
                      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                        {creator.bio}
                      </Text>
                    </Paper>
                  )}
                </Stack>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>
        </Tabs>

        {/* Assignment Modal */}
        <AssignToCampaignModal
          opened={assignModalOpened}
          onClose={() => setAssignModalOpened(false)}
          creatorId={creator.id}
          creatorName={creator.name}
        />
      </Stack>
    </Container>
  );
}
