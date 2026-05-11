import random

def generate_visitor():
    # Motivation score on a continuous scale
    # 0 = purely knowledge/information seeking
    # 1 = purely immersion/experience seeking
    motivation = random.uniform(0, 1)
    
    # How strongly the visitor prefers to avoid technology altogether
    # Independent of knowledge/immersion preference
    # 0 = open to technology, 1 = strongly avoidant
    tech_avoidance = random.uniform(0, 1)
    
    # How sensitive the visitor is about sharing personal data
    # 0 = unbothered, 1 = very sensitive
    data_sensitivity = random.uniform(0, 1)
    
    # Susceptibility to simulator sickness from VR/AR
    # Truly random, no skew
    sim_sickness = random.uniform(0, 1)
    
    # 90% of visitors have a smartphone available
    has_smartphone = random.random() > 0.1
    
    # 25% chance of having a disability that limits tech access
    # If present, one type is randomly assigned
    disability = None
    if random.random() < 0.25:
        disability = random.choice([
            "limb_dexterity",  # affects touch/physical interaction
            "low_vision",      # affects screen/visual content
            "deaf",            # affects audio content
            "wheelchair"       # affects physical movement/access
        ])
    
    return {
        "motivation": motivation,
        "tech_avoidance": tech_avoidance,
        "data_sensitivity": data_sensitivity,
        "sim_sickness": sim_sickness,
        "has_smartphone": has_smartphone,
     
        "disability": disability
    }

def generate_group():
    group_type = random.random()
    
    if group_type < 0.05:  # 5% chance of a field trip group of 20
        size = 20
        visitors = []
        for _ in range(size):
            v = generate_visitor()
            # Field trip groups skew knowledge-motivated
            # Motivation capped at 0.4 to keep them in the knowledge half of the scale
            v["motivation"] = random.uniform(0, 0.4)
            visitors.append(v)
    else:
        # Regular groups range from 1 to 7 visitors
        # Motivations are fully randomized
        size = random.randint(1, 7)
        visitors = [generate_visitor() for _ in range(size)]
    
    return visitors

# Test output — run to verify visitor and group generation is working
group = generate_group()
print(f"Group size: {len(group)}")
for i, v in enumerate(group):
    print(f"Visitor {i+1}: {v}")

# Technology definitions
# Each technology has fixed attributes drawn from Fan et al. and Ivanov & Velkova
# technical_complexity: how hard it is for a visitor to use (0-1)
# excludes: list of disability types that cannot engage with this technology
# smart_tech_quality: accuracy and capability of the technology (0-1)
# sim_sickness_potential: likelihood of inducing simulator sickness (0-1)
# extractiveness: how identifying/invasive the data collected is (0-1)
# capacity: how many people can engage simultaneously
# experience_type: 0 = pure information, 1 = pure immersion

TECHNOLOGIES = {
    "interactive_display": {
        "technical_complexity": 0.3,
        "excludes": ["limb_dexterity", "low_vision"],
        "smart_tech_quality": 0.5,
        "sim_sickness_potential": 0.05,
        "extractiveness": 0.2,
        "capacity": 3,
        "experience_type": 0.25
    },
    "audio_guide": {
        "technical_complexity": 0.15,
        "excludes": ["deaf"],
        "smart_tech_quality": 0.4,
        "sim_sickness_potential": 0.0,
        "extractiveness": 0.15,
        "capacity": 1,
        "experience_type": 0.1
    },
    "ar_interpretation_device": {
        "technical_complexity": 0.55,
        "excludes": ["limb_dexterity", "low_vision"],
        "smart_tech_quality": 0.6,
        "sim_sickness_potential": 0.2,
        "extractiveness": 0.25,
        "capacity": 1,
        "experience_type": 0.4
    },
    "smartphone_ar": {
        "technical_complexity": 0.45,
        "excludes": ["low_vision", "limb_dexterity"],
        "smart_tech_quality": 0.65,
        "sim_sickness_potential": 0.4,
        "extractiveness": 0.35,
        "capacity": 3,
        "experience_type": 0.65
    },
    "vr_experience": {
        "technical_complexity": 0.7,
        "excludes": ["limb_dexterity", "wheelchair"],
        "smart_tech_quality": 0.7,
        "sim_sickness_potential": 0.85,
        "extractiveness": 0.55,
        "capacity": 2,
        "experience_type": 0.95
    },
    "projection_mapping": {
        "technical_complexity": 0.1,
        "excludes": ["low_vision"],
        "smart_tech_quality": 0.5,
        "sim_sickness_potential": 0.3,
        "extractiveness": 0.1,
        "capacity": 25,
        "experience_type": 0.8
    },
    "acousto_optic_installation": {
        "technical_complexity": 0.1,
        "excludes": ["deaf", "wheelchair", "low_vision"],
        "smart_tech_quality": 0.4,
        "sim_sickness_potential": 0.5,
        "extractiveness": 0.1,
        "capacity": 20,
        "experience_type": 0.9
    },
    "ai_chatbot": {
        "technical_complexity": 0.35,
        "excludes": [],
        "smart_tech_quality": 0.8,
        "sim_sickness_potential": 0.0,
        "extractiveness": 0.45,
        "capacity": 1,
        "experience_type": 0.3
    },
    "robot_guide": {
        "technical_complexity": 0.25,
        "excludes": [],
        "smart_tech_quality": 0.7,
        "sim_sickness_potential": 0.0,
        "extractiveness": 0.6,
        "capacity": 5,
        "experience_type": 0.35
    }
}

