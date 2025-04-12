"use client";

import type { Card } from "@/lib/types";
import CardComponent from "@/components/card/card";
import styles from "./action-area.module.css";

interface ActionAreaProps {
  actionCards: Card[];
  isCurrentPlayersTurn: boolean;
}

export default function ActionArea({ actionCards, isCurrentPlayersTurn }: ActionAreaProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Action Area</h3>
      <div className={styles.cardGroup}>
        {actionCards.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Click on an action card in your hand to play it here</p>
          </div>
        ) : (
          actionCards.map((card, index) => (
            <div
              key={`action-${index}`}
              className={styles.cardWrapper}
              style={{
                marginLeft: index > 0 ? "-65px" : "0",
              }}
            >
              <CardComponent card={card} isSmall={true} onClick={() => {}} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
