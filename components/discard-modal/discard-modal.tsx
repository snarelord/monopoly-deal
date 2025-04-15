"use client";

import { useState } from "react";
import type { Player } from "@/lib/types";
import CardComponent from "@/components/card/card";
import styles from "./discard-modal.module.css";

interface DiscardModalProps {
  player: Player;
  onDiscard: (cardIndices: number[]) => void;
  onBack: () => void;
  cardsPlayed: number;
}

export default function DiscardModal({ player, onDiscard }: DiscardModalProps) {
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  const handleCardClick = (index: number) => {
    if (selectedCards.includes(index)) {
      setSelectedCards(selectedCards.filter((i) => i !== index));
    } else {
      setSelectedCards([...selectedCards, index]);
    }
  };

  const handleDiscard = () => {
    const cardsToKeep = 7;
    const cardsToDiscard = player.hand.length - cardsToKeep;

    if (selectedCards.length !== cardsToDiscard) {
      alert(`You must discard exactly ${cardsToDiscard} cards to have 7 cards in your hand.`);
      return;
    }

    onDiscard(selectedCards);
  };

  return (
    <div className={styles.modalOverlay}>
      {/* <button className={styles.backButton} onClick={onBack}>
        X
      </button> */}
      <div className={styles.modalContent}>
        <h2 className={styles.heading}>Discard Cards</h2>
        <p className={styles.cardCount}>
          You have {player.hand.length} cards in your hand. You must discard {player.hand.length - 7} cards to end your
          turn.
        </p>

        <div className={styles.cardWrapper}>
          {player.hand.map((card, index) => (
            <div
              key={`discard-${index}`}
              className={`${styles.cardItem} ${selectedCards.includes(index) ? styles.selected : ""}`}
              onClick={() => handleCardClick(index)}
            >
              <CardComponent card={card} onClick={() => {}} isSelected={selectedCards.includes(index)} />
              {selectedCards.includes(index) && <div className={styles.checkMark}>✓</div>}
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button onClick={handleDiscard} className={styles.discardButton}>
            Discard Selected Cards
          </button>
        </div>
      </div>
    </div>
  );
}
