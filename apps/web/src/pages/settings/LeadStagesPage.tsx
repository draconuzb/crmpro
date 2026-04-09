import React, { useState } from 'react';
import {
  Typography, Button, Input, ColorPicker, Space, Modal, message, Spin, Empty,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined,
  HolderOutlined, ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  getLeadStages, createLeadStage, updateLeadStage, deleteLeadStage, reorderLeadStages,
} from '../../features/leads/api';

const { Title, Text } = Typography;

interface Stage {
  id: number;
  key: string;
  label: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

const LeadStagesPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newColor, setNewColor] = useState('#1890ff');

  const { data: stages, isLoading } = useQuery({
    queryKey: ['lead-stages'],
    queryFn: getLeadStages,
  });

  const createMut = useMutation({
    mutationFn: createLeadStage,
    onSuccess: () => {
      message.success(t('settings.stageCreated'));
      setAddModalOpen(false);
      setNewLabel(''); setNewKey(''); setNewColor('#1890ff');
      queryClient.invalidateQueries({ queryKey: ['lead-stages'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateLeadStage(id, data),
    onSuccess: () => {
      message.success(t('settings.stageUpdated'));
      setEditingStage(null);
      queryClient.invalidateQueries({ queryKey: ['lead-stages'] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteLeadStage,
    onSuccess: () => {
      message.success(t('settings.stageDeleted'));
      queryClient.invalidateQueries({ queryKey: ['lead-stages'] });
    },
  });

  const reorderMut = useMutation({
    mutationFn: reorderLeadStages,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lead-stages'] }),
  });

  const handleCreate = () => {
    if (!newLabel.trim()) { message.warning(t('common.enterName')); return; }
    const key = newKey.trim() || newLabel.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    createMut.mutate({ key, label: newLabel.trim(), color: newColor });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (!stages?.length) return;
    const ids = stages.map((s: Stage) => s.id);
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= ids.length) return;
    [ids[index], ids[newIdx]] = [ids[newIdx], ids[index]];
    reorderMut.mutate(ids);
  };

  const handleDelete = (stage: Stage) => {
    Modal.confirm({
      title: t('settings.deleteStageConfirm', { name: stage.label }),
      content: t('settings.deleteStageDescription'),
      okText: t('common.delete'),
      okType: 'danger',
      onOk: () => deleteMut.mutate(stage.id),
    });
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>{t('settings.leadStages')}</Title>
          <Text type="secondary">{t('settings.leadStagesDescription')}</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
          {t('settings.addStage')}
        </Button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : !stages?.length ? (
        <Empty description={t('settings.noStagesFound')} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {stages.map((stage: Stage, idx: number) => (
            <div
              key={stage.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 10,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Drag handle + color */}
              <HolderOutlined style={{ color: 'rgba(255,255,255,0.2)', cursor: 'grab' }} />
              <div style={{
                width: 16, height: 16, borderRadius: 4,
                background: stage.color, flexShrink: 0,
                boxShadow: `0 0 8px ${stage.color}40`,
              }} />

              {/* Label */}
              {editingStage?.id === stage.id ? (
                <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                  <Input
                    size="small"
                    value={editingStage.label}
                    onChange={(e) => setEditingStage({ ...editingStage, label: e.target.value })}
                    onPressEnter={() => updateMut.mutate({ id: stage.id, data: { label: editingStage.label, color: editingStage.color } })}
                    style={{ flex: 1 }}
                  />
                  <ColorPicker
                    size="small"
                    value={editingStage.color}
                    onChange={(c) => setEditingStage({ ...editingStage, color: c.toHexString() })}
                  />
                  <Button size="small" type="primary"
                    onClick={() => updateMut.mutate({ id: stage.id, data: { label: editingStage.label, color: editingStage.color } })}
                    loading={updateMut.isPending}>
                    {t('common.save')}
                  </Button>
                  <Button size="small" onClick={() => setEditingStage(null)}>{t('common.cancel')}</Button>
                </div>
              ) : (
                <>
                  <div style={{ flex: 1 }}>
                    <Text strong>{stage.label}</Text>
                    <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>({stage.key})</Text>
                  </div>

                  {/* Actions */}
                  <Space size={4}>
                    <Button size="small" type="text" icon={<ArrowUpOutlined />}
                      disabled={idx === 0} onClick={() => handleMove(idx, 'up')} />
                    <Button size="small" type="text" icon={<ArrowDownOutlined />}
                      disabled={idx === stages.length - 1} onClick={() => handleMove(idx, 'down')} />
                    <Button size="small" type="text" icon={<EditOutlined />}
                      onClick={() => setEditingStage({ ...stage })} />
                    <Button size="small" type="text" danger icon={<DeleteOutlined />}
                      onClick={() => handleDelete(stage)} />
                  </Space>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        title={t('settings.addStage')}
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onOk={handleCreate}
        confirmLoading={createMut.isPending}
        okText={t('common.create')}
        cancelText={t('common.cancel')}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <div>
            <Text strong style={{ fontSize: 12 }}>{t('settings.stageName')} *</Text>
            <Input
              placeholder={t('settings.stageNamePlaceholder')}
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
          </div>
          <div>
            <Text strong style={{ fontSize: 12 }}>{t('settings.keySlug')}</Text>
            <Input
              placeholder={t('settings.autoGenerated')}
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
            <Text type="secondary" style={{ fontSize: 11 }}>{t('settings.autoGeneratedHint')}</Text>
          </div>
          <div>
            <Text strong style={{ fontSize: 12 }}>{t('common.color')}</Text>
            <div><ColorPicker value={newColor} onChange={(c) => setNewColor(c.toHexString())} /></div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeadStagesPage;
