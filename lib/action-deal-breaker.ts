import type { Player } from "@/lib/types";

export function handleDealBreaker(
  updatedPlayers: Player[],
  currentPlayer: Player,
  targetPlayer: Player,
  currentPlayerIndex: number,
  targetPlayerIndex: number,
  setIndex: number
): { updatedPlayers: Player[]; message: string; forcedDealTargetCard: null } {
  let message = "";

  // Steal a complete property set
  if (setIndex < targetPlayer.properties.length) {
    const stolenSet = { ...targetPlayer.properties[setIndex] };

    // Remove the set from target player
    targetPlayer.properties = targetPlayer.properties.filter((_, i) => i !== setIndex);

    // Add the set to current player
    currentPlayer.properties = [...currentPlayer.properties, stolenSet];

    message = `Stole ${stolenSet.colour || stolenSet.colour} property set from Player ${targetPlayerIndex + 1}`;
  }

  // Update players
  updatedPlayers[currentPlayerIndex] = currentPlayer;
  updatedPlayers[targetPlayerIndex] = targetPlayer;

  return { updatedPlayers, message, forcedDealTargetCard: null };
}