# Test — print all technology names to confirm they loaded
print("\nTechnologies loaded:")
for tech in TECHNOLOGIES:
    print(f"  - {tech}")

# Crowd level affects how many visitors are in the museum at once
# This influences whether technology capacity is exceeded
# low: 1-10 visitors, medium: 11-30, high: 31-60
CROWD_LEVELS = {
    "low": (1, 10),
    "medium": (11, 30),
    "high": (31, 60)
}

def generate_museum(num_experiences, tech_per_experience, crowd_level):
    # Generate the museum environment
    # num_experiences: how many experiences in the exhibit (1-5)
    # tech_per_experience: dict mapping experience index to list of tech names (max 2)
    # crowd_level: "low", "medium", or "high"
    
    # Generate total visitor population based on crowd level
    min_visitors, max_visitors = CROWD_LEVELS[crowd_level]
    total_visitors = random.randint(min_visitors, max_visitors)
    
    # Generate visitor groups until we hit the total visitor count
    all_visitors = []
    while len(all_visitors) < total_visitors:
        group = generate_group()
        all_visitors.extend(group)
    
    # Trim to total if we overshot
    all_visitors = all_visitors[:total_visitors]
    
    # Build experience list
    experiences = []
    for i in range(num_experiences):
        techs = tech_per_experience.get(i, [])
        experiences.append({
            "experience_id": i,
            # Technologies available in this experience (max 2)
            "technologies": [TECHNOLOGIES[t] for t in techs],
            "technology_names": techs
        })
    
    return {
        "experiences": experiences,
        "visitors": all_visitors,
        "crowd_level": crowd_level,
        "total_visitors": len(all_visitors)
    }

# Test with a simple museum setup
test_museum = generate_museum(
    num_experiences=3,
    tech_per_experience={
        0: ["interactive_display", "audio_guide"],
        1: ["vr_experience"],
        2: ["projection_mapping", "ai_chatbot"]
    },
    crowd_level="medium"
)

print(f"\nMuseum generated:")
print(f"  Total visitors: {test_museum['total_visitors']}")
print(f"  Number of experiences: {len(test_museum['experiences'])}")
for exp in test_museum['experiences']:
    print(f"  Experience {exp['experience_id']}: {exp['technology_names']}")

# Realistic museum attendance curve over 8 hours (10am - 6pm)
# Each hour is assigned a crowd level based on typical museum attendance patterns
# Museums are quiet in the morning, peak around midday, taper in the afternoon
HOURLY_CROWD_CURVE = {
    0: "low",      # 10am - quiet opening
    1: "low",      # 11am - still building
    2: "medium",   # 12pm - lunch crowd arriving
    3: "high",     # 1pm  - peak
    4: "high",     # 2pm  - peak continues
    5: "medium",   # 3pm  - starting to taper
    6: "medium",   # 4pm  - afternoon visitors
    7: "low"       # 5pm  - winding down
}

