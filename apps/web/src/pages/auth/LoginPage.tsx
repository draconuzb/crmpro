import { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../features/auth/hooks';
import { getHomeRoute } from '../../lib/roles';

const { Text } = Typography;

interface LoginForm {
  phone: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && user) {
    navigate(getHomeRoute(user.role), { replace: true });
    return null;
  }

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const phone = values.phone.startsWith('+998') ? values.phone : `+998${values.phone.replace(/\D/g, '')}`;
      const result = await login(phone, values.password);
      message.success('Muvaffaqiyatli kirdingiz!');
      navigate(getHomeRoute(result?.user?.role || 'CEO'), { replace: true });
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : t('login.error', "Kirish xatosi.");
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <Text style={{ fontSize: 15, color: '#475569' }}>
          Hisobingizga kiring
        </Text>
      </div>

      <Form<LoginForm> layout="vertical" onFinish={onFinish} autoComplete="off" size="large">
        <Form.Item
          name="phone"
          label={<span style={{ fontWeight: 500, color: '#334155' }}>Telefon raqam</span>}
          rules={[{ required: true, message: 'Telefon raqamingizni kiriting' }]}
        >
          <Input
            addonBefore={<span style={{ color: '#6366f1', fontWeight: 600 }}>+998</span>}
            placeholder="90 123 45 67"
            maxLength={12}
            style={{ borderRadius: 10 }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ fontWeight: 500, color: '#334155' }}>Parol</span>}
          rules={[{ required: true, message: 'Parolingizni kiriting' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Parolingiz"
            style={{ borderRadius: 10 }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            style={{
              height: 46,
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 15,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            }}
          >
            Kirish
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default LoginPage;
