import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader } from 'lucide-react';
import { analyticsExportService } from '../services/analyticsExportService';

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

interface AnalyticsExportProps {
  data: AnalyticsData;
  filename?: string;
  className?: string;
}

const AnalyticsExport: React.FC<AnalyticsExportProps> = ({
  data,
  filename = 'analytics',
  className = '',
}) => {
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

  const handleExportCSV = async () => {
    setExporting('csv');
    try {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay for UI
      analyticsExportService.exportToCSV(data, filename);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay for UI
      analyticsExportService.exportToPDF(data, filename);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className={`flex gap-3 ${className}`}>
      <button
        onClick={handleExportCSV}
        disabled={exporting !== null}
        className="flex items-center gap-2 px-4 py-2 bg-surface border border-white/10 hover:bg-surface-highlight rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exporting === 'csv' ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4" />
        )}
        <span>Export CSV</span>
      </button>
      <button
        onClick={handleExportPDF}
        disabled={exporting !== null}
        className="flex items-center gap-2 px-4 py-2 bg-surface border border-white/10 hover:bg-surface-highlight rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exporting === 'pdf' ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span>Export PDF</span>
      </button>
    </div>
  );
};

export default AnalyticsExport;
