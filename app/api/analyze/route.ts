import { type NextRequest, NextResponse } from "next/server"
import type { AnalysisResult } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json()

    if (!imageBase64) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 })
    }

    // Prepare the prompt for Gemini
    const prompt = `
Analyze this trading chart image and provide a detailed technical analysis.

IMPORTANT: Focus primarily on the most recent 5-10 candles for your analysis, as recent price action is more relevant than the overall trend.

Focus on these key indicators:
1. RSI (Relative Strength Index) - Is it overbought (>70) or oversold (<=30)? Be very precise about this - if RSI touches or goes below 30, it IS oversold. If it touches or goes above 70, it IS overbought.
2. Volume Analysis - Is volume increasing, decreasing, or stable in recent candles?
3. Moving Averages (EMA 9 & 21) - Where is price in relation to these EMAs? Are there any recent crossovers?
4. Recent Trend - Based on the last 5-10 candles, is the immediate trend Uptrend, Downtrend, or Sideways?
5. Support and Resistance Levels - Identify the nearest support and resistance levels (as numeric values)
6. Candlestick Patterns - Identify any significant patterns in the most recent candles:
   - Reversal patterns (Engulfing, Hammer, Doji, Morning/Evening Star)
   - Continuation patterns (Three White Soldiers, Three Black Crows)
   - Breakout signals (candles breaking key levels with increased volume)
   - Look for divergences between price action and indicators

Based on these indicators, predict:
1. The direction of the next candle (bullish or bearish or natural)
2. The recommended trading duration (IMPORTANT: choose either 1 minute or 2 minute or 5 minutes based on your analysis)
3. The confidence level of this prediction (as a percentage)
4. The strength of the signal (strong, moderate, or weak)
5. Key factors influencing this prediction (list 3-4 points)

Format your response as a JSON object with this structure:
{
  "indicators": {
    "rsi": number,
    "volume": "increasing" | "decreasing" | "stable",
    "trend": "Uptrend" | "Downtrend" | "Sideways",
    "ema9Position": string,
    "ema21Position": string,
    "support": number,
    "resistance": number,
    "candlestickPatterns": [
      {
        "pattern": string,
        "significance": "high" | "medium" | "low",
        "implication": "bullish" | "bearish" | "neutral",
        "description": string,
        "isBreakout": boolean,
        "isReversal": boolean
      }
    ]
  },
  "prediction": {
    "direction": "bullish" | "bearish" | "natural",
    "duration": number,
    "confidence": number,
    "strength": "strong" | "moderate" | "weak",
    "factors": string[]
  }
}

IMPORTANT PATTERN IDENTIFICATION RULES:
- Focus on the MOST RECENT 5-10 candles for your analysis, not the entire chart
- For trend analysis, prioritize recent price action over the overall trend
- Look for potential trend reversals by analyzing recent candle formations
- Identify breakout signals where price breaks through support/resistance with volume

SPECIFIC PATTERN DEFINITIONS:
1. Bearish Engulfing: A bearish engulfing pattern must have a red candle that completely engulfs the previous green candle (body and sometimes shadows). It must appear at the end of an uptrend or at resistance levels.

2. Bullish Engulfing: A bullish engulfing pattern must have a green candle that completely engulfs the previous red candle (body and sometimes shadows). It must appear at the end of a downtrend or at support levels.

3. Ranging Reversal: A ranging reversal occurs when price has been moving sideways (ranging) and then shows signs of reversing the previous trend. Look for:
   - A series of candles with similar highs/lows (the range)
   - A breakout candle that moves decisively out of the range
   - Often accompanied by increased volume on the breakout candle
   - If breaking upward after a downtrend, it's a bullish ranging reversal
   - If breaking downward after an uptrend, it's a bearish ranging reversal
   - IMPORTANT: If you see green candles forming after a period of ranging following a downtrend, this is likely a bullish ranging reversal

4. Doji: A doji has opening and closing prices that are very close to each other, creating a small or non-existent body with upper and lower shadows.

5. Hammer: A hammer has a small body at the top with a long lower shadow that is at least twice the size of the body. It appears at the bottom of a downtrend and is bullish.

6. Shooting Star: A shooting star has a small body at the bottom with a long upper shadow that is at least twice the size of the body. It appears at the top of an uptrend and is bearish.

7. Double Bottom/Top: A double bottom shows two distinct lows at approximately the same price level, indicating a potential reversal from a downtrend to an uptrend. A double top shows two distinct highs, indicating a potential reversal from an uptrend to a downtrend.

IMPORTANT: Pay special attention to ranging patterns followed by green candles after a downtrend. This is a strong indication of a bullish reversal, not a continuation of the bearish trend.

If no clear pattern is present, return an empty array for candlestickPatterns.

PREDICTION GUIDELINES:
- For the "duration" field, choose between 1, 2, or 5 minutes based on your analysis
- For stronger signals, use longer durations (5 minutes)
- For weaker or uncertain signals, use shorter durations (1 minute)
- For moderate signals, use medium durations (2 minutes)
- It's critical that you return valid JSON that matches this exact structure
`

    // Call Gemini API using server-side API key
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error("API key is not defined in environment variables")
      return NextResponse.json({ error: "API key configuration error" }, { status: 500 })
    }

    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: imageBase64.split(",")[1] } }],
        },
      ],
      generationConfig: {
        temperature: 0.2, // Lower temperature for more precise pattern recognition
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    }

    const geminiResponse = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json()
      return NextResponse.json(
        { error: `Gemini API error: ${errorData.error?.message || "Unknown error"}` },
        { status: 500 },
      )
    }

    const data = await geminiResponse.json()

    // Parse the response
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json({ error: "Invalid response format from Gemini API" }, { status: 500 })
    }

    const responseText = data.candidates[0].content.parts[0].text

    // Extract JSON from the response
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/{[\s\S]*}/)

    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not extract JSON from Gemini API response" }, { status: 500 })
    }

    const jsonStr = jsonMatch[0].replace(/```json|```/g, "").trim()

    try {
      const result = JSON.parse(jsonStr) as AnalysisResult

      // Validate the result structure
      if (!result.indicators || !result.prediction) {
        return NextResponse.json({ error: "Invalid JSON structure in Gemini API response" }, { status: 500 })
      }

      // Ensure duration is one of the allowed values
      if (![1, 2, 5].includes(result.prediction.duration)) {
        console.warn("Invalid duration received, defaulting to closest valid value")
        // Find the closest valid duration
        const validDurations = [1, 2, 5]
        const closest = validDurations.reduce((prev, curr) => {
          return Math.abs(curr - result.prediction.duration) < Math.abs(prev - result.prediction.duration) ? curr : prev
        })
        result.prediction.duration = closest
      }

      // Ensure candlestickPatterns exists (even if empty)
      if (!result.indicators.candlestickPatterns) {
        result.indicators.candlestickPatterns = []
      }

      // Ensure isBreakout and isReversal properties exist for each pattern
      result.indicators.candlestickPatterns.forEach((pattern) => {
        if (pattern.isBreakout === undefined) {
          pattern.isBreakout =
            pattern.pattern.toLowerCase().includes("breakout") ||
            pattern.description.toLowerCase().includes("breaking") ||
            pattern.description.toLowerCase().includes("breakout")
        }

        if (pattern.isReversal === undefined) {
          pattern.isReversal =
            pattern.pattern.toLowerCase().includes("reversal") ||
            pattern.pattern.toLowerCase().includes("engulfing") ||
            pattern.pattern.toLowerCase().includes("hammer") ||
            pattern.pattern.toLowerCase().includes("doji") ||
            pattern.pattern.toLowerCase().includes("star") ||
            pattern.pattern.toLowerCase().includes("bottom") ||
            pattern.pattern.toLowerCase().includes("top")
        }
      })

      // Check if RSI is at or below 30 (oversold) or at or above 70 (overbought)
      // This ensures the RSI status is correctly reported
      if (result.indicators.rsi <= 30) {
        // Add a factor about oversold conditions if not already present
        const hasOversoldFactor = result.prediction.factors.some(
          (factor) =>
            factor.toLowerCase().includes("oversold") ||
            (factor.toLowerCase().includes("rsi") && factor.toLowerCase().includes("30")),
        )

        if (!hasOversoldFactor && result.prediction.direction === "bullish") {
          result.prediction.factors.push("RSI is in oversold territory (at or below 30), suggesting a potential bounce")
        }
      }

      return NextResponse.json(result)
    } catch (parseError) {
      return NextResponse.json(
        { error: `Failed to parse JSON from Gemini API: ${parseError.message}` },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}

