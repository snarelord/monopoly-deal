"use client"

interface GameControlsProps {
  cardsPlayed: number
  onEndTurn: () => void
  isCurrentPlayersTurn: boolean
  hasDrawnCards: boolean
}

export default function GameControls({
  cardsPlayed,
  onEndTurn,
  isCurrentPlayersTurn,
  hasDrawnCards,
}: GameControlsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <p className="text-sm">Cards played: {cardsPlayed}/3</p>
          {!hasDrawnCards && <p className="text-sm text-red-600">Draw cards first!</p>}
        </div>
        <button
          onClick={onEndTurn}
          disabled={!isCurrentPlayersTurn || !hasDrawnCards}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          End Turn
        </button>
      </div>
    </div>
  )
}

