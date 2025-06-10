/**
 * Modal for assigning creator to campaign
 */

import { Button, Group, Modal, Select, Stack, Text, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { campaignService } from '@/services/campaign.service';
import type { AssignCreatorData } from '@/types/campaign.types';

interface AssignToCampaignModalProps {
  opened: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
}

export function AssignToCampaignModal({
  opened,
  onClose,
  creatorId,
  creatorName,
}: AssignToCampaignModalProps) {
  const queryClient = useQueryClient();

  // Fetch available campaigns
  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns-for-assignment'],
    queryFn: async () => {
      const result = await campaignService.getCampaigns();
      console.log('Campaigns data:', result); // Debug log
      return result;
    },
    enabled: opened,
  });

  // Assignment mutation
  const assignMutation = useMutation({
    mutationFn: (data: { campaignId: string; notes?: string }) => {
      const assignData: AssignCreatorData = {
        campaignId: data.campaignId,
        creatorId,
        notes: data.notes,
      };
      return campaignService.assignCreator(assignData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['creator', creatorId] });
      queryClient.invalidateQueries({ queryKey: ['creator-orders', creatorId] });
      notifications.show({
        title: 'Success',
        message: `${creatorName} has been assigned to the campaign`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to assign creator to campaign',
        color: 'red',
        icon: <IconX size={16} />,
      });
    },
  });

  // Form
  const form = useForm({
    initialValues: {
      campaignId: '',
      notes: '',
    },
    validate: {
      campaignId: (value) => (!value ? 'Please select a campaign' : null),
    },
  });

  const campaignOptions =
    campaignsData?.campaigns
      ?.filter((campaign: any) => {
        console.log('Campaign:', campaign); // Debug log
        // Filter out campaigns where creator is already assigned
        const isAlreadyAssigned = campaign.orders?.some(
          (order: any) => order.creatorId === creatorId
        );
        console.log(
          `Campaign ${campaign.title || campaign.name} - Already assigned:`,
          isAlreadyAssigned
        );
        return !isAlreadyAssigned;
      })
      .map((campaign: any) => {
        const campaignName = campaign.title || campaign.name || 'Untitled Campaign';
        const clientName = campaign.client?.name || 'No client';
        console.log('Mapping campaign:', { campaignName, clientName, campaign });
        return {
          value: campaign.id,
          label: `${campaignName} - ${clientName}`,
        };
      }) || [];

  const handleSubmit = (values: { campaignId: string; notes?: string }) => {
    console.log('Form values:', values);
    console.log('Creator ID:', creatorId);
    assignMutation.mutate(values);
  };

  return (
    <Modal opened={opened} onClose={onClose} title={`Assign ${creatorName} to Campaign`} size="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Select
            label="Select Campaign"
            placeholder="Choose a campaign"
            data={campaignOptions}
            required
            loading={campaignsLoading}
            disabled={campaignOptions.length === 0}
            {...form.getInputProps('campaignId')}
          />

          {campaignOptions.length === 0 && !campaignsLoading && (
            <Text size="sm" c="dimmed">
              No available campaigns found. The creator may already be assigned to all active
              campaigns.
            </Text>
          )}

          <Textarea
            label="Assignment Notes"
            placeholder="Add any special instructions or notes for this assignment..."
            rows={3}
            {...form.getInputProps('notes')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={assignMutation.isPending}
              disabled={campaignOptions.length === 0}
            >
              Assign Creator
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
