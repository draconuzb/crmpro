import React, { useEffect, useState, useCallback } from 'react';
import {
  Typography,
  Breadcrumb,
  Table,
  Tag,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  Popconfirm,
  message,
} from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import { getOrders, updateOrderStatus } from '../../features/gamification/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface OrderRecord {
  id: number;
  studentId: number;
  productId: number;
  productName: string;
  coinAmount: number;
  status: string;
  createdAt: string;
  student?: {
    user: { firstName: string; lastName: string };
  };
}

const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const fetchOrders = useCallback(
    async (page = 1, limit = 20) => {
      setLoading(true);
      try {
        const params: any = { page, limit };
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        if (dateRange) {
          params.startDate = dateRange[0];
          params.endDate = dateRange[1];
        }
        const body = await getOrders(params);
        setOrders(body.data ?? []);
        setPagination({
          current: body.meta?.page ?? page,
          pageSize: body.meta?.limit ?? limit,
          total: body.meta?.total ?? 0,
        });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter, dateRange],
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await updateOrderStatus(id, status);
      message.success(`Order ${status.toLowerCase()}`);
      fetchOrders(pagination.current, pagination.pageSize);
    } catch {
      message.error('Failed to update order');
    }
  };

  const statusColor: Record<string, string> = {
    PENDING: 'orange',
    COMPLETED: 'green',
    CANCELLED: 'red',
  };

  const columns: ColumnsType<OrderRecord> = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => new Date(val).toLocaleString(),
      width: 180,
    },
    {
      title: 'Student Name',
      key: 'student',
      render: (_: unknown, record: OrderRecord) =>
        record.student?.user
          ? `${record.student.user.firstName} ${record.student.user.lastName}`
          : '—',
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Coins Spent',
      dataIndex: 'coinAmount',
      key: 'coinAmount',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={statusColor[status] ?? 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_: unknown, record: OrderRecord) => {
        if (record.status !== 'PENDING') return '—';
        return (
          <Space>
            <Popconfirm
              title="Mark this order as completed?"
              onConfirm={() => handleStatusUpdate(record.id, 'COMPLETED')}
            >
              <Button type="primary" size="small" icon={<CheckOutlined />}>
                Complete
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Cancel this order and refund coins?"
              onConfirm={() => handleStatusUpdate(record.id, 'CANCELLED')}
            >
              <Button danger size="small" icon={<CloseOutlined />}>
                Cancel
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Gamification' }, { title: 'Orders' }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.orders')}</Title>

      <Space wrap style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search student..."
          allowClear
          style={{ width: 220 }}
          onSearch={(val) => setSearch(val)}
        />
        <Select
          placeholder="Status"
          allowClear
          style={{ width: 150 }}
          onChange={(val) => setStatusFilter(val)}
        >
          <Select.Option value="PENDING">Pending</Select.Option>
          <Select.Option value="COMPLETED">Completed</Select.Option>
          <Select.Option value="CANCELLED">Cancelled</Select.Option>
        </Select>
        <RangePicker
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              setDateRange([
                dayjs(dates[0]).format('YYYY-MM-DD'),
                dayjs(dates[1]).format('YYYY-MM-DD'),
              ]);
            } else {
              setDateRange(null);
            }
          }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => fetchOrders(page, pageSize),
        }}
      />
    </>
  );
};

export default OrdersPage;
