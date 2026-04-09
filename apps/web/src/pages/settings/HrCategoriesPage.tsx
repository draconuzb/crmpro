import React from 'react';
import {
  Typography,
  Breadcrumb,
  Card,
  Table,
  Tag,
  Alert,
} from 'antd';

const { Title } = Typography;

const HR_CATEGORIES = [
  {
    key: 'teaching',
    label: "O'qituvchi xodimlari",
    color: '#3b82f6',
    positions: ['Teacher', 'Assistant Teacher', 'Tutor'],
  },
  {
    key: 'admin',
    label: 'Management',
    color: '#6366f1',
    positions: ['Director', 'Branch Manager', 'Administrator', 'Accountant', 'HR Manager'],
  },
  {
    key: 'sales',
    label: 'Sotuv va Marketing',
    color: '#f59e0b',
    positions: ['Sales Manager', 'Call Centre Operator', 'Marketing Manager'],
  },
  {
    key: 'it',
    label: "IT bo'limi",
    color: '#06b6d4',
    positions: ['IT Manager', 'IT Specialist', 'Technical Support'],
  },
  {
    key: 'support',
    label: 'Yordamchi xodimlar',
    color: '#8b5cf6',
    positions: ['Security Guard', 'Cleaner'],
  },
];

const HrCategoriesPage: React.FC = () => {
  const columns = [
    {
      title: 'Rang',
      dataIndex: 'color',
      key: 'color',
      width: 60,
      render: (color: string) => (
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: color,
            border: '1px solid #d9d9d9',
          }}
        />
      ),
    },
    { title: 'Kalit', dataIndex: 'key', key: 'key' },
    { title: 'Nomi', dataIndex: 'label', key: 'label' },
    {
      title: 'Lavozimlar',
      dataIndex: 'positions',
      key: 'positions',
      render: (positions: string[]) => (
        <>
          {positions.map((p) => (
            <Tag key={p} style={{ marginBottom: 4 }}>{p}</Tag>
          ))}
        </>
      ),
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Sozlamalar' }, { title: 'HR kategoriyalari' }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>HR kategoriyalari</Title>

      <Alert
        message="Tez kunda - kategoriyalar sozlanishi mumkin bo'ladi"
        description="Hozircha HR kategoriyalari tizimda qattiq kodlangan. Keyingi yangilanishda ularni to'liq boshqarish imkoniyati qo'shiladi."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card title="Joriy kategoriyalar">
        <Table
          columns={columns}
          dataSource={HR_CATEGORIES}
          rowKey="key"
          pagination={false}
        />
      </Card>
    </>
  );
};

export default HrCategoriesPage;
