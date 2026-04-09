import React from 'react';
import {
  Typography,
  Breadcrumb,
  Card,
  Form,
  InputNumber,
  Button,
  Divider,
  message,
  Spin,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../lib/axios';

const { Title, Text } = Typography;

const DEFAULT_COIN_RULES = {
  perfect_attendance_streak: 10,
  high_grade_bonus: 5,
  homework_completion: 3,
  exam_top_score: 15,
  monthly_best_student: 20,
  no_absence_month: 8,
};

const getRuleLabels = (t: any): Record<string, { label: string; description: string }> => ({
  perfect_attendance_streak: {
    label: t('gamification.perfectAttendance'),
    description: t('gamification.perfectAttendanceDesc'),
  },
  high_grade_bonus: {
    label: t('gamification.highGrade'),
    description: t('gamification.highGradeDesc'),
  },
  homework_completion: {
    label: t('gamification.homeworkCompletion'),
    description: t('gamification.homeworkCompletionDesc'),
  },
  exam_top_score: {
    label: t('gamification.examTopScore'),
    description: t('gamification.examTopScoreDesc'),
  },
  monthly_best_student: {
    label: t('gamification.monthlyBestStudent'),
    description: t('gamification.monthlyBestStudentDesc'),
  },
  no_absence_month: {
    label: t('gamification.noAbsenceMonth'),
    description: t('gamification.noAbsenceMonthDesc'),
  },
});

const getCoinRules = () =>
  api.get('/branch-config/coin_rules').then((r) => r.data?.value || DEFAULT_COIN_RULES).catch(() => DEFAULT_COIN_RULES);

const saveCoinRules = (rules: Record<string, number>) =>
  api.put('/branch-config/coin_rules', { value: rules }).then((r) => r.data);

const CoinRulesPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { data: rules, isLoading } = useQuery({
    queryKey: ['coinRules'],
    queryFn: getCoinRules,
  });

  const saveMutation = useMutation({
    mutationFn: saveCoinRules,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coinRules'] });
      message.success(t('gamification.coinRulesSaved'));
    },
    onError: () => {
      message.error(t('common.saveError'));
    },
  });

  const handleSave = () => {
    form.validateFields().then((values) => {
      saveMutation.mutate(values);
    });
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <Breadcrumb
        items={[{ title: t('common.settings') }, { title: t('gamification.coinRules') }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('gamification.coinRules')}</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        {t('gamification.coinRulesDescription')}
      </Text>

      <Card style={{ maxWidth: 600 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={rules || DEFAULT_COIN_RULES}
        >
          {Object.entries(getRuleLabels(t)).map(([key, { label, description }]) => (
            <Form.Item
              key={key}
              name={key}
              label={
                <div>
                  <div style={{ fontWeight: 600 }}>{label}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{description}</Text>
                </div>
              }
              rules={[{ required: true, message: t('common.valueRequired') }]}
            >
              <InputNumber
                min={0}
                max={1000}
                addonAfter="coin"
                style={{ width: '100%' }}
              />
            </Form.Item>
          ))}

          <Divider />

          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saveMutation.isPending}
            block
          >
            {t('common.save')}
          </Button>
        </Form>
      </Card>
    </>
  );
};

export default CoinRulesPage;
