import { useState } from 'react';
import {
  Card, Row, Col, Progress, Statistic, Typography, Breadcrumb, DatePicker,
  Table, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, Tag,
} from 'antd';
import { TrophyOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getKpiDashboard, getKpiTargets, createKpiTarget, deleteKpiTarget } from '../../features/kpi/api';

const { Title } = Typography;

const METRICS = [
  { value: 'leads', label: 'Leadlar' },
  { value: 'enrollments', label: "Ro'yxatga olish" },
  { value: 'revenue', label: 'Daromad' },
  { value: 'attendance_rate', label: 'Davomat (%)' },
  { value: 'debtors', label: 'Qarzdorlar' },
];

const getColor = (percent: number) => {
  if (percent >= 100) return '#52c41a';
  if (percent >= 70) return '#1890ff';
  if (percent >= 40) return '#fa8c16';
  return '#ff4d4f';
};

const KpiDashboardPage: React.FC = () => {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['kpi-dashboard', month],
    queryFn: () => getKpiDashboard(month),
  });

  const { data: targets } = useQuery({
    queryKey: ['kpi-targets', month],
    queryFn: () => getKpiTargets(month),
  });

  const createMutation = useMutation({
    mutationFn: createKpiTarget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi'] });
      setModalOpen(false);
      form.resetFields();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteKpiTarget,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kpi'] }),
  });

  return (
    <>
      <Breadcrumb items={[{ title: 'KPI' }]} style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <TrophyOutlined style={{ marginRight: 8 }} />
          KPI Dashboard
        </Title>
        <Space>
          <DatePicker
            picker="month"
            value={dayjs(month)}
            onChange={(d) => d && setMonth(d.format('YYYY-MM'))}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Maqsad qo'shish
          </Button>
        </Space>
      </div>

      {/* Progress Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {(dashboard || []).map((item: any) => {
          const metric = METRICS.find((m) => m.value === item.metric);
          return (
            <Col key={item.metric} xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title={metric?.label || item.metric}
                  value={item.actualValue}
                  suffix={`/ ${item.targetValue}`}
                  valueStyle={{ fontSize: 24 }}
                />
                <Progress
                  percent={item.progressPercent}
                  strokeColor={getColor(item.progressPercent)}
                  style={{ marginTop: 12 }}
                />
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Targets Table */}
      <Card title="Maqsadlar">
        <Table
          dataSource={targets || []}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: 'Metrika',
              dataIndex: 'metric',
              render: (v: string) => METRICS.find((m) => m.value === v)?.label || v,
            },
            { title: 'Oy', dataIndex: 'month' },
            {
              title: 'Maqsad',
              dataIndex: 'targetValue',
              render: (v: number) => Number(v).toLocaleString(),
            },
            {
              title: '',
              width: 60,
              render: (_: any, record: any) => (
                <Popconfirm title="O'chirilsinmi?" onConfirm={() => deleteMutation.mutate(record.id)}>
                  <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
              ),
            },
          ]}
        />
      </Card>

      {/* Create Target Modal */}
      <Modal
        title="KPI Maqsad qo'shish"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => createMutation.mutate({ ...values, month })}
        >
          <Form.Item name="metric" label="Metrika" rules={[{ required: true }]}>
            <Select options={METRICS} placeholder="Tanlang" />
          </Form.Item>
          <Form.Item name="targetValue" label="Maqsad qiymati" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default KpiDashboardPage;
