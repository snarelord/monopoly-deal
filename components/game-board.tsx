"use client";

import { useState, useEffect } from "react";
import PlayerArea from "@/components/player-area/player-area";
import CardDeck from "@/components/card-deck/card-deck";
import ActionArea from "@/components/action-area/action-area";
import ActionModal from "@/components/action-modal/action-modal";
import PropertySelectionModal from "@/components/property-selection-modal/property-selection-modal";

import type { Card, GameState } from "@/lib/types";
import {
  initialiseGame,
  drawCards,
  endTurn,
  isValidCardPlacement,
  discardCards,
  getRequiredCardsForColour,
  calculateRentAmount,
} from "@/lib/game-logic";
import GameControls from "@/components/game-controls/game-controls";
import GameInfo from "@/components/game-info/game-info";
import DiscardModal from "@/components/discard-modal/discard-modal";

export default function GameBoard() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [actionCardInProgress, setActionCardInProgress] = useState<{
    card: Card;
    index: number;
  } | null>(null);
  const [showPropertySelectionModal, setShowPropertySelectionModal] =
    useState(false);
  const [propertySelectionType, setPropertySelectionType] =
    useState<string>("");
  const [
    targetPlayerForPropertySelection,
    setTargetPlayerForPropertySelection,
  ] = useState<number | null>(null);

  // Add state for forced deal and sly deal
  const [forcedDealTargetCard, setForcedDealTargetCard] = useState<{
    playerIndex: number;
    setIndex: number;
    cardIndex: number;
    card: Card;
  } | null>(null);

  // Initialise game
  const startGame = (numPlayers: number) => {
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
  };

  // Handle drawing cards at the start of a turn
  const handleDrawCards = () => {
    if (!gameState || gameState.hasDrawnCards) return;

    const { updatedPlayer, updatedDeck } = drawCards(
      gameState.players[gameState.currentPlayerIndex],
      gameState.deck
    );

    const updatedPlayers = [...gameState.players];
    updatedPlayers[gameState.currentPlayerIndex] = updatedPlayer;

    setGameState({
      ...gameState,
      players: updatedPlayers,
      deck: updatedDeck,
      hasDrawnCards: true,
      message: "Cards drawn. Play up to 3 cards.",
    });
  };

  // Handle playing a card
  const handlePlayCard = (
    cardIndex: number,
    targetArea: string,
    targetPlayer?: number
  ) => {
    if (!gameState || gameState.cardsPlayed >= 3 || !gameState.hasDrawnCards)
      return;

    const player = gameState.players[gameState.currentPlayerIndex];
    const card = player.hand[cardIndex];

    // Validate card placement
    if (!isValidCardPlacement(card, targetArea)) {
      alert(
        "Invalid card placement. Check the rules for where this card can be played."
      );
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
        updatedSet.isComplete =
          updatedSet.cards.length >= updatedSet.requiredCards;

        updatedPlayer.properties[setIndex] = updatedSet;
      } else {
        // Create new property set (only for regular properties, not "Any Colour" wildcards)
        const isAnyColourWildcard =
          card.type === "wildcard" &&
          card.name.toLowerCase().includes("any colour");

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
          alert(
            "Any Colour wildcards must be added to an existing property set."
          );
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
  };

  // Handle playing an action card
  const handlePlayActionCard = (cardIndex: number) => {
    if (!gameState || gameState.cardsPlayed >= 3 || !gameState.hasDrawnCards)
      return;

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
  };

  // Handle completing an action card
  const handleActionCardComplete = (
    targetPlayerIndex?: number,
    amount?: number
  ) => {
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

    switch (card.actionType) {
      case "debt-collector":
        if (targetPlayerIndex !== undefined) {
          const targetPlayer = { ...updatedPlayers[targetPlayerIndex] };
          const amountToPay = Math.min(
            5,
            calculateBankTotal(targetPlayer.bank)
          );

          if (amountToPay > 0) {
            // Find cards to pay with (simple implementation - just take the first cards that add up to the amount)
            const cardsToPay: Card[] = [];
            let totalPaid = 0;

            // Sort bank cards by value (ascending) to optimize payment
            const sortedBank = [...targetPlayer.bank].sort(
              (a, b) => a.value - b.value
            );

            for (const bankCard of sortedBank) {
              if (totalPaid < amountToPay) {
                cardsToPay.push(bankCard);
                totalPaid += bankCard.value;

                if (totalPaid >= amountToPay) {
                  break;
                }
              }
            }

            // Remove cards from target player's bank
            targetPlayer.bank = targetPlayer.bank.filter(
              (card) => !cardsToPay.some((payCard) => payCard.id === card.id)
            );

            // Add cards to current player's bank
            updatedPlayer.bank = [...updatedPlayer.bank, ...cardsToPay];

            updatedPlayers[targetPlayerIndex] = targetPlayer;
            message = `Collected $${totalPaid}M from Player ${
              targetPlayerIndex + 1
            }`;
          } else {
            message = `Player ${targetPlayerIndex + 1} has no money to pay`;
          }
        }
        break;

      case "birthday":
        let totalCollected = 0;

        // Collect 2M from each player
        updatedPlayers.forEach((player, index) => {
          if (index !== currentPlayerIndex) {
            const playerToUpdate = { ...player };
            const amountToPay = Math.min(
              2,
              calculateBankTotal(playerToUpdate.bank)
            );

            if (amountToPay > 0) {
              // Find cards to pay with
              const cardsToPay: Card[] = [];
              let totalPaid = 0;

              // Sort bank cards by value (ascending) to optimize payment
              const sortedBank = [...playerToUpdate.bank].sort(
                (a, b) => a.value - b.value
              );

              for (const bankCard of sortedBank) {
                if (totalPaid < amountToPay) {
                  cardsToPay.push(bankCard);
                  totalPaid += bankCard.value;

                  if (totalPaid >= amountToPay) {
                    break;
                  }
                }
              }

              // Remove cards from player's bank
              playerToUpdate.bank = playerToUpdate.bank.filter(
                (card) => !cardsToPay.some((payCard) => payCard.id === card.id)
              );

              // Add cards to current player's bank
              updatedPlayer.bank = [...updatedPlayer.bank, ...cardsToPay];

              updatedPlayers[index] = playerToUpdate;
              totalCollected += totalPaid;
            }
          }
        });

        message = `Collected $${totalCollected}M for your birthday`;
        break;

      case "pass-go":
        // Draw 2 more cards
        const { updatedPlayer: playerWithExtraCards, updatedDeck } = drawCards(
          updatedPlayer,
          gameState.deck,
          2
        );

        updatedPlayer.hand = playerWithExtraCards.hand;

        message = "Drew 2 more cards";

        setGameState({
          ...gameState,
          players: updatedPlayers,
          deck: updatedDeck,
          cardsPlayed: gameState.cardsPlayed + 1,
          actionCards: updatedActionCards,
          message,
        });
        break;

      case "rent":
        if (targetPlayerIndex !== undefined) {
          // Calculate rent based on properties of the specified colours
          const rentColours: string[] = [];
          if (card.colour) rentColours.push(card.colour);
          if (card.secondaryColour) rentColours.push(card.secondaryColour);

          // Find property sets of the specified colours
          const relevantSets = updatedPlayer.properties.filter((set) =>
            rentColours.includes(set.colour)
          );

          // Calculate rent amount
          let rentAmount = 0;
          relevantSets.forEach((set) => {
            rentAmount += calculateRentAmount(set);
          });

          if (rentAmount > 0) {
            const targetPlayer = { ...updatedPlayers[targetPlayerIndex] };
            const amountToPay = Math.min(
              rentAmount,
              calculateBankTotal(targetPlayer.bank)
            );

            if (amountToPay > 0) {
              // Find cards to pay with
              const cardsToPay: Card[] = [];
              let totalPaid = 0;

              // Sort bank cards by value (ascending) to optimize payment
              const sortedBank = [...targetPlayer.bank].sort(
                (a, b) => a.value - b.value
              );

              for (const bankCard of sortedBank) {
                if (totalPaid < amountToPay) {
                  cardsToPay.push(bankCard);
                  totalPaid += bankCard.value;

                  if (totalPaid >= amountToPay) {
                    break;
                  }
                }
              }

              // Remove cards from target player's bank
              targetPlayer.bank = targetPlayer.bank.filter(
                (card) => !cardsToPay.some((payCard) => payCard.id === card.id)
              );

              // Add cards to current player's bank
              updatedPlayer.bank = [...updatedPlayer.bank, ...cardsToPay];

              updatedPlayers[targetPlayerIndex] = targetPlayer;
              message = `Collected $${totalPaid}M rent from Player ${
                targetPlayerIndex + 1
              }`;
            } else {
              message = `Player ${
                targetPlayerIndex + 1
              } has no money to pay rent`;
            }
          } else {
            message = `No properties of the specified colours to collect rent for`;
          }
        }
        break;

      case "deal-breaker":
        if (targetPlayerIndex !== undefined) {
          // Show property selection modal for complete sets
          setPropertySelectionType("deal-breaker");
          setTargetPlayerForPropertySelection(targetPlayerIndex);
          setShowPropertySelectionModal(true);

          // The rest of the logic will be handled when the property is selected
          setActionCardInProgress(null);
          return;
        }
        break;

      case "sly-deal":
        if (targetPlayerIndex !== undefined) {
          // Show property selection modal for incomplete sets
          setPropertySelectionType("sly-deal");
          setTargetPlayerForPropertySelection(targetPlayerIndex);
          setShowPropertySelectionModal(true);

          // The rest of the logic will be handled when the property is selected
          setActionCardInProgress(null);
          return;
        }
        break;

      case "forced-deal":
        if (targetPlayerIndex !== undefined) {
          // Show property selection modal for incomplete sets
          setPropertySelectionType("forced-deal");
          setTargetPlayerForPropertySelection(targetPlayerIndex);
          setShowPropertySelectionModal(true);

          // The rest of the logic will be handled when the property is selected
          setActionCardInProgress(null);
          return;
        }
        break;
    }

    updatedPlayers[currentPlayerIndex] = updatedPlayer;

    setGameState({
      ...gameState,
      players: updatedPlayers,
      cardsPlayed: gameState.cardsPlayed + 1,
      actionCards: updatedActionCards,
      message,
    });

    setActionCardInProgress(null);
  };

  // Handle property selection for action cards
  const handlePropertySelection = (setIndex: number, cardIndex: number) => {
    if (!gameState || !targetPlayerForPropertySelection) return;

    const currentPlayerIndex = gameState.currentPlayerIndex;
    const targetPlayerIndex = targetPlayerForPropertySelection;

    const updatedPlayers = [...gameState.players];
    const currentPlayer = { ...updatedPlayers[currentPlayerIndex] };
    const targetPlayer = { ...updatedPlayers[targetPlayerIndex] };

    let message = "";

    switch (propertySelectionType) {
      case "deal-breaker":
        // Steal a complete property set
        if (setIndex < targetPlayer.properties.length) {
          const stolenSet = { ...targetPlayer.properties[setIndex] };

          // Remove the set from target player
          targetPlayer.properties = targetPlayer.properties.filter(
            (_, i) => i !== setIndex
          );

          // Add the set to current player
          currentPlayer.properties = [...currentPlayer.properties, stolenSet];

          message = `Stole ${stolenSet.colour} property set from Player ${
            targetPlayerIndex + 1
          }`;
        }
        break;

      case "sly-deal":
        // Steal a single property card
        if (
          setIndex < targetPlayer.properties.length &&
          cardIndex < targetPlayer.properties[setIndex].cards.length
        ) {
          const stolenCard = targetPlayer.properties[setIndex].cards[cardIndex];

          // Remove the card from target player's set
          const updatedTargetProperties = [...targetPlayer.properties];
          const updatedSet = { ...updatedTargetProperties[setIndex] };
          updatedSet.cards = updatedSet.cards.filter((_, i) => i !== cardIndex);

          // If the set is now empty, remove it
          if (updatedSet.cards.length === 0) {
            updatedTargetProperties.splice(setIndex, 1);
          } else {
            // Update the set's completion status
            updatedSet.isComplete =
              updatedSet.cards.length >= updatedSet.requiredCards;
            updatedTargetProperties[setIndex] = updatedSet;
          }

          targetPlayer.properties = updatedTargetProperties;

          // Add the card to current player's properties
          const existingSetIndex = currentPlayer.properties.findIndex(
            (set) => set.colour === stolenCard.colour
          );

          if (existingSetIndex >= 0) {
            // Add to existing set
            const updatedCurrentProperties = [...currentPlayer.properties];
            const updatedCurrentSet = {
              ...updatedCurrentProperties[existingSetIndex],
            };
            updatedCurrentSet.cards = [...updatedCurrentSet.cards, stolenCard];
            updatedCurrentSet.isComplete =
              updatedCurrentSet.cards.length >= updatedCurrentSet.requiredCards;
            updatedCurrentProperties[existingSetIndex] = updatedCurrentSet;
            currentPlayer.properties = updatedCurrentProperties;
          } else {
            // Create new set
            currentPlayer.properties = [
              ...currentPlayer.properties,
              {
                colour: stolenCard.colour || "",
                cards: [stolenCard],
                isComplete: false,
                houses: 0,
                hotels: 0,
                requiredCards: getRequiredCardsForColour(
                  stolenCard.colour || ""
                ),
              },
            ];
          }

          message = `Stole ${stolenCard.name} from Player ${
            targetPlayerIndex + 1
          }`;
        }
        break;

      case "forced-deal":
        // First step: Select the target player's property
        if (
          setIndex < targetPlayer.properties.length &&
          cardIndex < targetPlayer.properties[setIndex].cards.length
        ) {
          const targetCard = targetPlayer.properties[setIndex].cards[cardIndex];

          // Store the selected card info
          setForcedDealTargetCard({
            playerIndex: targetPlayerIndex,
            setIndex,
            cardIndex,
            card: targetCard,
          });

          // Show a message to select your own property
          setGameState({
            ...gameState,
            message: `Selected ${targetCard.name}. Now select one of your properties to swap.`,
          });

          // Close the current modal
          setShowPropertySelectionModal(false);

          // Open a new modal to select your own property
          setTimeout(() => {
            setPropertySelectionType("forced-deal-own");
            setShowPropertySelectionModal(true);
          }, 100);

          return; // Exit the function early
        }
        break;

      case "forced-deal-own":
        // Second step: Select your own property to swap
        if (
          forcedDealTargetCard !== null &&
          setIndex < currentPlayer.properties.length &&
          cardIndex < currentPlayer.properties[setIndex].cards.length
        ) {
          const ownCard = currentPlayer.properties[setIndex].cards[cardIndex];
          const targetPlayerIndex = forcedDealTargetCard.playerIndex;
          const targetPlayer = { ...updatedPlayers[targetPlayerIndex] };

          // Remove the card from target player's set
          const updatedTargetProperties = [...targetPlayer.properties];
          const targetSetIndex = forcedDealTargetCard.setIndex;
          const targetCardIndex = forcedDealTargetCard.cardIndex;
          const updatedTargetSet = {
            ...updatedTargetProperties[targetSetIndex],
          };
          updatedTargetSet.cards = [...updatedTargetSet.cards];
          const targetCard = updatedTargetSet.cards[targetCardIndex];
          updatedTargetSet.cards.splice(targetCardIndex, 1);

          // Remove the card from current player's set
          const updatedCurrentProperties = [...currentPlayer.properties];
          const updatedCurrentSet = { ...updatedCurrentProperties[setIndex] };
          updatedCurrentSet.cards = [...updatedCurrentSet.cards];
          updatedCurrentSet.cards.splice(cardIndex, 1);

          // Add current player's card to target player's set
          if (updatedTargetSet.cards.length === 0) {
            // If set is empty, replace it with a new set
            updatedTargetProperties[targetSetIndex] = {
              colour: ownCard.colour || "",
              cards: [ownCard],
              isComplete: false,
              houses: 0,
              hotels: 0,
              requiredCards: getRequiredCardsForColour(ownCard.colour || ""),
            };
          } else {
            // Add to existing set if colours match
            if (ownCard.colour === updatedTargetSet.colour) {
              updatedTargetSet.cards.push(ownCard);
              updatedTargetSet.isComplete =
                updatedTargetSet.cards.length >= updatedTargetSet.requiredCards;
              updatedTargetProperties[targetSetIndex] = updatedTargetSet;
            } else {
              // Create a new set if colours don't match
              updatedTargetProperties.push({
                colour: ownCard.colour || "",
                cards: [ownCard],
                isComplete: false,
                houses: 0,
                hotels: 0,
                requiredCards: getRequiredCardsForColour(ownCard.colour || ""),
              });
            }
          }

          // Add target player's card to current player's set
          if (updatedCurrentSet.cards.length === 0) {
            // If set is empty, replace it with a new set
            updatedCurrentProperties[setIndex] = {
              colour: targetCard.colour || "",
              cards: [targetCard],
              isComplete: false,
              houses: 0,
              hotels: 0,
              requiredCards: getRequiredCardsForColour(targetCard.colour || ""),
            };
          } else {
            // Add to existing set if colours match
            if (targetCard.colour === updatedCurrentSet.colour) {
              updatedCurrentSet.cards.push(targetCard);
              updatedCurrentSet.isComplete =
                updatedCurrentSet.cards.length >=
                updatedCurrentSet.requiredCards;
              updatedCurrentProperties[setIndex] = updatedCurrentSet;
            } else {
              // Create a new set if colours don't match
              updatedCurrentProperties.push({
                colour: targetCard.colour || "",
                cards: [targetCard],
                isComplete: false,
                houses: 0,
                hotels: 0,
                requiredCards: getRequiredCardsForColour(
                  targetCard.colour || ""
                ),
              });
            }
          }

          // Update the properties arrays
          targetPlayer.properties = updatedTargetProperties;
          currentPlayer.properties = updatedCurrentProperties;

          // Update players in the state
          updatedPlayers[targetPlayerIndex] = targetPlayer;
          updatedPlayers[currentPlayerIndex] = currentPlayer;

          message = `Swapped ${ownCard.name} for ${
            targetCard.name
          } with Player ${targetPlayerIndex + 1}`;

          // Reset the forced deal state
          setForcedDealTargetCard(null);
        }
        break;
    }

    // Update players
    updatedPlayers[currentPlayerIndex] = currentPlayer;
    updatedPlayers[targetPlayerIndex] = targetPlayer;

    // Add the action card to the action area
    const updatedActionCards = [...gameState.actionCards];

    // Make sure actionCardInProgress exists before trying to use it
    if (actionCardInProgress) {
      // Add the card to the action area
      updatedActionCards.push(actionCardInProgress.card);

      // Remove the card from the player's hand
      const updatedHand = [...currentPlayer.hand];
      updatedHand.splice(actionCardInProgress.index, 1);
      currentPlayer.hand = updatedHand;

      // Update the player in the players array
      updatedPlayers[currentPlayerIndex] = currentPlayer;

      console.log(
        `Removed ${actionCardInProgress.card.name} from player ${
          currentPlayerIndex + 1
        }'s hand`
      );
      console.log(`Added ${actionCardInProgress.card.name} to action area`);
    }

    setGameState({
      ...gameState,
      players: updatedPlayers,
      cardsPlayed: gameState.cardsPlayed + 1,
      actionCards: updatedActionCards,
      message,
    });

    setShowPropertySelectionModal(false);
    setTargetPlayerForPropertySelection(null);
    setPropertySelectionType("");
    setActionCardInProgress(null);
  };

  // Handle ending a turn
  const handleEndTurn = () => {
    if (!gameState) return;

    // Check if player has more than 7 cards
    if (gameState.players[gameState.currentPlayerIndex].hand.length > 7) {
      setShowDiscardModal(true);
      return;
    }

    completeEndTurn();
  };

  // Complete the end turn process after discarding if necessary
  const completeEndTurn = () => {
    if (!gameState) return;

    const { nextPlayerIndex, updatedPlayers } = endTurn(
      gameState.players,
      gameState.currentPlayerIndex
    );

    setGameState({
      ...gameState,
      players: updatedPlayers,
      currentPlayerIndex: nextPlayerIndex,
      cardsPlayed: 0,
      hasDrawnCards: false,
      message: `Player ${nextPlayerIndex + 1}'s turn. Draw cards to begin.`,
    });
  };

  // Handle discarding cards
  const handleDiscard = (cardIndices: number[]) => {
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

    setShowDiscardModal(false);
    completeEndTurn();
  };

  // Calculate total money in bank
  const calculateBankTotal = (bank: Card[]): number => {
    return bank.reduce((total, card) => total + card.value, 0);
  };

  // Check for winner
  useEffect(() => {
    if (!gameState) return;

    const checkWinner = () => {
      for (const player of gameState.players) {
        // Check if player has 3 complete property sets
        const completeSets = player.properties.filter(
          (set) => set.isComplete
        ).length;
        if (completeSets >= 3) {
          setGameState({
            ...gameState,
            isGameOver: true,
            winner: player,
            message: `Player ${
              player.id + 1
            } wins with 3 complete property sets!`,
          });
          return;
        }
      }
    };

    checkWinner();
  }, [gameState]);

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Start New Game</h2>
        <div className="flex gap-4">
          <button
            onClick={() => startGame(2)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            2 Players
          </button>
          <button
            onClick={() => startGame(3)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            3 Players
          </button>
          <button
            onClick={() => startGame(4)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            4 Players
          </button>
        </div>
      </div>
    );
  }

  if (gameState.isGameOver && gameState.winner) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
        <p className="text-xl mb-4">Player {gameState.winner.id + 1} wins!</p>
        <button
          onClick={() => startGame(gameState.players.length)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          New Game
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl">
      <GameInfo
        currentPlayer={gameState.currentPlayerIndex + 1}
        cardsPlayed={gameState.cardsPlayed}
        hasDrawnCards={gameState.hasDrawnCards}
      />

      {gameState.message && (
        <div className="bg-blue-100 p-3 rounded-lg mb-4 text-center">
          {gameState.message}
        </div>
      )}

      <div className="flex justify-center items-center gap-6 mb-6">
        <CardDeck
          cardsRemaining={gameState.deck.length}
          onDrawCards={handleDrawCards}
          hasDrawnCards={gameState.hasDrawnCards}
        />

        <ActionArea
          actionCards={gameState.actionCards}
          isCurrentPlayersTurn={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        {gameState.players.map((player, index) => (
          <PlayerArea
            key={player.id}
            player={player}
            isCurrentPlayer={index === gameState.currentPlayerIndex}
            onPlayCard={handlePlayCard}
            onPlayActionCard={handlePlayActionCard}
            gameState={gameState}
            bankTotal={calculateBankTotal(player.bank)}
          />
        ))}
      </div>

      <GameControls
        cardsPlayed={gameState.cardsPlayed}
        onEndTurn={handleEndTurn}
        isCurrentPlayersTurn={true}
        hasDrawnCards={gameState.hasDrawnCards}
      />

      {showDiscardModal && (
        <DiscardModal
          player={gameState.players[gameState.currentPlayerIndex]}
          onDiscard={handleDiscard}
          onBack={() => setShowDiscardModal(false)}
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

      {showPropertySelectionModal &&
        targetPlayerForPropertySelection !== null && (
          <PropertySelectionModal
            title={
              propertySelectionType === "deal-breaker"
                ? "Select a complete property set to steal"
                : propertySelectionType === "sly-deal"
                ? "Select a property card to steal"
                : "Select a property card to swap"
            }
            propertySets={
              gameState.players[targetPlayerForPropertySelection].properties
            }
            onSelect={handlePropertySelection}
            onCancel={() => {
              setShowPropertySelectionModal(false);
              setTargetPlayerForPropertySelection(null);
              setPropertySelectionType("");
              setActionCardInProgress(null);
            }}
            allowCompleteSet={propertySelectionType === "deal-breaker"}
          />
        )}
    </div>
  );
}
