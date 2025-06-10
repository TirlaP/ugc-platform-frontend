/**
 * Campaign Detail Page - View comprehensive campaign information
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
  List,
  Loader,
  Menu,
  Modal,
  Paper,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Textarea,
  ThemeIcon,
  Timeline,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconArchive,
  IconBuilding,
  IconCalendar,
  IconChartBar,
  IconCheck,
  IconCurrencyDollar,
  IconDots,
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconFileDescription,
  IconFolder,
  IconMail,
  IconMessage,
  IconPaperclip,
  IconUser,
  IconUserMinus,
  IconUserPlus,
  IconVideo,
  IconX,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { campaignService } from '@/services/campaign.service';
import { creatorService } from '@/services/creator.service';
import { driveService } from '@/services/drive.service';
import { emailService } from '@/services/email.service';
import { mediaService } from '@/services/media.service';
import { messageService } from '@/services/message.service';
import { modals } from '@mantine/modals';

const statusColors = {
  DRAFT: 'gray',
  ACTIVE: 'blue',
  IN_PROGRESS: 'cyan',
  REVIEW: 'yellow',
  COMPLETED: 'green',
  CANCELLED: 'red',
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

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [assignModalOpened, { open: openAssignModal, close: closeAssignModal }] =
    useDisclosure(false);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('');
  const [assignmentNote, setAssignmentNote] = useState<string>('');

  // Fetch campaign details
  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignService.getCampaign(id!),
    enabled: !!id,
  });

  // Fetch campaign media
  const { data: media, isLoading: mediaLoading } = useQuery({
    queryKey: ['campaign-media', id],
    queryFn: () => mediaService.getCampaignMedia(id!),
    enabled: !!id,
  });

  // Fetch campaign messages
  const { data: messages } = useQuery({
    queryKey: ['campaign-messages', id],
    queryFn: () => messageService.getMessages(id!),
    enabled: !!id,
  });

  // Fetch available creators for assignment
  const { data: availableCreators } = useQuery({
    queryKey: ['available-creators'],
    queryFn: () => creatorService.getCreators({ status: 'ACTIVE' }),
  });

  // Fetch campaign drive info
  const { data: driveInfo } = useQuery({
    queryKey: ['campaign-drive', id],
    queryFn: () => driveService.getCampaignStructure(id!),
    enabled: !!id,
  });

  // Fetch email threads
  const { data: emailThreads } = useQuery({
    queryKey: ['campaign-emails', id],
    queryFn: () => emailService.getCampaignThreads(id!),
    enabled: !!id,
  });

  // Assign creator mutation
  const assignCreatorMutation = useMutation({
    mutationFn: (data: { campaignId: string; creatorId: string; notes?: string }) =>
      campaignService.assignCreator(data.campaignId, data.creatorId, data.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      notifications.show({
        title: 'Success',
        message: 'Creator assigned successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      closeAssignModal();
      setSelectedCreatorId('');
      setAssignmentNote('');
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to assign creator',
        color: 'red',
        icon: <IconX size={16} />,
      });
    },
  });

  // Unassign creator mutation
  const unassignMutation = useMutation({
    mutationFn: ({ orderId }: { orderId: string }) => {
      return campaignService.unassignCreator(id!, orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      notifications.show({
        title: 'Success',
        message: 'Creator has been unassigned from the campaign',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to unassign creator',
        color: 'red',
        icon: <IconX size={16} />,
      });
    },
  });

  // Update campaign status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => campaignService.updateCampaign(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      notifications.show({
        title: 'Success',
        message: 'Campaign status updated',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    },
  });

  if (campaignLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!campaign) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Text>Campaign not found</Text>
        </Center>
      </Container>
    );
  }

  const assignedCreators = campaign.orders?.map((order: any) => order.creator) || [];
  const completedOrders = campaign.orders?.filter((o: any) => o.status === 'COMPLETED').length || 0;
  const inProgressOrders =
    campaign.orders?.filter((o: any) => o.status === 'IN_PROGRESS' || o.status === 'SUBMITTED')
      .length || 0;
  const totalOrders = campaign.orders?.length || 0;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  const handleAssignCreator = () => {
    if (!selectedCreatorId) return;

    assignCreatorMutation.mutate({
      campaignId: id!,
      creatorId: selectedCreatorId,
      notes: assignmentNote,
    });
  };

  const handleUnassignCreator = (order: any) => {
    modals.openConfirmModal({
      title: 'Unassign Creator',
      children: (
        <Stack gap="sm">
          <Text size="sm">
            Are you sure you want to unassign <strong>{order.creator.name}</strong> from this
            campaign?
          </Text>
          {order.status !== 'NEW' && order.status !== 'ASSIGNED' && (
            <Paper p="sm" radius="md" withBorder className="bg-yellow-50 border-yellow-200">
              <Group gap="xs">
                <IconCheck size={16} className="text-yellow-600" />
                <Text size="xs" c="yellow.8">
                  This creator has already started work on this campaign (Status: {order.status})
                </Text>
              </Group>
            </Paper>
          )}
        </Stack>
      ),
      labels: { confirm: 'Unassign', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => unassignMutation.mutate({ orderId: order.id }),
    });
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate(newStatus);
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Anchor component={Link} to="/campaigns" size="sm">
            Campaigns
          </Anchor>
          <Text size="sm">{campaign.title}</Text>
        </Breadcrumbs>

        {/* Header */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="sm">
              <Group gap="sm" align="center">
                <Title order={2}>{campaign.title}</Title>
                <Badge color={statusColors[campaign.status]} variant="light" size="lg">
                  {campaign.status}
                </Badge>
              </Group>
              <Group gap="xl">
                <Group gap="xs">
                  <IconBuilding size={16} className="text-gray-400" />
                  <Text size="sm" fw={500}>
                    {campaign.client?.name}
                  </Text>
                </Group>
                <Group gap="xs">
                  <IconCurrencyDollar size={16} className="text-gray-400" />
                  <Text size="sm" fw={500}>
                    ${Number(campaign.budget).toLocaleString()}
                  </Text>
                </Group>
                {campaign.deadline && (
                  <Group gap="xs">
                    <IconCalendar size={16} className="text-gray-400" />
                    <Text size="sm" fw={500}>
                      Due {new Date(campaign.deadline).toLocaleDateString()}
                    </Text>
                  </Group>
                )}
              </Group>
              <Text size="sm" c="dimmed">
                {campaign.brief}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Group justify="flex-end">
              <Button
                variant="light"
                leftSection={<IconMessage size={16} />}
                onClick={() => navigate('/messages', { state: { campaignId: campaign.id } })}
              >
                Messages
              </Button>
              <Button
                leftSection={<IconUserPlus size={16} />}
                onClick={openAssignModal}
                disabled={campaign.status === 'COMPLETED' || campaign.status === 'CANCELLED'}
              >
                Assign Creator
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
                    onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
                    disabled={campaign.status === 'COMPLETED' || campaign.status === 'CANCELLED'}
                  >
                    Edit Campaign
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconFolder size={16} />}
                    onClick={() => window.open(driveInfo?.root?.folders?.[0]?.id, '_blank')}
                    disabled={!driveInfo}
                  >
                    Open Drive Folder
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Label>Change Status</Menu.Label>
                  {Object.keys(statusColors).map((status) => (
                    <Menu.Item
                      key={status}
                      leftSection={
                        <Box
                          w={12}
                          h={12}
                          bg={statusColors[status as keyof typeof statusColors]}
                          style={{ borderRadius: '50%' }}
                        />
                      }
                      onClick={() => handleStatusChange(status)}
                      disabled={campaign.status === status}
                    >
                      {status}
                    </Menu.Item>
                  ))}
                  <Menu.Divider />
                  <Menu.Item leftSection={<IconArchive size={16} />} color="red">
                    Archive Campaign
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
                  Assigned Creators
                </Text>
                <ThemeIcon size="sm" radius="md" variant="light" color="blue">
                  <IconUser size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>
                {assignedCreators.length}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {inProgressOrders} working
              </Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Content Pieces
                </Text>
                <ThemeIcon size="sm" radius="md" variant="light" color="purple">
                  <IconVideo size={16} />
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
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Messages
                </Text>
                <ThemeIcon size="sm" radius="md" variant="light" color="green">
                  <IconMessage size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>
                {messages?.length || 0}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Total messages
              </Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Completion
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
                color={completionRate > 90 ? 'green' : completionRate > 50 ? 'yellow' : 'red'}
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
            <Tabs.Tab value="creators" leftSection={<IconUser size={16} />}>
              Creators ({assignedCreators.length})
            </Tabs.Tab>
            <Tabs.Tab value="content" leftSection={<IconVideo size={16} />}>
              Content ({media?.media?.length || 0})
            </Tabs.Tab>
            <Tabs.Tab value="communication" leftSection={<IconMessage size={16} />}>
              Communication
            </Tabs.Tab>
            <Tabs.Tab value="requirements" leftSection={<IconFileDescription size={16} />}>
              Requirements
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Grid>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap="lg">
                  {/* Campaign Progress */}
                  <Paper p="lg" radius="md" withBorder>
                    <Text fw={600} size="lg" mb="md">
                      Campaign Progress
                    </Text>
                    <Timeline active={-1} bulletSize={24} lineWidth={2}>
                      <Timeline.Item
                        bullet={<IconCheck size={12} />}
                        title="Campaign Created"
                        color="green"
                      >
                        <Text c="dimmed" size="sm">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </Text>
                        <Text size="sm" mt={4}>
                          Campaign created by {campaign.createdBy?.name}
                        </Text>
                      </Timeline.Item>

                      {campaign.orders?.map((order: any) => (
                        <Timeline.Item
                          key={order.id}
                          bullet={<IconUser size={12} />}
                          title={`${order.creator.name} assigned`}
                          color={order.status === 'COMPLETED' ? 'green' : 'blue'}
                        >
                          <Text c="dimmed" size="sm">
                            {new Date(order.assignedAt).toLocaleDateString()}
                          </Text>
                          <Badge
                            color={orderStatusColors[order.status]}
                            variant="light"
                            size="xs"
                            mt={4}
                          >
                            {order.status}
                          </Badge>
                        </Timeline.Item>
                      ))}

                      {campaign.status === 'COMPLETED' && (
                        <Timeline.Item
                          bullet={<IconCheck size={12} />}
                          title="Campaign Completed"
                          color="green"
                        >
                          <Text c="dimmed" size="sm">
                            {new Date(campaign.updatedAt).toLocaleDateString()}
                          </Text>
                        </Timeline.Item>
                      )}
                    </Timeline>
                  </Paper>

                  {/* Recent Activity */}
                  <Paper p="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <Text fw={600} size="lg">
                        Recent Activity
                      </Text>
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => setActiveTab('communication')}
                      >
                        View all
                      </Button>
                    </Group>
                    {messages && messages.length > 0 ? (
                      <Stack gap="sm">
                        {messages.slice(0, 3).map((message: any) => (
                          <Paper key={message.id} p="sm" radius="md" withBorder>
                            <Group justify="space-between">
                              <Group gap="sm">
                                <Avatar size="sm" radius="xl">
                                  {message.sender.name?.charAt(0)}
                                </Avatar>
                                <div>
                                  <Text size="sm" fw={500}>
                                    {message.sender.name}
                                  </Text>
                                  <Text size="xs" c="dimmed" lineClamp={1}>
                                    {message.content}
                                  </Text>
                                </div>
                              </Group>
                              <Text size="xs" c="dimmed">
                                {formatDistanceToNow(new Date(message.createdAt), {
                                  addSuffix: true,
                                })}
                              </Text>
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
                      <Text c="dimmed" ta="center" py="md">
                        No recent activity
                      </Text>
                    )}
                  </Paper>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack gap="lg">
                  {/* Campaign Details */}
                  <Paper p="lg" radius="md" withBorder>
                    <Text fw={600} size="lg" mb="md">
                      Campaign Details
                    </Text>
                    <Stack gap="md">
                      <div>
                        <Text size="sm" c="dimmed">
                          Client
                        </Text>
                        <Group gap="xs" mt={4}>
                          <Avatar size="sm" radius="md" color="blue">
                            <IconBuilding size={16} />
                          </Avatar>
                          <div>
                            <Text size="sm" fw={500}>
                              {campaign.client?.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {campaign.client?.company}
                            </Text>
                          </div>
                        </Group>
                      </div>
                      <Divider />
                      <div>
                        <Text size="sm" c="dimmed">
                          Budget
                        </Text>
                        <Text size="xl" fw={700} c="green">
                          ${Number(campaign.budget).toLocaleString()}
                        </Text>
                      </div>
                      <Divider />
                      <div>
                        <Text size="sm" c="dimmed">
                          Timeline
                        </Text>
                        <Stack gap="xs" mt={4}>
                          <Group justify="space-between">
                            <Text size="sm">Created</Text>
                            <Text size="sm" fw={500}>
                              {new Date(campaign.createdAt).toLocaleDateString()}
                            </Text>
                          </Group>
                          {campaign.deadline && (
                            <Group justify="space-between">
                              <Text size="sm">Deadline</Text>
                              <Text size="sm" fw={500}>
                                {new Date(campaign.deadline).toLocaleDateString()}
                              </Text>
                            </Group>
                          )}
                          <Group justify="space-between">
                            <Text size="sm">Time Left</Text>
                            <Text
                              size="sm"
                              fw={500}
                              c={
                                campaign.deadline && new Date(campaign.deadline) < new Date()
                                  ? 'red'
                                  : 'green'
                              }
                            >
                              {campaign.deadline
                                ? formatDistanceToNow(new Date(campaign.deadline), {
                                    addSuffix: true,
                                  })
                                : 'No deadline'}
                            </Text>
                          </Group>
                        </Stack>
                      </div>
                    </Stack>
                  </Paper>

                  {/* Quick Actions */}
                  <Paper p="lg" radius="md" withBorder>
                    <Text fw={600} size="lg" mb="md">
                      Quick Actions
                    </Text>
                    <Stack gap="sm">
                      <Button
                        variant="light"
                        leftSection={<IconMail size={16} />}
                        fullWidth
                        onClick={() => navigate(`/campaigns/${campaign.id}/email`)}
                      >
                        Send Email Update
                      </Button>
                      <Button
                        variant="light"
                        leftSection={<IconFolder size={16} />}
                        fullWidth
                        onClick={() => window.open(driveInfo?.root?.folders?.[0]?.id, '_blank')}
                        disabled={!driveInfo}
                      >
                        Open Google Drive
                      </Button>
                      <Button
                        variant="light"
                        leftSection={<IconDownload size={16} />}
                        fullWidth
                        onClick={() => navigate(`/campaigns/${campaign.id}/export`)}
                      >
                        Export Campaign Data
                      </Button>
                    </Stack>
                  </Paper>
                </Stack>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="creators" pt="md">
            {assignedCreators.length === 0 ? (
              <Paper p="xl" radius="md" withBorder ta="center">
                <IconUser size={48} className="text-gray-300 mx-auto mb-4" />
                <Text c="dimmed" mb="md">
                  No creators assigned yet
                </Text>
                <Button leftSection={<IconUserPlus size={16} />} onClick={openAssignModal}>
                  Assign First Creator
                </Button>
              </Paper>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                {campaign.orders?.map((order: any) => (
                  <Card key={order.id} shadow="sm" radius="md" withBorder>
                    <Group mb="md">
                      <Avatar src={order.creator.image} size={50} radius="xl" color="blue">
                        {order.creator.name?.charAt(0) || <IconUser size={24} />}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Text fw={500}>{order.creator.name}</Text>
                        <Badge color={orderStatusColors[order.status]} variant="light" size="sm">
                          {order.status}
                        </Badge>
                      </div>
                    </Group>
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Assigned
                        </Text>
                        <Text size="sm" fw={500}>
                          {new Date(order.assignedAt).toLocaleDateString()}
                        </Text>
                      </Group>
                      {order.completedAt && (
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Completed
                          </Text>
                          <Text size="sm" fw={500}>
                            {new Date(order.completedAt).toLocaleDateString()}
                          </Text>
                        </Group>
                      )}
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Rate
                        </Text>
                        <Text size="sm" fw={500} c="green">
                          ${order.creator.rates || 0}
                        </Text>
                      </Group>
                      {order.notes && (
                        <div>
                          <Text size="xs" c="dimmed">
                            Notes
                          </Text>
                          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                            {order.notes}
                          </Text>
                        </div>
                      )}
                    </Stack>
                    <Group gap="xs" mt="md" justify="space-between">
                      <Group gap="xs">
                        <Button
                          variant="light"
                          size="sm"
                          leftSection={<IconMessage size={14} />}
                          onClick={() =>
                            navigate('/messages', {
                              state: { campaignId: campaign.id, recipientId: order.creator.id },
                            })
                          }
                        >
                          Message
                        </Button>
                        <Button
                          variant="light"
                          size="sm"
                          leftSection={<IconUser size={14} />}
                          onClick={() => navigate(`/creators/${order.creator.id}`)}
                        >
                          Profile
                        </Button>
                      </Group>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="light" color="gray">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconUserMinus size={14} />}
                            color="red"
                            onClick={() => handleUnassignCreator(order)}
                            disabled={unassignMutation.isPending}
                          >
                            Unassign Creator
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
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
                <IconVideo size={48} className="text-gray-300 mx-auto mb-4" />
                <Text c="dimmed" mb="md">
                  No content uploaded yet
                </Text>
                <Button
                  leftSection={<IconVideo size={16} />}
                  onClick={() => navigate('/media', { state: { campaignId: campaign.id } })}
                >
                  Upload Content
                </Button>
              </Paper>
            ) : (
              <div>
                <Group justify="space-between" mb="md">
                  <Text fw={600}>Campaign Content</Text>
                  <Button
                    variant="light"
                    size="sm"
                    leftSection={<IconVideo size={16} />}
                    onClick={() => navigate('/media', { state: { campaignId: campaign.id } })}
                  >
                    Upload More
                  </Button>
                </Group>
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
                      ) : item.type === 'VIDEO' ? (
                        <Card.Section
                          h={200}
                          className="bg-gray-100 flex items-center justify-center"
                        >
                          <IconVideo size={48} className="text-gray-400" />
                        </Card.Section>
                      ) : (
                        <Card.Section
                          h={200}
                          className="bg-gray-100 flex items-center justify-center"
                        >
                          <IconFileDescription size={48} className="text-gray-400" />
                        </Card.Section>
                      )}
                      <Stack gap="xs" mt="md">
                        <Text size="sm" fw={500} lineClamp={1}>
                          {item.filename}
                        </Text>
                        <Group justify="space-between">
                          <Group gap="xs">
                            <Badge size="xs" variant="light">
                              {item.type}
                            </Badge>
                            <Badge
                              size="xs"
                              variant="light"
                              color={item.status === 'APPROVED' ? 'green' : 'yellow'}
                            >
                              {item.status}
                            </Badge>
                          </Group>
                          <Text size="xs" c="dimmed">
                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                          </Text>
                        </Group>
                        <Group gap="xs" mt={4}>
                          <Avatar size="xs" radius="xl">
                            {item.uploader?.name?.charAt(0)}
                          </Avatar>
                          <Text size="xs" c="dimmed">
                            {item.uploader?.name}
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <Button
                            variant="light"
                            size="xs"
                            leftSection={<IconExternalLink size={14} />}
                            onClick={() => window.open(item.url, '_blank')}
                          >
                            View
                          </Button>
                          <Button
                            variant="light"
                            size="xs"
                            leftSection={<IconDownload size={14} />}
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
              </div>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="communication" pt="md">
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper p="lg" radius="md" withBorder h="100%">
                  <Group justify="space-between" mb="md">
                    <Text fw={600} size="lg">
                      Messages
                    </Text>
                    <Button
                      variant="light"
                      size="sm"
                      leftSection={<IconMessage size={16} />}
                      onClick={() => navigate('/messages', { state: { campaignId: campaign.id } })}
                    >
                      Open Chat
                    </Button>
                  </Group>
                  {messages && messages.length > 0 ? (
                    <Stack gap="sm" style={{ maxHeight: 400, overflowY: 'auto' }}>
                      {messages.map((message: any) => (
                        <Paper key={message.id} p="sm" radius="md" bg="gray.0">
                          <Group justify="space-between" mb="xs">
                            <Group gap="xs">
                              <Avatar size="sm" radius="xl">
                                {message.sender.name?.charAt(0)}
                              </Avatar>
                              <Text size="sm" fw={500}>
                                {message.sender.name}
                              </Text>
                            </Group>
                            <Text size="xs" c="dimmed">
                              {formatDistanceToNow(new Date(message.createdAt), {
                                addSuffix: true,
                              })}
                            </Text>
                          </Group>
                          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                            {message.content}
                          </Text>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Text c="dimmed" ta="center" py="xl">
                      No messages yet
                    </Text>
                  )}
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper p="lg" radius="md" withBorder h="100%">
                  <Group justify="space-between" mb="md">
                    <Text fw={600} size="lg">
                      Email Threads
                    </Text>
                    <Button
                      variant="light"
                      size="sm"
                      leftSection={<IconMail size={16} />}
                      onClick={() => navigate(`/campaigns/${campaign.id}/email`)}
                    >
                      Send Email
                    </Button>
                  </Group>
                  {emailThreads && emailThreads.length > 0 ? (
                    <Stack gap="sm" style={{ maxHeight: 400, overflowY: 'auto' }}>
                      {emailThreads.map((thread: any) => (
                        <Paper key={thread.id} p="sm" radius="md" withBorder>
                          <Group justify="space-between" mb="xs">
                            <Text size="sm" fw={500}>
                              {thread.subject}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {new Date(thread.date).toLocaleDateString()}
                            </Text>
                          </Group>
                          <Group gap="xs">
                            <Text size="xs" c="dimmed">
                              From:
                            </Text>
                            <Text size="xs">{thread.from}</Text>
                          </Group>
                          <Group gap="xs">
                            <Text size="xs" c="dimmed">
                              To:
                            </Text>
                            <Text size="xs">{thread.to.join(', ')}</Text>
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Text c="dimmed" ta="center" py="xl">
                      No email threads yet
                    </Text>
                  )}
                </Paper>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="requirements" pt="md">
            <Grid>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Paper p="lg" radius="md" withBorder>
                  <Text fw={600} size="lg" mb="md">
                    Campaign Brief
                  </Text>
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{campaign.brief}</Text>

                  {campaign.requirements && (
                    <>
                      <Divider my="lg" />
                      <Text fw={600} mb="md">
                        Requirements
                      </Text>
                      <List spacing="sm">
                        {campaign.requirements.contentType &&
                          campaign.requirements.contentType.length > 0 && (
                            <List.Item>
                              <Text size="sm">
                                <strong>Content Types:</strong>{' '}
                                {campaign.requirements.contentType.join(', ')}
                              </Text>
                            </List.Item>
                          )}
                        {campaign.requirements.platform &&
                          campaign.requirements.platform.length > 0 && (
                            <List.Item>
                              <Text size="sm">
                                <strong>Platforms:</strong>{' '}
                                {campaign.requirements.platform.join(', ')}
                              </Text>
                            </List.Item>
                          )}
                        {campaign.requirements.deliverables &&
                          campaign.requirements.deliverables.length > 0 && (
                            <List.Item>
                              <Text size="sm">
                                <strong>Deliverables:</strong>{' '}
                                {campaign.requirements.deliverables.join(', ')}
                              </Text>
                            </List.Item>
                          )}
                        {campaign.requirements.guidelines && (
                          <List.Item>
                            <Text size="sm">
                              <strong>Guidelines:</strong> {campaign.requirements.guidelines}
                            </Text>
                          </List.Item>
                        )}
                      </List>
                    </>
                  )}
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack gap="lg">
                  <Paper p="lg" radius="md" withBorder>
                    <Text fw={600} size="lg" mb="md">
                      Attachments
                    </Text>
                    {campaign.attachments && campaign.attachments.length > 0 ? (
                      <Stack gap="sm">
                        {campaign.attachments.map((attachment: any, index: number) => (
                          <Group key={index} justify="space-between">
                            <Group gap="xs">
                              <IconPaperclip size={16} className="text-gray-400" />
                              <Text size="sm">{attachment.name}</Text>
                            </Group>
                            <ActionIcon variant="subtle" size="sm">
                              <IconDownload size={16} />
                            </ActionIcon>
                          </Group>
                        ))}
                      </Stack>
                    ) : (
                      <Text c="dimmed" size="sm">
                        No attachments
                      </Text>
                    )}
                  </Paper>

                  <Paper p="lg" radius="md" withBorder>
                    <Text fw={600} size="lg" mb="md">
                      Important Dates
                    </Text>
                    <Stack gap="md">
                      <div>
                        <Text size="sm" c="dimmed">
                          Created
                        </Text>
                        <Text fw={500}>{new Date(campaign.createdAt).toLocaleDateString()}</Text>
                      </div>
                      {campaign.deadline && (
                        <div>
                          <Text size="sm" c="dimmed">
                            Deadline
                          </Text>
                          <Group gap="xs">
                            <Text fw={500}>{new Date(campaign.deadline).toLocaleDateString()}</Text>
                            {new Date(campaign.deadline) < new Date() && (
                              <Badge color="red" variant="light" size="xs">
                                Overdue
                              </Badge>
                            )}
                          </Group>
                        </div>
                      )}
                      <div>
                        <Text size="sm" c="dimmed">
                          Last Updated
                        </Text>
                        <Text fw={500}>{new Date(campaign.updatedAt).toLocaleDateString()}</Text>
                      </div>
                    </Stack>
                  </Paper>
                </Stack>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Assign Creator Modal */}
      <Modal
        opened={assignModalOpened}
        onClose={closeAssignModal}
        title="Assign Creator to Campaign"
        size="md"
      >
        <Stack gap="md">
          <Select
            label="Select Creator"
            placeholder="Choose a creator"
            data={
              availableCreators?.creators
                .filter(
                  (creator: any) =>
                    !assignedCreators.some((assigned: any) => assigned.id === creator.id)
                )
                .map((creator: any) => ({
                  value: creator.id,
                  label: `${creator.name} - $${creator.rates || 0}/project`,
                })) || []
            }
            value={selectedCreatorId}
            onChange={(value) => setSelectedCreatorId(value || '')}
            searchable
          />

          <Textarea
            label="Assignment Notes (Optional)"
            placeholder="Any special instructions or notes for this creator..."
            rows={3}
            value={assignmentNote}
            onChange={(e) => setAssignmentNote(e.currentTarget.value)}
          />

          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeAssignModal}>
              Cancel
            </Button>
            <Button
              leftSection={<IconUserPlus size={16} />}
              onClick={handleAssignCreator}
              loading={assignCreatorMutation.isPending}
              disabled={!selectedCreatorId}
            >
              Assign Creator
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
