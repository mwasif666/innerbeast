import { useCallback } from "react";

import { usePublicSettings } from "./useSettings";
import { DEFAULT_CURRENCY, formatMoney } from "@/utils/currency";

export const useStoreCurrency = () => {
  const { data } = usePublicSettings();
  const currency = data?.data?.currency?.symbol
    ? data.data.currency
    : DEFAULT_CURRENCY;

  const format = useCallback(
    (value: number | undefined | null) => formatMoney(value, currency),
    [currency],
  );

  return { currency, symbol: currency.symbol, code: currency.code, format };
};
