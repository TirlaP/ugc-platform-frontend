/**
 * Activity card component for dashboard
 */

import { Avatar, Badge, Card, Group, Stack, Text, Title, Transition } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  status?: string;
  avatar?: string;
  statusColor?: string;
}

interface ActivityCardProps {
  title: string;
  items: ActivityItem[];
  emptyMessage?: string;
  delay?: number;
}

export function ActivityCard({
  title,
  items,
  emptyMessage = 'No recent activity',
  delay = 0,
}: ActivityCardProps) {
  return (
    <Transition
      mounted={true}
      transition="slide-up"
      duration={300}
      timingFunction="ease"
      delay={delay}
    >
      {(styles) => (
        <Card
          shadow="xs"
          padding="lg"
          radius="md"
          withBorder
          className="h-full bg-white border-gray-200"
          style={styles}
        >
          <Title order={5} mb="md" className="text-gray-900 font-semibold">
            {title}
          </Title>

          {items.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <IconClock size={18} className="text-gray-400" />
              </div>
              <Text size="xs" c="dimmed">
                {emptyMessage}
              </Text>
            </div>
          ) : (
            <Stack gap="sm">
              {items.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 px-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <Text size="sm" fw={500} className="text-gray-900 truncate">
                      {item.title}
                    </Text>
                    <div className="flex items-center gap-2 mt-1">
                      <Text size="xs" c="dimmed" className="truncate">
                        {item.subtitle}
                      </Text>
                      {item.status && (
                        <Badge size="xs" variant="light" color={item.statusColor || 'blue'}>
                          {item.status}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Text size="xs" c="dimmed" className="ml-4 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </Text>
                </div>
              ))}
            </Stack>
          )}
        </Card>
      )}
    </Transition>
  );
}
