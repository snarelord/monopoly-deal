import type { Card, Player } from "@/lib/types";
import { handleDealBreaker } from "@/lib/action-deal-breaker";
import { handleSlyDeal } from "@/lib/action-sly-deal";
import { handleForcedDealStep1, handleForcedDealStep2 } from "@/lib/action-forced-deal";

export function handlePropertySelection(
  players: Player[],
  currentPlayerIndex: number,
  targetPlayerIndex: number,
  setIndex: number,
  cardIndex: number,
  propertySelectionType: string,
  forcedDealTargetCard: {
    playerIndex: number;
    setIndex: number;
    cardIndex: number;
    card: Card;
  } | null,
  getRequiredCardsForColour: (colour: string) => number
): { updatedPlayers: Player[]; message: string; forcedDealTargetCard: any } {
  const updatedPlayers = [...players];
  const currentPlayer = { ...updatedPlayers[currentPlayerIndex] };
  const targetPlayer = { ...updatedPlayers[targetPlayerIndex] };

  switch (propertySelectionType) {
    case "deal-breaker":
      return handleDealBreaker(
        updatedPlayers,
        currentPlayer,
        targetPlayer,
        currentPlayerIndex,
        targetPlayerIndex,
        setIndex
      );

    case "sly-deal":
      return handleSlyDeal(
        updatedPlayers,
        currentPlayer,
        targetPlayer,
        currentPlayerIndex,
        targetPlayerIndex,
        setIndex,
        cardIndex,
        getRequiredCardsForColour
      );

    case "forced-deal":
      return handleForcedDealStep1(
        updatedPlayers,
        currentPlayer,
        targetPlayer,
        currentPlayerIndex,
        targetPlayerIndex,
        setIndex,
        cardIndex,
        forcedDealTargetCard
      );

    case "forced-deal-own":
      return handleForcedDealStep2(
        updatedPlayers,
        currentPlayer,
        currentPlayerIndex,
        setIndex,
        cardIndex,
        forcedDealTargetCard,
        getRequiredCardsForColour
      );

    default:
      return {
        updatedPlayers,
        message: "",
        forcedDealTargetCard,
      };
  }
}
