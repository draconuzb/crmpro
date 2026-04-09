import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Breadcrumb,
  Table,
  Card,
  Input,
  InputNumber,
  Space,
  Tag,
  Badge,
  Button,
  Tooltip,
  message,
} from 'antd';
import {
  PhoneOutlined,
  MessageOutlined,
  BellOutlined,
  FileTextOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getDebtors } from '../../features/finance/api';

const { Title } = Typography;

const formatUZS = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(num);
};

const DebtorsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<any>({});

  const fetchData = useCallback(async (params: any = {}) => {
    setLoading(true);
    try {
      const result = await getDebtors({ ...filters, ...params, page: params.page || meta.page, limit: meta.limit });
      setData(result.data);
      setMeta(result.meta);
    } catch {
      message.error(t('debtors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [filters, meta.page, meta.limit, t]);

  useEffect(() => {
    fetchData({ page: 1 });
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns = [
    {
      title: t('common.name'),
      dataIndex: 'studentName',
      key: 'studentName',
      render: (v: string, r: any) => (
        <a onClick={() => navigate(`/students/${r.id}`)}>{v}</a>
      ),
    },
    {
      title: t('common.phone'),
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: t('finance.balance'),
      dataIndex: 'balance',
      key: 'balance',
      render: (v: any) => (
        <span style={{ fontWeight: 700, color: '#cf1322' }}>{formatUZS(v)}</span>
      ),
      width: 180,
      sorter: true,
    },
    {
      title: t('debtors.groups'),
      dataIndex: 'groups',
      key: 'groups',
      render: (groups: any[]) =>
        groups?.map((g) => (
          <Tag key={g.id}>{g.name}</Tag>
        )) || '—',
    },
    {
      title: t('debtors.lastPayment'),
      dataIndex: 'lastPaymentDate',
      key: 'lastPaymentDate',
      render: (d: string | null) => (d ? dayjs(d).format('DD.MM.YYYY') : '—'),
      width: 130,
    },
    {
      title: t('common.status'),
      key: 'status',
      width: 100,
      render: (_: any, r: any) => {
        const bal = Number(r.balance);
        if (bal <= -500000) return <Badge status="error" text={t('debtors.critical')} />;
        if (bal <= -100000) return <Badge status="warning" text={t('debtors.warning')} />;
        return <Badge status="default" text={t('debtors.minor')} />;
      },
    },
    {
      title: t('common.note'),
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      width: 150,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 200,
      render: (_: any, r: any) => (
        <Space size={4} onClick={(e) => e.stopPropagation()}>
          <Tooltip title={t('debtors.call')}>
            <Button
              type="text"
              size="small"
              icon={<PhoneOutlined />}
              href={`tel:${r.phone}`}
            />
          </Tooltip>
          <Tooltip title={t('debtors.sendSms')}>
            <Button
              type="text"
              size="small"
              icon={<MessageOutlined />}
              onClick={() => message.info(t('debtors.smsSoon'))}
            />
          </Tooltip>
          <Tooltip title={t('debtors.addReminder')}>
            <Button
              type="text"
              size="small"
              icon={<BellOutlined />}
              onClick={() => message.info(t('debtors.reminderSoon'))}
            />
          </Tooltip>
          <Tooltip title={t('debtors.addNote')}>
            <Button
              type="text"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => message.info(t('debtors.noteSoon'))}
            />
          </Tooltip>
          <Tooltip title={t('debtors.markAsLeft')}>
            <Button
              type="text"
              size="small"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => message.info(t('debtors.rejectSoon'))}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: t('sidebar.finance') }, { title: t('finance.debtors') }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.debtors')}</Title>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input.Search
            placeholder={t('debtors.searchPlaceholder')}
            allowClear
            style={{ width: 220 }}
            onSearch={(v) => setFilters((prev: any) => ({ ...prev, search: v || undefined }))}
          />
          <InputNumber
            placeholder={t('debtors.minDebt')}
            style={{ width: 130 }}
            min={0}
            onChange={(v) => setFilters((prev: any) => ({ ...prev, minAmount: v || undefined }))}
          />
          <InputNumber
            placeholder={t('debtors.maxDebt')}
            style={{ width: 130 }}
            min={0}
            onChange={(v) => setFilters((prev: any) => ({ ...prev, maxAmount: v || undefined }))}
          />
        </Space>
      </Card>

      {/* Table */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        onRow={(record) => ({
          onClick: () => navigate(`/students/${record.id}`),
          style: { cursor: 'pointer' },
        })}
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
    </>
  );
};

export default DebtorsPage;
