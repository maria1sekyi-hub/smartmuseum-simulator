import { useState } from 'react';
import { TECHNOLOGIES } from './simLogic.js';

const TECH_NAMES = Object.keys(TECHNOLOGIES);

function TechAttributes({ techName }) {
  if (!techName) return null;
  const tech = TECHNOLOGIES[techName];
  return (
    <div className="tech-attrs">
      <p className="tech-desc">{tech.description}</p>
      <div className="attr-grid">
        <div className="attr-item">
          <span className="attr-label">Complexity</span>
          <div className="attr-bar">
            <div className="attr-fill" style={{ width: `${tech.technical_complexity * 100}%` }} />
          </div>
        </div>
        <div className="attr-item">
          <span className="attr-label">Immersion</span>
          <div className="attr-bar">
            <div className="attr-fill" style={{ width: `${tech.experience_type * 100}%` }} />
          </div>
        </div>
        <div className="attr-item">
          <span className="attr-label">Sim Sickness</span>
          <div className="attr-bar">
            <div className="attr-fill danger" style={{ width: `${tech.sim_sickness_potential * 100}%` }} />
          </div>
        </div>
        <div className="attr-item">
          <span className="attr-label">Data Extractive</span>
          <div className="attr-bar">
            <div className="attr-fill danger" style={{ width: `${tech.extractiveness * 100}%` }} />
          </div>
        </div>
        <div className="attr-item">
          <span className="attr-label">Capacity</span>
          <span className="attr-value">
            {tech.capacity} {tech.capacity === 1 ? 'person' : 'people'}
          </span>
        </div>
        {tech.excludes.length > 0 && (
          <div className="attr-item full">
            <span className="attr-label">Excludes</span>
            <span className="attr-tags">
              {tech.excludes.map(e => (
                <span key={e} className="attr-tag">{e.replace(/_/g, ' ')}</span>
              ))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ExperienceSlot({ expIndex, techs, onChange }) {
  const [activeSlot, setActiveSlot] = useState(null);

  const handleChange = (slotIndex, value) => {
    const updated = [...techs];
    if (value) {
      updated[slotIndex] = value;
    } else {
      updated.splice(slotIndex, 1);
    }
    onChange(updated.filter(Boolean));
    setActiveSlot(value ? slotIndex : null);
  };

  return (
    <div className="experience-slot">
      <div className="exp-label">Experience {expIndex + 1}</div>
      {[0, 1].map(slotIndex => (
        <div key={slotIndex} className="tech-slot">
          <select
            className="tech-select"
            value={techs[slotIndex] || ''}
            onChange={e => handleChange(slotIndex, e.target.value)}
            onClick={() => setActiveSlot(techs[slotIndex] ? slotIndex : null)}
          >
            <option value="">
              — {slotIndex === 0 ? 'Primary' : 'Secondary (optional)'} —
            </option>
            {TECH_NAMES.map(name => (
              <option key={name} value={name}>
                {TECHNOLOGIES[name].label}
              </option>
            ))}
          </select>
          {activeSlot === slotIndex && techs[slotIndex] && (
            <TechAttributes techName={techs[slotIndex]} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function SimControls({ config, onChange, onRun, isRunning }) {
  const handleNumExperiences = delta => {
    const newNum = Math.max(1, Math.min(5, config.numExperiences + delta));
    const newTechPer = { ...config.techPerExperience };
    for (let i = newNum; i < 5; i++) delete newTechPer[i];
    onChange({ ...config, numExperiences: newNum, techPerExperience: newTechPer });
  };

  const handleTechChange = (expIndex, techs) => {
    onChange({
      ...config,
      techPerExperience: { ...config.techPerExperience, [expIndex]: techs }
    });
  };

  return (
    <div className="sim-controls">
      <div className="controls-section">
        <div className="section-label">Exhibit Setup</div>
        <div className="control-row">
          <span className="control-label">Experiences</span>
          <div className="stepper">
            <button
              onClick={() => handleNumExperiences(-1)}
              disabled={config.numExperiences <= 1}
            >−</button>
            <span>{config.numExperiences}</span>
            <button
              onClick={() => handleNumExperiences(1)}
              disabled={config.numExperiences >= 5}
            >+</button>
          </div>
        </div>
      </div>

      <div className="controls-section experiences-list">
        {Array.from({ length: config.numExperiences }, (_, i) => (
          <ExperienceSlot
            key={i}
            expIndex={i}
            techs={config.techPerExperience[i] || []}
            onChange={techs => handleTechChange(i, techs)}
          />
        ))}
      </div>

      <div className="controls-section">
        <div className="section-label">Interaction Ratio</div>
        <div className="ratio-control">
          <span className="ratio-label-sm">Traditional</span>
          <input
            type="range"
            min="0" max="1" step="0.05"
            value={config.techRatio}
            onChange={e => onChange({ ...config, techRatio: parseFloat(e.target.value) })}
            className="ratio-slider"
          />
          <span className="ratio-label-sm">Technology</span>
        </div>
        <div className="ratio-value">
          {Math.round(config.techRatio * 100)}% tech interactions
        </div>
      </div>

      <button
        className="run-button"
        onClick={onRun}
        disabled={isRunning}
      >
        {isRunning ? 'Simulating...' : 'Run Simulation'}
      </button>
    </div>
  );
}