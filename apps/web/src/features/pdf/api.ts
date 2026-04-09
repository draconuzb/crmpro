import api from '../../lib/axios';

export const downloadDailyPdf = async (date: string) => {
  const response = await api.get(`/reports/pdf/daily?date=${date}`, { responseType: 'blob' });
  downloadBlob(response.data, `daily-report-${date}.pdf`);
};

export const downloadWeeklyPdf = async (startDate: string, endDate: string) => {
  const response = await api.get(`/reports/pdf/weekly?startDate=${startDate}&endDate=${endDate}`, { responseType: 'blob' });
  downloadBlob(response.data, `weekly-report-${startDate}.pdf`);
};

export const downloadMonthlyPdf = async (month: string) => {
  const response = await api.get(`/reports/pdf/monthly?month=${month}`, { responseType: 'blob' });
  downloadBlob(response.data, `monthly-report-${month}.pdf`);
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
