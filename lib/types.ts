export interface Card {
  id: string;
  type: "property" | "money" | "action" | "wildcard" | "station" | "utility";
  name: string;
  value: number;
  color?: string;
  rent?: { [key: number]: number };
  secondaryColor?: string; // two-way wildcards
  actionType?: string;
  image: string;
}

export interface PropertySet {
  color: string;
  cards: Card[];
  isComplete: boolean;
  houses: number;
  hotels: number;
  requiredCards: number;
}

export interface Player {
  id: number;
  hand: Card[];
  bank: Card[];
  properties: PropertySet[];
}

export interface ActionInProgress {
  type: string;
  sourcePlayer: number;
  targetPlayer?: number;
  card: Card;
}

export interface GameState {
  players: Player[];
  deck: Card[];
  currentPlayerIndex: number;
  cardsPlayed: number;
  isGameOver: boolean;
  winner: Player | null;
  actionInProgress: ActionInProgress | null;
  hasDrawnCards: boolean;
  actionCards: Card[];
  message?: string;
}
