"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Indicators } from "@/lib/types"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart4,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDown,
  ArrowUp,
  LineChart,
  CandlestickChart,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Zap,
  RefreshCw,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TechnicalAnalysisProps {
  indicators: Indicators
}

export default function TechnicalAnalysis({ indicators }: TechnicalAnalysisProps) {
  const getRsiColor = (rsi: number) => {
    if (rsi > 70) return "text-red-500" // Consistent red
    if (rsi <= 30) return "text-green-500" // Consistent green
    return "text-yellow-500" // Consistent yellow
  }

  const getRsiStatus = (rsi: number) => {
    if (rsi > 70) return "Overbought"
    if (rsi <= 30) return "Oversold" // Changed from < to <= to catch edge cases
    return "Neutral"
  }

  // --- START: Updated Trend Logic ---
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "Uptrend":
        return "text-green-500" // Use consistent green
      case "Downtrend":
        return "text-red-500" // Use consistent red
      case "Sideways":
        return "text-yellow-500" // Use consistent yellow
      default:
        return "text-muted-foreground" // Fallback
    }
  }

  const getTrendIcon = (trend: string) => {
    const trendColor = getTrendColor(trend) // Get color class
    switch (trend) {
      case "Uptrend":
        return <TrendingUp className={`h-5 w-5 ${trendColor}`} /> // Apply color class
      case "Downtrend":
        return <TrendingDown className={`h-5 w-5 ${trendColor}`} /> // Apply color class
      case "Sideways":
        return <Minus className={`h-5 w-5 ${trendColor}`} /> // Apply color class, using Minus icon
      default:
        return <Activity className={`h-5 w-5 ${trendColor}`} /> // Fallback icon
    }
  }
  // --- END: Updated Trend Logic ---

  const getVolumeIcon = (volume: string) => {
    // Keep volume logic as is, or apply consistent colors if desired
    return volume === "increasing" ? (
      <ArrowUpRight className="h-5 w-5 text-green-500" />
    ) : volume === "decreasing" ? (
      <ArrowDownRight className="h-5 w-5 text-red-500" />
    ) : (
      <BarChart4 className="h-5 w-5 text-yellow-500" /> // Keep yellow or change if needed
    )
  }

  // Function to get pattern significance icon
  const getPatternSignificanceIcon = (significance: string) => {
    switch (significance) {
      case "high":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "low":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />
    }
  }

  // Function to get pattern implication color
  const getPatternImplicationColor = (implication: string) => {
    switch (implication) {
      case "bullish":
        return "text-green-500"
      case "bearish":
        return "text-red-500"
      case "neutral":
        return "text-yellow-500"
      default:
        return "text-muted-foreground"
    }
  }

  // Function to get pattern type icon
  const getPatternTypeIcon = (pattern: Indicators["candlestickPatterns"][0]) => {
    if (pattern.isBreakout) {
      return <Zap className="h-4 w-4 text-blue-400" />
    } else if (pattern.isReversal) {
      return <RefreshCw className="h-4 w-4 text-purple-400" />
    } else {
      return <CandlestickChart className="h-4 w-4 text-blue-400" />
    }
  }

  // Filter patterns by type
  const reversalPatterns = indicators.candlestickPatterns.filter(
    (p) =>
      p.isReversal ||
      p.pattern.toLowerCase().includes("reversal") ||
      p.pattern.toLowerCase().includes("engulfing") ||
      p.pattern.toLowerCase().includes("hammer") ||
      p.pattern.toLowerCase().includes("doji") ||
      p.pattern.toLowerCase().includes("star"),
  )

  const breakoutPatterns = indicators.candlestickPatterns.filter(
    (p) =>
      p.isBreakout ||
      p.pattern.toLowerCase().includes("breakout") ||
      p.pattern.toLowerCase().includes("break") ||
      p.description.toLowerCase().includes("breaking") ||
      p.description.toLowerCase().includes("breakout"),
  )

  const otherPatterns = indicators.candlestickPatterns.filter(
    (p) => !reversalPatterns.includes(p) && !breakoutPatterns.includes(p),
  )

  return (
    <Card className="border-secondary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Activity className="h-5 w-5 mr-2 text-primary" />
          Technical Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* RSI Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">RSI</span>
            </div>
            <span className={`font-mono ${getRsiColor(indicators.rsi)}`}>{indicators.rsi.toFixed(1)}</span>
          </div>
          <Progress
            value={indicators.rsi}
            className="h-2 [&>*]:bg-gradient-to-r [&>*]:from-green-500 [&>*]:via-yellow-500 [&>*]:to-red-500"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Oversold (30)</span>
            <span>Neutral</span>
            <span>Overbought (70)</span>
          </div>
          <div className="mt-2 text-sm text-right">
            Status:{" "}
            <span className={`font-semibold ${getRsiColor(indicators.rsi)}`}>{getRsiStatus(indicators.rsi)}</span>
          </div>
        </div>

        {/* Candlestick Patterns Section */}
        <div className="space-y-2 border rounded-md p-3 bg-secondary/10 border-secondary/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center">
              <CandlestickChart className="h-4 w-4 mr-2 text-blue-400" />
              Chart Patterns & Signals
            </h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    Analysis focuses on the most recent 5-10 candles to identify reversal patterns, breakout signals,
                    and other significant formations.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {indicators.candlestickPatterns && indicators.candlestickPatterns.length > 0 ? (
            <div className="w-full">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full grid grid-cols-4 mb-2">
                  <TabsTrigger value="all" className="text-xs sm:text-sm">
                    All ({indicators.candlestickPatterns.length})
                  </TabsTrigger>
                  <TabsTrigger value="reversal" className="text-xs sm:text-sm" disabled={reversalPatterns.length === 0}>
                    Rev ({reversalPatterns.length})
                  </TabsTrigger>
                  <TabsTrigger value="breakout" className="text-xs sm:text-sm" disabled={breakoutPatterns.length === 0}>
                    Break ({breakoutPatterns.length})
                  </TabsTrigger>
                  <TabsTrigger value="other" className="text-xs sm:text-sm" disabled={otherPatterns.length === 0}>
                      ({otherPatterns.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-2 space-y-3">
                  {indicators.candlestickPatterns.map((pattern, index) => (
                    <div key={index} className="p-2 rounded-md bg-background/50 border border-secondary/20">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center flex-wrap">
                          {getPatternSignificanceIcon(pattern.significance)}
                          <span className="ml-2 font-medium">{pattern.pattern}</span>
                          {pattern.isBreakout && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                              Breakout
                            </span>
                          )}
                          {pattern.isReversal && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                              Reversal
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary/20 ${getPatternImplicationColor(
                            pattern.implication,
                          )}`}
                        >
                          {pattern.implication.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 break-words whitespace-normal">
                        {pattern.description}
                      </p>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="reversal" className="mt-2 space-y-3">
                  {reversalPatterns.length > 0 ? (
                    reversalPatterns.map((pattern, index) => (
                      <div key={index} className="p-2 rounded-md bg-background/50 border border-secondary/20">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center flex-wrap">
                            {getPatternSignificanceIcon(pattern.significance)}
                            <span className="ml-2 font-medium">{pattern.pattern}</span>
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                              Reversal
                            </span>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary/20 ${getPatternImplicationColor(
                              pattern.implication,
                            )}`}
                          >
                            {pattern.implication.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 break-words whitespace-normal">
                          {pattern.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-muted-foreground text-sm bg-background/50 rounded-md">
                      No reversal patterns detected
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="breakout" className="mt-2 space-y-3">
                  {breakoutPatterns.length > 0 ? (
                    breakoutPatterns.map((pattern, index) => (
                      <div key={index} className="p-2 rounded-md bg-background/50 border border-secondary/20">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center flex-wrap">
                            {getPatternSignificanceIcon(pattern.significance)}
                            <span className="ml-2 font-medium">{pattern.pattern}</span>
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                              Breakout
                            </span>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary/20 ${getPatternImplicationColor(
                              pattern.implication,
                            )}`}
                          >
                            {pattern.implication.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 break-words whitespace-normal">
                          {pattern.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-muted-foreground text-sm bg-background/50 rounded-md">
                      No breakout signals detected
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="other" className="mt-2 space-y-3">
                  {otherPatterns.length > 0 ? (
                    otherPatterns.map((pattern, index) => (
                      <div key={index} className="p-2 rounded-md bg-background/50 border border-secondary/20">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center flex-wrap">
                            {getPatternSignificanceIcon(pattern.significance)}
                            <span className="ml-2 font-medium">{pattern.pattern}</span>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary/20 ${getPatternImplicationColor(
                              pattern.implication,
                            )}`}
                          >
                            {pattern.implication.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 break-words whitespace-normal">
                          {pattern.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-muted-foreground text-sm bg-background/50 rounded-md">
                      No other patterns detected
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="p-3 text-center text-muted-foreground text-sm bg-background/50 rounded-md">
              No clear patterns detected in recent candles
            </div>
          )}
        </div>

        {/* Support and Resistance Section */}
        <div className="space-y-2 border rounded-md p-3 bg-secondary/10 border-secondary/30">
          <h4 className="font-medium mb-2 flex items-center">
            <ArrowUp className="h-4 w-4 mr-1 text-red-400" />
            <ArrowDown className="h-4 w-4 mr-1 text-green-400" />
            Support & Resistance
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium flex items-center text-muted-foreground">
                <ArrowDown className="h-4 w-4 mr-1 text-green-400" />
                <span>Support</span>
              </div>
              <div className="text-lg font-mono bg-background/50 p-1 rounded text-center text-green-400 border border-green-500/20">
                {indicators.support.toFixed(5)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium flex items-center text-muted-foreground">
                <ArrowUp className="h-4 w-4 mr-1 text-red-400" />
                <span>Resistance</span>
              </div>
              <div className="text-lg font-mono bg-background/50 p-1 rounded text-center text-red-400 border border-red-500/20">
                {indicators.resistance.toFixed(5)}
              </div>
            </div>
          </div>
        </div>

        {/* Trend and Volume Section */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-secondary/20">
          {/* Trend Sub-section */}
          <div className="space-y-1">
            <div className={`font-medium flex items-center ${getTrendColor(indicators.trend)}`}>
              {getTrendIcon(indicators.trend)}
              <span className="ml-2">Recent Trend</span>
            </div>
            <div className="text-sm">
              <p className={`capitalize font-semibold ${getTrendColor(indicators.trend)}`}>{indicators.trend}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {indicators.trend === "Uptrend"
                  ? "Recent price moving higher."
                  : indicators.trend === "Downtrend"
                    ? "Recent price moving lower."
                    : "Recent price moving sideways."}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {indicators.ema9Position} / {indicators.ema21Position}
              </p>
            </div>
          </div>

          {/* Volume Sub-section */}
          <div className="space-y-1">
            <div className="font-medium flex items-center">
              {getVolumeIcon(indicators.volume)}
              <span className="ml-2">Recent Volume</span>
            </div>
            <div className="text-sm">
              <p className="capitalize">{indicators.volume}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {indicators.volume === "increasing"
                  ? "Potential strength in recent moves"
                  : indicators.volume === "decreasing"
                    ? "Potential weakness in recent moves"
                    : "Consolidation in recent moves"}
              </p>
            </div>
          </div>
        </div>

        {/* EMA Positions Section */}
        <div className="pt-4 border-t border-secondary/20">
          <h4 className="font-medium mb-3 flex items-center">
            <LineChart className="h-4 w-4 mr-2 text-blue-400" />
            EMA Positions
          </h4>
          <div className="space-y-2">
            <div className="ema-indicator">
              <div className="ema-color ema-9"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">EMA 9</div>
                <div className="text-xs text-muted-foreground">{indicators.ema9Position}</div>
              </div>
            </div>
            <div className="ema-indicator">
              <div className="ema-color ema-21"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">EMA 21</div>
                <div className="text-xs text-muted-foreground">{indicators.ema21Position}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

