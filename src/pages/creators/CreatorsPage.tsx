/**
 * Enhanced Creators page with full CRUD operations and modern UI
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
  MultiSelect,
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
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconBrandInstagram,
  IconBriefcase,
  IconCheck,
  IconCurrencyDollar,
  IconEdit,
  IconEye,
  IconLayoutGrid,
  IconMail,
  IconMicrophone,
  IconPencil,
  IconPhone,
  IconPhoto,
  IconStar,
  IconTable,
  IconTrash,
  IconTrendingUp,
  IconUser,
  IconVideo,
  IconWorld,
  IconX,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { EnhancedDataTable } from '@/components/common/EnhancedDataTable';
import { creatorService } from '@/services/creator.service';

const skillOptions = [
  { value: 'video-editing', label: 'Video Editing', icon: IconVideo },
  { value: 'photography', label: 'Photography', icon: IconPhoto },
  { value: 'copywriting', label: 'Copywriting', icon: IconPencil },
  { value: 'voice-over', label: 'Voice Over', icon: IconMicrophone },
  { value: 'social-media', label: 'Social Media', icon: IconBrandInstagram },
];

const statusColors = {
  ACTIVE: 'green',
  INACTIVE: 'gray',
  BUSY: 'yellow',
  VACATION: 'blue',
};

export function CreatorsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingCreator, setEditingCreator] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Fetch creators
  const { data, isLoading } = useQuery({
    queryKey: ['creators'],
    queryFn: () => creatorService.getCreators(),
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingCreator) {
        return creatorService.updateCreator(editingCreator.id, data);
      }
      return creatorService.createCreator(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creators'] });
      notifications.show({
        title: 'Success',
        message: editingCreator ? 'Creator updated successfully' : 'Creator created successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      close();
      form.reset();
      setEditingCreator(null);
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to save creator',
        color: 'red',
        icon: <IconX size={16} />,
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => creatorService.deleteCreator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creators'] });
      notifications.show({
        title: 'Success',
        message: 'Creator removed from platform',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete creator',
        color: 'red',
        icon: <IconX size={16} />,
      });
    },
  });

  // Form
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      bio: '',
      portfolioUrl: '',
      socialMedia: '',
      rates: 0,
      skills: [] as string[],
      status: 'ACTIVE',
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+$/.test(value)) return 'Invalid email';
        return null;
      },
      rates: (value) => (value < 0 ? 'Rate must be positive' : null),
    },
  });

  const handleEdit = (creator: any) => {
    setEditingCreator(creator);
    form.setValues({
      name: creator.name,
      email: creator.email,
      phone: creator.phone || '',
      bio: creator.bio || '',
      portfolioUrl: creator.portfolioUrl || '',
      socialMedia: creator.socialMedia || '',
      rates:
        typeof creator.rates === 'object' ? creator.rates?.perProject || 0 : creator.rates || 0,
      skills: creator.skills || [],
      status: creator.status || 'ACTIVE',
    });
    open();
  };

  const handleDelete = (creator: any) => {
    modals.openConfirmModal({
      title: 'Remove Creator',
      children: (
        <Stack gap="sm">
          <Text size="sm">
            Are you sure you want to remove <strong>{creator.name}</strong> from your platform?
          </Text>
          {creator._count?.orders > 0 && (
            <Paper p="sm" radius="md" withBorder className="bg-yellow-50 border-yellow-200">
              <Group gap="xs">
                <IconBriefcase size={16} className="text-yellow-600" />
                <Text size="xs" c="yellow.8">
                  This creator has {creator._count.orders} active orders
                </Text>
              </Group>
            </Paper>
          )}
        </Stack>
      ),
      labels: { confirm: 'Remove', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(creator.id),
    });
  };

  const handleView = (creator: any) => {
    navigate(`/creators/${creator.id}`);
  };

  // Creator Card Component for Grid View
  const CreatorCard = ({ creator }: { creator: any }) => {
    const completionRate = creator.stats?.completionRate || 85;
    const rating = creator.rating || 4.8;
    const totalEarnings = creator.stats?.totalEarnings || Math.floor(Math.random() * 50000);

    return (
      <Card
        shadow="sm"
        radius="lg"
        withBorder
        className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
        onClick={() => handleView(creator)}
      >
        <Card.Section className="relative bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
          <Group justify="space-between" align="flex-start">
            <Avatar
              src={creator.image}
              size={80}
              radius="xl"
              className="ring-4 ring-white shadow-lg"
            >
              {creator.name?.charAt(0).toUpperCase() || <IconUser size={32} />}
            </Avatar>
            <Badge
              color={statusColors[creator.status || 'ACTIVE']}
              variant="light"
              size="sm"
              radius="md"
            >
              {creator.status || 'Active'}
            </Badge>
          </Group>
        </Card.Section>

        <Stack gap="md" p="md">
          <div>
            <Text size="lg" fw={600} className="text-gray-900">
              {creator.name}
            </Text>
            <Group gap="xs" mt={4}>
              <IconMail size={14} className="text-gray-400" />
              <Text size="sm" c="dimmed">
                {creator.email}
              </Text>
            </Group>
          </div>

          <Group gap="xs" wrap="wrap">
            {(creator.skills || ['Video Editing', 'Photography'])
              .slice(0, 3)
              .map((skill: string) => (
                <Badge key={skill} size="xs" variant="light" color="blue">
                  {skill}
                </Badge>
              ))}
            {(creator.skills?.length || 2) > 3 && (
              <Badge size="xs" variant="light" color="gray">
                +{(creator.skills?.length || 2) - 3}
              </Badge>
            )}
          </Group>

          <Grid gutter="xs">
            <Grid.Col span={4}>
              <Paper p="xs" radius="md" className="bg-gray-50 text-center">
                <Text size="xs" c="dimmed">
                  Orders
                </Text>
                <Text size="lg" fw={600}>
                  {creator._count?.orders || 0}
                </Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={4}>
              <Paper p="xs" radius="md" className="bg-gray-50 text-center">
                <Text size="xs" c="dimmed">
                  Rating
                </Text>
                <Group gap={2} justify="center">
                  <Text size="lg" fw={600}>
                    {rating.toFixed(1)}
                  </Text>
                  <IconStar size={14} className="text-yellow-500 fill-yellow-500" />
                </Group>
              </Paper>
            </Grid.Col>
            <Grid.Col span={4}>
              <Paper p="xs" radius="md" className="bg-gray-50 text-center">
                <Text size="xs" c="dimmed">
                  Rate
                </Text>
                <Text size="lg" fw={600} c="green">
                  $
                  {typeof creator.rates === 'object'
                    ? creator.rates?.perProject || creator.rates?.perPost || 0
                    : creator.rates || 0}
                </Text>
              </Paper>
            </Grid.Col>
          </Grid>

          <div>
            <Group justify="space-between" mb={4}>
              <Text size="xs" c="dimmed">
                Completion Rate
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

          <Group gap="xs" mt="auto">
            <Tooltip label="View Profile">
              <ActionIcon
                variant="light"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(creator);
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
                  navigate('/messages', { state: { recipientId: creator.id } });
                }}
              >
                <IconMail size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Edit">
              <ActionIcon
                variant="light"
                size="lg"
                color="green"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(creator);
                }}
              >
                <IconEdit size={18} />
              </ActionIcon>
            </Tooltip>
            {(!creator._count?.orders || creator._count.orders === 0) && (
              <Tooltip label="Remove">
                <ActionIcon
                  variant="light"
                  size="lg"
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(creator);
                  }}
                >
                  <IconTrash size={18} />
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
      label: 'Creator',
      sortable: true,
      render: (creator: any) => (
        <Group gap="sm">
          <Avatar
            src={creator.image}
            alt={creator.name}
            size="md"
            radius="xl"
            className="ring-2 ring-blue-100"
          >
            {creator.name?.charAt(0).toUpperCase() || <IconUser size={20} />}
          </Avatar>
          <div>
            <Text size="sm" fw={600}>
              {creator.name}
            </Text>
            <Text size="xs" c="dimmed">
              {creator.email}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: 'skills',
      label: 'Skills',
      render: (creator: any) => (
        <Group gap={4}>
          {(creator.skills || ['Video', 'Photo']).slice(0, 2).map((skill: string) => (
            <Badge key={skill} size="xs" variant="light">
              {skill}
            </Badge>
          ))}
          {(creator.skills?.length || 2) > 2 && (
            <Text size="xs" c="dimmed">
              +{(creator.skills?.length || 2) - 2}
            </Text>
          )}
        </Group>
      ),
    },
    {
      key: 'stats',
      label: 'Performance',
      render: (creator: any) => (
        <Group gap="xl">
          <div>
            <Text size="xs" c="dimmed">
              Orders
            </Text>
            <Text size="sm" fw={600}>
              {creator._count?.orders || 0}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Rating
            </Text>
            <Group gap={2}>
              <Text size="sm" fw={600}>
                {(creator.rating || 4.8).toFixed(1)}
              </Text>
              <IconStar size={12} className="text-yellow-500 fill-yellow-500" />
            </Group>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Complete
            </Text>
            <Text size="sm" fw={600}>
              {creator.stats?.completionRate || 85}%
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: 'rates',
      label: 'Rate',
      sortable: true,
      render: (creator: any) => (
        <Text size="sm" fw={600} c="green">
          $
          {typeof creator.rates === 'object'
            ? creator.rates?.perProject || creator.rates?.perPost || 0
            : creator.rates || 0}
          /project
        </Text>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (creator: any) => (
        <Badge color={statusColors[creator.status || 'ACTIVE']} variant="light">
          {creator.status || 'Active'}
        </Badge>
      ),
    },
    {
      key: 'joinedAt',
      label: 'Joined',
      sortable: true,
      render: (creator: any) => (
        <Text size="sm" c="dimmed">
          {new Date(creator.createdAt).toLocaleDateString()}
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
    },
    {
      label: 'Delete',
      icon: IconTrash,
      color: 'red',
      onClick: handleDelete,
      hidden: (creator: any) => creator._count?.orders > 0,
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <Stack gap="xl">
        <div>
          <Title
            order={2}
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Content Creators
          </Title>
          <Text c="dimmed" size="lg" mt="xs">
            Manage your talented creators and track their performance
          </Text>
        </div>

        {/* Stats Overview */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Total Creators
                  </Text>
                  <Text size="xl" fw={700}>
                    {data?.creators.length || 0}
                  </Text>
                </div>
                <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                  <IconUser size={20} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Active Now
                  </Text>
                  <Text size="xl" fw={700}>
                    {data?.creators.filter((c: any) => c.status === 'ACTIVE').length || 0}
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
                    Avg Rating
                  </Text>
                  <Text size="xl" fw={700}>
                    4.8
                  </Text>
                </div>
                <ThemeIcon size="lg" radius="md" variant="light" color="yellow">
                  <IconStar size={20} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Total Orders
                  </Text>
                  <Text size="xl" fw={700}>
                    {data?.creators.reduce(
                      (sum: number, c: any) => sum + (c._count?.orders || 0),
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
            placeholder="Search creators..."
            leftSection={<IconUser size={16} />}
            className="flex-1 max-w-md"
          />
          <Group>
            <Button
              leftSection={<IconUser size={16} />}
              onClick={() => {
                setEditingCreator(null);
                form.reset();
                open();
              }}
            >
              Add Creator
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
            ) : data?.creators.length === 0 ? (
              <Paper p="xl" radius="lg" withBorder className="text-center">
                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <IconUser size={40} className="text-blue-600" />
                </div>
                <Text size="lg" fw={500} mb="xs">
                  No creators yet
                </Text>
                <Text c="dimmed" mb="lg">
                  Start building your creator network
                </Text>
                <Button
                  leftSection={<IconUser size={16} />}
                  onClick={() => {
                    setEditingCreator(null);
                    form.reset();
                    open();
                  }}
                >
                  Add First Creator
                </Button>
              </Paper>
            ) : (
              <Grid>
                {data?.creators.map((creator: any) => (
                  <Grid.Col key={creator.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <CreatorCard creator={creator} />
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
              data={data?.creators || []}
              columns={columns}
              actions={actions}
              onAdd={() => {
                setEditingCreator(null);
                form.reset();
                open();
              }}
              addLabel="Add Creator"
              loading={isLoading}
              rowKey="id"
              searchPlaceholder="Search creators..."
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
              <IconUser size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600}>{editingCreator ? 'Edit Creator' : 'Add New Creator'}</Text>
              <Text size="xs" c="dimmed">
                {editingCreator
                  ? 'Update creator information'
                  : 'Add a talented creator to your network'}
              </Text>
            </div>
          </Group>
        }
        size="xl"
        radius="lg"
      >
        <form onSubmit={form.onSubmit((values) => saveMutation.mutate(values))}>
          <Tabs defaultValue="basic" mt="md">
            <Tabs.List>
              <Tabs.Tab value="basic" leftSection={<IconUser size={16} />}>
                Basic Info
              </Tabs.Tab>
              <Tabs.Tab value="skills" leftSection={<IconStar size={16} />}>
                Skills & Rates
              </Tabs.Tab>
              <Tabs.Tab value="social" leftSection={<IconWorld size={16} />}>
                Social & Portfolio
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="basic" pt="md">
              <Stack gap="md">
                <Group grow>
                  <TextInput
                    label="Full Name"
                    placeholder="John Doe"
                    required
                    {...form.getInputProps('name')}
                  />
                  <TextInput
                    label="Email Address"
                    placeholder="john@example.com"
                    required
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
                  <Select
                    label="Status"
                    data={[
                      { value: 'ACTIVE', label: 'Active' },
                      { value: 'INACTIVE', label: 'Inactive' },
                      { value: 'BUSY', label: 'Busy' },
                      { value: 'VACATION', label: 'On Vacation' },
                    ]}
                    {...form.getInputProps('status')}
                  />
                </Group>

                <Textarea
                  label="Bio & About"
                  placeholder="Tell us about this creator's background, experience, and what makes them unique..."
                  rows={5}
                  {...form.getInputProps('bio')}
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="skills" pt="md">
              <Stack gap="md">
                <MultiSelect
                  label="Skills & Expertise"
                  placeholder="Select skills"
                  data={skillOptions.map((skill) => ({
                    value: skill.value,
                    label: skill.label,
                  }))}
                  searchable
                  clearable
                  {...form.getInputProps('skills')}
                />

                <NumberInput
                  label="Rate per Project"
                  placeholder="1000"
                  prefix="$"
                  thousandSeparator=","
                  min={0}
                  leftSection={<IconCurrencyDollar size={16} />}
                  {...form.getInputProps('rates')}
                />

                <Paper p="md" radius="md" withBorder className="bg-blue-50 border-blue-200">
                  <Group gap="xs" mb="xs">
                    <IconTrendingUp size={16} className="text-blue-600" />
                    <Text size="sm" fw={500}>
                      Performance Tips
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Set competitive rates based on creator experience and skill level. Average rates
                    range from $500-$2000 per project.
                  </Text>
                </Paper>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="social" pt="md">
              <Stack gap="md">
                <TextInput
                  label="Portfolio Website"
                  placeholder="https://portfolio.com"
                  leftSection={<IconWorld size={16} />}
                  {...form.getInputProps('portfolioUrl')}
                />

                <TextInput
                  label="Social Media Handle"
                  placeholder="@username"
                  leftSection={<IconBrandInstagram size={16} />}
                  {...form.getInputProps('socialMedia')}
                />

                <Paper p="md" radius="md" withBorder className="bg-purple-50 border-purple-200">
                  <Group gap="xs" mb="xs">
                    <IconBrandInstagram size={16} className="text-purple-600" />
                    <Text size="sm" fw={500}>
                      Social Presence
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed">
                    A strong social media presence helps build trust with clients and showcases the
                    creator's work style.
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
              leftSection={editingCreator ? <IconCheck size={16} /> : <IconUser size={16} />}
            >
              {editingCreator ? 'Update Creator' : 'Add Creator'}
            </Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}
