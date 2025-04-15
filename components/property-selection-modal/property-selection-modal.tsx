"use client";

import { useState } from "react";
import type { PropertySet } from "@/lib/types";
import CardComponent from "@/components/card/card";
import styles from "./psm.module.css";

interface PropertySelectionModalProps {
  title: string;
  propertySets: PropertySet[];
  onSelect: (setIndex: number, cardIndex: number) => void;
  onCancel: () => void;
  allowCompleteSet?: boolean;
}

export default function PropertySelectionModal({
  title,
  propertySets,
  onSelect,
  onCancel,
  allowCompleteSet = false,
}: PropertySelectionModalProps) {
  const [selectedSetIndex, setSelectedSetIndex] = useState<number | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  const handleSetSelect = (index: number) => {
    setSelectedSetIndex(index);
    setSelectedCardIndex(null); // Reset card selection when set changes
  };

  const handleCardSelect = (cardIndex: number) => {
    setSelectedCardIndex(cardIndex);
  };

  const handleConfirm = () => {
    if (selectedSetIndex !== null && selectedCardIndex !== null) {
      onSelect(selectedSetIndex, selectedCardIndex);
    }
  };

  // Determine the title based on the property selection type
  const modalTitle = title.includes("forced-deal-own") ? "Select one of your properties to swap" : title;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>{modalTitle}</h2>

        <div className={styles.section}>
          <p className={styles.sectionTitle}>Select a property set:</p>
          <div className={styles.setGrid}>
            {propertySets.map((set, setIndex) => {
              // Skip complete sets if not allowed
              if (!allowCompleteSet && set.isComplete) return null;

              return (
                <div
                  key={setIndex}
                  className={`${styles.setCard} ${selectedSetIndex === setIndex ? styles.setCardSelected : ""}`}
                  onClick={() => handleSetSelect(setIndex)}
                >
                  <div className={styles.setColourBar} style={{ backgroundColor: getColourHex(set.colour) }}></div>
                  <div className={styles.setName}>{set.colour} Set</div>
                  <div className={styles.setMeta}>
                    Cards: {set.cards.length}/{set.requiredCards}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedSetIndex !== null && (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Select a card:</p>
            <div className={styles.cardGrid}>
              {propertySets[selectedSetIndex].cards.map((card, cardIndex) => (
                <div
                  key={cardIndex}
                  className={`${styles.cardWrapper} ${
                    selectedCardIndex === cardIndex ? styles.cardWrapperSelected : ""
                  }`}
                  onClick={() => handleCardSelect(cardIndex)}
                >
                  <CardComponent
                    card={card}
                    isSmall={true}
                    onClick={() => {}}
                    isSelected={selectedCardIndex === cardIndex}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`${styles.confirmButton} ${
              selectedSetIndex === null || selectedCardIndex === null ? styles.confirmButtonDisabled : ""
            }`}
            onClick={handleConfirm}
            disabled={selectedSetIndex === null || selectedCardIndex === null}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}

// function to get colour hex values
function getColourHex(colour: string): string {
  switch (colour.toLowerCase()) {
    case "brown":
      return "#92400e";
    case "light blue":
      return "#7dd3fc";
    case "pink":
      return "#f472b6";
    case "orange":
      return "#fb923c";
    case "red":
      return "#ef4444";
    case "yellow":
      return "#facc15";
    case "green":
      return "#16a34a";
    case "dark blue":
      return "#1e40af";
    case "black":
      return "#1f2937";
    case "light green":
      return "#4ade80";
    default:
      return "#d1d5db";
  }
}