def calculate_time_at_experience(visitor, experience):
    # Base time range is 1-5 minutes
    # Alignment between visitor motivation and experience type increases dwell time
    # Perfect alignment (motivation matches experience_type) = closer to 5 min
    # Complete mismatch = closer to 1 min
    
    if not experience["technologies"]:
        # Non-tech traditional interaction, flat 1-3 minutes
        return random.uniform(1, 3)
    
    # Average experience type across technologies in this experience
    avg_experience_type = sum(
        t["experience_type"] for t in experience["technologies"]
    ) / len(experience["technologies"])
    
    # Alignment score: 1 = perfect match, 0 = complete mismatch
    alignment = 1 - abs(visitor["motivation"] - avg_experience_type)
    
    # Time scaled by alignment: 1 min minimum, 5 min maximum
    base_time = 1 + (alignment * 4)
    
    # Add small random variation
    time_spent = base_time + random.uniform(-0.5, 0.5)
    
    # Clamp to 1-5 minute range
    return max(1, min(5, time_spent))

def calculate_avoidance_compensation(visitor, experience):
    # Partial compensation for tech-avoidant visitors
    # A visitor who avoids tech can still have an acceptable experience if:
    # - They are knowledge motivated (low motivation score)
    # - The experience is information-leaning (low experience_type)
    # - The technology has low complexity
    
    if not experience["technologies"]:
        return 1.0  # No penalty for non-tech interactions
    
    avg_experience_type = sum(
        t["experience_type"] for t in experience["technologies"]
    ) / len(experience["technologies"])
    
    avg_complexity = sum(
        t["technical_complexity"] for t in experience["technologies"]
    ) / len(experience["technologies"])
    
    # Compensation factors:
    # knowledge motivation (1 - motivation = how knowledge-oriented they are)
    # information-leaning experience (1 - avg_experience_type)
    # low complexity (1 - avg_complexity)
    compensation = (
        (1 - visitor["motivation"]) *
        (1 - avg_experience_type) *
        (1 - avg_complexity)
    )
    
    # Effective avoidance penalty after compensation is applied
    # Returns a multiplier: 1.0 = no penalty, 0.0 = full avoidance penalty
    effective_penalty = visitor["tech_avoidance"] * (1 - compensation)
    return 1 - effective_penalty

def run_simulation(num_experiences, tech_per_experience, 
                   tech_ratio, seed=None):
    # tech_ratio: 0-1, proportion of tech vs traditional interactions
    # seed: optional random seed for reproducibility
    
    if seed:
        random.seed(seed)
    
    simulation_log = []
    
    for hour, crowd_level in HOURLY_CROWD_CURVE.items():
        
        # Generate visitors for this hour based on crowd level
        museum = generate_museum(num_experiences, tech_per_experience, crowd_level)
        hour_log = {
            "hour": hour,
            "crowd_level": crowd_level,
            "total_visitors": museum["total_visitors"],
            "visitor_logs": []
        }
        
        for visitor in museum["visitors"]:
            
            # Each visitor completes 50-100% of experiences in random order
            num_experiences_visited = max(
                1,
                int(random.uniform(0.5, 1.0) * num_experiences)
            )
            experiences_visited = random.sample(
                museum["experiences"],
                num_experiences_visited
            )
            
            visitor_log = {
                "visitor": visitor,
                "experiences": []
            }
            
            for experience in experiences_visited:
                
                # Determine if this is a tech or traditional interaction
                # based on tech_ratio
                is_tech = random.random() < tech_ratio
                
                if not is_tech:
                    # Traditional non-tech interaction
                    time_spent = random.uniform(1, 3)
                    visitor_log["experiences"].append({
                        "experience_id": experience["experience_id"],
                        "type": "traditional",
                        "time_spent": round(time_spent, 2)
                    })
                    continue
                
                # Check hard exclusions first
                excluded = False
                if visitor["disability"]:
                    for tech in experience["technologies"]:
                        if visitor["disability"] in tech["excludes"]:
                            excluded = True
                            break
                
                if excluded:
                    visitor_log["experiences"].append({
                        "experience_id": experience["experience_id"],
                        "type": "excluded",
                        "time_spent": 0
                    })
                    continue
                
                # Calculate time spent
                time_spent = calculate_time_at_experience(visitor, experience)
                
                # Calculate avoidance compensation modifier
                avoidance_modifier = calculate_avoidance_compensation(
                    visitor, experience
                )
                
                # Apply avoidance modifier to time spent
                # Avoidant visitors spend less time even if not excluded
                time_spent = time_spent * avoidance_modifier
                time_spent = max(1, min(5, time_spent))
                
                visitor_log["experiences"].append({
                    "experience_id": experience["experience_id"],
                    "type": "tech",
                    "time_spent": round(time_spent, 2),
                    "avoidance_modifier": round(avoidance_modifier, 2)
                })
            
            hour_log["visitor_logs"].append(visitor_log)
        
        simulation_log.append(hour_log)
    
    return simulation_log

