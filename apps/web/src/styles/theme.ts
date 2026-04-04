import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#6366f1',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#6366f1',
    borderRadius: 10,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f8fafc',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  },
  components: {
    Layout: {
      siderBg: '#0f172a',
      headerBg: '#ffffff',
      bodyBg: '#f8fafc',
    },
    Menu: {
      darkItemBg: '#0f172a',
      darkSubMenuItemBg: '#1e293b',
      darkItemSelectedBg: '#6366f1',
      darkItemHoverBg: '#1e293b',
      itemHeight: 44,
      iconSize: 18,
      darkItemColor: '#94a3b8',
      darkItemSelectedColor: '#ffffff',
    },
    Card: {
      borderRadiusLG: 12,
      paddingLG: 24,
      boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Table: {
      borderRadius: 12,
      headerBg: '#f8fafc',
      headerColor: '#475569',
      rowHoverBg: '#f1f5f9',
    },
    Statistic: {
      titleFontSize: 13,
      contentFontSize: 28,
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Breadcrumb: {
      fontSize: 13,
    },
  },
};

export default theme;
