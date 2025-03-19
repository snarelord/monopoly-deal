"use client";

import type { Card } from "@/lib/types";
import CardComponent from "@/components/card";

interface CardActionOption {
  area: string;
  label: string;
}

interface CardActionModalProps {
  card: Card;
  options: CardActionOption[];
  onAction: (targetArea: string) => void;
  onClose: () => void;
}

export default function CardActionModal({ card, options, onAction, onClose }: CardActionModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Play Card</h2>

        <div className="flex items-center mb-6">
          <div className="mr-4">
            <CardComponent card={card} onClick={() => {}} />
          </div>
          <div>
            <p className="font-semibold">{card.name}</p>
            <p className="text-sm text-gray-600">Value: ${card.value}M</p>
            {card.colour && <p className="text-sm text-gray-600">Colour: {card.colour}</p>}
            {card.type && <p className="text-sm text-gray-600">Type: {card.type}</p>}
          </div>
        </div>

        <div className="mb-4">
          <p className="font-semibold mb-2">Choose where to play this card:</p>
          <div className="space-y-2">
            {options.map((option, index) => (
              <button
                key={index}
                className="w-full py-2 px-4 bg-blue-100 hover:bg-blue-200 rounded text-left transition-colors"
                onClick={() => onAction(option.area)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
