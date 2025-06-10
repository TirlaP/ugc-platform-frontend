/**
 * Modern stats card component with animations and better styling
 */

import { Card, Group, Text, ThemeIcon, Transition, rem } from '@mantine/core';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  trend?: {
    value: number;
    label: string;
  };
  color?: string;
  delay?: number;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  delay = 0,
}: StatsCardProps) {
  const isPositiveTrend = trend && trend.value > 0;

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
          className="h-full transition-all duration-200 hover:shadow-md border-gray-200 bg-white"
          style={styles}
        >
          <Group justify="space-between" align="flex-start" mb="md">
            <div className="flex-1">
              <Text size="xs" fw={500} c="dimmed" className="uppercase tracking-wider">
                {title}
              </Text>
              <Text size="xl" fw={700} className="text-gray-900 mt-1">
                {value}
              </Text>
              {subtitle && (
                <Text size="xs" c="dimmed" mt={4}>
                  {subtitle}
                </Text>
              )}
            </div>

            <ThemeIcon
              size="lg"
              radius="md"
              variant="light"
              color={color}
              className="bg-opacity-10"
            >
              <Icon size={20} />
            </ThemeIcon>
          </Group>

          {trend && (
            <Group gap={4} className="mt-auto">
              <Group gap={4}>
                {isPositiveTrend ? (
                  <IconTrendingUp size={12} className="text-green-600" />
                ) : (
                  <IconTrendingDown size={12} className="text-red-600" />
                )}
                <Text
                  size="xs"
                  fw={500}
                  className={isPositiveTrend ? 'text-green-600' : 'text-red-600'}
                >
                  {isPositiveTrend ? '+' : ''}
                  {trend.value}%
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                {trend.label}
              </Text>
            </Group>
          )}
        </Card>
      )}
    </Transition>
  );
}
