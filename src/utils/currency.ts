import type { StoreCurrency } from "@/services/settings.service";

export const DEFAULT_CURRENCY: StoreCurrency = {
  code: "PKR",
  symbol: "Rs.",
  position: "before",
};

export const formatMoney = (
  value: number | undefined | null,
  currency?: StoreCurrency | null,
) => {
  const active = currency?.symbol ? currency : DEFAULT_CURRENCY;
  const amount = Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

  if (active.position === "after") return `${amount} ${active.symbol}`;

  const separator = active.symbol.length > 1 ? " " : "";
  return `${active.symbol}${separator}${amount}`;
};
