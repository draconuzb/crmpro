import { Card, Table, Typography, Button, Tag, Space, Spin } from "antd";
import { CheckSquareOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyTeacherGroupDetail } from "../../features/me/api";
const { Title } = Typography;
const TeacherGroupDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: group, isLoading } = useQuery({
    queryKey: ["my-teacher-group", id],
    queryFn: () => getMyTeacherGroupDetail(Number(id)),
    enabled: !!id,
  });
  if (isLoading)
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  if (!group) return null;
  const students = (group.students || []).map((gs: any) => ({
    id: gs.student?.id || gs.id,
    name: gs.student?.user
      ? gs.student.user.firstName + " " + (gs.student.user.lastName || "")
      : "N/A",
    phone: gs.student?.user?.phone || "",
  }));
  return (
    <>
      <Space style={{ marginBottom: 20 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          type="text"
          onClick={() => navigate("/t/groups")}
        />
        <Title level={3} style={{ margin: 0 }}>
          {group.name}
        </Title>
        <Tag color="blue">{group.course?.name}</Tag>
      </Space>
      <Card
        title={"Oquvchilar (" + students.length + ")"}
        style={{ borderRadius: 14, border: "1px solid #e2e8f0" }}
        extra={
          <Button type="primary" icon={<CheckSquareOutlined />}>
            Davomat olish
          </Button>
        }
      >
        <Table
          dataSource={students}
          rowKey="id"
          pagination={false}
          scroll={{ x: 400 }}
          columns={[
            { title: "Ism", dataIndex: "name" },
            { title: "Telefon", dataIndex: "phone" },
          ]}
        />
      </Card>
    </>
  );
};
export default TeacherGroupDetail;
