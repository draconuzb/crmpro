import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Breadcrumb,
  Typography,
  Card,
  Button,
  Radio,
  DatePicker,
  Statistic,
  Table,
  Row,
  Col,
  Progress,
  Space,
  Tag,
  Divider,
  Spin,
  Empty,
  Result,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs, { type Dayjs } from 'dayjs';
import { getDashboardOverview } from '@/features/analytics/api';
import { downloadDailyPdf, downloadWeeklyPdf, downloadMonthlyPdf } from '@/features/pdf/api';

const { Title, Text } = Typography;

type ReportType = 'kunlik' | 'xaftalik' | 'oylik' | 'umumiy';

const REPORT_TYPE_KEYS: Record<ReportType, string> = {
  kunlik: 'reports.daily',
  xaftalik: 'reports.weekly',
  oylik: 'reports.monthly',
  umumiy: 'reports.overall',
};

const fmtMoney = (n: number) => n?.toLocaleString('uz-UZ') || '0';

const DeltaTag: React.FC<{ current: number; previous: number; suffix?: string; invert?: boolean }> = ({
  current,
  previous,
  suffix = '',
  invert = false,
}) => {
  if (!previous) return null;
  const delta = previous !== 0 ? Math.round(((current - previous) / previous) * 100) : 0;
  if (delta === 0) return <Tag color="default">0%</Tag>;
  const isGood = invert ? delta < 0 : delta > 0;
  return (
    <Tag
      icon={delta > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
      color={isGood ? 'success' : 'error'}
    >
      {delta > 0 ? '+' : ''}
      {delta}%{suffix}
    </Tag>
  );
};

const HisobotlarPage: React.FC = () => {
  const { t } = useTranslation();

  const REPORT_TYPES = (Object.entries(REPORT_TYPE_KEYS) as [ReportType, string][]).map(
    ([value, key]) => ({ label: t(key), value }),
  );

  const [reportType, setReportType] = useState<ReportType>('oylik');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [generated, setGenerated] = useState(false);

  // Build params based on report type
  const params = useMemo(() => {
    if (reportType === 'umumiy') return {};

    if (reportType === 'kunlik') {
      const day = selectedDate.format('YYYY-MM-DD');
      return { range: `${day},${day}` };
    }

    if (reportType === 'xaftalik') {
      const start = selectedDate.startOf('week').format('YYYY-MM-DD');
      const end = selectedDate.endOf('week').format('YYYY-MM-DD');
      return { range: `${start},${end}` };
    }

    // oylik
    return { month: selectedDate.format('YYYY-MM') };
  }, [reportType, selectedDate]);

  // Previous month params (for comparison)
  const prevParams = useMemo(() => {
    if (reportType !== 'oylik') return null;
    const prev = selectedDate.subtract(1, 'month');
    return { month: prev.format('YYYY-MM') };
  }, [reportType, selectedDate]);

  const {
    data: report,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['hisobot', reportType, params],
    queryFn: () => getDashboardOverview(params),
    enabled: generated,
  });

  const [showComparison, setShowComparison] = useState(false);

  const { data: prevReport, isLoading: prevLoading } = useQuery({
    queryKey: ['hisobot-prev', prevParams],
    queryFn: () => getDashboardOverview(prevParams!),
    enabled: generated && showComparison && !!prevParams,
  });

  const handleGenerate = () => {
    setGenerated(true);
    setShowComparison(false);
    refetch();
  };

  // ── Data extraction ──
  const finance = report?.finance?.total || { income: 0, expense: 0 };
  const balance = finance.income - finance.expense;
  const leads = report?.leads || { total: 0, bySubject: [] };
  const attendance = report?.attendance || { expected: 0, attended: 0, rate: 0 };
  const debtors = report?.debtors?.total || { count: 0, amount: 0 };
  const problems = report?.problems || [];
  const branches = report?.finance?.byBranch || [];

  // Previous data
  const prevFinance = prevReport?.finance?.total || { income: 0, expense: 0 };
  const prevLeads = prevReport?.leads || { total: 0 };
  const prevAttendance = prevReport?.attendance || { rate: 0 };
  const prevDebtors = prevReport?.debtors?.total || { count: 0, amount: 0 };

  // ── Export helpers ──
  const handleExportCSV = () => {
    if (!report) return;
    const rows = [
      [t('reports.section'), t('reports.metric'), t('reports.value')],
      [t('reports.finance'), t('reports.income'), finance.income],
      [t('reports.finance'), t('reports.expense'), finance.expense],
      [t('reports.finance'), t('reports.balance'), balance],
      [t('reports.leads'), t('common.total'), leads.total],
      [t('reports.attendance'), t('reports.percentage'), attendance.rate + '%'],
      [t('reports.debtors'), t('reports.count'), debtors.count],
      [t('reports.debtors'), t('reports.amount'), debtors.amount],
      [t('reports.problems'), t('reports.open'), problems.length],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hisobot_${reportType}_${selectedDate.format('YYYY-MM-DD')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    try {
      if (reportType === 'kunlik') {
        await downloadDailyPdf(selectedDate.format('YYYY-MM-DD'));
      } else if (reportType === 'xaftalik') {
        const start = selectedDate.startOf('week').format('YYYY-MM-DD');
        const end = selectedDate.endOf('week').format('YYYY-MM-DD');
        await downloadWeeklyPdf(start, end);
      } else {
        await downloadMonthlyPdf(selectedDate.format('YYYY-MM'));
      }
    } catch {
      window.print();
    }
  };

  // ── Comparison table ──
  const comparisonColumns = [
    { title: t('reports.metric'), dataIndex: 'metric', key: 'metric' },
    { title: t('reports.currentMonth'), dataIndex: 'current', key: 'current' },
    { title: t('reports.previousMonth'), dataIndex: 'previous', key: 'previous' },
    {
      title: t('reports.difference'),
      dataIndex: 'delta',
      key: 'delta',
      render: (_: unknown, record: { current: number; previous: number; invert?: boolean }) => (
        <DeltaTag current={record.current} previous={record.previous} invert={record.invert} />
      ),
    },
  ];

  const comparisonData = prevReport
    ? [
        { key: '1', metric: t('reports.income'), current: fmtMoney(finance.income), previous: fmtMoney(prevFinance.income), invert: false },
        { key: '2', metric: t('reports.expense'), current: fmtMoney(finance.expense), previous: fmtMoney(prevFinance.expense), invert: true },
        { key: '3', metric: t('reports.leads'), current: leads.total, previous: prevLeads.total, invert: false },
        { key: '4', metric: t('reports.attendancePercent'), current: attendance.rate, previous: prevAttendance.rate, invert: false },
        { key: '5', metric: t('reports.debtorsCount'), current: debtors.count, previous: prevDebtors.count, invert: true },
        { key: '6', metric: t('reports.debtorsAmount'), current: fmtMoney(Number(debtors.amount)), previous: fmtMoney(Number(prevDebtors.amount)), invert: true },
      ]
    : [];

  return (
    <>
      <Breadcrumb
        items={[{ title: t('reports.title') }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('reports.title')}</Title>

      {/* ── Controls ── */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Radio.Group
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setGenerated(false);
              setShowComparison(false);
            }}
            optionType="button"
            buttonStyle="solid"
            options={REPORT_TYPES}
          />

          <Space wrap size="middle" align="center">
            {reportType !== 'umumiy' && (
              <DatePicker
                value={selectedDate}
                onChange={(val) => val && setSelectedDate(val)}
                picker={reportType === 'oylik' ? 'month' : 'date'}
                allowClear={false}
              />
            )}
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleGenerate}
              size="large"
            >
              {t('reports.generate')}
            </Button>
          </Space>
        </Space>
      </Card>

      {/* ── Error state ── */}
      {error && generated && (
        <Result status="error" title={t('reports.errorOccurred')} extra={<Button onClick={() => refetch()}>{t('reports.retry')}</Button>} />
      )}

      {/* ── Report body ── */}
      {!generated ? (
        <Card>
          <Empty description={t('reports.selectAndGenerate')} />
        </Card>
      ) : (
        <Spin spinning={isLoading}>
          {/* 1. Moliya */}
          <Card
            title={t('reports.finance')}
            extra={
              <Space>
                <Button icon={<DownloadOutlined />} onClick={handleExportCSV} size="small">
                  CSV
                </Button>
                <Button icon={<DownloadOutlined />} onClick={handleExportPDF} size="small">
                  PDF
                </Button>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title={t('reports.income')}
                  value={finance.income}
                  formatter={(val) => fmtMoney(Number(val))}
                  valueStyle={{ color: '#52c41a' }}
                  suffix={t('reports.currency')}
                />
                <Progress
                  percent={finance.income + finance.expense > 0 ? Math.round((finance.income / (finance.income + finance.expense)) * 100) : 0}
                  strokeColor="#52c41a"
                  showInfo={false}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title={t('reports.expense')}
                  value={finance.expense}
                  formatter={(val) => fmtMoney(Number(val))}
                  valueStyle={{ color: '#ff4d4f' }}
                  suffix={t('reports.currency')}
                />
                <Progress
                  percent={finance.income + finance.expense > 0 ? Math.round((finance.expense / (finance.income + finance.expense)) * 100) : 0}
                  strokeColor="#ff4d4f"
                  showInfo={false}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title={t('reports.balance')}
                  value={balance}
                  formatter={(val) => fmtMoney(Number(val))}
                  valueStyle={{ color: balance >= 0 ? '#1677ff' : '#ff4d4f' }}
                  suffix={t('reports.currency')}
                />
              </Col>
            </Row>
          </Card>

          {/* 2. Leadlar */}
          <Card title={t('reports.leads')} style={{ marginBottom: 16 }}>
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={8}>
                <Statistic title={t('reports.totalLeads')} value={leads.total} />
              </Col>
              <Col xs={24} sm={16}>
                {leads.bySubject && leads.bySubject.length > 0 ? (
                  <div>
                    <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
                      {t('reports.bySubject')}
                    </Text>
                    <Space wrap>
                      {leads.bySubject.map((s: { name: string; count: number }) => (
                        <Tag key={s.name} color="blue">
                          {s.name}: {s.count}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                ) : (
                  <Text type="secondary">{t('reports.noSubjectData')}</Text>
                )}
              </Col>
            </Row>
          </Card>

          {/* 3. Rad etilganlar */}
          {report?.rejections && (
            <Card title={t('reports.rejections')} style={{ marginBottom: 16 }}>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={8}>
                  <Statistic
                    title={t('reports.totalRejections')}
                    value={report.rejections.total || 0}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
                <Col xs={24} sm={16}>
                  {report.rejections.byType && report.rejections.byType.length > 0 && (
                    <Space wrap>
                      {report.rejections.byType.map((r: { type: string; count: number }) => (
                        <Tag key={r.type} color="red">
                          {r.type}: {r.count}
                        </Tag>
                      ))}
                    </Space>
                  )}
                </Col>
              </Row>
            </Card>
          )}

          {/* 4. Davomat */}
          <Card title={t('reports.attendance')} style={{ marginBottom: 16 }}>
            <Row gutter={[24, 16]} align="middle">
              <Col xs={12} sm={6}>
                <Statistic title={t('reports.expected')} value={attendance.expected || 0} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title={t('reports.attended')} value={attendance.attended || 0} />
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={attendance.rate || 0}
                    strokeColor={attendance.rate >= 80 ? '#52c41a' : attendance.rate >= 60 ? '#faad14' : '#ff4d4f'}
                    size={100}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">{t('reports.attendancePercent')}</Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* 5. Qarzdorlar */}
          <Card title={t('reports.debtors')} style={{ marginBottom: 16 }}>
            <Row gutter={[24, 16]}>
              <Col xs={12} sm={12}>
                <Statistic
                  title={t('reports.debtorsCount')}
                  value={debtors.count}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col xs={12} sm={12}>
                <Statistic
                  title={t('reports.totalDebtAmount')}
                  value={Number(debtors.amount)}
                  formatter={(val) => fmtMoney(Number(val))}
                  valueStyle={{ color: '#ff4d4f' }}
                  suffix={t('reports.currency')}
                />
              </Col>
            </Row>
          </Card>

          {/* 6. Muammolar */}
          <Card title={t('reports.problems')} style={{ marginBottom: 16 }}>
            <Statistic
              title={t('reports.openProblems')}
              value={problems.length}
              valueStyle={{ color: problems.length > 0 ? '#faad14' : '#52c41a' }}
            />
          </Card>

          {/* 7. Filiallar bo'yicha */}
          {branches.length > 1 && (
            <Card title={t('reports.byBranch')} style={{ marginBottom: 16 }}>
              <Table
                dataSource={branches.map((b: { branchName: string; income: number; expense: number }, i: number) => ({
                  key: i,
                  branch: b.branchName,
                  income: b.income,
                  expense: b.expense,
                  balance: b.income - b.expense,
                }))}
                columns={[
                  { title: t('reports.branch'), dataIndex: 'branch', key: 'branch' },
                  {
                    title: t('reports.income'),
                    dataIndex: 'income',
                    key: 'income',
                    render: (v: number) => fmtMoney(v) + " " + t('reports.currency'),
                  },
                  {
                    title: t('reports.expense'),
                    dataIndex: 'expense',
                    key: 'expense',
                    render: (v: number) => fmtMoney(v) + " " + t('reports.currency'),
                  },
                  {
                    title: t('reports.balance'),
                    dataIndex: 'balance',
                    key: 'balance',
                    render: (v: number) => (
                      <Text style={{ color: v >= 0 ? '#52c41a' : '#ff4d4f' }}>
                        {fmtMoney(v)} {t('reports.currency')}
                      </Text>
                    ),
                  },
                ]}
                pagination={false}
                size="small"
              />
            </Card>
          )}

          <Divider />

          {/* ── Monthly comparison ── */}
          {reportType === 'oylik' && (
            <Card style={{ marginBottom: 16 }}>
              <Button
                type={showComparison ? 'primary' : 'default'}
                onClick={() => setShowComparison(!showComparison)}
                loading={prevLoading && showComparison}
              >
                {t('reports.compareWithPrevious')}
              </Button>

              {showComparison && prevReport && (
                <Table
                  style={{ marginTop: 16 }}
                  dataSource={comparisonData}
                  columns={comparisonColumns}
                  pagination={false}
                  size="small"
                />
              )}
            </Card>
          )}
        </Spin>
      )}
    </>
  );
};

export default HisobotlarPage;
