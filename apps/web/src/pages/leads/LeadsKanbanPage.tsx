import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography, Button, Input, Select, Space, Tag, Drawer, Form,
  Modal, message, Spin, Descriptions, DatePicker, Row, Col, Tooltip, Popover,
  ColorPicker,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, UserSwitchOutlined,
  LockOutlined, UserOutlined, MoreOutlined,
  DeleteOutlined, EditOutlined,
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import LeadDeleteModal from '@/components/LeadDeleteModal';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  getLeads, createLead, updateLead, updateLeadStatus,
  convertLead, getCourses, getLead,
  createLeadStage, deleteLeadStage,
} from '../../features/leads/api';
import api from '../../lib/axios';
import LeadAnalytics from './LeadAnalytics';
import './leads.css';

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

interface Stage { id: number; key: string; label: string; color: string; sortOrder: number; }
interface CourseSummary { courseId: number | null; courseName: string; assigned: number; total: number; }

const SOURCE_OPTION_KEYS = [
  { labelKey: 'leads.sourceInstagram', value: 'Instagram' },
  { labelKey: 'leads.sourceTelegram', value: 'Telegram' },
  { labelKey: 'leads.sourceFacebook', value: 'Facebook' },
  { labelKey: 'leads.sourceWebsite', value: 'Website' },
  { labelKey: 'leads.sourceReferral', value: 'Referral' },
  { labelKey: 'leads.sourceWalkIn', value: 'Walk-in' },
  { labelKey: 'leads.sourcePhoneCall', value: 'Phone call' },
  { labelKey: 'leads.sourceOther', value: 'Other' },
];

