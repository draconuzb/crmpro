import {
  Card,
  Typography,
  Statistic,
  Row,
  Col,
  Spin,
  Empty,
  Table,
} from "antd";
import { DollarOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getMyTeacherSalary } from "../../features/me/api";
const { Title } = Typography;
const TeacherSalary: React.FC = () => {
  const now = new Date();
  const { data, isLoading } = useQuery({
    queryKey: ["my-teacher-salary"],
    queryFn: () => getMyTeacherSalary(now.getMonth() + 1, now.getFullYear()),
  });
  if (isLoading)
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  const total = (data || []).reduce(
    (s: number, r: any) => s + Number(r.amount || 0),
    0,
  );
  return (
    <>
      <Title level={3}>
        <DollarOutlined style={{ color: "#f59e0b", marginRight: 8 }} />
        Oyligim
      </Title>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Card
            style={{ borderRadius: 14, background: "#d1fae5", border: "none" }}
          >
            <Statistic
              title="Bu oy"
              value={total}
              suffix="UZS"
              valueStyle={{ color: "#10b981" }}
            />
          </Card>
        </Col>
      </Row>
      <Card style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}>
        {!data || data.length === 0 ? (
          <Empty description="Oylik hali hisoblanmagan" />
        ) : (
          <Table
            dataSource={data}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: "Summa",
                dataIndex: "amount",
                render: (v: any) => Number(v).toLocaleString() + " UZS",
              },
              {
                title: "Tolandi",
                dataIndex: "isPaid",
                render: (v: boolean) => (v ? "Ha" : "Yoq"),
              },
            ]}
          />
        )}
      </Card>
    </>
  );
};
export default TeacherSalary;
