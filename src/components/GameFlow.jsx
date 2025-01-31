// src/components/GameFlow.jsx
import React, { useState } from "react";
import { propertyCards, actionCards } from "../data/cardData";
import Player from "./Player";

const GameFlow = () => {
  const [turn, setTurn] = useState(1); // Track whose turn it is
  const [currentCard, setCurrentCard] = useState(null);

  // Handle drawing a card
  const drawCard = () => {
    const randomCard =
      Math.random() < 0.5
        ? propertyCards[Math.floor(Math.random() * propertyCards.length)]
        : actionCards.rentCards[
            Math.floor(Math.random() * actionCards.rentCards.length)
          ];
    setCurrentCard(randomCard);
  };

  // Handle passing Go
  const passGo = () => {
    console.log("Player passes Go and collects 2 million.");
  };

  return (
    <div className="game-flow">
      <h3>Game Flow</h3>
      <p>Turn: {turn}</p>
      <button onClick={() => setTurn(turn + 1)}>End Turn</button>
      <button onClick={drawCard}>Draw Card</button>
      <p>
        Current Card:{" "}
        {currentCard ? currentCard.name || currentCard.type : "None"}
      </p>

      <Player />
    </div>
  );
};

export default GameFlow;
