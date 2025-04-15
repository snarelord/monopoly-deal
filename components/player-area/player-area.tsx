"use client";

import { useState } from "react";
import type { Player, GameState } from "@/lib/types";
import CardComponent from "@/components/card/card";
import PropertySet from "@/components/property-set/property-set";
import CardActionModal from "@/components/card-action-modal/card-action-modal";
import { isValidCardPlacement } from "@/lib/game-logic";
import styles from "./player-area.module.css";

interface PlayerAreaProps {
  player: Player;
  isCurrentPlayer: boolean;
  onPlayCard: (cardIndex: number, targetArea: string, targetPlayer?: number) => void;
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
    if (!isCurrentPlayer || gameState.cardsPlayed >= 3 || !gameState.hasDrawnCards) return;

    setSelectedCard(index);
    setShowActionModal(true);
  };

  const handleCardAction = (targetArea: string) => {
    if (selectedCard === null || !isCurrentPlayer) return;

    // If it's an action card and the target area is "action", handle it specially
    if (player.hand[selectedCard].type === "action" && targetArea === "action") {
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
      // Check existing property sets of the same colour
      const existingSetIndex = player.properties.findIndex((set) => set.colour === card.colour);

      if (existingSetIndex >= 0) {
        options.push({
          area: `property-${existingSetIndex}`,
          label: `Add to ${card.colour} Property Set`,
        });
      } else {
        options.push({
          area: `property-${player.properties.length}`,
          label: `Create New ${card.colour} Property Set`,
        });
      }
    }

    // Handle wildcards
    if (card.type === "wildcard") {
      const isAnyColourWildcard =
        card.name.toLowerCase().includes("any colour") || card.name.toLowerCase().includes("any colour");

      if (isAnyColourWildcard) {
        // "Any Colour" wildcards can only be added to existing property sets
        // They cannot create their own set
        player.properties.forEach((set, index) => {
          // Only add option if the set is not already complete
          if (!set.isComplete) {
            options.push({
              area: `property-${index}`,
              label: `Add to ${set.colour} Property Set as Wildcard`,
            });
          }
        });
      } else if (card.colour && card.secondaryColour) {
        // Two-way wildcards can be added to either colour's set
        const primaryColourSetIndex = player.properties.findIndex((set) => set.colour === card.colour);
        const secondaryColourSetIndex = player.properties.findIndex((set) => set.colour === card.secondaryColour);

        if (primaryColourSetIndex >= 0) {
          options.push({
            area: `property-${primaryColourSetIndex}`,
            label: `Add to ${card.colour} Property Set`,
          });
        } else {
          options.push({
            area: `property-${player.properties.length}`,
            label: `Create New ${card.colour} Property Set`,
          });
        }

        if (secondaryColourSetIndex >= 0) {
          options.push({
            area: `property-${secondaryColourSetIndex}`,
            label: `Add to ${card.secondaryColour} Property Set`,
          });
        } else {
          options.push({
            area: `property-${player.properties.length}`,
            label: `Create New ${card.secondaryColour} Property Set`,
          });
        }
      } else if (card.colour) {
        // Single colour wildcards
        const colourSetIndex = player.properties.findIndex((set) => set.colour === card.colour);

        if (colourSetIndex >= 0) {
          options.push({
            area: `property-${colourSetIndex}`,
            label: `Add to ${card.colour} Property Set`,
          });
        } else {
          options.push({
            area: `property-${player.properties.length}`,
            label: `Create New ${card.colour} Property Set`,
          });
        }
      }
    }

    return options;
  };

  return (
    <div className={`${styles.container} ${isCurrentPlayer ? styles.currentPlayer : ""}`}>
      <div className={styles.header}>
        <h2 className={styles.playerName}>Player {player.id + 1}</h2>
        {isCurrentPlayer && <span className={styles.turnIndicator}>Your Turn</span>}
      </div>

      {/* Bank Area */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Bank</h3>
          <span className={styles.bankTotal}>${bankTotal}M</span>
        </div>
        <div className={styles.cardGrid}>
          {player.bank.map((card, index) => (
            <div key={`bank-${index}`} className="w-16 h-24 relative">
              <CardComponent card={card} isSmall={true} onClick={() => {}} />
            </div>
          ))}
          {player.bank.length === 0 && (
            <div className={styles.emptyMessage}>
              {isCurrentPlayer ? "Click on a card in your hand to add to your bank" : "No money in bank"}
            </div>
          )}
        </div>
      </div>

      {/* Properties Area */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Properties</h3>
        <div className={styles.propertyGrid}>
          {player.properties.map((propertySet, setIndex) => (
            <PropertySet key={`property-set-${setIndex}`} propertySet={propertySet} onClick={() => {}} />
          ))}

          {player.properties.length === 0 && (
            <div className={styles.emptyMessage}>
              {isCurrentPlayer ? "Click on a property card in your hand to add it here" : "No properties"}
            </div>
          )}
        </div>
      </div>

      {/* Hand Area - Only visible to current player */}
      {isCurrentPlayer ? (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Your Hand ({player.hand.length})</h3>
          <div className={styles.handContainer}>
            {player.hand.map((card, index) => (
              <div
                key={`hand-${index}`}
                className={`${styles.handCard} ${selectedCard === index ? styles.selectedCard : ""}`}
                onClick={() => handleCardClick(index)}
              >
                <CardComponent card={card} onClick={() => {}} isSelected={selectedCard === index} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Hand ({player.hand.length} cards)</h3>
          <div className={styles.opponentHand}>
            <div className={styles.opponentHandCard}>
              <span className={styles.opponentHandCount}>{player.hand.length}</span>
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
