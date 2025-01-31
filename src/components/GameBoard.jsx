// src/components/GameBoard.jsx
import React from "react";
import PropertyCard from "./PropertyCard";
import ActionCard from "./ActionCard";
import MoneyCard from "./MoneyCard";

const GameBoard = () => {
  return (
    <div className="game-board">
      <h1>Monopoly Game Board</h1>
      <div className="card-sections">
        <PropertyCard />
        <ActionCard />
        <MoneyCard />
      </div>
    </div>
  );
};

export default GameBoard;
