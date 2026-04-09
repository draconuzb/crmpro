import { useState, useEffect } from 'react';
import {
  Typography,
  Breadcrumb,
  Form,
  InputNumber,
  Button,
  Card,
  Space,
  Input,
  Row,
  Col,
  message,
  Spin,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { getGradeSettings, updateGradeSettings } from '../../features/settings/api';

const { Title } = Typography;

interface GradeLabel {
  label: string;
  min: number;
  max: number;
}

interface GradeSettings {
  maxScore: number;
  passingScore: number;
  labels: GradeLabel[];
}

const GradeSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getGradeSettings()
      .then((data: GradeSettings) => {
        form.setFieldsValue({
          maxScore: data.maxScore,
          passingScore: data.passingScore,
          labels: data.labels,
        });
      })
      .catch(() => {
        message.error('Failed to load grade settings');
      })
      .finally(() => setLoading(false));
  }, [form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await updateGradeSettings(values);
      message.success('Grade settings saved successfully');
    } catch {
      message.error('Failed to save grade settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Settings' }, { title: 'Grade' }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.grade')}</Title>

      <Card style={{ maxWidth: 700 }}>
        <Form form={form} layout="vertical">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="maxScore"
                label="Max Score"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber min={1} max={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="passingScore"
                label="Passing Score"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber min={0} max={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} style={{ marginTop: 16 }}>
            Grade Labels
          </Title>

          <Form.List name="labels">
            {(fields) => (
              <Space direction="vertical" style={{ width: '100%' }}>
                {fields.map((field) => (
                  <Row gutter={12} key={field.key} align="middle">
                    <Col span={4}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'label']}
                        noStyle
                      >
                        <Input placeholder="Label" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'min']}
                        noStyle
                      >
                        <InputNumber
                          placeholder="Min"
                          min={0}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={1} style={{ textAlign: 'center' }}>
                      —
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'max']}
                        noStyle
                      >
                        <InputNumber
                          placeholder="Max"
                          min={0}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                ))}
              </Space>
            )}
          </Form.List>

          <Button
            type="primary"
            onClick={handleSave}
            loading={saving}
            style={{ marginTop: 24 }}
          >
            Save Settings
          </Button>
        </Form>
      </Card>
    </>
  );
};

export default GradeSettingsPage;
