const WaveBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Soft gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100" />

      {/* Glow blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-blob-one" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl animate-blob-two" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-cyan-300/10 rounded-full blur-3xl animate-blob-three" />

      {/* Wave Layer 1 */}
      <svg
        className="absolute bottom-0 left-0 w-[200%] h-[320px] animate-wave-slow"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="rgba(59, 130, 246, 0.12)"
          d="M0,160 C240,260 480,60 720,160 C960,260 1200,60 1440,160 L1440,320 L0,320 Z"
        />
      </svg>

      {/* Wave Layer 2 */}
      <svg
        className="absolute bottom-0 left-0 w-[200%] h-[280px] animate-wave-medium"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="rgba(37, 99, 235, 0.10)"
          d="M0,210 C240,110 480,310 720,210 C960,110 1200,310 1440,210 L1440,320 L0,320 Z"
        />
      </svg>

      {/* Wave Layer 3 */}
      <svg
        className="absolute bottom-0 left-0 w-[200%] h-[240px] animate-wave-fast"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="rgba(96, 165, 250, 0.16)"
          d="M0,250 C180,200 360,300 540,250 C720,200 900,300 1080,250 C1260,200 1440,300 1620,250 L1620,320 L0,320 Z"
        />
      </svg>

      <style>
        {`
          @keyframes waveSlow {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          @keyframes waveMedium {
            0% {
              transform: translateX(-20%);
            }
            100% {
              transform: translateX(-60%);
            }
          }

          @keyframes waveFast {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-45%);
            }
          }

          @keyframes blobOne {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            50% {
              transform: translate(80px, 40px) scale(1.15);
            }
          }

          @keyframes blobTwo {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            50% {
              transform: translate(-90px, -50px) scale(1.1);
            }
          }

          @keyframes blobThree {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            50% {
              transform: translate(50px, -70px) scale(1.2);
            }
          }

          .animate-wave-slow {
            animation: waveSlow 18s linear infinite;
          }

          .animate-wave-medium {
            animation: waveMedium 14s linear infinite;
          }

          .animate-wave-fast {
            animation: waveFast 10s linear infinite;
          }

          .animate-blob-one {
            animation: blobOne 12s ease-in-out infinite;
          }

          .animate-blob-two {
            animation: blobTwo 15s ease-in-out infinite;
          }

          .animate-blob-three {
            animation: blobThree 18s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default WaveBackground;