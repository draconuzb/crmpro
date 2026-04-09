import React, { useState } from 'react';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [form] = Form.useForm();

  const { data: paymentsResult, isLoading } = useQuery({
    queryKey: ['payments', filters, page, limit],
    queryFn: () => getPayments({ ...filters, page, limit }),
  });

  const data = paymentsResult?.data ?? [];
  const meta = paymentsResult?.meta ?? { total: 0, page: 1, limit: 20 };
  const totalAmount = paymentsResult?.totalAmount ?? 0;

  const { data: summary = { totalRevenue: 0, chartData: [] } } = useQuery({
    queryKey: ['paymentsSummary'],
    queryFn: getPaymentsSummary,
  });

  const { data: financeSummary = { netProfit: 0 } } = useQuery({
    queryKey: ['financeSummary'],
    queryFn: getFinanceSummary,
  });

  const { data: studentsResult } = useQuery({
    queryKey: ['students', studentSearch],
    queryFn: () => getStudents({ search: studentSearch, limit: 20 }),
    enabled: studentSearch.length >= 2,
  });
  const students = studentsResult?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (values: any) =>
      createPayment({
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : undefined,
      }),
    onSuccess: () => {
      message.success(t('finance.paymentCreated'));
      setModalOpen(false);
      form.resetFields();
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['paymentsSummary'] });
      queryClient.invalidateQueries({ queryKey: ['financeSummary'] });
    },
    onError: () => {
      message.error(t('finance.paymentFailed'));
    },
  });

  const handleCreate = (values: any) => {
    createMutation.mutate(values);
  };

  const updateFilters = (updater: (prev: any) => any) => {
    setFilters(updater);
    setPage(1);
  };

  const handleDateRange = (dates: any) => {
    if (dates) {
      updateFilters((prev: any) => ({
        ...prev,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      }));
    } else {
      updateFilters((prev: any) => {
        const { startDate, endDate, ...rest } = prev;
        return rest;
      });
    }
  };

  const columns = [
    {
      title: t('common.date'),
      dataIndex: 'date',
      key: 'date',
      render: (d: string) => dayjs(d).format('DD.MM.YYYY'),
      width: 120,
    },
    {
      title: t('finance.student'),
      key: 'student',
      render: (_: any, r: any) =>
        r.student?.user
          ? `${r.student.user.firstName} ${r.student.user.lastName}`
          : '—',
    },
    {
      title: t('common.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (v: any) => <span style={{ fontWeight: 600, color: '#52c41a' }}>{formatUZS(v)}</span>,
      width: 180,
    },
    {
      title: t('finance.method'),
      dataIndex: 'method',
      key: 'method',
      render: (v: string) => {
        const colors: Record<string, string> = { CASH: 'green', CARD: 'blue', TRANSFER: 'orange' };
        return <Tag color={colors[v] || 'default'}>{v}</Tag>;
      },
      width: 110,
    },
    {
      title: t('common.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: t('finance.createdBy'),
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
        items={[{ title: t('sidebar.finance') }, { title: t('finance.payment') }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.payments')}</Title>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title={t('finance.totalRevenue')}
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
              title={t('finance.netProfit')}
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
        <Card title={t('finance.monthlyRevenue')} style={{ marginBottom: 24 }}>
          <Line {...chartConfig} />
        </Card>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <RangePicker onChange={handleDateRange} />
          <Input.Search
            placeholder={t('finance.searchStudent')}
            allowClear
            style={{ width: 200 }}
            onSearch={(v) => updateFilters((prev: any) => ({ ...prev, search: v || undefined }))}
          />
          <Select
            placeholder={t('finance.paymentMethod')}
            allowClear
            style={{ width: 150 }}
            onChange={(v) => updateFilters((prev: any) => ({ ...prev, method: v || undefined }))}
            options={[
              { label: t('finance.cash'), value: 'CASH' },
              { label: t('finance.card'), value: 'CARD' },
              { label: t('finance.transfer'), value: 'TRANSFER' },
            ]}
          />
          <InputNumber
            placeholder={t('finance.minAmount')}
            style={{ width: 130 }}
            onChange={(v) => updateFilters((prev: any) => ({ ...prev, minAmount: v || undefined }))}
          />
          <InputNumber
            placeholder={t('finance.maxAmount')}
            style={{ width: 130 }}
            onChange={(v) => updateFilters((prev: any) => ({ ...prev, maxAmount: v || undefined }))}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            {t('finance.addPayment')}
          </Button>
        </Space>
      </Card>

      {/* Filtered total */}
      {totalAmount > 0 && (
        <div style={{ marginBottom: 12, fontWeight: 500 }}>
          {t('finance.filteredTotal')}: {formatUZS(totalAmount)}
        </div>
      )}

      {/* Table */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={{
          current: meta.page,
          pageSize: meta.limit,
          total: meta.total,
          showSizeChanger: true,
          onChange: (p, pageSize) => {
            setPage(p);
            setLimit(pageSize);
          },
        }}
      />

      {/* Modal */}
      <Modal
        title={t('finance.addPayment')}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="studentId" label={t('finance.student')} rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder={t('finance.searchStudent')}
              filterOption={false}
              onSearch={setStudentSearch}
              options={students.map((s: any) => ({
                value: s.id,
                label: `${s.user?.firstName || ''} ${s.user?.lastName || ''} (${s.user?.phone || ''})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="amount" label={t('common.amount')} rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
          </Form.Item>
          <Form.Item name="method" label={t('finance.paymentMethod')} rules={[{ required: true }]} initialValue="CASH">
            <Radio.Group>
              <Radio.Button value="CASH">{t('finance.cash')}</Radio.Button>
              <Radio.Button value="CARD">{t('finance.card')}</Radio.Button>
              <Radio.Button value="TRANSFER">{t('finance.transfer')}</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="description" label={t('common.description')}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="date" label={t('common.date')}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PaymentsPage;
