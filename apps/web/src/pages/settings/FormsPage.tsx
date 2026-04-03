import { useState, useEffect } from 'react';
import {
  Typography,
  Breadcrumb,
  Table,
  Button,
  Switch,
  Space,
  Drawer,
  Form,
  Input,
  Select,
  Card,
  Row,
  Col,
  Popconfirm,
  message,
  Spin,
  Divider,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getForms, createForm, updateForm, deleteForm } from '../../features/settings/api';

const { Title, Text } = Typography;

interface FormField {
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

interface FormRecord {
  id: number;
  title: string;
  fields: FormField[];
  isActive: boolean;
  createdAt: string;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
];

const FormsPage: React.FC = () => {
  const { t } = useTranslation();
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<FormRecord | null>(null);
  const [form] = Form.useForm();

  const loadForms = async () => {
    try {
      const data = await getForms();
      setForms(data);
    } catch {
      message.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  const openDrawer = (record?: FormRecord) => {
    if (record) {
      setEditingForm(record);
      form.setFieldsValue({
        title: record.title,
        fields: record.fields,
      });
    } else {
      setEditingForm(null);
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title,
        fields: values.fields || [],
        isActive: true,
      };

      if (editingForm) {
        await updateForm(editingForm.id, payload);
        message.success('Form updated');
      } else {
        await createForm(payload);
        message.success('Form created');
      }
      setDrawerOpen(false);
      form.resetFields();
      setEditingForm(null);
      loadForms();
    } catch {
      message.error('Failed to save form');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteForm(id);
      message.success('Form deleted');
      loadForms();
    } catch {
      message.error('Failed to delete form');
    }
  };

  const handleToggleActive = async (id: number, active: boolean) => {
    try {
      await updateForm(id, { isActive: active });
      loadForms();
    } catch {
      message.error('Failed to update form');
    }
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Fields Count',
      key: 'fieldsCount',
      render: (_: unknown, record: FormRecord) => {
        const fields = Array.isArray(record.fields) ? record.fields : [];
        return fields.length;
      },
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean, record: FormRecord) => (
        <Switch
          checked={active}
          size="small"
          onChange={(val) => handleToggleActive(record.id, val)}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: FormRecord) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openDrawer(record)}
          />
          <Popconfirm title="Delete this form?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Settings' }, { title: 'Forms' }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.forms')}</Title>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => openDrawer()}
        style={{ marginBottom: 16 }}
      >
        Add Form
      </Button>

      <Table columns={columns} dataSource={forms} rowKey="id" pagination={false} />

      <Drawer
        title={editingForm ? 'Edit Form' : 'Create Form'}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          form.resetFields();
          setEditingForm(null);
        }}
        width={720}
        extra={
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Form Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Registration Form" />
          </Form.Item>

          <Divider>Fields</Divider>

          <Row gutter={24}>
            <Col span={14}>
              <Form.List name="fields">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <Card
                        key={field.key}
                        size="small"
                        style={{ marginBottom: 12 }}
                        extra={
                          <MinusCircleOutlined
                            style={{ color: '#ff4d4f' }}
                            onClick={() => remove(field.name)}
                          />
                        }
                      >
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item
                              name={[field.name, 'label']}
                              label="Label"
                              rules={[{ required: true }]}
                            >
                              <Input placeholder="Field label" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name={[field.name, 'type']}
                              label="Type"
                              rules={[{ required: true }]}
                            >
                              <Select options={FIELD_TYPES} placeholder="Select type" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item
                              name={[field.name, 'required']}
                              label="Required"
                              valuePropName="checked"
                              initialValue={false}
                            >
                              <Switch size="small" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item noStyle shouldUpdate>
                          {() => {
                            const fieldType = form.getFieldValue([
                              'fields',
                              field.name,
                              'type',
                            ]);
                            if (fieldType === 'select') {
                              return (
                                <Form.Item
                                  name={[field.name, 'options']}
                                  label="Options (comma separated)"
                                >
                                  <Input placeholder="Option A, Option B, Option C" />
                                </Form.Item>
                              );
                            }
                            return null;
                          }}
                        </Form.Item>
                      </Card>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add({ type: 'text', label: '', required: false })}
                      icon={<PlusOutlined />}
                      block
                    >
                      Add Field
                    </Button>
                  </>
                )}
              </Form.List>
            </Col>

            <Col span={10}>
              <Card title="Preview" size="small" style={{ background: '#fafafa' }}>
                <Form.Item noStyle shouldUpdate>
                  {() => {
                    const fieldsList: FormField[] = form.getFieldValue('fields') || [];
                    if (fieldsList.length === 0) {
                      return <Text type="secondary">Add fields to see preview</Text>;
                    }
                    return (
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {fieldsList.map((f, idx) => (
                          <div key={idx}>
                            <Text strong>
                              {f.label || `Field ${idx + 1}`}
                            </Text>
                            {f.required && (
                              <Tag color="red" style={{ marginLeft: 8 }}>
                                Required
                              </Tag>
                            )}
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Type: {f.type || '—'}
                            </Text>
                          </div>
                        ))}
                      </Space>
                    );
                  }}
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default FormsPage;
