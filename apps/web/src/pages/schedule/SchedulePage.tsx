import React, { useState, useMemo } from 'react';
import {
  Typography,
  Breadcrumb,
  Segmented,
  Card,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  Space,
  Tooltip,
} from 'antd';
import {
  CalendarOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getSchedule, getRooms } from '../../features/settings/api';

const { Title } = Typography;

// Time slots from 08:00 to 20:00
const TIME_SLOTS = Array.from({ length: 12 }, (_, i) => {
  const h = 8 + i;
  return { hour: h, label: `${String(h).padStart(2, '0')}:00` };
});

type ViewMode = 'grid' | 'list';

const SchedulePage: React.FC = () => {
  const { t } = useTranslation();
  const [dayType, setDayType] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const DAY_TYPE_OPTIONS = [
    { value: 'ALL', label: t('schedule.all', 'Barchasi') },
    { value: 'ODD', label: t('schedule.odd_days', 'Toq kunlar') },
    { value: 'EVEN', label: t('schedule.even_days', 'Juft kunlar') },
  ];

  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ['schedule', dayType],
    queryFn: () => getSchedule(dayType === 'ALL' ? {} : { dayType }),
  });

  const { data: roomsData } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
  });

  const items = scheduleData?.items || [];
  const grid = scheduleData?.grid || [];

  // Parse time string to hour number (e.g. "09:00" -> 9)
  const parseHour = (timeStr: string | null): number | null => {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10);
  };

  // Calculate empty slots per room
  const emptySlotStats = useMemo(() => {
    const rooms = roomsData || [];
    const totalTimeSlots = TIME_SLOTS.length;

    const roomStats = (grid.length > 0 ? grid : rooms.map((r: any) => ({ roomId: r.id, roomName: r.name, groups: [] }))).map((room: any) => {
      const occupiedHours = new Set<number>();
      (room.groups || []).forEach((g: any) => {
        const startH = parseHour(g.startTime);
        const endH = parseHour(g.endTime);
        if (startH !== null && endH !== null) {
          for (let h = startH; h < endH; h++) {
            if (h >= 8 && h < 20) occupiedHours.add(h);
          }
        }
      });

      const emptyCount = totalTimeSlots - occupiedHours.size;
      return {
        roomId: room.roomId,
        roomName: room.roomName,
        emptySlots: emptyCount,
        totalSlots: totalTimeSlots,
        occupiedSlots: occupiedHours.size,
      };
    });

    const totalEmpty = roomStats.reduce((sum: number, r: any) => sum + r.emptySlots, 0);

    return { roomStats, totalEmpty };
  }, [grid, roomsData]);

  // Average course price and room capacity estimates
  const avgPrice = 500_000; // UZS per month
  const avgCapacity = roomsData?.length
    ? Math.round(roomsData.reduce((s: number, r: any) => s + (r.capacity || 15), 0) / roomsData.length)
    : 15;
  const potentialIncome = emptySlotStats.totalEmpty * avgPrice * avgCapacity;

  // Get group block for a specific room and hour
  const getGroupsAtSlot = (roomGroups: any[], hour: number) => {
    return roomGroups.filter((g: any) => {
      const startH = parseHour(g.startTime);
      const endH = parseHour(g.endTime);
      if (startH === null || endH === null) return false;
      return hour >= startH && hour < endH;
    });
  };

  // List view columns
  const listColumns = [
    { title: t('schedule.room', 'Xona'), dataIndex: 'roomName', key: 'roomName', sorter: (a: any, b: any) => (a.roomName || '').localeCompare(b.roomName || '') },
    { title: t('schedule.group', 'Guruh'), dataIndex: 'name', key: 'name', sorter: (a: any, b: any) => a.name.localeCompare(b.name) },
    { title: t('schedule.subject', 'Fan'), dataIndex: 'courseName', key: 'courseName', sorter: (a: any, b: any) => a.courseName.localeCompare(b.courseName) },
    { title: t('schedule.teacher', "O'qituvchi"), dataIndex: 'teacherName', key: 'teacherName', sorter: (a: any, b: any) => a.teacherName.localeCompare(b.teacherName) },
    {
      title: t('schedule.time', 'Vaqt'),
      key: 'time',
      render: (_: any, r: any) => `${r.startTime || '—'} - ${r.endTime || '—'}`,
      sorter: (a: any, b: any) => (a.startTime || '').localeCompare(b.startTime || ''),
    },
    {
      title: t('schedule.day_type', 'Kun turi'),
      dataIndex: 'dayType',
      key: 'dayType',
      render: (v: string) => (
        <Tag color={v === 'ODD' ? 'blue' : v === 'EVEN' ? 'green' : 'default'}>
          {v === 'ODD' ? t('schedule.odd', 'Toq') : v === 'EVEN' ? t('schedule.even', 'Juft') : v}
        </Tag>
      ),
      sorter: (a: any, b: any) => (a.dayType || '').localeCompare(b.dayType || ''),
    },
    {
      title: t('schedule.students_count', 'Talabalar soni'),
      dataIndex: 'studentsCount',
      key: 'studentsCount',
      sorter: (a: any, b: any) => a.studentsCount - b.studentsCount,
    },
  ];

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>{t('common.management', 'Boshqaruv')}</Breadcrumb.Item>
        <Breadcrumb.Item>{t('schedule.title', 'Jadval')}</Breadcrumb.Item>
      </Breadcrumb>

      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            {t('schedule.title', 'Jadval')}
          </Title>
        </Col>
        <Col>
          <Space size="middle">
            <Segmented
              options={DAY_TYPE_OPTIONS}
              value={dayType}
              onChange={(v) => setDayType(v as string)}
            />
            <Segmented
              options={[
                { value: 'grid', icon: <CalendarOutlined />, label: t('schedule.calendar', 'Kalendar') },
                { value: 'list', icon: <UnorderedListOutlined />, label: t('schedule.list', "Ro'yxat") },
              ]}
              value={viewMode}
              onChange={(v) => setViewMode(v as ViewMode)}
            />
          </Space>
        </Col>
      </Row>

      {/* Calendar Grid View */}
      {viewMode === 'grid' && (
        <Card loading={isLoading} style={{ marginBottom: 24, overflowX: 'auto' }}>
          <div style={{ minWidth: 1200, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th
                    style={{
                      width: 120,
                      padding: '8px 12px',
                      borderBottom: '2px solid #f0f0f0',
                      textAlign: 'left',
                      background: '#fafafa',
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                    }}
                  >
                    <HomeOutlined /> {t('schedule.room', 'Xona')}
                  </th>
                  {TIME_SLOTS.map((slot) => (
                    <th
                      key={slot.hour}
                      style={{
                        padding: '8px 4px',
                        borderBottom: '2px solid #f0f0f0',
                        textAlign: 'center',
                        background: '#fafafa',
                        fontSize: 12,
                        minWidth: 90,
                      }}
                    >
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {slot.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.map((room: any) => (
                  <tr key={room.roomId}>
                    <td
                      style={{
                        padding: '8px 12px',
                        borderBottom: '1px solid #f0f0f0',
                        fontWeight: 600,
                        background: '#fafafa',
                        position: 'sticky',
                        left: 0,
                        zIndex: 1,
                      }}
                    >
                      {room.roomName}
                    </td>
                    {TIME_SLOTS.map((slot) => {
                      const groupsAtSlot = getGroupsAtSlot(room.groups || [], slot.hour);
                      const isEmpty = groupsAtSlot.length === 0;

                      return (
                        <td
                          key={slot.hour}
                          style={{
                            padding: 4,
                            borderBottom: '1px solid #f0f0f0',
                            borderRight: '1px solid #f5f5f5',
                            verticalAlign: 'top',
                            background: isEmpty ? '#fcfcfc' : undefined,
                            border: isEmpty ? '1px dashed #e8e8e8' : '1px solid #f0f0f0',
                            minHeight: 60,
                          }}
                        >
                          {groupsAtSlot.map((g: any) => (
                            <Tooltip
                              key={g.id}
                              title={`${g.name} | ${g.courseName} | ${g.teacherName} | ${g.studentsCount} ${t('schedule.student', 'talaba')}`}
                            >
                              <div
                                style={{
                                  background: g.color || '#1890ff',
                                  color: '#fff',
                                  borderRadius: 4,
                                  padding: '4px 6px',
                                  marginBottom: 2,
                                  fontSize: 11,
                                  lineHeight: '1.3',
                                  cursor: 'default',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <div style={{ fontWeight: 600 }}>{g.name}</div>
                                <div style={{ opacity: 0.9 }}>{g.courseName}</div>
                                <div style={{ opacity: 0.8, fontSize: 10 }}>{g.teacherName}</div>
                                <div style={{ opacity: 0.8, fontSize: 10 }}>{g.studentsCount} {t('common.count_suffix', 'ta')}</div>
                              </div>
                            </Tooltip>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card style={{ marginBottom: 24 }}>
          <Table
            dataSource={items}
            columns={listColumns}
            rowKey="id"
            loading={isLoading}
            pagination={{ pageSize: 20, showSizeChanger: true }}
            size="middle"
          />
        </Card>
      )}

      {/* Empty rooms summary */}
      <Card
        title={
          <Space>
            <HomeOutlined />
            <span>{t('schedule.empty_rooms', "Bo'sh xonalar")}</span>
          </Space>
        }
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={8}>
            <Statistic
              title={t('schedule.total_empty_slots', "Jami bo'sh slotlar")}
              value={emptySlotStats.totalEmpty}
              suffix={`/ ${t('schedule.hourly_slot', 'soatlik slot')}`}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title={t('schedule.potential_income', 'Potensial daromad (oylik)')}
              value={potentialIncome}
              suffix="UZS"
              precision={0}
              groupSeparator=" "
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title={t('schedule.avg_room_capacity', "O'rtacha xona sig'imi")}
              value={avgCapacity}
              suffix={t('schedule.student', 'talaba')}
            />
          </Col>
        </Row>

        <Table
          style={{ marginTop: 16 }}
          dataSource={emptySlotStats.roomStats}
          rowKey="roomId"
          pagination={false}
          size="small"
          columns={[
            { title: t('schedule.room', 'Xona'), dataIndex: 'roomName', key: 'roomName' },
            { title: t('schedule.empty_slots', "Bo'sh slotlar"), dataIndex: 'emptySlots', key: 'emptySlots' },
            { title: t('schedule.occupied_slots', 'Band slotlar'), dataIndex: 'occupiedSlots', key: 'occupiedSlots' },
            { title: t('schedule.total_slots', 'Jami slotlar'), dataIndex: 'totalSlots', key: 'totalSlots' },
            {
              title: t('schedule.occupancy_pct', 'Bandlik %'),
              key: 'occupancy',
              render: (_: any, r: any) => {
                const pct = r.totalSlots ? Math.round((r.occupiedSlots / r.totalSlots) * 100) : 0;
                return (
                  <Tag color={pct > 70 ? 'green' : pct > 40 ? 'orange' : 'red'}>
                    {pct}%
                  </Tag>
                );
              },
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default SchedulePage;
