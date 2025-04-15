"use client";

import type { Player } from "@/lib/types";
import styles from "./game-over.module.css";

interface GameOverProps {
  winner: Player;
  onNewGame: () => void;
}

export default function GameOver({ winner, onNewGame }: GameOverProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Game Over!</h2>
      <p className={styles.message}>Player {winner.id + 1} wins!</p>
      <button onClick={onNewGame} className={styles.button}>
        New Game
      </button>
    </div>
  );
}
