import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Typography, Card, Button, Space, Tag, Tabs, Modal, Form, Input, Select,
  DatePicker, message, Statistic, Row, Col, Avatar, Descriptions, Badge,
} from 'antd';
import {
  ArrowLeftOutlined, PlusOutlined, EditOutlined, UserDeleteOutlined,
  DeleteOutlined, CheckOutlined, TeamOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import {
  getHrStaff, createHrStaff, updateHrStaff, deleteHrStaff, getHrStaffStats,
  getHrGoals, createHrGoal, updateHrGoal, deleteHrGoal,
} from '@/features/hr/api';
import { useAuth } from '@/features/auth/hooks';

const { Title, Text } = Typography;

// ── Category config (will be configurable from Settings later) ──
const HR_CATS: Record<string, { labelKey: string; icon: string; color: string; positions: string[] }> = {
  teaching:  { labelKey: 'hr.cat_teaching', icon: '📚', color: '#3b82f6', positions: ['Teacher', 'Assistant Teacher', 'Tutor'] },
  admin:     { labelKey: 'hr.cat_admin', icon: '💼', color: '#6366f1', positions: ['Director', 'Branch Manager', 'Administrator', 'Accountant', 'HR Manager'] },
  sales:     { labelKey: 'hr.cat_sales', icon: '📈', color: '#f59e0b', positions: ['Sales Manager', 'Call Centre Operator', 'Marketing Manager'] },
  it:        { labelKey: 'hr.cat_it', icon: '💻', color: '#06b6d4', positions: ['IT Manager', 'IT Specialist', 'Technical Support'] },
  support:   { labelKey: 'hr.cat_support', icon: '🛠️', color: '#8b5cf6', positions: ['Security Guard', 'Cleaner'] },
};

const POS_LABEL_KEYS: Record<string, string> = {
  Teacher: 'hr.pos_teacher', 'Assistant Teacher': 'hr.pos_assistant_teacher', Tutor: 'hr.pos_tutor',
  Director: 'hr.pos_director', 'Branch Manager': 'hr.pos_branch_manager', Administrator: 'hr.pos_administrator',
  Accountant: 'hr.pos_accountant', 'HR Manager': 'hr.pos_hr_manager',
  'Sales Manager': 'hr.pos_sales_manager', 'Call Centre Operator': 'hr.pos_call_centre_operator',
  'Marketing Manager': 'hr.pos_marketing_manager',
  'IT Manager': 'hr.pos_it_manager', 'IT Specialist': 'hr.pos_it_specialist', 'Technical Support': 'hr.pos_technical_support',
  'Security Guard': 'hr.pos_security_guard', Cleaner: 'hr.pos_cleaner',
};

const STATUS_COLORS: Record<string, string> = { pending: '#fb923c', in_progress: '#6366f1', completed: '#4ade80' };
const STATUS_LABEL_KEYS: Record<string, string> = { pending: 'hr.status_pending', in_progress: 'hr.status_in_progress', completed: 'hr.status_completed' };

const CAT_ORDER = ['admin', 'teaching', 'sales', 'it', 'support'];

function tenureStr(startDate: string | null) {
  if (!startDate) return '';
  const diff = dayjs().diff(dayjs(startDate), 'month');
  if (diff >= 12) return `${Math.floor(diff / 12)} yil${diff % 12 > 0 ? ` ${diff % 12} oy` : ''}`;
  if (diff > 0) return `${diff} oy`;
  return '< 1 oy';
}

interface DrillState {
  view: 'active' | 'inactive' | 'reports';
  category: string | null;
  subject: string | null;
  section: string | null; // 'staff_flat' | 'goals' | 'staff_menu' | 'main_staff' | 'assistant_staff'
}

const HrDrilldownPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isCeoOrAdmin = user?.role === 'CEO' || user?.role === 'ADMIN';

  const [state, setState] = useState<DrillState>({ view: 'active', category: null, subject: null, section: null });
  const [staffModal, setStaffModal] = useState<{ open: boolean; editing?: any }>({ open: false });
  const [goalModal, setGoalModal] = useState<{ open: boolean; editing?: any }>({ open: false });
  const [profileModal, setProfileModal] = useState<{ open: boolean; staff?: any }>({ open: false });
  const [staffForm] = Form.useForm();
  const [goalForm] = Form.useForm();

  const staffStatus = state.view === 'inactive' ? 'INACTIVE' : 'ACTIVE';

  const { data: staffData } = useQuery({
    queryKey: ['hr-staff', staffStatus, state.category],
    queryFn: () => getHrStaff({ status: staffStatus, category: state.category || undefined }),
  });

  const { data: goals } = useQuery({
    queryKey: ['hr-goals', state.category, state.subject],
    queryFn: () => getHrGoals({ category: state.category || undefined }),
  });

  const { data: stats } = useQuery({
    queryKey: ['hr-stats'],
    queryFn: getHrStaffStats,
  });

  const staff = staffData?.data || [];
  const allGoals = goals || [];

  // Mutations
  const createStaffMut = useMutation({ mutationFn: createHrStaff, onSuccess: () => { message.success(t('hr.staff_added', "Xodim qo'shildi")); queryClient.invalidateQueries({ queryKey: ['hr-staff'] }); queryClient.invalidateQueries({ queryKey: ['hr-stats'] }); setStaffModal({ open: false }); staffForm.resetFields(); } });
  const updateStaffMut = useMutation({ mutationFn: ({ id, ...dto }: any) => updateHrStaff(id, dto), onSuccess: () => { message.success(t('common.updated', 'Yangilandi')); queryClient.invalidateQueries({ queryKey: ['hr-staff'] }); setStaffModal({ open: false }); staffForm.resetFields(); } });
  const deleteStaffMut = useMutation({ mutationFn: deleteHrStaff, onSuccess: () => { message.success(t('common.deleted', "O'chirildi")); queryClient.invalidateQueries({ queryKey: ['hr-staff'] }); queryClient.invalidateQueries({ queryKey: ['hr-stats'] }); } });
  const createGoalMut = useMutation({ mutationFn: createHrGoal, onSuccess: () => { message.success(t('hr.goal_added', "Maqsad qo'shildi")); queryClient.invalidateQueries({ queryKey: ['hr-goals'] }); setGoalModal({ open: false }); goalForm.resetFields(); } });
  const updateGoalMut = useMutation({ mutationFn: ({ id, ...dto }: any) => updateHrGoal(id, dto), onSuccess: () => { message.success(t('common.updated', 'Yangilandi')); queryClient.invalidateQueries({ queryKey: ['hr-goals'] }); setGoalModal({ open: false }); goalForm.resetFields(); } });
  const deleteGoalMut = useMutation({ mutationFn: deleteHrGoal, onSuccess: () => { message.success(t('common.deleted', "O'chirildi")); queryClient.invalidateQueries({ queryKey: ['hr-goals'] }); } });

  // ── Navigation ──
  const drillBack = () => {
    if (state.section === 'main_staff' || state.section === 'assistant_staff') {
      setState(s => ({ ...s, section: 'staff_menu' }));
    } else if (state.section === 'staff_menu' || state.section === 'goals') {
      setState(s => ({ ...s, section: null }));
    } else if (state.section === 'staff_flat') {
      setState(s => ({ ...s, section: null }));
    } else if (state.subject !== null) {
      setState(s => ({ ...s, subject: null, section: null }));
    } else if (state.category) {
      setState(s => ({ ...s, category: null, subject: null, section: null }));
    }
  };

  const BackBar = ({ title }: { title: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <Button icon={<ArrowLeftOutlined />} onClick={drillBack} type="text" style={{ fontWeight: 600 }}>{t('common.back', 'Orqaga')}</Button>
      <Title level={5} style={{ margin: 0 }}>{title}</Title>
    </div>
  );

  // ── Staff Card ──
  const StaffCard = ({ s }: { s: any }) => {
    const tenure = tenureStr(s.startDate);
    const posLabel = POS_LABEL_KEYS[s.position] ? t(POS_LABEL_KEYS[s.position]) : s.position || '';
    return (
      <Card size="small" hoverable style={{ marginBottom: 8 }} onClick={() => setProfileModal({ open: true, staff: s })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', flexShrink: 0 }} size={40}>
            {s.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {posLabel}{tenure ? ` · ${tenure}` : ''}{s.phone ? ` · ${s.phone}` : ''}
            </Text>
          </div>
          {isCeoOrAdmin && (
            <Space size={4}>
              <Button size="small" type="text" icon={<EditOutlined />} onClick={(e) => {
                e.stopPropagation();
                staffForm.setFieldsValue({ ...s, startDate: s.startDate ? dayjs(s.startDate) : undefined, endDate: s.endDate ? dayjs(s.endDate) : undefined });
                setStaffModal({ open: true, editing: s });
              }} />
              {state.view === 'active' ? (
                <Button size="small" type="text" danger icon={<UserDeleteOutlined />} onClick={(e) => {
                  e.stopPropagation();
                  Modal.confirm({ title: t('hr.deactivate', 'Deaktivlash'), content: `${s.name} ${t('hr.deactivate_confirm', 'ni deaktivlashni xohlaysizmi?')}`, okText: t('common.yes', 'Ha'), okType: 'danger',
                    onOk: () => updateStaffMut.mutate({ id: s.id, status: 'INACTIVE' }),
                  });
                }} />
              ) : (
                <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={(e) => {
                  e.stopPropagation();
                  Modal.confirm({ title: t('common.delete', "O'chirish"), content: `${s.name} ${t('hr.delete_confirm', "ni butunlay o'chirish?")}`, okText: t('common.delete', "O'chirish"), okType: 'danger',
                    onOk: () => deleteStaffMut.mutate(s.id),
                  });
                }} />
              )}
            </Space>
          )}
        </div>
      </Card>
    );
  };

  // ── Goal Block ──
  const GoalBlock = ({ category, subject }: { category: string; subject?: string }) => {
    const filtered = allGoals.filter((g: any) => g.category === category && (!subject || g.subject === subject));
    return (
      <Card size="small" style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text strong style={{ textTransform: 'uppercase', fontSize: 12, color: '#64748b' }}>🎯 {t('hr.goals', 'Maqsadlar')}</Text>
          {isCeoOrAdmin && <Button size="small" onClick={() => {
            goalForm.setFieldsValue({ category, subject: subject || '' });
            setGoalModal({ open: true });
          }}>+ {t('common.new', 'Yangi')}</Button>}
        </div>
        {filtered.length === 0 ? (
          <Text type="secondary" style={{ fontSize: 13 }}>{t('hr.no_goals', 'Maqsad belgilanmagan')}</Text>
        ) : (
          filtered.map((g: any) => (
            <div key={g.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{g.title}</div>
                {g.description && <Text type="secondary" style={{ fontSize: 12 }}>{g.description}</Text>}
                <div style={{ marginTop: 4 }}>
                  <Tag color={STATUS_COLORS[g.status]} style={{ fontSize: 11 }}>{STATUS_LABEL_KEYS[g.status] ? t(STATUS_LABEL_KEYS[g.status]) : g.status}</Tag>
                  {g.deadline && <Text type="secondary" style={{ fontSize: 11 }}>📅 {dayjs(g.deadline).format('DD.MM.YYYY')}</Text>}
                </div>
              </div>
              {isCeoOrAdmin && (
                <Space size={4}>
                  {g.status !== 'completed' && (
                    <Button size="small" type="text" icon={<CheckOutlined />} style={{ color: '#4ade80' }}
                      onClick={() => updateGoalMut.mutate({ id: g.id, status: 'completed' })} />
                  )}
                  <Button size="small" type="text" danger icon={<DeleteOutlined />}
                    onClick={() => deleteGoalMut.mutate(g.id)} />
                </Space>
              )}
            </div>
          ))
        )}
      </Card>
    );
  };

  // ═══════════════════════════════════════════
  // RENDER LEVELS
  // ═══════════════════════════════════════════

  const renderLevel0 = () => {
    const grouped: Record<string, any[]> = {};
    staff.forEach((s: any) => { if (!grouped[s.category]) grouped[s.category] = []; grouped[s.category].push(s); });
    const totalStaff = staff.length;

    return (
      <>
        <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{totalStaff}</div>
          <Text type="secondary">{state.view === 'inactive' ? t('hr.inactive_staff', 'Deaktiv xodimlar') : t('hr.active_staff', 'Faol xodimlar')}</Text>
        </div>

        {isCeoOrAdmin && state.view === 'active' && (
          <Button type="primary" block style={{ marginBottom: 16 }} icon={<PlusOutlined />}
            onClick={() => { staffForm.resetFields(); setStaffModal({ open: true }); }}>
            {t('hr.add_staff', "Xodim qo'shish")}
          </Button>
        )}

        {CAT_ORDER.map(cat => {
          const list = grouped[cat] || [];
          const config = HR_CATS[cat];
          if (!config) return null;
          return (
            <Card key={cat} size="small" hoverable style={{ marginBottom: 10, cursor: 'pointer' }}
              onClick={() => setState(s => ({ ...s, category: cat }))}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `${config.color}18`, color: config.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {config.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t(config.labelKey)}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{list.length ? `${list.length} ${t('hr.staff_count_suffix', 'ta xodim')}` : t('hr.empty', "Bo'sh")}</Text>
                  </div>
                </div>
                <Text type="secondary" style={{ fontSize: 18 }}>›</Text>
              </div>
            </Card>
          );
        })}
      </>
    );
  };

  const renderCategoryDrill = () => {
    const cat = state.category!;
    const config = HR_CATS[cat];
    if (!config) return null;

    // Teaching: show subject folders
    if (cat === 'teaching') {
      const subjects: string[] = [...new Set(staff.filter((s: any) => s.category === 'teaching').map((s: any) => s.subject).filter(Boolean) as string[])].sort();
      const goalsBySubject: Record<string, number> = {};
      allGoals.filter((g: any) => g.category === 'teaching').forEach((g: any) => {
        const k = g.subject || '';
        goalsBySubject[k] = (goalsBySubject[k] || 0) + 1;
      });

      if (state.subject !== null) return renderSubjectDrill();
      if (state.section === 'staff_flat') return renderStaffList(staff.filter((s: any) => s.category === cat));
      if (state.section === 'goals') return <><BackBar title={t('hr.goals', 'Maqsadlar')} /><GoalBlock category={cat} /></>;

      return (
        <>
          <BackBar title={t(config.labelKey)} />
          {isCeoOrAdmin && (
            <Button type="primary" block style={{ marginBottom: 12 }} icon={<PlusOutlined />}
              onClick={() => { staffForm.resetFields(); staffForm.setFieldsValue({ category: 'teaching' }); setStaffModal({ open: true }); }}>
              {t('hr.add_staff', "Xodim qo'shish")}
            </Button>
          )}
          {subjects.length === 0 ? (
            <Text type="secondary" style={{ textAlign: 'center', display: 'block', padding: 24 }}>{t('hr.no_subjects', 'Fanlar mavjud emas')}</Text>
          ) : (
            subjects.map((subj: string) => {
              const cnt = staff.filter((s: any) => s.category === 'teaching' && s.subject === subj).length;
              const gcnt = goalsBySubject[subj] || 0;
              return (
                <Card key={subj} size="small" hoverable style={{ marginBottom: 8, cursor: 'pointer' }}
                  onClick={() => setState(s => ({ ...s, subject: subj }))}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>📁</span>
                      <Text strong>{subj}</Text>
                    </div>
                    <Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>{cnt} {t('hr.staff_short', 'xodim')} · {gcnt} {t('hr.goal_short', 'maqsad')}</Text>
                      <Text type="secondary">›</Text>
                    </Space>
                  </div>
                </Card>
              );
            })
          )}
        </>
      );
    }

    // Non-teaching: show staff + goals cards
    if (state.section === 'staff_flat') return renderStaffList(staff.filter((s: any) => s.category === cat));
    if (state.section === 'goals') return <><BackBar title={t('hr.goals', 'Maqsadlar')} /><GoalBlock category={cat} /></>;

    const catStaff = staff.filter((s: any) => s.category === cat);
    const catGoals = allGoals.filter((g: any) => g.category === cat);

    return (
      <>
        <BackBar title={t(config.labelKey)} />
        {isCeoOrAdmin && (
          <Button type="primary" block style={{ marginBottom: 12 }} icon={<PlusOutlined />}
            onClick={() => { staffForm.resetFields(); staffForm.setFieldsValue({ category: cat }); setStaffModal({ open: true }); }}>
            {t('hr.add_staff', "Xodim qo'shish")}
          </Button>
        )}
        <Card size="small" hoverable style={{ marginBottom: 8, cursor: 'pointer' }}
          onClick={() => setState(s => ({ ...s, section: 'staff_flat' }))}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>👥 {t('hr.staff', 'Xodimlar')}</Text>
            <Space><Text type="secondary">{catStaff.length} {t('common.count_suffix', 'ta')}</Text><Text type="secondary">›</Text></Space>
          </div>
        </Card>
        <Card size="small" hoverable style={{ marginBottom: 8, cursor: 'pointer' }}
          onClick={() => setState(s => ({ ...s, section: 'goals' }))}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>🎯 {t('hr.goals', 'Maqsadlar')}</Text>
            <Space><Text type="secondary">{catGoals.length} {t('common.count_suffix', 'ta')}</Text><Text type="secondary">›</Text></Space>
          </div>
        </Card>
      </>
    );
  };

  const renderSubjectDrill = () => {
    const subj = state.subject!;
    const cat = 'teaching';
    const subjStaff = staff.filter((s: any) => s.category === cat && s.subject === subj);

    if (state.section === 'main_staff') {
      const filtered = subjStaff.filter((s: any) => s.position === 'Teacher');
      return <><BackBar title={t('hr.main_teachers', "Asosiy o'qituvchilar")} />{renderStaffCards(filtered)}</>;
    }
    if (state.section === 'assistant_staff') {
      const filtered = subjStaff.filter((s: any) => ['Assistant Teacher', 'Tutor'].includes(s.position));
      return <><BackBar title={t('hr.assistant_teachers', "Yordamchi o'qituvchilar")} />{renderStaffCards(filtered)}</>;
    }
    if (state.section === 'staff_menu') {
      const mainCnt = subjStaff.filter((s: any) => s.position === 'Teacher').length;
      const assistCnt = subjStaff.filter((s: any) => ['Assistant Teacher', 'Tutor'].includes(s.position)).length;
      return (
        <>
          <BackBar title={t('hr.staff', 'Xodimlar')} />
          <Card size="small" hoverable style={{ marginBottom: 8, cursor: 'pointer' }}
            onClick={() => setState(s => ({ ...s, section: 'main_staff' }))}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>{t('hr.main_teachers', "Asosiy o'qituvchilar")}</Text>
              <Space><Text type="secondary">{mainCnt} {t('common.count_suffix', 'ta')}</Text><Text type="secondary">›</Text></Space>
            </div>
          </Card>
          <Card size="small" hoverable style={{ marginBottom: 8, cursor: 'pointer' }}
            onClick={() => setState(s => ({ ...s, section: 'assistant_staff' }))}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>{t('hr.assistant_teachers', "Yordamchi o'qituvchilar")}</Text>
              <Space><Text type="secondary">{assistCnt} {t('common.count_suffix', 'ta')}</Text><Text type="secondary">›</Text></Space>
            </div>
          </Card>
        </>
      );
    }
    if (state.section === 'goals') return <><BackBar title={t('hr.goals', 'Maqsadlar')} /><GoalBlock category={cat} subject={subj} /></>;

    // Subject level: show Xodimlar + Maqsadlar cards
    const subjGoals = allGoals.filter((g: any) => g.category === cat && g.subject === subj);
    return (
      <>
        <BackBar title={subj || t('hr.no_subject', "Fan belgilanmagan")} />
        <Card size="small" hoverable style={{ marginBottom: 8, cursor: 'pointer' }}
          onClick={() => setState(s => ({ ...s, section: 'staff_menu' }))}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong>👥 {t('hr.staff', 'Xodimlar')}</Text>
            <Space><Text type="secondary">{subjStaff.length} {t('common.count_suffix', 'ta')}</Text><Text type="secondary">›</Text></Space>
          </div>
        </Card>
        <Card size="small" hoverable style={{ marginBottom: 8, cursor: 'pointer' }}
          onClick={() => setState(s => ({ ...s, section: 'goals' }))}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong>🎯 {t('hr.goals', 'Maqsadlar')}</Text>
            <Space><Text type="secondary">{subjGoals.length} {t('common.count_suffix', 'ta')}</Text><Text type="secondary">›</Text></Space>
          </div>
        </Card>
      </>
    );
  };

  const renderStaffList = (list: any[]) => (
    <>
      <BackBar title={t('hr.staff', 'Xodimlar')} />
      {isCeoOrAdmin && (
        <Button type="primary" block style={{ marginBottom: 12 }} icon={<PlusOutlined />}
          onClick={() => { staffForm.resetFields(); staffForm.setFieldsValue({ category: state.category }); setStaffModal({ open: true }); }}>
          {t('hr.add_staff', "Xodim qo'shish")}
        </Button>
      )}
      {renderStaffCards(list)}
    </>
  );

  const renderStaffCards = (list: any[]) => (
    list.length === 0
      ? <Text type="secondary" style={{ textAlign: 'center', display: 'block', padding: 24 }}>{t('hr.no_staff', "Xodim yo'q")}</Text>
      : list.map((s: any) => <StaffCard key={s.id} s={s} />)
  );

  const renderReports = () => (
    <>
      <Row gutter={[16, 16]}>
        <Col span={8}><Card size="small"><Statistic title={t('hr.total_staff', 'Jami xodimlar')} value={stats?.total || 0} prefix={<TeamOutlined />} /></Card></Col>
        <Col span={8}><Card size="small"><Statistic title={t('hr.active', 'Faol')} value={stats?.byStatus?.find((s: any) => s.status === 'ACTIVE')?.count || 0} valueStyle={{ color: '#4ade80' }} /></Card></Col>
        <Col span={8}><Card size="small"><Statistic title={t('hr.inactive', 'Deaktiv')} value={stats?.byStatus?.find((s: any) => s.status === 'INACTIVE')?.count || 0} valueStyle={{ color: '#f87171' }} /></Card></Col>
      </Row>
      <Card size="small" style={{ marginTop: 16 }}>
        <Title level={5}>{t('hr.by_department', "Bo'limlar bo'yicha")}</Title>
        {(stats?.byCategory || []).map((c: any) => (
          <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <Text>{HR_CATS[c.category] ? t(HR_CATS[c.category].labelKey) : c.category}</Text>
            <Text strong>{c.count}</Text>
          </div>
        ))}
      </Card>
    </>
  );

  // ═══════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════


  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>{t('hr.title', 'HR')}</Title>

      {/* View tabs — only at level 0 */}
      {!state.category && (
        <Tabs
          activeKey={state.view}
          onChange={(key) => setState({ view: key as any, category: null, subject: null, section: null })}
          items={[
            { key: 'active', label: t('hr.active', 'Faol') },
            { key: 'inactive', label: t('hr.inactive_tab', 'Ishlamaydi') },
            { key: 'reports', label: t('hr.reports', 'Hisobot') },
          ]}
          style={{ marginBottom: 16 }}
        />
      )}

      {state.view === 'reports' ? renderReports() : (
        state.category ? renderCategoryDrill() : renderLevel0()
      )}

      {/* ══ Staff Profile Modal ══ */}
      <Modal open={profileModal.open} onCancel={() => setProfileModal({ open: false })} footer={null} title={profileModal.staff?.name} width={480}>
        {profileModal.staff && (
          <div style={{ padding: '8px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Avatar size={56} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: 22, fontWeight: 700 }}>
                {profileModal.staff.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div style={{ marginTop: 8, fontWeight: 700, fontSize: 17 }}>{profileModal.staff.name}</div>
              <Text type="secondary">{POS_LABEL_KEYS[profileModal.staff.position] ? t(POS_LABEL_KEYS[profileModal.staff.position]) : profileModal.staff.position} · {HR_CATS[profileModal.staff.category] ? t(HR_CATS[profileModal.staff.category].labelKey) : profileModal.staff.category}</Text>
            </div>
            <Descriptions column={1} size="small" bordered>
              {profileModal.staff.phone && <Descriptions.Item label={t('hr.phone', 'Telefon')}>{profileModal.staff.phone}</Descriptions.Item>}
              {profileModal.staff.startDate && <Descriptions.Item label={t('hr.start_date', 'Ishga kirgan')}>{dayjs(profileModal.staff.startDate).format('DD.MM.YYYY')}</Descriptions.Item>}
              {profileModal.staff.startDate && <Descriptions.Item label={t('hr.tenure', 'Ish staji')}>{tenureStr(profileModal.staff.startDate)}</Descriptions.Item>}
              {profileModal.staff.endDate && <Descriptions.Item label={t('hr.end_date', 'Ketgan sana')}><Text type="danger">{dayjs(profileModal.staff.endDate).format('DD.MM.YYYY')}</Text></Descriptions.Item>}
              <Descriptions.Item label={t('common.status', 'Holat')}>
                <Badge status={profileModal.staff.status === 'ACTIVE' ? 'success' : 'error'} text={profileModal.staff.status === 'ACTIVE' ? t('hr.active', 'Faol') : t('hr.inactive', 'Deaktiv')} />
              </Descriptions.Item>
              {profileModal.staff.subject && <Descriptions.Item label={t('hr.subject', 'Fan')}>{profileModal.staff.subject}</Descriptions.Item>}
              {profileModal.staff.notes && <Descriptions.Item label={t('hr.notes', 'Izoh')}>{profileModal.staff.notes}</Descriptions.Item>}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* ══ Staff Add/Edit Modal ══ */}
      <Modal
        title={staffModal.editing ? t('hr.edit_staff', 'Xodimni tahrirlash') : t('hr.add_staff', "Xodim qo'shish")}
        open={staffModal.open}
        onCancel={() => { setStaffModal({ open: false }); staffForm.resetFields(); }}
        onOk={() => staffForm.submit()}
        confirmLoading={createStaffMut.isPending || updateStaffMut.isPending}
        okText={staffModal.editing ? t('common.save', 'Saqlash') : t('common.add', "Qo'shish")}
        cancelText={t('common.cancel', 'Bekor')}
        destroyOnClose
      >
        <Form form={staffForm} layout="vertical" onFinish={(values) => {
          const payload = {
            ...values,
            startDate: values.startDate?.format('YYYY-MM-DD'),
            endDate: values.endDate?.format('YYYY-MM-DD'),
          };
          if (staffModal.editing) {
            updateStaffMut.mutate({ id: staffModal.editing.id, ...payload });
          } else {
            createStaffMut.mutate(payload);
          }
        }}>
          <Form.Item name="name" label={t('hr.name', 'Ism')} rules={[{ required: true, message: t('common.required', 'Kiriting') }]}><Input /></Form.Item>
          <Form.Item name="phone" label={t('hr.phone', 'Telefon')}><Input placeholder="+998..." /></Form.Item>
          <Form.Item name="category" label={t('hr.department', "Bo'lim")} rules={[{ required: true }]}>
            <Select options={CAT_ORDER.map(k => ({ value: k, label: t(HR_CATS[k].labelKey) }))} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.category !== cur.category}>
            {({ getFieldValue }) => {
              const cat = getFieldValue('category');
              const positions = cat && HR_CATS[cat] ? HR_CATS[cat].positions : [];
              return (
                <Form.Item name="position" label={t('hr.position', 'Lavozim')} rules={[{ required: true }]}>
                  <Select options={positions.map(p => ({ value: p, label: POS_LABEL_KEYS[p] ? t(POS_LABEL_KEYS[p]) : p }))} />
                </Form.Item>
              );
            }}
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.category !== cur.category}>
            {({ getFieldValue }) => getFieldValue('category') === 'teaching' ? (
              <Form.Item name="subject" label={t('hr.subject', 'Fan')}><Input placeholder={t('hr.subject_placeholder', 'Ingliz tili, Matematika...')} /></Form.Item>
            ) : null}
          </Form.Item>
          <Form.Item name="startDate" label={t('hr.start_date', 'Ishga kirgan sana')}><DatePicker style={{ width: '100%' }} /></Form.Item>
          {staffModal.editing && <Form.Item name="endDate" label={t('hr.end_date', 'Ketgan sana')}><DatePicker style={{ width: '100%' }} /></Form.Item>}
          {staffModal.editing && (
            <Form.Item name="status" label={t('common.status', 'Holat')}>
              <Select options={[{ value: 'ACTIVE', label: t('hr.active', 'Faol') }, { value: 'INACTIVE', label: t('hr.inactive', 'Deaktiv') }]} />
            </Form.Item>
          )}
          <Form.Item name="notes" label={t('hr.notes', 'Izoh')}><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* ══ Goal Add Modal ══ */}
      <Modal
        title={t('hr.add_goal', "Maqsad qo'shish")}
        open={goalModal.open}
        onCancel={() => { setGoalModal({ open: false }); goalForm.resetFields(); }}
        onOk={() => goalForm.submit()}
        confirmLoading={createGoalMut.isPending}
        okText={t('common.add', "Qo'shish")}
        cancelText={t('common.cancel', 'Bekor')}
        destroyOnClose
      >
        <Form form={goalForm} layout="vertical" onFinish={(values) => {
          const payload = { ...values, deadline: values.deadline?.format('YYYY-MM-DD') };
          createGoalMut.mutate(payload);
        }}>
          <Form.Item name="title" label={t('hr.goal_name', 'Maqsad nomi')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label={t('hr.description', 'Tavsif')}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="category" label={t('hr.department', "Bo'lim")} hidden><Input /></Form.Item>
          <Form.Item name="subject" label={t('hr.subject', 'Fan')} hidden><Input /></Form.Item>
          <Form.Item name="deadline" label={t('hr.deadline', 'Muddat')}><DatePicker style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HrDrilldownPage;
