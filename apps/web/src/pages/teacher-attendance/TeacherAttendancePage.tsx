import React, { useState, useMemo } from 'react';
import {
  Typography,
  Breadcrumb,
  Tabs,
  DatePicker,
  Table,
  Tag,
  Card,
  Tooltip,
  message,
} from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  PlusCircleFilled,
  MinusCircleFilled,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import { getTeacherAttendanceReport, markTeacherAttendance } from '../../features/attendance/api';

const { Title } = Typography;

// --- Tab 1: Teacher Attendance Calendar ---

const statusCycle = ['PRESENT', 'ABSENT', 'EXTRA', null] as const;

const statusIcon: Record<string, React.ReactNode> = {
  PRESENT: <CheckCircleFilled style={{ color: '#52c41a', fontSize: 18 }} />,
  ABSENT: <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 18 }} />,
  EXTRA: <PlusCircleFilled style={{ color: '#1890ff', fontSize: 18 }} />,
  LATE: <MinusCircleFilled style={{ color: '#faad14', fontSize: 18 }} />,
};

const TeacherAttendanceTab: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());

  const month = selectedMonth.month() + 1;
  const year = selectedMonth.year();

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-attendance', month, year],
    queryFn: () => getTeacherAttendanceReport({ month, year }),
  });

  const mutation = useMutation({
    mutationFn: markTeacherAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-attendance', month, year] });
    },
    onError: () => {
      message.error(t('common.error', 'Error occurred'));
    },
  });

  const handleCellClick = (teacherId: number, date: string, currentStatus: string | null) => {
    const currentIndex = statusCycle.indexOf(currentStatus as any);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

    if (nextStatus === null) {
      // Toggle off - mark as absent to clear (server-side can handle null)
      return;
    }

    mutation.mutate({
      teacherId,
      date,
      status: nextStatus,
    });
  };

  const dates = data?.dates || [];
  const teachers = data?.teachers || [];

  const columns = [
    {
      title: t('common.teacher', 'Teacher'),
      dataIndex: 'teacherName',
      key: 'teacherName',
      fixed: 'left' as const,
      width: 180,
    },
    ...dates.map((date: string) => ({
      title: (
        <Tooltip title={dayjs(date).format('DD.MM.YYYY (ddd)')}>
          <span style={{ fontSize: 12 }}>{dayjs(date).format('DD')}</span>
        </Tooltip>
      ),
      key: date,
      width: 40,
      align: 'center' as const,
      render: (_: any, record: any) => {
        const cell = record.attendance[date];
        const status = cell?.status || null;
        return (
          <div
            style={{ cursor: 'pointer', textAlign: 'center' }}
            onClick={() => handleCellClick(record.teacherId, date, status)}
          >
            {status ? statusIcon[status] || '-' : '-'}
          </div>
        );
      },
    })),
  ];

  return (
    <div>
      <DatePicker
        picker="month"
        value={selectedMonth}
        onChange={(d) => d && setSelectedMonth(d)}
        style={{ marginBottom: 16 }}
      />
      <Table
        columns={columns}
        dataSource={teachers}
        loading={isLoading}
        rowKey="teacherId"
        pagination={false}
        scroll={{ x: 200 + dates.length * 40 }}
        size="small"
        bordered
      />
    </div>
  );
};

// --- Tab 2: Work Schedule ---

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WorkScheduleTab: React.FC = () => {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-attendance', 'schedule-overview'],
    queryFn: () => getTeacherAttendanceReport({ month: dayjs().month() + 1, year: dayjs().year() }),
  });

  const teachers = data?.teachers || [];

  const columns = [
    {
      title: t('common.teacher', 'Teacher'),
      dataIndex: 'teacherName',
      key: 'teacherName',
      width: 200,
    },
    ...dayNames.map((day, index) => ({
      title: day,
      key: `day_${index}`,
      align: 'center' as const,
      render: () => (
        <Tag color="blue">09:00 - 18:00</Tag>
      ),
    })),
  ];

  return (
    <Table
      columns={columns}
      dataSource={teachers}
      loading={isLoading}
      rowKey="teacherId"
      pagination={false}
      scroll={{ x: 1200 }}
      size="middle"
      bordered
    />
  );
};

