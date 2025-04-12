"use client";

import { useState } from "react";
import type { Card, Player } from "@/lib/types";
import CardComponent from "@/components/card/card";
import styles from "./action-modal.module.css";

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

  const renderActionUI = () => {
    switch (card.actionType) {
      case "debt-collector":
        return (
          <div className={styles.section}>
            <p className={styles.label}>Select a player to collect 5M from:</p>
            <div className={styles.playerGrid}>
              {players.map((player, index) => {
                if (index === currentPlayerIndex) return null;
                return (
                  <button
                    key={index}
                    className={`${styles.playerButton} ${selectedPlayerIndex === index ? styles.selected : ""}`}
                    onClick={() => handlePlayerSelect(index)}
                  >
                    Player {player.id + 1}
                    <div className={styles.playerBank}>
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
          <div className={styles.section}>
            <p className={styles.label}>All players will pay you 2M.</p>
            <p className={styles.subtext}>
              (This will automatically collect from all players' banks. If a player doesn't have enough money, they'll
              pay what they can.)
            </p>
          </div>
        );
      case "pass-go":
        return (
          <div className={styles.section}>
            <p className={styles.label}>Draw 2 more cards from the deck.</p>
          </div>
        );
      case "rent":
        const rentColours = [];
        if (card.colour) rentColours.push(card.colour);
        if (card.secondaryColour) rentColours.push(card.secondaryColour);

        return (
          <div className={styles.section}>
            <p className={styles.label}>Collect rent for your {rentColours.join(" and ")} properties:</p>
            <p className={styles.subtext}>Select a player to collect rent from:</p>
            <div className={styles.playerGrid}>
              {players.map((player, index) => {
                if (index === currentPlayerIndex) return null;
                return (
                  <button
                    key={index}
                    className={`${styles.playerButton} ${selectedPlayerIndex === index ? styles.selected : ""}`}
                    onClick={() => handlePlayerSelect(index)}
                  >
                    Player {player.id + 1}
                    <div className={styles.playerBank}>
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
          <div className={styles.section}>
            <p className={styles.label}>Steal a complete property set:</p>
            <div className={styles.playerGrid}>
              {players.map((player, index) => {
                if (index === currentPlayerIndex) return null;
                const completePropertySets = player.properties.filter((set) => set.isComplete);
                if (completePropertySets.length === 0) return null;
                return (
                  <button
                    key={index}
                    className={`${styles.playerButton} ${selectedPlayerIndex === index ? styles.selected : ""}`}
                    onClick={() => handlePlayerSelect(index)}
                  >
                    Player {player.id + 1}
                    <div className={styles.playerBank}>Complete sets: {completePropertySets.length}</div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case "sly-deal":
      case "forced-deal":
        return (
          <div className={styles.section}>
            <p className={styles.label}>
              {card.actionType === "sly-deal"
                ? "Steal a property card (not from a complete set):"
                : "Swap a property with another player (not from complete sets):"}
            </p>
            <div className={styles.playerGrid}>
              {players.map((player, index) => {
                if (index === currentPlayerIndex) return null;
                const incompleteProperties = player.properties.filter((set) => !set.isComplete);
                if (incompleteProperties.length === 0) return null;
                return (
                  <button
                    key={index}
                    className={`${styles.playerButton} ${selectedPlayerIndex === index ? styles.selected : ""}`}
                    onClick={() => handlePlayerSelect(index)}
                  >
                    Player {player.id + 1}
                    <div className={styles.playerBank}>
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
          <div className={styles.section}>
            <p>This action card will be played.</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Play Action Card</h2>
        <div className={styles.cardSummary}>
          <div className={styles.cardDisplay}>
            <CardComponent card={card} onClick={() => {}} />
          </div>
          <div>
            <p className={styles.cardName}>{card.name}</p>
            <p className={styles.cardInfo}>Value: ${card.value}M</p>
            <p className={styles.cardInfo}>Action: {card.actionType}</p>
          </div>
        </div>
        {renderActionUI()}
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button
            className={styles.playButton}
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
