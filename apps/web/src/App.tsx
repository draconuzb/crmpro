import { Component, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, Button, Result } from 'antd';
import { queryClient } from './lib/queryClient';
import theme from './styles/theme';
import { AuthProvider } from './features/auth/store';
import AppRoutes from './routes';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
          <Result
            status="error"
            title="Xatolik yuz berdi"
            subTitle={this.state.error?.message}
            extra={[
              <Button key="reload" type="primary" onClick={() => window.location.reload()}>Qayta yuklash</Button>,
              <Button key="clear" onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>Qayta kirish</Button>,
            ]}
          />
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ConfigProvider theme={theme}>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ConfigProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
