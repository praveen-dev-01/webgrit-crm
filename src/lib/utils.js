import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Map pipeline stages to their brand colors for Light Theme readability
export const stageColors = {
  "New Lead": "bg-blue-100 text-blue-700 border-blue-200",
  "Contacted": "bg-purple-100 text-purple-700 border-purple-200",
  "Discovery Done": "bg-amber-100 text-amber-700 border-amber-200",
  "Proposal Sent": "bg-orange-100 text-orange-700 border-orange-200",
  "Won ✅": "bg-green-100 text-green-700 border-green-200",
  "Lost ❌": "bg-red-100 text-red-700 border-red-200",
};

export const serviceOptions = [
  "Business Website",
  "E-commerce Store",
  "Landing Page",
  "SEO & Maintenance",
  "Other"
];

export const pipelineStages = [
  "New Lead",
  "Contacted",
  "Discovery Done",
  "Proposal Sent",
  "Won ✅",
  "Lost ❌"
];

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}
