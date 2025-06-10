/**
 * Organizations page - Manage organizations
 */

import {
  Avatar,
  Badge,
  Button,
  Container,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconBuilding, IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { DataTable } from '@/components/common/DataTable';
import { organizationService } from '@/services/organization.service';

export function OrganizationsPage() {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingOrg, setEditingOrg] = useState<any>(null);

  // Fetch organizations
  const { data, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getOrganizations(),
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingOrg) {
        return organizationService.updateOrganization(editingOrg.id, data);
      }
      return organizationService.createOrganization(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      notifications.show({
        title: 'Success',
        message: editingOrg
          ? 'Organization updated successfully'
          : 'Organization created successfully',
        color: 'green',
      });
      close();
      form.reset();
      setEditingOrg(null);
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to save organization',
        color: 'red',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => organizationService.deleteOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      notifications.show({
        title: 'Success',
        message: 'Organization deleted successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete organization',
        color: 'red',
      });
    },
  });

  // Form
  const form = useForm({
    initialValues: {
      name: '',
      slug: '',
      description: '',
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      slug: (value) => {
        if (!value) return 'Slug is required';
        if (!/^[a-z0-9-]+$/.test(value))
          return 'Slug must contain only lowercase letters, numbers, and hyphens';
        return null;
      },
    },
  });

  const handleEdit = (org: any) => {
    setEditingOrg(org);
    form.setValues({
      name: org.name,
      slug: org.slug,
      description: org.description || '',
    });
    open();
  };

  const handleDelete = (org: any) => {
    modals.openConfirmModal({
      title: 'Delete Organization',
      children: (
        <Text size="sm">
          Are you sure you want to delete "{org.name}"? This action cannot be undone and will remove
          all associated data.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(org.id),
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Organization',
      sortable: true,
      render: (org: any) => (
        <Group gap="sm">
          <Avatar src={org.logo} alt={org.name} size="sm" radius="sm" color="blue">
            <IconBuilding size={16} />
          </Avatar>
          <div>
            <Text size="sm" fw={500}>
              {org.name}
            </Text>
            <Text size="xs" c="dimmed">
              {org.slug}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: 'members',
      label: 'Members',
      render: (org: any) => (
        <Badge variant="light" color="blue">
          {org._count?.members || 0} members
        </Badge>
      ),
    },
    {
      key: 'campaigns',
      label: 'Campaigns',
      render: (org: any) => <Text size="sm">{org._count?.campaigns || 0} campaigns</Text>,
    },
    {
      key: 'clients',
      label: 'Clients',
      render: (org: any) => <Text size="sm">{org._count?.clients || 0} clients</Text>,
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (org: any) => new Date(org.createdAt).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      label: 'View',
      icon: IconEye,
      onClick: (org: any) => {
        // TODO: Navigate to organization details
        console.log('View organization:', org.id);
      },
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
      hidden: (org: any) => org._count?.members > 0 || org._count?.campaigns > 0,
    },
  ];

  return (
    <Container size="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2}>Organizations</Title>
          <Text c="dimmed">Manage your organizations</Text>
        </Group>

        <DataTable
          data={data?.organizations || []}
          columns={columns}
          actions={actions}
          onAdd={() => {
            setEditingOrg(null);
            form.reset();
            open();
          }}
          addLabel="Create Organization"
          loading={isLoading}
          rowKey="id"
          searchPlaceholder="Search organizations..."
        />
      </Stack>

      <Modal
        opened={opened}
        onClose={close}
        title={editingOrg ? 'Edit Organization' : 'Create Organization'}
        size="lg"
      >
        <form onSubmit={form.onSubmit((values) => saveMutation.mutate(values))}>
          <Stack gap="md">
            <TextInput
              label="Organization Name"
              placeholder="Enter organization name"
              required
              {...form.getInputProps('name')}
            />

            <TextInput
              label="Slug"
              placeholder="organization-slug"
              description="URL-friendly identifier for the organization"
              required
              {...form.getInputProps('slug')}
            />

            <Textarea
              label="Description"
              placeholder="Organization description (optional)"
              rows={3}
              {...form.getInputProps('description')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" loading={saveMutation.isPending}>
                {editingOrg ? 'Update' : 'Create'} Organization
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
