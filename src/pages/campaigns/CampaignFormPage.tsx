/**
 * Campaign Form page - Create/Edit campaigns
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
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { campaignService } from '@/services/campaign.service';
import { clientService } from '@/services/client.service';
import type { CreateCampaignData } from '@/types/campaign.types';

export function CampaignFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get pre-selected client from URL params or location state
  const searchParams = new URLSearchParams(location.search);
  const preSelectedClientId = searchParams.get('clientId') || location.state?.clientId;

  // Fetch clients for dropdown
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getClients(),
    enabled: user?.role === 'ADMIN' || user?.role === 'STAFF',
  });

  // Fetch campaign if editing
  const { data: campaign } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignService.getCampaign(id!),
    enabled: isEditing,
  });

  // Form
  const form = useForm<CreateCampaignData>({
    initialValues: {
      title: '',
      brief: '',
      clientId: preSelectedClientId || '',
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

  // Populate form when editing
  useEffect(() => {
    if (campaign) {
      form.setValues({
        title: campaign.title,
        brief: campaign.brief,
        clientId: campaign.clientId,
        budget: Number(campaign.budget),
        deadline: campaign.deadline ? new Date(campaign.deadline) : undefined,
        requirements: campaign.requirements || {},
      });
    }
  }, [campaign]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data: CreateCampaignData) => {
      if (isEditing) {
        return campaignService.updateCampaign(id!, data);
      }
      return campaignService.createCampaign(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      notifications.show({
        title: 'Success',
        message: isEditing ? 'Campaign updated successfully' : 'Campaign created successfully',
        color: 'green',
      });
      navigate('/campaigns');
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to save campaign',
        color: 'red',
      });
    },
  });

  const handleSubmit = (values: CreateCampaignData) => {
    saveMutation.mutate(values);
  };

  return (
    <Container size="md">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2}>{isEditing ? 'Edit Campaign' : 'Create Campaign'}</Title>
          <Button variant="subtle" onClick={() => navigate('/campaigns')}>
            Back to Campaigns
          </Button>
        </Group>

        <Paper p="xl" shadow="sm" withBorder>
          <form onSubmit={form.onSubmit(handleSubmit)}>
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
                rows={6}
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

              <Group justify="flex-end" mt="xl">
                <Button variant="subtle" onClick={() => navigate('/campaigns')}>
                  Cancel
                </Button>
                <Button type="submit" loading={saveMutation.isPending}>
                  {isEditing ? 'Update' : 'Create'} Campaign
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
}
