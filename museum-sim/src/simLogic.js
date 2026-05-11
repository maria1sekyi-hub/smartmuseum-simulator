// simLogic.js
// Full port of sim_logic.py into JavaScript
// All simulation logic lives here — React components import and call runFullSimulation()

// -------------------------
// TECHNOLOGY DEFINITIONS
// -------------------------
export const TECHNOLOGIES = {
  interactive_display: {
    label: "Interactive Display",
    technical_complexity: 0.3,
    excludes: ["limb_dexterity", "low_vision"],
    smart_tech_quality: 0.5,
    sim_sickness_potential: 0.05,
    extractiveness: 0.2,
    capacity: 3,
    experience_type: 0.25,
    description: "Touchscreens, interactive tables, digital signage"
  },
  audio_guide: {
    label: "Audio Guide",
    technical_complexity: 0.15,
    excludes: ["deaf"],
    smart_tech_quality: 0.4,
    sim_sickness_potential: 0.0,
    extractiveness: 0.15,
    capacity: 1,
    experience_type: 0.1,
    description: "Handheld device or smartphone-based audio narration"
  },
  ar_interpretation_device: {
    label: "AR Interpretation Device",
    technical_complexity: 0.55,
    excludes: ["limb_dexterity", "low_vision"],
    smart_tech_quality: 0.6,
    sim_sickness_potential: 0.2,
    extractiveness: 0.25,
    capacity: 1,
    experience_type: 0.4,
    description: "Dedicated handheld AR scanner for artifacts"
  },
  smartphone_ar: {
    label: "Smartphone AR",
    technical_complexity: 0.45,
    excludes: ["low_vision", "limb_dexterity"],
    smart_tech_quality: 0.65,
    sim_sickness_potential: 0.4,
    extractiveness: 0.35,
    capacity: 3,
    experience_type: 0.65,
    description: "Smartphone or tablet-based AR overlay experience"
  },
  vr_experience: {
    label: "VR Experience",
    technical_complexity: 0.7,
    excludes: ["limb_dexterity", "wheelchair"],
    smart_tech_quality: 0.7,
    sim_sickness_potential: 0.85,
    extractiveness: 0.55,
    capacity: 2,
    experience_type: 0.95,
    description: "Full VR headset immersive environment"
  },
  projection_mapping: {
    label: "Projection Mapping",
    technical_complexity: 0.1,
    excludes: ["low_vision"],
    smart_tech_quality: 0.5,
    sim_sickness_potential: 0.3,
    extractiveness: 0.1,
    capacity: 25,
    experience_type: 0.8,
    description: "Large-scale environmental immersive projection"
  },
  acousto_optic_installation: {
    label: "Acousto-optic Installation",
    technical_complexity: 0.1,
    excludes: ["deaf", "wheelchair", "low_vision"],
    smart_tech_quality: 0.4,
    sim_sickness_potential: 0.5,
    extractiveness: 0.1,
    capacity: 20,
    experience_type: 0.9,
    description: "Theatrical installation with light, sound, and mechanical elements"
  },
  ai_chatbot: {
    label: "AI Chatbot",
    technical_complexity: 0.35,
    excludes: [],
    smart_tech_quality: 0.8,
    sim_sickness_potential: 0.0,
    extractiveness: 0.45,
    capacity: 1,
    experience_type: 0.3,
    description: "Conversational AI guide, kiosk or app-based"
  },
  robot_guide: {
    label: "Robot Guide",
    technical_complexity: 0.25,
    excludes: [],
    smart_tech_quality: 0.7,
    sim_sickness_potential: 0.0,
    extractiveness: 0.6,
    capacity: 5,
    experience_type: 0.35,
    description: "Physical robot that navigates and interacts with visitor groups"
  }
};

// -------------------------
// CROWD LEVELS
// -------------------------
const CROWD_LEVELS = {
  low: [1, 10],
  medium: [11, 30],
  high: [31, 60]
};

// Realistic museum attendance curve over 8 hours (10am - 6pm)
const HOURLY_CROWD_CURVE = {
  0: "low",      // 10am
  1: "low",      // 11am
  2: "medium",   // 12pm
  3: "high",     // 1pm
  4: "high",     // 2pm
  5: "medium",   // 3pm
  6: "medium",   // 4pm
  7: "low"       // 5pm
};

// -------------------------
// UTILITY
// -------------------------

