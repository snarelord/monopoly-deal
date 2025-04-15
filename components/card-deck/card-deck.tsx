"use client";

import styles from "./card-deck.module.css";

interface CardDeckProps {
  cardsRemaining: number;
  onDrawCards: () => void;
  hasDrawnCards: boolean;
}

export default function CardDeck({ cardsRemaining, onDrawCards, hasDrawnCards }: CardDeckProps) {
  return (
    <div className={styles.container}>
      <div
        className={`${styles.card} ${hasDrawnCards ? styles.drawn : styles.active}`}
        onClick={hasDrawnCards ? undefined : onDrawCards}
      >
        <span className={styles.label}>{hasDrawnCards ? "Drawn" : "Draw"}</span>
      </div>
      <div className={styles.remaining}>Cards remaining: {cardsRemaining}</div>
    </div>
  );
}
