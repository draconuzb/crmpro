import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../features/auth/hooks';

interface LoginForm {
  phone: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const phone = values.phone.startsWith('+998') ? values.phone : `+998${values.phone.replace(/\D/g, '')}`;
      await login(phone, values.password);
      message.success(t('login.success', 'Login successful'));
      navigate('/dashboard', { replace: true });
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : t('login.error', 'Login failed. Please check your credentials.');
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form<LoginForm> layout="vertical" onFinish={onFinish} autoComplete="off" size="large">
      <Form.Item
        name="phone"
        label={t('login.phone', 'Phone')}
        rules={[{ required: true, message: t('login.phoneRequired', 'Please enter your phone number') }]}
      >
        <Input addonBefore="+998" placeholder="90 123 45 67" maxLength={12} />
      </Form.Item>

      <Form.Item
        name="password"
        label={t('login.password', 'Password')}
        rules={[{ required: true, message: t('login.passwordRequired', 'Please enter your password') }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="********" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" block loading={loading}>
          {t('login.submit', 'Login')}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginPage;