// Seeded random number generator for reproducibility
// Uses a simple mulberry32 algorithm
function createRng(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0;
    s = s + 0x6d2b79f5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function randomBetween(rng, min, max) {
  return min + rng() * (max - min);
}

function randomChoice(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function randomSample(rng, arr, n) {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, n);
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// -------------------------
// VISITOR GENERATION
// -------------------------

function generateVisitor(rng) {
  // Motivation: 0 = knowledge, 1 = immersion
  const motivation = rng();

  // Tech avoidance: 0 = open to tech, 1 = strongly avoidant
  const tech_avoidance = rng();

  // Data sensitivity: 0 = unbothered, 1 = very sensitive
  const data_sensitivity = rng();

  // Sim sickness susceptibility: truly random
  const sim_sickness = rng();

  // 90% chance of having a smartphone
  const has_smartphone = rng() > 0.1;

  // 25% chance of having a disability
  let disability = null;
  if (rng() < 0.25) {
    disability = randomChoice(rng, [
      "limb_dexterity",
      "low_vision",
      "deaf",
      "wheelchair"
    ]);
  }

  return {
    motivation,
    tech_avoidance,
    data_sensitivity,
    sim_sickness,
    has_smartphone,
    disability
  };
}

function generateGroup(rng) {
  // 5% chance of field trip group of 20
  if (rng() < 0.05) {
    const visitors = [];
    for (let i = 0; i < 20; i++) {
      const v = generateVisitor(rng);
      // Field trip groups skew knowledge-motivated
      v.motivation = randomBetween(rng, 0, 0.4);
      visitors.push(v);
    }
    return visitors;
  }

  // Regular groups: 1-7 visitors, fully randomized
  const size = Math.floor(randomBetween(rng, 1, 8));
  return Array.from({ length: size }, () => generateVisitor(rng));
}

function generateVisitorPopulation(rng, crowdLevel) {
  const [min, max] = CROWD_LEVELS[crowdLevel];
  const total = Math.floor(randomBetween(rng, min, max + 1));

  const visitors = [];
  while (visitors.length < total) {
    const group = generateGroup(rng);
    visitors.push(...group);
  }

  return visitors.slice(0, total);
}

// -------------------------
// PERIL SCORING
// -------------------------

function calculatePerilScores(visitor, tech) {
  // EMOTIONAL DISRESONANCE
  const motivation_mismatch = Math.abs(visitor.motivation - tech.experience_type);
  const knowledge_dampening = 1 - (1 - visitor.motivation) * 0.4;
  const quality_penalty = 1 - tech.smart_tech_quality;

  let disresonance = (
    motivation_mismatch * 0.5 +
    quality_penalty * 0.3 +
    visitor.tech_avoidance * 0.2
  ) * knowledge_dampening;

  // COGNITIVE DISSONANCE
  const tech_savviness = 1 - visitor.tech_avoidance * 0.6;
  const complexity_gap = Math.max(0, tech.technical_complexity - tech_savviness);
  const capacity_penalty = 1 / Math.max(1, tech.capacity);
  const intelligence_gap = 1 - tech.smart_tech_quality;
  const immersion_dampening = 1 - visitor.motivation * 0.4;

  let cognitive_dissonance = (
    complexity_gap * 0.4 +
    capacity_penalty * 0.3 +
    intelligence_gap * 0.3
  ) * immersion_dampening;

  // TECHNOLOGY LOATHING
  const sim_sickness_risk = visitor.sim_sickness * tech.sim_sickness_potential;
  const data_discomfort = visitor.data_sensitivity * tech.extractiveness;
  const equipment_failure = 1 - tech.smart_tech_quality;

  let loathing = (
    sim_sickness_risk * 0.35 +
    data_discomfort * 0.35 +
    equipment_failure * 0.15 +
    visitor.tech_avoidance * 0.15
  );

  disresonance = clamp(disresonance, 0, 1);
  cognitive_dissonance = clamp(cognitive_dissonance, 0, 1);
  loathing = clamp(loathing, 0, 1);

  return {
    disresonance: Math.round(disresonance * 1000) / 1000,
    cognitive_dissonance: Math.round(cognitive_dissonance * 1000) / 1000,
    loathing: Math.round(loathing * 1000) / 1000,
    overall_peril: Math.round(
      ((disresonance + cognitive_dissonance + loathing) / 3) * 1000
    ) / 1000
  };
}

function calculateEffectiveOpportunity(visitor, techName) {
  let smartphone_penalty = 0;
  if (techName === "smartphone_ar" && !visitor.has_smartphone) {
    smartphone_penalty = 0.5;
  }
  const avoidance_reduction = visitor.tech_avoidance * 0.3;
  return clamp(1 - avoidance_reduction - smartphone_penalty, 0, 1);
}

function calculateAvoidanceCompensation(visitor, techs) {
  if (!techs || techs.length === 0) return 1.0;

  const avg_experience_type =
    techs.reduce((sum, t) => sum + t.experience_type, 0) / techs.length;
  const avg_complexity =
    techs.reduce((sum, t) => sum + t.technical_complexity, 0) / techs.length;

  const compensation =
    (1 - visitor.motivation) *
    (1 - avg_experience_type) *
    (1 - avg_complexity);

  const effective_penalty = visitor.tech_avoidance * (1 - compensation);
  return clamp(1 - effective_penalty, 0, 1);
}

function calculateTimeAtExperience(rng, visitor, techs) {
  if (!techs || techs.length === 0) {
    return Math.round(randomBetween(rng, 1, 3) * 100) / 100;
  }

  const avg_experience_type =
    techs.reduce((sum, t) => sum + t.experience_type, 0) / techs.length;

  const alignment = 1 - Math.abs(visitor.motivation - avg_experience_type);
  const base_time = 1 + alignment * 4;
  const time_spent = base_time + randomBetween(rng, -0.5, 0.5);
  return Math.round(clamp(time_spent, 1, 5) * 100) / 100;
}

// -------------------------
// MAIN SIMULATION
// -------------------------

export function runFullSimulation(
  numExperiences,
  techPerExperience,
  techRatio,
  seed = 42
) {
  const rng = createRng(seed);

  // Build experience objects
  const experiences = Array.from({ length: numExperiences }, (_, i) => {
    const techNames = techPerExperience[i] || [];
    return {
      experience_id: i,
      technology_names: techNames,
      technologies: techNames.map(name => TECHNOLOGIES[name])
    };
  });

  const simulationLog = [];

  // Track per-technology scores for summary
  const techScores = {};
  Object.values(techPerExperience).flat().forEach(name => {
    techScores[name] = [];
  });

  // Run 8-hour simulation
  for (let hour = 0; hour < 8; hour++) {
    const crowdLevel = HOURLY_CROWD_CURVE[hour];
    const visitors = generateVisitorPopulation(rng, crowdLevel);

    const hourLog = {
      hour,
      crowd_level: crowdLevel,
      total_visitors: visitors.length,
      visitor_logs: []
    };

    for (const visitor of visitors) {
      // Visitor completes 50-100% of experiences in random order
      const numToVisit = Math.max(
        1,
        Math.floor(randomBetween(rng, 0.5, 1.0) * numExperiences)
      );
      const experiencesVisited = randomSample(rng, experiences, numToVisit);

      const visitorPerilSummary = {
        disresonance: [],
        cognitive_dissonance: [],
        loathing: [],
        overall_peril: []
      };

      const expLogs = [];

      for (const exp of experiencesVisited) {
        const isTech = rng() < techRatio;

        if (!isTech) {
          expLogs.push({
            experience_id: exp.experience_id,
            type: "traditional",
            time_spent: Math.round(randomBetween(rng, 1, 3) * 100) / 100
          });
          continue;
        }

        // Filter out excluded technologies first
const accessibleTechs = exp.technology_names
  .map((name, i) => ({ name, tech: exp.technologies[i] }))
  .filter(({ tech }) => {
    if (visitor.disability && tech.excludes.includes(visitor.disability)) {
      return false;
    }
    return true;
  });

// If nothing is accessible, mark as excluded
if (accessibleTechs.length === 0) {
  expLogs.push({
    experience_id: exp.experience_id,
    type: "excluded",
    time_spent: 0
  });
  continue;
}

// Determine which technologies the visitor engages with
// 85% of the time: pick the best match based on motivation and ability
// 15% of the time: engage with all accessible technologies
let techsToScore;
if (accessibleTechs.length === 1 || rng() > 0.15) {
  // Pick best match: score each accessible tech by how well it fits the visitor
  // Lower is better — combines complexity gap and motivation mismatch
  const scored = accessibleTechs.map(({ name, tech }) => {
    const tech_savviness = 1 - visitor.tech_avoidance * 0.6;
    const complexity_fit = Math.abs(tech.technical_complexity - tech_savviness);
    const motivation_fit = Math.abs(visitor.motivation - tech.experience_type);
    const fit_score = complexity_fit * 0.5 + motivation_fit * 0.5;
    return { name, tech, fit_score };
  });
  scored.sort((a, b) => a.fit_score - b.fit_score);
  techsToScore = [scored[0]];
} else {
  // 15% - engage with all accessible technologies
  techsToScore = accessibleTechs;
}

const techPerilScores = [];
for (const { name: techName, tech } of techsToScore) {
  const effOpp = calculateEffectiveOpportunity(visitor, techName);
  const peril = calculatePerilScores(visitor, tech);

  peril.overall_peril = clamp(
    Math.round(peril.overall_peril * (1 + (1 - effOpp) * 0.3) * 1000) / 1000,
    0, 1
  );

  techPerilScores.push(peril);

  if (techScores[techName]) {
    techScores[techName].push(peril.overall_peril);
  }
}

        // Average peril across technologies in this experience
        const avgPeril = {
          disresonance: Math.round(
            techPerilScores.reduce((s, p) => s + p.disresonance, 0) /
            techPerilScores.length * 1000) / 1000,
          cognitive_dissonance: Math.round(
            techPerilScores.reduce((s, p) => s + p.cognitive_dissonance, 0) /
            techPerilScores.length * 1000) / 1000,
          loathing: Math.round(
            techPerilScores.reduce((s, p) => s + p.loathing, 0) /
            techPerilScores.length * 1000) / 1000,
          overall_peril: Math.round(
            techPerilScores.reduce((s, p) => s + p.overall_peril, 0) /
            techPerilScores.length * 1000) / 1000
        };
        const avoidanceModifier = calculateAvoidanceCompensation(
            visitor,
            exp.technologies
            );
            let timeSpent = calculateTimeAtExperience(rng, visitor, exp.technologies);
            timeSpent = clamp(timeSpent * avoidanceModifier, 1, 5);
            timeSpent = Math.round(timeSpent * 100) / 100;

        expLogs.push({
          experience_id: exp.experience_id,
          technology_names: exp.technology_nxames,
          type: "tech",
          time_spent: timeSpent,
          avoidance_modifier: Math.round(avoidanceModifier * 1000) / 1000,
          peril_scores: avgPeril
        });

        for (const key of Object.keys(visitorPerilSummary)) {
          visitorPerilSummary[key].push(avgPeril[key]);
        }
      }

      // Average visitor peril across all their experiences
      const visitorSummary = {};
      for (const key of Object.keys(visitorPerilSummary)) {
        const arr = visitorPerilSummary[key];
        visitorSummary[key] = arr.length > 0
          ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length * 1000) / 1000
          : 0;
      }

      hourLog.visitor_logs.push({
        visitor,
        experiences: expLogs,
        visitor_peril_summary: visitorSummary
      });
    }

    simulationLog.push(hourLog);
  }

  // -------------------------
  // EXHIBIT SUMMARY
  // -------------------------
  const allOverall = [];
  const allDisresonance = [];
  const allCognitive = [];
  const allLoathing = [];

  for (const hourLog of simulationLog) {
    for (const vl of hourLog.visitor_logs) {
      const s = vl.visitor_peril_summary;
      if (s.overall_peril > 0) {
        allOverall.push(s.overall_peril);
        allDisresonance.push(s.disresonance);
        allCognitive.push(s.cognitive_dissonance);
        allLoathing.push(s.loathing);
      }
    }
  }

  const avg = arr =>
    arr.length > 0
      ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length * 1000) / 1000
      : 0;

  const avgDis = avg(allDisresonance);
  const avgCog = avg(allCognitive);
  const avgLoa = avg(allLoathing);

  const dominantPeril = [
    ["disresonance", avgDis],
    ["cognitive_dissonance", avgCog],
    ["loathing", avgLoa]
  ].sort((a, b) => b[1] - a[1])[0][0];

  const techAverages = {};
  for (const [name, scores] of Object.entries(techScores)) {
    if (scores.length > 0) {
      techAverages[name] = avg(scores);
    }
  }

  const sortedTechs = Object.entries(techAverages).sort((a, b) => a[1] - b[1]);
  const bestTech = sortedTechs[0]?.[0] || null;
  const worstTech = sortedTechs[sortedTechs.length - 1]?.[0] || null;

  return {
    simulation_log: simulationLog,
    exhibit_summary: {
      avg_overall_peril: avg(allOverall),
      avg_disresonance: avgDis,
      avg_cognitive_dissonance: avgCog,
      avg_loathing: avgLoa,
      dominant_peril: dominantPeril,
      tech_averages: techAverages,
      best_performing_tech: bestTech,
      worst_performing_tech: worstTech
    }
  };
}