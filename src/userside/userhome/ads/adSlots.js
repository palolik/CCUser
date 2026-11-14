// Ad placements on the home page. `key` is the value stored in advertisement.location.
// Keep in sync with CCAdmin/src/adminside/Advertise/adSlots.js and
// cloudcompanyserver/scripts/seedPlaceholderAds.js.
export const AD_SLOTS = {
  Header: { label: "Header banner", width: 1200, height: 150 },
  "Homepage Banner": { label: "Homepage banner", width: 1200, height: 400 },
  Footer: { label: "Footer banner", width: 1200, height: 150 },
  hls: { label: "Home left sidebar", width: 160, height: 600 },
  hrs: { label: "Home right sidebar", width: 160, height: 600 },
  Sidebar: { label: "Both home sidebars", width: 160, height: 600 },
  Popup: { label: "Popup", width: 600, height: 600 },
};

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// Live = marked active and today falls inside the optional start/till dates.
export const isAdLive = (ad, now = new Date()) => {
  if (ad?.status?.toLowerCase() !== "active") return false;
  const today = startOfDay(now);
  if (ad.startdate && startOfDay(ad.startdate) > today) return false;
  if (ad.tilldate && startOfDay(ad.tilldate) < today) return false;
  return true;
};

export const adsFor = (ads, ...locations) => {
  const wanted = locations.map((l) => l.toLowerCase());
  return (ads || []).filter(
    (ad) => wanted.includes(ad.location?.toLowerCase()) && isAdLive(ad)
  );
};
