# Skill System - Complete Documentation Index

> Generated Analysis & Reference Guide for Hunter World Skill System
> 
> Data Source: GateBattle_v7_4.js, builtin_skills.json (3292 lines)
> Last Updated: 2025-03-17

---

## 📚 DOCUMENTATION FILES

### 1. **SKILL_SYSTEM_COMPLETE_REFERENCE.md** (662 lines)
**Primary Reference Document** - Use this for generating new skills
- Elements list (9 total)
- Status effects & CC mechanics (9 types)
- Skill categories (9 types)
- Coefficient tables by rank (E-S)
- JSON structure examples for all skill types
- Damage calculation formulas
- Status effect mechanics with default chances
- Rarity types and growth progression
- **Generation Guidelines** - Step-by-step for creating skills
- Quick reference examples

**Use for:** Creating skills, understanding mechanics, balancing values

---

### 2. **SKILL_ANALYSIS_SUMMARY.txt** (395 lines)
**Technical Summary** - Quick facts and code references
- Elements breakdown
- Status effects table with mechanics
- 9 skill categories explained
- Coefficient tables (minimums verified in code)
- Cost structure ranges
- Stat types and damage types
- Special material effects (with canDebuff list)
- Skill structure - mandatory vs optional fields
- Growth skill (byRank) structure
- Passive modifiers list
- Buff field options
- Key code locations in GateBattle_v7_4.js
- Tips for new skill generation

**Use for:** Quick lookup, code references, verification

---

### 3. **skill_system.txt** (6.7 KB) - ORIGINAL DOCUMENTATION
Complete system description including:
- 22 built-in skills with full specifications
- Growth-based rare skills (tripleShot, fullArrowRecovery, etc.)
- Skill coefficient/cost reference tables
- Status effect defaults with formulas
- Passive skill specifications

**Use for:** Understanding original game design

---

### 4. **how_to_create_skills.md** (13 KB) - CREATION GUIDE
Detailed guide for creating skills with:
- Category selection guidelines
- Cost calculation formulas
- Stat type usage
- CC probability mechanics
- Status effect application
- Special effect setup
- Balance recommendations
- Example calculations

**Use for:** Learning skill creation process

---

### 5. **builtin_skills.json** (62 KB)
**Main Skill Database** - 80+ complete skills
- All built-in skills in JSON format
- Examples of every skill type and category
- All growth-based rare skills with byRank data
- Reference implementations

**Use for:** Copy structure from existing skills, see examples

---

### 6. **builtin_skills_export.json** (66 KB)
Exported version of skill database (for backup/reference)

---

## 🎯 QUICK START

### For Creating an Attack Skill:

1. Read: **SKILL_SYSTEM_COMPLETE_REFERENCE.md** → Section "JSON Skill Structure"
2. Copy template from **builtin_skills.json** (e.g., energyBolt)
3. Modify values using **SKILL_ANALYSIS_SUMMARY.txt** → Section 15 "Generation Tips"
4. Verify coefficient against **Section 4: Skill Coefficients by Rank**
5. Test balance using formulas in **Section 10: Damage Calculation**

### For Creating a Buff Skill:

1. Read: **SKILL_SYSTEM_COMPLETE_REFERENCE.md** → "Buff Skill" section
2. Copy template from **builtin_skills.json** (e.g., haste)
3. Set duration: 2-5 turns (3 is standard)
4. Set buff stats: +2 to +12 per stat
5. Set cost: 20-40 MP typical for buffs

### For Creating a Rare Growth Skill:

1. Read: **SKILL_SYSTEM_COMPLETE_REFERENCE.md** → "Rare Skill with Rank Progression"
2. Copy template with byRank from **builtin_skills.json** (e.g., tripleShot)
3. Each rank (E,D,C,B,A,S) needs: coef, costs
4. Progression pattern: 1.5-1.67x multiplier per rank
5. Include `"rarity": "rare"` field

---

## 📊 REFERENCE TABLES

### Elements (9 total)
```
none, water, fire, ice, earth, wind, electric, dark, light
```

