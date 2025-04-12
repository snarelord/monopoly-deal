"use client";
import type { Card as CardType } from "@/lib/types";
import Image from "next/image";
import styles from "./card.module.css";

interface CardProps {
  card: CardType;
  onClick: () => void;
  isSelected?: boolean;
  isSmall?: boolean;
}

export default function Card({ card, onClick, isSelected = false, isSmall = false }: CardProps) {
  return (
    <div className={`${styles.cardWrapper} ${isSelected ? styles.selected : styles.hoverEffect}`} onClick={onClick}>
      <div className={`${styles.card} ${isSmall ? styles.small : styles.large}`}>
        <Image
          src={card.image || "/placeholder.svg"}
          alt={card.name}
          fill
          className={styles.cardImage}
          sizes={isSmall ? "64px" : "96px"}
        />
      </div>
    </div>
  );
}
