import type { Player } from "@/lib/types";
import { calculateBankTotal } from "@/lib/utils";

export function handleDebtCollector(
  players: Player[],
  currentPlayerIndex: number,
  targetPlayerIndex: number
): { updatedPlayers: Player[]; message: string } {
  const updatedPlayers = [...players];
  const updatedPlayer = { ...updatedPlayers[currentPlayerIndex] };
  const targetPlayer = { ...updatedPlayers[targetPlayerIndex] };

  const amountToPay = Math.min(5, calculateBankTotal(targetPlayer.bank));
  let message = "";

  if (amountToPay > 0) {
    // Find cards to pay with (simple implementation - just take the first cards that add up to the amount) fix this!!
    const cardsToPay: any[] = [];
    let totalPaid = 0;

    // Sort bank cards by value (ascending) to optimize payment
    const sortedBank = [...targetPlayer.bank].sort((a, b) => a.value - b.value);

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
    targetPlayer.bank = targetPlayer.bank.filter((card) => !cardsToPay.some((payCard) => payCard.id === card.id));

    // Add cards to current player's bank
    updatedPlayer.bank = [...updatedPlayer.bank, ...cardsToPay];

    updatedPlayers[targetPlayerIndex] = targetPlayer;
    updatedPlayers[currentPlayerIndex] = updatedPlayer;

    message = `Collected ${totalPaid}M from Player ${targetPlayerIndex + 1}`;
  } else {
    message = `Player ${targetPlayerIndex + 1} has no money to pay`;
  }

  return { updatedPlayers, message };
}
