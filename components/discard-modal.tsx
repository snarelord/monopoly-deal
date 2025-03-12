"use client"

import { useState } from "react"
import type { Player } from "@/lib/types"
import CardComponent from "@/components/card"

interface DiscardModalProps {
  player: Player
  onDiscard: (cardIndices: number[]) => void
}

export default function DiscardModal({ player, onDiscard }: DiscardModalProps) {
  const [selectedCards, setSelectedCards] = useState<number[]>([])

  const handleCardClick = (index: number) => {
    if (selectedCards.includes(index)) {
      setSelectedCards(selectedCards.filter((i) => i !== index))
    } else {
      setSelectedCards([...selectedCards, index])
    }
  }

  const handleDiscard = () => {
    const cardsToKeep = 7
    const cardsToDiscard = player.hand.length - cardsToKeep

    if (selectedCards.length !== cardsToDiscard) {
      alert(`You must discard exactly ${cardsToDiscard} cards to have 7 cards in your hand.`)
      return
    }

    onDiscard(selectedCards)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Discard Cards</h2>
        <p className="mb-4">
          You have {player.hand.length} cards in your hand. You must discard {player.hand.length - 7} cards to end your
          turn.
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {player.hand.map((card, index) => (
            <div
              key={`discard-${index}`}
              className={`relative transition-transform ${selectedCards.includes(index) ? "transform -translate-y-4" : ""}`}
              onClick={() => handleCardClick(index)}
            >
              <CardComponent card={card} onClick={() => {}} isSelected={selectedCards.includes(index)} />
              {selectedCards.includes(index) && (
                <div className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <button onClick={handleDiscard} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Discard Selected Cards
          </button>
        </div>
      </div>
    </div>
  )
}

