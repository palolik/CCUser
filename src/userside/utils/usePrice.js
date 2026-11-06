import { useEffect, useState } from 'react';
import { base_url } from '../../config/config';
import { bdtToUsd, formatBDT, formatUSD } from './currency';

// Prices are stored in BDT. Visitors in Bangladesh see taka; everyone else
// sees whole US dollars. The server decides from the visitor's IP
// (GET /pricing/locale); the browser time zone is the fallback.

const STORAGE_KEY = 'pricingLocale';
const DEFAULT_USD_RATE = 122;

const currencyFromTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Dhaka' ? 'BDT' : 'USD';
  } catch {
    return 'BDT';
  }
};

const readCached = () => {
  try {
    const cached = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    return cached?.currency ? cached : null;
  } catch {
    return null;
  }
};

let pending = null;
const loadLocale = () => {
  pending ??= fetch(`${base_url}/pricing/locale`)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`pricing locale ${r.status}`))))
    .then((data) => ({
      currency: data.currency || currencyFromTimeZone(),
      usdRate: Number(data.usdRate) || DEFAULT_USD_RATE,
    }))
    .catch(() => ({ currency: currencyFromTimeZone(), usdRate: DEFAULT_USD_RATE }))
    .then((locale) => {
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(locale)); } catch { /* storage blocked */ }
      return locale;
    });
  return pending;
};

// USD amounts are converted from the BDT *total* and rounded up; line items
// (express fee, discount) are shown as differences of totals so a breakdown
// always adds up to what the buyer is quoted.
export const usePrice = () => {
  const [locale, setLocale] = useState(
    () => readCached() || { currency: currencyFromTimeZone(), usdRate: DEFAULT_USD_RATE }
  );

  useEffect(() => {
    let active = true;
    if (!readCached()) loadLocale().then((l) => active && setLocale(l));
    return () => { active = false; };
  }, []);

  const isUSD = locale.currency === 'USD';

  // BDT value -> number in the visitor's currency.
  const toDisplay = (bdt) => (isUSD ? bdtToUsd(bdt, locale.usdRate) : Number(bdt) || 0);

  // Number already in the visitor's currency -> string. USD is always whole dollars.
  const formatAmount = (amount, { decimals = 0 } = {}) =>
    isUSD ? formatUSD(amount) : formatBDT(amount, { decimals });

  const format = (bdt, opts) => formatAmount(toDisplay(bdt), opts);

  return { currency: locale.currency, toDisplay, format, formatAmount };
};
