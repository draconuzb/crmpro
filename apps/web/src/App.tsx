import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { queryClient } from './lib/queryClient';
import theme from './styles/theme';
import { AuthProvider } from './features/auth/store';
import AppRoutes from './routes';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConfigProvider theme={theme}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ConfigProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
