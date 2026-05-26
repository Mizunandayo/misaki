'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps'

const GEO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

type Jurisdiction = {
  code: string
  label: string
  /** [longitude, latitude] in degrees. */
  coordinates: [number, number]
  /** Stagger offset (seconds) so the pulses do not fire in unison. */
  delay: number
}

const JURISDICTIONS: Jurisdiction[] = [
  { code: 'WA', label: 'Washington',     coordinates: [-122.9, 47.0], delay: 0.0 },
  { code: 'CA', label: 'California',     coordinates: [-121.5, 38.6], delay: 0.4 },
  { code: 'TX', label: 'Texas',          coordinates: [ -97.7, 30.3], delay: 0.8 },
  { code: 'NY', label: 'New York',       coordinates: [ -73.8, 42.7], delay: 1.2 },
  { code: 'UK', label: 'United Kingdom', coordinates: [  -0.1, 51.5], delay: 1.6 },
  { code: 'EU', label: 'European Union', coordinates: [   4.4, 50.8], delay: 2.0 },
]

const GEO_STYLE = {
  default: {
    fill: 'rgba(255, 255, 255, 0.03)',
    stroke: 'rgba(255, 255, 255, 0.18)',
    strokeWidth: 0.35,
    outline: 'none',
  },
  hover: {
    fill: 'rgba(255, 255, 255, 0.03)',
    stroke: 'rgba(255, 255, 255, 0.18)',
    strokeWidth: 0.35,
    outline: 'none',
  },
  pressed: {
    fill: 'rgba(255, 255, 255, 0.03)',
    stroke: 'rgba(255, 255, 255, 0.18)',
    strokeWidth: 0.35,
    outline: 'none',
  },
}

export function JurisdictionPulseMap() {
  const reduce = useReducedMotion()

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <header className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-[var(--color-paper-50)]">
          Actively monitoring{' '}
          <span className="text-[var(--color-ember-500)]">52 jurisdictions</span>
        </h2>
        <p className="mt-4 text-lg text-[var(--color-paper-200)] max-w-3xl mx-auto">
          Live Bright Data MCP calls firing every four hours. Every state
          legislature, every EU member state, every UK parliamentary session.
        </p>
      </header>

      <div className="relative aspect-[2/1] w-full rounded-2xl border border-[var(--color-ink-600)] bg-[var(--color-ink-900)] overflow-hidden">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{
            scale: 200,
            center: [-35, 45],
          }}
          width={800}
          height={400}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={GEO_STYLE}
                />
              ))
            }
          </Geographies>

          {JURISDICTIONS.map((j) => (
            <Marker key={j.code} coordinates={j.coordinates}>
              {!reduce && (
                <motion.circle
                  r={3}
                  fill="var(--color-ember-500)"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: [1, 4], opacity: [0.6, 0] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: j.delay,
                  }}
                />
              )}
              <circle
                r={3}
                fill="var(--color-ember-500)"
                stroke="var(--color-ink-950)"
                strokeWidth={1.2}
              />
              <text
                textAnchor="middle"
                y={14}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '7px',
                  fontWeight: 600,
                  fill: 'var(--color-paper-50)',
                  pointerEvents: 'none',
                }}
              >
                {j.code}
              </text>
            </Marker>
          ))}
        </ComposableMap>
      </div>
    </section>
  )
}