# Test run
results = run_simulation(
    num_experiences=3,
    tech_per_experience={
        0: ["interactive_display", "audio_guide"],
        1: ["vr_experience"],
        2: ["projection_mapping", "ai_chatbot"]
    },
    tech_ratio=0.7
)

# Print summary by hour
print("\nSimulation Results:")
for hour_log in results:
    print(f"\nHour {hour_log['hour']} "
          f"({hour_log['crowd_level']} crowd) - "
          f"{hour_log['total_visitors']} visitors")
    
    total_exclusions = sum(
        1 for vl in hour_log["visitor_logs"]
        for e in vl["experiences"]
        if e["type"] == "excluded"
    )
    total_tech = sum(
        1 for vl in hour_log["visitor_logs"]
        for e in vl["experiences"]
        if e["type"] == "tech"
    )
    avg_time = 0
    if total_tech > 0:
        avg_time = sum(
            e["time_spent"] for vl in hour_log["visitor_logs"]
            for e in vl["experiences"]
            if e["type"] == "tech"
        ) / total_tech
    
    print(f"  Tech interactions: {total_tech}")
    print(f"  Exclusions: {total_exclusions}")
    print(f"  Avg time per tech interaction: {round(avg_time, 2)} min")

def calculate_peril_scores(visitor, experience, tech_name, tech):
    # Returns three peril scores for a single visitor-technology interaction
    # Each score ranges from 0 (no peril) to 1 (maximum peril)
    # Scores are independent and can co-elevate

    # -------------------------
    # EMOTIONAL DISRESONANCE
    # Triggered by: mismatch between what tech delivers emotionally
    # and what visitor expects. Dampened for knowledge-motivated visitors.
    # -------------------------
    
    # Satisfaction threshold: how well does this tech type match visitor motivation
    # Higher alignment = lower disresonance
    motivation_mismatch = abs(visitor["motivation"] - tech["experience_type"])
    
    # Knowledge-motivated visitors are less sensitive to disresonance
    # motivation closer to 0 = more knowledge-oriented = dampening applied
    knowledge_dampening = 1 - (1 - visitor["motivation"]) * 0.4
    
    # Low smart tech quality increases disresonance
    # tech feels hollow or inauthentic when it doesnt work well
    quality_penalty = 1 - tech["smart_tech_quality"]
    
    disresonance = (
        (motivation_mismatch * 0.5) +
        (quality_penalty * 0.3) +
        (visitor["tech_avoidance"] * 0.2)
    ) * knowledge_dampening
    
    # -------------------------
    # COGNITIVE DISSONANCE
    # Triggered by: tech complexity vs ability, lack of personalization
    # from shared capacity, and low smart tech quality.
    # Dampened for immersion-motivated visitors.
    # -------------------------
    
    # Tech savviness is approximated by inverse of tech_avoidance
    # More avoidant visitors tend to be less comfortable with complexity
    tech_savviness = 1 - (visitor["tech_avoidance"] * 0.6)
    complexity_gap = max(0, tech["technical_complexity"] - tech_savviness)
    
    # Shared capacity increases cognitive dissonance
    # Lower capacity = more sharing = less personalization
    capacity_penalty = 1 / max(1, tech["capacity"])
    
    # Low quality devices without intelligence trigger dissonance
    intelligence_gap = 1 - tech["smart_tech_quality"]
    
    # Immersion-motivated visitors are less sensitive to cognitive dissonance
    # motivation closer to 1 = more immersion-oriented = dampening applied
    immersion_dampening = 1 - visitor["motivation"] * 0.4
    
    cognitive_dissonance = (
        (complexity_gap * 0.4) +
        (capacity_penalty * 0.3) +
        (intelligence_gap * 0.3)
    ) * immersion_dampening
    
    # -------------------------
    # TECHNOLOGY LOATHING
    # Triggered by: sim sickness risk, data sensitivity vs extractiveness,
    # tech avoidance, and equipment quality failure.
    # All visitor types are equally sensitive to this.
    # -------------------------
    
    # Sim sickness: visitor susceptibility meets tech potential
    sim_sickness_risk = visitor["sim_sickness"] * tech["sim_sickness_potential"]
    
    # Data sensitivity mismatch
    data_discomfort = visitor["data_sensitivity"] * tech["extractiveness"]
    
    # Equipment/quality failure contribution
    equipment_failure = 1 - tech["smart_tech_quality"]
    
    # Tech avoidance contributes directly to loathing
    # No dampening - all visitors are equally sensitive
    loathing = (
        (sim_sickness_risk * 0.35) +
        (data_discomfort * 0.35) +
        (equipment_failure * 0.15) +
        (visitor["tech_avoidance"] * 0.15)
    )
    
    # Clamp all scores to 0-1 range
    disresonance = max(0, min(1, disresonance))
    cognitive_dissonance = max(0, min(1, cognitive_dissonance))
    loathing = max(0, min(1, loathing))
    
    return {
        "disresonance": round(disresonance, 3),
        "cognitive_dissonance": round(cognitive_dissonance, 3),
        "loathing": round(loathing, 3),
        # Overall peril is the average of all three
        # Higher = more perillous experience
        "overall_peril": round(
            (disresonance + cognitive_dissonance + loathing) / 3, 3
        )
    }

