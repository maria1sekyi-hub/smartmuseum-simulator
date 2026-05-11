import { useState, useEffect, useRef } from 'react';
import { runFullSimulation } from './simLogic.js';
import SimControls from './SimControls.jsx';
import MuseumViz from './MuseumViz.jsx';
import ResultsPanel from './ResultsPanel.jsx';
import './App.css';

const DEFAULT_CONFIG = {
  numExperiences: 3,
  techPerExperience: {
    0: ['interactive_display', 'audio_guide'],
    1: ['vr_experience'],
    2: ['projection_mapping', 'ai_chatbot']
  },
  techRatio: 0.7
};

export default function App() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [results, setResults] = useState(null);
  const [currentHour, setCurrentHour] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef(null);

  const handleRun = () => {
    clearInterval(intervalRef.current);
    const simResults = runFullSimulation(
      config.numExperiences,
      config.techPerExperience,
      config.techRatio,
      Date.now()
    );
    setResults(simResults);
    setCurrentHour(0);
    setIsComplete(false);
    setIsRunning(true);
  };

  useEffect(() => {
    if (!isRunning || !results) return;
    intervalRef.current = setInterval(() => {
      setCurrentHour(prev => {
        if (prev >= 7) {
          setIsRunning(false);
          setIsComplete(true);
          clearInterval(intervalRef.current);
          return 7;
        }
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, results]);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Smart Museum Simulator</h1>
        <p className="app-subtitle">
          Model visitor experience and technology peril across exhibit configurations
        </p>
      </header>
      <main className="app-main">
        <aside className="controls-panel">
          <SimControls
            config={config}
            onChange={setConfig}
            onRun={handleRun}
            isRunning={isRunning}
          />
        </aside>
        <section className="content-panel">
          <MuseumViz
            results={results}
            currentHour={currentHour}
            numExperiences={config.numExperiences}
            techPerExperience={config.techPerExperience}
            isRunning={isRunning || isComplete}
          />
          {results && (
            <ResultsPanel
              results={results}
              currentHour={currentHour}
              isComplete={isComplete}
            />
          )}
        </section>
      </main>
    </div>
  );
}