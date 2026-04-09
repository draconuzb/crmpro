import {
  Card,
  Row,
  Col,
  Typography,
  List,
  Tag,
  Spin,
  Empty,
  Result,
  Button,
} from "antd";
import {
  AppstoreOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../features/auth/hooks";
import { getMyTeacherDashboard } from "../../features/me/api";
const { Title } = Typography;
const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const n = user?.firstName
    ? user.firstName + " " + (user.lastName || "")
    : "Teacher";
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["my-teacher-dashboard"],
    queryFn: getMyTeacherDashboard,
  });
  if (isLoading)
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  if (error) return <Result status="error" title="Xatolik yuz berdi" subTitle="Ma'lumotlar yuklanmadi" extra={<Button onClick={() => refetch()}>Qayta urinish</Button>} />;
  const s = data || {
    groups: 0,
    todayLessons: 0,
    avgAttendance: 0,
    todaySchedule: [],
  };
  return (
    <>
      <Title level={3}>Xush kelibsiz, {n.trim()}!</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            title: "Guruhlarim",
            value: s.groups,
            icon: <AppstoreOutlined />,
            bg: "#ede9fe",
            color: "#8b5cf6",
          },
          {
            title: "Bugungi darslar",
            value: s.todayLessons,
            icon: <CalendarOutlined />,
            bg: "#dbeafe",
            color: "#3b82f6",
          },
          {
            title: "Davomat",
            value: s.avgAttendance + "%",
            icon: <CheckSquareOutlined />,
            bg: "#d1fae5",
            color: "#10b981",
          },
        ].map((item, i) => (
          <Col xs={24} sm={8} key={i}>
            <Card
              size="small"
              style={{ borderRadius: 14, background: item.bg, border: "none" }}
            >
              <div style={{ color: item.color, fontSize: 22, marginBottom: 8 }}>
                {item.icon}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{item.value}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{item.title}</div>
            </Card>
          </Col>
        ))}
      </Row>
      <Card
        title="Bugungi jadval"
        style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
      >
        {s.todaySchedule.length === 0 ? (
          <Empty description="Bugun dars yoq" />
        ) : (
          <List
            dataSource={s.todaySchedule}
            renderItem={(item: any) => (
              <List.Item>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      background: "#eff6ff",
                      borderRadius: 10,
                      padding: "6px 12px",
                      minWidth: 110,
                      textAlign: "center",
                    }}
                  >
                    <ClockCircleOutlined
                      style={{ color: "#3b82f6", marginRight: 4 }}
                    />
                    <strong>{item.time}</strong>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.group}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {item.room}
                    </div>
                  </div>
                  <Tag>{item.students} oquvchi</Tag>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </>
  );
};
export default TeacherDashboard;
