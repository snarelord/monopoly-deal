import type { Card, Player, PropertySet, GameState } from "@/lib/types";
import { cardData } from "@/lib/card-data";

// Initialise the game with players and a shuffled deck
export function initializeGame(numPlayers: number) {
  const deck = createDeck();

  const shuffledDeck = shuffleDeck([...deck]);

  const players: Player[] = [];
  for (let i = 0; i < numPlayers; i++) {
    // Deal 5 cards to each player
    const hand: Card[] = [];
    for (let j = 0; j < 5; j++) {
      if (shuffledDeck.length > 0) {
        hand.push(shuffledDeck.pop()!);
      }
    }

    players.push({
      id: i,
      hand,
      bank: [],
      properties: [],
    });
  }

  return {
    initializedPlayers: players,
    initializedDeck: shuffledDeck,
  };
}

// Create the deck with all cards
function createDeck(): Card[] {
  return cardData;
}

// Shuffle the deck using Fisher-Yates algorithm
function shuffleDeck(deck: Card[]): Card[] {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Update the drawCards function to only draw 2 cards (or 5 if hand is empty)
export function drawCards(player: Player, deck: Card[], numCards = 2) {
  const updatedPlayer = { ...player };
  const updatedDeck = [...deck];

  // If player has no cards, draw 5 instead of 2
  const cardsToDraw = player.hand.length === 0 ? 5 : numCards;

  for (let i = 0; i < cardsToDraw; i++) {
    if (updatedDeck.length > 0) {
      updatedPlayer.hand.push(updatedDeck.pop()!);
    }
  }

  return {
    updatedPlayer,
    updatedDeck,
  };
}

// Update the endTurn function to handle discarding excess cards
export function endTurn(players: Player[], currentPlayerIndex: number) {
  const updatedPlayers = [...players];
  const currentPlayer = { ...updatedPlayers[currentPlayerIndex] };

  // don't automatically discard here the player must choose which cards to discard
  // this is handled in the UI with a discard modal

  // Move to the next player
  const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;

  return {
    nextPlayerIndex,
    updatedPlayers,
  };
}

// Check if a property set is complete
export function isPropertySetComplete(propertySet: PropertySet): boolean {
  return propertySet.cards.length >= propertySet.requiredCards;
}

// Update the calculateRentAmount function to use the rent values from the card data
export function calculateRentAmount(propertySet: PropertySet): number {
  // Count the number of properties in the set
  const propertyCount = propertySet.cards.length;

  // If the set is empty, return 0
  if (propertyCount === 0) return 0;

  // Find a property card with rent information
  const propertyWithRent = propertySet.cards.find((card) => card.rent);

  if (propertyWithRent && propertyWithRent.rent) {
    // Use the rent value based on the number of properties
    // If the exact count isn't in the rent object, use the highest available
    const rentKeys = Object.keys(propertyWithRent.rent)
      .map(Number)
      .sort((a, b) => a - b);
    let rentKey = propertyCount;

    // If the exact count isn't available, find the closest lower value
    if (!propertyWithRent.rent[rentKey]) {
      for (let i = rentKeys.length - 1; i >= 0; i--) {
        if (rentKeys[i] <= propertyCount) {
          rentKey = rentKeys[i];
          break;
        }
      }
    }

    let rentAmount = propertyWithRent.rent[rentKey] || 1; // Default to 1 if no rent found

    // If the set is complete, double the rent
    if (propertySet.isComplete) {
      rentAmount *= 2;
    }

    // Add extra for houses and hotels
    rentAmount += propertySet.houses * 3;
    rentAmount += propertySet.hotels * 5;

    return rentAmount;
  } else {
    // Fallback to the old calculation if no rent information is available
    // Base rent is 1M per property card
    let rentAmount = propertyCount;

    // If the set is complete, double the rent
    if (propertySet.isComplete) {
      rentAmount *= 2;
    }

    // Add extra for houses and hotels
    rentAmount += propertySet.houses * 3;
    rentAmount += propertySet.hotels * 5;

    return rentAmount;
  }
}

// Play a card from hand to a specific area
export function playCard(
  gameState: GameState,
  playerIndex: number,
  cardIndex: number,
  targetArea: string,
  targetPlayerIndex?: number
): GameState {
  const updatedGameState = { ...gameState };
  const player = updatedGameState.players[playerIndex];
  const card = player.hand[cardIndex];

  // Remove card from hand
  player.hand.splice(cardIndex, 1);

  // Handle different target areas
  if (targetArea === "bank") {
    // Add card to bank
    player.bank.push(card);
  } else if (targetArea.startsWith("property-")) {
    const setIndex = Number.parseInt(targetArea.split("-")[1]);

    // Check if this is an existing property set
    if (setIndex < player.properties.length) {
      // Add to existing property set
      const updatedSet = player.properties[setIndex];
      updatedSet.cards.push(card);

      // Check if set is now complete
      updatedSet.isComplete =
        updatedSet.cards.length >= updatedSet.requiredCards;
    } else {
      // Create new property set (only for regular properties, not "Any Color" wildcards)
      const isAnyColorWildcard =
        card.type === "wildcard" &&
        (card.name.toLowerCase().includes("any color") ||
          card.name.toLowerCase().includes("any colour"));

      if (!isAnyColorWildcard) {
        player.properties.push({
          color: card.color || "",
          cards: [card],
          isComplete: false,
          houses: 0,
          hotels: 0,
          requiredCards: getRequiredCardsForColor(card.color || ""),
        });
      } else {
        // Any Color wildcards can't create their own sets
        return updatedGameState;
      }
    }
  } else if (targetArea === "action") {
    // Add to action area
    updatedGameState.actionCards.push(card);
  }

  // Increment cards played
  updatedGameState.cardsPlayed += 1;

  return updatedGameState;
}

// Get the number of cards required for a complete set of a specific colour
export function getRequiredCardsForColor(color: string): number {
  switch (color) {
    case "brown":
    case "dark blue":
    case "mint":
      return 2;
    case "light blue":
    case "pink":
    case "orange":
    case "red":
    case "yellow":
    case "green":
      return 3;
    case "black":
      return 4;
    default:
      return 1;
  }
}

// Add a function to validate card placement
export function isValidCardPlacement(card: Card, targetArea: string): boolean {
  if (targetArea === "bank") {
    if (card.type === "wildcard" && card.value === 0) {
      return false;
    }
    if (card.type === "property" || card.type === "wildcard") {
      return false; // cannot add these cards to the bank
    }
    return true;
  } else if (targetArea.startsWith("property-")) {
    // Only property cards and wildcards can go in property sets
    if (card.type === "property" || card.type === "wildcard") {
      // Special case for "Any Color" wildcards
      const isAnyColorWildcard =
        card.type === "wildcard" &&
        (card.name.toLowerCase().includes("any color") ||
          card.name.toLowerCase().includes("any colour"));

      if (isAnyColorWildcard) {
        // "Any Color" wildcards can only be added to existing property sets
        // They cannot create their own set
        const setIndex = Number.parseInt(targetArea.split("-")[1]);
        return (
          !targetArea.endsWith(`-${setIndex}`) ||
          setIndex < Number.POSITIVE_INFINITY
        ); // Always true for existing sets
      }

      return true;
    }
    return false;
  } else if (targetArea === "action") {
    // Only action cards can be played as actions
    return card.type === "action";
  }

  return false;
}

// Add a function to discard cards
export function discardCards(
  player: Player,
  cardIndices: number[],
  deck: Card[]
): { updatedPlayer: Player; updatedDeck: Card[] } {
  const updatedPlayer = { ...player };
  const updatedDeck = [...deck];

  // Sort indices in descending order to avoid shifting issues when removing
  const sortedIndices = [...cardIndices].sort((a, b) => b - a);

  // Remove cards from hand and add to bottom of deck
  for (const index of sortedIndices) {
    if (index >= 0 && index < updatedPlayer.hand.length) {
      const card = updatedPlayer.hand.splice(index, 1)[0];
      updatedDeck.unshift(card); // Add to bottom of deck
    }
  }

  return {
    updatedPlayer,
    updatedDeck,
  };
}
