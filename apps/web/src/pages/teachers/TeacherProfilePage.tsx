import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography,
  Breadcrumb,
  Card,
  Descriptions,
  Tabs,
  Timeline,
  Table,
  Avatar,
  Tag,
  Spin,
  DatePicker,
  Space,
  Row,
  Col,
  Select,
  InputNumber,
  Button,
  message,
  Statistic,
} from 'antd';
import { UserOutlined, DollarOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getTeacher, getTeacherHistory, getTeacherSalary } from '../../features/teachers/api';
import { getTeacherSalary as getLessonSalary } from '../../features/finance/lesson-api';
import api from '../../lib/axios';

const { Title, Text } = Typography;

const TeacherProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const teacherId = parseInt(id || '0', 10);

  const [salaryMonth, setSalaryMonth] = useState(dayjs().month() + 1);
  const [salaryYear, setSalaryYear] = useState(dayjs().year());

  const { data: teacher, isLoading } = useQuery({
    queryKey: ['teacher', teacherId],
    queryFn: () => getTeacher(teacherId),
    enabled: teacherId > 0,
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['teacherHistory', teacherId],
    queryFn: () => getTeacherHistory(teacherId),
    enabled: teacherId > 0,
  });

  const { data: salary, isLoading: salaryLoading } = useQuery({
    queryKey: ['teacherSalary', teacherId, salaryMonth, salaryYear],
    queryFn: () => getTeacherSalary(teacherId, salaryMonth, salaryYear),
    enabled: teacherId > 0,
  });

  // Lesson-based salary calculation
  const { data: lessonSalary } = useQuery({
    queryKey: ['lessonSalary', teacherId, salaryMonth, salaryYear],
    queryFn: () => getLessonSalary(teacherId, salaryMonth, salaryYear),
    enabled: teacherId > 0,
  });

  const queryClient = useQueryClient();
  const [editSalaryType, setEditSalaryType] = useState<string | null>(null);
  const [editSalaryAmount, setEditSalaryAmount] = useState<number>(0);

  const salaryMutation = useMutation({
    mutationFn: (data: { salaryType: string; salaryAmount: number }) =>
      api.patch(`/teachers/${teacherId}`, data).then(r => r.data),
    onSuccess: () => {
      message.success("Maosh sozlamasi saqlandi");
      setEditSalaryType(null);
      queryClient.invalidateQueries({ queryKey: ['teacher', teacherId] });
      queryClient.invalidateQueries({ queryKey: ['lessonSalary'] });
    },
    onError: () => message.error('Xatolik yuz berdi'),
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!teacher) {
    return <Text type="danger">Teacher not found</Text>;
  }

  const user = teacher.user;
  const branches = user.branches?.map((b: any) => b.branch) || [];

  const salaryColumns = [
    { title: 'Group', dataIndex: 'groupName', key: 'groupName' },
    { title: 'Course', dataIndex: 'courseName', key: 'courseName' },
    { title: 'Students', dataIndex: 'studentsCount', key: 'studentsCount', width: 90 },
    { title: 'Lessons', dataIndex: 'totalLessons', key: 'totalLessons', width: 90 },
    { title: 'Attended', dataIndex: 'attended', key: 'attended', width: 90 },
    { title: 'Absent', dataIndex: 'absent', key: 'absent', width: 90 },
    {
      title: 'Fixed Amount',
      dataIndex: 'fixedAmount',
      key: 'fixedAmount',
      width: 120,
      render: (v: number) => v?.toLocaleString() || '0',
    },
    {
      title: 'Calculated',
      dataIndex: 'calculatedAmount',
      key: 'calculatedAmount',
      width: 120,
      render: (v: number) => v?.toLocaleString() || '0',
    },
  ];

  const tabItems = [
    {
      key: 'profile',
      label: 'Profile',
      children: (
        <Card>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="First Name">{user.firstName}</Descriptions.Item>
            <Descriptions.Item label="Last Name">{user.lastName}</Descriptions.Item>
            <Descriptions.Item label="Phone">{user.phone}</Descriptions.Item>
            <Descriptions.Item label="Gender">{user.gender || '-'}</Descriptions.Item>
            <Descriptions.Item label="Date of Birth">
              {user.dateOfBirth ? dayjs(user.dateOfBirth).format('DD.MM.YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Bio">{teacher.bio || '-'}</Descriptions.Item>
            <Descriptions.Item label="Groups" span={2}>
              {teacher.groups?.map((g: any) => (
                <Tag key={g.id} color="blue">
                  <Link to={`/groups/${g.id}`}>{g.name}</Link>
                </Tag>
              ))}
              {(!teacher.groups || teacher.groups.length === 0) && '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
    {
      key: 'history',
      label: 'History',
      children: historyLoading ? (
        <Spin />
      ) : (
        <Timeline
          items={
            (history || []).map((log: any) => ({
              children: (
                <div>
                  <Text strong>
                    {log.user?.firstName} {log.user?.lastName}
                  </Text>{' '}
                  <Text>{log.action}</Text> on <Text code>{log.entity}</Text>
                  {log.entityId && <Text type="secondary"> #{log.entityId}</Text>}
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(log.createdAt).format('DD.MM.YYYY HH:mm')}
                  </Text>
                </div>
              ),
            }))
          }
        />
      ),
    },
    {
      key: 'salary',
      label: 'Salary',
      children: (
        <div>
          <Space style={{ marginBottom: 16 }}>
            <DatePicker
              picker="month"
              value={dayjs().month(salaryMonth - 1).year(salaryYear)}
              onChange={(date) => {
                if (date) {
                  setSalaryMonth(date.month() + 1);
                  setSalaryYear(date.year());
                }
              }}
            />
          </Space>
          <Table
            columns={salaryColumns}
            dataSource={salary || []}
            rowKey="groupId"
            loading={salaryLoading}
            pagination={false}
            size="middle"
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { title: <Link to="/teachers">Teachers</Link> },
          { title: `${user.firstName} ${user.lastName}` },
        ]}
        style={{ marginBottom: 16 }}
      />

      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Avatar src={user.avatar} icon={<UserOutlined />} size={80} />
              <Title level={4} style={{ marginTop: 12, marginBottom: 4 }}>
                {user.firstName} {user.lastName}
              </Title>
              <Text type="secondary">{user.phone}</Text>
              <br />
              <Text type="secondary">ID: {teacher.id}</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Tag color="blue">{user.role}</Tag>
              {branches.map((b: any) => (
                <Tag key={b.id} color="green">
                  {b.name}
                </Tag>
              ))}
            </div>
          </Card>

          {/* Salary Settings */}
          <Card style={{ marginTop: 16 }} title={<><DollarOutlined /> Maosh sozlamasi</>} size="small">
            {editSalaryType !== null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Select
                  value={editSalaryType}
                  onChange={setEditSalaryType}
                  options={[
                    { value: 'fixed', label: "Belgilangan summa (har bir o'quvchi uchun)" },
                    { value: 'percentage', label: "Foiz (kurs narxidan %)" },
                  ]}
                />
                <InputNumber
                  value={editSalaryAmount}
                  onChange={(v) => setEditSalaryAmount(v || 0)}
                  style={{ width: '100%' }}
                  min={0}
                  formatter={(v) => editSalaryType === 'percentage' ? `${v}%` : `${Number(v).toLocaleString('uz-UZ')} so'm`}
                  placeholder={editSalaryType === 'percentage' ? '50' : '175000'}
                />
                <Space>
                  <Button type="primary" size="small" loading={salaryMutation.isPending}
                    onClick={() => salaryMutation.mutate({ salaryType: editSalaryType, salaryAmount: editSalaryAmount })}>
                    Saqlash
                  </Button>
                  <Button size="small" onClick={() => setEditSalaryType(null)}>Bekor</Button>
                </Space>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">Turi: </Text>
                  <Tag color={teacher.salaryType === 'percentage' ? 'purple' : 'blue'}>
                    {teacher.salaryType === 'percentage' ? 'Foiz (%)' : "Belgilangan summa"}
                  </Tag>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary">Miqdor: </Text>
                  <Text strong style={{ fontSize: 16 }}>
                    {teacher.salaryType === 'percentage'
                      ? `${Number(teacher.salaryAmount)}%`
                      : `${Number(teacher.salaryAmount).toLocaleString('uz-UZ')} so'm`}
                  </Text>
                  <Text type="secondary"> / o'quvchi</Text>
                </div>
                <Button size="small" onClick={() => {
                  setEditSalaryType(teacher.salaryType || 'fixed');
                  setEditSalaryAmount(Number(teacher.salaryAmount) || 0);
                }}>Tahrirlash</Button>
              </div>
            )}

            {/* Calculated salary for selected month */}
            {lessonSalary && (
              <div style={{ marginTop: 16, padding: 12, background: 'rgba(16,185,129,0.08)', borderRadius: 8 }}>
                <Statistic
                  title={`${salaryMonth}/${salaryYear} uchun hisoblangan maosh`}
                  value={lessonSalary.totalSalary}
                  formatter={(v) => `${Number(v).toLocaleString('uz-UZ')} so'm`}
                  valueStyle={{ color: '#10b981', fontSize: 20 }}
                />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {lessonSalary.groups?.length || 0} guruh, {lessonSalary.groups?.reduce((s: number, g: any) => s + g.paidStudentLessons, 0) || 0} to'langan dars
                </Text>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Tabs items={tabItems} defaultActiveKey="profile" />
        </Col>
      </Row>
    </>
  );
};

export default TeacherProfilePage;
