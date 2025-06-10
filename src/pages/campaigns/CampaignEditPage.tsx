/**
 * Campaign Edit Page
 * Edit existing campaign information
 */

import {
  Button,
  Container,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { campaignService } from '@/services/campaign.service';
import { clientService } from '@/services/client.service';

export function CampaignEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch campaign data
  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignService.getCampaign(id!),
    enabled: !!id,
  });

  // Fetch clients for selection
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getClients(),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => campaignService.updateCampaign(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      notifications.show({
        title: 'Success',
        message: 'Campaign updated successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      navigate(`/campaigns/${id}`);
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update campaign',
        color: 'red',
      });
    },
  });

  // Form
  const form = useForm({
    initialValues: {
      name: campaign?.name || '',
      description: campaign?.description || '',
      budget: campaign?.budget || 0,
      status: campaign?.status || 'DRAFT',
      priority: campaign?.priority || 'MEDIUM',
      clientId: campaign?.clientId || '',
      startDate: campaign?.startDate ? new Date(campaign.startDate) : null,
      endDate: campaign?.endDate ? new Date(campaign.endDate) : null,
    },
    validate: {
      name: (value) => (!value ? 'Campaign name is required' : null),
      description: (value) => (!value ? 'Description is required' : null),
      budget: (value) => (value <= 0 ? 'Budget must be greater than 0' : null),
      clientId: (value) => (!value ? 'Client is required' : null),
    },
  });

  // Update form when campaign data loads
  if (campaign && form.values.name !== campaign.name) {
    form.setValues({
      name: campaign.name,
      description: campaign.description || '',
      budget: campaign.budget || 0,
      status: campaign.status,
      priority: campaign.priority || 'MEDIUM',
      clientId: campaign.clientId,
      startDate: campaign.startDate ? new Date(campaign.startDate) : null,
      endDate: campaign.endDate ? new Date(campaign.endDate) : null,
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

  if (!campaign) {
    return (
      <Container size="md" className="py-6">
        <Paper p="xl" radius="lg" withBorder className="text-center">
          <Text size="lg" fw={500} mb="xs">
            Campaign not found
          </Text>
          <Button onClick={() => navigate('/campaigns')}>Back to Campaigns</Button>
        </Paper>
      </Container>
    );
  }

  const clientOptions =
    clientsData?.clients.map((client: any) => ({
      value: client.id,
      label: `${client.name} ${client.company ? `(${client.company})` : ''}`,
    })) || [];

  return (
    <Container size="md" className="py-6">
      <Stack gap="lg">
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(`/campaigns/${id}`)}
          >
            Back
          </Button>
        </Group>

        <div>
          <Title order={2} className="text-2xl font-bold">
            Edit Campaign
          </Title>
          <Text c="dimmed" size="lg" mt="xs">
            Update campaign information
          </Text>
        </div>

        <Paper p="xl" radius="lg" withBorder>
          <form onSubmit={form.onSubmit((values) => updateMutation.mutate(values))}>
            <Stack gap="md">
              <TextInput
                label="Campaign Name"
                placeholder="Enter campaign name"
                required
                {...form.getInputProps('name')}
              />

              <Textarea
                label="Description"
                placeholder="Describe the campaign objectives and requirements"
                rows={4}
                required
                {...form.getInputProps('description')}
              />

              <Group grow>
                <Select
                  label="Client"
                  placeholder="Select client"
                  data={clientOptions}
                  required
                  searchable
                  {...form.getInputProps('clientId')}
                />
                <NumberInput
                  label="Budget"
                  placeholder="0"
                  prefix="$"
                  thousandSeparator=","
                  min={0}
                  required
                  {...form.getInputProps('budget')}
                />
              </Group>

              <Group grow>
                <Select
                  label="Status"
                  data={[
                    { value: 'DRAFT', label: 'Draft' },
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'PAUSED', label: 'Paused' },
                    { value: 'COMPLETED', label: 'Completed' },
                    { value: 'CANCELLED', label: 'Cancelled' },
                  ]}
                  {...form.getInputProps('status')}
                />
                <Select
                  label="Priority"
                  data={[
                    { value: 'LOW', label: 'Low' },
                    { value: 'MEDIUM', label: 'Medium' },
                    { value: 'HIGH', label: 'High' },
                    { value: 'URGENT', label: 'Urgent' },
                  ]}
                  {...form.getInputProps('priority')}
                />
              </Group>

              <Group grow>
                <DatePickerInput
                  label="Start Date"
                  placeholder="Select start date"
                  {...form.getInputProps('startDate')}
                />
                <DatePickerInput
                  label="End Date"
                  placeholder="Select end date"
                  {...form.getInputProps('endDate')}
                />
              </Group>

              <Group justify="flex-end" mt="xl">
                <Button variant="subtle" onClick={() => navigate(`/campaigns/${id}`)}>
                  Cancel
                </Button>
                <Button type="submit" loading={updateMutation.isPending}>
                  Update Campaign
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
}
