import TradingAnalysisTool from "@/components/trading-analysis-tool"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="trading-tool-theme">
      <main className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-center mb-8">Real-Time Trading Analysis Tool</h1>
          <TradingAnalysisTool />
        </div>
      </main>
    </ThemeProvider>
  )
}

