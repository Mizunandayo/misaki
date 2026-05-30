"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "#problem",      label: "Problem" },
  { href: "#workflow",     label: "Workflow" },
  { href: "#features",     label: "Features" },
  { href: "#scanner",      label: "Scanner" },
  { href: "#demo",         label: "Demo" },
  { href: "#aiml",         label: "AI/ML API" },
  { href: "#architecture", label: "Architecture" },
  { href: "#stack",        label: "Stack" },
  { href: "#why",          label: "Why Misaki" },
  { href: "#market",       label: "Market" },
  { href: "#revenue",      label: "Revenue" },
  { href: "#roadmap",      label: "Roadmap" },
];

function ArrowIcon() {
  return (
    <span
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "rgba(0,0,0,0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 13L13 3M13 3H7M13 3v6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function MisakiNav() {
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll-based active detection — works on ANY element type (section, div, etc.)
  // Picks the last section whose top edge has crossed 40% down the viewport.
  // This correctly handles tall sections (scanner, demo) without jumping ahead.
  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1));

    function update() {
      const trigger = window.innerHeight * 0.40;
      let best = "";

      // Iterate in document order; keep updating `best` for every section whose
      // top is above the trigger line. The last one wins = currently active.
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const { top } = el.getBoundingClientRect();
        if (top <= trigger) {
          best = id;
        }
      }

      // Nothing crossed the trigger yet — highlight the first visible section
      if (!best) {
        for (const id of ids) {
          const el = document.getElementById(id);
          if (!el) continue;
          const { bottom } = el.getBoundingClientRect();
          if (bottom > 0) {
            best = id;
            break;
          }
        }
      }

      setActive((prev) => (prev === best ? prev : best));
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Auto-scroll the link strip so the active pill is visible
  useEffect(() => {
    const strip = scrollRef.current;
    if (!strip || !active) return;
    const pill = strip.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!pill) return;
    const { left: pLeft, width: pWidth } = pill.getBoundingClientRect();
    const { left: sLeft, width: sWidth } = strip.getBoundingClientRect();
    const target = strip.scrollLeft + pLeft - sLeft - sWidth / 2 + pWidth / 2;
    strip.scrollTo({ left: target, behavior: "smooth" });
  }, [active]);

  function scrollTo(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <nav
        className="nav-glass fixed top-5 left-1/2 z-50"
        style={{
          transform: "translateX(-50%)",
          borderRadius: 999,
          padding: "0 6px",
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: 2,
          border: "1px solid rgba(163,163,163,0.26)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.4)",
          // On mobile/tablet: fill most of the viewport width; on desktop: natural width
          width: "min(calc(100vw - 32px), max-content)",
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        {/* Brand */}
        <a
          href="#hero"
          onClick={(e) => scrollTo(e, "#hero")}
          className="flex shrink-0 cursor-pointer items-center gap-2 px-4 no-underline"
          style={{
            fontWeight: 700,
            fontSize: "0.84rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: "0.96rem", letterSpacing: "-0.01em" }}>見先</span>
          <span className="hidden sm:inline">MISAKI</span>
        </a>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 20,
            background: "rgba(255,255,255,0.10)",
            flexShrink: 0,
            margin: "0 4px",
          }}
        />

        {/* Link strip — scrollable on mobile, flex on desktop */}
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: 2,
            flex: 1,
            overflowX: "auto",
            scrollbarWidth: "none",   // Firefox
            msOverflowStyle: "none",  // IE/Edge
          }}
          // Hide WebKit scrollbar via inline style (can't use className without global CSS)
        >
          {LINKS.map(({ href, label }) => {
            const id = href.slice(1);
            const isActive = active === id;
            return (
              <a
                key={href}
                href={href}
                data-id={id}
                onClick={(e) => scrollTo(e, href)}
                className="cursor-pointer no-underline"
                style={{
                  fontSize: "0.84rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.50)",
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: isActive ? "rgba(161,161,170,0.22)" : "transparent",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 200ms cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                {label}
              </a>
            );
          })}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 20,
            background: "rgba(255,255,255,0.10)",
            flexShrink: 0,
            margin: "0 4px",
          }}
        />

        {/* Dashboard CTA */}
        <Link
          href="/dashboard"
          className="flex shrink-0 cursor-pointer items-center gap-2 no-underline"
          style={{
            background: "#ffffff",
            color: "#050505",
            fontSize: "0.78rem",
            fontWeight: 700,
            padding: "8px 18px",
            borderRadius: 999,
            whiteSpace: "nowrap",
            transition: "opacity 150ms",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.86")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
        >
          <span className="hidden sm:inline">Open Dashboard</span>
          <span className="sm:hidden">Dashboard</span>
          <ArrowIcon />
        </Link>
      </nav>

      {/* Suppress WebKit scrollbar on the link strip */}
      <style>{`
        .nav-glass div::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
