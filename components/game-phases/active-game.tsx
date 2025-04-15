"use client";
import type { Card, GameState } from "@/lib/types";
import PlayerArea from "@/components/player-area/player-area";
import CardDeck from "@/components/card-deck/card-deck";
import ActionArea from "@/components/action-area/action-area";
import GameControls from "@/components/game-controls/game-controls";
import GameInfo from "@/components/game-info/game-info";
import ActionModal from "@/components/action-modal/action-modal";
import PropertySelectionModal from "@/components/property-selection-modal/property-selection-modal";
import DiscardModal from "@/components/discard-modal/discard-modal";
import { handleDebtCollector } from "@/lib/action-debt-collector";
import { handleBirthday } from "@/lib/action-birthday";
import { handlePassGo } from "@/lib/action-pass-go";
import { handleRent } from "@/lib/action-rent";
import { handlePropertySelection } from "@/lib/action-property-selection";
import { getRequiredCardsForColour } from "@/lib/game-logic";
import styles from "./active-game.module.css";

interface ActiveGameProps {
  gameState: GameState;
  actionCardInProgress: { card: Card; index: number } | null;
  forcedDealTargetCard: {
    playerIndex: number;
    setIndex: number;
    cardIndex: number;
    card: Card;
  } | null;
  showDiscardModal: boolean;
  showPropertySelectionModal: boolean;
  propertySelectionType: string;
  targetPlayerForPropertySelection: number | null;
  onDrawCards: () => void;
  onPlayCard: (cardIndex: number, targetArea: string, targetPlayer?: number) => void;
  onPlayActionCard: (cardIndex: number) => void;
  onEndTurn: () => { needsDiscard: boolean };
  onDiscard: (cardIndices: number[]) => void;
  calculateBankTotal: (bank: Card[]) => number;
  setActionCardInProgress: (card: { card: Card; index: number } | null) => void;
  setGameState: (state: GameState | ((prevState: GameState) => GameState)) => void;
  openDiscardModal: () => void;
  closeDiscardModal: () => void;
  closePropertySelectionModal: () => void;
  setPropertySelectionType: (type: string) => void;
}

