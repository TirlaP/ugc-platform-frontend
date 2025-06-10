/**
 * Enhanced Campaigns page with Email and Google Drive integration
 */

import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  Progress,
  Select,
  Skeleton,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
  Title,
  Tooltip,
  rem,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconBrandGoogleDrive,
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconClock,
  IconCurrencyDollar,
  IconEdit,
  IconExternalLink,
  IconEye,
  IconFileUpload,
  IconFolder,
  IconInfoCircle,
  IconLayoutGrid,
  IconMail,
  IconMessages,
  IconRefresh,
  IconShare,
  IconTable,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { EnhancedDataTable } from '@/components/common/EnhancedDataTable';
import { useAuth } from '@/hooks/useAuth';
import { campaignService } from '@/services/campaign.service';
import { clientService } from '@/services/client.service';
import { driveService } from '@/services/drive.service';
import { emailService } from '@/services/email.service';
import type { Campaign, CampaignStatus, CreateCampaignData } from '@/types/campaign.types';

const statusColors: Record<CampaignStatus, string> = {
  DRAFT: 'gray',
  ACTIVE: 'blue',
  IN_PROGRESS: 'cyan',
  REVIEW: 'yellow',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

export function CampaignsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [integrationsModal, { open: openIntegrations, close: closeIntegrations }] =
    useDisclosure(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Fetch campaigns
  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignService.getCampaigns(),
  });

  // Fetch clients for dropdown
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getClients(),
    enabled: user?.role === 'ADMIN' || user?.role === 'STAFF',
  });

  // Fetch email settings
  const { data: emailSettings } = useQuery({
    queryKey: ['email-settings'],
    queryFn: () => emailService.getSettings(),
  });

  // Fetch drive settings
  const { data: driveSettings } = useQuery({
    queryKey: ['drive-settings'],
    queryFn: () => driveService.getSettings(),
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: CreateCampaignData & { id?: string }) => {
      if (data.id) {
        const { id, ...updateData } = data;
        return campaignService.updateCampaign(id, updateData);
      }
      return campaignService.createCampaign(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      notifications.show({
        title: 'Success',
        message: editingCampaign
          ? 'Campaign updated successfully'
          : 'Campaign created successfully',
        color: 'green',
      });
      close();
      form.reset();
      setEditingCampaign(null);
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: 'Failed to save campaign',
        color: 'red',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaignService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      notifications.show({
        title: 'Success',
        message: 'Campaign deleted successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete campaign',
        color: 'red',
      });
    },
  });

  // Sync campaign with Google Drive
  const syncDriveMutation = useMutation({
    mutationFn: (campaignId: string) => driveService.syncCampaign(campaignId),
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: `Campaign synced to Google Drive. ${data.filesUploaded} files uploaded.`,
        color: 'green',
      });
      closeIntegrations();
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to sync with Google Drive',
        color: 'red',
      });
    },
  });

  // Form
  const form = useForm<CreateCampaignData & { id?: string }>({
    initialValues: {
      title: '',
      brief: '',
      clientId: '',
      budget: 0,
      deadline: undefined,
      requirements: {},
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
      brief: (value) => (!value ? 'Brief is required' : null),
      clientId: (value) => (!value ? 'Client is required' : null),
      budget: (value) => (value <= 0 ? 'Budget must be greater than 0' : null),
    },
  });

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    form.setValues({
      id: campaign.id,
      title: campaign.title,
      brief: campaign.brief,
      clientId: campaign.clientId,
      budget: Number(campaign.budget),
      deadline: campaign.deadline ? new Date(campaign.deadline) : undefined,
      requirements: campaign.requirements || {},
    });
    open();
  };

  const handleDelete = (campaign: Campaign) => {
    modals.openConfirmModal({
      title: 'Delete Campaign',
      children: (
        <Text size="sm">
          Are you sure you want to delete the campaign "{campaign.title}"? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(campaign.id),
    });
  };

  const handleView = (campaign: Campaign) => {
    navigate(`/campaigns/${campaign.id}`);
  };

  const handleIntegrations = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    openIntegrations();
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (campaign: Campaign) => (
        <Group gap="xs">
          <Text fw={500}>{campaign.title}</Text>
          <Group gap={4}>
            {emailSettings?.configured && (
              <Tooltip label="Email enabled">
                <IconMail size={16} color="var(--mantine-color-blue-6)" />
              </Tooltip>
            )}
            {driveSettings?.connected && (
              <Tooltip label="Google Drive connected">
                <IconBrandGoogleDrive size={16} color="var(--mantine-color-green-6)" />
              </Tooltip>
            )}
          </Group>
        </Group>
      ),
    },
    {
      key: 'client.name',
      label: 'Client',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      render: (campaign: Campaign) => (
        <Badge color={statusColors[campaign.status]} variant="light">
          {campaign.status}
        </Badge>
      ),
    },
    {
      key: 'budget',
      label: 'Budget',
      sortable: true,
      render: (campaign: Campaign) => (
        <Text fw={500}>${Number(campaign.budget).toLocaleString()}</Text>
      ),
    },
    {
      key: 'deadline',
      label: 'Deadline',
      render: (campaign: Campaign) =>
        campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : '-',
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (campaign: Campaign) => new Date(campaign.createdAt).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      label: 'View',
      icon: IconEye,
      onClick: handleView,
    },
    {
      label: 'Messages',
      icon: IconMessages,
      onClick: (campaign: Campaign) =>
        navigate('/messages', { state: { campaignId: campaign.id } }),
    },
    {
      label: 'Integrations',
      icon: IconShare,
      onClick: handleIntegrations,
    },
    {
      label: 'Edit',
      icon: IconEdit,
      onClick: handleEdit,
      hidden: (campaign: Campaign) =>
        campaign.status === 'COMPLETED' || campaign.status === 'CANCELLED',
    },
    {
      label: 'Delete',
      icon: IconTrash,
      color: 'red',
      onClick: handleDelete,
      hidden: (campaign: Campaign) =>
        campaign.status !== 'DRAFT' && campaign.status !== 'CANCELLED',
    },
  ];

  // Campaign Card Component for Grid View
  const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
    const progress =
      campaign.status === 'COMPLETED'
        ? 100
        : campaign.status === 'IN_PROGRESS'
          ? 60
          : campaign.status === 'ACTIVE'
            ? 30
            : 0;

    return (
      <Card
        shadow="sm"
        radius="lg"
        withBorder
        className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
        onClick={() => handleView(campaign)}
      >
        <Card.Section className="relative bg-gradient-to-br from-purple-50 to-pink-50 p-6">
          <Group justify="space-between" align="flex-start">
            <div>
              <Badge color={statusColors[campaign.status]} variant="light" size="sm" radius="md">
                {campaign.status}
              </Badge>
            </div>
            <Group gap={4}>
              {emailSettings?.configured && (
                <ThemeIcon size="sm" color="blue" variant="light">
                  <IconMail size={14} />
                </ThemeIcon>
              )}
              {driveSettings?.connected && (
                <ThemeIcon size="sm" color="green" variant="light">
                  <IconBrandGoogleDrive size={14} />
                </ThemeIcon>
              )}
            </Group>
          </Group>
        </Card.Section>

        <Stack gap="md" p="md">
          <div>
            <Text size="lg" fw={600} className="text-gray-900 line-clamp-1">
              {campaign.title}
            </Text>
            <Group gap="xs" mt={4}>
              <IconBuilding size={14} className="text-gray-400" />
              <Text size="sm" c="dimmed">
                {campaign.client?.name || 'No client'}
              </Text>
            </Group>
          </div>

          <Text size="sm" c="dimmed" lineClamp={2}>
            {campaign.brief || 'No description available'}
          </Text>

          <Grid gutter="xs">
            <Grid.Col span={6}>
              <Paper p="xs" radius="md" className="bg-gray-50 text-center">
                <Text size="xs" c="dimmed">
                  Budget
                </Text>
                <Text size="lg" fw={600} c="green">
                  ${Number(campaign.budget).toLocaleString()}
                </Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={6}>
              <Paper p="xs" radius="md" className="bg-gray-50 text-center">
                <Text size="xs" c="dimmed">
                  Deadline
                </Text>
                <Text size="sm" fw={600}>
                  {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'None'}
                </Text>
              </Paper>
            </Grid.Col>
          </Grid>

          <div>
            <Group justify="space-between" mb={4}>
              <Text size="xs" c="dimmed">
                Progress
              </Text>
              <Text size="xs" fw={500}>
                {progress}%
              </Text>
            </Group>
            <Progress
              value={progress}
              color={progress === 100 ? 'green' : progress > 50 ? 'yellow' : 'blue'}
              size="sm"
              radius="xl"
            />
          </div>

          <Group gap="xs" mt="auto">
            <Tooltip label="View Details">
              <ActionIcon
                variant="light"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(campaign);
                }}
              >
                <IconEye size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Messages">
              <ActionIcon
                variant="light"
                size="lg"
                color="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/messages', { state: { campaignId: campaign.id } });
                }}
              >
                <IconMessages size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Integrations">
              <ActionIcon
                variant="light"
                size="lg"
                color="purple"
                onClick={(e) => {
                  e.stopPropagation();
                  handleIntegrations(campaign);
                }}
              >
                <IconShare size={18} />
              </ActionIcon>
            </Tooltip>
            {campaign.status !== 'COMPLETED' && campaign.status !== 'CANCELLED' && (
              <Tooltip label="Edit">
                <ActionIcon
                  variant="light"
                  size="lg"
                  color="yellow"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(campaign);
                  }}
                >
                  <IconEdit size={18} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Stack>
      </Card>
    );
  };

  return (
    <Container size="xl" className="py-6">
      <Stack gap="xl">
        <div>
          <Title
            order={2}
            className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            Campaigns
          </Title>
          <Text c="dimmed" size="lg" mt="xs">
            Manage your UGC campaigns with email and file integration
          </Text>
        </div>

        {/* Stats Overview */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Total Campaigns
                  </Text>
                  <Text size="xl" fw={700}>
                    {data?.campaigns.length || 0}
                  </Text>
                </div>
                <ThemeIcon size="lg" radius="md" variant="light" color="purple">
                  <IconBriefcase size={20} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Active Campaigns
                  </Text>
                  <Text size="xl" fw={700}>
                    {data?.campaigns.filter(
                      (c: Campaign) => c.status === 'ACTIVE' || c.status === 'IN_PROGRESS'
                    ).length || 0}
                  </Text>
                </div>
                <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                  <IconClock size={20} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Total Budget
                  </Text>
                  <Text size="xl" fw={700}>
                    $
                    {(
                      (data?.campaigns.reduce(
                        (sum: number, c: Campaign) => sum + Number(c.budget),
                        0
                      ) || 0) / 1000
                    ).toFixed(0)}
                    k
                  </Text>
                </div>
                <ThemeIcon size="lg" radius="md" variant="light" color="green">
                  <IconCurrencyDollar size={20} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Integrations
                  </Text>
                  <Group gap="xs">
                    {emailSettings?.configured && (
                      <Badge
                        size="xs"
                        leftSection={<IconMail size={10} />}
                        variant="light"
                        color="blue"
                      >
                        Email
                      </Badge>
                    )}
                    {driveSettings?.connected && (
                      <Badge
                        size="xs"
                        leftSection={<IconBrandGoogleDrive size={10} />}
                        variant="light"
                        color="green"
                      >
                        Drive
                      </Badge>
                    )}
                  </Group>
                </div>
                <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                  <IconShare size={20} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        {(!emailSettings?.configured || !driveSettings?.connected) && (
          <Alert
            icon={<IconInfoCircle />}
            title="Enhance your workflow"
            color="blue"
            variant="light"
          >
            <Text size="sm">
              Connect Email and Google Drive to centralize all campaign communications and files.{' '}
              <Text
                component="a"
                href="/settings"
                c="blue"
                td="underline"
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/settings');
                }}
              >
                Configure integrations
              </Text>
            </Text>
          </Alert>
        )}

        <Group justify="space-between" mb="md">
          <TextInput
            placeholder="Search campaigns..."
            leftSection={<IconBriefcase size={16} />}
            className="flex-1 max-w-md"
          />
          <Group>
            <Button
              leftSection={<IconBriefcase size={16} />}
              onClick={() => {
                setEditingCampaign(null);
                form.reset();
                open();
              }}
            >
              Create Campaign
            </Button>
            <Group gap={4}>
              <Tooltip label="Card View">
                <ActionIcon
                  variant={viewMode === 'cards' ? 'filled' : 'light'}
                  size="lg"
                  onClick={() => setViewMode('cards')}
                >
                  <IconLayoutGrid size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Table View">
                <ActionIcon
                  variant={viewMode === 'table' ? 'filled' : 'light'}
                  size="lg"
                  onClick={() => setViewMode('table')}
                >
                  <IconTable size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Group>

        {viewMode === 'cards' ? (
          <div>
            {isLoading ? (
              <Grid>
                {[...Array(6)].map((_, i) => (
                  <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
                    <Card shadow="sm" radius="lg" withBorder>
                      <Card.Section className="h-32 bg-gray-100 animate-pulse" />
                      <Stack gap="sm" p="md">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                        <div className="h-20 bg-gray-100 rounded animate-pulse" />
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            ) : data?.campaigns.length === 0 ? (
              <Paper p="xl" radius="lg" withBorder className="text-center">
                <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <IconBriefcase size={40} className="text-purple-600" />
                </div>
                <Text size="lg" fw={500} mb="xs">
                  No campaigns yet
                </Text>
                <Text c="dimmed" mb="lg">
                  Start your first UGC campaign
                </Text>
                <Button
                  leftSection={<IconBriefcase size={16} />}
                  onClick={() => {
                    setEditingCampaign(null);
                    form.reset();
                    open();
                  }}
                >
                  Create First Campaign
                </Button>
              </Paper>
            ) : (
              <Grid>
                {data?.campaigns.map((campaign: Campaign) => (
                  <Grid.Col key={campaign.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <CampaignCard campaign={campaign} />
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </div>
        ) : (
          <Paper shadow="xs" radius="md" withBorder className="overflow-hidden">
            <EnhancedDataTable
              title=""
              subtitle=""
              data={data?.campaigns || []}
              columns={columns}
              actions={actions}
              onAdd={() => {
                setEditingCampaign(null);
                form.reset();
                open();
              }}
              addLabel="Create Campaign"
              loading={isLoading}
              rowKey="id"
              searchPlaceholder="Search campaigns by title, client, or status..."
              defaultView="table"
              hideViewToggle={true}
            />
          </Paper>
        )}
      </Stack>

      {/* Create/Edit Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
        size="lg"
      >
        <form onSubmit={form.onSubmit((values) => saveMutation.mutate(values))}>
          <Stack gap="md">
            <TextInput
              label="Campaign Title"
              placeholder="Enter campaign title"
              required
              {...form.getInputProps('title')}
            />

            <Textarea
              label="Brief"
              placeholder="Describe the campaign objectives and requirements"
              rows={4}
              required
              {...form.getInputProps('brief')}
            />

            {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
              <Select
                label="Client"
                placeholder="Select a client"
                required
                data={
                  clientsData?.clients.map((client) => ({
                    value: client.id,
                    label: client.name,
                  })) || []
                }
                {...form.getInputProps('clientId')}
              />
            )}

            <NumberInput
              label="Budget"
              placeholder="Enter budget amount"
              prefix="$"
              thousandSeparator=","
              required
              min={0}
              {...form.getInputProps('budget')}
            />

            <DateInput
              label="Deadline"
              placeholder="Select deadline"
              clearable
              {...form.getInputProps('deadline')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" loading={saveMutation.isPending}>
                {editingCampaign ? 'Update' : 'Create'} Campaign
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Integrations Modal */}
      <Modal
        opened={integrationsModal}
        onClose={closeIntegrations}
        title="Campaign Integrations"
        size="lg"
      >
        {selectedCampaign && (
          <Tabs defaultValue="email">
            <Tabs.List>
              <Tabs.Tab value="email" leftSection={<IconMail size={16} />}>
                Email
              </Tabs.Tab>
              <Tabs.Tab value="drive" leftSection={<IconBrandGoogleDrive size={16} />}>
                Google Drive
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="email" pt="md">
              <Stack gap="md">
                <Paper p="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <div>
                      <Text fw={500}>Campaign Email</Text>
                      <Text size="sm" c="dimmed">
                        All email communications for this campaign
                      </Text>
                    </div>
                    {emailSettings?.configured ? (
                      <Badge color="green">Active</Badge>
                    ) : (
                      <Badge color="gray">Not configured</Badge>
                    )}
                  </Group>

                  {emailSettings?.configured ? (
                    <>
                      <Text size="sm" mb="md">
                        Email address:{' '}
                        <strong>campaign-{selectedCampaign.id}@ugc-impact.com</strong>
                      </Text>
                      <Group>
                        <Button
                          variant="light"
                          leftSection={<IconMail size={16} />}
                          onClick={() => navigate(`/campaigns/${selectedCampaign.id}/emails`)}
                        >
                          View Email Threads
                        </Button>
                        <Button variant="subtle" leftSection={<IconRefresh size={16} />}>
                          Sync Emails
                        </Button>
                      </Group>
                    </>
                  ) : (
                    <Button variant="light" onClick={() => navigate('/settings')}>
                      Configure Email
                    </Button>
                  )}
                </Paper>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="drive" pt="md">
              <Stack gap="md">
                <Paper p="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <div>
                      <Text fw={500}>Google Drive Folder</Text>
                      <Text size="sm" c="dimmed">
                        All campaign files synced to Drive
                      </Text>
                    </div>
                    {driveSettings?.connected ? (
                      <Badge color="green">Connected</Badge>
                    ) : (
                      <Badge color="gray">Not connected</Badge>
                    )}
                  </Group>

                  {driveSettings?.connected ? (
                    <>
                      <Group mb="md">
                        <IconFolder size={20} />
                        <Text size="sm">Campaign Files / {selectedCampaign.title}</Text>
                      </Group>
                      <Group>
                        <Button
                          variant="light"
                          leftSection={<IconBrandGoogleDrive size={16} />}
                          onClick={() =>
                            window.open(
                              `https://drive.google.com/drive/folders/${selectedCampaign.id}`,
                              '_blank'
                            )
                          }
                        >
                          Open in Drive
                        </Button>
                        <Button
                          variant="subtle"
                          leftSection={<IconRefresh size={16} />}
                          loading={syncDriveMutation.isPending}
                          onClick={() => syncDriveMutation.mutate(selectedCampaign.id)}
                        >
                          Sync Files
                        </Button>
                      </Group>
                    </>
                  ) : (
                    <Button variant="light" onClick={() => navigate('/settings')}>
                      Connect Google Drive
                    </Button>
                  )}
                </Paper>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        )}
      </Modal>
    </Container>
  );
}
