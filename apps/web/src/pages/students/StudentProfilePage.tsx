import React, { useState } from 'react';
import {
  Typography,
  Breadcrumb,
  Card,
  Tabs,
  Table,
  Tag,
  Avatar,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Rate,
  Timeline,
  List,
  message,
  Spin,
  Descriptions,
  Badge,
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  DollarOutlined,
  PlusOutlined,
  SendOutlined,
  MessageOutlined,
  FileTextOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  getStudent,
  getStudentGroups,
  getStudentComments,
  addStudentComment,
  addStudentPayment,
  getStudentHistory,
  getStudentCallHistory,
  getStudentSmsHistory,
  getStudentLeadHistory,
  updateStudent,
} from '../../features/students/api';
import api from '../../lib/axios';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const StudentProfilePage: React.FC = () => {
  useTranslation();
  const { id } = useParams<{ id: string }>();
  const studentId = Number(id);
  const queryClient = useQueryClient();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [paymentForm] = Form.useForm();
  const [smsForm] = Form.useForm();
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState('groups');

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => getStudent(studentId),
    enabled: !!studentId,
  });

  const { data: groups } = useQuery({
    queryKey: ['student-groups', studentId],
    queryFn: () => getStudentGroups(studentId),
    enabled: !!studentId,
  });

  const { data: comments } = useQuery({
    queryKey: ['student-comments', studentId],
    queryFn: () => getStudentComments(studentId),
    enabled: !!studentId && activeTab === 'comments',
  });

  const { data: callHistory } = useQuery({
    queryKey: ['student-calls', studentId],
    queryFn: () => getStudentCallHistory(studentId),
    enabled: !!studentId && activeTab === 'calls',
  });

  const { data: smsHistory } = useQuery({
    queryKey: ['student-sms', studentId],
    queryFn: () => getStudentSmsHistory(studentId),
    enabled: !!studentId && activeTab === 'sms',
  });

  const { data: history } = useQuery({
    queryKey: ['student-history', studentId],
    queryFn: () => getStudentHistory(studentId),
    enabled: !!studentId && activeTab === 'history',
  });

  const { data: leadHistory } = useQuery({
    queryKey: ['student-lead-history', studentId],
    queryFn: () => getStudentLeadHistory(studentId),
    enabled: !!studentId && activeTab === 'lead-history',
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) => addStudentComment(studentId, text),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({
        queryKey: ['student-comments', studentId],
      });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: (data: any) => addStudentPayment(studentId, data),
    onSuccess: () => {
      message.success('Payment added successfully');
      setPaymentModalOpen(false);
      paymentForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
    },
    onError: () => {
      message.error('Failed to add payment');
    },
  });

  const smsMutation = useMutation({
    mutationFn: (data: { message: string }) => api.post('/sms/send', { studentId, message: data.message }).then(r => r.data),
    onSuccess: (result) => {
      const status = result?.status;
      if (status === 'SENT') {
        message.success("SMS muvaffaqiyatli yuborildi");
      } else {
        message.warning("SMS yuborildi, lekin provayderga yetib bormagan bo'lishi mumkin");
      }
      setSmsModalOpen(false);
      smsForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['student-sms', studentId] });
    },
    onError: () => {
      message.error("SMS yuborishda xatolik");
    },
  });

  const noteMutation = useMutation({
    mutationFn: (note: string) => updateStudent(studentId, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      message.success('Note saved');
    },
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!student) {
    return <Text>Student not found</Text>;
  }

  const balance = Number(student.balance || 0);
  const balanceColor = balance < 0 ? '#ff4d4f' : balance > 0 ? '#52c41a' : '#666';

  const groupColumns = [
    {
      title: 'Group',
      key: 'group',
      render: (_: any, record: any) => (
        <Link to={`/groups/${record.group?.id}`}>{record.group?.name}</Link>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => {
        const colorMap: any = {
          ACTIVE: 'green',
          FROZEN: 'blue',
          LEFT: 'red',
          TRIAL: 'orange',
        };
        return (
          <Tag color={colorMap[record.status] || 'default'}>
            {record.status}
          </Tag>
        );
      },
    },
    {
      title: 'Price',
      key: 'price',
      render: (_: any, record: any) =>
        `${Number(record.price || 0).toLocaleString()} UZS`,
    },
    {
      title: 'Course',
      key: 'course',
      render: (_: any, record: any) => record.group?.course?.name,
    },
    {
      title: 'Teacher',
      key: 'teacher',
      render: (_: any, record: any) => {
        const tu = record.group?.teacher?.user;
        return tu ? `${tu.firstName} ${tu.lastName}` : '-';
      },
    },
    {
      title: 'Start Date',
      key: 'startDate',
      render: (_: any, record: any) =>
        dayjs(record.startDate).format('DD.MM.YYYY'),
    },
  ];

  const callColumns = [
    {
      title: 'Date',
      dataIndex: 'calledAt',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY HH:mm'),
    },
    { title: 'Direction', dataIndex: 'direction' },
    {
      title: 'Duration',
      dataIndex: 'duration',
      render: (v: number) => (v ? `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}` : '-'),
    },
    {
      title: 'Recording',
      dataIndex: 'recordingUrl',
      render: (url: string) =>
        url ? (
          <a href={url} target="_blank" rel="noreferrer">
            Listen
          </a>
        ) : (
          '-'
        ),
    },
  ];

  const smsColumns = [
    {
      title: 'Date',
      dataIndex: 'sentAt',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY HH:mm'),
    },
    { title: 'Message', dataIndex: 'message' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (v: string) => (
        <Tag color={v === 'SENT' ? 'green' : 'orange'}>{v}</Tag>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'groups',
      label: 'Groups',
      children: (
        <Table
          columns={groupColumns}
          dataSource={groups || []}
          rowKey="id"
          pagination={false}
          size="small"
        />
      ),
    },
    {
      key: 'comments',
      label: 'Comments',
      children: (
        <div>
          <List
            dataSource={comments || []}
            locale={{ emptyText: 'No comments yet' }}
            renderItem={(item: any) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={item.author?.avatar}
                      icon={<UserOutlined />}
                      size="small"
                    />
                  }
                  title={
                    <Space>
                      <span>
                        {item.author?.firstName} {item.author?.lastName}
                      </span>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(item.createdAt).fromNow()}
                      </Text>
                    </Space>
                  }
                  description={item.text}
                />
              </List.Item>
            )}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Input.TextArea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              style={{ flex: 1 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={commentMutation.isPending}
              onClick={() => {
                if (commentText.trim()) {
                  commentMutation.mutate(commentText.trim());
                }
              }}
            >
              Send
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: 'calls',
      label: 'Call History',
      children: (
        <Table
          columns={callColumns}
          dataSource={callHistory || []}
          rowKey="id"
          pagination={false}
          size="small"
        />
      ),
    },
    {
      key: 'sms',
      label: 'SMS',
      children: (
        <Table
          columns={smsColumns}
          dataSource={smsHistory || []}
          rowKey="id"
          pagination={false}
          size="small"
        />
      ),
    },
    {
      key: 'lesson-payments',
      label: "Dars to'lovlari",
      children: <LessonPaymentsStudentTab studentId={studentId} />,
    },
    {
      key: 'history',
      label: 'History',
      children: (
        <Timeline
          items={(history || []).map((log: any) => ({
            children: (
              <div>
                <Text strong>
                  {log.user?.firstName} {log.user?.lastName}
                </Text>{' '}
                <Text>{log.action}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {dayjs(log.createdAt).format('DD.MM.YYYY HH:mm')}
                </Text>
                {log.details && (
                  <pre
                    style={{
                      fontSize: 11,
                      background: '#f5f5f5',
                      padding: 4,
                      marginTop: 4,
                      borderRadius: 4,
                    }}
                  >
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ),
          }))}
        />
      ),
    },
    {
      key: 'lead-history',
      label: 'Lead History',
      children: leadHistory ? (
        <Card size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Name">
              {leadHistory.firstName} {leadHistory.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {leadHistory.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Source">
              {leadHistory.source || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Course">
              {leadHistory.course?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {dayjs(leadHistory.createdAt).format('DD.MM.YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Tags">
              {(leadHistory.tags || []).map((lt: any) => (
                <Tag key={lt.tag?.id} color={lt.tag?.color}>
                  {lt.tag?.name}
                </Tag>
              ))}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ) : (
        <Text type="secondary">
          This student was not converted from a lead.
        </Text>
      ),
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { title: <Link to="/students">Students</Link> },
          {
            title: `${student.user?.firstName} ${student.user?.lastName}`,
          },
        ]}
        style={{ marginBottom: 16 }}
      />

      {/* Action buttons at the top */}
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<DollarOutlined />}
          onClick={() => setPaymentModalOpen(true)}
        >
          + To'lov
        </Button>
        <Button
          icon={<FileTextOutlined />}
          onClick={() => message.info("Eslatma funksiyasi tez orada ishga tushadi")}
        >
          + Eslatma
        </Button>
        <Button
          icon={<MessageOutlined />}
          onClick={() => setSmsModalOpen(true)}
        >
          SMS yuborish
        </Button>
      </Space>

      <Row gutter={24}>
        {/* Left card */}
        <Col xs={24} md={8} lg={7}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Avatar
                size={80}
                src={student.user?.avatar}
                icon={<UserOutlined />}
              />
              <Title level={4} style={{ margin: '8px 0 0' }}>
                {student.user?.firstName} {student.user?.lastName}
              </Title>
              <Badge
                count={`ID: ${student.id}`}
                style={{ backgroundColor: '#108ee9' }}
              />
            </div>

            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 24, fontWeight: 700, color: balanceColor }}>
                {balance.toLocaleString()} UZS
              </Text>
              <br />
              <Text type="secondary">Balance</Text>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Rate disabled value={0} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <Space>
                <PhoneOutlined />
                <Text>{student.user?.phone}</Text>
              </Space>
            </div>
            <div style={{ marginBottom: 12 }}>
              <Space>
                <CalendarOutlined />
                <Text>
                  Created: {dayjs(student.createdAt).format('DD.MM.YYYY')}
                </Text>
              </Space>
            </div>

            {student.user?.dateOfBirth && (
              <div style={{ marginBottom: 12 }}>
                <Space>
                  <CalendarOutlined />
                  <Text>
                    DOB:{' '}
                    {dayjs(student.user.dateOfBirth).format('DD.MM.YYYY')}
                  </Text>
                </Space>
              </div>
            )}

            <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                block
              >
                Add to Group
              </Button>
              <Button
                icon={<DollarOutlined />}
                block
                onClick={() => setPaymentModalOpen(true)}
              >
                Add Payment
              </Button>
            </Space>

            {/* Qarzdorlar holati */}
            {balance < 0 && (
              <Card
                size="small"
                style={{
                  marginTop: 16,
                  background: '#fff2f0',
                  borderColor: '#ffccc7',
                }}
              >
                <Space>
                  <WarningOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
                  <div>
                    <Text strong style={{ color: '#cf1322' }}>Qarzdorlar holati</Text>
                    <br />
                    <Text style={{ color: '#cf1322', fontSize: 16, fontWeight: 700 }}>
                      {balance.toLocaleString()} UZS
                    </Text>
                  </div>
                </Space>
              </Card>
            )}

            {/* Lead tarixi */}
            {student.leadId && (
              <Card
                size="small"
                title="Lead tarixi"
                style={{ marginTop: 16 }}
              >
                <Text type="secondary">
                  Lead ID: {student.leadId}
                  {student.leadSource && ` | Manba: ${student.leadSource}`}
                </Text>
              </Card>
            )}

            <div style={{ marginTop: 16 }}>
              <Text strong>Note</Text>
              <Input.TextArea
                defaultValue={student.note || ''}
                rows={3}
                onBlur={(e) => {
                  if (e.target.value !== (student.note || '')) {
                    noteMutation.mutate(e.target.value);
                  }
                }}
                style={{ marginTop: 4 }}
              />
            </div>
          </Card>
        </Col>

        {/* Right side with tabs */}
        <Col xs={24} md={16} lg={17}>
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
            />
          </Card>
        </Col>
      </Row>

      {/* SMS Modal */}
      <Modal
        title="SMS yuborish"
        open={smsModalOpen}
        onCancel={() => setSmsModalOpen(false)}
        onOk={() => smsForm.submit()}
        confirmLoading={smsMutation.isPending}
        okText="Yuborish"
        cancelText="Bekor qilish"
      >
        <Form
          form={smsForm}
          layout="vertical"
          onFinish={(values) => smsMutation.mutate(values)}
        >
          <Form.Item label="Qabul qiluvchi">
            <Input disabled value={`${student.user?.firstName} ${student.user?.lastName} — ${student.user?.phone}`} />
          </Form.Item>
          <Form.Item
            name="message"
            label="Xabar matni"
            rules={[{ required: true, message: 'Xabar matni kiritilishi shart' }]}
          >
            <Input.TextArea rows={4} maxLength={160} showCount placeholder="SMS matnini kiriting..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        title="Add Payment"
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        onOk={() => paymentForm.submit()}
        confirmLoading={paymentMutation.isPending}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={(values) => paymentMutation.mutate(values)}
        >
          <Form.Item
            name="amount"
            label="Amount (UZS)"
            rules={[{ required: true, message: 'Amount is required' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item
            name="method"
            label="Method"
            rules={[{ required: true, message: 'Method is required' }]}
          >
            <Select
              options={[
                { label: 'Cash', value: 'CASH' },
                { label: 'Card', value: 'CARD' },
                { label: 'Transfer', value: 'TRANSFER' },
              ]}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// ── Lesson Payments Tab ──
const LessonPaymentsStudentTab: React.FC<{ studentId: number }> = ({ studentId }) => {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const { data: payments, isLoading } = useQuery({
    queryKey: ['lesson-payments-student', studentId, month],
    queryFn: () => api.get(`/lesson-payments/by-student/${studentId}`, { params: { month } }).then(r => r.data),
  });

  const total = (payments || []).filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + Number(p.amount), 0);
  const writtenOff = (payments || []).filter((p: any) => p.status === 'written_off').length;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select value={month} onChange={setMonth} style={{ width: 160 }}
          options={Array.from({ length: 6 }, (_, i) => {
            const d = dayjs().subtract(i, 'month');
            return { value: d.format('YYYY-MM'), label: d.format('MMMM YYYY') };
          })} />
        <Tag color="green">Jami: {total.toLocaleString('uz-UZ')} so'm</Tag>
        {writtenOff > 0 && <Tag color="orange">{writtenOff} ta bekor qilingan</Tag>}
      </Space>
      <Table dataSource={payments || []} rowKey="id" loading={isLoading} pagination={false} size="small"
        columns={[
          { title: 'Sana', dataIndex: 'date', width: 100, render: (v: string) => dayjs(v).format('DD.MM.YYYY') },
          { title: 'Summa', dataIndex: 'amount', width: 120, render: (v: number) => `${Number(v).toLocaleString('uz-UZ')} so'm` },
          { title: 'Holat', dataIndex: 'status', width: 120,
            render: (v: string) => v === 'written_off' ? <Tag color="orange">Bekor qilingan</Tag> : <Tag color="green">To'langan</Tag> },
          { title: 'Sabab', dataIndex: 'writeOffReason', render: (v: string) => v || '—' },
        ]} />
    </div>
  );
};

export default StudentProfilePage;
