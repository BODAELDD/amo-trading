"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ImageUploader from "./image-uploader"
import ChartVisualization from "./chart-visualization"
import TechnicalAnalysis from "./technical-analysis"
import PredictionResults from "./prediction-results"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { analyzeChartImage } from "@/lib/gemini-api"
import { verifyPatterns } from "@/lib/pattern-verification"
import { enhancePatternDetection } from "@/lib/pattern-detection"
import type { AnalysisResult } from "@/lib/types"

export default function TradingAnalysisTool() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState("upload")

  const handleImageUpload = (url: string) => {
    setImageUrl(url)
    setActiveTab("chart")
  }

  const handleAnalyze = async () => {
    if (!imageUrl) return

    setIsAnalyzing(true)
    try {
      // Get the initial analysis from Gemini
      const result = await analyzeChartImage(imageUrl)

      // Verify the patterns
      const verifiedResult = {
        ...result,
        indicators: verifyPatterns(result.indicators),
      }

      // Enhance pattern detection with image-specific logic
      const enhancedResult = enhancePatternDetection(imageUrl, verifiedResult)

      // Log the RSI value for debugging
      console.log("Final RSI value:", enhancedResult.indicators.rsi)

      setAnalysisResult(enhancedResult)
      setActiveTab("analysis")
    } catch (error) {
      console.error("Error analyzing image:", error)
      // Show error to user
      alert(
        `Analysis failed: ${error.message || "Unknown error occurred"}. Please try again with a clearer chart image.`,
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
          <TabsTrigger value="chart" disabled={!imageUrl}>
            Chart Visualization
          </TabsTrigger>
          <TabsTrigger value="analysis" disabled={!analysisResult}>
            Analysis & Prediction
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <Card className="bg-card dark:bg-card-dark text-card-foreground dark:text-card-foreground">
            <CardContent className="pt-6">
              <ImageUploader onImageUploaded={handleImageUpload} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="mt-4">
          <Card className="bg-card dark:bg-card-dark text-card-foreground dark:text-card-foreground">
            <CardContent className="pt-6">
              {imageUrl && (
                <>
                  <ChartVisualization imageUrl={imageUrl} />
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="w-full max-w-md bg-primary text-primary-foreground hover:bg-primary/80 dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing Chart...
                        </>
                      ) : (
                        "Analyze Chart"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="mt-4">
          {analysisResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChartVisualization
                  imageUrl={imageUrl!}
                  indicators={analysisResult.indicators}
                  prediction={analysisResult.prediction}
                />
              </div>
              <div className="flex flex-col gap-6">
                <TechnicalAnalysis indicators={analysisResult.indicators} />
                <PredictionResults prediction={analysisResult.prediction} />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

