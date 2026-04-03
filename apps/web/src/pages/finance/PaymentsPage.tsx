import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Breadcrumb,
  Card,
  Row,
  Col,
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
import { PlusOutlined, DollarOutlined, RiseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Line } from '@ant-design/charts';
import dayjs from 'dayjs';
import {
  getPayments,
  createPayment,
  getPaymentsSummary,
  getFinanceSummary,
} from '../../features/finance/api';
import { getStudents } from '../../features/students/api';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const formatUZS = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(num);
};

const PaymentsPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0, page: 1, limit: 20 });
  const [totalAmount, setTotalAmount] = useState(0);
  const [summary, setSummary] = useState<any>({ totalRevenue: 0, chartData: [] });
  const [financeSummary, setFinanceSummary] = useState<any>({ netProfit: 0 });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [form] = Form.useForm();

  const fetchData = useCallback(async (params: any = {}) => {
    setLoading(true);
    try {
      const result = await getPayments({ ...filters, ...params, page: params.page || meta.page, limit: meta.limit });
      setData(result.data);
      setMeta(result.meta);
      setTotalAmount(result.totalAmount);
    } catch {
      message.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [filters, meta.page, meta.limit]);

  const fetchSummary = useCallback(async () => {
    try {
      const [paymentSummary, finSummary] = await Promise.all([
        getPaymentsSummary(),
        getFinanceSummary(),
      ]);
      setSummary(paymentSummary);
      setFinanceSummary(finSummary);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchData({ page: 1 });
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchSummary();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (studentSearch.length >= 2) {
      getStudents({ search: studentSearch, limit: 20 }).then((res: any) => {
        setStudents(res.data || []);
      });
    }
  }, [studentSearch]);

  const handleCreate = async (values: any) => {
    setSubmitting(true);
    try {
      await createPayment({
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : undefined,
      });
      message.success('Payment created');
      setModalOpen(false);
      form.resetFields();
      fetchData({ page: 1 });
      fetchSummary();
    } catch {
      message.error('Failed to create payment');
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
      title: 'Student',
      key: 'student',
      render: (_: any, r: any) =>
        r.student?.user
          ? `${r.student.user.firstName} ${r.student.user.lastName}`
          : '—',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: any) => <span style={{ fontWeight: 600, color: '#52c41a' }}>{formatUZS(v)}</span>,
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Created By',
      dataIndex: 'createdById',
      key: 'createdById',
      width: 100,
    },
  ];

  const chartConfig = {
    data: summary.chartData?.map((d: any) => ({ month: d.month, value: d.amount })) || [],
    xField: 'month',
    yField: 'value',
    smooth: true,
    height: 250,
    point: { size: 3 },
    color: '#1890ff',
  };

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Finance' }, { title: 'Payments' }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.payments')}</Title>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={Number(summary.totalRevenue || 0)}
              formatter={(v) => formatUZS(v as number)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Net Profit"
              value={Number(financeSummary.netProfit || 0)}
              formatter={(v) => formatUZS(v as number)}
              prefix={<RiseOutlined />}
              valueStyle={{ color: financeSummary.netProfit >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Chart */}
      {summary.chartData?.length > 0 && (
        <Card title="Monthly Revenue" style={{ marginBottom: 24 }}>
          <Line {...chartConfig} />
        </Card>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <RangePicker onChange={handleDateRange} />
          <Input.Search
            placeholder="Search student..."
            allowClear
            style={{ width: 200 }}
            onSearch={(v) => setFilters((prev: any) => ({ ...prev, search: v || undefined }))}
          />
          <Select
            placeholder="Payment Method"
            allowClear
            style={{ width: 150 }}
            onChange={(v) => setFilters((prev: any) => ({ ...prev, method: v || undefined }))}
            options={[
              { label: 'Cash', value: 'CASH' },
              { label: 'Card', value: 'CARD' },
              { label: 'Transfer', value: 'TRANSFER' },
            ]}
          />
          <InputNumber
            placeholder="Min amount"
            style={{ width: 130 }}
            onChange={(v) => setFilters((prev: any) => ({ ...prev, minAmount: v || undefined }))}
          />
          <InputNumber
            placeholder="Max amount"
            style={{ width: 130 }}
            onChange={(v) => setFilters((prev: any) => ({ ...prev, maxAmount: v || undefined }))}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Add Payment
          </Button>
        </Space>
      </Card>

      {/* Filtered total */}
      {totalAmount > 0 && (
        <div style={{ marginBottom: 12, fontWeight: 500 }}>
          Filtered Total: {formatUZS(totalAmount)}
        </div>
      )}

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
        title="Add Payment"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="studentId" label="Student" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Search student..."
              filterOption={false}
              onSearch={setStudentSearch}
              options={students.map((s: any) => ({
                value: s.id,
                label: `${s.user?.firstName || ''} ${s.user?.lastName || ''} (${s.user?.phone || ''})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
          </Form.Item>
          <Form.Item name="method" label="Payment Method" rules={[{ required: true }]} initialValue="CASH">
            <Radio.Group>
              <Radio.Button value="CASH">Cash</Radio.Button>
              <Radio.Button value="CARD">Card</Radio.Button>
              <Radio.Button value="TRANSFER">Transfer</Radio.Button>
            </Radio.Group>
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

export default PaymentsPage;
