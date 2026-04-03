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
  Space,
  Statistic,
  message,
} from 'antd';
import { PlusOutlined, AccountBookOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { getExpenses, createExpense } from '../../features/finance/api';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const formatUZS = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(num);
};

const EXPENSE_CATEGORIES = ['RENT', 'UTILITIES', 'SUPPLIES', 'MARKETING', 'MAINTENANCE', 'FOOD', 'TRANSPORT', 'OTHER'];

const ExpensesPage: React.FC = () => {
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
      const result = await getExpenses({ ...filters, ...params, page: params.page || meta.page, limit: meta.limit });
      setData(result.data);
      setMeta(result.meta);
      setTotalAmount(result.totalAmount);
    } catch {
      message.error('Failed to load expenses');
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
      await createExpense({
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : undefined,
      });
      message.success('Expense created');
      setModalOpen(false);
      form.resetFields();
      fetchData({ page: 1 });
    } catch {
      message.error('Failed to create expense');
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
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: any) => <span style={{ fontWeight: 600, color: '#cf1322' }}>{formatUZS(v)}</span>,
      width: 180,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 140,
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Finance' }, { title: 'Expenses' }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.expenses')}</Title>

      {/* Stat */}
      <Card style={{ marginBottom: 24 }}>
        <Statistic
          title="Total Expenses"
          value={Number(totalAmount || 0)}
          formatter={(v) => formatUZS(v as number)}
          prefix={<AccountBookOutlined />}
          valueStyle={{ color: '#cf1322' }}
        />
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <RangePicker onChange={handleDateRange} />
          <Input.Search
            placeholder="Search title..."
            allowClear
            style={{ width: 200 }}
            onSearch={(v) => setFilters((prev: any) => ({ ...prev, search: v || undefined }))}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Add Expense
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
        title="Add Expense"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Expense title" />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select
              placeholder="Select category"
              options={EXPENSE_CATEGORIES.map((c) => ({ label: c, value: c }))}
            />
          </Form.Item>
          <Form.Item name="date" label="Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ExpensesPage;
