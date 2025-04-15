import type { Player } from "@/lib/types";
import { calculateBankTotal } from "@/lib/utils";

export function handleBirthday(
  players: Player[],
  currentPlayerIndex: number
): { updatedPlayers: Player[]; message: string; totalCollected: number } {
  const updatedPlayers = [...players];
  const updatedPlayer = { ...updatedPlayers[currentPlayerIndex] };
  let totalCollected = 0;

  // Collect 2M from each player
  updatedPlayers.forEach((player, index) => {
    if (index !== currentPlayerIndex) {
      const playerToUpdate = { ...player };
      const amountToPay = Math.min(2, calculateBankTotal(playerToUpdate.bank));

      if (amountToPay > 0) {
        // Find cards to pay with
        const cardsToPay: any[] = [];
        let totalPaid = 0;

        // Sort bank cards by value (ascending) to optimize payment
        const sortedBank = [...playerToUpdate.bank].sort((a, b) => a.value - b.value);

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

  updatedPlayers[currentPlayerIndex] = updatedPlayer;
  const message = `Collected ${totalCollected}M for your birthday`;

  return { updatedPlayers, message, totalCollected };
}
