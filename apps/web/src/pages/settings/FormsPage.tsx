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

const getFieldTypes = (t: any) => [
  { value: 'text', label: t('settings.fieldTypeText') },
  { value: 'number', label: t('settings.fieldTypeNumber') },
  { value: 'select', label: t('settings.fieldTypeSelect') },
  { value: 'checkbox', label: t('settings.fieldTypeCheckbox') },
  { value: 'date', label: t('settings.fieldTypeDate') },
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
      message.error(t('settings.failedToLoadForms'));
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
        message.success(t('settings.formUpdated'));
      } else {
        await createForm(payload);
        message.success(t('settings.formCreated'));
      }
      setDrawerOpen(false);
      form.resetFields();
      setEditingForm(null);
      loadForms();
    } catch {
      message.error(t('settings.failedToSaveForm'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteForm(id);
      message.success(t('settings.formDeleted'));
      loadForms();
    } catch {
      message.error(t('settings.failedToDeleteForm'));
    }
  };

  const handleToggleActive = async (id: number, active: boolean) => {
    try {
      await updateForm(id, { isActive: active });
      loadForms();
    } catch {
      message.error(t('settings.failedToUpdateForm'));
    }
  };

  const columns = [
    { title: t('common.title'), dataIndex: 'title', key: 'title' },
    {
      title: t('settings.fieldsCount'),
      key: 'fieldsCount',
      render: (_: unknown, record: FormRecord) => {
        const fields = Array.isArray(record.fields) ? record.fields : [];
        return fields.length;
      },
    },
    {
      title: t('common.active'),
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
      title: t('common.actions'),
      key: 'actions',
      render: (_: unknown, record: FormRecord) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openDrawer(record)}
          />
          <Popconfirm title={t('settings.deleteFormConfirm')} onConfirm={() => handleDelete(record.id)}>
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
        items={[{ title: t('common.settings') }, { title: t('settings.forms') }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.forms')}</Title>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => openDrawer()}
        style={{ marginBottom: 16 }}
      >
        {t('settings.addForm')}
      </Button>

      <Table columns={columns} dataSource={forms} rowKey="id" pagination={false} />

      <Drawer
        title={editingForm ? t('settings.editForm') : t('settings.createForm')}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          form.resetFields();
          setEditingForm(null);
        }}
        width={720}
        extra={
          <Button type="primary" onClick={handleSave}>
            {t('common.save')}
          </Button>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label={t('settings.formTitle')} rules={[{ required: true }]}>
            <Input placeholder={t('settings.formTitlePlaceholder')} />
          </Form.Item>

          <Divider>{t('settings.fields')}</Divider>

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
                              label={t('settings.label')}
                              rules={[{ required: true }]}
                            >
                              <Input placeholder={t('settings.fieldLabelPlaceholder')} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name={[field.name, 'type']}
                              label={t('common.type')}
                              rules={[{ required: true }]}
                            >
                              <Select options={getFieldTypes(t)} placeholder={t('settings.selectType')} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item
                              name={[field.name, 'required']}
                              label={t('settings.required')}
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
                                  label={t('settings.optionsCommaSeparated')}
                                >
                                  <Input placeholder={t('settings.optionsPlaceholder')} />
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
                      {t('settings.addField')}
                    </Button>
                  </>
                )}
              </Form.List>
            </Col>

            <Col span={10}>
              <Card title={t('settings.preview')} size="small" style={{ background: '#fafafa' }}>
                <Form.Item noStyle shouldUpdate>
                  {() => {
                    const fieldsList: FormField[] = form.getFieldValue('fields') || [];
                    if (fieldsList.length === 0) {
                      return <Text type="secondary">{t('settings.addFieldsToPreview')}</Text>;
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
                                {t('settings.required')}
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
