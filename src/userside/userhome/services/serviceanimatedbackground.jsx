import { useEffect, useRef } from "react";

const ServicesAnimatedBackground = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let animationFrame;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    const createParticles = () => {
      const area = width * height;

      // Denser dots
      const particleCount = Math.min(
        window.innerWidth < 768 ? 110 : 240,
        Math.max(90, Math.floor(area / 6500))
      );

      particlesRef.current = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        radius: Math.random() * 1.5 + 0.9,
      }));
    };

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();

      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      createParticles();
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouseRef.current = {
        x,
        y,
        active: x >= 0 && x <= width && y >= 0 && y <= height,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      const connectDistance = window.innerWidth < 768 ? 105 : 155;
      const mouseRadius = window.innerWidth < 768 ? 90 : 135;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Cursor repulsion
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouseRadius && distance > 0) {
            const force = (mouseRadius - distance) / mouseRadius;
            const angle = Math.atan2(dy, dx);

            p.vx += Math.cos(angle) * force * 0.13;
            p.vy += Math.sin(angle) * force * 0.13;
          }
        }

        // Less friction = faster movement
        p.vx *= 0.995;
        p.vy *= 0.995;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const maxSpeed = 2.1;

        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;

        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));
      }

      // Connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectDistance) {
            const opacity = 1 - distance / connectDistance;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${opacity * 0.70})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Dots
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(37, 99, 235, 0.42)";
        ctx.fill();

        // Soft dot glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(37, 99, 235, 0.055)";
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Blurred blue glow blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[420px] h-[420px] rounded-full blur-3xl opacity-30"
          style={{
            top: "8%",
            left: "5%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.22), transparent 65%)",
            animation: "servicesBlobMoveOne 16s ease-in-out infinite alternate",
          }}
        />

        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-25"
          style={{
            top: "25%",
            right: "4%",
            background:
              "radial-gradient(circle, rgba(96,165,250,0.2), transparent 68%)",
            animation: "servicesBlobMoveTwo 19s ease-in-out infinite alternate",
          }}
        />

        <div
          className="absolute w-[360px] h-[360px] rounded-full blur-3xl opacity-20"
          style={{
            bottom: "5%",
            left: "35%",
            background:
              "radial-gradient(circle, rgba(37,99,235,0.18), transparent 70%)",
            animation:
              "servicesBlobMoveThree 22s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* Canvas particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />

      <style>
        {`
          @keyframes servicesBlobMoveOne {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            100% {
              transform: translate(80px, 45px) scale(1.12);
            }
          }

          @keyframes servicesBlobMoveTwo {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            100% {
              transform: translate(-90px, 60px) scale(1.08);
            }
          }

          @keyframes servicesBlobMoveThree {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            100% {
              transform: translate(60px, -55px) scale(1.15);
            }
          }
        `}
      </style>
    </>
  );
};

export default ServicesAnimatedBackground;