// --- Tab 3: Monthly Calculation ---

const MonthlyCalculationTab: React.FC = () => {
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());

  const month = selectedMonth.month() + 1;
  const year = selectedMonth.year();

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-attendance', month, year],
    queryFn: () => getTeacherAttendanceReport({ month, year }),
  });

  const teachers = data?.teachers || [];
  const dates = data?.dates || [];

  const summary = useMemo(() => {
    return teachers.map((teacher: any) => {
      let present = 0;
      let absent = 0;
      let late = 0;
      let extra = 0;

      dates.forEach((date: string) => {
        const cell = teacher.attendance[date];
        if (!cell) return;
        switch (cell.status) {
          case 'PRESENT':
            present++;
            break;
          case 'ABSENT':
            absent++;
            break;
          case 'LATE':
            late++;
            break;
          case 'EXTRA':
            extra++;
            break;
        }
      });

      return {
        teacherId: teacher.teacherId,
        teacherName: teacher.teacherName,
        workingDays: dates.length,
        present,
        absent,
        late,
        extra,
        totalHours: (present + extra) * 8,
      };
    });
  }, [teachers, dates]);

  const columns = [
    { title: t('common.teacher', 'Teacher'), dataIndex: 'teacherName', key: 'teacherName' },
    { title: t('common.workingDays', 'Working Days'), dataIndex: 'workingDays', key: 'workingDays', align: 'center' as const },
    {
      title: t('common.present', 'Present'),
      dataIndex: 'present',
      key: 'present',
      align: 'center' as const,
      render: (v: number) => <Tag color="green">{v}</Tag>,
    },
    {
      title: t('common.absent', 'Absent'),
      dataIndex: 'absent',
      key: 'absent',
      align: 'center' as const,
      render: (v: number) => <Tag color="red">{v}</Tag>,
    },
    {
      title: t('common.late', 'Late'),
      dataIndex: 'late',
      key: 'late',
      align: 'center' as const,
      render: (v: number) => <Tag color="orange">{v}</Tag>,
    },
    {
      title: t('common.extra', 'Extra'),
      dataIndex: 'extra',
      key: 'extra',
      align: 'center' as const,
      render: (v: number) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: t('common.totalHours', 'Total Hours'),
      dataIndex: 'totalHours',
      key: 'totalHours',
      align: 'center' as const,
    },
  ];

  return (
    <div>
      <DatePicker
        picker="month"
        value={selectedMonth}
        onChange={(d) => d && setSelectedMonth(d)}
        style={{ marginBottom: 16 }}
      />
      <Table
        columns={columns}
        dataSource={summary}
        loading={isLoading}
        rowKey="teacherId"
        pagination={false}
        size="middle"
        bordered
      />
    </div>
  );
};

// --- Main Page ---

const TeacherAttendancePage: React.FC = () => {
  const { t } = useTranslation();

  const tabItems = [
    {
      key: 'attendance',
      label: t('pages.teacherAttendance', 'Teacher Attendance'),
      children: <TeacherAttendanceTab />,
    },
    {
      key: 'schedule',
      label: t('common.workSchedule', 'Work Schedule'),
      children: <WorkScheduleTab />,
    },
    {
      key: 'calculation',
      label: t('common.monthlyCalculation', 'Monthly Calculation'),
      children: <MonthlyCalculationTab />,
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: t('pages.teacherAttendance', 'Teacher Attendance') }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.teacherAttendance', 'Teacher Attendance')}</Title>
      <Card>
        <Tabs items={tabItems} />
      </Card>
    </>
  );
};

export default TeacherAttendancePage;
