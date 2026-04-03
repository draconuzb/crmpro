import { useState } from 'react';
import {
  Card, Button, Input, Typography, Breadcrumb, Space, Spin, List, Tag, DatePicker, Row, Col, Divider,
} from 'antd';
import { RobotOutlined, SendOutlined, SearchOutlined, BarChartOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { aiAnalyze, aiDetectAnomalies, aiAsk, getAiHistory } from '../../features/ai/api';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const TYPE_COLORS: Record<string, string> = {
  daily_analysis: 'blue',
  anomaly: 'red',
  qa_response: 'green',
  weekly_summary: 'purple',
};

const TYPE_LABELS: Record<string, string> = {
  daily_analysis: 'Tahlil',
  anomaly: 'Anomaliya',
  qa_response: 'Savol-Javob',
  weekly_summary: 'Haftalik',
};

const AiInsightsPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'day'), dayjs(),
  ]);

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['ai-history'],
    queryFn: () => getAiHistory(20),
  });

  const analyzeMut = useMutation({
    mutationFn: () => aiAnalyze({
      reportType: 'weekly',
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD'),
    }),
    onSuccess: (data) => setAnswer(data.analysis),
  });

  const anomalyMut = useMutation({
    mutationFn: () => aiDetectAnomalies({
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD'),
    }),
    onSuccess: (data) => setAnswer(data.anomalies),
  });

  const askMut = useMutation({
    mutationFn: () => aiAsk(question),
    onSuccess: (data) => { setAnswer(data.answer); setQuestion(''); },
  });

  const isLoading = analyzeMut.isPending || anomalyMut.isPending || askMut.isPending;

  return (
    <>
      <Breadcrumb items={[{ title: 'AI Insights' }]} style={{ marginBottom: 16 }} />
      <Title level={2}><RobotOutlined /> AI Insights</Title>

      <Row gutter={24}>
        {/* Left: Controls */}
        <Col xs={24} lg={10}>
          <Card title="Davr tanlash" style={{ marginBottom: 16 }}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              style={{ width: '100%', marginBottom: 16 }}
            />
            <Space>
              <Button
                type="primary"
                icon={<BarChartOutlined />}
                loading={analyzeMut.isPending}
                onClick={() => analyzeMut.mutate()}
              >
                Tahlil qilish
              </Button>
              <Button
                icon={<SearchOutlined />}
                loading={anomalyMut.isPending}
                onClick={() => anomalyMut.mutate()}
              >
                Anomaliyalar
              </Button>
            </Space>
          </Card>

          <Card title="Savol berish" style={{ marginBottom: 16 }}>
            <TextArea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Savolingizni kiriting..."
              style={{ marginBottom: 12 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={askMut.isPending}
              onClick={() => askMut.mutate()}
              disabled={!question.trim()}
            >
              Yuborish
            </Button>
          </Card>
        </Col>

        {/* Right: Result & History */}
        <Col xs={24} lg={14}>
          {/* Current Result */}
          {(answer || isLoading) && (
            <Card title="Natija" style={{ marginBottom: 16 }}>
              {isLoading ? <Spin /> : <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{answer}</Paragraph>}
            </Card>
          )}

          {/* History */}
          <Card title="Tarix">
            <List
              loading={historyLoading}
              dataSource={history || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag color={TYPE_COLORS[item.type]}>{TYPE_LABELS[item.type] || item.type}</Tag>
                        <Text type="secondary">{new Date(item.createdAt).toLocaleString()}</Text>
                      </Space>
                    }
                    description={
                      <Paragraph ellipsis={{ rows: 2, expandable: true }} style={{ marginBottom: 0 }}>
                        {item.content}
                      </Paragraph>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AiInsightsPage;
