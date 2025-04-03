"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void
}

export default function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      onImageUploaded(url)
    }
  }

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  return (
    <div className="flex flex-col items-center">
      <Card
        className={`w-full max-w-3xl h-64 flex items-center justify-center cursor-pointer border-2 border-dashed ${
          dragActive ? "border-primary" : "border-border"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <CardContent className="flex flex-col items-center justify-center h-full w-full p-6">
          <div className="rounded-full bg-secondary p-4 mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <p className="text-center mb-2 font-medium">Drag and drop your chart image here</p>
          <p className="text-center text-sm text-muted-foreground mb-4">or click to browse files (PNG, JPG)</p>
          <Button variant="outline" size="sm">
            Select Image
          </Button>
          <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={handleChange} />
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
        Upload a clear image of your trading chart for analysis. The AI will analyze patterns, indicators, and predict
        the next candle movement.
      </p>
    </div>
  )
}

