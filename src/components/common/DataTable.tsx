/**
 * Reusable data table component with sorting, filtering, and actions
 */

import {
  ActionIcon,
  Box,
  Button,
  Group,
  Menu,
  Paper,
  ScrollArea,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import {
  MoreVertical,
  Eye,
  Plus,
  Search
} from 'lucide-react';
import { useState } from 'react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: number | string;
}

export interface Action<T> {
  label: string;
  icon?: React.ComponentType<any>;
  onClick: (item: T) => void;
  color?: string;
  hidden?: (item: T) => boolean;
}

interface DataTableProps<T> {
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
}

export function DataTable<T extends Record<string, any>>({
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
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter data based on search
  const filteredData = data.filter((item) => {
    if (!search) return true;

    return columns.some((col) => {
      const key = col.key as string;
      const value = key.includes('.')
        ? key.split('.').reduce((obj: any, k: string) => obj?.[k], item)
        : item[col.key];

      return String(value || '').toLowerCase().includes(search.toLowerCase());
    });
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0;

    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (aVal === bVal) return 0;

    const compare = aVal > bVal ? 1 : -1;
    return sortDirection === 'asc' ? compare : -compare;
  });

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

    const key = column.key as string;
    if (key.includes('.')) {
      return key.split('.').reduce((obj: any, k: string) => obj?.[k], item);
    }

    return item[column.key];
  };

  return (
    <Paper shadow="sm" radius="md" p="lg" withBorder>
      <Box mb="md">
        <Group justify="space-between">
          {searchable && (
            <TextInput
              placeholder={searchPlaceholder}
              leftSection={<Search size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ flex: 1, maxWidth: 400 }}
            />
          )}

          {onAdd && (
            <Button leftSection={<Plus size={16} />} onClick={onAdd}>
              {addLabel}
            </Button>
          )}
        </Group>
      </Box>

      <ScrollArea>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th
                  key={String(column.key)}
                  style={{ width: column.width, cursor: column.sortable ? 'pointer' : 'default' }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <Group gap="xs">
                    <Text fw={500}>{column.label}</Text>
                    {column.sortable && sortBy === column.key && (
                      <Text size="xs" c="dimmed">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </Text>
                    )}
                  </Group>
                </Table.Th>
              ))}
              {actions && actions.length > 0 && <Table.Th style={{ width: 80 }}>Actions</Table.Th>}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length + (actions ? 1 : 0)}>
                  <Text ta="center" py="xl" c="dimmed">
                    Loading...
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : sortedData.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length + (actions ? 1 : 0)}>
                  {emptyState || (
                    <Text ta="center" py="xl" c="dimmed">
                      No data found
                    </Text>
                  )}
                </Table.Td>
              </Table.Tr>
            ) : (
              sortedData.map((item) => (
                <Table.Tr key={String(item[rowKey])}>
                  {columns.map((column) => (
                    <Table.Td key={String(column.key)}>{getCellValue(item, column)}</Table.Td>
                  ))}
                  {actions && actions.length > 0 && (
                    <Table.Td>
                      <Menu position="bottom-end" shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <MoreVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          {actions.map((action, index) => {
                            if (action.hidden?.(item)) return null;

                            const Icon = action.icon || IconEye;

                            return (
                              <Menu.Item
                                key={index}
                                leftSection={<Icon size={16} />}
                                {...(action.color && { color: action.color })}
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
              ))
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}
