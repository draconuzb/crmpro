import { Dropdown, Button } from 'antd';
import { DownloadOutlined, FileExcelOutlined, FileTextOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { exportToExcel, exportToCsv } from '../lib/export';

interface ExportColumn {
  title: string;
  dataIndex: string;
  render?: (value: any, record: any) => any;
}

interface ExportButtonProps {
  data: Record<string, any>[];
  columns: ExportColumn[];
  filename?: string;
  children?: React.ReactNode;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  columns,
  filename = 'export',
  children,
}) => {
  const items: MenuProps['items'] = [
    {
      key: 'excel',
      icon: <FileExcelOutlined style={{ color: '#10b981' }} />,
      label: 'Excel (.xlsx)',
      onClick: () => exportToExcel(data, columns, filename),
    },
    {
      key: 'csv',
      icon: <FileTextOutlined style={{ color: '#6366f1' }} />,
      label: 'CSV (.csv)',
      onClick: () => exportToCsv(data, columns, filename),
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      {children || (
        <Button icon={<DownloadOutlined />}>
          Export
        </Button>
      )}
    </Dropdown>
  );
};

export default ExportButton;
