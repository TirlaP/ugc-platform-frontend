/**
 * Messages page - Modern communication center
 */

import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Indicator,
  Loader,
  Menu,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  Briefcase,
  Check,
  Clock,
  MoreVertical,
  Edit,
  FileText,
  Filter,
  MessageCircle,
  Paperclip,
  Image,
  Search,
  Send,
  Trash2,
  User,
  Video
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { messageService } from '@/services/message.service';

export function MessagesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch campaigns with messages
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns-with-messages'],
    queryFn: () => messageService.getCampaignsWithMessages(),
  });

  // Fetch messages for selected campaign
  const { data: messages } = useQuery({
    queryKey: ['messages', selectedCampaign],
    queryFn: () => messageService.getMessages(selectedCampaign!),
    enabled: Boolean(selectedCampaign),
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: { content: string; campaignId: string }) => messageService.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedCampaign] });
      queryClient.invalidateQueries({ queryKey: ['campaigns-with-messages'] });
      setNewMessage('');
      scrollToBottom();
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to send message',
        color: 'red',
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedCampaign) return;

    sendMessageMutation.mutate({
      content: newMessage.trim(),
      campaignId: selectedCampaign,
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredCampaigns = campaigns?.filter(
    (campaign: any) =>
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.client?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMessageTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'CLIENT':
        return <Briefcase size={14} />;
      case 'CREATOR':
        return <Video size={14} />;
      case 'ADMIN':
        return <User size={14} />;
      default:
        return <User size={14} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'CLIENT':
        return 'blue';
      case 'CREATOR':
        return 'green';
      case 'ADMIN':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (isLoading) {
    return (
      <Container size="xl">
        <Stack align="center" justify="center" h={400}>
          <Loader size="lg" />
          <Text c="dimmed">Loading conversations...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Messages</Title>
            <Text c="dimmed" size="sm">
              Communicate with your team and clients
            </Text>
          </div>
          <Button leftSection={<Filter size={16} />} variant="subtle">
            Filter
          </Button>
        </Group>

        <div style={{ display: 'flex', height: 'calc(100vh - 200px)', gap: '1rem' }}>
          {/* Campaign List */}
          <Paper w={350} shadow="xs" radius="md" withBorder>
            <Stack gap={0} h="100%">
              <Box p="md" pb="sm">
                <TextInput
                  placeholder="Search conversations..."
                  leftSection={<Search size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  mb="sm"
                />
              </Box>
              <Divider />
              <ScrollArea style={{ flex: 1 }}>
                <Stack gap={0}>
                  {filteredCampaigns?.map((campaign: any) => {
                    const isSelected = selectedCampaign === campaign.id;
                    const hasUnread = campaign._count?.messages > 0;

                    return (
                      <Box
                        key={campaign.id}
                        p="md"
                        style={{
                          cursor: 'pointer',
                          backgroundColor: isSelected
                            ? 'var(--mantine-color-gray-0)'
                            : 'transparent',
                          borderLeft: isSelected
                            ? '3px solid var(--mantine-color-blue-6)'
                            : '3px solid transparent',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => setSelectedCampaign(campaign.id)}
                      >
                        <Group justify="space-between" align="flex-start">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Group gap="xs" mb={4}>
                              <Text size="sm" fw={600} truncate>
                                {campaign.title}
                              </Text>
                              {hasUnread && <Indicator color="blue" size={8} processing />}
                            </Group>
                            <Text size="xs" c="dimmed" truncate>
                              {campaign.client?.name || 'No client'}
                            </Text>
                            <Group gap="xs" mt={4}>
                              <Badge size="xs" variant="light" color="gray">
                                {campaign._count?.messages || 0} messages
                              </Badge>
                              {campaign.status && (
                                <Badge size="xs" variant="light">
                                  {campaign.status}
                                </Badge>
                              )}
                            </Group>
                          </div>
                          <Menu position="bottom-end" withArrow>
                            <Menu.Target>
                              <ActionIcon
                                variant="subtle"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item leftSection={<Edit size={14} />}>
                                Edit campaign
                              </Menu.Item>
                              <Menu.Item leftSection={<Trash2 size={14} />} color="red">
                                Delete conversation
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Box>
                    );
                  })}
                </Stack>
              </ScrollArea>
            </Stack>
          </Paper>

          {/* Messages */}
          <Paper style={{ flex: 1 }} shadow="xs" radius="md" withBorder>
            {selectedCampaign ? (
              <Stack h="100%" gap={0}>
                {/* Chat Header */}
                <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                  <Group justify="space-between">
                    <div>
                      <Text fw={600}>
                        {campaigns?.find((c: any) => c.id === selectedCampaign)?.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {campaigns?.find((c: any) => c.id === selectedCampaign)?.client?.name}
                      </Text>
                    </div>
                    <Group gap="xs">
                      <Tooltip label="Attach files">
                        <ActionIcon variant="subtle">
                          <Paperclip size={20} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Campaign info">
                        <ActionIcon variant="subtle">
                          <MoreVertical size={20} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                </Box>

                {/* Messages List */}
                <ScrollArea style={{ flex: 1 }} p="md">
                  <Stack gap="md">
                    {messages?.map((message: any, index: number) => {
                      const isOwn = message.sender.id === user?.id;
                      const showAvatar =
                        index === 0 || messages[index - 1]?.sender.id !== message.sender.id;

                      return (
                        <div
                          key={message.id}
                          style={{
                            display: 'flex',
                            justifyContent: isOwn ? 'flex-end' : 'flex-start',
                            marginBottom: showAvatar ? 0 : -8,
                          }}
                        >
                          <Group align="flex-end" gap="sm" style={{ maxWidth: '70%' }}>
                            {!isOwn &&
                              (showAvatar ? (
                                <Tooltip label={message.sender.name}>
                                  <Avatar
                                    src={message.sender.image}
                                    alt={message.sender.name}
                                    size="sm"
                                    radius="xl"
                                  >
                                    {message.sender.name?.charAt(0).toUpperCase()}
                                  </Avatar>
                                </Tooltip>
                              ) : (
                                <div style={{ width: 32 }} />
                              ))}
                            <div>
                              {showAvatar && !isOwn && (
                                <Group gap={6} mb={4}>
                                  <Text size="xs" fw={500}>
                                    {message.sender.name}
                                  </Text>
                                  <Badge
                                    size="xs"
                                    variant="light"
                                    color={getRoleColor(message.sender.role)}
                                    leftSection={getRoleIcon(message.sender.role)}
                                  >
                                    {message.sender.role}
                                  </Badge>
                                </Group>
                              )}
                              <Paper
                                p="sm"
                                radius="md"
                                withBorder={!isOwn}
                                style={{
                                  backgroundColor: isOwn
                                    ? 'var(--mantine-color-blue-6)'
                                    : 'var(--mantine-color-gray-0)',
                                  color: isOwn ? 'white' : 'inherit',
                                  borderTopRightRadius: isOwn && !showAvatar ? 4 : undefined,
                                  borderTopLeftRadius: !isOwn && !showAvatar ? 4 : undefined,
                                }}
                              >
                                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                                  {message.content}
                                </Text>
                                {message.attachments && message.attachments.length > 0 && (
                                  <Group gap="xs" mt="xs">
                                    {message.attachments.map((attachment: any, i: number) => (
                                      <Badge
                                        key={i}
                                        size="sm"
                                        variant={isOwn ? 'white' : 'light'}
                                        leftSection={
                                          attachment.type.includes('image') ? (
                                            <Image size={12} />
                                          ) : attachment.type.includes('video') ? (
                                            <Video size={12} />
                                          ) : (
                                            <FileText size={12} />
                                          )
                                        }
                                      >
                                        {attachment.filename}
                                      </Badge>
                                    ))}
                                  </Group>
                                )}
                                <Group gap={4} mt={4}>
                                  <Text size="xs" opacity={0.7}>
                                    {getMessageTime(message.createdAt)}
                                  </Text>
                                  {isOwn && <Check size={12} style={{ opacity: 0.7 }} />}
                                  {message.editedAt && (
                                    <Text size="xs" opacity={0.7}>
                                      (edited)
                                    </Text>
                                  )}
                                </Group>
                              </Paper>
                            </div>
                          </Group>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </Stack>
                </ScrollArea>

                {/* Message Input */}
                <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
                  <Group align="flex-end" gap="sm">
                    <Tooltip label="Attach file">
                      <ActionIcon variant="subtle" size="lg">
                        <Paperclip size={20} />
                      </ActionIcon>
                    </Tooltip>
                    <Textarea
                      ref={textareaRef}
                      style={{ flex: 1 }}
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.currentTarget.value)}
                      onKeyDown={handleKeyDown}
                      minRows={1}
                      maxRows={4}
                      autosize
                    />
                    <Tooltip label="Send message">
                      <ActionIcon
                        variant="filled"
                        size="lg"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        loading={sendMessageMutation.isPending}
                      >
                        <Send size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                  <Text size="xs" c="dimmed" mt="xs">
                    Press Enter to send, Shift+Enter for new line
                  </Text>
                </Box>
              </Stack>
            ) : (
              <Stack align="center" justify="center" h="100%" gap="xl">
                <MessageCircle size={64} stroke={1.5} color="var(--mantine-color-gray-4)" />
                <div style={{ textAlign: 'center' }}>
                  <Text size="lg" fw={500} mb={4}>
                    Select a conversation
                  </Text>
                  <Text c="dimmed" size="sm">
                    Choose a campaign from the left to start messaging
                  </Text>
                </div>
              </Stack>
            )}
          </Paper>
        </div>
      </Stack>
    </Container>
  );
}