export default function ActiveGame({
  gameState,
  actionCardInProgress,
  forcedDealTargetCard,
  showDiscardModal,
  showPropertySelectionModal,
  propertySelectionType,
  targetPlayerForPropertySelection,
  onDrawCards,
  onPlayCard,
  onPlayActionCard,
  onEndTurn,
  onDiscard,
  calculateBankTotal,
  setActionCardInProgress,
  setGameState,
  openDiscardModal,
  closeDiscardModal,
  closePropertySelectionModal,
  setPropertySelectionType,
}: ActiveGameProps) {
  // Handle completing an action card
  const handleActionCardComplete = (targetPlayerIndex?: number, amount?: number) => {
    if (!gameState || !actionCardInProgress) return;

    const currentPlayerIndex = gameState.currentPlayerIndex;
    const card = actionCardInProgress.card;
    const cardIndex = actionCardInProgress.index;

    const updatedPlayers = [...gameState.players];
    const updatedPlayer = { ...updatedPlayers[currentPlayerIndex] };

    // Remove card from hand
    updatedPlayer.hand = [...updatedPlayer.hand];
    updatedPlayer.hand.splice(cardIndex, 1);

    // Add card to action area
    const updatedActionCards = [...gameState.actionCards, card];

    // Process the action based on the card type
    let message = `Played ${card.name}`;
    let updatedDeck = [...gameState.deck];

    switch (card.actionType) {
      case "debt-collector":
        if (targetPlayerIndex !== undefined) {
          const { updatedPlayers: playersAfterDebt, message: debtMessage } = handleDebtCollector(
            updatedPlayers,
            currentPlayerIndex,
            targetPlayerIndex
          );

          updatedPlayers.splice(0, updatedPlayers.length, ...playersAfterDebt);
          message = debtMessage;
        }
        break;

      case "birthday":
        const { updatedPlayers: playersAfterBirthday, message: birthdayMessage } = handleBirthday(
          updatedPlayers,
          currentPlayerIndex
        );

        updatedPlayers.splice(0, updatedPlayers.length, ...playersAfterBirthday);
        message = birthdayMessage;
        break;

      case "pass-go":
        // Draw 2 more cards
        const { updatedPlayer: playerWithExtraCards, updatedDeck: newDeck } = handlePassGo(
          updatedPlayer,
          gameState.deck
        );

        updatedPlayer.hand = playerWithExtraCards.hand;
        updatedDeck = newDeck;
        message = "Drew 2 more cards";
        break;

      case "rent":
        if (targetPlayerIndex !== undefined) {
          // Calculate rent based on properties of the specified colours
          const rentColours: string[] = [];
          if (card.colour) rentColours.push(card.colour);
          if (card.secondaryColour) rentColours.push(card.secondaryColour);

          const { updatedPlayers: playersAfterRent, message: rentMessage } = handleRent(
            updatedPlayers,
            currentPlayerIndex,
            targetPlayerIndex,
            rentColours
          );

          updatedPlayers.splice(0, updatedPlayers.length, ...playersAfterRent);
          message = rentMessage;
        }
        break;

      case "deal-breaker":
      case "sly-deal":
      case "forced-deal":
        if (targetPlayerIndex !== undefined) {
          // Show property selection modal
          setPropertySelectionType(card.actionType);
          setGameState({
            ...gameState,
            message: `Select a property for ${card.name}`,
          });
          setActionCardInProgress(null);
          return;
        }
        break;
    }

    updatedPlayers[currentPlayerIndex] = updatedPlayer;

    setGameState({
      ...gameState,
      players: updatedPlayers,
      deck: updatedDeck,
      cardsPlayed: gameState.cardsPlayed + 1,
      actionCards: updatedActionCards,
      message,
    });

    setActionCardInProgress(null);
  };

  // Handle property selection for action cards
  const handlePropertySelectionComplete = (setIndex: number, cardIndex: number) => {
    if (!gameState || targetPlayerForPropertySelection === null) return;

    const {
      updatedPlayers,
      message,
      forcedDealTargetCard: updatedForcedDealTargetCard,
    } = handlePropertySelection(
      gameState.players,
      gameState.currentPlayerIndex,
      targetPlayerForPropertySelection,
      setIndex,
      cardIndex,
      propertySelectionType,
      forcedDealTargetCard,
      getRequiredCardsForColour
    );

    // Add the action card to the action area
    const updatedActionCards = [...gameState.actionCards];

    // Make sure actionCardInProgress exists before trying to use it
    if (actionCardInProgress) {
      // Add the card to the action area
      updatedActionCards.push(actionCardInProgress.card);
    }

    setGameState({
      ...gameState,
      players: updatedPlayers,
      cardsPlayed: gameState.cardsPlayed + 1,
      actionCards: updatedActionCards,
      message,
    });

    if (propertySelectionType === "forced-deal" && updatedForcedDealTargetCard) {
      // For forced deal, we need to select our own property next
      setTimeout(() => {
        setPropertySelectionType("forced-deal-own");
      }, 100);
    } else {
      closePropertySelectionModal();
      setActionCardInProgress(null);
    }
  };

  const handleEndTurnClick = () => {
    const { needsDiscard } = onEndTurn();
    if (needsDiscard) {
      openDiscardModal();
    }
  };

  const handleBackFromDiscard = () => {
    closeDiscardModal();
  };

  return (
    <div className={styles.container}>
      <GameInfo
        currentPlayer={gameState.currentPlayerIndex + 1}
        cardsPlayed={gameState.cardsPlayed}
        hasDrawnCards={gameState.hasDrawnCards}
      />

      {gameState.message && <div className={styles.message}>{gameState.message}</div>}

      <div className={styles.gameArea}>
        <CardDeck
          cardsRemaining={gameState.deck.length}
          onDrawCards={onDrawCards}
          hasDrawnCards={gameState.hasDrawnCards}
        />

        <ActionArea actionCards={gameState.actionCards} isCurrentPlayersTurn={true} />
      </div>

      <div className={styles.playerGrid}>
        {gameState.players.map((player, index) => (
          <PlayerArea
            key={player.id}
            player={player}
            isCurrentPlayer={index === gameState.currentPlayerIndex}
            onPlayCard={onPlayCard}
            onPlayActionCard={onPlayActionCard}
            gameState={gameState}
            bankTotal={calculateBankTotal(player.bank)}
          />
        ))}
      </div>

      <GameControls
        cardsPlayed={gameState.cardsPlayed}
        onEndTurn={handleEndTurnClick}
        isCurrentPlayersTurn={true}
        hasDrawnCards={gameState.hasDrawnCards}
      />

      {showDiscardModal && (
        <DiscardModal
          player={gameState.players[gameState.currentPlayerIndex]}
          onDiscard={onDiscard}
          onBack={() => handleBackFromDiscard()}
          cardsPlayed={gameState.cardsPlayed}
        />
      )}

      {actionCardInProgress && (
        <ActionModal
          card={actionCardInProgress.card}
          players={gameState.players}
          currentPlayerIndex={gameState.currentPlayerIndex}
          onComplete={handleActionCardComplete}
          onCancel={() => setActionCardInProgress(null)}
        />
      )}

      {showPropertySelectionModal && targetPlayerForPropertySelection !== null && (
        <PropertySelectionModal
          title={
            propertySelectionType === "deal-breaker"
              ? "Select a complete property set to steal"
              : propertySelectionType === "sly-deal"
              ? "Select a property card to steal"
              : propertySelectionType === "forced-deal-own"
              ? "Select one of your properties to swap"
              : "Select a property card to swap"
          }
          propertySets={
            propertySelectionType === "forced-deal-own"
              ? gameState.players[gameState.currentPlayerIndex].properties
              : gameState.players[targetPlayerForPropertySelection].properties
          }
          onSelect={handlePropertySelectionComplete}
          onCancel={closePropertySelectionModal}
          allowCompleteSet={propertySelectionType === "deal-breaker"}
        />
      )}
    </div>
  );
}
