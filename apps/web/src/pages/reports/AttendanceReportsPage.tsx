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
  Progress,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { Dayjs } from 'dayjs';
import { getAttendanceReport } from '../../features/reports/api';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;

interface AttendanceRow {
  id: number;
  studentName: string;
  phone: string;
  group: string;
  teacher: string;
  totalLessons: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
}

const AttendanceReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState<string>('');
  const [teacher, setTeacher] = useState<string>('');

  const params: Record<string, string> = {};
  if (dateRange) {
    params.startDate = dateRange[0].format('YYYY-MM-DD');
    params.endDate = dateRange[1].format('YYYY-MM-DD');
  }
  if (search) params.search = search;
  if (group) params.groupId = group;
  if (teacher) params.teacherId = teacher;

  const { data, isLoading } = useQuery({
    queryKey: ['attendance-report', params],
    queryFn: () => getAttendanceReport(params),
  });

  const rows: AttendanceRow[] = (data?.data ?? data ?? []).map(
    (item: any, index: number) => ({
      id: item.id ?? index,
      studentName: item.studentName ?? item.student?.name ?? '-',
      phone: item.phone ?? item.student?.phone ?? '-',
      group: item.group ?? item.groupName ?? '-',
      teacher: item.teacher ?? item.teacherName ?? '-',
      totalLessons: item.totalLessons ?? 0,
      present: item.present ?? 0,
      absent: item.absent ?? 0,
      late: item.late ?? 0,
      attendanceRate: item.attendanceRate ?? 0,
    }),
  );

  const totals = rows.reduce(
    (acc, row) => ({
      totalLessons: acc.totalLessons + row.totalLessons,
      present: acc.present + row.present,
      absent: acc.absent + row.absent,
      late: acc.late + row.late,
    }),
    { totalLessons: 0, present: 0, absent: 0, late: 0 },
  );

  const avgRate =
    rows.length > 0
      ? Math.round(rows.reduce((s, r) => s + r.attendanceRate, 0) / rows.length)
      : 0;

  const columns: ColumnsType<AttendanceRow> = [
    {
      title: 'No',
      key: 'no',
      width: 60,
      render: (_v, _r, i) => i + 1,
    },
    { title: 'Student Name', dataIndex: 'studentName', key: 'studentName' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 140 },
    { title: 'Group', dataIndex: 'group', key: 'group' },
    { title: 'Teacher', dataIndex: 'teacher', key: 'teacher' },
    {
      title: 'Total Lessons',
      dataIndex: 'totalLessons',
      key: 'totalLessons',
      width: 120,
      sorter: (a, b) => a.totalLessons - b.totalLessons,
    },
    {
      title: 'Present',
      dataIndex: 'present',
      key: 'present',
      width: 90,
      sorter: (a, b) => a.present - b.present,
    },
    {
      title: 'Absent',
      dataIndex: 'absent',
      key: 'absent',
      width: 90,
      sorter: (a, b) => a.absent - b.absent,
    },
    {
      title: 'Late',
      dataIndex: 'late',
      key: 'late',
      width: 80,
      sorter: (a, b) => a.late - b.late,
    },
    {
      title: 'Attendance Rate',
      dataIndex: 'attendanceRate',
      key: 'attendanceRate',
      width: 160,
      sorter: (a, b) => a.attendanceRate - b.attendanceRate,
      render: (val: number) => (
        <Progress
          percent={val}
          size="small"
          status={val >= 80 ? 'success' : val >= 50 ? 'normal' : 'exception'}
        />
      ),
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Reports' }, { title: 'Attendance' }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.attendanceReports')}</Title>

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
            style={{ width: 180 }}
            placeholder="Group"
            value={group || undefined}
            onChange={(val) => setGroup(val ?? '')}
            allowClear
            options={[{ label: 'All Groups', value: '' }]}
          />
          <Select
            style={{ width: 180 }}
            placeholder="Teacher"
            value={teacher || undefined}
            onChange={(val) => setTeacher(val ?? '')}
            allowClear
            options={[{ label: 'All Teachers', value: '' }]}
          />
        </Space>
      </Card>

      <Card>
        <Table<AttendanceRow>
          columns={columns}
          dataSource={rows}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 20, showSizeChanger: true }}
          scroll={{ x: 1100 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row
                style={{ background: '#fafafa', fontWeight: 600 }}
              >
                <Table.Summary.Cell index={0} colSpan={5}>
                  Totals
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  {totals.totalLessons}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6}>
                  {totals.present}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7}>
                  {totals.absent}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8}>
                  {totals.late}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={9}>
                  <Progress
                    percent={avgRate}
                    size="small"
                    status={
                      avgRate >= 80
                        ? 'success'
                        : avgRate >= 50
                          ? 'normal'
                          : 'exception'
                    }
                  />
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </>
  );
};

export default AttendanceReportsPage;
