import { useMemo, useEffect, useState } from 'react';
import { TECHNOLOGIES } from './simLogic.js';

const SVG_W = 620;
const SVG_H = 300;

const ROOM_LAYOUTS = {
  1: [{ x: 265, y: 100, w: 90, h: 70 }],
  2: [
    { x: 160, y: 100, w: 90, h: 70 },
    { x: 370, y: 100, w: 90, h: 70 }
  ],
  3: [
    { x: 80, y: 100, w: 90, h: 70 },
    { x: 265, y: 100, w: 90, h: 70 },
    { x: 450, y: 100, w: 90, h: 70 }
  ],
  4: [
    { x: 160, y: 55, w: 90, h: 70 },
    { x: 370, y: 55, w: 90, h: 70 },
    { x: 160, y: 175, w: 90, h: 70 },
    { x: 370, y: 175, w: 90, h: 70 }
  ],
  5: [
    { x: 80, y: 55, w: 90, h: 70 },
    { x: 265, y: 55, w: 90, h: 70 },
    { x: 450, y: 55, w: 90, h: 70 },
    { x: 175, y: 175, w: 90, h: 70 },
    { x: 355, y: 175, w: 90, h: 70 }
  ]
};

function lerpColor(c1, c2, t) {
  const parse = c => [
    parseInt(c.slice(1, 3), 16),
    parseInt(c.slice(3, 5), 16),
    parseInt(c.slice(5, 7), 16)
  ];
  const [r1, g1, b1] = parse(c1);
  const [r2, g2, b2] = parse(c2);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

function perilToColor(score) {
  if (score <= 0) return '#C4BDB4';
  if (score < 0.5) return lerpColor('#16A34A', '#D97706', score * 2);
  return lerpColor('#D97706', '#DC2626', (score - 0.5) * 2);
}

function seededRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

export default function MuseumViz({
  results, currentHour, numExperiences, techPerExperience, isRunning
}) {
  const rooms = ROOM_LAYOUTS[numExperiences] || ROOM_LAYOUTS[3];

  // Base positions computed once per hour
  const basePositions = useMemo(() => {
    if (!results) return [];
    const hourLog = results.simulation_log[currentHour];
    if (!hourLog) return [];
    const rng = seededRng(currentHour * 99991);
    return hourLog.visitor_logs.map(vl => {
      const peril = vl.visitor_peril_summary.overall_peril;
      const accessedIds = vl.experiences
        .filter(e => e.type !== 'excluded' && e.experience_id < rooms.length)
        .map(e => e.experience_id);
      if (accessedIds.length === 0) {
        return {
          baseX: 290 + (rng() - 0.5) * 100,
          baseY: 272 + (rng() - 0.5) * 10,
          peril: 0, excluded: true
        };
      }
      const roomId = accessedIds[Math.floor(rng() * accessedIds.length)];
      const room = rooms[roomId];
      if (!room) return null;
      return {
        baseX: room.x + 8 + rng() * (room.w - 16),
        baseY: room.y + 8 + rng() * (room.h - 16),
        peril, excluded: false
      };
    }).filter(Boolean);
  }, [results, currentHour, rooms]);

  // Jitter for gentle movement
  const [jitter, setJitter] = useState([]);
  useEffect(() => {
    if (!isRunning || basePositions.length === 0) return;
    setJitter(basePositions.map(() => ({ dx: 0, dy: 0 })));
    const id = setInterval(() => {
      setJitter(basePositions.map(() => ({
        dx: (Math.random() - 0.5) * 5,
        dy: (Math.random() - 0.5) * 5
      })));
    }, 700);
    return () => clearInterval(id);
  }, [isRunning, basePositions]);

  const dots = basePositions.map((d, i) => ({
    x: d.baseX + (jitter[i]?.dx || 0),
    y: d.baseY + (jitter[i]?.dy || 0),
    peril: d.peril,
    excluded: d.excluded
  }));

  const hourLog = results?.simulation_log[currentHour];
  const hourLabel = `${10 + currentHour}:00`;

  return (
    <div className="museum-viz">
      <div className="viz-header">
        <span className="viz-title">Exhibit Floor</span>
        {results && (
          <span className="viz-time">
            {hourLabel} —{' '}
            <span className="crowd-badge">{hourLog?.crowd_level}</span> crowd
            {' '}— {dots.length} visitors
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="museum-svg"
        style={{ height: 300 }}
      >
        {/* Museum outline */}
        <rect
          x="10" y="10" width={SVG_W - 20} height={SVG_H - 40}
          fill="#FDFCF9" stroke="#C4BDB4" strokeWidth="1.5"
          strokeDasharray="6 3" rx="4"
        />

        {/* Entrance gap */}
        <line
          x1={SVG_W / 2 - 25} y1={SVG_H - 30}
          x2={SVG_W / 2 + 25} y2={SVG_H - 30}
          stroke="#FDFCF9" strokeWidth="3"
        />
        <text
          x={SVG_W / 2} y={SVG_H - 8}
          textAnchor="middle" fill="#C4BDB4"
          fontSize="9" fontFamily="'DM Mono', monospace"
          letterSpacing="0.1em"
        >
          ENTRANCE
        </text>

        {/* Rooms */}
        {rooms.map((room, i) => {
          const techNames = techPerExperience[i] || [];
          return (
            <g key={i}>
              <rect
                x={room.x} y={room.y}
                width={room.w} height={room.h}
                fill="#F0EDE6" stroke="#C4BDB4"
                strokeWidth="1" rx="2"
              />
              <text
                x={room.x + room.w / 2}
                y={room.y - 7}
                textAnchor="middle"
                fill="#A8A29E" fontSize="9"
                fontFamily="'DM Mono', monospace"
                letterSpacing="0.05em"
              >
                EXP {i + 1}
              </text>
              {techNames.map((tn, ti) => (
                <text
                  key={ti}
                  x={room.x + room.w / 2}
                  y={
                    room.y + room.h / 2 +
                    (ti * 13) -
                    ((techNames.length - 1) * 6.5)
                  }
                  textAnchor="middle"
                  fill="#B8B0A6" fontSize="7"
                  fontFamily="'DM Mono', monospace"
                >
                  {TECHNOLOGIES[tn]?.label || tn}
                </text>
              ))}
            </g>
          );
        })}

        {/* Visitor dots */}
        {dots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={dot.excluded ? 2.5 : 4}
            fill={perilToColor(dot.peril)}
            opacity={dot.excluded ? 0.4 : 0.82}
            style={{ transition: 'cx 0.6s ease, cy 0.6s ease' }}
          />
        ))}
      </svg>

      <div className="viz-legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#16A34A' }} />
          Low peril
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#D97706' }} />
          Medium
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#DC2626' }} />
          High peril
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#C4BDB4' }} />
          Excluded
        </span>
      </div>
    </div>
  );
}