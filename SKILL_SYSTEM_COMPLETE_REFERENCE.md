# Hunter World Skill System - Complete Technical Reference

> Last updated: Analysis of GateBattle_v7_4.js, builtin_skills.json, skill_system.txt

---

## TABLE OF CONTENTS

1. [Elements & Status Effects](#elements--status-effects)
2. [Skill Categories & Targets](#skill-categories--targets)
3. [Coefficients & Cost Formulas](#coefficients--cost-formulas)
4. [JSON Skill Structure](#json-skill-structure)
5. [Special Material Effects](#special-material-effects-debuffs)
6. [Damage Calculation](#damage-calculation)
7. [Status Effect Mechanics](#status-effect-mechanics)
8. [Stat Types & Damage Types](#stat-types--damage-types)
9. [Rarity Types](#rarity-types)
10. [Generation Guidelines](#generation-guidelines)

---

## ELEMENTS & STATUS EFFECTS

### 9 Damage Elements

```javascript
const DAMAGE_ELEMENTS = ['none', 'water', 'fire', 'ice', 'earth', 'wind', 'electric', 'dark', 'light'];
```

### 9 Status Effect Types (STATUS_KEYS)

```javascript
const STATUS_KEYS = ['stun', 'bind', 'sleep', 'poison', 'bleed', 'burn', 'curse', 'silence', 'slow'];
const STATUS_DOT_KEYS = ['poison', 'burn']; // Damage-over-time types
```

| Status Type | Korean | Duration | Default Chance | Max Stacks | Notes |
|:---|:---|:---:|:---:|:---:|---|
| `stun` | 기절 | 1턴 | 16% | - | Incapacitation; boss/elite immunity limit applies |
| `bind` | 속박 | 2턴 | 18% | - | SENSE -50%, hit -50% |
| `sleep` | 수면 | 2턴 | 16% | - | Incapacitation; breaks on hit; 5턴 immunity after |
| `poison` | 독 | 3턴 | 28% | 3 | DoT: base damage × coef × 0.2 per stack per turn |
| `bleed` | 출혈 | 3턴 | 28% | - | +30% immediate damage once; healing received -50% |
| `burn` | 화상 | 5턴 | 28% | 5 | DoT: base damage × coef × 0.12 per stack per turn; +10% damage taken |
| `curse` | 저주 | 3턴 | 24% | - | ATK reduced (10%-30% by rank); damage taken +10%-30% |
| `silence` | 침묵 | 3턴 | 20% | - | Skill use blocked; basic attack only |
| `slow` | 둔화 | 3턴 | 25% | - | Hit rate -30%, evasion rate -50% |

---

## SKILL CATEGORIES & TARGETS

### 9 Skill Categories

| Category | Target Default | Description | Has Coef | Has CC | Has Buff | Healing |
|:---|:---|:---|:---:|:---:|:---:|:---:|
| **singleAttack** | `singleEnemy` | Single target damage only | ✓ | ✗ | ✗ | ✗ |
| **aoeAttack** | `allEnemies` | Multi-target damage only | ✓ | ✗ | ✗ | ✗ |
| **singleCC** | `singleEnemy` | Single damage + CC/status | ✓ | ✓ | ✗ | ✗ |
| **aoeCC** | `allEnemies` | Multi damage + CC/status | ✓ | ✓ | ✗ | ✗ |
| **singleHeal** | `singleAlly` | Single target healing only | ✓ | ✗ | ✗ | ✓ |
| **aoeHeal** | `allAllies` | Multi-target healing (per target) | ✓ | ✗ | ✗ | ✓ |
| **buff** | `self`/`allAllies` | Stat/effect buffs; no damage | ✗ | ✗ | ✓ | ✗ |
| **utility** | varies | Special effects (resource restore, etc.) | optional | ✗ | ✗ | ✗ |
| **passive** | N/A | Always-active bonus; no action | ✗ | ✗ | ✓ | ✗ |

### Valid Target Values

**Single Targets:**
- `singleEnemy` - One enemy
- `singleAlly` - One ally
- `self` - Caster only

**Area Targets:**
- `allEnemies` - All enemies (full AOE)
- `allAllies` - All allies (full party)
- `rowFront` - Front row enemies only
- `rowMid` - Middle row enemies only
- `rowBack` - Back row enemies only
- `rowFrontMid` - Front + middle rows
- `rowMidBack` - Middle + back rows

---

## COEFFICIENTS & COST FORMULAS

### Standard Single-Target Coefficients by Rank

```
RANK  │ Min    │ Max    │ Range Width
──────┼────────┼────────┼─────────────
  E   │ 1.2    │ 1.5    │ 0.3
  D   │ 1.92   │ 2.4    │ 0.48
  C   │ 2.88   │ 3.6    │ 0.72
  B   │ 4.8    │ 6.0    │ 1.2
  A   │ 7.68   │ 9.6    │ 1.92
  S   │ 11.52  │ 14.4   │ 2.88
```

**Multiplier Pattern:** Each rank = previous × 1.6 (or ÷0.625 inverse)

### Derived Coefficient Formulas

```javascript
// AOE/Row attacks from single target:
aoeCoef = singleCoef × 0.58

// Examples for E-rank:
E_single_min = 1.2    → E_aoe_min = 1.2 × 0.58 ≈ 0.696
E_single_max = 1.5    → E_aoe_max = 1.5 × 0.58 ≈ 0.870

// CC skills (reduced to compensate for CC value):
ccCoef ≈ singleCoef × 0.8  // 20% reduction
E_cc = 0.96 to 1.2  (from 1.2-1.5 single)

// AOE CC:
aoe_cc = single_cc × 0.58
```

### Cost Ranges by Rank (Single Target)

```
RANK  │ Min Total │ Max Total │ Typical MP/SP Split
──────┼───────────┼───────────┼────────────────────
  E   │ 20        │ 30        │ 20MP+10SP
  D   │ 25        │ 35        │ 25MP or 15MP+20SP
  C   │ 30        │ 40        │ 25-30MP, 10-15SP
  B   │ 40        │ 50        │ 40-45MP, 0-10SP
  A   │ 55        │ 60        │ 50-55MP, 0-10SP
  S   │ 70        │ 80        │ 70-75MP, 0-10SP
```

---

## JSON SKILL STRUCTURE

### Minimal Attack Skill (singleAttack)

```json
{
  "id": "energyBolt",
  "name": "에너지볼트",
  "grade": "E",
  "category": "singleAttack",
  "target": "singleEnemy",
  "costs": { "mp": 30, "sp": 0 },
  "coef": 1.5,
  "statTypes": ["int"],
  "damageType": "magic",
  "element": "none",
  "desc": "기본 단일 마법 공격."
}
```

### CC Skill with Status Effect

```json
{
  "id": "shieldBash",
  "name": "실드강타",
  "grade": "E",
  "category": "singleCC",
  "target": "singleEnemy",
  "costs": { "mp": 20, "sp": 20 },
  "coef": 0.875,
  "statTypes": ["con"],
  "damageType": "physical",
  "element": "none",
  "cc": {
    "type": "stun",
    "turns": 1,
    "chance": 0.16
  },
  "desc": "단일 CC. 1턴 기절."
}
```

**Note:** 
- `chance` is optional; if omitted, uses default from STATUS_KEYS
- `turns` sets duration (typically matches default unless special effect)

### Healing Skill (singleHeal)

```json
{
  "id": "heal",
  "name": "힐",
  "grade": "D",
  "category": "singleHeal",
  "target": "singleAlly",
  "costs": { "mp": 40, "sp": 0 },
  "coef": 2.0,
  "statTypes": ["int"],
  "desc": "기본 단일 회복."
}
```

**Note:** Healing skills use `coef` but apply to healing formula (no damage type/element needed).

### AOE Healing Skill (aoeHeal)

```json
{
  "id": "smallGarden",
  "name": "작은 정원",
  "grade": "E",
  "rarity": "rare",
  "category": "aoeHeal",
  "target": "allAllies",
  "statTypes": ["int"],
  "byRank": {
    "E": { "coef": 0.875, "costs": { "mp": 30, "sp": 0 } },
    "D": { "coef": 1.4, "costs": { "mp": 35, "sp": 0 } },
    "C": { "coef": 2.1, "costs": { "mp": 40, "sp": 0 } },
    "B": { "coef": 3.5, "costs": { "mp": 50, "sp": 0 } },
    "A": { "coef": 5.6, "costs": { "mp": 65, "sp": 0 } },
    "S": { "coef": 8.4, "costs": { "mp": 90, "sp": 0 } }
  },
  "desc": "성장형 광역 회복. 각 대상에게 계수 기반 회복."
}
```

### Buff Skill (No Rarity)

```json
{
  "id": "haste",
  "name": "헤이스트",
  "grade": "D",
  "category": "buff",
  "target": "allAllies",
  "costs": { "mp": 25, "sp": 0 },
  "duration": 3,
  "statTypes": ["int", "sense"],
  "buff": {
    "stats": { "agi": 4 }
  },
  "desc": "3턴 동안 파티원 AGI +4."
}
```

**Buff Field Options (in `buff` object):**
```javascript
{
  "stats": { "str": +N, "con": +N, "int": +N, "agi": +N, "sense": +N },
  "threatBonus": +N,           // Increases threat level
  "ccImmunity": true,          // Blocks all CC for duration
  "forcedTaunt": true,         // Forces target to attack caster
  "summon": "zephyr" | "bark", // Active summon effect
  "evasionNext": 1             // Next attack 100% evasion
}
```

### Buff with CC Immunity

```json
{
  "id": "holdTheLine",
  "name": "방어선 유지",
  "grade": "D",
  "category": "buff",
  "target": "self",
  "costs": { "mp": 0, "sp": 40 },
  "duration": 3,
  "statTypes": ["con"],
  "buff": { "ccImmunity": true },
  "desc": "3턴 CC 완전 면역."
}
```

### Passive Skill (Non-Rare)

```json
{
  "id": "shieldProficiency",
  "name": "방패숙련",
  "grade": "E",
  "category": "passive",
  "statTypes": ["con"],
  "passiveMods": { "shieldSpMul": 0.9 },
  "desc": "방패 계열 SP 10% 감소."
}
```

**Available `passiveMods` Keys:**
- `shieldSpMul` - Shield equipment SP multiplier
- `daggerSpMul` - Dagger/throw SP multiplier
- `vampiricDrain` - HP drain on next attack
- `ambushEvasion` - Evasion bonus vs ambush
- `formationDmgReduce` - Front row damage reduction
- `moraleCostReduce` - SP/MP cost reduction
- `cargoCapacity` - Carrying capacity bonus
- `durabilityReduce` - Equipment durability loss reduction
- `campHealBonus` - Camp healing bonus

### Rare Skill with Rank Progression (byRank)

```json
{
  "id": "tripleShot",
  "name": "트리플샷",
  "grade": "E",
  "rarity": "rare",
  "category": "singleAttack",
  "target": "singleEnemy",
  "statTypes": ["agi"],
  "damageType": "physical",
  "element": "none",
  "byRank": {
    "E": { "coef": 1.5,  "costs": { "mp": 15, "sp": 15 } },
    "D": { "coef": 2.4,  "costs": { "mp": 15, "sp": 15 } },
    "C": { "coef": 3.6,  "costs": { "mp": 18, "sp": 18 } },
    "B": { "coef": 6.0,  "costs": { "mp": 25, "sp": 25 } },
    "A": { "coef": 9.6,  "costs": { "mp": 30, "sp": 30 } },
    "S": { "coef": 14.4, "costs": { "mp": 40, "sp": 40 } }
  },
  "desc": "성장형 3연타. 총계수만 적용."
}
```

### Rare Passive with By-Rank Bonuses

```json
{
  "id": "steelAnvil",
  "name": "강철 모루",
  "grade": "E",
  "rarity": "rare",
  "category": "passive",
  "statTypes": ["con"],
  "byRank": {
    "E": { "passiveBonuses": { "pdef": 1, "mdef": 1 } },
    "D": { "passiveBonuses": { "pdef": 3, "mdef": 3 } },
    "C": { "passiveBonuses": { "pdef": 5, "mdef": 5 } },
    "B": { "passiveBonuses": { "pdef": 7, "mdef": 7 } },
    "A": { "passiveBonuses": { "pdef": 9, "mdef": 9 } },
    "S": { "passiveBonuses": { "pdef": 11, "mdef": 11 } }
  },
  "desc": "물리방어/마법방어 증가."
}
```

**Available `passiveBonuses` Keys:**
- `str`, `con`, `int`, `agi`, `sense` - Stat bonuses
- `pdef`, `mdef` - Defense bonuses
- `atk` - Attack bonus

### Rare Buff with By-Rank

```json
{
  "id": "preciseAim",
  "name": "민첩한 조준",
  "grade": "E",
  "rarity": "rare",
  "category": "buff",
  "target": "allAllies",
  "duration": 3,
  "statTypes": ["agi", "sense"],
  "byRank": {
    "E": { "costs": { "mp": 25, "sp": 0 }, "buff": { "stats": { "agi": 2, "sense": 2 } } },
    "D": { "costs": { "mp": 30, "sp": 0 }, "buff": { "stats": { "agi": 4, "sense": 4 } } },
    "C": { "costs": { "mp": 40, "sp": 0 }, "buff": { "stats": { "agi": 6, "sense": 6 } } },
    "B": { "costs": { "mp": 50, "sp": 0 }, "buff": { "stats": { "agi": 8, "sense": 8 } } },
    "A": { "costs": { "mp": 65, "sp": 0 }, "buff": { "stats": { "agi": 10, "sense": 10 } } },
    "S": { "costs": { "mp": 85, "sp": 0 }, "buff": { "stats": { "agi": 12, "sense": 12 } } }
  },
  "desc": "성장형 광역버프. 3턴 파티원 AGI·SENSE 증가."
}
```

### Utility Skill

```json
{
  "id": "knifeRecall",
  "name": "무기회수",
  "grade": "E",
  "category": "utility",
  "target": "singleEnemy",
  "costs": { "mp": 20, "sp": 0 },
  "coef": 1.5,
  "procChance": 0.3,
  "statTypes": ["agi", "sense"],
  "damageType": "physical",
  "element": "none",
  "resourceRestore": { "sp": 10 },
  "desc": "무기회수 + 30% 확률로 x1.5 계수 공격."
}
```

**Optional Fields for Utility:**
- `procChance` (0-1) - Probability of special effect
- `resourceRestore: { sp: N, mp: N }` - Resource recovery
- `cooldown` - Turns before can use again

---

## SPECIAL MATERIAL EFFECTS (Debuffs)

### Effects Supporting `canDebuff: true`

These can be used as debuffs (opponent receives increased damage):

```javascript
const DEBUFF_CAPABLE_EFFECTS = [
  'physical_damage_up',      // +N% 받는 물리 피해
  'magic_damage_up',         // +N% 받는 마법 피해
  'fire_damage_up',          // +N% 받는 화염 피해
  'ice_damage_up',           // +N% 받는 빙결 피해
  'lightning_damage_up',     // +N% 받는 번개 피해
  'dark_damage_up',          // +N% 받는 암흑 피해
  'water_damage_up',         // +N% 받는 물 피해
  'earth_damage_up',         // +N% 받는 대지 피해
  'wind_damage_up',          // +N% 받는 바람 피해
  'light_damage_up'          // +N% 받는 빛 피해
];
```

### Buff-Only Effects (No Debuff Option)

```javascript
const BUFF_ONLY_EFFECTS = [
  'crit_chance_up',          // +N% 치확
  'crit_damage_up',          // +N% 치피
  'physical_defense_up',     // +N% 물리 방어 (self only)
  'magic_defense_up',        // +N% 마법 방어 (self only)
  'healing_up',              // +N% 회복량
  'shield_up',               // +N% 보호막 효과
  'stat_str_up',             // STR +N
  'stat_con_up',             // CON +N
  'stat_int_up',             // INT +N
  'stat_agi_up',             // AGI +N
  'stat_sense_up',           // SENSE +N
  'bleed_apply',             // 출혈 부여 +N%
  'burn_apply',              // 화상 부여 +N%
  'curse_apply'              // 저주 부여 +N%
];
```

---

## DAMAGE CALCULATION

### Base Formula

```javascript
baseDamage = (2 × mainStat) + (3 × atk)
finalDamage = baseDamage × coef × critMul × elementMul × resistMul × typeMul × incomingMul × outgoingMul
```

Where:
- **mainStat** = statTypes[0] value (e.g., INT for magic attack)
- **atk** = character's ATK stat
- **coef** = skill coefficient
- **critMul** = 1.0 (normal) or 1.5 (critical hit)
- **elementMul** = 1.25 (advantage) / 1.0 (neutral) / 0.75 (disadvantage)
- **resistMul** = target's element/type resistance
- **typeMul** = physical vs magic multiplier
- **incomingMul** = target's "받는 피해" debuff multiplier (1 + effect%)
- **outgoingMul** = caster's "피해" buff multiplier (1 + effect%)

### Healing Formula

```javascript
baseHeal = (2 × int) + (3 × atk)
finalHeal = baseHeal × coef × outgoingMul × incomingMul
```

**Special Rules:**
- Bleeding target receives 50% less healing
- Shields convert overflow healing to protection

---

## STATUS EFFECT MECHANICS

### CC Immunity Rules

**Stun & Sleep (Boss/Elite Specific):**
- Boss: max 1 turn stun, 2 turns sleep → 5턴 immunity after
- Elite: max 2 turns stun, 2 turns sleep → 5턴 immunity after
- Normal: no limit, but still 5턴 immunity after

### DoT Calculations

```javascript
// Poison (base × coef × 0.2 per stack)
poisonPerTurn = baseDamage × coef × 0.2 × stackCount
total3Turns = poisonPerTurn × 3

// Burn (base × coef × 0.12 per stack) + 10% damage taken
burnPerTurn = baseDamage × coef × 0.12 × stackCount
damageIncrease = 10% (independent of stacks)
```

### Bleed Mechanics

- **Immediate Impact:** +30% of attack damage (1x only)
- **Duration Effect:** Healing received -50% for 3 turns
- **Application:** Triggers on hit, doesn't stack

### Curse Mechanics (Rank-Based)

| Rank | ATK Reduction | Damage Taken Increase |
|:---:|:---:|:---:|
| E | 10% | 10% |
| D | 13% | 13% |
| C | 16% | 16% |
| B | 20% | 20% |
| A | 25% | 25% |
| S | 30% | 30% |

---

## STAT TYPES & DAMAGE TYPES

### Stat Types (statTypes array)

```javascript
const STAT_TYPES = ['str', 'con', 'int', 'agi', 'sense'];

// Typical by skill type:
// Physical attack: 'str', 'agi', 'con'
// Magic attack: 'int'
// Utility/Support: 'sense'
// Passive: 'con' (durability), 'sense' (crafting)
```

### Damage Types (damageType field)

```javascript
const DAMAGE_TYPES = ['physical', 'magic'];

// Physical: Affected by PDEF
// Magic: Affected by MDEF
// Healing: Not affected by defenses
```

---

## RARITY TYPES

```javascript
const RARITY_LIST = ['Normal', 'Rare', 'Unique', 'Legendary'];
```

**In Skills (rarity field):**
- `'rare'` - Growth-based skill with byRank progression
- `'unique'` - Story/special skill (e.g., fragmentOfAthena)
- `'curse'` - Cursed/special power skill (e.g., vampiricInstinct, bloodSense)

**NOT rarity field:**
- Fixed-grade skills have no `rarity` field (non-growable)

---

## GENERATION GUIDELINES

### For Creating New Attack Skills

**Single Target:**
- Coef: E(1.2-1.5), D(1.92-2.4), C(2.88-3.6), B(4.8-6.0), A(7.68-9.6), S(11.52-14.4)
- Cost: E(20-30), D(25-35), C(30-40), B(40-50), A(55-60), S(70-80)
- statTypes: 1-3 stats depending on skill

**AOE:**
- Coef: single × 0.58
- Cost: roughly single +10-20% (due to AOE complexity)

**With CC/Status:**
- Coef: single × 0.8 (20% reduction to compensate for CC value)
- Cost: single + 5-10 (CC activation cost)
- Always include `cc` or status object

### For Creating Healing Skills

**Single Target:**
- Coef: D(1.8-2.2), C(2.5-3.2), B(3.5-4.5), A(5.5-6.5), S(7.5-8.5)
- Cost: similar to attacks of same rank
- statTypes: `["int"]` typically

**AOE:**
- Coef: single × 0.8-0.9 (less penalty than damage AOE)
- Cost: +10-20% over single
- Applies full coef to each target (not split)

### For Creating Buff Skills

- No `coef` field needed
- Include `duration` (typical: 2-5 turns)
- Buff values: +2 to +12 per stat by rank
- Cost: typically 20-40 MP, 0-20 SP
- target: `"self"` or `"allAllies"` usually
- Include `statTypes` for balance context

### For Creating Passive Skills

- No costs, no duration
- Include `statTypes` for balance reference
- Use either `passiveBonuses` (stat/def increases) OR `passiveMods` (multiplier effects)
- Typical bonus: +1-6 per rank (for rare)
- Single modifier value (0.5-1.5 typically)

### For Creating Rare/Growth Skills

- Include `rarity: "rare"`
- Use `byRank` object with all 6 ranks (E,D,C,B,A,S)
- Each rank can override: `coef`, `costs`, `buff`, `passiveBonuses`
- Maintain progression curve (3:5:7:10:16:24 typical pattern)
- Example: E(1.5) → D(2.4) → C(3.6) → B(6.0) → A(9.6) → S(14.4)

### Default Status Chances (if omitted, system uses these):

```javascript
defaultChances = {
  'stun': 0.16,      // 16%
  'bind': 0.18,      // 18%
  'sleep': 0.16,     // 16%
  'poison': 0.28,    // 28%
  'bleed': 0.28,     // 28%
  'burn': 0.28,      // 28%
  'curse': 0.24,     // 24%
  'silence': 0.20,   // 20%
  'slow': 0.25       // 25%
};
```

---

## QUICK REFERENCE EXAMPLES

### Balanced E-Rank Single Attack
```json
{ "coef": 1.35, "costs": {"mp": 25, "sp": 5}, "statTypes": ["str"] }
```

### Balanced E-Rank AOE Attack  
```json
{ "coef": 0.783, "costs": {"mp": 30, "sp": 10}, "statTypes": ["int"] }
```

### Balanced E-Rank Single CC
```json
{ "coef": 0.96, "costs": {"mp": 20, "sp": 20}, "cc": {"type": "stun", "turns": 1} }
```

### Balanced D-Rank Healing
```json
{ "coef": 2.1, "costs": {"mp": 40, "sp": 0}, "statTypes": ["int"] }
```

### Balanced D-Rank Buff
```json
{ "duration": 3, "costs": {"mp": 25, "sp": 0}, "buff": {"stats": {"agi": 4}} }
```

---

**File Location:** `/home/runner/work/hunter-world/hunter-world/builtin_skills.json` (3292 lines, 80+ skills)

**Last Verified:** GateBattle_v7_4.js line 19-24 (GRADE_ORDER, DAMAGE_ELEMENTS, STATUS_KEYS, ELEMENT_CHAIN)
