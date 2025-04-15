"use client";

import { useState, useCallback, useEffect } from "react";
import type { Card, GameState } from "@/lib/types";
import {
  initialiseGame,
  drawCards,
  endTurn,
  discardCards,
  isValidCardPlacement,
  getRequiredCardsForColour,
} from "@/lib/game-logic";
import { calculateBankTotal } from "@/lib/utils";

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [actionCardInProgress, setActionCardInProgress] = useState<{
    card: Card;
    index: number;
  } | null>(null);
  const [forcedDealTargetCard, setForcedDealTargetCard] = useState<{
    playerIndex: number;
    setIndex: number;
    cardIndex: number;
    card: Card;
  } | null>(null);

  // Initialize game
  const startGame = useCallback((numPlayers: number) => {
    const { initialisedPlayers, initialisedDeck } = initialiseGame(numPlayers);

    setGameState({
      players: initialisedPlayers,
      deck: initialisedDeck,
      currentPlayerIndex: 0,
      cardsPlayed: 0,
      isGameOver: false,
      winner: null,
      actionInProgress: null,
      hasDrawnCards: false,
      actionCards: [],
      message: "Game started! Draw cards to begin your turn.",
    });
  }, []);

  // Handle drawing cards at the start of a turn
  const handleDrawCards = useCallback(() => {
    if (!gameState || gameState.hasDrawnCards) return;

    const { updatedPlayer, updatedDeck } = drawCards(gameState.players[gameState.currentPlayerIndex], gameState.deck);

    const updatedPlayers = [...gameState.players];
    updatedPlayers[gameState.currentPlayerIndex] = updatedPlayer;

    setGameState({
      ...gameState,
      players: updatedPlayers,
      deck: updatedDeck,
      hasDrawnCards: true,
      message: "Cards drawn. Play up to 3 cards.",
    });
  }, [gameState]);

  // Handle playing a card
  const handlePlayCard = useCallback(
    (cardIndex: number, targetArea: string, targetPlayer?: number) => {
      if (!gameState || gameState.cardsPlayed >= 3 || !gameState.hasDrawnCards) return;

      const player = gameState.players[gameState.currentPlayerIndex];
      const card = player.hand[cardIndex];

      // Validate card placement
      if (!isValidCardPlacement(card, targetArea)) {
        alert("Invalid card placement. Check the rules for where this card can be played.");
        return;
      }

      const updatedPlayers = [...gameState.players];
      const updatedPlayer = { ...updatedPlayers[gameState.currentPlayerIndex] };

      // Remove card from hand
      updatedPlayer.hand = [...updatedPlayer.hand];
      updatedPlayer.hand.splice(cardIndex, 1);

      // Add card to appropriate area
      if (targetArea === "bank") {
        updatedPlayer.bank = [...updatedPlayer.bank, card];
      } else if (targetArea.startsWith("property-")) {
        // Handle property placement logic
        const setIndex = Number.parseInt(targetArea.split("-")[1]);

        // Check if this is an existing property set
        if (setIndex < updatedPlayer.properties.length) {
          // Add to existing property set
          updatedPlayer.properties = [...updatedPlayer.properties];
          const updatedSet = {
            ...updatedPlayer.properties[setIndex],
            cards: [...updatedPlayer.properties[setIndex].cards, card],
          };

          // Check if set is now complete
          updatedSet.isComplete = updatedSet.cards.length >= updatedSet.requiredCards;

          updatedPlayer.properties[setIndex] = updatedSet;
        } else {
          // Create new property set (only for regular properties, not "Any Colour" wildcards)
          const isAnyColourWildcard = card.type === "wildcard" && card.name.toLowerCase().includes("any colour");

          if (!isAnyColourWildcard) {
            updatedPlayer.properties = [
              ...updatedPlayer.properties,
              {
                colour: card.colour || "",
                cards: [card],
                isComplete: false,
                houses: 0,
                hotels: 0,
                requiredCards: getRequiredCardsForColour(card.colour || ""),
              },
            ];
          } else {
            // Any Colour wildcards can't create their own sets
            alert("Any Colour wildcards must be added to an existing property set.");
            return;
          }
        }
      } else if (targetArea === "action") {
        // This is now handled by handlePlayActionCard
        return;
      }

      updatedPlayers[gameState.currentPlayerIndex] = updatedPlayer;

      setGameState({
        ...gameState,
        players: updatedPlayers,
        cardsPlayed: gameState.cardsPlayed + 1,
        message: `Card played (${gameState.cardsPlayed + 1}/3)`,
      });
    },
    [gameState]
  );

  // Handle playing an action card
  const handlePlayActionCard = useCallback(
    (cardIndex: number) => {
      if (!gameState || gameState.cardsPlayed >= 3 || !gameState.hasDrawnCards) return;

      const player = gameState.players[gameState.currentPlayerIndex];
      const card = player.hand[cardIndex];

      if (card.type !== "action") {
        alert("This is not an action card.");
        return;
      }

      // Set the action card in progress
      setActionCardInProgress({
        card,
        index: cardIndex,
      });
    },
    [gameState]
  );

  // Handle ending a turn
  const handleEndTurn = useCallback(() => {
    if (!gameState) return { needsDiscard: false };

    // Check if player has more than 7 cards
    if (gameState.players[gameState.currentPlayerIndex].hand.length > 7) {
      return { needsDiscard: true };
    }

    const { nextPlayerIndex, updatedPlayers } = endTurn(gameState.players, gameState.currentPlayerIndex);

    setGameState({
      ...gameState,
      players: updatedPlayers,
      currentPlayerIndex: nextPlayerIndex,
      cardsPlayed: 0,
      hasDrawnCards: false,
      message: `Player ${nextPlayerIndex + 1}'s turn. Draw cards to begin.`,
    });

    return { needsDiscard: false };
  }, [gameState]);

  // Handle discarding cards
  const handleDiscard = useCallback(
    (cardIndices: number[]) => {
      if (!gameState) return;

      const { updatedPlayer, updatedDeck } = discardCards(
        gameState.players[gameState.currentPlayerIndex],
        cardIndices,
        gameState.deck
      );

      const updatedPlayers = [...gameState.players];
      updatedPlayers[gameState.currentPlayerIndex] = updatedPlayer;

      setGameState({
        ...gameState,
        players: updatedPlayers,
        deck: updatedDeck,
        message: `Discarded ${cardIndices.length} cards`,
      });

      // Complete the end turn process
      const { nextPlayerIndex, updatedPlayers: finalPlayers } = endTurn(updatedPlayers, gameState.currentPlayerIndex);

      setGameState((prevState) => {
        if (!prevState) return null;
        return {
          ...prevState,
          players: finalPlayers,
          currentPlayerIndex: nextPlayerIndex,
          cardsPlayed: 0,
          hasDrawnCards: false,
          message: `Player ${nextPlayerIndex + 1}'s turn. Draw cards to begin.`,
        };
      });
    },
    [gameState]
  );

  // Check for winner
  useEffect(() => {
    if (!gameState) return;

    const checkWinner = () => {
      for (const player of gameState.players) {
        // Check if player has 3 complete property sets
        const completeSets = player.properties.filter((set) => set.isComplete).length;
        if (completeSets >= 3) {
          setGameState({
            ...gameState,
            isGameOver: true,
            winner: player,
            message: `Player ${player.id + 1} wins with 3 complete property sets!`,
          });
          return;
        }
      }
    };

    checkWinner();
  }, [gameState]);

  return {
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
  };
}
