/**
 * Main application shell with sidebar navigation
 */

import { useAuth } from '@/hooks/useAuth';
import {
  AppShell,
  Avatar,
  Burger,
  Button,
  Group,
  Menu,
  ScrollArea,
  Text,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconBriefcase,
  IconBuilding,
  IconChartBar,
  IconChevronRight,
  IconDashboard,
  IconLogout,
  IconMessage,
  IconPhoto,
  IconSettings,
  IconUser,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const navigation = [
  {
    label: 'Dashboard',
    icon: IconDashboard,
    href: '/dashboard',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    label: 'Analytics',
    icon: IconChartBar,
    href: '/analytics',
    gradient: 'from-indigo-500 to-indigo-600',
  },
  {
    label: 'Campaigns',
    icon: IconBriefcase,
    href: '/campaigns',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    label: 'Creators',
    icon: IconUsers,
    href: '/creators',
    gradient: 'from-green-500 to-green-600',
  },
  {
    label: 'Clients',
    icon: IconUsersGroup,
    href: '/clients',
    gradient: 'from-orange-500 to-orange-600',
  },
  { label: 'Media', icon: IconPhoto, href: '/media', gradient: 'from-pink-500 to-pink-600' },
  {
    label: 'Messages',
    icon: IconMessage,
    href: '/messages',
    gradient: 'from-teal-500 to-teal-600',
  },
  {
    label: 'Organizations',
    icon: IconBuilding,
    href: '/organizations',
    gradient: 'from-gray-500 to-gray-600',
  },
];

export function AppShellLayout() {
  const [opened, setOpened] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      notifications.show({
        title: 'Success',
        message: 'You have been logged out',
        color: 'blue',
      });
      navigate('/login');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to logout',
        color: 'red',
      });
    }
  };

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter((item) => {
    if (!user) return false;

    // Admin and Staff can see everything
    if (user.role === 'ADMIN' || user.role === 'STAFF') return true;

    // Creators can see specific pages
    if (user.role === 'CREATOR') {
      return ['Dashboard', 'Analytics', 'Campaigns', 'Media', 'Messages'].includes(item.label);
    }

    // Clients can see specific pages
    if (user.role === 'CLIENT') {
      return ['Dashboard', 'Analytics', 'Campaigns', 'Creators', 'Media', 'Messages'].includes(
        item.label
      );
    }

    return false;
  });

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={() => setOpened(!opened)} hiddenFrom="sm" size="sm" />
            <Text size="xl" fw={700} gradient={{ from: 'blue', to: 'cyan' }} variant="gradient">
              UGC Platform
            </Text>
          </Group>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton>
                <Group gap={7}>
                  <Avatar
                    src={user?.image}
                    alt={user?.name || ''}
                    radius="xl"
                    size={36}
                    color="blue"
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>
                      {user?.name}
                    </Text>
                    <Text c="dimmed" size="xs">
                      {user?.email}
                    </Text>
                  </div>
                  <IconChevronRight size={12} />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>
                {user?.role && (
                  <Text size="xs" c="dimmed" tt="uppercase">
                    {user.role}
                  </Text>
                )}
              </Menu.Label>
              <Menu.Item leftSection={<IconUser size={14} />} onClick={() => navigate('/profile')}>
                Profile
              </Menu.Item>
              <Menu.Item
                leftSection={<IconSettings size={14} />}
                onClick={() => navigate('/settings')}
              >
                Settings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        className="bg-gradient-to-b from-gray-50 to-white border-r border-gray-200"
      >
        <AppShell.Section grow component={ScrollArea}>
          <div className="space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-blue-500/25 transform scale-105`
                        : 'hover:bg-gray-100 hover:scale-102 text-gray-700 hover:text-gray-900'
                    }
                  `}
                >
                  <div
                    className={`
                    flex items-center justify-center w-8 h-8 rounded-lg transition-colors
                    ${isActive ? 'bg-white/20' : 'bg-gray-200 group-hover:bg-gray-300'}
                  `}
                  >
                    <Icon
                      size={18}
                      className={
                        isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'
                      }
                    />
                  </div>
                  <Text
                    fw={isActive ? 600 : 500}
                    size="sm"
                    className={`transition-colors ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}`}
                  >
                    {item.label}
                  </Text>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>
        </AppShell.Section>

        <AppShell.Section>
          <div className="space-y-3">
            <Button
              fullWidth
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              leftSection={<IconBriefcase size={16} />}
              onClick={() => navigate('/campaigns/new')}
              size="md"
            >
              Create Campaign
            </Button>
            <div className="text-center">
              <Text size="xs" c="dimmed">
                Need help? Check our{' '}
                <Text
                  component="span"
                  size="xs"
                  c="blue"
                  className="cursor-pointer hover:underline"
                >
                  documentation
                </Text>
              </Text>
            </div>
          </div>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            <Outlet />
          </div>
          <footer className="mt-auto pt-8 pb-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="text-center space-y-2">
              <Text size="sm" c="dimmed" className="font-medium">
                © 2025 UGC Agency Platform. All rights reserved.
              </Text>
              <Group justify="center" gap="md">
                <Text
                  size="xs"
                  c="blue"
                  className="cursor-pointer hover:underline transition-colors"
                >
                  Privacy Policy
                </Text>
                <Text
                  size="xs"
                  c="blue"
                  className="cursor-pointer hover:underline transition-colors"
                >
                  Terms of Service
                </Text>
                <Text
                  size="xs"
                  c="blue"
                  className="cursor-pointer hover:underline transition-colors"
                >
                  Support
                </Text>
              </Group>
            </div>
          </footer>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
