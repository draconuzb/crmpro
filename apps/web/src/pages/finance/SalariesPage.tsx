import React, { useState, useEffect } from 'react';
import {
  Typography,
  Breadcrumb,
  Card,
  Table,
  Button,
  DatePicker,
  Space,
  Tag,
  message,
  Popconfirm,
} from 'antd';
import { CalculatorOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { getSalaries, calculateSalaries, paySalary } from '../../features/finance/api';

const { Title } = Typography;

const formatUZS = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(num);
};

const SalariesPage: React.FC = () => {
  const { t } = useTranslation();
  const now = dayjs();
  const [month, setMonth] = useState(now.month() + 1);
  const [year, setYear] = useState(now.year());
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getSalaries(month, year);
      setData(Array.isArray(result) ? result : []);
    } catch {
      message.error('Failed to load salaries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      await calculateSalaries(month, year);
      message.success('Salaries calculated');
      fetchData();
    } catch {
      message.error('Failed to calculate salaries');
    } finally {
      setCalculating(false);
    }
  };

  const handlePay = async (salaryId: number) => {
    try {
      await paySalary(salaryId);
      message.success('Salary paid');
      fetchData();
    } catch {
      message.error('Failed to pay salary');
    }
  };

  const handleMonthChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setMonth(date.month() + 1);
      setYear(date.year());
    }
  };

  const expandedRowRender = (record: any) => {
    const groupColumns = [
      { title: 'Group', dataIndex: 'groupName', key: 'groupName' },
      { title: 'Course', dataIndex: 'courseName', key: 'courseName' },
      { title: 'Students', dataIndex: 'students', key: 'students', width: 90 },
      { title: 'Lessons', dataIndex: 'lessons', key: 'lessons', width: 90 },
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        render: (v: number) => formatUZS(v),
        width: 150,
      },
      {
        title: 'Status',
        key: 'status',
        width: 100,
        render: (_: any, r: any) =>
          r.isPaid ? <Tag color="green">Paid</Tag> : <Tag color="orange">Unpaid</Tag>,
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 100,
        render: (_: any, r: any) =>
          !r.isPaid && r.salaryId ? (
            <Popconfirm title="Mark as paid?" onConfirm={() => handlePay(r.salaryId)}>
              <Button size="small" type="link" icon={<CheckCircleOutlined />}>
                Pay
              </Button>
            </Popconfirm>
          ) : null,
      },
    ];

    return (
      <Table
        columns={groupColumns}
        dataSource={record.groups}
        rowKey={(r) => r.groupId || r.groupName}
        pagination={false}
        size="small"
      />
    );
  };

  const columns = [
    {
      title: 'Teacher',
      dataIndex: 'teacherName',
      key: 'teacherName',
    },
    {
      title: 'Groups',
      key: 'groupsCount',
      render: (_: any, r: any) => r.groups?.length || 0,
      width: 80,
    },
    {
      title: 'Total Lessons',
      key: 'totalLessons',
      render: (_: any, r: any) =>
        (r.groups || []).reduce((sum: number, g: any) => sum + (g.lessons || 0), 0),
      width: 120,
    },
    {
      title: 'Students',
      key: 'totalStudents',
      render: (_: any, r: any) =>
        (r.groups || []).reduce((sum: number, g: any) => sum + (g.students || 0), 0),
      width: 100,
    },
    {
      title: 'Total Amount',
      dataIndex: 'total',
      key: 'total',
      render: (v: number) => <span style={{ fontWeight: 600 }}>{formatUZS(v)}</span>,
      width: 180,
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_: any, r: any) => {
        const allPaid = (r.groups || []).every((g: any) => g.isPaid);
        const somePaid = (r.groups || []).some((g: any) => g.isPaid);
        if (allPaid && r.groups?.length > 0) return <Tag color="green">Paid</Tag>;
        if (somePaid) return <Tag color="orange">Partial</Tag>;
        return <Tag color="red">Unpaid</Tag>;
      },
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Finance' }, { title: 'Salaries' }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.salaries')}</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <DatePicker
            picker="month"
            value={dayjs(`${year}-${String(month).padStart(2, '0')}-01`)}
            onChange={handleMonthChange}
          />
          <Button
            type="primary"
            icon={<CalculatorOutlined />}
            loading={calculating}
            onClick={handleCalculate}
          >
            Calculate Salaries
          </Button>
        </Space>
      </Card>

      <Table
        rowKey="teacherId"
        columns={columns}
        dataSource={data}
        loading={loading}
        expandable={{ expandedRowRender }}
        pagination={false}
      />
    </>
  );
};

export default SalariesPage;
