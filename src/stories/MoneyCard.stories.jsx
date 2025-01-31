import MoneyCard from "../components/MoneyCard.jsx";
import { moneyCards } from "../data/cardData.js";

export default {
  title: "Monopoly/MoneyCard",
  component: MoneyCard,
};

const moneyCard = moneyCards.find((card) => card.type === "1m");

export const MonopolyMoneyCard = () => <MoneyCard {...moneyCard} />;
