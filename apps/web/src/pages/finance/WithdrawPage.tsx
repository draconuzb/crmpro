import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Breadcrumb,
  Card,
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  Select,
  DatePicker,
  Radio,
  Space,
  Statistic,
  Tag,
  message,
} from 'antd';
import { PlusOutlined, WalletOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { getWithdrawals, createWithdrawal } from '../../features/finance/api';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const formatUZS = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(num);
};

const CATEGORIES = ['SALARY', 'RENT', 'UTILITIES', 'SUPPLIES', 'MARKETING', 'OTHER'];

const WithdrawPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0, page: 1, limit: 20 });
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [form] = Form.useForm();

  const fetchData = useCallback(async (params: any = {}) => {
    setLoading(true);
    try {
      const result = await getWithdrawals({ ...filters, ...params, page: params.page || meta.page, limit: meta.limit });
      setData(result.data);
      setMeta(result.meta);
      setTotalAmount(result.totalAmount);
    } catch {
      message.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  }, [filters, meta.page, meta.limit]);

  useEffect(() => {
    fetchData({ page: 1 });
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (values: any) => {
    setSubmitting(true);
    try {
      await createWithdrawal({
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : undefined,
      });
      message.success('Withdrawal created');
      setModalOpen(false);
      form.resetFields();
      fetchData({ page: 1 });
    } catch {
      message.error('Failed to create withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateRange = (dates: any) => {
    if (dates) {
      setFilters((prev: any) => ({
        ...prev,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      }));
    } else {
      setFilters((prev: any) => {
        const { startDate, endDate, ...rest } = prev;
        return rest;
      });
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (d: string) => dayjs(d).format('DD.MM.YYYY'),
      width: 120,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: any) => <span style={{ fontWeight: 600, color: '#cf1322' }}>{formatUZS(v)}</span>,
      width: 180,
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (v: string) => {
        const colors: Record<string, string> = { CASH: 'green', CARD: 'blue', TRANSFER: 'orange' };
        return <Tag color={colors[v] || 'default'}>{v}</Tag>;
      },
      width: 110,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (v: string) => v || '—',
      width: 130,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Finance' }, { title: 'Withdrawals' }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.withdraw')}</Title>

      {/* Stat */}
      <Card style={{ marginBottom: 24 }}>
        <Statistic
          title="Total Withdrawals"
          value={Number(totalAmount || 0)}
          formatter={(v) => formatUZS(v as number)}
          prefix={<WalletOutlined />}
          valueStyle={{ color: '#cf1322' }}
        />
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <RangePicker onChange={handleDateRange} />
          <Select
            placeholder="Method"
            allowClear
            style={{ width: 150 }}
            onChange={(v) => setFilters((prev: any) => ({ ...prev, method: v || undefined }))}
            options={[
              { label: 'Cash', value: 'CASH' },
              { label: 'Card', value: 'CARD' },
              { label: 'Transfer', value: 'TRANSFER' },
            ]}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Add Withdrawal
          </Button>
        </Space>
      </Card>

      {/* Table */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: meta.page,
          pageSize: meta.limit,
          total: meta.total,
          showSizeChanger: true,
          onChange: (page, pageSize) => {
            setMeta((prev: any) => ({ ...prev, page, limit: pageSize }));
            fetchData({ page, limit: pageSize });
          },
        }}
      />

      {/* Modal */}
      <Modal
        title="Add Withdrawal"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
          </Form.Item>
          <Form.Item name="method" label="Method" rules={[{ required: true }]} initialValue="CASH">
            <Radio.Group>
              <Radio.Button value="CASH">Cash</Radio.Button>
              <Radio.Button value="CARD">Card</Radio.Button>
              <Radio.Button value="TRANSFER">Transfer</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Select
              placeholder="Select category"
              allowClear
              options={CATEGORIES.map((c) => ({ label: c, value: c }))}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="date" label="Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default WithdrawPage;
