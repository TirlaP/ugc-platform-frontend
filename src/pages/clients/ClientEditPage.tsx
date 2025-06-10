/**
 * Client Edit Page
 * Edit existing client information
 */

import {
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { clientService } from '@/services/client.service';
import type { CreateClientData } from '@/types/client.types';

export function ClientEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch client data
  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientService.getClient(id!),
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: CreateClientData) => clientService.updateClient(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      notifications.show({
        title: 'Success',
        message: 'Client updated successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      navigate(`/clients/${id}`);
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update client',
        color: 'red',
      });
    },
  });

  // Form
  const form = useForm<CreateClientData>({
    initialValues: {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      company: client?.company || '',
      website: client?.website || '',
      notes: client?.notes || '',
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+$/.test(value)) return 'Invalid email';
        return null;
      },
    },
  });

  // Update form when client data loads
  if (client && form.values.name !== client.name) {
    form.setValues({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      company: client.company || '',
      website: client.website || '',
      notes: client.notes || '',
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

  if (!client) {
    return (
      <Container size="md" className="py-6">
        <Paper p="xl" radius="lg" withBorder className="text-center">
          <Text size="lg" fw={500} mb="xs">
            Client not found
          </Text>
          <Button onClick={() => navigate('/clients')}>Back to Clients</Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="md" className="py-6">
      <Stack gap="lg">
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(`/clients/${id}`)}
          >
            Back
          </Button>
        </Group>

        <div>
          <Title order={2} className="text-2xl font-bold">
            Edit Client
          </Title>
          <Text c="dimmed" size="lg" mt="xs">
            Update client information
          </Text>
        </div>

        <Paper p="xl" radius="lg" withBorder>
          <form onSubmit={form.onSubmit((values) => updateMutation.mutate(values))}>
            <Stack gap="md">
              <TextInput
                label="Name"
                placeholder="Client name"
                required
                {...form.getInputProps('name')}
              />

              <TextInput
                label="Email"
                placeholder="client@example.com"
                required
                {...form.getInputProps('email')}
              />

              <TextInput
                label="Phone"
                placeholder="+1 (555) 123-4567"
                {...form.getInputProps('phone')}
              />

              <TextInput
                label="Company"
                placeholder="Company name"
                {...form.getInputProps('company')}
              />

              <TextInput
                label="Website"
                placeholder="https://example.com"
                {...form.getInputProps('website')}
              />

              <Textarea
                label="Notes"
                placeholder="Additional notes about the client"
                rows={3}
                {...form.getInputProps('notes')}
              />

              <Group justify="flex-end" mt="xl">
                <Button variant="subtle" onClick={() => navigate(`/clients/${id}`)}>
                  Cancel
                </Button>
                <Button type="submit" loading={updateMutation.isPending}>
                  Update Client
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
}
