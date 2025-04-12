"use client";

import type { Card } from "@/lib/types";
import CardComponent from "@/components/card/card";
import styles from "./card-action-modal.module.css";

interface CardActionOption {
  area: string;
  label: string;
}

interface CardActionModalProps {
  card: Card;
  options: CardActionOption[];
  onAction: (targetArea: string) => void;
  onClose: () => void;
}

export default function CardActionModal({ card, options, onAction, onClose }: CardActionModalProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Play Card</h2>

        <div className={styles.cardDetails}>
          <div className={styles.cardImage}>
            <CardComponent card={card} onClick={() => {}} />
          </div>
          <div>
            <p className={styles.cardName}>{card.name}</p>
            <p className={styles.cardMeta}>Value: ${card.value}M</p>
            {card.colour && <p className={styles.cardMeta}>Colour: {card.colour}</p>}
            {card.type && <p className={styles.cardMeta}>Type: {card.type}</p>}
          </div>
        </div>

        <div className={styles.optionSection}>
          <p className={styles.optionTitle}>Choose where to play this card:</p>
          <div className={styles.optionList}>
            {options.map((option, index) => (
              <button key={index} className={styles.optionButton} onClick={() => onAction(option.area)}>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
