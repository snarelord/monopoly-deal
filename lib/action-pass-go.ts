import type { Player, Card } from "@/lib/types";
import { drawCards } from "@/lib/game-logic";

export function handlePassGo(player: Player, deck: Card[]): { updatedPlayer: Player; updatedDeck: Card[] } {
  // Draw 2 more cards
  return drawCards(player, deck, 2);
}
