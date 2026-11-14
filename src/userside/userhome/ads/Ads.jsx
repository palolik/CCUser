/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { base_url } from "../../../config/config";
import { AD_SLOTS, adsFor } from "./adSlots";

const trackClick = (id) => {
  fetch(`${base_url}/adclicks/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incrementBy: 1 }),
  }).catch(() => {});
};

// Cycles through several live ads in one slot.
const useRotation = (count, ms = 8000) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), ms);
    return () => clearInterval(t);
  }, [count, ms]);
  return count ? index % count : 0;
};

const AdLink = ({ ad, className, imgClassName, style }) => (
  <a
    href={ad.rdlink}
    target="_blank"
    rel="noopener noreferrer sponsored"
    onClick={() => trackClick(ad._id)}
    className={`relative block overflow-hidden ${className || ""}`}
    style={style}
  >
    <img
      src={ad.imglink}
      alt="Advertisement"
      loading="lazy"
      className={`w-full h-full object-cover ${imgClassName || ""}`}
    />
    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px] leading-none">
      Ad
    </span>
  </a>
);

// Horizontal banner (Header / Homepage Banner / Footer), kept at the slot's aspect ratio.
export const BannerAd = ({ ads, location, className = "" }) => {
  const live = adsFor(ads, location);
  const index = useRotation(live.length);
  const slot = AD_SLOTS[location];
  if (!live.length || !slot) return null;

  return (
    <div className={`w-full px-4 flex justify-center ${className}`}>
      <AdLink
        ad={live[index]}
        className="w-full rounded-xl shadow-sm"
        style={{ maxWidth: slot.width, aspectRatio: `${slot.width} / ${slot.height}` }}
      />
    </div>
  );
};

// True once the marker element has scrolled above the top of the viewport.
const useScrolledPast = () => {
  const ref = useRef(null);
  const [past, setPast] = useState(false);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      if (ref.current) setPast(ref.current.getBoundingClientRect().top <= 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return [ref, past];
};

// Fixed skyscrapers either side of the page on wide screens.
// Home: "Sidebar" ads on both sides, hls / hrs on their own side.
// Blog posts pass leftLocations={["bls", "Blog Sidebar"]} rightLocations={["brs", "Blog Sidebar"]}.
// Render this right after the hero/header: the ads stay hidden until it is scrolled past.
export const SideAds = ({
  ads,
  leftLocations = ["hls", "Sidebar"],
  rightLocations = ["hrs", "Sidebar"],
}) => {
  const left = adsFor(ads, ...leftLocations);
  const right = adsFor(ads, ...rightLocations);
  const leftIndex = useRotation(left.length);
  const rightIndex = useRotation(right.length);
  const [markerRef, pastHero] = useScrolledPast();
  const { width, height } = AD_SLOTS.hls;
  const style = { width: 120, aspectRatio: `${width} / ${height}` };
  const visibility = pastHero
    ? "opacity-100 pointer-events-auto"
    : "opacity-0 pointer-events-none";

  return (
    <>
      <div ref={markerRef} aria-hidden="true" />
      {left.length > 0 && (
        <div
          className={`hidden xl:block fixed left-2 top-1/2 -translate-y-1/2 z-20 transition-opacity duration-300 ${visibility}`}
        >
          <AdLink ad={left[leftIndex]} className="rounded-2xl shadow-lg" style={style} />
        </div>
      )}
      {right.length > 0 && (
        <div
          className={`hidden xl:block fixed right-2 top-1/2 -translate-y-1/2 z-20 transition-opacity duration-300 ${visibility}`}
        >
          <AdLink ad={right[rightIndex]} className="rounded-2xl shadow-lg" style={style} />
        </div>
      )}
    </>
  );
};

const POPUP_SEEN_KEY = "cc-ad-popup-seen";

// Shown once per browser session, a few seconds after the page loads.
export const PopupAd = ({ ads, delay = 4000 }) => {
  const live = adsFor(ads, "Popup");
  const [open, setOpen] = useState(false);
  const ad = live[0];

  useEffect(() => {
    if (!ad) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(POPUP_SEEN_KEY) === "1";
    } catch {
      /* storage blocked */
    }
    if (seen) return;
    const t = setTimeout(() => {
      setOpen(true);
      try {
        sessionStorage.setItem(POPUP_SEEN_KEY, "1");
      } catch {
        /* storage blocked */
      }
    }, delay);
    return () => clearTimeout(t);
  }, [ad, delay]);

  if (!open || !ad) return null;
  const { width, height } = AD_SLOTS.Popup;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
    >
      <div className="relative w-full max-w-[420px]" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          aria-label="Close advertisement"
          onClick={() => setOpen(false)}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white shadow text-gray-700 hover:text-black"
        >
          ✕
        </button>
        <AdLink
          ad={ad}
          className="w-full rounded-2xl shadow-2xl"
          style={{ aspectRatio: `${width} / ${height}` }}
        />
      </div>
    </div>
  );
};