def calculate_effective_opportunity(visitor, tech):
    # Effective opportunity = what the museum offers filtered by visitor ability
    # Returns a 0-1 score where 1 = full access, 0 = no access
    
    # Hard exclusion already handled upstream, so if we get here
    # the visitor is not fully excluded but may still be limited
    
    # Smartphone requirement check
    smartphone_penalty = 0
    if tech == "smartphone_ar" and not visitor["has_smartphone"]:
        smartphone_penalty = 0.5
    
    # Tech avoidance reduces effective opportunity
    avoidance_reduction = visitor["tech_avoidance"] * 0.3
    
    effective_opportunity = 1 - avoidance_reduction - smartphone_penalty
    return max(0, min(1, effective_opportunity))

def score_simulation(simulation_log, tech_per_experience):
    # Walk through simulation log and attach peril scores
    # to every tech interaction
    
    scored_log = []
    
    # Track per-technology aggregate scores for best/worst analysis
    tech_scores = {tech: [] for techs in tech_per_experience.values() 
                   for tech in techs}
    
    for hour_log in simulation_log:
        scored_hour = {
            "hour": hour_log["hour"],
            "crowd_level": hour_log["crowd_level"],
            "total_visitors": hour_log["total_visitors"],
            "visitor_logs": []
        }
        
        for visitor_log in hour_log["visitor_logs"]:
            visitor = visitor_log["visitor"]
            scored_visitor = {
                "visitor": visitor,
                "experiences": [],
                # Aggregate peril scores across all this visitor's interactions
                "visitor_peril_summary": {
                    "disresonance": [],
                    "cognitive_dissonance": [],
                    "loathing": [],
                    "overall_peril": []
                }
            }
            
            for exp_log in visitor_log["experiences"]:
                
                if exp_log["type"] in ["excluded", "traditional"]:
                    # No peril scoring for excluded or traditional interactions
                    scored_visitor["experiences"].append(exp_log)
                    continue
                
                exp_id = exp_log["experience_id"]
                
                # Get the technologies in this experience
                techs_in_exp = tech_per_experience.get(exp_id, [])
                
                exp_peril_scores = []
                
                for tech_name in techs_in_exp:
                    tech = TECHNOLOGIES[tech_name]
                    
                    # Calculate effective opportunity
                    eff_opp = calculate_effective_opportunity(visitor, tech_name)
                    
                    # Calculate peril scores
                    peril = calculate_peril_scores(visitor, exp_log, tech_name, tech)
                    
                    # Effective opportunity modulates overall peril
                    # Lower opportunity = higher peril contribution
                    peril["overall_peril"] = round(
                        peril["overall_peril"] * (1 + (1 - eff_opp) * 0.3), 3
                    )
                    peril["overall_peril"] = min(1, peril["overall_peril"])
                    
                    exp_peril_scores.append(peril)
                    
                    # Log per-technology scores
                    if tech_name in tech_scores:
                        tech_scores[tech_name].append(peril["overall_peril"])
                
                # Average peril across technologies in this experience
                if exp_peril_scores:
                    avg_peril = {
                        "disresonance": round(sum(
                            p["disresonance"] for p in exp_peril_scores
                        ) / len(exp_peril_scores), 3),
                        "cognitive_dissonance": round(sum(
                            p["cognitive_dissonance"] for p in exp_peril_scores
                        ) / len(exp_peril_scores), 3),
                        "loathing": round(sum(
                            p["loathing"] for p in exp_peril_scores
                        ) / len(exp_peril_scores), 3),
                        "overall_peril": round(sum(
                            p["overall_peril"] for p in exp_peril_scores
                        ) / len(exp_peril_scores), 3)
                    }
                    
                    scored_exp = {**exp_log, "peril_scores": avg_peril}
                    scored_visitor["experiences"].append(scored_exp)
                    
                    # Add to visitor summary
                    for key in ["disresonance", "cognitive_dissonance", 
                                "loathing", "overall_peril"]:
                        scored_visitor["visitor_peril_summary"][key].append(
                            avg_peril[key]
                        )
            
            # Average visitor peril summary across all their experiences
            for key in scored_visitor["visitor_peril_summary"]:
                scores = scored_visitor["visitor_peril_summary"][key]
                scored_visitor["visitor_peril_summary"][key] = round(
                    sum(scores) / len(scores), 3
                ) if scores else 0
            
            scored_hour["visitor_logs"].append(scored_visitor)
        
        scored_log.append(scored_hour)
    
    # Build exhibit-level summary
    all_overall = []
    all_disresonance = []
    all_cognitive = []
    all_loathing = []
    
    for hour_log in scored_log:
        for vl in hour_log["visitor_logs"]:
            summary = vl["visitor_peril_summary"]
            if summary["overall_peril"] > 0:
                all_overall.append(summary["overall_peril"])
                all_disresonance.append(summary["disresonance"])
                all_cognitive.append(summary["cognitive_dissonance"])
                all_loathing.append(summary["loathing"])
    
    # Dominant peril type
    avg_dis = sum(all_disresonance) / len(all_disresonance) if all_disresonance else 0
    avg_cog = sum(all_cognitive) / len(all_cognitive) if all_cognitive else 0
    avg_loa = sum(all_loathing) / len(all_loathing) if all_loathing else 0
    
    dominant_peril = max(
        [("disresonance", avg_dis),
         ("cognitive_dissonance", avg_cog),
         ("loathing", avg_loa)],
        key=lambda x: x[1]
    )[0]
    
    # Best and worst performing technologies
    tech_averages = {
        tech: round(sum(scores) / len(scores), 3)
        for tech, scores in tech_scores.items() if scores
    }
    
    best_tech = min(tech_averages, key=tech_averages.get) if tech_averages else None
    worst_tech = max(tech_averages, key=tech_averages.get) if tech_averages else None
    
    exhibit_summary = {
        "avg_overall_peril": round(
            sum(all_overall) / len(all_overall), 3
        ) if all_overall else 0,
        "avg_disresonance": round(avg_dis, 3),
        "avg_cognitive_dissonance": round(avg_cog, 3),
        "avg_loathing": round(avg_loa, 3),
        "dominant_peril": dominant_peril,
        "tech_averages": tech_averages,
        "best_performing_tech": best_tech,
        "worst_performing_tech": worst_tech
    }
    
    return scored_log, exhibit_summary

