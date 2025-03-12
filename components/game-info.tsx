interface GameInfoProps {
  currentPlayer: number
  cardsPlayed: number
  hasDrawnCards: boolean
}

export default function GameInfo({ currentPlayer, cardsPlayed, hasDrawnCards }: GameInfoProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex justify-between">
        <div>
          <p className="font-semibold">Current Player: {currentPlayer}</p>
        </div>
        <div>
          <p className="font-semibold">Cards Played: {cardsPlayed}/3</p>
        </div>
        <div>
          <p className={`font-semibold ${hasDrawnCards ? "text-green-600" : "text-red-600"}`}>
            {hasDrawnCards ? "Cards Drawn" : "Draw Cards First"}
          </p>
        </div>
      </div>
    </div>
  )
}

