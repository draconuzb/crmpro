import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Typography, Card, Table, Button, Modal, Form, InputNumber, Input, Select,
  DatePicker, Space, Statistic, Row, Col, Tag, Tabs, message,
} from 'antd';
import { PlusOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { getExpenses, createExpense, getWithdrawals, createWithdrawal } from '@/features/finance/api';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const formatUZS = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(num);
};

type ChiqimTab = 'all' | 'expenses' | 'withdrawals' | 'salary';

const ChiqimPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ChiqimTab>('all');
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'withdrawal'>('expense');
  const [form] = Form.useForm();

  const EXPENSE_CATEGORIES = [
    { value: 'RENT', label: t('finance.rent') },
    { value: 'UTILITIES', label: t('finance.utilities') },
    { value: 'SUPPLIES', label: t('finance.supplies') },
    { value: 'MARKETING', label: t('finance.marketing') },
    { value: 'MAINTENANCE', label: t('finance.maintenance') },
    { value: 'FOOD', label: t('finance.food') },
    { value: 'TRANSPORT', label: t('finance.transport') },
    { value: 'SALARY', label: t('finance.salaries') },
    { value: 'OTHER', label: t('finance.other') },
  ];

  const dateParams = dateRange ? {
    startDate: dateRange[0].format('YYYY-MM-DD'),
    endDate: dateRange[1].format('YYYY-MM-DD'),
  } : {};

  // Fetch expenses
  const { data: expensesData, isLoading: expLoading } = useQuery({
    queryKey: ['expenses', dateParams, search, page],
    queryFn: () => getExpenses({ ...dateParams, search: search || undefined, page, limit: 50 }),
    enabled: activeTab === 'all' || activeTab === 'expenses' || activeTab === 'salary',
  });

  // Fetch withdrawals
  const { data: withdrawalsData, isLoading: witLoading } = useQuery({
    queryKey: ['withdrawals', dateParams, search, page],
    queryFn: () => getWithdrawals({ ...dateParams, search: search || undefined, page, limit: 50 }),
    enabled: activeTab === 'all' || activeTab === 'withdrawals',
  });

  // Create mutations
  const createExpenseMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      message.success(t('finance.expenseCreated'));
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setModalOpen(false);
      form.resetFields();
    },
    onError: () => message.error(t('common.error')),
  });

  const createWithdrawalMutation = useMutation({
    mutationFn: createWithdrawal,
    onSuccess: () => {
      message.success(t('finance.withdrawalCreated'));
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      setModalOpen(false);
      form.resetFields();
    },
    onError: () => message.error(t('common.error')),
  });

  // Combine data for "all" tab
  const buildUnifiedData = () => {
    const expenses = (expensesData?.data || []).map((e: any) => ({
      ...e,
      _source: 'expense',
      _sourceLabel: t('finance.expense'),
      _title: e.title,
      _amount: Number(e.amount),
      _date: e.date,
      _category: e.category,
    }));

    const withdrawals = (withdrawalsData?.data || []).map((w: any) => ({
      ...w,
      _source: 'withdrawal',
      _sourceLabel: t('finance.addWithdrawal'),
      _title: w.description || t('finance.addWithdrawal'),
      _amount: Number(w.amount),
      _date: w.date,
      _category: w.category || 'WITHDRAWAL',
    }));

    let combined = [...expenses, ...withdrawals];

    // Category filter
    if (categoryFilter) {
      if (categoryFilter === 'SALARY') {
        combined = combined.filter(r => r._category === 'SALARY' || (r._source === 'withdrawal' && r._title?.includes('Salary')));
      } else {
        combined = combined.filter(r => r._category === categoryFilter);
      }
    }

    // Sort by date desc
    combined.sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime());

    return combined;
  };

  const getTabData = () => {
    if (activeTab === 'expenses') return (expensesData?.data || []).map((e: any) => ({ ...e, _source: 'expense', _sourceLabel: t('finance.expense'), _title: e.title, _amount: Number(e.amount), _date: e.date, _category: e.category }));
    if (activeTab === 'withdrawals') return (withdrawalsData?.data || []).map((w: any) => ({ ...w, _source: 'withdrawal', _sourceLabel: t('finance.addWithdrawal'), _title: w.description || t('finance.addWithdrawal'), _amount: Number(w.amount), _date: w.date, _category: w.category }));
    if (activeTab === 'salary') return (expensesData?.data || []).filter((e: any) => e.category === 'SALARY' || (withdrawalsData?.data || []).some((w: any) => w.description?.includes('Salary'))).map((e: any) => ({ ...e, _source: 'expense', _sourceLabel: t('finance.salary'), _title: e.title, _amount: Number(e.amount), _date: e.date, _category: 'SALARY' }));
    return buildUnifiedData();
  };

  const tableData = getTabData();
  const isLoading = expLoading || witLoading;

  // Totals
  const totalExpenses = Number(expensesData?.totalAmount || 0);
  const totalWithdrawals = Number(withdrawalsData?.totalAmount || 0);
  const grandTotal = totalExpenses + totalWithdrawals;

  const columns = [
    {
      title: t('common.date'),
      dataIndex: '_date',
      key: 'date',
      width: 110,
      render: (d: string) => dayjs(d).format('DD.MM.YYYY'),
    },
    {
      title: t('common.name'),
      dataIndex: '_title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: t('common.amount'),
      dataIndex: '_amount',
      key: 'amount',
      width: 160,
      render: (v: number) => (
        <span style={{ fontWeight: 600, color: '#ef4444' }}>
          -{formatUZS(v)} so'm
        </span>
      ),
    },
    {
      title: t('common.type'),
      dataIndex: '_category',
      key: 'category',
      width: 130,
      render: (cat: string) => {
        const found = EXPENSE_CATEGORIES.find(c => c.value === cat);
        return <Tag>{found?.label || cat || '—'}</Tag>;
      },
    },
    {
      title: t('finance.source'),
      dataIndex: '_sourceLabel',
      key: 'source',
      width: 110,
      render: (s: string) => (
        <Tag color={s === t('finance.expense') ? 'red' : s === t('finance.salary') ? 'purple' : 'orange'}>{s}</Tag>
      ),
    },
  ];

  const handleCreate = (values: any) => {
    const payload = {
      ...values,
      date: values.date?.format('YYYY-MM-DD'),
    };

    if (modalType === 'expense') {
      createExpenseMutation.mutate(payload);
    } else {
      createWithdrawalMutation.mutate({
        amount: values.amount,
        method: values.method || 'CASH',
        description: values.title,
        category: values.category,
        date: payload.date,
      });
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20 }}>{t('finance.expense')}</Title>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title={t('finance.totalExpense')}
              value={grandTotal}
              formatter={(v) => `${formatUZS(v as number)} so'm`}
              valueStyle={{ color: '#ef4444' }}
              prefix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title={t('finance.totalExpenses')}
              value={totalExpenses}
              formatter={(v) => `${formatUZS(v as number)} so'm`}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title={t('finance.withdrawals')}
              value={totalWithdrawals}
              formatter={(v) => `${formatUZS(v as number)} so'm`}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap size={12}>
          <Input.Search
            placeholder={t('common.searchPlaceholder')}
            allowClear
            style={{ width: 200 }}
            onSearch={(v) => { setSearch(v); setPage(1); }}
          />
          <Select
            placeholder={t('common.category')}
            value={categoryFilter}
            onChange={(v) => { setCategoryFilter(v); setPage(1); }}
            style={{ width: 160 }}
            allowClear
            options={EXPENSE_CATEGORIES}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => { setDateRange(dates as any); setPage(1); }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setModalType('expense'); setModalOpen(true); }}>
            + {t('finance.expense')}
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => { setModalType('withdrawal'); setModalOpen(true); }}>
            + {t('finance.addWithdrawal')}
          </Button>
        </Space>
      </Card>

      {/* Tabs + Table */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => { setActiveTab(key as ChiqimTab); setPage(1); }}
          items={[
            { key: 'all', label: t('finance.allTab') },
            { key: 'expenses', label: t('finance.expensesTab') },
            { key: 'withdrawals', label: t('finance.withdrawalsTab') },
            { key: 'salary', label: t('finance.salariesTab') },
          ]}
        />
        <Table
          dataSource={tableData}
          columns={columns}
          rowKey={(r: any) => `${r._source}-${r.id}`}
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: 20,
            total: tableData.length,
            onChange: setPage,
            showTotal: (total) => `${t('common.total')}: ${total}`,
          }}
          size="small"
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title={modalType === 'expense' ? t('finance.addExpense') : t('finance.addWithdrawal')}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={createExpenseMutation.isPending || createWithdrawalMutation.isPending}
        okText={t('common.add')}
        cancelText={t('common.cancel')}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label={t('common.name')} rules={[{ required: true, message: t('common.required') }]}>
            <Input placeholder={`${t('finance.expenseName')}...`} />
          </Form.Item>
          <Form.Item name="amount" label={t('common.amount')} rules={[{ required: true, message: t('common.required') }]}>
            <InputNumber style={{ width: '100%' }} min={1} placeholder="0" />
          </Form.Item>
          <Form.Item name="category" label={t('common.category')} rules={[{ required: true, message: t('common.selectOption') }]}>
            <Select placeholder={t('finance.selectCategory')} options={EXPENSE_CATEGORIES} />
          </Form.Item>
          {modalType === 'withdrawal' && (
            <Form.Item name="method" label={t('finance.method')} initialValue="CASH">
              <Select options={[
                { value: 'CASH', label: t('finance.cash') },
                { value: 'CARD', label: t('finance.card') },
                { value: 'TRANSFER', label: t('finance.transfer') },
              ]} />
            </Form.Item>
          )}
          <Form.Item name="date" label={t('common.date')}>
            <DatePicker style={{ width: '100%' }} defaultValue={dayjs()} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChiqimPage;
