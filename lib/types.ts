export interface Indicators {
  rsi: number
  volume: "increasing" | "decreasing" | "stable"
  trend: "Uptrend" | "Downtrend" | "Sideways"
  ema9Position: string
  ema21Position: string
  support: number
  resistance: number
  candlestickPatterns: {
    pattern: string
    significance: "high" | "medium" | "low"
    implication: "bullish" | "bearish" | "neutral"
    description: string
    isBreakout?: boolean
    isReversal?: boolean
  }[]
}

export interface Prediction {
  direction: "bullish" | "bearish" | "natural"
  duration: number
  confidence: number
  strength: "strong" | "moderate" | "weak"
  factors: string[]
}

export interface AnalysisResult {
  indicators: Indicators
  prediction: Prediction
}

