import { useState } from 'react';
import {
  Typography, Button, Card, Modal, Form, Input, message,
  Spin, Empty, Tag, Popconfirm, Row, Col, Statistic, Drawer, Select, List, Avatar,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined,
  PhoneOutlined, EnvironmentOutlined, TeamOutlined, CheckCircleOutlined,
  StopOutlined, UserAddOutlined, UserDeleteOutlined, UserOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../lib/axios';

const { Title, Text } = Typography;

interface Branch {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    users?: number;
    students?: number;
    groups?: number;
    leads?: number;
    courses?: number;
  };
}

const BranchesPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [usersDrawerBranch, setUsersDrawerBranch] = useState<Branch | null>(null);
  const [addUserId, setAddUserId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches-admin'],
    queryFn: () => api.get('/branches').then(r => r.data),
  });

  // Users for the selected branch
  const { data: branchUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['branch-users', usersDrawerBranch?.id],
    queryFn: () => api.get(`/branches/${usersDrawerBranch!.id}/users`).then(r => r.data),
    enabled: !!usersDrawerBranch,
  });

  // All users for the "add user" dropdown
  const { data: allUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => api.get('/users').then(r => r.data?.data || r.data || []),
    enabled: !!usersDrawerBranch,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/branches', data).then(r => r.data),
    onSuccess: () => {
      message.success(t('settings.branchCreated'));
      setModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['branches-admin'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.patch(`/branches/${id}`, data).then(r => r.data),
    onSuccess: () => {
      message.success(t('settings.branchUpdated'));
      setModalOpen(false);
      setEditingBranch(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['branches-admin'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/branches/${id}`).then(r => r.data),
    onSuccess: () => {
      message.success(t('settings.branchDeleted'));
      queryClient.invalidateQueries({ queryKey: ['branches-admin'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const assignMutation = useMutation({
    mutationFn: ({ branchId, userId }: { branchId: number; userId: number }) =>
      api.post(`/branches/${branchId}/users`, { userId }).then(r => r.data),
    onSuccess: () => {
      message.success(t('settings.userAssignedToBranch'));
      setAddUserId(null);
      queryClient.invalidateQueries({ queryKey: ['branch-users', usersDrawerBranch?.id] });
      queryClient.invalidateQueries({ queryKey: ['branches-admin'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const removeMutation = useMutation({
    mutationFn: ({ branchId, userId }: { branchId: number; userId: number }) =>
      api.delete(`/branches/${branchId}/users/${userId}`).then(r => r.data),
    onSuccess: () => {
      message.success(t('settings.userRemovedFromBranch'));
      queryClient.invalidateQueries({ queryKey: ['branch-users', usersDrawerBranch?.id] });
      queryClient.invalidateQueries({ queryKey: ['branches-admin'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const openCreate = () => {
    setEditingBranch(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setEditingBranch(branch);
    form.setFieldsValue({ name: branch.name, address: branch.address, phone: branch.phone });
    setModalOpen(true);
  };

  const handleSubmit = (values: any) => {
    if (editingBranch) {
      updateMutation.mutate({ id: editingBranch.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            <BankOutlined style={{ marginRight: 8 }} />{t('settings.branchManagement')}
          </Title>
          <Text type="secondary">
            {t('settings.branchManagementDesc', { count: (branches || []).length })}
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={openCreate}>
          {t('settings.newBranch')}
        </Button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : !branches?.length ? (
        <Empty description={t('settings.noBranchesFound')} />
      ) : (
        <Row gutter={[16, 16]}>
          {branches.map((branch: Branch) => (
            <Col xs={24} md={12} lg={8} key={branch.id}>
              <Card
                hoverable
                style={{ borderRadius: 14, height: '100%' }}
                actions={[
                  <Button type="text" icon={<TeamOutlined />} onClick={() => setUsersDrawerBranch(branch)} key="users">
                    {t('settings.employees')}
                  </Button>,
                  <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(branch)} key="edit">
                    {t('common.edit')}
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title={t('settings.deleteBranchConfirm', { name: branch.name })}
                    description={t('settings.deleteBranchDescription')}
                    okText={t('common.delete')}
                    okType="danger"
                    onConfirm={() => deleteMutation.mutate(branch.id)}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>{t('common.delete')}</Button>
                  </Popconfirm>,
                ]}
              >
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Title level={4} style={{ margin: 0 }}>{branch.name}</Title>
                    <Tag color={branch.isActive ? 'green' : 'red'} icon={branch.isActive ? <CheckCircleOutlined /> : <StopOutlined />}>
                      {branch.isActive ? t('common.active') : t('common.inactive')}
                    </Tag>
                  </div>

                  {branch.address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <EnvironmentOutlined style={{ color: '#6366f1', fontSize: 14 }} />
                      <Text type="secondary" style={{ fontSize: 13 }}>{branch.address}</Text>
                    </div>
                  )}

                  {branch.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PhoneOutlined style={{ color: '#10b981', fontSize: 14 }} />
                      <Text type="secondary" style={{ fontSize: 13 }}>{branch.phone}</Text>
                    </div>
                  )}
                </div>

                <Row gutter={8}>
                  <Col span={8}>
                    <Statistic
                      title={<span style={{ fontSize: 11 }}><TeamOutlined /> {t('settings.employees')}</span>}
                      value={branch._count?.users || 0}
                      valueStyle={{ fontSize: 20 }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title={<span style={{ fontSize: 11 }}>{t('common.students')}</span>}
                      value={branch._count?.students || 0}
                      valueStyle={{ fontSize: 20 }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title={<span style={{ fontSize: 11 }}>{t('common.groups')}</span>}
                      value={branch._count?.groups || 0}
                      valueStyle={{ fontSize: 20 }}
                    />
                  </Col>
                </Row>

                <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8' }}>
                  {t('common.created')}: {new Date(branch.createdAt).toLocaleDateString('uz-UZ')}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Create / Edit Modal */}
      <Modal
        title={editingBranch ? t('settings.editBranch', { name: editingBranch.name }) : t('settings.addBranch')}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingBranch(null); form.resetFields(); }}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="name" label={t('settings.branchName')} rules={[{ required: true, message: t('common.nameRequired') }]}>
            <Input placeholder={t('settings.branchNamePlaceholder')} size="large" />
          </Form.Item>

          <Form.Item name="address" label={t('settings.address')}>
            <Input placeholder={t('settings.addressPlaceholder')} prefix={<EnvironmentOutlined />} />
          </Form.Item>

          <Form.Item name="phone" label={t('settings.phone')}>
            <Input placeholder="+998901234567" prefix={<PhoneOutlined />} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button onClick={() => { setModalOpen(false); setEditingBranch(null); }}>{t('common.cancel')}</Button>
            <Button type="primary" htmlType="submit"
              loading={createMutation.isPending || updateMutation.isPending}>
              {editingBranch ? t('common.save') : t('common.create')}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Users Drawer */}
      <Drawer
        title={usersDrawerBranch ? `${usersDrawerBranch.name} — ${t('settings.employees')}` : t('settings.employees')}
        open={!!usersDrawerBranch}
        onClose={() => { setUsersDrawerBranch(null); setAddUserId(null); }}
        width={480}
      >
        {/* Add user */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <Select
            placeholder={t('settings.selectEmployee')}
            style={{ flex: 1 }}
            value={addUserId}
            onChange={setAddUserId}
            showSearch
            filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
            options={(Array.isArray(allUsers) ? allUsers : [])
              .filter((u: any) => !(branchUsers || []).some((bu: any) => bu.id === u.id))
              .map((u: any) => ({ value: u.id, label: `${u.firstName} ${u.lastName || ''} (${u.role})` }))}
          />
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            disabled={!addUserId}
            loading={assignMutation.isPending}
            onClick={() => {
              if (addUserId && usersDrawerBranch) {
                assignMutation.mutate({ branchId: usersDrawerBranch.id, userId: addUserId });
              }
            }}
          >
            {t('common.add')}
          </Button>
        </div>

        {/* User list */}
        {usersLoading ? <Spin /> : (
          <List
            dataSource={branchUsers || []}
            locale={{ emptyText: t('settings.noEmployeesInBranch') }}
            renderItem={(user: any) => (
              <List.Item
                actions={[
                  <Popconfirm
                    key="remove"
                    title={t('settings.removeUserConfirm', { name: user.firstName })}
                    onConfirm={() => usersDrawerBranch && removeMutation.mutate({ branchId: usersDrawerBranch.id, userId: user.id })}
                    okText={t('common.yes')}
                    okType="danger"
                  >
                    <Button size="small" danger icon={<UserDeleteOutlined />} type="text">{t('common.remove')}</Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} style={{ background: user.role === 'CEO' ? '#f59e0b' : user.role === 'ADMIN' ? '#6366f1' : user.role === 'MANAGER' ? '#10b981' : user.role === 'TEACHER' ? '#3b82f6' : '#94a3b8' }} />}
                  title={<span>{user.firstName} {user.lastName || ''}</span>}
                  description={<><Tag color={user.role === 'CEO' ? 'gold' : user.role === 'ADMIN' ? 'purple' : user.role === 'MANAGER' ? 'green' : user.role === 'TEACHER' ? 'blue' : 'default'}>{user.role}</Tag> {user.phone}</>}
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </div>
  );
};

export default BranchesPage;
