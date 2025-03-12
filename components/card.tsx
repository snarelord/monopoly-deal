"use client";
import type { Card as CardType } from "@/lib/types";
import Image from "next/image";

interface CardProps {
  card: CardType;
  onClick: () => void;
  isSelected?: boolean;
  isSmall?: boolean;
}

export default function Card({
  card,
  onClick,
  isSelected = false,
  isSmall = false,
}: CardProps) {
  // check for wildcard
  // const isWildcard = card.type === "wildcard";
  return (
    <div
      className={`relative cursor-pointer transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-blue-500 transform -translate-y-2"
          : "hover:transform hover:-translate-y-1"
      }`}
      onClick={onClick}
    >
      <div
        className={`relative ${
          isSmall ? "w-16 h-24" : "w-24 h-36"
        } rounded-lg overflow-hidden shadow-md`}
      >
        <Image
          src={card.image || "/placeholder.svg"}
          alt={card.name}
          fill
          className="object-cover"
          sizes={isSmall ? "64px" : "96px"}
        />
      </div>
    </div>
  );
}
