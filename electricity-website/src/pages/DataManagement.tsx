import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Upload, Download, Database, Filter, UploadCloud } from 'lucide-react';
import PageTitle from '../components/ui/PageTitle';

const DataManagement: React.FC = () => {
  const { consumptionData, weatherData, isLoading } = useData();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleUpload = () => {
    // Handle file upload logic (would connect to backend in a real app)
    console.log('Uploading file:', selectedFile?.name);
    // Reset file selection
    setSelectedFile(null);
    
    // In a real app, this would send the file to the backend
    // For demo purposes, we just show a success message
    alert('File uploaded successfully!');
  };

  return (
    <div className="space-y-6">
      <PageTitle title="Data Management" subtitle="Upload, manage and export consumption and weather data" />
      
      {/* File Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <h2 className="text-lg font-medium mb-4">Upload Data</h2>
        
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center">
          <UploadCloud size={48} className="text-gray-400 mb-4" />
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
            Drag and drop your CSV or Excel files here, or click to select files
          </p>
          
          <label className="relative cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors">
            <span>Select Files</span>
            <input 
              type="file" 
              className="sr-only"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
            />
          </label>
          
          {selectedFile && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md flex items-center">
              <Database size={16} className="text-blue-500 mr-2" />
              <span className="text-sm text-blue-800 dark:text-blue-200">{selectedFile.name}</span>
              <button 
                onClick={handleUpload}
                className="ml-4 text-blue-600 dark:text-blue-400 hover:text-blue-800"
              >
                <Upload size={16} />
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-medium mb-2">Consumption Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Upload historical electricity consumption records
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Supported formats: CSV, Excel
            </p>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-medium mb-2">Weather Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Upload historical weather data for correlation analysis
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Supported formats: CSV, Excel
            </p>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-medium mb-2">Event Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Upload special events that may affect consumption
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Supported formats: CSV, Excel
            </p>
          </div>
        </div>
      </div>
      
      {/* Data Export Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <h2 className="text-lg font-medium mb-4">Export Data</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium">Consumption Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {consumptionData.length} records available
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Filter size={16} />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Download size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Region:</span>
                <span className="font-medium">Region A</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Date Range:</span>
                <span className="font-medium">Last 30 days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Resolution:</span>
                <span className="font-medium">Daily</span>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium">Weather Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {weatherData.length} records available
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Filter size={16} />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Download size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Region:</span>
                <span className="font-medium">Region A</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Date Range:</span>
                <span className="font-medium">Last 30 days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Parameters:</span>
                <span className="font-medium">Temp, Humidity, Precipitation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Data Management Tools */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <h2 className="text-lg font-medium mb-4">Data Management Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <h3 className="font-medium mb-2">Data Cleaning</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Clean and preprocess data, handle missing values
            </p>
          </button>
          
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <h3 className="font-medium mb-2">Data Merging</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Combine consumption and weather datasets
            </p>
          </button>
          
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <h3 className="font-medium mb-2">Anomaly Detection</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Identify and flag unusual data points
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;