### Status Effects (9 total) with Defaults
```
stun:16%/1턴   | bind:18%/2턴  | sleep:16%/2턴
poison:28%/3턴 | bleed:28%/3턴 | burn:28%/5턴
curse:24%/3턴  | silence:20%/3턴 | slow:25%/3턴
```

### Skill Categories (9 total)
```
singleAttack, aoeAttack, singleCC, aoeCC
singleHeal, aoeHeal, buff, utility, passive
```

### Coefficients - Single Target
```
E: 1.2~1.5    | D: 1.92~2.4    | C: 2.88~3.6
B: 4.8~6.0    | A: 7.68~9.6    | S: 11.52~14.4
```

### AOE Coefficient
```
aoe_coef = single_coef × 0.58
```

### Cost Ranges
```
E:20-30 | D:25-35 | C:30-40 | B:40-50 | A:55-60 | S:70-80
```

### Stat Types
```
str, con, int, agi, sense
```

---

## 💾 EXISTING SKILLS IN BUILTIN_SKILLS.JSON

### Attack Skills
energyBolt, energyShower, powerShot, quickShot, quickThrow, fistStrike, shieldBash, shockwave

### Healing Skills
heal, pray, divineProtection, earthHeal, smallGarden

### CC Skills
shockwave, shieldBash, shieldSmash, vitalStrike, flameWall, rootBind

### Buff Skills
haste, blessingOfLight, taunt, holdTheLine, holyProvocation, manaFocus, summonZephyr, summonBark, battleCry, spotlight, preciseAim, bodyReinforce, fightingSpiritBoost

### Passive Skills
shieldProficiency, daggerHandling, steelAnvil, hiddenMight, formationCommand, moraleManagement, exceptionalDexterity, fieldMaintenance, fieldAidSupport, materialAnalysis, bloodSense

### Rare Growth Skills (with byRank)
tripleShot, fullArrowRecovery, preciseAim, smallGarden, steelAnvil, hiddenMight, spotlight, fightingSpiritBoost, bodyReinforce, exceptionalDexterity, equipmentCraft, appraisal, potionCraft

### Utility Skills
knifeRecall, potionToss, quickRepair, battlefieldRepair, terrainShift, emergencyDodge, cargoSupport

### Advanced Skills (B-A Rank)
flameLance, meteorBarrage, manaFocus, galeStrike, charge, crushingKick, spinSweep, shadowDraw, auraSlash

---

## 🔍 KEY CODE LOCATIONS

**File:** `/home/runner/work/hunter-world/hunter-world/GateBattle_v7_4.js`

| Line | Content | Purpose |
|:---:|---------|---------|
| 19 | `GRADE_ORDER = ['E','D','C','B','A','S']` | Rank definitions |
| 22 | `DAMAGE_ELEMENTS = [...]` | 9 elements list |
| 23 | `STATUS_KEYS = [...]` | 9 status types |
| 25 | `ELEMENT_CHAIN = [...]` | Element chain |
| 56-81 | `SPECIAL_MATERIAL_EFFECTS = [...]` | Debuff types |
| 1449 | `BUILTIN_SKILLS = {}` | Skill registry (empty) |
| 11908-11909 | `const singleCoefs = {...}` | Coefficient table |

---

## ⚖️ BALANCING FORMULAS

### Damage Formula
```
baseDamage = (2 × mainStat) + (3 × atk)
finalDamage = baseDamage × coef × critMul × elementMul × resistMul × typeMul × incomingMul × outgoingMul
```

### Healing Formula
```
baseHeal = (2 × int) + (3 × atk)
finalHeal = baseHeal × coef × outgoingMul × incomingMul
```

### DoT Formulas
```
poison = baseDamage × coef × 0.2 × stacks (per turn, max 3 stacks)
burn = baseDamage × coef × 0.12 × stacks (per turn, max 5 stacks)
```

### Bleed Formula
```
immediate = attack_damage × 0.30 (1 time only)
healing_reduction = -50% (3 turns)
```

---

## ✅ VERIFICATION CHECKLIST

When creating a new skill:

