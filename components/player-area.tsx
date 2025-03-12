"use client";

import { useState } from "react";
import type { Player, GameState } from "@/lib/types";
import CardComponent from "@/components/card";
import PropertySet from "@/components/property-set";
import CardActionModal from "@/components/card-action-modal";
import { isValidCardPlacement } from "@/lib/game-logic";

interface PlayerAreaProps {
  player: Player;
  isCurrentPlayer: boolean;
  onPlayCard: (
    cardIndex: number,
    targetArea: string,
    targetPlayer?: number
  ) => void;
  onPlayActionCard: (cardIndex: number) => void;
  gameState: GameState;
  bankTotal: number;
}

export default function PlayerArea({
  player,
  isCurrentPlayer,
  onPlayCard,
  onPlayActionCard,
  gameState,
  bankTotal,
}: PlayerAreaProps) {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const handleCardClick = (index: number) => {
    if (
      !isCurrentPlayer ||
      gameState.cardsPlayed >= 3 ||
      !gameState.hasDrawnCards
    )
      return;

    setSelectedCard(index);
    setShowActionModal(true);
  };

  const handleCardAction = (targetArea: string) => {
    if (selectedCard === null || !isCurrentPlayer) return;

    // If it's an action card and the target area is "action", handle it specially
    if (
      player.hand[selectedCard].type === "action" &&
      targetArea === "action"
    ) {
      onPlayActionCard(selectedCard);
    } else {
      onPlayCard(selectedCard, targetArea);
    }

    setSelectedCard(null);
    setShowActionModal(false);
  };

  const handleCloseModal = () => {
    setShowActionModal(false);
    setSelectedCard(null);
  };

  // Get valid placement options for the selected card
  const getValidPlacementOptions = () => {
    if (selectedCard === null) return [];

    const card = player.hand[selectedCard];
    const options = [];

    // Check if card can go to bank
    if (isValidCardPlacement(card, "bank")) {
      options.push({ area: "bank", label: "Add to Bank" });
    }

    // Check if card can be played as an action
    if (isValidCardPlacement(card, "action")) {
      options.push({ area: "action", label: "Play as Action" });
    }

    // Handle property cards
    if (card.type === "property") {
      // Check existing property sets of the same color
      const existingSetIndex = player.properties.findIndex(
        (set) => set.color === card.color
      );

      if (existingSetIndex >= 0) {
        options.push({
          area: `property-${existingSetIndex}`,
          label: `Add to ${card.color} Property Set`,
        });
      } else {
        options.push({
          area: `property-${player.properties.length}`,
          label: `Create New ${card.color} Property Set`,
        });
      }
    }

    // Handle wildcards
    if (card.type === "wildcard") {
      const isAnyColorWildcard =
        card.name.toLowerCase().includes("any color") ||
        card.name.toLowerCase().includes("any colour");

      if (isAnyColorWildcard) {
        // "Any Colour" wildcards can only be added to existing property sets
        // They cannot create their own set
        player.properties.forEach((set, index) => {
          // Only add option if the set is not already complete
          if (!set.isComplete) {
            options.push({
              area: `property-${index}`,
              label: `Add to ${set.color} Property Set as Wildcard`,
            });
          }
        });
      } else if (card.color && card.secondaryColor) {
        // Two-way wildcards can be added to either color's set
        const primaryColorSetIndex = player.properties.findIndex(
          (set) => set.color === card.color
        );
        const secondaryColorSetIndex = player.properties.findIndex(
          (set) => set.color === card.secondaryColor
        );

        if (primaryColorSetIndex >= 0) {
          options.push({
            area: `property-${primaryColorSetIndex}`,
            label: `Add to ${card.color} Property Set`,
          });
        } else {
          options.push({
            area: `property-${player.properties.length}`,
            label: `Create New ${card.color} Property Set`,
          });
        }

        if (secondaryColorSetIndex >= 0) {
          options.push({
            area: `property-${secondaryColorSetIndex}`,
            label: `Add to ${card.secondaryColor} Property Set`,
          });
        } else {
          options.push({
            area: `property-${player.properties.length}`,
            label: `Create New ${card.secondaryColor} Property Set`,
          });
        }
      } else if (card.color) {
        // Single color wildcards
        const colorSetIndex = player.properties.findIndex(
          (set) => set.color === card.color
        );

        if (colorSetIndex >= 0) {
          options.push({
            area: `property-${colorSetIndex}`,
            label: `Add to ${card.color} Property Set`,
          });
        } else {
          options.push({
            area: `property-${player.properties.length}`,
            label: `Create New ${card.color} Property Set`,
          });
        }
      }
    }

    return options;
  };

  return (
    <div
      className={`p-4 rounded-lg ${
        isCurrentPlayer ? "bg-blue-50 border-2 border-blue-300" : "bg-gray-50"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Player {player.id + 1}</h2>
        {isCurrentPlayer && (
          <span className="px-2 py-1 bg-blue-500 text-white text-sm rounded">
            Your Turn
          </span>
        )}
      </div>

      {/* Bank Area */}
      <div className="mb-4 p-3 bg-white rounded-lg shadow-sm min-h-[100px]">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Bank</h3>
          <span className="font-bold text-green-600">${bankTotal}M</span>
        </div>
        {/* overflow-x-auto allows horizontal scrolling */}
        <div className="flex gap-2 overflow-x-auto">
          {player.bank.map((card, index) => (
            <div
              key={`bank-${index}`}
              className="w-16 h-24 relative"
              style={{
                marginLeft: index > 0 ? "-50px" : "0", // Create overlap by using negative margin
              }}
            >
              <CardComponent card={card} isSmall={true} onClick={() => {}} />
            </div>
          ))}
          {player.bank.length === 0 && (
            <div className="text-gray-400 text-sm">
              {isCurrentPlayer
                ? "Click on a card in your hand to add to your bank"
                : "No money in bank"}
            </div>
          )}
        </div>
      </div>

      {/* Properties Area */}
      <div className="mb-4 p-3 bg-white rounded-lg shadow-sm min-h-[150px]">
        <h3 className="text-lg font-semibold mb-2">Properties</h3>
        <div className="flex flex-wrap gap-4">
          {player.properties.map((propertySet, setIndex) => (
            <PropertySet
              key={`property-set-${setIndex}`}
              propertySet={propertySet}
              onClick={() => {}}
            />
          ))}

          {player.properties.length === 0 && (
            <div className="text-gray-400 text-sm">
              {isCurrentPlayer
                ? "Click on a property card in your hand to add it here"
                : "No properties"}
            </div>
          )}
        </div>
      </div>

      {/* Hand Area - Only visible to current player */}
      {isCurrentPlayer && (
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">
            Your Hand ({player.hand.length})
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {player.hand.map((card, index) => (
              <div
                key={`hand-${index}`}
                className={`relative cursor-pointer transition-transform ${
                  selectedCard === index
                    ? "transform -translate-y-4"
                    : "hover:-translate-y-2"
                }`}
                onClick={() => handleCardClick(index)}
              >
                <CardComponent
                  card={card}
                  onClick={() => {}}
                  isSelected={selectedCard === index}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {!isCurrentPlayer && (
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">
            Hand ({player.hand.length} cards)
          </h3>
          <div className="flex justify-center">
            <div className="w-20 h-28 bg-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold">{player.hand.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Card Action Modal */}
      {showActionModal && selectedCard !== null && (
        <CardActionModal
          card={player.hand[selectedCard]}
          options={getValidPlacementOptions()}
          onAction={handleCardAction}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
