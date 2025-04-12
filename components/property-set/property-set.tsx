"use client";

import type { PropertySet as PropertySetType } from "@/lib/types";
import CardComponent from "../card/card";
import styles from "./property-set.module.css";

interface PropertySetProps {
  propertySet: PropertySetType;
  onClick: () => void;
}

export default function PropertySet({ propertySet, onClick }: PropertySetProps) {
  // get colour class based on property colour for the border
  const getColourClass = (colour: string): string => {
    switch (colour) {
      case "brown":
        return styles.brown;
      case "light blue":
        return styles.lightBlue;
      case "pink":
        return styles.pink;
      case "orange":
        return styles.orange;
      case "red":
        return styles.red;
      case "yellow":
        return styles.yellow;
      case "green":
        return styles.green;
      case "dark blue":
        return styles.darkBlue;
      case "black":
        return styles.black;
      case "mint":
        return styles.mint;
      default:
        return styles.default;
    }
  };

  const colourClass = getColourClass(propertySet.colour);
  const isComplete = propertySet.isComplete;

  return (
    <div className={`${styles.propertySet} ${isComplete ? styles.complete : colourClass}`} onClick={onClick}>
      <div className={styles.cardContainer}>
        {propertySet.cards.map((card, index) => (
          <div
            key={`property-${index}`}
            className={styles.cardWrapper}
            style={{ marginTop: index > 0 ? "-80px" : "0" }}
          >
            <CardComponent card={card} isSmall={true} onClick={() => {}} />
          </div>
        ))}
      </div>
      {isComplete && (
        <div className={styles.completeBadge}>
          <div className={styles.completeText}>Complete!</div>
        </div>
      )}
    </div>
  );
}
