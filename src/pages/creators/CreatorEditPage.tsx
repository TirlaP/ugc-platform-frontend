/**
 * Creator Edit Page
 * Edit existing creator information
 */

import {
  Button,
  Container,
  Group,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  ArrowLeft,
  Instagram,
  Check,
  DollarSign,
  Phone,
  Star,
  User,
  Globe
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { creatorService } from '@/services/creator.service';

const skillOptions = [
  { value: 'video-editing', label: 'Video Editing' },
  { value: 'photography', label: 'Photography' },
  { value: 'copywriting', label: 'Copywriting' },
  { value: 'voice-over', label: 'Voice Over' },
  { value: 'social-media', label: 'Social Media' },
];

export function CreatorEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch creator data
  const { data: creator, isLoading } = useQuery({
    queryKey: ['creator', id],
    queryFn: () => creatorService.getCreator(id!),
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => creatorService.updateCreator(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator', id] });
      queryClient.invalidateQueries({ queryKey: ['creators'] });
      notifications.show({
        title: 'Success',
        message: 'Creator updated successfully',
        color: 'green',
        icon: <Check size={16} />,
      });
      navigate(`/creators/${id}`);
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update creator',
        color: 'red',
      });
    },
  });

  // Form
  const form = useForm({
    initialValues: {
      name: creator?.name || '',
      email: creator?.email || '',
      phone: creator?.phone || '',
      bio: creator?.bio || '',
      portfolioUrl: creator?.portfolioUrl || '',
      socialMedia: creator?.socialMedia || '',
      rates:
        typeof creator?.rates === 'object' ? creator?.rates?.perProject || 0 : creator?.rates || 0,
      skills: creator?.skills || [],
      status: creator?.status || 'ACTIVE',
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

  // Update form when creator data loads
  if (creator && form.values.name !== creator.name) {
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
  }

  if (isLoading) {
    return (
      <Container size="md" className="py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </Container>
    );
  }

  if (!creator) {
    return (
      <Container size="md" className="py-6">
        <Paper p="xl" radius="lg" withBorder className="text-center">
          <Text size="lg" fw={500} mb="xs">
            Creator not found
          </Text>
          <Button onClick={() => navigate('/creators')}>Back to Creators</Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xl" className="py-6">
      <Stack gap="lg">
        <Group>
          <Button
            variant="subtle"
            leftSection={<ArrowLeft size={16} />}
            onClick={() => navigate(`/creators/${id}`)}
          >
            Back
          </Button>
        </Group>

        <div>
          <Title order={2} className="text-2xl font-bold">
            Edit Creator
          </Title>
          <Text c="dimmed" size="lg" mt="xs">
            Update creator information
          </Text>
        </div>

        <Paper p="xl" radius="lg" withBorder>
          <form onSubmit={form.onSubmit((values) => updateMutation.mutate(values))}>
            <Tabs defaultValue="basic">
              <Tabs.List>
                <Tabs.Tab value="basic" leftSection={<User size={16} />}>
                  Basic Info
                </Tabs.Tab>
                <Tabs.Tab value="skills" leftSection={<Star size={16} />}>
                  Skills & Rates
                </Tabs.Tab>
                <Tabs.Tab value="social" leftSection={<Globe size={16} />}>
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
                      leftSection={<Phone size={16} />}
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
                    data={skillOptions}
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
                    leftSection={<DollarSign size={16} />}
                    {...form.getInputProps('rates')}
                  />
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="social" pt="md">
                <Stack gap="md">
                  <TextInput
                    label="Portfolio Website"
                    placeholder="https://portfolio.com"
                    leftSection={<Globe size={16} />}
                    {...form.getInputProps('portfolioUrl')}
                  />

                  <TextInput
                    label="Social Media Handle"
                    placeholder="@username"
                    leftSection={<Instagram size={16} />}
                    {...form.getInputProps('socialMedia')}
                  />
                </Stack>
              </Tabs.Panel>
            </Tabs>

            <Group justify="flex-end" mt="xl" pt="md" className="border-t">
              <Button variant="subtle" onClick={() => navigate(`/creators/${id}`)}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={updateMutation.isPending}
                leftSection={<Check size={16} />}
              >
                Update Creator
              </Button>
            </Group>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
}
