import { useState, useEffect, useCallback } from 'react';
import { Badge, Button, Popover, List, Typography, Empty, Space } from 'antd';
import { BellOutlined, UserAddOutlined, DollarOutlined, WarningOutlined } from '@ant-design/icons';
import { connectSocket, disconnectSocket } from '../lib/socket';
import { useAuth } from '../features/auth/hooks';

const { Text } = Typography;

interface Notification {
  id: string;
  type: 'newLead' | 'newPayment' | 'newProblem';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const typeIcons: Record<string, React.ReactNode> = {
  newLead: <UserAddOutlined style={{ color: '#3b82f6' }} />,
  newPayment: <DollarOutlined style={{ color: '#10b981' }} />,
  newProblem: <WarningOutlined style={{ color: '#ef4444' }} />,
};

const MAX_NOTIFICATIONS = 50;

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const { activeBranchId } = useAuth();

  const addNotification = useCallback((data: Omit<Notification, 'id' | 'read'>) => {
    const notification: Notification = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      read: false,
    };
    setNotifications((prev) => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));
  }, []);

  useEffect(() => {
    if (!activeBranchId) return;

    const socket = connectSocket(activeBranchId);

    const events = ['newLead', 'newPayment', 'newProblem'] as const;
    events.forEach((event) => {
      socket.on(event, (data: any) => {
        addNotification(data);
      });
    });

    return () => {
      events.forEach((event) => {
        socket.off(event);
      });
      disconnectSocket();
    };
  }, [activeBranchId, addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && unreadCount > 0) {
      // Mark as read when opening
      setTimeout(markAllRead, 1000);
    }
  };

  const formatTime = (ts: string) => {
    try {
      const date = new Date(ts);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'hozir';
      if (diffMin < 60) return `${diffMin} min oldin`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour} soat oldin`;
      return date.toLocaleDateString('uz-UZ');
    } catch {
      return '';
    }
  };

  const content = (
    <div style={{ width: 320, maxHeight: 400, overflow: 'auto' }}>
      {notifications.length > 0 ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0 8px', borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
            <Text strong style={{ fontSize: 14 }}>Bildirishnomalar</Text>
            {unreadCount > 0 && (
              <Button type="link" size="small" onClick={markAllRead} style={{ padding: 0, fontSize: 12 }}>
                Barchasini o'qish
              </Button>
            )}
          </div>
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '8px 4px',
                  background: item.read ? 'transparent' : 'rgba(99, 102, 241, 0.04)',
                  borderRadius: 8,
                }}
              >
                <List.Item.Meta
                  avatar={<div style={{ fontSize: 18, marginTop: 4 }}>{typeIcons[item.type]}</div>}
                  title={<Text style={{ fontSize: 13, fontWeight: item.read ? 400 : 600 }}>{item.title}</Text>}
                  description={
                    <Space direction="vertical" size={0}>
                      <Text style={{ fontSize: 12 }}>{item.message}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>{formatTime(item.timestamp)}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Bildirishnomalar yo'q"
          style={{ padding: '20px 0' }}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button type="text" icon={<BellOutlined />} style={{ color: '#475569', fontSize: 18 }} />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
