import PropertyCard from "../components/PropertyCard";
import { propertyCards } from "../data/cardData.js";

export default {
  title: "Monopoly/MonopolyCard",
  component: PropertyCard,
};

const regentStreet = propertyCards.find(
  (card) => card.name === "Whitechapel Road"
);

export const RegentStreetCard = () => <PropertyCard {...regentStreet} />;
