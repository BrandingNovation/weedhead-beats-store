// Analytics export service for CSV and PDF generation

interface AnalyticsData {
  orders?: any[];
  tracks?: any[];
  users?: any[];
  revenue?: {
    total: number;
    byPeriod: Array<{ period: string; amount: number }>;
  };
  sales?: {
    total: number;
    byTrack: Array<{ trackId: string; trackName: string; count: number; revenue: number }>;
  };
}

class AnalyticsExportService {
  /**
   * Export analytics data to CSV
   */
  exportToCSV(data: AnalyticsData, filename: string = 'analytics'): void {
    let csvContent = '';

    // Orders CSV
    if (data.orders && data.orders.length > 0) {
      csvContent += 'Orders\n';
      csvContent += this.arrayToCSV(data.orders);
      csvContent += '\n\n';
    }

    // Tracks CSV
    if (data.tracks && data.tracks.length > 0) {
      csvContent += 'Tracks\n';
      csvContent += this.arrayToCSV(data.tracks);
      csvContent += '\n\n';
    }

    // Users CSV
    if (data.users && data.users.length > 0) {
      csvContent += 'Users\n';
      csvContent += this.arrayToCSV(data.users);
      csvContent += '\n\n';
    }

    // Revenue Summary
    if (data.revenue) {
      csvContent += 'Revenue Summary\n';
      csvContent += `Total Revenue,${data.revenue.total}\n`;
      if (data.revenue.byPeriod) {
        csvContent += 'Period,Amount\n';
        data.revenue.byPeriod.forEach((item) => {
          csvContent += `${item.period},${item.amount}\n`;
        });
      }
      csvContent += '\n\n';
    }

    // Sales Summary
    if (data.sales) {
      csvContent += 'Sales Summary\n';
      csvContent += `Total Sales,${data.sales.total}\n`;
      if (data.sales.byTrack) {
        csvContent += 'Track Name,Count,Revenue\n';
        data.sales.byTrack.forEach((item) => {
          csvContent += `${this.escapeCSV(item.trackName)},${item.count},${item.revenue}\n`;
        });
      }
    }

    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  }

  /**
   * Convert array of objects to CSV
   */
  private arrayToCSV(data: any[]): string {
    if (data.length === 0) return '';

    // Get headers from first object
    const headers = Object.keys(data[0]);
    let csv = headers.map((h) => this.escapeCSV(h)).join(',') + '\n';

    // Add rows
    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return this.escapeCSV(String(value));
      });
      csv += values.join(',') + '\n';
    });

    return csv;
  }

  /**
   * Escape CSV value
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Export analytics data to PDF (simplified - generates HTML that can be printed as PDF)
   */
  exportToPDF(data: AnalyticsData, filename: string = 'analytics'): void {
    const html = this.generatePDFHTML(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.html`;
    link.click();
    URL.revokeObjectURL(url);

    // Note: For true PDF generation, consider using a library like jsPDF or pdfmake
    // This generates an HTML file that can be printed to PDF
  }

  /**
   * Generate HTML for PDF export
   */
  private generatePDFHTML(data: AnalyticsData): string {
    const date = new Date().toLocaleDateString();
    let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Analytics Report - ${date}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #ec1313; }
    h2 { color: #333; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #ec1313; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .metric { display: inline-block; margin: 10px 20px 10px 0; }
    .metric-value { font-size: 24px; font-weight: bold; color: #ec1313; }
    .metric-label { font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>Analytics Report</h1>
  <p>Generated: ${date}</p>
`;

    // Revenue Summary
    if (data.revenue) {
      html += `
  <div class="summary">
    <h2>Revenue Summary</h2>
    <div class="metric">
      <div class="metric-value">$${data.revenue.total.toFixed(2)}</div>
      <div class="metric-label">Total Revenue</div>
    </div>
  </div>
`;
      if (data.revenue.byPeriod && data.revenue.byPeriod.length > 0) {
        html += `
  <h2>Revenue by Period</h2>
  <table>
    <tr><th>Period</th><th>Amount</th></tr>
`;
        data.revenue.byPeriod.forEach((item) => {
          html += `    <tr><td>${item.period}</td><td>$${item.amount.toFixed(2)}</td></tr>\n`;
        });
        html += `  </table>\n`;
      }
    }

    // Sales Summary
    if (data.sales) {
      html += `
  <div class="summary">
    <h2>Sales Summary</h2>
    <div class="metric">
      <div class="metric-value">${data.sales.total}</div>
      <div class="metric-label">Total Sales</div>
    </div>
  </div>
`;
      if (data.sales.byTrack && data.sales.byTrack.length > 0) {
        html += `
  <h2>Sales by Track</h2>
  <table>
    <tr><th>Track Name</th><th>Count</th><th>Revenue</th></tr>
`;
        data.sales.byTrack.forEach((item) => {
          html += `    <tr><td>${item.trackName}</td><td>${item.count}</td><td>$${item.revenue.toFixed(2)}</td></tr>\n`;
        });
        html += `  </table>\n`;
      }
    }

    // Orders Table
    if (data.orders && data.orders.length > 0) {
      html += `
  <h2>Orders</h2>
  <table>
    <tr>
`;
      const orderHeaders = Object.keys(data.orders[0]);
      orderHeaders.forEach((header) => {
        html += `      <th>${header}</th>\n`;
      });
      html += `    </tr>\n`;
      data.orders.forEach((order) => {
        html += `    <tr>\n`;
        orderHeaders.forEach((header) => {
          const value = order[header];
          html += `      <td>${value !== null && value !== undefined ? String(value) : ''}</td>\n`;
        });
        html += `    </tr>\n`;
      });
      html += `  </table>\n`;
    }

    html += `
</body>
</html>
`;
    return html;
  }

  /**
   * Download file
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const analyticsExportService = new AnalyticsExportService();
