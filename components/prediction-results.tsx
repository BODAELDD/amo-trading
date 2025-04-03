"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Prediction } from "@/lib/types"
import {
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Timer,
  CandlestickChart,
  Zap,
  RefreshCw,
} from "lucide-react"

interface PredictionResultsProps {
  prediction: Prediction
}

export default function PredictionResults({ prediction }: PredictionResultsProps) {
  const getDirectionIcon = () => {
    if (prediction.direction === "bullish") {
      return <ArrowUpCircle className="h-8 w-8 text-green-500" />
    } else if (prediction.direction === "bearish") {
      return <ArrowDownCircle className="h-8 w-8 text-red-500" />
    } else {
      return <CandlestickChart className="h-8 w-8 text-gray-500" />
    }
  }

  const getConfidenceIcon = () => {
    if (prediction.confidence > 75) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    } else if (prediction.confidence > 50) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getDurationColor = () => {
    switch (prediction.duration) {
      case 1:
        return "text-yellow-500"
      case 2:
        return "text-blue-500"
      case 5:
        return "text-green-500"
      default:
        return "text-primary"
    }
  }

  // Function to get appropriate icon for each factor
  const getFactorIcon = (factor: string) => {
    const lowerFactor = factor.toLowerCase()

    if (lowerFactor.includes("reversal") || lowerFactor.includes("reverse") || lowerFactor.includes("turning")) {
      return <RefreshCw className="h-4 w-4 text-purple-400" />
    } else if (lowerFactor.includes("breakout") || lowerFactor.includes("breaking") || lowerFactor.includes("broken")) {
      return <Zap className="h-4 w-4 text-blue-400" />
    } else if (
      lowerFactor.includes("pattern") ||
      lowerFactor.includes("engulfing") ||
      lowerFactor.includes("doji") ||
      lowerFactor.includes("hammer")
    ) {
      return <CandlestickChart className="h-4 w-4 text-blue-400" />
    } else if (lowerFactor.includes("bullish") || lowerFactor.includes("uptrend") || lowerFactor.includes("support")) {
      return <ArrowUpCircle className="h-4 w-4 text-green-500" />
    } else if (
      lowerFactor.includes("bearish") ||
      lowerFactor.includes("downtrend") ||
      lowerFactor.includes("resistance")
    ) {
      return <ArrowDownCircle className="h-4 w-4 text-red-500" />
    } else {
      return <CheckCircle2 className="h-4 w-4 text-primary" />
    }
  }

  return (
    <Card className="border-secondary/30">
      <CardHeader>
        <CardTitle className="text-xl">Prediction Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getDirectionIcon()}
            <div className="ml-3">
              <p
                className={`text-lg font-medium capitalize ${prediction.direction === "bullish" ? "bullish" : prediction.direction === "bearish" ? "bearish" : "neutral"}`}
              >
                {prediction.direction} Movement
              </p>
              <p className="text-sm text-muted-foreground">Next Candle Prediction</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-medium">{prediction.confidence}%</p>
            <p className="text-sm text-muted-foreground flex items-center justify-end">
              {getConfidenceIcon()}
              <span className="ml-1">Confidence</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="prediction-card border-primary/20 bg-secondary/10">
            <CardContent className="p-4 flex flex-col items-center">
              <Timer className={`h-6 w-6 mb-2 ${getDurationColor()}`} />
              <p className={`text-xl font-bold ${getDurationColor()}`}>{prediction.duration} min</p>
              <p className="text-sm text-muted-foreground">Recommended Duration</p>
            </CardContent>
          </Card>

          <Card className="prediction-card border-primary/20 bg-secondary/10">
            <CardContent className="p-4 flex flex-col items-center">
              <div
                className={`h-6 w-6 mb-2 ${prediction.strength === "strong" ? "text-green-500" : prediction.strength === "moderate" ? "text-yellow-500" : "text-red-500"}`}
              >
                {prediction.strength === "strong" ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : prediction.strength === "moderate" ? (
                  <AlertTriangle className="h-6 w-6" />
                ) : (
                  <XCircle className="h-6 w-6" />
                )}
              </div>
              <p className="text-lg font-medium capitalize">{prediction.strength}</p>
              <p className="text-sm text-muted-foreground">Signal Strength</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-secondary/10 p-3 rounded-md border border-secondary/30">
          <h4 className="font-medium mb-2 flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
            Key Factors
          </h4>
          <ul className="space-y-2 text-sm">
            {prediction.factors.map((factor, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 flex-shrink-0 mt-0.5">{getFactorIcon(factor)}</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

