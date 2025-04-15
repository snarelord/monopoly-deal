"use client";

import styles from "./game-setup.module.css";

interface GameSetupProps {
  onStartGame: (numPlayers: number) => void;
}

export default function GameSetup({ onStartGame }: GameSetupProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Start New Game</h2>
      <div className={styles.buttonGroup}>
        <button onClick={() => onStartGame(2)} className={styles.button}>
          2 Players
        </button>
        <button onClick={() => onStartGame(3)} className={styles.button}>
          3 Players
        </button>
        <button onClick={() => onStartGame(4)} className={styles.button}>
          4 Players
        </button>
      </div>
    </div>
  );
}
