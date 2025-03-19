"use client";

import { useState } from "react";
import type { Card, Player } from "@/lib/types";
import CardComponent from "@/components/card";

interface ActionModalProps {
  card: Card;
  players: Player[];
  currentPlayerIndex: number;
  onComplete: (targetPlayerIndex?: number, amount?: number) => void;
  onCancel: () => void;
}

export default function ActionModal({ card, players, currentPlayerIndex, onComplete, onCancel }: ActionModalProps) {
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);

  const handlePlayerSelect = (index: number) => {
    setSelectedPlayerIndex(index);
  };

  const handleComplete = () => {
    onComplete(selectedPlayerIndex !== null ? selectedPlayerIndex : undefined, selectedAmount || undefined);
  };

  // determine what UI to show based on action type
  const renderActionUI = () => {
    switch (card.actionType) {
      case "debt-collector":
        return (
          <div className="mb-4">
            <p className="mb-2 font-semibold">Select a player to collect 5M from:</p>
            <div className="grid grid-cols-2 gap-2">
              {players.map((player, index) => {
                if (index === currentPlayerIndex) return null; // skip current player
                return (
                  <button
                    key={index}
                    className={`p-2 border rounded ${
                      selectedPlayerIndex === index ? "bg-blue-100 border-blue-500" : "border-gray-300"
                    }`}
                    onClick={() => handlePlayerSelect(index)}
                  >
                    Player {player.id + 1}
                    <div className="text-xs text-gray-600">
                      Bank: ${player.bank.reduce((sum, card) => sum + card.value, 0)}M
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "birthday":
        return (
          <div className="mb-4">
            <p className="mb-2">All players will pay you 2M.</p>
            <p className="text-sm text-gray-600">
              (This will automatically collect from all players' banks. If a player doesn't have enough money, they'll
              pay what they can.)
            </p>
          </div>
        );

      case "pass-go":
        return (
          <div className="mb-4">
            <p className="mb-2">Draw 2 more cards from the deck.</p>
          </div>
        );

      case "rent":
        const rentColours = [];
        if (card.colour) rentColours.push(card.colour);
        if (card.secondaryColour) rentColours.push(card.secondaryColour);

        return (
          <div className="mb-4">
            <p className="mb-2 font-semibold">
              Collect rent for your {rentColours.join(" and ")} properties:{" "}
              {/* logic needs fixing here and elsewhere */}
            </p>
            <p className="text-sm text-gray-600 mb-2">Select a player to collect rent from:</p>
            <div className="grid grid-cols-2 gap-2">
              {players.map((player, index) => {
                if (index === currentPlayerIndex) return null; // skip current player
                return (
                  <button
                    key={index}
                    className={`p-2 border rounded ${
                      selectedPlayerIndex === index ? "bg-blue-100 border-blue-500" : "border-gray-300"
                    }`}
                    onClick={() => handlePlayerSelect(index)}
                  >
                    Player {player.id + 1}
                    <div className="text-xs text-gray-600">
                      Bank: ${player.bank.reduce((sum, card) => sum + card.value, 0)}M
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "deal-breaker":
        return (
          <div className="mb-4">
            <p className="mb-2 font-semibold">Steal a complete property set:</p>
            <div className="grid grid-cols-2 gap-2">
              {players.map((player, index) => {
                if (index === currentPlayerIndex) return null; // skip current player

                // only show players with complete property sets
                const completePropertySets = player.properties.filter((set) => set.isComplete);
                if (completePropertySets.length === 0) return null;

                return (
                  <button
                    key={index}
                    className={`p-2 border rounded ${
                      selectedPlayerIndex === index ? "bg-blue-100 border-blue-500" : "border-gray-300"
                    }`}
                    onClick={() => handlePlayerSelect(index)}
                  >
                    Player {player.id + 1}
                    <div className="text-xs text-gray-600">Complete sets: {completePropertySets.length}</div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "sly-deal":
        return (
          <div className="mb-4">
            <p className="mb-2 font-semibold">Steal a property card (not from a complete set):</p>
            <div className="grid grid-cols-2 gap-2">
              {players.map((player, index) => {
                if (index === currentPlayerIndex) return null; // skip current player

                // only show players with properties that aren't in complete sets
                const incompleteProperties = player.properties.filter((set) => !set.isComplete);
                if (incompleteProperties.length === 0) return null;

                return (
                  <button
                    key={index}
                    className={`p-2 border rounded ${
                      selectedPlayerIndex === index ? "bg-blue-100 border-blue-500" : "border-gray-300"
                    }`}
                    onClick={() => handlePlayerSelect(index)}
                  >
                    Player {player.id + 1}
                    <div className="text-xs text-gray-600">
                      Properties available: {incompleteProperties.reduce((sum, set) => sum + set.cards.length, 0)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "forced-deal":
        return (
          <div className="mb-4">
            <p className="mb-2 font-semibold">Swap a property with another player (not from complete sets):</p>
            <div className="grid grid-cols-2 gap-2">
              {players.map((player, index) => {
                if (index === currentPlayerIndex) return null; // skip current player

                // only show players with properties that aren't in complete sets
                const incompleteProperties = player.properties.filter((set) => !set.isComplete);
                if (incompleteProperties.length === 0) return null;

                return (
                  <button
                    key={index}
                    className={`p-2 border rounded ${
                      selectedPlayerIndex === index ? "bg-blue-100 border-blue-500" : "border-gray-300"
                    }`}
                    onClick={() => handlePlayerSelect(index)}
                  >
                    Player {player.id + 1}
                    <div className="text-xs text-gray-600">
                      Properties available: {incompleteProperties.reduce((sum, set) => sum + set.cards.length, 0)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      default:
        return (
          <div className="mb-4">
            <p>This action card will be played.</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Play Action Card</h2>

        <div className="flex items-center mb-6">
          <div className="mr-4">
            <CardComponent card={card} onClick={() => {}} />
          </div>
          <div>
            <p className="font-semibold">{card.name}</p>
            <p className="text-sm text-gray-600">Value: ${card.value}M</p>
            <p className="text-sm text-gray-600">Action: {card.actionType}</p>
          </div>
        </div>

        {renderActionUI()}

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleComplete}
            disabled={
              (card.actionType === "debt-collector" ||
                card.actionType === "rent" ||
                card.actionType === "deal-breaker" ||
                card.actionType === "sly-deal" ||
                card.actionType === "forced-deal") &&
              selectedPlayerIndex === null
            }
          >
            Play Card
          </button>
        </div>
      </div>
    </div>
  );
}
