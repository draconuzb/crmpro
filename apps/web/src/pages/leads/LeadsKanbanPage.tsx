import React, { useState, useCallback } from 'react';
import {
  Typography,
  Breadcrumb,
  Card,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Drawer,
  Form,
  Badge,
  Modal,
  message,
  Spin,
  Descriptions,
  DatePicker,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  getLeads,
  createLead,
  updateLead,
  updateLeadStatus,
  convertLead,
  getCourses,
  getTags,
  getLead,
} from '../../features/leads/api';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface LeadCard {
  id: number;
  firstName: string;
  lastName?: string;
  phone: string;
  source?: string;
  status: string;
  note?: string;
  courseId?: number;
  course?: { id: number; name: string };
  tags?: Array<{ tag: { id: number; name: string; color?: string } }>;
  createdAt: string;
  assignedToId?: number;
}

const COLUMNS = [
  { key: 'LEAD', title: 'Leads', color: '#e6f7ff', headerColor: '#1890ff' },
  { key: 'EXPECTATION', title: 'Expectation', color: '#fffbe6', headerColor: '#faad14' },
  { key: 'SET', title: 'Set', color: '#f6ffed', headerColor: '#52c41a' },
] as const;

const SOURCE_OPTIONS = [
  { label: 'Instagram', value: 'Instagram' },
  { label: 'Telegram', value: 'Telegram' },
  { label: 'Facebook', value: 'Facebook' },
  { label: 'Website', value: 'Website' },
  { label: 'Referral', value: 'Referral' },
  { label: 'Walk-in', value: 'Walk-in' },
  { label: 'Phone call', value: 'Phone call' },
  { label: 'Other', value: 'Other' },
];

const LeadsKanbanPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const [filters, setFilters] = useState<any>({});

  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', filters],
    queryFn: () => getLeads(filters),
  });

  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  });

  const { data: selectedLead, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['lead', selectedLeadId],
    queryFn: () => getLead(selectedLeadId!),
    enabled: !!selectedLeadId,
  });

  const courses = coursesData?.data || coursesData || [];
  void tagsData;

  const createMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      message.success('Lead created successfully');
      setAddDrawerOpen(false);
      addForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => {
      message.error('Failed to create lead');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateLeadStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateLead(id, data),
    onSuccess: () => {
      message.success('Lead updated');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', selectedLeadId] });
    },
  });

  const convertMutation = useMutation({
    mutationFn: (id: number) => convertLead(id),
    onSuccess: (student: any) => {
      message.success(
        <span>
          Lead converted!{' '}
          <a onClick={() => navigate(`/students/${student.id}`)}>
            View student
          </a>
        </span>,
      );
      setDetailDrawerOpen(false);
      setSelectedLeadId(null);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => {
      message.error('Failed to convert lead');
    },
  });

  const columns = leadsData?.data || { LEAD: [], EXPECTATION: [], SET: [] };
  const counts = leadsData?.counts || { LEAD: 0, EXPECTATION: 0, SET: 0 };

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { draggableId, destination, source } = result;
      if (!destination) return;
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return;

      const leadId = parseInt(draggableId, 10);
      const newStatus = destination.droppableId;

      if (source.droppableId !== newStatus) {
        updateStatusMutation.mutate({ id: leadId, status: newStatus });
      }
    },
    [updateStatusMutation],
  );

  const openDetail = (lead: LeadCard) => {
    setSelectedLeadId(lead.id);
    setDetailDrawerOpen(true);
  };

  const handleConvert = () => {
    if (!selectedLeadId) return;
    Modal.confirm({
      title: 'Convert Lead to Student',
      content:
        'Are you sure you want to convert this lead to a student? A new student account will be created.',
      okText: 'Convert',
      okType: 'primary',
      onOk: () => convertMutation.mutate(selectedLeadId),
    });
  };

  const handleEditSave = () => {
    editForm.validateFields().then((values) => {
      if (selectedLeadId) {
        updateMutation.mutate({ id: selectedLeadId, data: values });
      }
    });
  };

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Leads' }]}
        style={{ marginBottom: 16 }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          {t('pages.leads')}
        </Title>
      </div>

      {/* Filter bar */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 200 }}
          onChange={(e) =>
            setFilters((prev: any) => ({ ...prev, search: e.target.value }))
          }
        />
        <Select
          placeholder="Course"
          allowClear
          style={{ width: 150 }}
          onChange={(v) =>
            setFilters((prev: any) => ({ ...prev, courseId: v }))
          }
          options={(Array.isArray(courses) ? courses : []).map((c: any) => ({
            label: c.name,
            value: c.id,
          }))}
        />
        <Select
          placeholder="Source"
          allowClear
          style={{ width: 140 }}
          onChange={(v) =>
            setFilters((prev: any) => ({ ...prev, source: v }))
          }
          options={SOURCE_OPTIONS}
        />
        <RangePicker
          onChange={(dates) => {
            setFilters((prev: any) => ({
              ...prev,
              startDate: dates?.[0]?.format('YYYY-MM-DD'),
              endDate: dates?.[1]?.format('YYYY-MM-DD'),
            }));
          }}
        />
      </Space>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Row gutter={16}>
            {COLUMNS.map((col) => (
              <Col xs={24} md={8} key={col.key}>
                <div
                  style={{
                    background: col.color,
                    borderRadius: 8,
                    padding: 12,
                    minHeight: 400,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Space>
                      <Text strong style={{ fontSize: 16 }}>
                        {col.title}
                      </Text>
                      <Badge
                        count={counts[col.key] || 0}
                        style={{ backgroundColor: col.headerColor }}
                      />
                    </Space>
                    {col.key === 'LEAD' && (
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => setAddDrawerOpen(true)}
                      />
                    )}
                  </div>

                  <Droppable droppableId={col.key}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          minHeight: 100,
                          background: snapshot.isDraggingOver
                            ? 'rgba(0,0,0,0.03)'
                            : 'transparent',
                          borderRadius: 6,
                          transition: 'background 0.2s',
                        }}
                      >
                        {(columns[col.key] || []).map(
                          (lead: LeadCard, index: number) => (
                            <Draggable
                              key={lead.id}
                              draggableId={String(lead.id)}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    marginBottom: 8,
                                    ...provided.draggableProps.style,
                                  }}
                                >
                                  <Card
                                    size="small"
                                    hoverable
                                    onClick={() => openDetail(lead)}
                                    style={{
                                      boxShadow: snapshot.isDragging
                                        ? '0 4px 12px rgba(0,0,0,0.15)'
                                        : '0 1px 3px rgba(0,0,0,0.08)',
                                      borderRadius: 6,
                                    }}
                                  >
                                    <Text strong>
                                      {lead.firstName}{' '}
                                      {lead.lastName || ''}
                                    </Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                      {lead.phone}
                                    </Text>
                                    <div style={{ marginTop: 6 }}>
                                      {lead.source && (
                                        <Tag color="purple" style={{ fontSize: 11 }}>
                                          {lead.source}
                                        </Tag>
                                      )}
                                      {lead.course && (
                                        <Tag color="cyan" style={{ fontSize: 11 }}>
                                          {lead.course.name}
                                        </Tag>
                                      )}
                                    </div>
                                    {lead.tags && lead.tags.length > 0 && (
                                      <div style={{ marginTop: 4 }}>
                                        {lead.tags.map((lt) => (
                                          <Tag
                                            key={lt.tag.id}
                                            color={lt.tag.color || 'default'}
                                            style={{ fontSize: 11 }}
                                          >
                                            {lt.tag.name}
                                          </Tag>
                                        ))}
                                      </div>
                                    )}
                                    <div style={{ marginTop: 6 }}>
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: 11 }}
                                      >
                                        {dayjs(lead.createdAt).fromNow()}
                                      </Text>
                                    </div>
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          ),
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </Col>
            ))}
          </Row>
        </DragDropContext>
      )}

      {/* Add Lead Drawer */}
      <Drawer
        title="Add Lead"
        open={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        width={420}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={() => setAddDrawerOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              onClick={() => addForm.submit()}
              loading={createMutation.isPending}
            >
              Create
            </Button>
          </Space>
        }
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={(values) => createMutation.mutate(values)}
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Last Name">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Phone is required' }]}
          >
            <Input placeholder="+998" />
          </Form.Item>
          <Form.Item name="source" label="Source">
            <Select allowClear options={SOURCE_OPTIONS} />
          </Form.Item>
          <Form.Item name="courseId" label="Course">
            <Select
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={(Array.isArray(courses) ? courses : []).map(
                (c: any) => ({
                  label: c.name,
                  value: c.id,
                }),
              )}
            />
          </Form.Item>
          <Form.Item name="note" label="Note">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Lead Detail Drawer */}
      <Drawer
        title="Lead Details"
        open={detailDrawerOpen}
        onClose={() => {
          setDetailDrawerOpen(false);
          setSelectedLeadId(null);
        }}
        width={480}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={handleEditSave} loading={updateMutation.isPending}>
              Save Changes
            </Button>
            <Button
              type="primary"
              icon={<UserSwitchOutlined />}
              onClick={handleConvert}
              loading={convertMutation.isPending}
            >
              Convert to Student
            </Button>
          </Space>
        }
      >
        {isLoadingDetail ? (
          <Spin />
        ) : selectedLead ? (
          <>
            <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedLead.status === 'LEAD'
                      ? 'blue'
                      : selectedLead.status === 'EXPECTATION'
                        ? 'orange'
                        : 'green'
                  }
                >
                  {selectedLead.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {dayjs(selectedLead.createdAt).format('DD.MM.YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            <Form
              form={editForm}
              layout="vertical"
              initialValues={{
                firstName: selectedLead.firstName,
                lastName: selectedLead.lastName,
                phone: selectedLead.phone,
                source: selectedLead.source,
                courseId: selectedLead.courseId,
                note: selectedLead.note,
              }}
              key={selectedLead.id}
            >
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="firstName" label="First Name">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="lastName" label="Last Name">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="phone" label="Phone">
                <Input />
              </Form.Item>
              <Form.Item name="source" label="Source">
                <Select allowClear options={SOURCE_OPTIONS} />
              </Form.Item>
              <Form.Item name="courseId" label="Course">
                <Select
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={(Array.isArray(courses) ? courses : []).map(
                    (c: any) => ({
                      label: c.name,
                      value: c.id,
                    }),
                  )}
                />
              </Form.Item>
              <Form.Item name="note" label="Note">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Form>

            {selectedLead.tags && selectedLead.tags.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Text strong>Tags: </Text>
                {selectedLead.tags.map((lt: any) => (
                  <Tag
                    key={lt.tag.id}
                    color={lt.tag.color || 'default'}
                  >
                    {lt.tag.name}
                  </Tag>
                ))}
              </div>
            )}

            {selectedLead.reminders && selectedLead.reminders.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Reminders:</Text>
                {selectedLead.reminders.map((r: any) => (
                  <Card key={r.id} size="small" style={{ marginTop: 4 }}>
                    <Text>{r.title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(r.dueDate).format('DD.MM.YYYY HH:mm')}
                      {r.isCompleted && (
                        <Tag color="green" style={{ marginLeft: 8 }}>
                          Done
                        </Tag>
                      )}
                    </Text>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : null}
      </Drawer>
    </>
  );
};

export default LeadsKanbanPage;
