import styles from "./game-info.module.css";

interface GameInfoProps {
  currentPlayer: number;
  cardsPlayed: number;
  hasDrawnCards: boolean;
}

export default function GameInfo({ currentPlayer, cardsPlayed, hasDrawnCards }: GameInfoProps) {
  return (
    <div className={styles.gameInfoWrapper}>
      <div className={styles.gameInfoContent}>
        <div>
          <p className={styles.currentPlayer}>Current Player: {currentPlayer}</p>
        </div>
        <div>
          <p className={styles.cardsPlayed}>Cards Played: {cardsPlayed}/3</p>
        </div>
        <div>
          <p className={`${styles.drawStatus} ${hasDrawnCards ? styles.cardsDrawn : styles.drawCardsFirst}`}>
            {hasDrawnCards ? "Cards Drawn" : "Draw Cards First"}
          </p>
        </div>
      </div>
    </div>
  );
}
