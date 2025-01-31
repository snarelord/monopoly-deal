// src/components/CardDisplay.jsx
import React from "react";
import { actionCards } from "../cardData"; // Import the action cards from cardData

function CardDisplay() {
  return (
    <div>
      <h2>Action Cards</h2>
      <div className="cards">
        {actionCards.map((card) => (
          <div key={card.id} className="card">
            <p>{card.type}</p>
            <p>Value: {card.value}</p>
            <p>Count: {card.count}</p>
            {card.colours && <p>Colours: {card.colours.join(", ")}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardDisplay;
