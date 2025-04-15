import type { Player } from "@/lib/types";
import { calculateRentAmount } from "@/lib/game-logic";
import { calculateBankTotal } from "@/lib/utils";

export function handleRent(
  players: Player[],
  currentPlayerIndex: number,
  targetPlayerIndex: number,
  rentColours: string[]
): { updatedPlayers: Player[]; message: string } {
  const updatedPlayers = [...players];
  const updatedPlayer = { ...updatedPlayers[currentPlayerIndex] };
  const targetPlayer = { ...updatedPlayers[targetPlayerIndex] };

  // Find property sets of the specified colours
  const relevantSets = updatedPlayer.properties.filter(
    (set) => rentColours.includes(set.colour) || (set.colour && rentColours.includes(set.colour))
  );

  // Calculate rent amount
  let rentAmount = 0;
  relevantSets.forEach((set) => {
    rentAmount += calculateRentAmount(set);
  });

  let message = "";

  if (rentAmount > 0) {
    const amountToPay = Math.min(rentAmount, calculateBankTotal(targetPlayer.bank));

    if (amountToPay > 0) {
      // Find cards to pay with
      const cardsToPay: any[] = []; // fix
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

      message = `Collected ${totalPaid}M rent from Player ${targetPlayerIndex + 1}`;
    } else {
      message = `Player ${targetPlayerIndex + 1} has no money to pay rent`;
    }
  } else {
    message = `No properties of the specified colours to collect rent for`;
  }

  return { updatedPlayers, message };
}
