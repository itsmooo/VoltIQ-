"use client"

import type React from "react"
import { useState, useEffect } from "react"

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
  prediction?: number
  confidence?: number
  unit?: string
  model_type?: string
  features_used?: number
  error?: string
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
  const [modelInfo, setModelInfo] = useState<any>(null)

  useEffect(() => {
    fetchModelInfo()
  }, [])

  const fetchModelInfo = async () => {
    try {
      const response = await fetch("http://localhost:5001/model-info")
      if (response.ok) {
        const data = await response.json()
        setModelInfo(data)
      }
    } catch (error) {
      console.error("Failed to fetch model info:", error)
    }
  }

  const handleInputChange = (name: string, value: any) => {
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
      console.log("Sending prediction request with data:", formData)

      const response = await fetch("http://localhost:5001/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      console.log("Prediction result:", result)

      setPrediction(result)
    } catch (error: any) {
      console.error("Prediction error:", error)
      setPrediction({
        success: false,
        error: error.message || "Failed to get prediction",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <style jsx>{`
        .card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        
        .card-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
        }
        
        .card-content {
          padding: 24px;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #2563eb 0%, #16a34a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: linear-gradient(135deg, #2563eb 0%, #16a34a 100%);
          color: white;
        }
        
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          gap: 4px;
        }
        
        .badge-success {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }
        
        .badge-secondary {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        
        .badge-outline {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }
        
        .form-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .form-input:required:invalid {
          border-color: #dc2626;
        }
        
        .switch-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
        }
        
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 24px;
        }
        
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }
        
        input:checked + .slider {
          background-color: #2563eb;
        }
        
        input:checked + .slider:before {
          transform: translateX(20px);
        }
        
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #2563eb 0%, #16a34a 100%);
          color: white;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #1d4ed8 0%, #15803d 100%);
          transform: translateY(-1px);
        }
        
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .alert {
          padding: 16px;
          border-radius: 8px;
          border: 1px solid;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        
        .alert-error {
          background: #fef2f2;
          border-color: #fecaca;
          color: #991b1b;
        }
        
        .progress-container {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin: 8px 0;
        }
        
        .progress-bar {
          height: 100%;
          background: linear-gradient(135deg, #2563eb 0%, #16a34a 100%);
          transition: width 0.3s ease;
        }
        
        .result-card {
          text-align: center;
          padding: 32px;
          background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }
        
        .result-value {
          font-size: 2.5rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 16px;
        }
        
        .info-item {
          padding: 12px;
          border-radius: 8px;
          text-align: left;
        }
        
        .info-item-blue { background: #eff6ff; }
        .info-item-green { background: #f0fdf4; }
        .info-item-purple { background: #faf5ff; }
        .info-item-orange { background: #fff7ed; }
        
        .info-label {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .info-value {
          font-size: 14px;
          font-weight: 500;
        }
        
        .info-item-blue .info-label { color: #1e40af; }
        .info-item-blue .info-value { color: #2563eb; }
        .info-item-green .info-label { color: #166534; }
        .info-item-green .info-value { color: #16a34a; }
        .info-item-purple .info-label { color: #7c3aed; }
        .info-item-purple .info-value { color: #8b5cf6; }
        .info-item-orange .info-label { color: #ea580c; }
        .info-item-orange .info-value { color: #f97316; }
        
        .empty-state {
          text-align: center;
          padding: 48px 24px;
          color: #6b7280;
        }
        
        .empty-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 16px;
          opacity: 0.5;
        }
        
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .space-x-3 > * + * { margin-left: 12px; }
        .space-x-4 > * + * { margin-left: 16px; }
        .space-y-4 > * + * { margin-top: 16px; }
        .space-y-6 > * + * { margin-top: 24px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-4 { margin-bottom: 16px; }
        .mt-4 { margin-top: 16px; }
        .w-full { width: 100%; }
        
        @media (max-width: 768px) {
          .grid-2, .grid-3 {
            grid-template-columns: 1fr;
          }
          
          .card-header, .card-content {
            padding: 16px;
          }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="icon-wrapper">⚡</div>
              <div>
                <h1 className="gradient-text" style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
                  Energy Consumption Predictor
                </h1>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: "4px 0 0 0" }}>
                  AI-powered energy consumption prediction using your trained model
                </p>
              </div>
            </div>

            {/* Model Status */}
            <div className="flex items-center space-x-4 mt-4">
              <span className={`badge ${modelInfo?.model_loaded ? "badge-success" : "badge-secondary"}`}>
                {modelInfo?.model_loaded ? <>✓ Model Loaded</> : <>✗ Model Not Loaded</>}
              </span>
              {modelInfo?.model_type && <span className="badge badge-outline">{modelInfo.model_type}</span>}
              {modelInfo?.feature_columns && (
                <span className="badge badge-outline">{modelInfo.feature_columns.length} Features</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: "24px" }}>
          {/* Input Form */}
          <div className="card">
            <div className="card-header">
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                📊 Building Parameters
              </h2>
              <p style={{ color: "#6b7280", fontSize: "14px", margin: "4px 0 0 0" }}>
                Enter the building and environmental parameters for prediction
              </p>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Environmental Parameters */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="temperature">
                      Temperature (°C)
                    </label>
                    <input
                      id="temperature"
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={formData.temperature}
                      onChange={(e) => handleInputChange("temperature", Number.parseFloat(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="humidity">
                      Humidity (%)
                    </label>
                    <input
                      id="humidity"
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={formData.humidity}
                      onChange={(e) => handleInputChange("humidity", Number.parseFloat(e.target.value))}
                      required
                    />
                  </div>
                </div>

                {/* Building Parameters */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="squareFootage">
                      Square Footage
                    </label>
                    <input
                      id="squareFootage"
                      type="number"
                      className="form-input"
                      value={formData.squareFootage}
                      onChange={(e) => handleInputChange("squareFootage", Number.parseInt(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="occupancy">
                      Occupancy
                    </label>
                    <input
                      id="occupancy"
                      type="number"
                      className="form-input"
                      value={formData.occupancy}
                      onChange={(e) => handleInputChange("occupancy", Number.parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>

                {/* Time Parameters */}
                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label" htmlFor="hour">
                      Hour (0-23)
                    </label>
                    <input
                      id="hour"
                      type="number"
                      min="0"
                      max="23"
                      className="form-input"
                      value={formData.hour}
                      onChange={(e) => handleInputChange("hour", Number.parseInt(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="dayOfWeek">
                      Day of Week (0-6)
                    </label>
                    <input
                      id="dayOfWeek"
                      type="number"
                      min="0"
                      max="6"
                      className="form-input"
                      value={formData.dayOfWeek}
                      onChange={(e) => handleInputChange("dayOfWeek", Number.parseInt(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="month">
                      Month (1-12)
                    </label>
                    <input
                      id="month"
                      type="number"
                      min="1"
                      max="12"
                      className="form-input"
                      value={formData.month}
                      onChange={(e) => handleInputChange("month", Number.parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>

                {/* Boolean Parameters */}
                <div className="space-y-4">
                  <div className="switch-container">
                    <label className="form-label" style={{ margin: 0 }}>
                      HVAC Usage
                    </label>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={formData.hvacUsage}
                        onChange={(e) => handleInputChange("hvacUsage", e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="switch-container">
                    <label className="form-label" style={{ margin: 0 }}>
                      Lighting Usage
                    </label>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={formData.lightingUsage}
                        onChange={(e) => handleInputChange("lightingUsage", e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="switch-container">
                    <label className="form-label" style={{ margin: 0 }}>
                      Is Holiday
                    </label>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={formData.isHoliday}
                        onChange={(e) => handleInputChange("isHoliday", e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <button type="submit" disabled={loading || !modelInfo?.model_loaded} className="btn btn-primary w-full">
                  {loading ? "Predicting..." : "Predict Energy Consumption"}
                </button>
              </form>
            </div>
          </div>

          {/* Prediction Result */}
          <div className="card">
            <div className="card-header">
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                📈 Prediction Result
              </h2>
            </div>
            <div className="card-content">
              {prediction ? (
                <div className="space-y-4">
                  {prediction.success ? (
                    <>
                      <div className="result-card">
                        <div className="result-value">
                          {prediction.prediction} {prediction.unit}
                        </div>
                        <p style={{ color: "#6b7280", marginBottom: "16px" }}>Predicted Energy Consumption</p>

                        {prediction.confidence && (
                          <>
                            <div
                              className="flex items-center"
                              style={{ justifyContent: "center", gap: "8px", marginBottom: "8px" }}
                            >
                              <span>⚡</span>
                              <span style={{ fontSize: "14px", fontWeight: "500" }}>Confidence Score</span>
                            </div>
                            <div className="progress-container">
                              <div className="progress-bar" style={{ width: `${prediction.confidence}%` }}></div>
                            </div>
                            <p style={{ fontSize: "14px", color: "#6b7280" }}>{prediction.confidence}% confident</p>
                          </>
                        )}
                      </div>

                      <div className="info-grid">
                        {prediction.model_type && (
                          <div className="info-item info-item-blue">
                            <div className="info-label">Model Type</div>
                            <div className="info-value">{prediction.model_type}</div>
                          </div>
                        )}
                        {prediction.features_used && (
                          <div className="info-item info-item-green">
                            <div className="info-label">Features Used</div>
                            <div className="info-value">{prediction.features_used}</div>
                          </div>
                        )}
                        <div className="info-item info-item-purple">
                          <div className="info-label">Temperature</div>
                          <div className="info-value">{formData.temperature}°C</div>
                        </div>
                        <div className="info-item info-item-orange">
                          <div className="info-label">Occupancy</div>
                          <div className="info-value">{formData.occupancy} people</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="alert alert-error">
                      <span>✗</span>
                      <span>{prediction.error || "Prediction failed"}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <p>Enter parameters and click predict to see results</p>
                  {!modelInfo?.model_loaded && (
                    <p style={{ color: "#dc2626", marginTop: "8px" }}>Model not loaded - check server status</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnergyPredictor
