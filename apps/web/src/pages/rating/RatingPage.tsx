import { useState } from 'react';
import { Card, Table, Select, DatePicker, Space, Typography, Tag } from 'antd';
import { StarOutlined, BarChartOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getRatings, getRatingChart } from '@/features/rating/api';
import { getGroups } from '@/features/groups/api';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const RatingPage: React.FC = () => {
  const { t } = useTranslation();
  const [groupId, setGroupId] = useState<number | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const params: any = {};
  if (groupId) params.groupId = groupId;
  if (dateRange) {
    params.startDate = dateRange[0];
    params.endDate = dateRange[1];
  }

  const { data: ratings = [], isLoading } = useQuery({
    queryKey: ['ratings', params],
    queryFn: () => getRatings(params),
  });

  const { data: chartData = [] } = useQuery({
    queryKey: ['ratings-chart', params],
    queryFn: () => getRatingChart(params),
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups-list'],
    queryFn: () => getGroups(),
  });

  const groupOptions = (Array.isArray(groups) ? groups : groups?.data || []).map((g: any) => ({
    label: g.name,
    value: g.id,
  }));

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_: any, __: any, i: number) => i + 1,
    },
    {
      title: t('student', "O'quvchi"),
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: t('group', 'Guruh'),
      dataIndex: 'groupName',
      key: 'groupName',
    },
    {
      title: t('score', 'Ball'),
      dataIndex: 'score',
      key: 'score',
      sorter: (a: any, b: any) => a.score - b.score,
      render: (score: number) => {
        const color = score >= 80 ? 'green' : score >= 50 ? 'orange' : 'red';
        return <Tag color={color}>{score}</Tag>;
      },
    },
    {
      title: t('period', 'Davr'),
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: t('date', 'Sana'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => dayjs(d).format('DD.MM.YYYY'),
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <StarOutlined /> {t('ratings', 'Reyting')}
        </Title>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            allowClear
            placeholder={t('selectGroup', 'Guruhni tanlang')}
            style={{ width: 220 }}
            options={groupOptions}
            value={groupId}
            onChange={setGroupId}
          />
          <RangePicker
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
              } else {
                setDateRange(null);
              }
            }}
          />
        </Space>
      </Card>

      {chartData.length > 0 && (
        <Card title={<><BarChartOutlined /> Top 20</>} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {chartData.map((item: any, i: number) => (
              <Tag
                key={i}
                color={item.score >= 80 ? 'green' : item.score >= 50 ? 'gold' : 'red'}
              >
                {item.studentName}: {item.score}
              </Tag>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={ratings}
          loading={isLoading}
          pagination={{ pageSize: 20 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default RatingPage;
