import React, { useState } from 'react';
import {
  Typography,
  Breadcrumb,
  Table,
  Input,
  Select,
  DatePicker,
  Tag,
  Button,
  Space,
  Row,
  Col,
  Card,
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { getAttendanceReport } from '../../features/attendance/api';
import { getGroups } from '../../features/students/api';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const statusColors: Record<string, string> = {
  PRESENT: 'green',
  ABSENT: 'red',
  LATE: 'orange',
};

const AttendanceReportPage: React.FC = () => {
  const { t } = useTranslation();

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [groupId, setGroupId] = useState<number | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const queryParams = {
    page,
    limit,
    search: search || undefined,
    status: statusFilter,
    groupId,
    startDate: dateRange?.[0],
    endDate: dateRange?.[1],
  };

  const { data, isLoading } = useQuery({
    queryKey: ['attendance-report', queryParams],
    queryFn: () => getAttendanceReport(queryParams),
  });

  const { data: groups } = useQuery({
    queryKey: ['groups-list'],
    queryFn: () => getGroups({ limit: 200 }),
  });

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
    },
    {
      title: t('common.name', 'Name'),
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: t('common.phone', 'Phone'),
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: t('common.status', 'Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>{status}</Tag>
      ),
    },
    {
      title: t('common.group', 'Group'),
      dataIndex: 'groupName',
      key: 'groupName',
    },
    {
      title: t('common.teacher', 'Teacher'),
      dataIndex: 'teacherName',
      key: 'teacherName',
    },
    {
      title: t('common.lessonTime', 'Lesson Time'),
      dataIndex: 'lessonTime',
      key: 'lessonTime',
    },
    {
      title: t('common.date', 'Date'),
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: t('common.comment', 'Comment'),
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
    {
      title: t('common.action', 'Action'),
      key: 'action',
      width: 80,
      render: () => (
        <Button type="link" icon={<EyeOutlined />} size="small" />
      ),
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: t('pages.attendance', 'Attendance') }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.attendance', 'Attendance Report')}</Title>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder={t('common.searchNamePhone', 'Search by name or phone')}
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([
                    dates[0].format('YYYY-MM-DD'),
                    dates[1].format('YYYY-MM-DD'),
                  ]);
                } else {
                  setDateRange(null);
                }
                setPage(1);
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder={t('common.status', 'Status')}
              style={{ width: '100%' }}
              allowClear
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              options={[
                { label: 'Present', value: 'PRESENT' },
                { label: 'Absent', value: 'ABSENT' },
                { label: 'Late', value: 'LATE' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder={t('common.group', 'Group')}
              style={{ width: '100%' }}
              allowClear
              value={groupId}
              onChange={(v) => {
                setGroupId(v);
                setPage(1);
              }}
              options={(groups?.data || []).map((g: any) => ({
                label: g.name,
                value: g.id,
              }))}
              showSearch
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Space>
              <Button icon={<DownloadOutlined />}>{t('common.export', 'Export')}</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.total || 0,
          showSizeChanger: false,
          showTotal: (total) => `${t('common.total', 'Total')}: ${total}`,
          onChange: (p) => setPage(p),
        }}
        scroll={{ x: 1000 }}
        size="middle"
      />
    </>
  );
};

export default AttendanceReportPage;
