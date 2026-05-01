"use client"

import { useState } from "react"
import { usePuter } from "../../hooks/usePuter"

const MODELS = [
  { id: "claude-sonnet-4", name: "Claude Sonnet 4" },
  { id: "claude-opus-4", name: "Claude Opus 4" },
  { id: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet" },
  { id: "claude-3-7-opus", name: "Claude 3.7 Opus" },
]

export default function AdvancedAIDemo() {
  const { puter, isLoaded } = usePuter()
  const [chatInput, setChatInput] = useState("")
  const [chatResponse, setChatResponse] = useState<string>("")
  const [imagePrompt, setImagePrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<HTMLImageElement | null>(null)
  const [selectedModel, setSelectedModel] = useState("claude-sonnet-4")
  const [loading, setLoading] = useState({ chat: false, image: false })

  const handleChat = async () => {
    if (!puter || !chatInput.trim()) return

    setLoading({ ...loading, chat: true })
    setChatResponse("") // Clear previous response

    try {
      const stream = await puter.ai.chat(chatInput, {
        model: selectedModel,
        stream: true,
      })

      // Handle the stream
      for await (const chunk of stream) {
        console.log("Stream chunk:", chunk)

        // Append each chunk to the response
        if (chunk.text) {
          setChatResponse((prev) => prev + chunk.text)
        } else if (typeof chunk === "string") {
          setChatResponse((prev) => prev + chunk)
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      setChatResponse(`Error: ${error}`)
    } finally {
      setLoading({ ...loading, chat: false })
    }
  }

  const handleImageGeneration = async () => {
    if (!puter || !imagePrompt.trim()) return

    setLoading({ ...loading, image: true })
    try {
      const imageElement = await puter.ai.txt2img(imagePrompt)
      setGeneratedImage(imageElement)
    } catch (error) {
      console.error("Image generation error:", error)
      // You might want to show an error message to the user here
    } finally {
      setLoading({ ...loading, image: false })
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading AI capabilities...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">Next.js + Puter.js AI Demo</h1>

      {/* Model Selection */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Select AI Model</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`p-3 rounded text-sm ${
                selectedModel === model.id ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {model.name}
            </button>
          ))}
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Selected: <span className="font-semibold">{MODELS.find((m) => m.id === selectedModel)?.name}</span>
        </div>
      </div>

      {/* Chat Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">💬 Chat with AI</h2>
        <div className="space-y-4">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask anything..."
            className="w-full p-3 border rounded-lg resize-none"
            rows={3}
          />
          <button
            onClick={handleChat}
            disabled={loading.chat || !chatInput.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading.chat ? "AI is thinking..." : "Ask AI"}
          </button>
          {chatResponse && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Response (Streaming):</h3>
              <div className="whitespace-pre-wrap break-words">
                {chatResponse}
                {loading.chat && <span className="animate-pulse">▋</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Generation Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">🎨 Generate Images</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            placeholder="Describe an image..."
            className="w-full p-3 border rounded-lg"
          />
          <button
            onClick={handleImageGeneration}
            disabled={loading.image || !imagePrompt.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading.image ? "Generating..." : "Generate Image"}
          </button>
          {generatedImage && (
            <div className="text-center">
              <img
                src={generatedImage.src || "/placeholder.svg"}
                alt="Generated"
                className="max-w-full h-auto rounded-lg shadow-md mx-auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
