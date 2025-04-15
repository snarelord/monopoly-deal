import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Card } from "@/lib/types";

// Cclculate total money in bank
export function calculateBankTotal(bank: Card[]): number {
  return bank.reduce((total, card) => total + card.value, 0);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
