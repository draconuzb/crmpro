import React, { useState, useMemo } from 'react';
import {
  Typography,
  Breadcrumb,
  Table,
  Tag,
  Card,
  Button,
  DatePicker,
  Radio,
  message,
  Space,
  Result,
} from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleFilled,
  SaveOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import { getHrStaff } from '../../features/hr/api';

const { Title } = Typography;

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

const StaffAttendancePage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);

  const statusConfig: Record<AttendanceStatus, { color: string; icon: React.ReactNode; label: string }> = {
    PRESENT: { color: 'green', icon: <CheckCircleFilled style={{ color: '#52c41a' }} />, label: t('attendance.present', 'Keldi') },
    ABSENT: { color: 'red', icon: <CloseCircleFilled style={{ color: '#ff4d4f' }} />, label: t('attendance.absent', 'Kelmadi') },
    LATE: { color: 'orange', icon: <ClockCircleFilled style={{ color: '#faad14' }} />, label: t('attendance.late', 'Kechikdi') },
  };

  const { data: staffList, isLoading, error, refetch } = useQuery({
    queryKey: ['hr-staff', 'ACTIVE'],
    queryFn: () => getHrStaff({ status: 'ACTIVE' }),
  });

  if (error) return <Result status="error" title={t('common.error', 'Xatolik yuz berdi')} extra={<Button onClick={() => refetch()}>{t('common.retry', 'Qayta urinish')}</Button>} />;

  const staff = useMemo(() => {
    const list = Array.isArray(staffList) ? staffList : staffList?.data ?? [];
    return list;
  }, [staffList]);

  const handleStatusChange = (staffId: number, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [staffId]: status }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const all: Record<number, AttendanceStatus> = {};
    staff.forEach((s: any) => {
      all[s.id] = status;
    });
    setAttendance(all);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Backend endpoint not yet available - log and show success for now
      console.log('Staff attendance payload:', {
        date: selectedDate.format('YYYY-MM-DD'),
        records: Object.entries(attendance).map(([staffId, status]) => ({
          staffId: Number(staffId),
          status,
        })),
      });
      message.success(t('common.saved', 'Saqlandi') + ' (UI only - backend pending)');
    } catch {
      message.error(t('common.error', 'Xatolik yuz berdi'));
    } finally {
      setSaving(false);
    }
  };

  const markedCount = Object.keys(attendance).length;
  const presentCount = Object.values(attendance).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(attendance).filter((s) => s === 'ABSENT').length;
  const lateCount = Object.values(attendance).filter((s) => s === 'LATE').length;

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: t('common.name', 'Ism'),
      key: 'name',
      width: 200,
      render: (_: any, record: any) => (
        <span style={{ fontWeight: 500 }}>
          {record.lastName} {record.firstName}
        </span>
      ),
    },
    {
      title: t('common.position', 'Lavozim'),
      dataIndex: 'position',
      key: 'position',
      width: 160,
    },
    {
      title: t('common.category', 'Kategoriya'),
      dataIndex: 'category',
      key: 'category',
      width: 140,
      render: (cat: string) => {
        const colorMap: Record<string, string> = {
          TEACHER: 'blue',
          MANAGER: 'purple',
          ADMIN: 'gold',
          SUPPORT: 'cyan',
        };
        return cat ? <Tag color={colorMap[cat] || 'default'}>{cat}</Tag> : '-';
      },
    },
    {
      title: t('common.status', 'Holat'),
      key: 'attendance',
      width: 320,
      render: (_: any, record: any) => {
        const current = attendance[record.id];
        return (
          <Radio.Group
            value={current}
            onChange={(e) => handleStatusChange(record.id, e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="small"
          >
            <Radio.Button value="PRESENT" style={current === 'PRESENT' ? { background: '#52c41a', borderColor: '#52c41a' } : {}}>
              {statusConfig.PRESENT.icon} {t('attendance.present', 'Keldi')}
            </Radio.Button>
            <Radio.Button value="ABSENT" style={current === 'ABSENT' ? { background: '#ff4d4f', borderColor: '#ff4d4f' } : {}}>
              {statusConfig.ABSENT.icon} {t('attendance.absent', 'Kelmadi')}
            </Radio.Button>
            <Radio.Button value="LATE" style={current === 'LATE' ? { background: '#faad14', borderColor: '#faad14' } : {}}>
              {statusConfig.LATE.icon} {t('attendance.late', 'Kechikdi')}
            </Radio.Button>
          </Radio.Group>
        );
      },
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: t('attendance.title', 'Xodimlar davomati') }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('attendance.title', 'Xodimlar davomati')}</Title>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <DatePicker
            value={selectedDate}
            onChange={(d) => d && setSelectedDate(d)}
            format="DD.MM.YYYY"
          />
          <Button size="small" onClick={() => handleMarkAll('PRESENT')}>
            {t('attendance.mark_all_present', 'Hammasini "Keldi" deb belgilash')}
          </Button>
          <Button size="small" onClick={() => setAttendance({})}>
            {t('attendance.clear', 'Tozalash')}
          </Button>
        </Space>

        <Space style={{ marginBottom: 16, display: 'flex' }} wrap>
          <Tag>{t('attendance.total', 'Jami')}: {staff.length}</Tag>
          <Tag color="green">{t('attendance.present', 'Keldi')}: {presentCount}</Tag>
          <Tag color="red">{t('attendance.absent', 'Kelmadi')}: {absentCount}</Tag>
          <Tag color="orange">{t('attendance.late', 'Kechikdi')}: {lateCount}</Tag>
          <Tag>{t('attendance.unmarked', 'Belgilanmagan')}: {staff.length - markedCount}</Tag>
        </Space>

        <Table
          columns={columns}
          dataSource={staff}
          loading={isLoading}
          rowKey="id"
          pagination={false}
          size="middle"
          bordered
        />

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="large"
            loading={saving}
            disabled={markedCount === 0}
            onClick={handleSave}
          >
            {t('common.save', 'Saqlash')} ({markedCount}/{staff.length})
          </Button>
        </div>
      </Card>
    </>
  );
};

export default StaffAttendancePage;
