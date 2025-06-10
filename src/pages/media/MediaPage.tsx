/**
 * Media page - Manage media files
 */

import {
  Badge,
  Button,
  Container,
  Group,
  Image,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { DataTable } from '@/components/common/DataTable';
import { mediaService } from '@/services/media.service';

export function MediaPage() {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [uploading, setUploading] = useState(false);

  // Fetch media
  const { data: mediaData, isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: () => mediaService.getAllMedia(),
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      // Upload each file individually
      const uploads = files.map((file) =>
        mediaService.uploadMedia({
          file,
          campaignId: '', // This would need to come from somewhere
          orderId: undefined,
          metadata: {},
        })
      );
      return Promise.all(uploads);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      notifications.show({
        title: 'Success',
        message: 'Media uploaded successfully',
        color: 'green',
      });
      setUploading(false);
      close();
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload media',
        color: 'red',
      });
      setUploading(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => mediaService.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      notifications.show({
        title: 'Success',
        message: 'Media deleted successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete media',
        color: 'red',
      });
    },
  });

  const handleUpload = (files: File[]) => {
    setUploading(true);
    uploadMutation.mutate(files);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'green';
      case 'PENDING':
        return 'yellow';
      case 'REJECTED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const columns = [
    {
      key: 'filename',
      label: 'File',
      sortable: true,
      render: (media: any) => (
        <Group gap="sm">
          {media.type === 'IMAGE' ? (
            <Image src={media.url} alt={media.filename} w={40} h={40} radius="sm" />
          ) : (
            <IconPhoto size={16} />
          )}
          <div>
            <Text size="sm" fw={500}>
              {media.filename}
            </Text>
            <Text size="xs" c="dimmed">
              {media.type}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: 'campaign.title',
      label: 'Campaign',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      render: (media: any) => (
        <Badge color={getStatusColor(media.status)} variant="light">
          {media.status}
        </Badge>
      ),
    },
    {
      key: 'size',
      label: 'Size',
      render: (media: any) => {
        const sizeInMB = (media.size / (1024 * 1024)).toFixed(2);
        return <Text size="sm">{sizeInMB} MB</Text>;
      },
    },
    {
      key: 'createdAt',
      label: 'Uploaded',
      sortable: true,
      render: (media: any) => new Date(media.createdAt).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      label: 'Download',
      icon: IconUpload,
      onClick: (media: any) => {
        window.open(media.url, '_blank');
      },
    },
    {
      label: 'Delete',
      icon: IconX,
      color: 'red',
      onClick: (media: any) => deleteMutation.mutate(media.id),
    },
  ];

  return (
    <Container size="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2}>Media Library</Title>
          <Text c="dimmed">Manage your media files</Text>
        </Group>

        <DataTable
          data={mediaData?.media || []}
          columns={columns}
          actions={actions}
          onAdd={open}
          addLabel="Upload Media"
          loading={isLoading}
          rowKey="id"
          searchPlaceholder="Search media..."
        />
      </Stack>

      <Modal opened={opened} onClose={close} title="Upload Media" size="lg">
        <Dropzone
          onDrop={handleUpload}
          onReject={() => {
            notifications.show({
              title: 'Error',
              message: 'Invalid file type or size',
              color: 'red',
            });
          }}
          maxSize={10 * 1024 ** 2} // 10MB
          accept={IMAGE_MIME_TYPE}
          loading={uploading}
        >
          <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
            <Dropzone.Accept>
              <IconUpload size={52} stroke={1.5} />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX size={52} stroke={1.5} />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconPhoto size={52} stroke={1.5} />
            </Dropzone.Idle>

            <div>
              <Text size="xl" inline>
                Drag images here or click to select files
              </Text>
              <Text size="sm" c="dimmed" inline mt={7}>
                Attach up to 10 files, each file should not exceed 10MB
              </Text>
            </div>
          </Group>
        </Dropzone>
      </Modal>
    </Container>
  );
}
