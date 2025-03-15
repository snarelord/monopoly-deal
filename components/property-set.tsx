"use client";

import type { PropertySet as PropertySetType } from "@/lib/types";
import CardComponent from "@/components/card";

interface PropertySetProps {
  propertySet: PropertySetType;
  onClick: () => void;
}

export default function PropertySet({
  propertySet,
  onClick,
}: PropertySetProps) {
  // get colour class based on property colour for the border
  const getColorClass = (color: string): string => {
    switch (color) {
      case "brown":
        return "border-amber-900";
      case "light blue":
        return "border-sky-300";
      case "pink":
        return "border-pink-400";
      case "orange":
        return "border-orange-400";
      case "red":
        return "border-red-500";
      case "yellow":
        return "border-yellow-400";
      case "green":
        return "border-green-600";
      case "dark blue":
        return "border-blue-800";
      case "black":
        return "border-gray-800";
      case "mint":
        return "border-emerald-300";
      default:
        return "border-gray-200";
    }
  };

  const colorClass = getColorClass(propertySet.color);
  const isComplete = propertySet.isComplete;

  return (
    <div
      className={`p-2 rounded-lg border-2 ${
        isComplete ? "border-yellow-400" : colorClass
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col gap-1">
        {propertySet.cards.map((card, index) => (
          <div
            key={`property-${index}`}
            className="relative"
            style={{ marginTop: index > 0 ? "-80px" : "0" }}
          >
            <CardComponent card={card} isSmall={true} onClick={() => {}} />
          </div>
        ))}
      </div>
      {isComplete && (
        <div className="mt-2 flex gap-1 justify-center">
          <div className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded">
            Complete!
          </div>
        </div>
      )}
    </div>
  );
}
