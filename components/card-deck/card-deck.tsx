"use client"

interface CardDeckProps {
  cardsRemaining: number
  onDrawCards: () => void
  hasDrawnCards: boolean
}

export default function CardDeck({ cardsRemaining, onDrawCards, hasDrawnCards }: CardDeckProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-24 h-36 rounded-lg shadow-lg flex items-center justify-center cursor-pointer transition-colors
          ${hasDrawnCards ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
        onClick={hasDrawnCards ? undefined : onDrawCards}
      >
        <span className="text-white font-bold">{hasDrawnCards ? "Drawn" : "Draw"}</span>
      </div>
      <div className="mt-2 text-sm">Cards remaining: {cardsRemaining}</div>
    </div>
  )
}

