/**
 * Enhanced data table component with grid/table layout toggle and modern UI
 */

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Menu,
  Paper,
  ScrollArea,
  SegmentedControl,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
  Transition,
  rem,
} from '@mantine/core';
import {
  IconDotsVertical,
  IconFilter,
  IconGrid3x3,
  IconLayoutList,
  IconPlus,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: number | string;
  gridRender?: (item: T) => React.ReactNode; // Custom render for grid view
}

export interface Action<T> {
  label: string;
  icon?: React.ComponentType<any>;
  onClick: (item: T) => void;
  color?: string;
  hidden?: (item: T) => boolean;
}

interface EnhancedDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  onAdd?: () => void;
  addLabel?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyState?: React.ReactNode;
  rowKey: keyof T;
  defaultView?: 'table' | 'grid';
  gridCardRender?: (item: T, actions?: Action<T>[]) => React.ReactNode;
  title?: string;
  subtitle?: string;
  hideViewToggle?: boolean;
}

export function EnhancedDataTable<T extends Record<string, any>>({
  data,
  columns,
  actions,
  onAdd,
  addLabel = 'Add New',
  searchable = true,
  searchPlaceholder = 'Search...',
  loading,
  emptyState,
  rowKey,
  defaultView = 'table',
  gridCardRender,
  title,
  subtitle,
  hideViewToggle = false,
}: EnhancedDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [view, setView] = useState<'table' | 'grid'>(defaultView);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!search) return data;

    return data.filter((item) => {
      return columns.some((col) => {
        const value = col.key.includes('.')
          ? col.key.split('.').reduce((obj, key) => obj?.[key], item)
          : item[col.key];

        return String(value).toLowerCase().includes(search.toLowerCase());
      });
    });
  }, [data, search, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (aVal === bVal) return 0;

      const compare = aVal > bVal ? 1 : -1;
      return sortDirection === 'asc' ? compare : -compare;
    });
  }, [filteredData, sortBy, sortDirection]);

  const handleSort = (key: keyof T | string) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key as keyof T);
      setSortDirection('asc');
    }
  };

  const getCellValue = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    }

    if (column.key.includes('.')) {
      return column.key.split('.').reduce((obj, key) => obj?.[key], item);
    }

    return item[column.key];
  };

  // Default grid card render
  const defaultGridCardRender = (item: T, actions?: Action<T>[]) => (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className="h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1"
    >
      <Card.Section className="p-4 border-b border-gray-100">
        <Group justify="space-between" align="flex-start">
          <Box className="flex-1">
            {columns.slice(0, 2).map((column) => (
              <Box key={String(column.key)} mb="xs">
                {column.gridRender ? column.gridRender(item) : getCellValue(item, column)}
              </Box>
            ))}
          </Box>
          {actions && actions.length > 0 && (
            <Menu position="bottom-end" shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="sm">
                  <IconDotsVertical size={14} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {actions.map((action, index) => {
                  if (action.hidden?.(item)) return null;
                  const Icon = action.icon;
                  return (
                    <Menu.Item
                      key={index}
                      leftSection={Icon && <Icon size={14} />}
                      color={action.color}
                      onClick={() => action.onClick(item)}
                    >
                      {action.label}
                    </Menu.Item>
                  );
                })}
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Card.Section>

      <Stack gap="xs" mt="md">
        {columns.slice(2).map((column) => (
          <Group key={String(column.key)} justify="space-between">
            <Text size="sm" c="dimmed">
              {column.label}
            </Text>
            <Box>{column.gridRender ? column.gridRender(item) : getCellValue(item, column)}</Box>
          </Group>
        ))}
      </Stack>
    </Card>
  );

  const renderSkeletons = (count: number) => (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} height={view === 'grid' ? 200 : 60} radius="md" />
      ))}
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      {(title || subtitle) && (
        <div>
          {title && (
            <Text size="xl" fw={600} mb="xs">
              {title}
            </Text>
          )}
          {subtitle && <Text c="dimmed">{subtitle}</Text>}
        </div>
      )}

      {/* Controls */}
      <Paper shadow="sm" radius="md" p="lg" withBorder>
        <Group justify="space-between" mb="md">
          <Group>
            {searchable && (
              <TextInput
                placeholder={searchPlaceholder}
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                className="w-80"
                variant="filled"
              />
            )}
          </Group>

          <Group>
            {!hideViewToggle && (
              <SegmentedControl
                value={view}
                onChange={(value) => setView(value as 'table' | 'grid')}
                data={[
                  {
                    label: (
                      <Group gap="xs">
                        <IconLayoutList size={16} />
                        <span>Table</span>
                      </Group>
                    ),
                    value: 'table',
                  },
                  {
                    label: (
                      <Group gap="xs">
                        <IconGrid3x3 size={16} />
                        <span>Grid</span>
                      </Group>
                    ),
                    value: 'grid',
                  },
                ]}
                size="sm"
              />
            )}

            {onAdd && (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={onAdd}
                variant="filled"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {addLabel}
              </Button>
            )}
          </Group>
        </Group>

        {/* Results count */}
        {!loading && (
          <Text size="sm" c="dimmed" mb="md">
            {filteredData.length} {filteredData.length === 1 ? 'result' : 'results'}
            {search && ` for "${search}"`}
          </Text>
        )}

        {/* Content */}
        <Transition mounted={true} transition="fade" duration={200}>
          {() => (
            <Box>
              {loading ? (
                view === 'grid' ? (
                  <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                    {renderSkeletons(8)}
                  </SimpleGrid>
                ) : (
                  <Stack gap="xs">{renderSkeletons(5)}</Stack>
                )
              ) : sortedData.length === 0 ? (
                <div className="text-center py-12">
                  {emptyState || (
                    <div className="space-y-2">
                      <Text c="dimmed" size="lg">
                        No data found
                      </Text>
                      {search && (
                        <Text size="sm" c="dimmed">
                          Try adjusting your search criteria
                        </Text>
                      )}
                    </div>
                  )}
                </div>
              ) : view === 'grid' ? (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                  {sortedData.map((item) => (
                    <Box key={String(item[rowKey])}>
                      {gridCardRender
                        ? gridCardRender(item, actions)
                        : defaultGridCardRender(item, actions)}
                    </Box>
                  ))}
                </SimpleGrid>
              ) : (
                <ScrollArea>
                  <Table striped highlightOnHover withTableBorder className="min-w-full">
                    <Table.Thead>
                      <Table.Tr>
                        {columns.map((column) => (
                          <Table.Th
                            key={String(column.key)}
                            style={{
                              width: column.width,
                              cursor: column.sortable ? 'pointer' : 'default',
                            }}
                            onClick={() => column.sortable && handleSort(column.key)}
                            className={column.sortable ? 'hover:bg-gray-50 transition-colors' : ''}
                          >
                            <Group gap="xs" justify="space-between">
                              <Text fw={500}>{column.label}</Text>
                              {column.sortable && (
                                <Box>
                                  {sortBy === column.key ? (
                                    sortDirection === 'asc' ? (
                                      <IconSortAscending size={14} className="text-blue-600" />
                                    ) : (
                                      <IconSortDescending size={14} className="text-blue-600" />
                                    )
                                  ) : (
                                    <IconSortAscending size={14} className="text-gray-400" />
                                  )}
                                </Box>
                              )}
                            </Group>
                          </Table.Th>
                        ))}
                        {actions && actions.length > 0 && (
                          <Table.Th style={{ width: 80 }}>Actions</Table.Th>
                        )}
                      </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                      {sortedData.map((item) => (
                        <Table.Tr
                          key={String(item[rowKey])}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          {columns.map((column) => (
                            <Table.Td key={String(column.key)}>
                              {getCellValue(item, column)}
                            </Table.Td>
                          ))}
                          {actions && actions.length > 0 && (
                            <Table.Td>
                              <Menu position="bottom-end" shadow="md" width={200}>
                                <Menu.Target>
                                  <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    className="hover:bg-gray-100"
                                  >
                                    <IconDotsVertical size={16} />
                                  </ActionIcon>
                                </Menu.Target>

                                <Menu.Dropdown>
                                  {actions.map((action, index) => {
                                    if (action.hidden?.(item)) return null;

                                    const Icon = action.icon;

                                    return (
                                      <Menu.Item
                                        key={index}
                                        leftSection={Icon && <Icon size={16} />}
                                        color={action.color}
                                        onClick={() => action.onClick(item)}
                                      >
                                        {action.label}
                                      </Menu.Item>
                                    );
                                  })}
                                </Menu.Dropdown>
                              </Menu>
                            </Table.Td>
                          )}
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              )}
            </Box>
          )}
        </Transition>
      </Paper>
    </div>
  );
}
