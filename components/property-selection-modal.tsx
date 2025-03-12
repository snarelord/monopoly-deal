"use client";

import { useState } from "react";
import type { PropertySet } from "@/lib/types";
import CardComponent from "@/components/card";

interface PropertySelectionModalProps {
  title: string;
  propertySets: PropertySet[];
  onSelect: (setIndex: number, cardIndex: number) => void;
  onCancel: () => void;
  allowCompleteSet?: boolean;
}

export default function PropertySelectionModal({
  title,
  propertySets,
  onSelect,
  onCancel,
  allowCompleteSet = false,
}: PropertySelectionModalProps) {
  const [selectedSetIndex, setSelectedSetIndex] = useState<number | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(
    null
  );

  const handleSetSelect = (index: number) => {
    setSelectedSetIndex(index);
    setSelectedCardIndex(null); // Reset card selection when set changes
  };

  const handleCardSelect = (cardIndex: number) => {
    setSelectedCardIndex(cardIndex);
  };

  const handleConfirm = () => {
    if (selectedSetIndex !== null && selectedCardIndex !== null) {
      onSelect(selectedSetIndex, selectedCardIndex);
    }
  };

  // Determine the title based on the property selection type
  const modalTitle = title.includes("forced-deal-own")
    ? "Select one of your properties to swap"
    : title;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{modalTitle}</h2>

        <div className="mb-4">
          <p className="font-semibold mb-2">Select a property set:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {propertySets.map((set, setIndex) => {
              // Skip complete sets if not allowed
              if (!allowCompleteSet && set.isComplete) return null;

              return (
                <div
                  key={setIndex}
                  className={`p-2 border rounded cursor-pointer ${
                    selectedSetIndex === setIndex
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                  onClick={() => handleSetSelect(setIndex)}
                >
                  <div
                    className={`h-4 bg-${set.color.replace(
                      " ",
                      "-"
                    )} rounded-t-sm mb-1`}
                  ></div>
                  <div className="text-sm font-medium">{set.color} Set</div>
                  <div className="text-xs text-gray-600">
                    Cards: {set.cards.length}/{set.requiredCards}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedSetIndex !== null && (
          <div className="mb-4">
            <p className="font-semibold mb-2">Select a card:</p>
            <div className="flex flex-wrap gap-3">
              {propertySets[selectedSetIndex].cards.map((card, cardIndex) => (
                <div
                  key={cardIndex}
                  className={`cursor-pointer transition-transform ${
                    selectedCardIndex === cardIndex
                      ? "transform -translate-y-2"
                      : ""
                  }`}
                  onClick={() => handleCardSelect(cardIndex)}
                >
                  <CardComponent
                    card={card}
                    isSmall={true}
                    onClick={() => {}}
                    isSelected={selectedCardIndex === cardIndex}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleConfirm}
            disabled={selectedSetIndex === null || selectedCardIndex === null}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}
