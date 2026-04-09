import { Card, Row, Col, Typography, Tag, Space, Spin, Empty } from "antd";
import {
  AppstoreOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyTeacherGroups } from "../../features/me/api";
const { Title, Text } = Typography;
const TeacherGroups: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["my-teacher-groups"],
    queryFn: getMyTeacherGroups,
  });
  if (isLoading)
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  if (!data || data.length === 0)
    return <Empty description="Guruhlar topilmadi" />;
  return (
    <>
      <Title level={3}>
        <AppstoreOutlined style={{ color: "#8b5cf6", marginRight: 8 }} />
        Guruhlarim
      </Title>
      <Row gutter={[16, 16]}>
        {data.map((g: any) => (
          <Col xs={24} sm={12} key={g.id}>
            <Card
              hoverable
              style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
              onClick={() => navigate("/t/groups/" + g.id)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Title level={5} style={{ margin: 0 }}>
                  {g.name}
                </Title>
                <Tag color="green">{g.status}</Tag>
              </div>
              <Space direction="vertical" size={4}>
                <Text>
                  <UserOutlined style={{ color: "#6366f1", marginRight: 6 }} />
                  {g.students?.length || 0} oquvchi
                </Text>
                <Text>
                  <ClockCircleOutlined
                    style={{ color: "#f59e0b", marginRight: 6 }}
                  />
                  {g.startTime} - {g.endTime}
                </Text>
                <Text type="secondary">{g.course?.name}</Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};
export default TeacherGroups;
