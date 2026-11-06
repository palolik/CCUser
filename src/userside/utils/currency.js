// Prices are stored as BDT strings/numbers. en-IN grouping gives the
// lakh format Bangladeshi buyers expect (1,50,000 rather than 150,000).
export const formatBDT = (value, { decimals = 0 } = {}) => {
  const n = Number(value) || 0;
  return `৳${n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};

// jsPDF's built-in fonts have no ৳ glyph, so PDFs use the ISO code instead.
export const formatBDTPlain = (value, { decimals = 2 } = {}) => {
  const n = Number(value) || 0;
  return `BDT ${n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};

// Visitors outside Bangladesh see BDT prices converted to whole US dollars,
// always rounded up (৳18,000 at 122 → $148).
export const bdtToUsd = (value, rate) => Math.ceil((Number(value) || 0) / rate);

export const formatUSD = (value) => `$${(Number(value) || 0).toLocaleString('en-US')}`;

// Monthly plans, courses and mentoring store "0" for express — treat that as "no express option".
export const hasExpress = (pkg) => Number(pkg?.expressDeliveryTime) > 0;

// Public, keyword-bearing URL for a package; falls back to the id for packages without a slug yet.
export const packageUrl = (pkg) => `/packdetails/${pkg?.slug || pkg?._id}`;