def run_full_simulation(num_experiences, tech_per_experience, tech_ratio, seed=None):
    # Single entry point for the full simulation pipeline
    # This is what the frontend will call with user-selected parameters
    #
    # num_experiences: int 1-5
    # tech_per_experience: dict {experience_index: [tech_name, ...]} max 2 per experience
    # tech_ratio: float 0-1, proportion of tech vs traditional interactions
    # seed: optional int for reproducibility
    
    simulation_log = run_simulation(
        num_experiences=num_experiences,
        tech_per_experience=tech_per_experience,
        tech_ratio=tech_ratio,
        seed=seed
    )
    
    scored_log, exhibit_summary = score_simulation(
        simulation_log=simulation_log,
        tech_per_experience=tech_per_experience
    )
    
    return {
        "simulation_log": scored_log,
        "exhibit_summary": exhibit_summary
    }

# Test the entry point
if __name__ == "__main__":
    test_config = {
        "num_experiences": 3,
        "tech_per_experience": {
            0: ["interactive_display", "audio_guide"],
            1: ["vr_experience"],
            2: ["projection_mapping", "ai_chatbot"]
        },
        "tech_ratio": 0.7
    }
    
    result = run_full_simulation(**test_config)
    summary = result["exhibit_summary"]
    
    print("\nExhibit Summary:")
    print(f"  Average overall peril: {summary['avg_overall_peril']}")
    print(f"  Dominant peril type: {summary['dominant_peril']}")
    print(f"  Best performing tech: {summary['best_performing_tech']}")
    print(f"  Worst performing tech: {summary['worst_performing_tech']}")
    print(f"\nTechnology averages:")
    for tech, avg in summary["tech_averages"].items():
        print(f"  {tech}: {avg}")