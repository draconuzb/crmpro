import { useState } from 'react';
import {
  Breadcrumb,
  Typography,
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Space,
  Spin,
  Statistic,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { Dayjs } from 'dayjs';
import { getConversionReport } from '../../features/reports/api';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const SOURCE_OPTIONS = [
  { label: 'All Sources', value: '' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Telegram', value: 'telegram' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Website', value: 'website' },
  { label: 'Referral', value: 'referral' },
  { label: 'Walk-in', value: 'walk_in' },
  { label: 'Other', value: 'other' },
];

interface FunnelStep {
  label: string;
  key: string;
  color: string;
  widthPercent: number;
}

const FUNNEL_STEPS: FunnelStep[] = [
  { label: 'Incoming', key: 'incoming', color: '#1677ff', widthPercent: 100 },
  { label: 'Waiting', key: 'waiting', color: '#13c2c2', widthPercent: 85 },
  { label: 'Set', key: 'set', color: '#faad14', widthPercent: 65 },
  { label: 'Attended', key: 'attended', color: '#fa8c16', widthPercent: 45 },
  { label: 'Paid', key: 'paid', color: '#52c41a', widthPercent: 30 },
];

const ConversionPage: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [source, setSource] = useState<string>('');
  const [staff, setStaff] = useState<string>('');

  const params: Record<string, string> = {};
  if (dateRange) {
    params.startDate = dateRange[0].format('YYYY-MM-DD');
    params.endDate = dateRange[1].format('YYYY-MM-DD');
  }
  if (source) params.source = source;
  if (staff) params.staffId = staff;

  const { data, isLoading } = useQuery({
    queryKey: ['conversion-report', params],
    queryFn: () => getConversionReport(params),
  });

  const funnelData: Record<string, number> = {
    incoming: data?.incoming ?? 0,
    waiting: data?.waiting ?? 0,
    set: data?.set ?? 0,
    attended: data?.attended ?? 0,
    paid: data?.paid ?? 0,
  };

  const overallRate =
    funnelData.incoming > 0
      ? ((funnelData.paid / funnelData.incoming) * 100).toFixed(1)
      : '0.0';

  const getStepPercentage = (index: number): string => {
    if (index === 0) return '100%';
    const prev = funnelData[FUNNEL_STEPS[index - 1].key];
    const curr = funnelData[FUNNEL_STEPS[index].key];
    if (prev === 0) return '0%';
    return ((curr / prev) * 100).toFixed(1) + '%';
  };

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Reports' }, { title: 'Conversion' }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.conversion')}</Title>

      <Card style={{ marginBottom: 24 }}>
        <Space wrap size="middle">
          <RangePicker
            value={dateRange}
            onChange={(values) =>
              setDateRange(values as [Dayjs, Dayjs] | null)
            }
            allowClear
          />
          <Select
            style={{ width: 180 }}
            placeholder="Source"
            value={source || undefined}
            onChange={(val) => setSource(val ?? '')}
            allowClear
            options={SOURCE_OPTIONS}
          />
          <Select
            style={{ width: 180 }}
            placeholder="Staff"
            value={staff || undefined}
            onChange={(val) => setStaff(val ?? '')}
            allowClear
            options={[{ label: 'All Staff', value: '' }]}
          />
        </Space>
      </Card>

      <Spin spinning={isLoading}>
        <Card title="Conversion Funnel" style={{ marginBottom: 24 }}>
          <div style={{ padding: '16px 0' }}>
            {FUNNEL_STEPS.map((step, index) => {
              const count = funnelData[step.key];
              const pct = getStepPercentage(index);
              return (
                <div
                  key={step.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <div style={{ width: 100, textAlign: 'right', marginRight: 16 }}>
                    <Text strong>{step.label}</Text>
                  </div>
                  <div
                    style={{
                      width: `${step.widthPercent}%`,
                      maxWidth: '70%',
                      background: step.color,
                      borderRadius: 6,
                      padding: '10px 16px',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 14,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      minHeight: 44,
                      transition: 'width 0.3s ease',
                    }}
                  >
                    <span>{count}</span>
                    <span style={{ fontSize: 12, opacity: 0.9 }}>
                      {index === 0 ? '' : `${pct} of prev`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Sales Pipeline Summary">
          <Row gutter={24}>
            <Col span={6}>
              <Statistic title="Total Incoming" value={funnelData.incoming} />
            </Col>
            <Col span={6}>
              <Statistic title="Total Paid" value={funnelData.paid} />
            </Col>
            <Col span={6}>
              <Statistic
                title="Overall Conversion Rate"
                value={overallRate}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Drop-off"
                value={funnelData.incoming - funnelData.paid}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
          </Row>
        </Card>
      </Spin>
    </>
  );
};

export default ConversionPage;