const LeadsKanbanPage: React.FC = () => {
  const { t } = useTranslation();
  const SOURCE_OPTIONS = SOURCE_OPTION_KEYS.map(o => ({ label: t(o.labelKey), value: o.value }));
  const queryClient = useQueryClient();

  // ── State ──
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [addPreset, setAddPreset] = useState<{ stageKey?: string; courseId?: number }>({});
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [filters, setFilters] = useState<any>({});

  // Quick-add inline
  const [quickAdd, setQuickAdd] = useState<{ stageKey: string; courseId: number | null } | null>(null);
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');

  // Add stage
  const [addStageOpen, setAddStageOpen] = useState(false);
  const [newStageLabel, setNewStageLabel] = useState('');
  const [newStageColor, setNewStageColor] = useState('#1890ff');

  // Add subject (course)
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  // Convert to student
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [convertGroupId, setConvertGroupId] = useState<number | undefined>();

  // Delete lead with reason
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLeadId, setDeleteLeadId] = useState<number | null>(null);
  const [deleteLeadName, setDeleteLeadName] = useState('');

  // ── Queries ──
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', filters],
    queryFn: () => getLeads(filters),
  });

  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  const { data: groupsData } = useQuery({
    queryKey: ['groups'],
    queryFn: () => api.get('/groups').then(r => r.data),
  });
  const groups = groupsData?.data || groupsData || [];

  const { data: selectedLead, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['lead', selectedLeadId],
    queryFn: () => getLead(selectedLeadId!),
    enabled: !!selectedLeadId,
  });

  const courses = coursesData?.data || coursesData || [];
  const stages: Stage[] = leadsData?.stages || [];
  const data: Record<string, LeadCard[]> = leadsData?.data || {};
  const counts: Record<string, number> = leadsData?.counts || {};
  const courseSummary: Record<string, CourseSummary[]> = leadsData?.courseSummary || {};

  // ── Mutations ──
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    queryClient.invalidateQueries({ queryKey: ['courses'] });
    queryClient.invalidateQueries({ queryKey: ['lead-stages'] });
  };

  const createMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      message.success(t('leads.leadCreated'));
      setAddDrawerOpen(false);
      addForm.resetFields();
      invalidateAll();
    },
    onError: () => message.error(t('common.errorOccurred')),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateLeadStatus(id, status),
    onSuccess: () => invalidateAll(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateLead(id, data),
    onSuccess: () => {
      message.success(t('leads.leadUpdated'));
      invalidateAll();
      queryClient.invalidateQueries({ queryKey: ['lead', selectedLeadId] });
    },
  });

  const convertMutation = useMutation({
    mutationFn: ({ id, groupId }: { id: number; groupId?: number }) => convertLead(id, groupId),
    onSuccess: () => {
      message.success(t('leads.convertedToStudent'));
      setDetailDrawerOpen(false);
      setConvertModalOpen(false);
      setSelectedLeadId(null);
      setConvertGroupId(undefined);
      invalidateAll();
    },
    onError: () => message.error(t('common.errorOccurred')),
  });

  const createStageMutation = useMutation({
    mutationFn: createLeadStage,
    onSuccess: () => {
      message.success(t('leads.stageCreated'));
      setAddStageOpen(false);
      setNewStageLabel('');
      invalidateAll();
    },
  });

  const deleteStageMutation = useMutation({
    mutationFn: deleteLeadStage,
    onSuccess: () => { message.success(t('leads.stageDeleted')); invalidateAll(); },
  });

  const createCourseMutation = useMutation({
    mutationFn: (name: string) => api.post('/courses', { name, price: 0 }).then(r => r.data),
    onSuccess: () => {
      message.success(t('leads.subjectCreated'));
      setAddSubjectOpen(false);
      setNewSubjectName('');
      invalidateAll();
    },
  });

  // Quick-add lead inline
  const handleQuickAdd = () => {
    if (!quickName.trim() || !quickPhone.trim() || !quickAdd) return;
    const [firstName, ...rest] = quickName.trim().split(' ');
    createMutation.mutate({
      firstName,
      lastName: rest.join(' ') || undefined,
      phone: quickPhone.trim(),
      courseId: quickAdd.courseId || undefined,
      status: quickAdd.stageKey,
    } as any);
    setQuickAdd(null);
    setQuickName('');
    setQuickPhone('');
  };

  // ── Handlers ──
  const openLeadsByCourseName = (stageKey: string, courseName: string) => {
    const key = `${stageKey}::${courseName}`;
    setExpandedCourse(expandedCourse === key ? null : key);
  };

  const openAddWithPreset = (stageKey: string, courseId: number | null) => {
    setAddPreset({ stageKey, courseId: courseId || undefined });
    addForm.setFieldsValue({ courseId: courseId || undefined });
    setAddDrawerOpen(true);
  };

  const openDetail = (lead: LeadCard) => {
    setSelectedLeadId(lead.id);
    setDetailDrawerOpen(true);
  };

  const handleConvert = () => {
    if (!selectedLeadId) return;
    setConvertGroupId(undefined);
    setConvertModalOpen(true);
  };

  const handleConvertConfirm = () => {
    if (!selectedLeadId) return;
    convertMutation.mutate({ id: selectedLeadId, groupId: convertGroupId });
  };

  const handleEditSave = () => {
    editForm.validateFields().then((values) => {
      if (selectedLeadId) updateMutation.mutate({ id: selectedLeadId, data: values });
    });
  };

  const moveToStage = (leadId: number, stageKey: string) => {
    updateStatusMutation.mutate({ id: leadId, status: stageKey });
  };

  const onDragEnd = useCallback((result: DropResult) => {
    const { draggableId, destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    const leadId = parseInt(draggableId, 10);
    const newStage = destination.droppableId;
    moveToStage(leadId, newStage);
  }, []);

  const handleDeleteStage = (stage: Stage) => {
    Modal.confirm({
      title: t('leads.confirmDeleteStage', { name: stage.label }),
      okText: t('common.delete'), okType: 'danger',
      onOk: () => deleteStageMutation.mutate(stage.id),
    });
  };

  const handleCreateStage = () => {
    if (!newStageLabel.trim()) return;
    const key = newStageLabel.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
    createStageMutation.mutate({ key, label: newStageLabel.trim(), color: newStageColor });
  };

  const handleCreateSubject = () => {
    if (!newSubjectName.trim()) return;
    createCourseMutation.mutate(newSubjectName.trim());
  };

  const handleAddLeadSubmit = (values: any) => {
    createMutation.mutate({
      ...values,
      status: addPreset.stageKey || 'lead',
    } as any);
  };

  return (
    <div className="leads-page">
      {/* ── Header ── */}
      <div className="leads-header">
        <div>
          <Title level={2} style={{ margin: 0 }}>{t('leads.title')}</Title>
          <Text type="secondary">{counts.total || 0} {t('leads.leadsCount')} — {stages.length} {t('leads.stages')} — {(Array.isArray(courses) ? courses : []).length} {t('leads.subjects')}</Text>
        </div>
      </div>

      {/* ── Analytics (always visible above kanban) ── */}
      <LeadAnalytics />

      {/* ── Control bar: filters + actions ── */}
      <div className="leads-control-bar">
        <div className="leads-filters">
          <Input placeholder={t('common.search')} prefix={<SearchOutlined />} allowClear style={{ width: 200 }}
            onChange={(e) => setFilters((p: any) => ({ ...p, search: e.target.value }))} />
          <Select placeholder={t('leads.subject')} allowClear style={{ width: 150 }}
            onChange={(v) => setFilters((p: any) => ({ ...p, courseId: v }))}
            options={(Array.isArray(courses) ? courses : []).map((c: any) => ({ label: c.name, value: c.id }))} />
          <Select placeholder={t('leads.source')} allowClear style={{ width: 140 }}
            onChange={(v) => setFilters((p: any) => ({ ...p, source: v }))} options={SOURCE_OPTIONS} />
          <RangePicker onChange={(dates) => setFilters((p: any) => ({
            ...p, startDate: dates?.[0]?.format('YYYY-MM-DD'), endDate: dates?.[1]?.format('YYYY-MM-DD'),
          }))} />
        </div>
        <div className="leads-actions">
          <Button icon={<PlusOutlined />} onClick={() => setAddSubjectOpen(true)}>{t('leads.subject')}</Button>
          <Button icon={<PlusOutlined />} onClick={() => setAddStageOpen(true)}>{t('leads.stage')}</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setAddPreset({}); setAddDrawerOpen(true); }}>{t('leads.lead')}</Button>
        </div>
      </div>

      {/* ── Kanban ── */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
        <div className="leads-kanban" role="region" aria-label="Lead boshqaruv paneli" style={{ gap: 16, minHeight: 'calc(100vh - 200px)' }}>
          {stages.map((stage) => {
            const stageLeads = data[stage.key] || [];
            const stageCS = courseSummary[stage.key] || [];
            const total = counts[stage.key] || 0;
            const assigned = stageLeads.filter(l => l.assignedToId).length;

            return (
              <div className="leads-column" key={stage.key} style={{ minWidth: 360, flex: 1 }}>
                {/* Column header */}
                <div className="leads-column-header" style={{ borderTopColor: stage.color, padding: '18px 22px', borderTopWidth: 4 }}>
                  <div className="leads-column-title">
                    <MoreOutlined className="leads-column-drag" />
                    <span className="leads-column-name" style={{ fontSize: 14, fontWeight: 800, letterSpacing: 1 }}>{stage.label.toUpperCase()}</span>
                    <span className="leads-column-count" style={{ fontSize: 14, fontWeight: 700 }}>({assigned} / {total})</span>
                  </div>
                  <div className="leads-column-actions">
                    <Tooltip title={t('leads.addLeadToStage')}>
                      <PlusOutlined className="leads-column-action-icon"
                        onClick={() => openAddWithPreset(stage.key, null)} />
                    </Tooltip>
                    <Popover trigger="click" content={
                      <Space direction="vertical" size={4}>
                        <Button size="small" type="text" icon={<EditOutlined />}
                          onClick={() => { /* navigate to settings */ }}>{t('common.edit')}</Button>
                        <Button size="small" type="text" danger icon={<DeleteOutlined />}
                          onClick={() => handleDeleteStage(stage)}>{t('common.delete')}</Button>
                      </Space>
                    }>
                      <MoreOutlined className="leads-column-action-icon" />
                    </Popover>
                  </div>
                </div>

                {/* Course rows */}
                <Droppable droppableId={stage.key}>
                {(provided, snapshot) => (
                <div className="leads-column-body" ref={provided.innerRef} {...provided.droppableProps}
                  style={{ background: snapshot.isDraggingOver ? 'rgba(99,102,241,0.05)' : undefined, transition: 'background 0.2s' }}>
                  {stageCS.map((cs) => {
                    const expandKey = `${stage.key}::${cs.courseName}`;
                    const isExpanded = expandedCourse === expandKey;
                    const courseLeads = stageLeads.filter(l =>
                      cs.courseId ? l.courseId === cs.courseId : !l.courseId
                    );
                    const isQuickAdding = quickAdd?.stageKey === stage.key && quickAdd?.courseId === cs.courseId;

                    return (
                      <div key={cs.courseName} className="leads-course-group">
                        {/* Course row */}
                        <div className={`leads-course-row ${isExpanded ? 'expanded' : ''}`}
                          style={{ padding: '18px 20px' }}
                          onClick={() => openLeadsByCourseName(stage.key, cs.courseName)}>
                          <span className="leads-course-name" style={{ fontSize: 16, fontWeight: 600 }}>{cs.courseName}</span>
                          <div className="leads-course-actions">
                            <span className="leads-course-count" style={{ fontSize: 16, fontWeight: 800 }}>{cs.assigned} / {cs.total}</span>
                            <Tooltip title={t('leads.addLead')}>
                              <PlusOutlined className="leads-course-icon" style={{ fontSize: 16 }}
                                onClick={(e) => { e.stopPropagation(); setQuickAdd({ stageKey: stage.key, courseId: cs.courseId }); }} />
                            </Tooltip>
                            <Tooltip title={t('leads.assign')}>
                              <LockOutlined className="leads-course-icon" style={{ fontSize: 16 }} />
                            </Tooltip>
                            <Tooltip title={t('leads.responsible')}>
                              <UserOutlined className="leads-course-icon" style={{ fontSize: 16 }} />
                            </Tooltip>
                            <Popover trigger="click" content={
                              <Space direction="vertical" size={4}>
                                <Button size="small" type="text"
                                  onClick={() => openAddWithPreset(stage.key, cs.courseId)}>
                                  + {t('leads.fullForm')}
                                </Button>
                                {stages.filter(s => s.key !== stage.key).map(s => (
                                  <Button key={s.key} size="small" type="text"
                                    onClick={() => courseLeads.forEach(l => moveToStage(l.id, s.key))}>
                                    Barchasini → {s.label}
                                  </Button>
                                ))}
                              </Space>
                            }>
                              <MoreOutlined className="leads-course-icon" onClick={(e) => e.stopPropagation()} />
                            </Popover>
                          </div>
                        </div>

                        {/* Quick-add inline form */}
                        {isQuickAdding && (
                          <div className="leads-quick-add">
                            <Input size="small" placeholder={t('leads.fullName')} value={quickName}
                              onChange={(e) => setQuickName(e.target.value)}
                              onPressEnter={() => document.getElementById('qa-phone')?.focus()} autoFocus />
                            <Input size="small" id="qa-phone" placeholder="+998..." value={quickPhone}
                              onChange={(e) => setQuickPhone(e.target.value)}
                              onPressEnter={handleQuickAdd} />
                            <Space size={4}>
                              <Button size="small" type="primary" onClick={handleQuickAdd}
                                loading={createMutation.isPending}>+</Button>
                              <Button size="small" onClick={() => { setQuickAdd(null); setQuickName(''); setQuickPhone(''); }}>✕</Button>
                            </Space>
                          </div>
                        )}

                        {/* Expanded leads */}
                        {isExpanded && (
                          <div className="leads-expanded">
                            {courseLeads.length === 0 ? (
                              <div className="leads-empty">{t('leads.noLeads')}</div>
                            ) : (
                              courseLeads.map((lead, leadIdx) => (
                                <Draggable key={lead.id} draggableId={String(lead.id)} index={leadIdx}>
                                {(dragProvided, dragSnapshot) => (
                                <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}
                                  className={`leads-card ${dragSnapshot.isDragging ? 'dragging' : ''}`}
                                  style={{ padding: '18px 20px', marginBottom: 10, ...dragProvided.draggableProps.style }}
                                  onClick={() => openDetail(lead)}>
                                  <div className="leads-card-top">
                                    <div>
                                      <div className="leads-card-name" style={{ fontSize: 16, fontWeight: 700 }}>{lead.firstName} {lead.lastName || ''}</div>
                                      <div className="leads-card-phone" style={{ fontSize: 14, marginTop: 2 }}>{lead.phone}</div>
                                    </div>
                                    <Button
                                      size="small" type="primary"
                                      className="leads-card-enroll"
                                      icon={<UserSwitchOutlined />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLeadId(lead.id);
                                        setConvertGroupId(undefined);
                                        setConvertModalOpen(true);
                                      }}
                                    >
                                      {t('leads.toGroup')}
                                    </Button>
                                    <Button
                                      size="small" danger type="text"
                                      icon={<DeleteOutlined />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteLeadId(lead.id);
                                        setDeleteLeadName(`${lead.firstName} ${lead.lastName || ''}`);
                                        setDeleteModalOpen(true);
                                      }}
                                    />
                                  </div>
                                  <div className="leads-card-meta">
                                    {lead.source && <Tag color="purple" style={{ fontSize: 10 }}>{lead.source}</Tag>}
                                    {lead.course && <Tag color="cyan" style={{ fontSize: 10 }}>{lead.course.name}</Tag>}
                                    <span className="leads-card-date">{dayjs(lead.createdAt).fromNow()}</span>
                                  </div>
                                  <div className="leads-card-move">
                                    {stages.filter(s => s.key !== stage.key).slice(0, 3).map(s => (
                                      <Button key={s.key} size="small" type="text" style={{ fontSize: 10, padding: '0 4px' }}
                                        onClick={(e) => { e.stopPropagation(); moveToStage(lead.id, s.key); }}>
                                        → {s.label.substring(0, 10)}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                                )}
                                </Draggable>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {stageCS.length === 0 && <div className="leads-empty">{t('leads.noLeadsInStage')}</div>}
                  {provided.placeholder}
                </div>
                )}
                </Droppable>
              </div>
            );
          })}

          {/* Add column button */}
          <div className="leads-column leads-column-add" onClick={() => setAddStageOpen(true)}>
            <PlusOutlined style={{ fontSize: 24, opacity: 0.3 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>{t('leads.addStage')}</Text>
          </div>
        </div>
        </DragDropContext>
      )}

      {/* ══ Add Stage Modal ══ */}
      <Modal title={t('leads.newStage')} open={addStageOpen} onCancel={() => setAddStageOpen(false)}
        onOk={handleCreateStage} confirmLoading={createStageMutation.isPending}
        okText={t('common.create')} cancelText={t('common.cancel')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <Input placeholder={t('leads.stageName')} value={newStageLabel} onChange={(e) => setNewStageLabel(e.target.value)}
            onPressEnter={handleCreateStage} autoFocus />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 12 }}>{t('leads.color')}:</Text>
            <ColorPicker value={newStageColor} onChange={(c) => setNewStageColor(c.toHexString())} size="small" />
          </div>
        </div>
      </Modal>

      {/* ══ Add Subject Modal ══ */}
      <Modal title={t('leads.newSubject')} open={addSubjectOpen} onCancel={() => setAddSubjectOpen(false)}
        onOk={handleCreateSubject} confirmLoading={createCourseMutation.isPending}
        okText={t('common.create')} cancelText={t('common.cancel')}>
        <Input placeholder={t('leads.subjectNamePlaceholder')} value={newSubjectName}
          onChange={(e) => setNewSubjectName(e.target.value)} onPressEnter={handleCreateSubject}
          autoFocus style={{ marginTop: 12 }} />
      </Modal>

      {/* ══ Convert to Student Modal ══ */}
      <Modal
        title={t('leads.convertToStudent')}
        open={convertModalOpen}
        onCancel={() => setConvertModalOpen(false)}
        onOk={handleConvertConfirm}
        confirmLoading={convertMutation.isPending}
        okText={t('leads.addToGroup')}
        cancelText={t('common.cancel')}
      >
        <div style={{ marginTop: 12 }}>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
            {t('leads.whichGroupToAdd', { name: `${selectedLead?.firstName} ${selectedLead?.lastName}` })}
          </Text>
          <Select
            placeholder={t('leads.selectGroup')}
            style={{ width: '100%' }}
            value={convertGroupId}
            onChange={(v) => setConvertGroupId(v)}
            showSearch
            filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
            options={(Array.isArray(groups) ? groups : []).map((g: any) => ({
              value: g.id,
              label: `${g.name} — ${g.course?.name || ''} (${g.teacher?.user?.firstName || ''})`,
            }))}
          />
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
            {t('leads.convertHint')}
          </Text>
        </div>
      </Modal>

      {/* ══ Delete Lead with Reason Modal ══ */}
      <LeadDeleteModal
        open={deleteModalOpen}
        leadId={deleteLeadId}
        leadName={deleteLeadName}
        onClose={() => { setDeleteModalOpen(false); setDeleteLeadId(null); setDeleteLeadName(''); }}
      />

      {/* ══ Add Lead Drawer ══ */}
      <Drawer title={t('leads.addLead')} open={addDrawerOpen} onClose={() => setAddDrawerOpen(false)} width={420}
        footer={<Space style={{ float: 'right' }}>
          <Button onClick={() => setAddDrawerOpen(false)}>{t('common.cancel')}</Button>
          <Button type="primary" onClick={() => addForm.submit()} loading={createMutation.isPending}>{t('common.create')}</Button>
        </Space>}>
        <Form form={addForm} layout="vertical" onFinish={handleAddLeadSubmit}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="firstName" label={t('leads.firstName')} rules={[{ required: true, message: t('common.required') }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="lastName" label={t('leads.lastName')}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="phone" label={t('leads.phone')} rules={[{ required: true, message: t('common.required') }]}>
            <Input placeholder="+998" />
          </Form.Item>
          <Form.Item name="courseId" label={t('leads.subject')} initialValue={addPreset.courseId}>
            <Select allowClear showSearch
              filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
              options={(Array.isArray(courses) ? courses : []).map((c: any) => ({ label: c.name, value: c.id }))} />
          </Form.Item>
          <Form.Item name="source" label={t('leads.source')}>
            <Select allowClear options={SOURCE_OPTIONS} />
          </Form.Item>
          <Form.Item name="note" label={t('leads.note')}><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Drawer>

      {/* ══ Lead Detail Drawer ══ */}
      <Drawer title={t('leads.leadDetails')} open={detailDrawerOpen}
        onClose={() => { setDetailDrawerOpen(false); setSelectedLeadId(null); }} width={480}
        footer={<Space style={{ float: 'right' }}>
          <Button onClick={handleEditSave} loading={updateMutation.isPending}>{t('common.save')}</Button>
          <Button type="primary" icon={<UserSwitchOutlined />} onClick={handleConvert} loading={convertMutation.isPending}>
            {t('leads.convertToStudentBtn')}
          </Button>
        </Space>}>
        {isLoadingDetail ? <Spin /> : selectedLead ? (
          <>
            <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label={t('leads.stage')}>
                <Select value={selectedLead.status} size="small" style={{ width: 220 }}
                  onChange={(v) => updateStatusMutation.mutate({ id: selectedLead.id, status: v })}
                  options={stages.map(s => ({ value: s.key, label: s.label }))} />
              </Descriptions.Item>
              <Descriptions.Item label={t('leads.createdAt')}>{dayjs(selectedLead.createdAt).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>
            </Descriptions>
            <Form form={editForm} layout="vertical" key={selectedLead.id}
              initialValues={{ firstName: selectedLead.firstName, lastName: selectedLead.lastName,
                phone: selectedLead.phone, source: selectedLead.source,
                courseId: selectedLead.courseId, note: selectedLead.note }}>
              <Row gutter={12}>
                <Col span={12}><Form.Item name="firstName" label={t('leads.firstName')}><Input /></Form.Item></Col>
                <Col span={12}><Form.Item name="lastName" label={t('leads.lastName')}><Input /></Form.Item></Col>
              </Row>
              <Form.Item name="phone" label={t('leads.phone')}><Input /></Form.Item>
              <Form.Item name="source" label={t('leads.source')}><Select allowClear options={SOURCE_OPTIONS} /></Form.Item>
              <Form.Item name="courseId" label={t('leads.subject')}>
                <Select allowClear showSearch
                  filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
                  options={(Array.isArray(courses) ? courses : []).map((c: any) => ({ label: c.name, value: c.id }))} />
              </Form.Item>
              <Form.Item name="note" label={t('leads.note')}><Input.TextArea rows={3} /></Form.Item>
            </Form>
            {selectedLead.tags?.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Text strong>{t('leads.tags')}: </Text>
                {selectedLead.tags.map((lt: any) => <Tag key={lt.tag.id} color={lt.tag.color || 'default'}>{lt.tag.name}</Tag>)}
              </div>
            )}
          </>
        ) : null}
      </Drawer>
    </div>
  );
};

export default LeadsKanbanPage;
