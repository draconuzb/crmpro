import { useState } from 'react';
import {
  Breadcrumb,
  Typography,
  Card,
  Table,
  DatePicker,
  Select,
  Input,
  Space,
  Segmented,
  Tag,
  Badge,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import { getStudentsLeft } from '../../features/reports/api';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;

const REASON_OPTIONS = [
  { label: 'All Reasons', value: '' },
  { label: 'Financial', value: 'financial' },
  { label: 'Schedule', value: 'schedule' },
  { label: 'Quality', value: 'quality' },
  { label: 'Relocation', value: 'relocation' },
  { label: 'Personal', value: 'personal' },
  { label: 'Other', value: 'other' },
];

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'Frozen', value: 'frozen' },
];

const STATUS_BADGE: Record<string, 'success' | 'error' | 'warning' | 'default' | 'processing'> = {
  active: 'success',
  archived: 'error',
  frozen: 'warning',
};

interface StudentLeftRow {
  id: number;
  name: string;
  phone: string;
  group: string;
  course: string;
  teacher: string;
  leftDate: string;
  reason: string;
  status: string;
}

const StudentsLeftPage: React.FC = () => {
  const { t } = useTranslation();
  const [segment, setSegment] = useState<string>('New');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState<string>('');
  const [group, setGroup] = useState<string>('');
  const [teacher, setTeacher] = useState<string>('');
  const [staffFilter, setStaffFilter] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const params: Record<string, string> = { type: segment.toLowerCase() };
  if (dateRange) {
    params.startDate = dateRange[0].format('YYYY-MM-DD');
    params.endDate = dateRange[1].format('YYYY-MM-DD');
  }
  if (search) params.search = search;
  if (course) params.courseId = course;
  if (group) params.groupId = group;
  if (teacher) params.teacherId = teacher;
  if (staffFilter) params.staffId = staffFilter;
  if (reason) params.reason = reason;
  if (status) params.status = status;

  const { data, isLoading } = useQuery({
    queryKey: ['students-left', params],
    queryFn: () => getStudentsLeft(params),
  });

  const rawRows: any[] = data?.data ?? data ?? [];

  const rows: StudentLeftRow[] = rawRows.map((item: any) => ({
    id: item.id,
    name: item.name ?? item.studentName ?? '-',
    phone: item.phone ?? '-',
    group: item.group ?? item.groupName ?? '-',
    course: item.course ?? item.courseName ?? '-',
    teacher: item.teacher ?? item.teacherName ?? '-',
    leftDate: item.leftDate
      ? dayjs(item.leftDate).format('YYYY-MM-DD')
      : item.archivedAt
        ? dayjs(item.archivedAt).format('YYYY-MM-DD')
        : '-',
    reason: item.reason ?? item.archiveReason ?? '-',
    status: item.status ?? '-',
  }));

  const columns: ColumnsType<StudentLeftRow> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 140 },
    { title: 'Group', dataIndex: 'group', key: 'group' },
    { title: 'Course', dataIndex: 'course', key: 'course' },
    { title: 'Teacher', dataIndex: 'teacher', key: 'teacher' },
    {
      title: 'Left Date',
      dataIndex: 'leftDate',
      key: 'leftDate',
      width: 120,
      sorter: (a, b) => a.leftDate.localeCompare(b.leftDate),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: 120,
      render: (val: string) => <Tag>{val}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (val: string) => (
        <Badge
          status={STATUS_BADGE[val.toLowerCase()] ?? 'default'}
          text={val}
        />
      ),
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Reports' }, { title: 'Students Left' }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.studentsLeft')}</Title>

      <Segmented
        options={['New', 'Old']}
        value={segment}
        onChange={(val) => setSegment(val as string)}
        style={{ marginBottom: 16 }}
      />

      <Card style={{ marginBottom: 24 }}>
        <Space wrap size="middle">
          <RangePicker
            value={dateRange}
            onChange={(values) =>
              setDateRange(values as [Dayjs, Dayjs] | null)
            }
            allowClear
          />
          <Search
            placeholder="Search student..."
            allowClear
            onSearch={(val) => setSearch(val)}
            style={{ width: 220 }}
          />
          <Select
            style={{ width: 160 }}
            placeholder="Course"
            value={course || undefined}
            onChange={(val) => setCourse(val ?? '')}
            allowClear
            options={[{ label: 'All Courses', value: '' }]}
          />
          <Select
            style={{ width: 160 }}
            placeholder="Group"
            value={group || undefined}
            onChange={(val) => setGroup(val ?? '')}
            allowClear
            options={[{ label: 'All Groups', value: '' }]}
          />
          <Select
            style={{ width: 160 }}
            placeholder="Teacher"
            value={teacher || undefined}
            onChange={(val) => setTeacher(val ?? '')}
            allowClear
            options={[{ label: 'All Teachers', value: '' }]}
          />
          <Select
            style={{ width: 160 }}
            placeholder="Staff"
            value={staffFilter || undefined}
            onChange={(val) => setStaffFilter(val ?? '')}
            allowClear
            options={[{ label: 'All Staff', value: '' }]}
          />
          <Select
            style={{ width: 160 }}
            placeholder="Reason"
            value={reason || undefined}
            onChange={(val) => setReason(val ?? '')}
            allowClear
            options={REASON_OPTIONS}
          />
          <Select
            style={{ width: 160 }}
            placeholder="Status"
            value={status || undefined}
            onChange={(val) => setStatus(val ?? '')}
            allowClear
            options={STATUS_OPTIONS}
          />
        </Space>
      </Card>

      <Card>
        <Table<StudentLeftRow>
          columns={columns}
          dataSource={rows}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 20, showSizeChanger: true }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </>
  );
};

export default StudentsLeftPage;
