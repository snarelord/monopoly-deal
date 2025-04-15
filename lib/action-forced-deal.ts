import type { Player } from "@/lib/types";

export function handleForcedDealStep1(
  updatedPlayers: Player[],
  currentPlayer: Player,
  targetPlayer: Player,
  currentPlayerIndex: number,
  targetPlayerIndex: number,
  setIndex: number,
  cardIndex: number,
  forcedDealTargetCard: any
): { updatedPlayers: Player[]; message: string; forcedDealTargetCard: any } {
  let message = "";
  let updatedForcedDealTargetCard = forcedDealTargetCard;

  // First step: Select the target player's property
  if (setIndex < targetPlayer.properties.length && cardIndex < targetPlayer.properties[setIndex].cards.length) {
    const targetCard = targetPlayer.properties[setIndex].cards[cardIndex];

    // Store the selected card info
    updatedForcedDealTargetCard = {
      playerIndex: targetPlayerIndex,
      setIndex,
      cardIndex,
      card: targetCard,
    };

    message = `Selected ${targetCard.name}. Now select one of your properties to swap.`;
  }

  // Update players
  updatedPlayers[currentPlayerIndex] = currentPlayer;
  updatedPlayers[targetPlayerIndex] = targetPlayer;

  return { updatedPlayers, message, forcedDealTargetCard: updatedForcedDealTargetCard };
}

export function handleForcedDealStep2(
  updatedPlayers: Player[],
  currentPlayer: Player,
  currentPlayerIndex: number,
  setIndex: number,
  cardIndex: number,
  forcedDealTargetCard: any,
  getRequiredCardsForColour: (colour: string) => number
): { updatedPlayers: Player[]; message: string; forcedDealTargetCard: null } {
  let message = "";

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
    const ownCardColour = ownCard.colour || ownCard.colour || "";
    const targetSetColour = updatedTargetSet.colour || updatedTargetSet.colour || "";

    if (updatedTargetSet.cards.length === 0) {
      // If set is empty, replace it with a new set
      updatedTargetProperties[targetSetIndex] = {
        colour: ownCardColour,
        cards: [ownCard],
        isComplete: false,
        houses: 0,
        hotels: 0,
        requiredCards: getRequiredCardsForColour(ownCardColour),
      };
    } else {
      // Add to existing set if colours match
      if (ownCardColour === targetSetColour) {
        updatedTargetSet.cards.push(ownCard);
        updatedTargetSet.isComplete = updatedTargetSet.cards.length >= updatedTargetSet.requiredCards;
        updatedTargetProperties[targetSetIndex] = updatedTargetSet;
      } else {
        // Create a new set if colours don't match
        updatedTargetProperties.push({
          colour: ownCardColour,
          cards: [ownCard],
          isComplete: false,
          houses: 0,
          hotels: 0,
          requiredCards: getRequiredCardsForColour(ownCardColour),
        });
      }
    }

    // Add target player's card to current player's set
    const targetCardColour = targetCard.colour || targetCard.colour || "";
    const currentSetColour = updatedCurrentSet.colour || updatedCurrentSet.colour || "";

    if (updatedCurrentSet.cards.length === 0) {
      // If set is empty, replace it with a new set
      updatedCurrentProperties[setIndex] = {
        colour: targetCardColour,
        cards: [targetCard],
        isComplete: false,
        houses: 0,
        hotels: 0,
        requiredCards: getRequiredCardsForColour(targetCardColour),
      };
    } else {
      // Add to existing set if colours match
      if (targetCardColour === currentSetColour) {
        updatedCurrentSet.cards.push(targetCard);
        updatedCurrentSet.isComplete = updatedCurrentSet.cards.length >= updatedCurrentSet.requiredCards;
        updatedCurrentProperties[setIndex] = updatedCurrentSet;
      } else {
        // Create a new set if colours don't match
        updatedCurrentProperties.push({
          colour: targetCardColour,
          cards: [targetCard],
          isComplete: false,
          houses: 0,
          hotels: 0,
          requiredCards: getRequiredCardsForColour(targetCardColour),
        });
      }
    }

    // Update the properties arrays
    targetPlayer.properties = updatedTargetProperties;
    currentPlayer.properties = updatedCurrentProperties;

    // Update players in the state
    updatedPlayers[targetPlayerIndex] = targetPlayer;
    updatedPlayers[currentPlayerIndex] = currentPlayer;

    message = `Swapped ${ownCard.name} for ${targetCard.name} with Player ${targetPlayerIndex + 1}`;
  }

  return { updatedPlayers, message, forcedDealTargetCard: null };
}
