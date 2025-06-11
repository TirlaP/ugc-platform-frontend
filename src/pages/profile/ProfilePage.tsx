/**
 * Profile page - User profile management
 */

import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/user.service';
import {
  Avatar,
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
import {
  User
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  // Form for profile editing
  const form = useForm({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
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

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => userService.updateProfile(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile',
        color: 'red',
      });
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    updateMutation.mutate(values);
  };

  return (
    <Container size="md">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2}>Profile</Title>
          <Text c="dimmed">Manage your account settings</Text>
        </Group>

        <Paper p="xl" shadow="sm" withBorder>
          <Stack gap="lg">
            {/* Profile Header */}
            <Group>
              <Avatar src={user?.image} alt={user?.name || ''} size="xl" radius="xl" color="blue">
                {user?.name?.charAt(0).toUpperCase() || <User size={32} />}
              </Avatar>
              <div>
                <Text size="xl" fw={600}>
                  {user?.name}
                </Text>
                <Text c="dimmed">{user?.email}</Text>
                <Text size="sm" c="blue">
                  {user?.role}
                </Text>
              </div>
            </Group>

            {/* Profile Form */}
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <Group grow>
                  <TextInput
                    label="First Name"
                    placeholder="Enter your first name"
                    {...form.getInputProps('firstName')}
                  />
                  <TextInput
                    label="Last Name"
                    placeholder="Enter your last name"
                    {...form.getInputProps('lastName')}
                  />
                </Group>

                <TextInput
                  label="Display Name"
                  placeholder="Enter your display name"
                  required
                  {...form.getInputProps('name')}
                />

                <TextInput
                  label="Email"
                  placeholder="Enter your email"
                  required
                  {...form.getInputProps('email')}
                />

                <TextInput
                  label="Phone"
                  placeholder="Enter your phone number"
                  {...form.getInputProps('phone')}
                />

                <Textarea
                  label="Bio"
                  placeholder="Tell us about yourself"
                  rows={4}
                  {...form.getInputProps('bio')}
                />

                <Group justify="flex-end" mt="md">
                  <Button type="button" variant="subtle" onClick={() => form.reset()}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={updateMutation.isPending}>
                    Save Changes
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
