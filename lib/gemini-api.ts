import type { AnalysisResult } from "./types"

export async function analyzeChartImage(imageUrl: string): Promise<AnalysisResult> {
  try {
    // Convert the image URL to base64
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const imageBase64 = await blobToBase64(blob)

    // Call our server-side API route
    const analysisResponse = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageBase64 }),
    })

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.json()
      throw new Error(errorData.error || "Failed to analyze image")
    }

    const result = await analysisResponse.json()
    return result
  } catch (error) {
    console.error("Error analyzing image:", error)
    throw error
  }
}

// Helper function to convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