- [ ] ID is unique (camelCase, not in builtin_skills.json)
- [ ] Name is in Korean
- [ ] Grade is one of: E, D, C, B, A, S
- [ ] Category is one of 9 valid categories
- [ ] Target is valid (singleEnemy, allEnemies, etc.)
- [ ] Cost structure is { "mp": N, "sp": N }
- [ ] Coefficient matches rank table (or is reasonable)
- [ ] StatTypes array is valid (1-3 stats typically)
- [ ] Damage type is "physical" or "magic" (if applicable)
- [ ] Element is from 9-element list (or "none")
- [ ] Description is in Korean
- [ ] If CC skill: includes cc field with type/turns
- [ ] If Buff skill: includes duration + buff object
- [ ] If Passive: includes passiveBonuses OR passiveMods
- [ ] If Rare: includes rarity:"rare" + byRank with all 6 grades
- [ ] Balancing: coefficient/cost match guidelines
- [ ] No syntax errors in JSON

---

## 📖 WHERE TO FIND SPECIFIC INFO

| Need | File | Section |
|:---|:---|:---|
| Coefficient value for E-rank attack | SKILL_SYSTEM_COMPLETE_REFERENCE.md | Section 4 |
| Default stun chance | SKILL_ANALYSIS_SUMMARY.txt | Section 2 |
| How to structure a buff skill | SKILL_SYSTEM_COMPLETE_REFERENCE.md | "Buff Skill" |
| Example of rare growth skill | builtin_skills.json | tripleShot |
| Damage calculation formula | SKILL_SYSTEM_COMPLETE_REFERENCE.md | Section 6 |
| Status effect mechanics | SKILL_ANALYSIS_SUMMARY.txt | Section 2 |
| Cost ranges by rank | SKILL_ANALYSIS_SUMMARY.txt | Section 5 |
| All valid target types | SKILL_SYSTEM_COMPLETE_REFERENCE.md | Section 2 |
| Passive modifier options | SKILL_ANALYSIS_SUMMARY.txt | Section 11 |
| Generation tips | SKILL_SYSTEM_COMPLETE_REFERENCE.md | Section 11 |
| Original game design | skill_system.txt | Entire file |
| Step-by-step creation | how_to_create_skills.md | Entire file |

---

## 🎓 LEARNING PATH

### Beginner (Understanding the System)
1. Read: **SKILL_ANALYSIS_SUMMARY.txt** → Full file (15 min)
2. Review: **builtin_skills.json** → Skim 5-10 examples (10 min)
3. Read: **skill_system.txt** → Section on skill categories (10 min)

### Intermediate (Creating Simple Skills)
1. Read: **SKILL_SYSTEM_COMPLETE_REFERENCE.md** → Sections 3-5 (20 min)
2. Copy: Example from **builtin_skills.json** → energyBolt
3. Modify: All values, verify against coefficient table (15 min)
4. Test: Run through damage formula manually (10 min)

### Advanced (Creating Complex Skills)
1. Read: **SKILL_SYSTEM_COMPLETE_REFERENCE.md** → All sections (45 min)
2. Study: Rare skills in **builtin_skills.json** with byRank structure (15 min)
3. Create: Full rare growth skill from scratch (30 min)
4. Verify: All 6 ranks, balancing, edge cases (20 min)

---

## 🚀 NEXT STEPS

1. **Understand**: Read SKILL_SYSTEM_COMPLETE_REFERENCE.md completely
2. **Explore**: Browse builtin_skills.json for examples
3. **Create**: Pick a simple skill type (e.g., single attack)
4. **Generate**: Use the coefficient tables and formulas
5. **Verify**: Check against balancing guidelines
6. **Test**: Run through damage calculations
7. **Iterate**: Refine based on game balance needs

---

## 📝 NOTES

- All coefficients are for single-target unless otherwise specified
- AOE = 58% of single-target damage (fixed multiplier)
- CC skills are 80% of pure attack coefficient (20% penalty)
- Rare skills use `byRank` with all 6 grades
- Status effect chances are defaults when not specified
- Healing is affected by outgoing multipliers (buffs)
- Bleed reduces healing by 50% (doesn't stack)
- Boss/Elite CC has special immunity rules (5턴 immunity after)

---

Generated: 2025-03-17 | System: Hunter World (GateBattle v7.7.0) | Skills: 80+
