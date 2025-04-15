import type { Player } from "@/lib/types";

export function handleSlyDeal(
  updatedPlayers: Player[],
  currentPlayer: Player,
  targetPlayer: Player,
  currentPlayerIndex: number,
  targetPlayerIndex: number,
  setIndex: number,
  cardIndex: number,
  getRequiredCardsForColour: (colour: string) => number
): { updatedPlayers: Player[]; message: string; forcedDealTargetCard: null } {
  let message = "";

  // Steal a single property card
  if (setIndex < targetPlayer.properties.length && cardIndex < targetPlayer.properties[setIndex].cards.length) {
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
      updatedSet.isComplete = updatedSet.cards.length >= updatedSet.requiredCards;
      updatedTargetProperties[setIndex] = updatedSet;
    }

    targetPlayer.properties = updatedTargetProperties;

    // Add the card to current player's properties
    const cardColour = stolenCard.colour || stolenCard.colour || "";
    const existingSetIndex = currentPlayer.properties.findIndex(
      (set) => (set.colour && set.colour === cardColour) || (set.colour && set.colour === cardColour)
    );

    if (existingSetIndex >= 0) {
      // Add to existing set
      const updatedCurrentProperties = [...currentPlayer.properties];
      const updatedCurrentSet = {
        ...updatedCurrentProperties[existingSetIndex],
      };
      updatedCurrentSet.cards = [...updatedCurrentSet.cards, stolenCard];
      updatedCurrentSet.isComplete = updatedCurrentSet.cards.length >= updatedCurrentSet.requiredCards;
      updatedCurrentProperties[existingSetIndex] = updatedCurrentSet;
      currentPlayer.properties = updatedCurrentProperties;
    } else {
      // Create new set
      currentPlayer.properties = [
        ...currentPlayer.properties,
        {
          colour: cardColour,
          cards: [stolenCard],
          isComplete: false,
          houses: 0,
          hotels: 0,
          requiredCards: getRequiredCardsForColour(cardColour),
        },
      ];
    }

    message = `Stole ${stolenCard.name} from Player ${targetPlayerIndex + 1}`;
  }

  // Update players
  updatedPlayers[currentPlayerIndex] = currentPlayer;
  updatedPlayers[targetPlayerIndex] = targetPlayer;

  return { updatedPlayers, message, forcedDealTargetCard: null };
}
