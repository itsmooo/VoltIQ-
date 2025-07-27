"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Brain, Zap, Thermometer, Home, Users, Clock } from 'lucide-react'

interface PredictionFormData {
  temperature: number
  humidity: number
  squareFootage: number
  occupancy: number
  hvacUsage: boolean
  lightingUsage: boolean
  isHoliday: boolean
  hour: number
  dayOfWeek: number
  month: number
}

interface PredictionResult {
  success: boolean
  prediction: number
  confidence: number
  unit: string
  model_type: string
  features_used: number
  timestamp: string
  error?: string
}

interface ModelInfo {
  model_loaded: boolean
  model_type: string
  feature_columns: string[]
  num_features: number
  sequence_length: number
  scalers_available: {
    scaler_X: boolean
    scaler_y: boolean
  }
  model_path: string
}

const EnergyPredictor: React.FC = () => {
  const [formData, setFormData] = useState<PredictionFormData>({
    temperature: 25,
    humidity: 60,
    squareFootage: 1000,
    occupancy: 5,
    hvacUsage: true,
    lightingUsage: true,
    isHoliday: false,
    hour: new Date().getHours(),
    dayOfWeek: new Date().getDay(),
    month: new Date().getMonth() + 1,
  })

  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [modelLoading, setModelLoading] = useState(true)

  useEffect(() => {
    fetchModelInfo()
  }, [])

  const fetchModelInfo = async () => {
    try {
      setModelLoading(true)
      const response = await fetch("http://localhost:5001/model-info")
      if (response.ok) {
        const data = await response.json()
        setModelInfo(data)
      } else {
        console.error("Failed to fetch model info:", response.statusText)
      }
    } catch (error) {
      console.error("Failed to fetch model info:", error)
    } finally {
      setModelLoading(false)
    }
  }

  const handleInputChange = (name: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setPrediction(null)

    try {
      const response = await fetch("http://localhost:5001/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setPrediction(data)
      } else {
        setPrediction({
          success: false,
          prediction: 0,
          confidence: 0,
          unit: "kWh",
          model_type: "Unknown",
          features_used: 0,
          timestamp: new Date().toISOString(),
          error: data.error || "Prediction failed"
        })
      }
    } catch (error) {
      setPrediction({
        success: false,
        prediction: 0,
        confidence: 0,
        unit: "kWh",
        model_type: "Unknown",
        features_used: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Network error occurred"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Energy Consumption Predictor
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Predict electricity consumption using AI models
              </p>
            </div>
          </div>
          
          {/* Model Status */}
          <div className="flex items-center space-x-2">
            {modelLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Loading model...</span>
              </div>
            ) : modelInfo?.model_loaded ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Model Ready</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">Model Not Loaded</span>
              </div>
            )}
          </div>
        </div>

        {/* Model Information */}
        {modelInfo && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-300">Model Type:</span>
                <p className="font-medium text-gray-900 dark:text-white">{modelInfo.model_type}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-300">Features:</span>
                <p className="font-medium text-gray-900 dark:text-white">{modelInfo.num_features}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-300">X Scaler:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {modelInfo.scalers_available.scaler_X ? "✓" : "✗"}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-300">Y Scaler:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {modelInfo.scalers_available.scaler_y ? "✓" : "✗"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Prediction Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Environmental Factors */}
            <div className="space-y-4">
              <h3 className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-white">
                <Thermometer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Environmental</span>
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange("temperature", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  min="-20"
                  max="50"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Humidity (%)
                </label>
                <input
                  type="number"
                  value={formData.humidity}
                  onChange={(e) => handleInputChange("humidity", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  min="0"
                  max="100"
                  step="1"
                />
              </div>
            </div>

            {/* Building Factors */}
            <div className="space-y-4">
              <h3 className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-white">
                <Home className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span>Building</span>
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Square Footage
                </label>
                <input
                  type="number"
                  value={formData.squareFootage}
                  onChange={(e) => handleInputChange("squareFootage", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  min="100"
                  max="10000"
                  step="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Occupancy
                </label>
                <input
                  type="number"
                  value={formData.occupancy}
                  onChange={(e) => handleInputChange("occupancy", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="100"
                  step="1"
                />
              </div>
            </div>

            {/* Time & Usage Factors */}
            <div className="space-y-4">
              <h3 className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-white">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Time & Usage</span>
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hour (0-23)
                </label>
                <input
                  type="number"
                  value={formData.hour}
                  onChange={(e) => handleInputChange("hour", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  min="0"
                  max="23"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Day of Week (0=Sunday)
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => handleInputChange("dayOfWeek", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Month
                </label>
                <select
                  value={formData.month}
                  onChange={(e) => handleInputChange("month", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Boolean Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hvacUsage"
                checked={formData.hvacUsage}
                onChange={(e) => handleInputChange("hvacUsage", e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="hvacUsage" className="ml-2 block text-sm text-gray-900 dark:text-white">
                HVAC Usage
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="lightingUsage"
                checked={formData.lightingUsage}
                onChange={(e) => handleInputChange("lightingUsage", e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="lightingUsage" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Lighting Usage
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isHoliday"
                checked={formData.isHoliday}
                onChange={(e) => handleInputChange("isHoliday", e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isHoliday" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Holiday
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading || !modelInfo?.model_loaded}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Predicting...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Predict Energy Consumption
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Prediction Results */}
      {prediction && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Prediction Results
          </h3>
          
          {prediction.success ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400">Predicted Consumption</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {prediction.prediction} {prediction.unit}
                      </p>
                    </div>
                    <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Confidence</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {prediction.confidence}%
                      </p>
                    </div>
                    <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Features Used</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {prediction.features_used}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 border-t pt-4">
                <p><strong>Model:</strong> {prediction.model_type}</p>
                <p><strong>Timestamp:</strong> {new Date(prediction.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <p className="text-red-600 dark:text-red-400">
                  Prediction failed: {prediction.error}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EnergyPredictor
