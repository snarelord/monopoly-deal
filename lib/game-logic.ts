import type { Card, Player, PropertySet, GameState } from "@/lib/types";
import { cardData } from "@/lib/card-data";

// Initialise the game with players and a shuffled deck
export function initialiseGame(numPlayers: number) {
  const deck = createDeck();

  const shuffledDeck = shuffleDeck([...deck]);

  const players: Player[] = [];
  for (let i = 0; i < numPlayers; i++) {
    // deal 5 cards to each player
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
    initialisedPlayers: players,
    initialisedDeck: shuffledDeck,
  };
}

// Create the deck with all cards
function createDeck(): Card[] {
  console.log("CARD DATA START:", cardData);
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

// helper function to determine hwo many cards to draw
function getCards(handLength: number, defaultCards: number, emptyHandCards: number): number {
  return handLength === 0 ? emptyHandCards : defaultCards;
}

// helper function to draw cards from deck
function drawCardsFromDeck(deck: Card[]): Card | undefined {
  console.log("CARD DATA:", deck);
  return deck.pop();
}

export function drawCards(player: Player, deck: Card[], numCards = 2) {
  const updatedPlayer = { ...player };
  const updatedDeck = [...deck];
  const cardsToDraw = getCards(player.hand.length, numCards, 5);

  for (let i = 0; i < cardsToDraw; i++) {
    const drawnCard = drawCardsFromDeck(updatedDeck);
    if (drawnCard) updatedPlayer.hand.push(drawnCard);
  }

  return { updatedPlayer, updatedDeck };
}

// helper function to calculate the next player index for endTurn function
function getNextPlayerIndex(currentPlayerIndex: number, totalPlayers: number) {
  return (currentPlayerIndex + 1) % totalPlayers;
}

export function endTurn(players: Player[], currentPlayerIndex: number) {
  // move to next player
  const nextPlayerIndex = getNextPlayerIndex(currentPlayerIndex, players.length);
  return { nextPlayerIndex, updatedPlayers: players };
}

// Check if a property set is complete
export function isPropertySetComplete(propertySet: PropertySet): boolean {
  return propertySet.cards.length >= propertySet.requiredCards;
}

// Helper function to get rent from a card based on colour and property count
function getRentFromCard(card: Card, colour: string, propertyCount: number): number | undefined {
  if (!card.rent) return undefined;

  // Check if the rent is a nested object with colours
  if (typeof Object.values(card.rent)[0] === "object") {
    // This is a wildcard with multiple colour rent values
    const rentByColour = card.rent as
      | {
          [key: string]: number;
        }
      | { [colour: string]: { [key: number]: number } };

    // Use the specified colour's rent values
    if (rentByColour[colour]) {
      const rentKeys = Object.keys(rentByColour[colour])
        .map(Number)
        .sort((a, b) => a - b);

      // Find the appropriate rent key based on property count
      let rentKey = propertyCount;
      if (!(rentByColour[colour] as { [key: number]: number })[rentKey]) {
        // If exact count isn't available, find the closest lower value
        for (let i = rentKeys.length - 1; i >= 0; i--) {
          if (rentKeys[i] <= propertyCount) {
            rentKey = rentKeys[i];
            break;
          }
        }
      }

      return (rentByColour[colour] as { [key: number]: number })[rentKey];
    }
  } else {
    // This is a regular property card with simple rent values
    const simpleRent = card.rent as { [key: number]: number };
    const rentKeys = Object.keys(simpleRent)
      .map(Number)
      .sort((a, b) => a - b);

    // Find the appropriate rent key based on property count
    let rentKey = propertyCount;
    if (!simpleRent[rentKey]) {
      // If exact count isn't available, find the closest lower value
      for (let i = rentKeys.length - 1; i >= 0; i--) {
        if (rentKeys[i] <= propertyCount) {
          rentKey = rentKeys[i];
          break;
        }
      }
    }

    return simpleRent[rentKey];
  }

  return undefined;
}

// Update the calculateRentAmount function to use the rent values from the card data
export function calculateRentAmount(propertySet: PropertySet): number {
  // Count the number of properties in the set
  const propertyCount = propertySet.cards.length;

  // If the set is empty, return 0
  if (propertyCount === 0) return 0;

  // Get the colour of the property set
  const setColour = propertySet.colour;

  // Try to find a card with rent information
  let rentAmount = 0;

  // First, try to find a regular property card with rent info
  const regularPropertyCard = propertySet.cards.find(
    (card) => card.type === "property" && card.rent && typeof Object.values(card.rent)[0] === "number"
  );

  if (regularPropertyCard) {
    const rent = getRentFromCard(regularPropertyCard, setColour, propertyCount);
    if (rent !== undefined) {
      rentAmount = rent;
    }
  } else {
    // If no regular property card found, try to find a wildcard with rent info for this colour
    const wildcard = propertySet.cards.find(
      (card) =>
        card.type === "wildcard" && card.rent && (card.colour === setColour || card.secondaryColour === setColour)
    );

    if (wildcard) {
      const rent = getRentFromCard(wildcard, setColour, propertyCount);
      if (rent !== undefined) {
        rentAmount = rent;
      }
    } else {
      // Fallback to a basic calculation if no rent information is available
      // Use the property count as the base rent amount
      rentAmount = propertyCount;
    }
  }

  // Add extra for houses and hotels
  rentAmount += propertySet.houses * 3;
  rentAmount += propertySet.hotels * 5;

  return rentAmount;
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
      updatedSet.isComplete = updatedSet.cards.length >= updatedSet.requiredCards;
    } else {
      // Create new property set (only for regular properties, not "Any Colour" wildcards)
      const isAnyColourWildcard =
        card.type === "wildcard" &&
        (card.name.toLowerCase().includes("any colour") || card.name.toLowerCase().includes("any colour"));

      if (!isAnyColourWildcard) {
        player.properties.push({
          colour: card.colour || "",
          cards: [card],
          isComplete: false,
          houses: 0,
          hotels: 0,
          requiredCards: getRequiredCardsForColour(card.colour || ""),
        });
      } else {
        // Any Colour wildcards can't create their own sets
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
export function getRequiredCardsForColour(colour: string): number {
  switch (colour) {
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

// validate card placement
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
    // only property cards and wildcards can go in property sets
    if (card.type === "property" || card.type === "wildcard") {
      // special case for any colour wildcards
      const isAnyColourWildcard =
        card.type === "wildcard" &&
        (card.name.toLowerCase().includes("any colour") || card.name.toLowerCase().includes("any colour"));

      if (isAnyColourWildcard) {
        // any colour wildcards can only be added to existing property sets, they cannot create their own set
        const setIndex = Number.parseInt(targetArea.split("-")[1]);
        return !targetArea.endsWith(`-${setIndex}`) || setIndex < Number.POSITIVE_INFINITY; // always true for existing sets
      }

      return true;
    }
    return false;
  } else if (targetArea === "action") {
    // only action cards can be played as actions
    return card.type === "action";
  }

  return false;
}

// function to discard cards
export function discardCards(
  player: Player,
  cardIndices: number[],
  deck: Card[]
): { updatedPlayer: Player; updatedDeck: Card[] } {
  const updatedPlayer = { ...player };
  const updatedDeck = [...deck];

  // sort indices
  const sortedIndices = [...cardIndices].sort((a, b) => b - a);

  // remove cards from hand and add to bottom of the deck
  for (const index of sortedIndices) {
    if (index >= 0 && index < updatedPlayer.hand.length) {
      const card = updatedPlayer.hand.splice(index, 1)[0];
      updatedDeck.unshift(card); // add to bottom of deck
    }
  }

  return {
    updatedPlayer,
    updatedDeck,
  };
}
