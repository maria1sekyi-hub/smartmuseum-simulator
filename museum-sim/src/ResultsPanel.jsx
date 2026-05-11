function perilLabel(score) {
  if (score < 0.25) return { text: 'Thriving', color: '#16A34A' };
  if (score < 0.40) return { text: 'Mostly Positive', color: '#65A30D' };
  if (score < 0.55) return { text: 'Mixed', color: '#D97706' };
  if (score < 0.70) return { text: 'Concerning', color: '#EA580C' };
  return { text: 'Perilous', color: '#DC2626' };
}

const PERIL_KEYS = ['disresonance', 'cognitive_dissonance', 'loathing'];

const PERIL_NAMES = {
  disresonance: 'Emotional Disresonance',
  cognitive_dissonance: 'Cognitive Dissonance',
  loathing: 'Technology Loathing'
};

export default function ResultsPanel({ results, currentHour, isComplete }) {
  const hourLog = results.simulation_log[currentHour];
  const summary = results.exhibit_summary;

  const hourStats = hourLog
    ? hourLog.visitor_logs.reduce(
        (acc, vl) => {
          for (const e of vl.experiences) {
            if (e.type === 'tech') acc.tech++;
            else if (e.type === 'traditional') acc.traditional++;
            else if (e.type === 'excluded') acc.excluded++;
          }
          return acc;
        },
        { tech: 0, traditional: 0, excluded: 0 }
      )
    : null;

  const label = perilLabel(summary.avg_overall_peril);

  return (
    <div className="results-panel">
      {/* Hour progress */}
      <div className="hour-bar">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className={`hour-pip ${i <= currentHour ? 'active' : ''} ${i === currentHour ? 'current' : ''}`}
            title={`${10 + i}:00`}
          />
        ))}
        <span className="hour-label">
          Hour {currentHour + 1} of 8 —{' '}
          {10 + currentHour}:00
          {hourLog ? ` — ${hourLog.crowd_level} crowd` : ''}
        </span>
      </div>

      {/* Current hour stats */}
      {hourStats && (
        <div className="hour-stats">
          <div className="stat-chip">
            <span className="stat-n">{hourLog.total_visitors}</span>
            <span className="stat-l">visitors</span>
          </div>
          <div className="stat-chip">
            <span className="stat-n">{hourStats.tech}</span>
            <span className="stat-l">tech interactions</span>
          </div>
          <div className="stat-chip">
            <span className="stat-n">{hourStats.traditional}</span>
            <span className="stat-l">traditional</span>
          </div>
          <div className="stat-chip warn">
            <span className="stat-n">{hourStats.excluded}</span>
            <span className="stat-l">excluded</span>
          </div>
        </div>
      )}

      <div className="summary-section">
        {/* Overall peril */}
        <div className="overall-peril">
          <div className="peril-score-display">
            <span className="peril-number" style={{ color: label.color }}>
              {summary.avg_overall_peril.toFixed(2)}
            </span>
            <span className="peril-verdict" style={{ color: label.color }}>
              {label.text}
            </span>
          </div>
          <div className="peril-bar-container">
            <div
              className="peril-bar-fill"
              style={{ width: `${summary.avg_overall_peril * 100}%` }}
            />
          </div>
          <div className="peril-bar-labels">
            <span>Thriving</span>
            <span>Perilous</span>
          </div>
        </div>

        {/* Three peril types */}
        <div className="peril-types">
          {PERIL_KEYS.map(key => {
            const score = summary[`avg_${key}`];
            const isDominant = summary.dominant_peril === key;
            return (
              <div
                key={key}
                className={`peril-type-card ${isDominant ? 'dominant' : ''}`}
              >
                <div className="ptc-label">{PERIL_NAMES[key]}</div>
                <div className="ptc-score">{score?.toFixed(3)}</div>
                {isDominant && (
                  <div className="dominant-badge">Most common</div>
                )}
                <div className="ptc-bar">
                  <div
                    className="ptc-fill"
                    style={{ width: `${(score || 0) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {isComplete && (
  <>
    <div className="section-divider">
      <span>Exhibit Totals</span>
    </div>
    <div className="hour-stats">
      <div className="stat-chip">
        <span className="stat-n">
          {results.simulation_log.reduce(
            (acc, h) => acc + h.total_visitors, 0
          )}
        </span>
        <span className="stat-l">total visitors</span>
      </div>
      <div className="stat-chip warn">
        <span className="stat-n">
          {results.simulation_log.reduce(
            (acc, h) =>
              acc +
              h.visitor_logs.reduce(
                (a, vl) =>
                  a + vl.experiences.filter(e => e.type === 'excluded').length,
                0
              ),
            0
          )}
        </span>
        <span className="stat-l">total exclusions</span>
      </div>
    </div>
  </>
)}
        {/* Tech performance — shown after simulation completes */}
        {isComplete && Object.keys(summary.tech_averages).length > 0 && (
          <>
            <div className="section-divider">
              <span>Technology Performance</span>
            </div>
            <div className="tech-performance">
              {Object.entries(summary.tech_averages)
                .sort((a, b) => a[1] - b[1])
                .map(([techName, score]) => {
                  const isBest = techName === summary.best_performing_tech;
                  const isWorst = techName === summary.worst_performing_tech;
                  const lbl = perilLabel(score);
                  return (
                    <div key={techName} className="tech-perf-row">
                      <span className="tech-perf-name">
                        {isBest && <span className="best-badge">↑</span>}
                        {isWorst && <span className="worst-badge">↓</span>}
                        {techName.replace(/_/g, ' ')}
                      </span>
                      <div className="tech-perf-bar">
                        <div
                          className="tech-perf-fill"
                          style={{
                            width: `${score * 100}%`,
                            background: lbl.color
                          }}
                        />
                      </div>
                      <span
                        className="tech-perf-score"
                        style={{ color: lbl.color }}
                      >
                        {score.toFixed(3)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}