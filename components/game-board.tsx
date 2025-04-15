"use client";

import { useGameState } from "@/hooks/use-game-state";
import { useGameModals } from "@/hooks/use-game-modals";
import GameSetup from "@/components/game-phases/game-setup";
import GameOver from "@/components/game-phases/game-over";
import ActiveGame from "@/components/game-phases/active-game";

export default function GameBoard() {
  const {
    gameState,
    actionCardInProgress,
    forcedDealTargetCard,
    startGame,
    handleDrawCards,
    handlePlayCard,
    handlePlayActionCard,
    handleEndTurn,
    handleDiscard,
    calculateBankTotal,
    setActionCardInProgress,
    setForcedDealTargetCard,
    setGameState,
  } = useGameState();

  const {
    showDiscardModal,
    showPropertySelectionModal,
    propertySelectionType,
    targetPlayerForPropertySelection,
    openDiscardModal,
    closeDiscardModal,
    openPropertySelectionModal,
    closePropertySelectionModal,
    setPropertySelectionType,
  } = useGameModals();

  if (!gameState) {
    return <GameSetup onStartGame={startGame} />;
  }

  if (gameState.isGameOver && gameState.winner) {
    return <GameOver winner={gameState.winner} onNewGame={() => startGame(gameState.players.length)} />;
  }

  return (
    <ActiveGame
      gameState={gameState}
      actionCardInProgress={actionCardInProgress}
      forcedDealTargetCard={forcedDealTargetCard}
      showDiscardModal={showDiscardModal}
      showPropertySelectionModal={showPropertySelectionModal}
      propertySelectionType={propertySelectionType}
      targetPlayerForPropertySelection={targetPlayerForPropertySelection}
      onDrawCards={handleDrawCards}
      onPlayCard={handlePlayCard}
      onPlayActionCard={handlePlayActionCard}
      onEndTurn={handleEndTurn}
      onDiscard={handleDiscard}
      calculateBankTotal={calculateBankTotal}
      setActionCardInProgress={setActionCardInProgress}
      setGameState={setGameState}
      openDiscardModal={openDiscardModal}
      closeDiscardModal={closeDiscardModal}
      closePropertySelectionModal={closePropertySelectionModal}
      setPropertySelectionType={setPropertySelectionType}
    />
  );
}
