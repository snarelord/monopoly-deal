"use client";

import { useState } from "react";

export function useGameModals() {
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showPropertySelectionModal, setShowPropertySelectionModal] = useState(false);
  const [propertySelectionType, setPropertySelectionType] = useState<string>("");
  const [targetPlayerForPropertySelection, setTargetPlayerForPropertySelection] = useState<number | null>(null);

  const openDiscardModal = () => setShowDiscardModal(true);
  const closeDiscardModal = () => setShowDiscardModal(false);

  const openPropertySelectionModal = (type: string, targetPlayer: number) => {
    setPropertySelectionType(type);
    setTargetPlayerForPropertySelection(targetPlayer);
    setShowPropertySelectionModal(true);
  };

  const closePropertySelectionModal = () => {
    setShowPropertySelectionModal(false);
    setTargetPlayerForPropertySelection(null);
    setPropertySelectionType("");
  };

  return {
    showDiscardModal,
    showPropertySelectionModal,
    propertySelectionType,
    targetPlayerForPropertySelection,
    openDiscardModal,
    closeDiscardModal,
    openPropertySelectionModal,
    closePropertySelectionModal,
    setPropertySelectionType,
  };
}
