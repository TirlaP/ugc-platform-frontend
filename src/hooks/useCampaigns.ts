/**
 * Campaign hooks
 * React Query hooks for campaign data management
 */

import { campaignService } from '@/services/campaign.service';
import type {
  AssignCreatorData,
  CampaignFilters,
  CreateCampaignData,
  UpdateCampaignData,
} from '@/types/campaign.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query keys
const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters?: CampaignFilters) => [...campaignKeys.lists(), filters] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
  stats: (id: string) => [...campaignKeys.detail(id), 'stats'] as const,
};

// Get campaigns list
export function useCampaigns(filters?: CampaignFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: campaignKeys.list(filters),
    queryFn: () => campaignService.getCampaigns(filters),
  });
}

// Get single campaign
export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => campaignService.getCampaign(id),
    enabled: !!id,
  });
}

// Create campaign
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCampaignData) => campaignService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

// Update campaign
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateCampaignData> }) =>
      campaignService.updateCampaign(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

// Delete campaign
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

// Assign creator to campaign
export function useAssignCreator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignCreatorData) => campaignService.assignCreator(data),
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(campaignId) });
    },
  });
}

// Get campaign stats
export function useCampaignStats(id: string) {
  return useQuery({
    queryKey: campaignKeys.stats(id),
    queryFn: () => campaignService.getCampaignStats(id),
    enabled: !!id,
  });
}
