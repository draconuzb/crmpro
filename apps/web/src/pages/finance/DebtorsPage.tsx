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
  message,
} from 'antd';
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
      message.error('Failed to load debtors');
    } finally {
      setLoading(false);
    }
  }, [filters, meta.page, meta.limit]);

  useEffect(() => {
    fetchData({ page: 1 });
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns = [
    {
      title: 'Name',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (v: string, r: any) => (
        <a onClick={() => navigate(`/students/${r.id}`)}>{v}</a>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (v: any) => (
        <span style={{ fontWeight: 700, color: '#cf1322' }}>{formatUZS(v)}</span>
      ),
      width: 180,
      sorter: true,
    },
    {
      title: 'Groups',
      dataIndex: 'groups',
      key: 'groups',
      render: (groups: any[]) =>
        groups?.map((g) => (
          <Tag key={g.id}>{g.name}</Tag>
        )) || '—',
    },
    {
      title: 'Last Payment',
      dataIndex: 'lastPaymentDate',
      key: 'lastPaymentDate',
      render: (d: string | null) => (d ? dayjs(d).format('DD.MM.YYYY') : '—'),
      width: 130,
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_: any, r: any) => {
        const bal = Number(r.balance);
        if (bal <= -500000) return <Badge status="error" text="Critical" />;
        if (bal <= -100000) return <Badge status="warning" text="Warning" />;
        return <Badge status="default" text="Minor" />;
      },
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      width: 150,
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Finance' }, { title: 'Debtors' }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.debtors')}</Title>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input.Search
            placeholder="Search name/phone..."
            allowClear
            style={{ width: 220 }}
            onSearch={(v) => setFilters((prev: any) => ({ ...prev, search: v || undefined }))}
          />
          <InputNumber
            placeholder="Min debt"
            style={{ width: 130 }}
            min={0}
            onChange={(v) => setFilters((prev: any) => ({ ...prev, minAmount: v || undefined }))}
          />
          <InputNumber
            placeholder="Max debt"
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
