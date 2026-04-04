import * as XLSX from 'xlsx';

interface ExportColumn {
  title: string;
  dataIndex: string;
  render?: (value: any, record: any) => any;
}

/**
 * Export data to Excel (.xlsx) format
 */
export function exportToExcel(
  data: Record<string, any>[],
  columns: ExportColumn[],
  filename: string = 'export',
) {
  const rows = data.map((record) =>
    columns.reduce((row, col) => {
      const raw = record[col.dataIndex];
      row[col.title] = col.render ? col.render(raw, record) : (raw ?? '');
      return row;
    }, {} as Record<string, any>),
  );

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-size columns
  const maxWidths = columns.map((col) => {
    const headerLen = col.title.length;
    const maxDataLen = data.reduce((max, record) => {
      const val = String(record[col.dataIndex] ?? '');
      return Math.max(max, val.length);
    }, 0);
    return Math.min(Math.max(headerLen, maxDataLen) + 2, 40);
  });
  worksheet['!cols'] = maxWidths.map((w) => ({ wch: w }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export data to CSV format
 */
export function exportToCsv(
  data: Record<string, any>[],
  columns: ExportColumn[],
  filename: string = 'export',
) {
  const rows = data.map((record) =>
    columns.reduce((row, col) => {
      const raw = record[col.dataIndex];
      row[col.title] = col.render ? col.render(raw, record) : (raw ?? '');
      return row;
    }, {} as Record<string, any>),
  );

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
