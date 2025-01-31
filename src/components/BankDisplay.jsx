// src/components/BankDisplay.jsx
import React from "react";
import { moneyCards } from "../cardData"; // Import money cards

function BankDisplay() {
  return (
    <div className="bank-display">
      <h2>Bank</h2>
      <div className="money-cards">
        {moneyCards.map((card) => (
          <div key={card.id} className="money-card">
            <p>{card.type}</p>
            <p>Value: {card.value}m</p>
            <p>Count: {card.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BankDisplay;
