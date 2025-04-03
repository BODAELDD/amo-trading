"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Indicators, Prediction } from "@/lib/types"
import {
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  CandlestickChart,
  Zap,
  RefreshCw,
} from "lucide-react"

interface ChartVisualizationProps {
  imageUrl: string
  indicators?: Indicators
  prediction?: Prediction
}

export default function ChartVisualization({ imageUrl, indicators, prediction }: ChartVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Effect to load image and draw predictions on the canvas
  useEffect(() => {
    // Reset loading state when imageUrl changes
    setIsLoaded(false)

    if (!imageUrl) {
      // Clear canvas if imageUrl becomes null or undefined
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Could not get 2D context from canvas")
      return
    }

    console.log("Attempting to load image:", imageUrl)
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageUrl

    img.onload = () => {
      console.log("Image loaded successfully.")
      // Set canvas size to image size on each load
      canvas.width = img.width
      canvas.height = img.height
      ctx.clearRect(0, 0, canvas.width, canvas.height) // Clear previous drawings
      ctx.drawImage(img, 0, 0)

      // Highlight recent price action (last 5-10 candles)
      if (indicators) {
        highlightRecentPriceAction(ctx, canvas.width, canvas.height)
      }

      // Draw candlestick patterns if available
      if (indicators?.candlestickPatterns && indicators.candlestickPatterns.length > 0) {
        drawPatternIndicators(ctx, canvas.width, canvas.height, indicators.candlestickPatterns)
      }

      // Only draw prediction if prediction data is available
      if (prediction) {
        console.log("Drawing prediction:", prediction)
        drawPrediction(ctx, canvas.width, canvas.height, prediction)
      } else {
        console.log("No prediction data to draw.")
      }

      setIsLoaded(true)
    }

    img.onerror = (err) => {
      console.error("Error loading chart image:", imageUrl, err)
      setIsLoaded(true) // Mark as loaded to remove loading state, even on error
      // Optionally: Display an error message directly on the canvas
      if (ctx) {
        ctx.fillStyle = "rgba(255, 100, 100, 0.8)" // Error color
        ctx.font = "16px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("Error loading chart", canvas.width / 2, canvas.height / 2)
      }
    }
  }, [imageUrl, indicators, prediction])

  // Function to highlight recent price action
  const highlightRecentPriceAction = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw a subtle highlight over the right side of the chart (last 20-25% where recent candles are)
    const recentAreaStart = width * 0.75
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)" // Very subtle blue highlight
    ctx.fillRect(recentAreaStart, 0, width * 0.1, height)

    // Add "RECENT" label
    ctx.fillStyle = "rgba(59, 130, 246, 0.7)"
    ctx.font = "bold 12px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("RECENT", recentAreaStart + width * 0.05, 15)
  }

  // Function to draw pattern indicators on the chart
  const drawPatternIndicators = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    patterns: Indicators["candlestickPatterns"],
  ) => {
    // Draw pattern indicators at the right side of the chart (before prediction area)
    const patternAreaX = width * 0.65
    const patternAreaY = height * 0.15

    // Draw a subtle background for the pattern area
    ctx.fillStyle = "rgba(30, 41, 59, 0.7)" // Subtle dark blue background
    ctx.fillRect(patternAreaX, patternAreaY, width * 0.15, patterns.length * 30 + 40)

    // Draw header
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.font = "bold 12px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("DETECTED PATTERNS", patternAreaX + width * 0.075, patternAreaY + 20)

    // Draw each pattern
    patterns.forEach((pattern, index) => {
      const y = patternAreaY + 40 + index * 30

      // Draw pattern name
      ctx.fillStyle =
        pattern.implication === "bullish"
          ? "rgba(74, 222, 128, 1)"
          : pattern.implication === "bearish"
            ? "rgba(248, 113, 113, 1)"
            : "rgba(250, 204, 21, 1)"

      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"

      // Add icon prefix based on pattern type
      let patternText = pattern.pattern
      if (pattern.isBreakout || pattern.pattern.toLowerCase().includes("breakout")) {
        patternText = "⚡ " + patternText
      } else if (
        pattern.isReversal ||
        pattern.pattern.toLowerCase().includes("reversal") ||
        pattern.pattern.toLowerCase().includes("ranging")
      ) {
        patternText = "↩ " + patternText
      }

      ctx.fillText(patternText, patternAreaX + width * 0.075, y)

      // Draw significance indicator (dots)
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      const dotSpacing = 6
      const dotRadius = 2
      const dotsStartX =
        patternAreaX +
        width * 0.075 -
        ((pattern.significance === "high" ? 3 : pattern.significance === "medium" ? 2 : 1) * dotSpacing) / 2

      const significanceCount = pattern.significance === "high" ? 3 : pattern.significance === "medium" ? 2 : 1

      for (let i = 0; i < significanceCount; i++) {
        ctx.beginPath()
        ctx.arc(dotsStartX + i * dotSpacing, y + 10, dotRadius, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }

  // Function to draw the prediction overlay and candle
  const drawPrediction = (ctx: CanvasRenderingContext2D, width: number, height: number, prediction: Prediction) => {
    const rightEdge = width * 0.85 // Start prediction area at 85% width
    const predictionAreaWidth = width - rightEdge
    const candleWidth = predictionAreaWidth * 0.3 // Width of the predicted candle
    const candleHeight = height * 0.15 // Height of the predicted candle
    const candleX = rightEdge + (predictionAreaWidth - candleWidth) / 2 // Center the candle horizontally
    const candleY = height * 0.4 // Vertical position of the candle's top

    // Draw prediction area background
    ctx.fillStyle = "rgba(10, 10, 15, 0.75)" // Dark overlay
    ctx.fillRect(rightEdge, 0, predictionAreaWidth, height)

    // Draw vertical separator line
    ctx.strokeStyle = "rgba(100, 100, 110, 0.5)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(rightEdge, 0)
    ctx.lineTo(rightEdge, height)
    ctx.stroke()

    // "PREDICTION" Label
    ctx.fillStyle = "rgba(220, 220, 220, 0.9)"
    ctx.font = "bold 14px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("PREDICTION", rightEdge + predictionAreaWidth / 2, 30)

    // Draw Predicted Candle
    ctx.lineWidth = 1 // Wick line width
    let candleBodyY = candleY // Y position for the top of the candle body

    if (prediction.direction === "bullish") {
      ctx.fillStyle = "rgba(74, 222, 128, 0.8)" // Bullish green body
      ctx.strokeStyle = "rgba(74, 222, 128, 1)" // Bullish green wick
      ctx.fillRect(candleX, candleY, candleWidth, candleHeight) // Draw body
      // Wicks for bullish
      ctx.beginPath()
      ctx.moveTo(candleX + candleWidth / 2, candleY - candleHeight * 0.3) // Top wick start
      ctx.lineTo(candleX + candleWidth / 2, candleY) // Top wick end
      ctx.moveTo(candleX + candleWidth / 2, candleY + candleHeight) // Bottom wick start
      ctx.lineTo(candleX + candleWidth / 2, candleY + candleHeight * 1.2) // Bottom wick end
      ctx.stroke()
    } else if (prediction.direction === "bearish") {
      candleBodyY = candleY + candleHeight * 0.2 // Adjust Y for bearish body (starts lower)
      ctx.fillStyle = "rgba(248, 113, 113, 0.8)" // Bearish red body
      ctx.strokeStyle = "rgba(248, 113, 113, 1)" // Bearish red wick
      ctx.fillRect(candleX, candleBodyY, candleWidth, candleHeight) // Draw body
      // Wicks for bearish
      ctx.beginPath()
      ctx.moveTo(candleX + candleWidth / 2, candleY) // Top wick start
      ctx.lineTo(candleX + candleWidth / 2, candleBodyY) // Top wick end (to body top)
      ctx.moveTo(candleX + candleWidth / 2, candleBodyY + candleHeight) // Bottom wick start (from body bottom)
      ctx.lineTo(candleX + candleWidth / 2, candleBodyY + candleHeight * 1.3) // Bottom wick end
      ctx.stroke()
    } else {
      // Natural / Doji
      ctx.fillStyle = "rgba(150, 150, 150, 0.8)" // Gray fill
      ctx.strokeStyle = "rgba(150, 150, 150, 1)" // Gray stroke
      const dojiHeight = 2 // Thin horizontal line for doji body
      candleBodyY = candleY + candleHeight / 2 - dojiHeight / 2 // Center the thin line
      ctx.fillRect(candleX, candleBodyY, candleWidth, dojiHeight)
      // Long wicks for doji
      ctx.beginPath()
      ctx.moveTo(candleX + candleWidth / 2, candleY - candleHeight * 0.1) // Upper wick
      ctx.lineTo(candleX + candleWidth / 2, candleBodyY + candleHeight + candleHeight * 0.1) // Lower wick (relative to original candleY)
      ctx.stroke()
    }

    // Draw Text Below Candle
    const textYStart = candleBodyY + candleHeight + 40 // Consistent starting Y for text block
    const textLineHeight = 25 // Space between lines

    // Duration Text
    ctx.fillStyle = "rgba(220, 220, 220, 1)" // Light text color
    ctx.font = "bold 14px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`${prediction.duration} MIN`, rightEdge + predictionAreaWidth / 2, textYStart)

    // Direction Text
    const directionTextColor =
      prediction.direction === "bullish"
        ? "rgba(74, 222, 128, 1)"
        : // #4ade80
          prediction.direction === "bearish"
          ? "rgba(248, 113, 113, 1)"
          : // #f87171
            "rgba(156, 163, 175, 1)" // gray-400 for neutral
    ctx.fillStyle = directionTextColor
    ctx.font = "bold 14px sans-serif"
    ctx.fillText(prediction.direction.toUpperCase(), rightEdge + predictionAreaWidth / 2, textYStart + textLineHeight)
  }

  // --- JSX Rendering ---
  return (
    <Card className="chart-container overflow-hidden">
      <CardHeader className="pb-2">
        {/* Row 1: Title and Prediction Badge */}
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-xl">Chart Visualization</CardTitle>
          {prediction && (
            <Badge
              variant={
                prediction.direction === "bullish"
                  ? "default"
                  : prediction.direction === "bearish"
                    ? "destructive"
                    : "secondary" // Base variant for neutral
              }
              className={
                prediction.direction === "bullish"
                  ? // Force specific dark green bg and white text for bullish
                    "!bg-green-700 !text-white border-green-800"
                  : prediction.direction === "bearish"
                    ? // Let destructive handle red unless specific override needed
                      ""
                    : prediction.direction === "natural"
                      ? // Force specific grey bg and light text for neutral
                        "!bg-gray-600 !text-gray-100 border-gray-700"
                      : "" // Default empty
              }
            >
              {/* Icon based on direction */}
              {
                prediction.direction === "bullish" ? (
                  <ArrowUpCircle className="h-4 w-4 mr-1" />
                ) : prediction.direction === "bearish" ? (
                  <ArrowDownCircle className="h-4 w-4 mr-1" />
                ) : (
                  <Activity className="h-4 w-4 mr-1" />
                ) // Neutral icon
              }
              {prediction.direction.toUpperCase()}
            </Badge>
          )}
        </div>

        {/* Row 2: Indicator Badges (Displayed only if 'indicators' prop is provided) */}
        {indicators && (
          <div className="flex flex-wrap gap-2">
            {/* RSI Badge */}
            <Badge variant="outline" className="flex items-center text-xs">
              <Activity className="h-3 w-3 mr-1 text-purple-400" />
              RSI: <span className="ml-1 font-mono">{indicators.rsi?.toFixed(1) ?? "N/A"}</span>
            </Badge>
            {/* Trend Badge */}
            <Badge variant="outline" className="flex items-center text-xs">
              {
                indicators.trend === "Uptrend" ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                ) : indicators.trend === "Downtrend" ? (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                ) : (
                  <Activity className="h-3 w-3 mr-1 text-yellow-500" />
                ) // Sideways icon
              }
              Trend: <span className="ml-1 capitalize">{indicators.trend ?? "N/A"}</span>
            </Badge>
            {/* Volume Badge */}
            <Badge variant="outline" className="flex items-center text-xs">
              Volume: <span className="ml-1 capitalize">{indicators.volume ?? "N/A"}</span>
            </Badge>
            {/* Candlestick Pattern Badge - Only show if patterns exist */}
            {indicators.candlestickPatterns && indicators.candlestickPatterns.length > 0 && (
              <div className="flex gap-1">
                {indicators.candlestickPatterns.some(
                  (p) =>
                    p.isReversal ||
                    p.pattern.toLowerCase().includes("reversal") ||
                    p.pattern.toLowerCase().includes("ranging"),
                ) && (
                  <Badge variant="outline" className="flex items-center text-xs bg-purple-500/10">
                    <RefreshCw className="h-3 w-3 mr-1 text-purple-400" />
                    Reversal
                  </Badge>
                )}
                {indicators.candlestickPatterns.some(
                  (p) => p.isBreakout || p.pattern.toLowerCase().includes("breakout"),
                ) && (
                  <Badge variant="outline" className="flex items-center text-xs bg-blue-500/10">
                    <Zap className="h-3 w-3 mr-1 text-blue-400" />
                    Breakout
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center text-xs bg-secondary/20">
                  <CandlestickChart className="h-3 w-3 mr-1 text-blue-400" />
                  Patterns: <span className="ml-1">{indicators.candlestickPatterns.length}</span>
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      {/* Canvas Area */}
      <CardContent className="p-0 flex justify-center items-center bg-background/50 min-h-[300px]">
        <div className="relative w-full h-full">
          <canvas ref={canvasRef} className="block max-w-full h-auto align-middle" />
          {/* Loading Overlay */}
          {!isLoaded && imageUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/90 backdrop-blur-sm z-10">
              <div className="flex items-center space-x-2 text-foreground/80">
                <svg
                  className="animate-spin h-5 w-5 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Loading chart...</span>
              </div>
            </div>
          )}
          {/* Optional: Display placeholder if no image URL */}
          {!imageUrl && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <span>No chart image loaded.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

