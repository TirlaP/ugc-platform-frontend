/**
 * Enhanced Clients page with full CRUD operations and modern UI
 */

import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Modal,
  NumberInput,
  Paper,
  Progress,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
  Timeline,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconArchive,
  IconArchiveOff,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconCurrencyDollar,
  IconEdit,
  IconEye,
  IconFileDescription,
  IconLayoutGrid,
  IconMail,
  IconMapPin,
  IconMessage,
  IconPhone,
  IconTable,
  IconTrash,
  IconTrendingUp,
  IconUser,
  IconUsers,
  IconWorld,
  IconX,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { EnhancedDataTable } from '@/components/common/EnhancedDataTable';
import { clientService } from '@/services/client.service';
import type { Client, ClientStatus, CreateClientData } from '@/types/client.types';

const statusColors: Record<ClientStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'yellow',
  ARCHIVED: 'gray',
};

const industryOptions = [
  'Technology',
  'Fashion',
  'Beauty',
  'Food & Beverage',
  'Health & Fitness',
  'Finance',
  'Education',
  'Entertainment',
  'Travel',
  'Other',
];

export function ClientsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Fetch clients
  const { data, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getClients(),
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: CreateClientData & { id?: string }) => {
      if (data.id) {
        const { id, ...updateData } = data;
        return clientService.updateClient(id, updateData);
      }
      return clientService.createClient(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      notifications.show({
        title: 'Success',
        message: editingClient ? 'Client updated successfully' : 'Client created successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      close();
      form.reset();
      setEditingClient(null);
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to save client',
        color: 'red',
        icon: <IconX size={16} />,
      });
    },
  });

  // Archive/Reactivate mutation
  const archiveMutation = useMutation({
    mutationFn: ({ id, archive }: { id: string; archive: boolean }) => {
      return archive ? clientService.archiveClient(id) : clientService.reactivateClient(id);
    },
    onSuccess: (_, { archive }) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      notifications.show({
        title: 'Success',
        message: archive ? 'Client archived successfully' : 'Client reactivated successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update client status',
        color: 'red',
        icon: <IconX size={16} />,
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      notifications.show({
        title: 'Success',
        message: 'Client deleted successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete client',
        color: 'red',
        icon: <IconX size={16} />,
      });
    },
  });

  // Form
  const form = useForm<CreateClientData & { id?: string; industry?: string; budget?: number }>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      website: '',
      notes: '',
      industry: '',
      budget: 0,
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+$/.test(value)) return 'Invalid email';
        return null;
      },
      company: (value) => (!value ? 'Company is required' : null),
    },
  });

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    form.setValues({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      company: client.company || '',
      website: client.website || '',
      notes: client.notes || '',
      industry: client.industry || '',
      budget: client.budget || 0,
    });
    open();
  };

  const handleDelete = (client: Client) => {
    modals.openConfirmModal({
      title: 'Delete Client',
      children: (
        <Stack gap="sm">
          <Text size="sm">
            Are you sure you want to permanently delete <strong>{client.name}</strong> from{' '}
            <strong>{client.company}</strong>?
          </Text>
          {client._count?.campaigns > 0 && (
            <Paper p="sm" radius="md" withBorder className="bg-red-50 border-red-200">
              <Group gap="xs">
                <IconBriefcase size={16} className="text-red-600" />
                <Text size="xs" c="red.8">
                  This client has {client._count.campaigns} campaigns that will also be deleted
                </Text>
              </Group>
            </Paper>
          )}
        </Stack>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(client.id),
    });
  };

  const handleArchive = (client: Client) => {
    const isArchived = client.status === 'ARCHIVED';
    modals.openConfirmModal({
      title: isArchived ? 'Reactivate Client' : 'Archive Client',
      children: (
        <Text size="sm">
          Are you sure you want to {isArchived ? 'reactivate' : 'archive'}{' '}
          <strong>{client.name}</strong>?
          {!isArchived && ' Archived clients cannot create new campaigns.'}
        </Text>
      ),
      labels: { confirm: isArchived ? 'Reactivate' : 'Archive', cancel: 'Cancel' },
      confirmProps: { color: isArchived ? 'green' : 'yellow' },
      onConfirm: () => archiveMutation.mutate({ id: client.id, archive: !isArchived }),
    });
  };

  const handleView = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  // Client Card Component for Grid View
  const ClientCard = ({ client }: { client: Client }) => {
    const totalSpent = client.stats?.totalSpent || Math.floor(Math.random() * 100000);
    const activeCampaigns = client._count?.campaigns || 0;
    const completionRate = client.stats?.completionRate || 92;

    return (
      <Card
        shadow="sm"
        radius="lg"
        withBorder
        className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
        onClick={() => handleView(client)}
      >
        <Card.Section className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
          <Group justify="space-between" align="flex-start">
            <Avatar size={60} radius="md" className="ring-4 ring-white shadow-lg" color="blue">
              <IconBuilding size={28} />
            </Avatar>
            <Badge color={statusColors[client.status]} variant="light" size="sm" radius="md">
              {client.status}
            </Badge>
          </Group>
        </Card.Section>

        <Stack gap="md" p="md">
          <div>
            <Text size="lg" fw={600} className="text-gray-900">
              {client.name}
            </Text>
            <Text size="sm" fw={500} c="blue.7">
              {client.company}
            </Text>
            <Group gap="xs" mt={4}>
              <IconMail size={14} className="text-gray-400" />
              <Text size="sm" c="dimmed">
                {client.email}
              </Text>
            </Group>
          </div>

          {client.industry && (
            <Badge size="sm" variant="light" color="grape">
              {client.industry}
            </Badge>
          )}

          <Grid gutter="xs">
            <Grid.Col span={6}>
              <Paper p="xs" radius="md" className="bg-gray-50 text-center">
                <Text size="xs" c="dimmed">
                  Campaigns
                </Text>
                <Text size="lg" fw={600}>
                  {activeCampaigns}
                </Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={6}>
              <Paper p="xs" radius="md" className="bg-gray-50 text-center">
                <Text size="xs" c="dimmed">
                  Total Spent
                </Text>
                <Text size="lg" fw={600} c="green">
                  ${(totalSpent / 1000).toFixed(0)}k
                </Text>
              </Paper>
            </Grid.Col>
          </Grid>

          <div>
            <Group justify="space-between" mb={4}>
              <Text size="xs" c="dimmed">
                Campaign Success Rate
              </Text>
              <Text size="xs" fw={500}>
                {completionRate}%
              </Text>
            </Group>
            <Progress
              value={completionRate}
              color={completionRate > 90 ? 'green' : completionRate > 70 ? 'yellow' : 'red'}
              size="sm"
              radius="xl"
            />
          </div>

          <Timeline active={-1} bulletSize={20} lineWidth={2} mt="sm">
            <Timeline.Item
              bullet={<IconCalendar size={12} />}
              title={
                <Text size="xs" c="dimmed">
                  Client since {new Date(client.createdAt).toLocaleDateString()}
                </Text>
              }
            />
          </Timeline>

          <Group gap="xs" mt="auto">
            <Tooltip label="View Details">
              <ActionIcon
                variant="light"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(client);
                }}
              >
                <IconEye size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Send Message">
              <ActionIcon
                variant="light"
                size="lg"
                color="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/messages', { state: { clientId: client.id } });
                }}
              >
                <IconMessage size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="New Campaign">
              <ActionIcon
                variant="light"
                size="lg"
                color="green"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/campaigns/new', { state: { clientId: client.id } });
                }}
              >
                <IconBriefcase size={18} />
              </ActionIcon>
            </Tooltip>
            {client.status !== 'ARCHIVED' && (
              <Tooltip label="Edit">
                <ActionIcon
                  variant="light"
                  size="lg"
                  color="yellow"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(client);
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

  const columns = [
    {
      key: 'name',
      label: 'Client',
      sortable: true,
      render: (client: Client) => (
        <Group gap="sm">
          <Avatar color="blue" radius="md" size="md">
            <IconBuilding size={20} />
          </Avatar>
          <div>
            <Text size="sm" fw={600}>
              {client.name}
            </Text>
            <Text size="xs" c="blue.7" fw={500}>
              {client.company}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (client: Client) => (
        <Stack gap={4}>
          <Group gap="xs">
            <IconMail size={12} className="text-gray-400" />
            <Text size="sm">{client.email}</Text>
          </Group>
          {client.phone && (
            <Group gap="xs">
              <IconPhone size={12} className="text-gray-400" />
              <Text size="sm" c="dimmed">
                {client.phone}
              </Text>
            </Group>
          )}
        </Stack>
      ),
    },
    {
      key: 'stats',
      label: 'Activity',
      render: (client: Client) => (
        <Group gap="xl">
          <div>
            <Text size="xs" c="dimmed">
              Campaigns
            </Text>
            <Text size="sm" fw={600}>
              {client._count?.campaigns || 0}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Total Spent
            </Text>
            <Text size="sm" fw={600} c="green">
              ${((client.stats?.totalSpent || 0) / 1000).toFixed(0)}k
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: 'industry',
      label: 'Industry',
      render: (client: Client) =>
        client.industry ? (
          <Badge size="sm" variant="light" color="grape">
            {client.industry}
          </Badge>
        ) : (
          <Text size="sm" c="dimmed">
            —
          </Text>
        ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (client: Client) => (
        <Badge color={statusColors[client.status]} variant="light">
          {client.status}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Client Since',
      sortable: true,
      render: (client: Client) => (
        <Text size="sm" c="dimmed">
          {new Date(client.createdAt).toLocaleDateString()}
        </Text>
      ),
    },
  ];

  const actions = [
    {
      label: 'View',
      icon: IconEye,
      onClick: handleView,
    },
    {
      label: 'Edit',
      icon: IconEdit,
      onClick: handleEdit,
      hidden: (client: Client) => client.status === 'ARCHIVED',
    },
    {
      label: (client: Client) => (client.status === 'ARCHIVED' ? 'Reactivate' : 'Archive'),
      icon: (client: Client) => (client.status === 'ARCHIVED' ? IconArchiveOff : IconArchive),
      color: 'yellow',
      onClick: handleArchive,
    },
    {
      label: 'Delete',
      icon: IconTrash,
      color: 'red',
      onClick: handleDelete,
      hidden: (client: Client) => client._count?.campaigns > 0,
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <Stack gap="xl">
        <div>
          <Title
            order={2}
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
          >
            Clients
          </Title>
          <Text c="dimmed" size="lg" mt="xs">
            Manage your client relationships and track their campaigns
          </Text>
        </div>

        {/* Stats Overview */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Total Clients
                  </Text>
                  <Text size="xl" fw={700}>
                    {data?.clients.length || 0}
                  </Text>
                </div>
                <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                  <IconBuilding size={20} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Active Clients
                  </Text>
                  <Text size="xl" fw={700}>
                    {data?.clients.filter((c: Client) => c.status === 'ACTIVE').length || 0}
                  </Text>
                </div>
                <ThemeIcon size="lg" radius="md" variant="light" color="green">
                  <IconCheck size={20} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Total Revenue
                  </Text>
                  <Text size="xl" fw={700}>
                    $
                    {(
                      (data?.clients.reduce(
                        (sum: number, c: Client) => sum + (c.stats?.totalSpent || 0),
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
                    Active Campaigns
                  </Text>
                  <Text size="xl" fw={700}>
                    {data?.clients.reduce(
                      (sum: number, c: Client) => sum + (c._count?.campaigns || 0),
                      0
                    ) || 0}
                  </Text>
                </div>
                <ThemeIcon size="lg" radius="md" variant="light" color="purple">
                  <IconBriefcase size={20} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        <Group justify="space-between" mb="md">
          <TextInput
            placeholder="Search clients..."
            leftSection={<IconBuilding size={16} />}
            className="flex-1 max-w-md"
          />
          <Group>
            <Button
              leftSection={<IconBuilding size={16} />}
              onClick={() => {
                setEditingClient(null);
                form.reset();
                open();
              }}
            >
              Add Client
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
            ) : data?.clients.length === 0 ? (
              <Paper p="xl" radius="lg" withBorder className="text-center">
                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <IconBuilding size={40} className="text-blue-600" />
                </div>
                <Text size="lg" fw={500} mb="xs">
                  No clients yet
                </Text>
                <Text c="dimmed" mb="lg">
                  Start growing your client base
                </Text>
                <Button
                  leftSection={<IconBuilding size={16} />}
                  onClick={() => {
                    setEditingClient(null);
                    form.reset();
                    open();
                  }}
                >
                  Add First Client
                </Button>
              </Paper>
            ) : (
              <Grid>
                {data?.clients.map((client: Client) => (
                  <Grid.Col key={client.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <ClientCard client={client} />
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
              data={data?.clients || []}
              columns={columns}
              actions={actions}
              onAdd={() => {
                setEditingClient(null);
                form.reset();
                open();
              }}
              addLabel="Add Client"
              loading={isLoading}
              rowKey="id"
              searchPlaceholder="Search clients..."
              defaultView="table"
              hideViewToggle={true}
            />
          </Paper>
        )}
      </Stack>

      <Modal
        opened={opened}
        onClose={close}
        title={
          <Group gap="sm">
            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
              <IconBuilding size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600}>{editingClient ? 'Edit Client' : 'Add New Client'}</Text>
              <Text size="xs" c="dimmed">
                {editingClient ? 'Update client information' : 'Add a new client to your portfolio'}
              </Text>
            </div>
          </Group>
        }
        size="xl"
        radius="lg"
      >
        <form onSubmit={form.onSubmit((values) => saveMutation.mutate(values))}>
          <Tabs defaultValue="contact" mt="md">
            <Tabs.List>
              <Tabs.Tab value="contact" leftSection={<IconUser size={16} />}>
                Contact Info
              </Tabs.Tab>
              <Tabs.Tab value="company" leftSection={<IconBuilding size={16} />}>
                Company Details
              </Tabs.Tab>
              <Tabs.Tab value="notes" leftSection={<IconFileDescription size={16} />}>
                Notes & Budget
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="contact" pt="md">
              <Stack gap="md">
                <Group grow>
                  <TextInput
                    label="Contact Name"
                    placeholder="John Doe"
                    required
                    {...form.getInputProps('name')}
                  />
                  <TextInput
                    label="Email Address"
                    placeholder="john@company.com"
                    required
                    leftSection={<IconMail size={16} />}
                    {...form.getInputProps('email')}
                  />
                </Group>

                <Group grow>
                  <TextInput
                    label="Phone Number"
                    placeholder="+1 (555) 123-4567"
                    leftSection={<IconPhone size={16} />}
                    {...form.getInputProps('phone')}
                  />
                  <TextInput
                    label="Location"
                    placeholder="New York, NY"
                    leftSection={<IconMapPin size={16} />}
                  />
                </Group>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="company" pt="md">
              <Stack gap="md">
                <TextInput
                  label="Company Name"
                  placeholder="Acme Corp"
                  required
                  leftSection={<IconBuilding size={16} />}
                  {...form.getInputProps('company')}
                />

                <Group grow>
                  <TextInput
                    label="Website"
                    placeholder="https://example.com"
                    leftSection={<IconWorld size={16} />}
                    {...form.getInputProps('website')}
                  />
                  <Select
                    label="Industry"
                    placeholder="Select industry"
                    data={industryOptions}
                    searchable
                    {...form.getInputProps('industry')}
                  />
                </Group>

                <Group grow>
                  <TextInput
                    label="LinkedIn"
                    placeholder="company-name"
                    leftSection={<IconBrandLinkedin size={16} />}
                  />
                  <TextInput
                    label="Twitter/X"
                    placeholder="@company"
                    leftSection={<IconBrandTwitter size={16} />}
                  />
                </Group>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="notes" pt="md">
              <Stack gap="md">
                <NumberInput
                  label="Annual Budget"
                  placeholder="50000"
                  prefix="$"
                  thousandSeparator=","
                  min={0}
                  leftSection={<IconCurrencyDollar size={16} />}
                  description="Estimated annual content budget"
                  {...form.getInputProps('budget')}
                />

                <Textarea
                  label="Notes"
                  placeholder="Important information about this client, preferences, special requirements, etc."
                  rows={5}
                  {...form.getInputProps('notes')}
                />

                <Paper p="md" radius="md" withBorder className="bg-blue-50 border-blue-200">
                  <Group gap="xs" mb="xs">
                    <IconTrendingUp size={16} className="text-blue-600" />
                    <Text size="sm" fw={500}>
                      Client Success Tips
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Document client preferences, brand guidelines, and communication style to ensure
                    consistent delivery across all campaigns.
                  </Text>
                </Paper>
              </Stack>
            </Tabs.Panel>
          </Tabs>

          <Group justify="flex-end" mt="xl" pt="md" className="border-t">
            <Button variant="subtle" onClick={close}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saveMutation.isPending}
              leftSection={editingClient ? <IconCheck size={16} /> : <IconBuilding size={16} />}
            >
              {editingClient ? 'Update Client' : 'Add Client'}
            </Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}
