import React, { useState } from 'react';
import { Calendar, FileText, Download, Send, Plus, Sliders } from 'lucide-react';
import PageTitle from '../components/ui/PageTitle';

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  
  const reports = [
    {
      id: 'monthly-1',
      title: 'Monthly Consumption Summary',
      date: 'May 1, 2025',
      type: 'Monthly',
      format: 'PDF',
      status: 'Generated',
    },
    {
      id: 'forecast-1',
      title: 'Q3 Consumption Forecast',
      date: 'April 15, 2025',
      type: 'Quarterly',
      format: 'Excel',
      status: 'Generated',
    },
    {
      id: 'anomaly-1',
      title: 'Anomaly Detection Report',
      date: 'April 10, 2025',
      type: 'Analysis',
      format: 'PDF',
      status: 'Generated',
    },
    {
      id: 'comparison-1',
      title: 'Year-over-Year Comparison',
      date: 'April 1, 2025',
      type: 'Annual',
      format: 'PDF',
      status: 'Generated',
    },
  ];
  
  const reportTemplates = [
    { id: 'monthly', name: 'Monthly Consumption', description: 'Detailed monthly consumption breakdown' },
    { id: 'forecast', name: 'Consumption Forecast', description: 'Projected consumption for upcoming periods' },
    { id: 'weather', name: 'Weather Impact Analysis', description: 'Analysis of weather effects on consumption' },
    { id: 'comparison', name: 'Comparative Analysis', description: 'Compare consumption across time periods' },
    { id: 'anomaly', name: 'Anomaly Report', description: 'Identify and explain unusual consumption patterns' },
  ];

  return (
    <div className="space-y-6">
      <PageTitle title="Reports" subtitle="Generate, schedule, and manage reports" />
      
      {/* Report Generation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium">Generate New Report</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map(template => (
              <div 
                key={template.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedReport === template.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSelectedReport(template.id)}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-medium">{template.name}</h3>
                  <FileText size={18} className="text-gray-500 dark:text-gray-400" />
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {template.description}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end space-x-4">
            <button
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Sliders size={16} className="inline mr-2" />
              Customize
            </button>
            <button
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              disabled={!selectedReport}
            >
              <Plus size={16} className="inline mr-2" />
              Generate Report
            </button>
          </div>
        </div>
      </div>
      
      {/* Recent Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium">Recent Reports</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Format
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {report.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {report.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {report.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {report.format}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        <Download size={16} />
                      </button>
                      <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        <Send size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Scheduled Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Scheduled Reports</h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center">
              <Calendar size={16} className="mr-1" />
              Schedule New Report
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar size={32} className="mx-auto mb-4 opacity-50" />
            <p>No scheduled reports. Click "Schedule New Report" to create one.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;