import { useState } from 'react';
import { Modal, Select, Input, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRejectionReasons, deleteLeadWithReason } from '@/features/rejections/api';

const { TextArea } = Input;

interface LeadDeleteModalProps {
  open: boolean;
  leadId: number | null;
  leadName?: string;
  onClose: () => void;
}

const LeadDeleteModal: React.FC<LeadDeleteModalProps> = ({ open, leadId, leadName, onClose }) => {
  const queryClient = useQueryClient();
  const [reasonId, setReasonId] = useState<number | undefined>();
  const [note, setNote] = useState('');

  const { data: reasons } = useQuery({
    queryKey: ['rejection-reasons'],
    queryFn: getRejectionReasons,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: deleteLeadWithReason,
    onSuccess: () => {
      message.success('Lead o\'chirildi');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      handleClose();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  const handleClose = () => {
    setReasonId(undefined);
    setNote('');
    onClose();
  };

  const handleOk = () => {
    if (!reasonId) {
      message.warning('Sababni tanlang');
      return;
    }
    if (!leadId) return;
    mutation.mutate({ leadId, reasonId, note: note || undefined });
  };

  return (
    <Modal
      title={`Leadni o'chirish${leadName ? `: ${leadName}` : ''}`}
      open={open}
      onOk={handleOk}
      onCancel={handleClose}
      okText="O'chirish"
      cancelText="Bekor qilish"
      okButtonProps={{ danger: true, loading: mutation.isPending }}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 6, fontWeight: 500 }}>Rad etish sababi *</div>
        <Select
          placeholder="Sababni tanlang..."
          value={reasonId}
          onChange={setReasonId}
          style={{ width: '100%' }}
          options={reasons?.map((r: any) => ({ value: r.id, label: r.label })) || []}
        />
      </div>
      <div>
        <div style={{ marginBottom: 6, fontWeight: 500 }}>Izoh (ixtiyoriy)</div>
        <TextArea
          placeholder="Qo'shimcha izoh..."
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
        />
      </div>
    </Modal>
  );
};

export default LeadDeleteModal;
