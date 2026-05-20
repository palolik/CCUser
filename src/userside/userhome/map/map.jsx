import { useEffect, useRef, useState } from 'react';
import { MapPinCheck } from 'lucide-react';

const worldMap = '/assets/world.svg';

// The SVG's original intrinsic size — used to convert stored px → %
const MAP_W = 2000;
const MAP_H = 857;

const Map = ({ mapData }) => {
  const [hovered, setHovered] = useState(null);
  const imgRef   = useRef(null);
  const wrapRef  = useRef(null);
  const [scale, setScale] = useState({ w: 1, h: 1 });

  // Recalculate scale whenever image renders / window resizes
  const recalc = () => {
    if (!imgRef.current) return;
    setScale({
      w: imgRef.current.offsetWidth  / MAP_W,
      h: imgRef.current.offsetHeight / MAP_H,
    });
  };

  useEffect(() => {
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  // Scroll to centre on mobile
  useEffect(() => {
    if (wrapRef.current) {
      wrapRef.current.scrollLeft =
        (wrapRef.current.scrollWidth - wrapRef.current.clientWidth) / 2;
    }
  }, []);

  return (
    <section
      className="relative py-24 overflow-hidden"
      style={{ background: "linear-gradient(160deg,#050d1f 0%,#0a1628 55%,#050d1f 100%)" }}
    >
      {/* Glow */}
      <div
        className="absolute -top-16 left-1/2 -translate-x-1/2 w-[800px] h-96 pointer-events-none"
        style={{ background: "radial-gradient(ellipse,rgba(59,130,246,0.12) 0%,transparent 65%)" }}
      />

      {/* Header */}
      <div className="text-center mb-14 px-6 relative">
        <p className="text-xs tracking-[3px] uppercase text-blue-500 font-medium mb-4">
          Worldwide Presence
        </p>
        <h2
          className="font-serif text-4xl md:text-5xl font-semibold text-blue-50 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Our Clients{" "}
          <em className="italic text-blue-400">Around the Globe</em>
        </h2>
      </div>

      {/* Scrollable map on mobile, full width on desktop */}
      <div
        ref={wrapRef}
        className="w-full overflow-x-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div
          className="relative"
          style={{ minWidth: '600px' }}   // never collapse too small
        >
          {/* Map image — dark tinted */}
          <img
            ref={imgRef}
            src={worldMap}
            alt="World Map"
            className="w-full h-auto block select-none"
            style={{
              filter: "  ",
             
            }}
            onLoad={recalc}
            draggable={false}
          />

          {/* Pins */}
          {mapData && mapData.map((icon) => {
            const origTop  = parseFloat(icon.position.top)  || 0;
            const origLeft = parseFloat(icon.position.left) || 0;

            const topPct  = (origTop  / MAP_H) * 100;
            const leftPct = (origLeft / MAP_W) * 100;

            const isHovered = hovered === icon._id;

            return (
              <div
                key={icon._id}
                className="absolute z-10"
                style={{
                  top:  `${topPct}%`,
                  left: `${leftPct}%`,
                  transform: 'translate(-50%, -100%)',
                }}
                onMouseEnter={() => setHovered(icon._id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div
                    className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2
                      flex items-center gap-2.5 rounded-2xl px-3 py-2.5
                      border border-blue-500/30 whitespace-nowrap z-50
                      shadow-2xl animate-fadeIn"
                    style={{
                      background: "rgba(9,21,40,0.95)",
                      minWidth: '100px',
                    }}
                  >
                  
                    <span className="text-xs text-blue-200/80 font-light leading-snug">
                      {icon.data}
                    </span>
                    {/* Arrow */}
                    <span
                      className="absolute top-full left-1/2 -translate-x-1/2"
                      style={{
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '5px solid rgba(59,130,246,0.3)',
                      }}
                    />
                  </div>
                )}

           {/* Pin */}
<div
  className="transition-all duration-200 flex flex-col items-center"
  style={{
    transform: isHovered ? 'scale(1.25)' : 'scale(1)',
    transition: 'all 0.2s ease',
  }}
>
  {/* Pin head */}
  <div
    style={{
      width: isHovered ? '36px' : '28px',
      height: isHovered ? '36px' : '28px',
      borderRadius: '50% 50% 50% 0',
      transform: 'rotate(-45deg)',
      background: isHovered
        ? 'rgba(255,255,255,0.95)'
        : 'rgba(255,255,255,0.85)',
      boxShadow: isHovered
        ? '0 0 12px rgba(96,165,250,0.9)'
        : '0 0 6px rgba(59,130,246,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
    }}
  >
    {/* Logo inside, counter-rotated */}
    <img
      src="/assets/iconsvg.svg"
      alt="pin"
      style={{
        width: '65%',
        height: '65%',
        objectFit: 'contain',
        transform: 'rotate(45deg)',
      }}
    />
  </div>

  {/* Pin tail */}
  <div
    style={{
      width: '2px',
      height: isHovered ? '10px' : '8px',
      background: isHovered
        ? 'rgba(255,255,255,0.95)'
        : 'rgba(255,255,255,0.7)',
      borderRadius: '0 0 2px 2px',
      transition: 'all 0.2s ease',
    }}
  />
</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Map;