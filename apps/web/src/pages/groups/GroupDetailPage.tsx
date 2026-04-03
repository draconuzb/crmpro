import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography,
  Breadcrumb,
  Card,
  Descriptions,
  Tabs,
  Table,
  Tag,
  Button,
  Spin,
  DatePicker,
  Space,
  Modal,
  Input,
  List,
  Avatar,
  Timeline,
  Tooltip,
  Badge,
  InputNumber,
  message,
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleFilled,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  getGroup,
  getGroupAttendance,
  getGroupStudents,
  addStudentToGroup,
  removeStudentFromGroup,
} from '../../features/groups/api';
import api from '../../lib/axios';

const { Text } = Typography;

const statusColor: Record<string, string> = {
  ACTIVE: 'green',
  LEFT: 'red',
  PAUSED: 'orange',
  COMPLETED: 'blue',
};

const attendanceIcon: Record<string, React.ReactNode> = {
  PRESENT: <CheckCircleFilled style={{ color: '#52c41a', fontSize: 16 }} />,
  ABSENT: <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 16 }} />,
  LATE: <ClockCircleFilled style={{ color: '#faad14', fontSize: 16 }} />,
};

const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const groupId = parseInt(id || '0', 10);
  const queryClient = useQueryClient();

  const [attendanceMonth, setAttendanceMonth] = useState(dayjs().month() + 1);
  const [attendanceYear, setAttendanceYear] = useState(dayjs().year());
  const [addStudentModal, setAddStudentModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentPrice, setStudentPrice] = useState<number>(0);

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => getGroup(groupId),
    enabled: groupId > 0,
  });

  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ['groupAttendance', groupId, attendanceMonth, attendanceYear],
    queryFn: () => getGroupAttendance(groupId, attendanceMonth, attendanceYear),
    enabled: groupId > 0,
  });

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['groupStudents', groupId],
    queryFn: () => getGroupStudents(groupId),
    enabled: groupId > 0,
  });

  // Search students for adding
  const { data: searchResults } = useQuery({
    queryKey: ['searchStudents', studentSearch],
    queryFn: () =>
      api
        .get('/students', { params: { search: studentSearch, limit: 20 } })
        .then((r) => r.data),
    enabled: studentSearch.length >= 2,
  });

  const addStudentMutation = useMutation({
    mutationFn: (data: { studentId: number; price: number }) =>
      addStudentToGroup(groupId, data),
    onSuccess: () => {
      message.success('Student added to group');
      setAddStudentModal(false);
      setSelectedStudentId(null);
      setStudentPrice(0);
      setStudentSearch('');
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupStudents', groupId] });
    },
    onError: () => {
      message.error('Failed to add student');
    },
  });

  const removeStudentMutation = useMutation({
    mutationFn: (studentId: number) => removeStudentFromGroup(groupId, studentId),
    onSuccess: () => {
      message.success('Student removed from group');
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupStudents', groupId] });
    },
    onError: () => {
      message.error('Failed to remove student');
    },
  });

  // History (logs for this group) — no dedicated backend endpoint yet
  const history: any[] = [];

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!group) {
    return <Text type="danger">Group not found</Text>;
  }

  const enrolledStudents = group.students || [];
  const sortedStudents = [...enrolledStudents].sort((a: any, b: any) =>
    (a.student?.user?.firstName || '').localeCompare(b.student?.user?.firstName || ''),
  );

  // Build attendance grid columns
  const daysInMonth = attendance?.dates?.length || dayjs(`${attendanceYear}-${attendanceMonth}-01`).daysInMonth();
  const attendanceDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const attendanceColumns = [
    {
      title: 'Student',
      key: 'student',
      fixed: 'left' as const,
      width: 160,
      render: (_: any, r: any) => r.studentName || `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || '-',
    },
    ...attendanceDays.map((day) => {
      const dateStr = `${attendanceYear}-${String(attendanceMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return {
        title: String(day),
        key: `day-${day}`,
        width: 40,
        align: 'center' as const,
        render: (_: any, r: any) => {
          const status = r.attendance?.[dateStr];
          if (!status) return <span style={{ color: '#d9d9d9' }}>-</span>;
          return (
            <Tooltip title={status}>
              {attendanceIcon[status] || status}
            </Tooltip>
          );
        },
      };
    }),
  ];

  const studentsColumns = [
    {
      title: 'Name',
      key: 'name',
      render: (_: any, r: any) => (
        <Space>
          <Avatar src={r.student?.user?.avatar} icon={<UserOutlined />} size="small" />
          <Link to={`/students/${r.studentId}`}>
            {r.student?.user?.firstName} {r.student?.user?.lastName}
          </Link>
        </Space>
      ),
    },
    {
      title: 'Phone',
      key: 'phone',
      render: (_: any, r: any) => r.student?.user?.phone || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => (
        <Tag color={statusColor[v] || 'default'}>{v}</Tag>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (v: any) => Number(v).toLocaleString(),
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, r: any) =>
        r.status === 'ACTIVE' ? (
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => removeStudentMutation.mutate(r.studentId)}
          />
        ) : null,
    },
  ];

  const tabItems = [
    {
      key: 'attendance',
      label: 'Attendance',
      children: (
        <div>
          <Space style={{ marginBottom: 16 }}>
            <DatePicker
              picker="month"
              value={dayjs().month(attendanceMonth - 1).year(attendanceYear)}
              onChange={(date) => {
                if (date) {
                  setAttendanceMonth(date.month() + 1);
                  setAttendanceYear(date.year());
                }
              }}
            />
          </Space>
          <Table
            columns={attendanceColumns}
            dataSource={attendance?.students || []}
            rowKey="studentId"
            loading={attendanceLoading}
            pagination={false}
            scroll={{ x: 160 + daysInMonth * 40 }}
            size="small"
            bordered
          />
        </div>
      ),
    },
    {
      key: 'students',
      label: 'Students',
      children: (
        <Table
          columns={studentsColumns}
          dataSource={studentsData || []}
          rowKey="id"
          loading={studentsLoading}
          pagination={false}
          size="middle"
        />
      ),
    },
    {
      key: 'history',
      label: 'History',
      children: history.length > 0 ? (
        <Timeline
          items={history.slice(0, 50).map((log: any) => ({
            children: (
              <div>
                <Text strong>{log.userName}</Text>{' '}
                <Text>{log.action}</Text> on <Text code>{log.entity}</Text>
                {log.entityId && <Text type="secondary"> #{log.entityId}</Text>}
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {dayjs(log.createdAt).format('DD.MM.YYYY HH:mm')}
                </Text>
              </div>
            ),
          }))}
        />
      ) : (
        <Text type="secondary">No history available for this group.</Text>
      ),
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { title: <Link to="/groups">Groups</Link> },
          { title: group.name },
        ]}
        style={{ marginBottom: 16 }}
      />

      <Row gutter={24}>
        {/* Left panel - 30% */}
        <Col xs={24} md={7}>
          <Card title="Group Info" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Course">{group.course?.name}</Descriptions.Item>
              <Descriptions.Item label="Teacher">
                {group.teacher?.user
                  ? <Link to={`/teachers/${group.teacher.id}`}>{group.teacher.user.firstName} {group.teacher.user.lastName}</Link>
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Price">
                {group.course?.price ? Number(group.course.price).toLocaleString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Time">{group.startTime} - {group.endTime}</Descriptions.Item>
              <Descriptions.Item label="Days">
                <Tag>{group.dayType}</Tag>
                {group.customDays && <Text type="secondary"> {group.customDays}</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Room">{group.room?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Capacity">{group.capacity || '-'}</Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {dayjs(group.startDate).format('DD.MM.YYYY')}
              </Descriptions.Item>
              {group.endDate && (
                <Descriptions.Item label="End Date">
                  {dayjs(group.endDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Status">
                <Tag color={group.status === 'ACTIVE' ? 'green' : 'default'}>{group.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ID">{group.id}</Descriptions.Item>
            </Descriptions>
            {group.note && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Note: {group.note}</Text>
              </div>
            )}
          </Card>

          <Card
            title={`Students (${sortedStudents.length})`}
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setAddStudentModal(true)}
              >
                Add
              </Button>
            }
          >
            <List
              size="small"
              dataSource={sortedStudents}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar src={item.student?.user?.avatar} icon={<UserOutlined />} size="small" />
                    }
                    title={
                      <Link to={`/students/${item.studentId}`}>
                        {item.student?.user?.firstName} {item.student?.user?.lastName}
                      </Link>
                    }
                    description={
                      <Space size={4}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.student?.user?.phone}
                        </Text>
                        <Tag
                          color={statusColor[item.status] || 'default'}
                          style={{ fontSize: 10 }}
                        >
                          {item.status}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {Number(item.price).toLocaleString()}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Right panel - 70% */}
        <Col xs={24} md={17}>
          <Tabs items={tabItems} defaultActiveKey="attendance" />
        </Col>
      </Row>

      {/* Add Student Modal */}
      <Modal
        title="Add Student to Group"
        open={addStudentModal}
        onOk={() => {
          if (selectedStudentId && studentPrice > 0) {
            addStudentMutation.mutate({
              studentId: selectedStudentId,
              price: studentPrice,
            });
          } else {
            message.warning('Please select a student and enter a price');
          }
        }}
        onCancel={() => {
          setAddStudentModal(false);
          setSelectedStudentId(null);
          setStudentPrice(0);
          setStudentSearch('');
        }}
        confirmLoading={addStudentMutation.isPending}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Search Student</Text>
          <Input
            placeholder="Search by name or phone..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            style={{ marginTop: 8 }}
          />
        </div>

        {searchResults?.data && (
          <List
            size="small"
            bordered
            style={{ maxHeight: 200, overflow: 'auto', marginBottom: 16 }}
            dataSource={searchResults.data}
            renderItem={(item: any) => (
              <List.Item
                style={{
                  cursor: 'pointer',
                  background: selectedStudentId === item.id ? '#e6f7ff' : undefined,
                }}
                onClick={() => setSelectedStudentId(item.id)}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} size="small" />}
                  title={`${item.user?.firstName || item.firstName || ''} ${item.user?.lastName || item.lastName || ''}`}
                  description={item.user?.phone || item.phone || ''}
                />
                {selectedStudentId === item.id && (
                  <Badge status="processing" />
                )}
              </List.Item>
            )}
          />
        )}

        <div>
          <Text strong>Price</Text>
          <InputNumber
            min={0}
            value={studentPrice}
            onChange={(v) => setStudentPrice(v || 0)}
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Enter price"
          />
        </div>
      </Modal>
    </>
  );
};

export default GroupDetailPage;
