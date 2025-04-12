"use client";

import styles from "./game-controls.module.css";

interface GameControlsProps {
  cardsPlayed: number;
  onEndTurn: () => void;
  isCurrentPlayersTurn: boolean;
  hasDrawnCards: boolean;
}

export default function GameControls({
  cardsPlayed,
  onEndTurn,
  isCurrentPlayersTurn,
  hasDrawnCards,
}: GameControlsProps) {
  return (
    <div className={styles.gameControlsWrapper}>
      <div className={styles.gameControlsContent}>
        <div>
          <p className={styles.cardsPlayed}>Cards played: {cardsPlayed}/3</p>
          {!hasDrawnCards && <p className={styles.drawWarning}>Draw cards first!</p>}
        </div>
        <button
          onClick={onEndTurn}
          disabled={!isCurrentPlayersTurn || !hasDrawnCards}
          className={`${styles.endTurnButton} ${!isCurrentPlayersTurn || !hasDrawnCards ? styles.disabled : ""}`}
        >
          End Turn
        </button>
      </div>
    </div>
  );
}
