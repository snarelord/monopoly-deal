"use client";

import type { Card } from "@/lib/types";
import CardComponent from "@/components/card";

interface ActionAreaProps {
  actionCards: Card[];
  isCurrentPlayersTurn: boolean;
}

export default function ActionArea({
  actionCards,
  isCurrentPlayersTurn,
}: ActionAreaProps) {
  return (
    <div className="p-3 bg-white rounded-lg shadow-md min-h-[150px] min-w-[150px]">
      <h3 className="text-lg font-semibold mb-2 text-center">Action Area</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {actionCards.length === 0 ? (
          <div className="text-gray-400 text-center">
            <p>Click on an action card in your hand to play it here</p>
          </div>
        ) : (
          actionCards.map((card, index) => (
            <div
              key={`action-${index}`}
              className="relative"
              style={{
                marginLeft: index > 0 ? "-65px" : "0", // overlap
              }}
            >
              <CardComponent card={card} isSmall={true} onClick={() => {}} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
