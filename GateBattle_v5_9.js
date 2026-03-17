//@name Gate Battle Prototype v2.2
//@display-name ⚔️ 게이트 전투 프로토타입 v2.2 (로그/채굴/야영/인벤개선)
//@api 3.0
//@version 2.2.0
//@author OpenAI
//@arg gate_v21_db string "" "v2.1 DB 저장"
//@arg gate_v21_state string "" "v2.1 UI/전투 상태 저장"

(async () => {
try {
  const PLUGIN_NAME = '[Gate Battle Prototype v2.2.0]';
  const UI_ID = 'gate-battle-v22-root';
  const STYLE_ID = 'gate-battle-v22-style';
  const KEY_DB = 'GateBattleV21::db';
  const KEY_STATE = 'GateBattleV21::state';
  const KEY_VISIBLE = 'GateBattleV21::visible';
  const MAX_PARTY = 8;
  const MAX_ENEMIES = 10;
  const GRADE_ORDER = ['E','D','C','B','A','S'];
  // 등급별 주스탯 상한선
  const STAT_CAP_BY_RANK = { E:25, D:40, C:60, B:80, A:100, S:150 };
  const DAMAGE_ELEMENTS = ['none', 'water', 'fire', 'ice', 'earth', 'wind', 'electric', 'dark', 'light'];
  const STATUS_KEYS = ['stun', 'bind', 'sleep', 'poison', 'bleed', 'burn', 'curse', 'silence', 'slow'];
  const STATUS_DOT_KEYS = ['poison', 'burn'];
  const ELEMENT_CHAIN = ['dark', 'light', 'ice', 'fire', 'water', 'earth', 'wind', 'electric'];

const ELEMENTS = DAMAGE_ELEMENTS;
const SPECIES_LABELS = { undead:'언데드', ghost:'고스트', beast:'야수', plant:'식물', slime:'슬라임', construct:'구조체', elemental:'정령', demon:'악마', frost:'빙정', celestial:'천사체' };
const SPECIES_KEY_BY_LABEL = Object.fromEntries(Object.entries(SPECIES_LABELS).map(([k,v]) => [v, k]));
const PICKAXE_WEIGHT_G = 2500;
const EQUIP_WEIGHT_G = { weapon:1000, subweapon:1000, armor:1000, accessory:200 };
const GATE_SIZE_META = {
  small:{ key:'small', label:'소형', nodes:[7,10], normal:[20,25], elite:[1,1], boss:[1,1], veins:[0,2], previewNormal:[4,5], previewElite:[0,1], previewBossChance:0.02, options:4 },
  medium:{ key:'medium', label:'중형', nodes:[11,15], normal:[50,60], elite:[2,3], boss:[1,1], veins:[1,3], previewNormal:[5,7], previewElite:[1,1], previewBossChance:0.05, options:4 },
  large:{ key:'large', label:'대형', nodes:[18,23], normal:[100,125], elite:[4,6], boss:[1,2], veins:[2,5], previewNormal:[6,8], previewElite:[1,2], previewBossChance:0.1, options:4 }
};
const GATE_SIZE_WEIGHTS = [['small',55],['medium',35],['large',10]];
const GATE_RANK_WEIGHTS = {
  small:[['E',50],['D',26],['C',13],['B',5],['A',3],['S',3]],
  medium:[['E',5],['D',30],['C',33],['B',18],['A',9],['S',5]],
  large:[['E',2],['D',5],['C',25],['B',30],['A',24],['S',14]]
};
const GATE_SPECIES_COMPAT = {
  undead:['ghost','elemental','demon'],
  ghost:['undead','elemental','demon','celestial'],
  beast:['elemental','plant'],
  plant:['slime','elemental','beast'],
  slime:['plant','elemental'],
  construct:['elemental','frost'],
  elemental:['construct','beast','plant','slime','ghost','undead','demon','frost','celestial'],
  demon:['undead','ghost','elemental'],
  frost:['elemental','construct'],
  celestial:['elemental','ghost']
};
const GATE_NAME_PARTS = {
  undead:{ adjectives:['썩은','장송의','침잠한','무너진','흑빛의'], places:['골목','묘역','회랑','납골당','안치소'] },
  ghost:{ adjectives:['울부짖는','희미한','찢어진','속삭이는','식어붙은'], places:['골목','영안실','장막','회랑','빈터'] },
  beast:{ adjectives:['포효하는','사나운','피비린내 나는','굶주린','거친'], places:['수렵장','초원','폐허','능선','사냥터'] },
  plant:{ adjectives:['뒤틀린','뿌리내린','가시돋친','포자 낀','메마른'], places:['온실','정원','수림','회랑','습지'] },
  slime:{ adjectives:['끈적한','젖은','출렁이는','탁한','미끌거리는'], places:['수로','늪지','웅덩이','습지','저수실'] },
  construct:{ adjectives:['과충전된','녹슨','경보 울리는','비정상 가동의','벼락 새긴'], places:['송전실','정거장','격납고','기계묘지','철탑군'] },
  elemental:{ adjectives:['갈라진','타오르는','서리 맺힌','범람하는','번쩍이는'], places:['균열','핵심부','심장부','파편역','층계'] },
  demon:{ adjectives:['타락한','암흑의','불타는','저주받은','사악한'], places:['화염구','지옥문','마계','암흑사원','불의제단'] },
  frost:{ adjectives:['얼어붙은','냉혹한','동결된','서리내린','극한의'], places:['빙궁','동토','설산','빙하','냉기굴'] },
  celestial:{ adjectives:['성스러운','빛나는','정화의','축복받은','신성한'], places:['신전','광명탑','성역','천상문','빛의성소'] }
};
const GATE_COMBO_PLACES = {
  'ghost+undead':['썩은 골목','영곡 회랑','침잠한 안치소','묘역 틈새'],
  'plant+slime':['잠긴 온실','수액 정원','포자 습지','출렁이는 화단'],
  'construct+elemental':['깨진 송전소','과부하 격납고','벼락 파편역','방전 심장부'],
  'beast+elemental':['울부짖는 초원','폭풍 수렵장','갈라진 능선','재해 사냥터'],
  'beast+plant':['가시 수렵장','피비린내 나는 수림','뒤틀린 초원','뿌리 돋은 사냥터'],
  'elemental+ghost':['얼어붙은 예배당','비명 핵심부','그림자 파편역','서리 장막'],
  'elemental+slime':['범람하는 수로','청람의 습지','미끌거리는 균열','출렁이는 핵실'],
  'demon+undead':['타락한 묘역','지옥의 안치소','불타는 골목','암흑 납골당'],
  'demon+ghost':['사악한 장막','불타는 영안실','저주의 회랑','암흑 빈터'],
  'demon+elemental':['불타는 핵심부','마염의 균열','타락한 심장부','화염 파편역'],
  'elemental+frost':['서리 균열','냉기 핵심부','동결된 파편역','빙하 심장부'],
  'construct+frost':['얼어붙은 격납고','냉기 송전실','동결 기계묘지','서리 철탑군'],
  'celestial+elemental':['빛나는 균열','성광 핵심부','신성한 파편역','축복의 심장부'],
  'celestial+ghost':['정화의 장막','빛의 영안실','성스러운 회랑','신성한 빈터']
};
const ROOM_UNIT_LIMITS = { small:[3,5], medium:[4,7], large:[6,10] };
const GATE_STAGE_TEMPLATES = {
  small:[
    { kind:'room', type:'passage' },
    { kind:'room', type:'combat' },
    { kind:'choice', options:['combat','puzzle','trap'] },
    { kind:'room', type:'combat' },
    { kind:'room', type:'combat' },
    { kind:'room', type:'elite' },
    { kind:'room', type:'combat' },
    { kind:'room', type:'boss' }
  ],
  medium:[
    { kind:'room', type:'passage' },
    { kind:'room', type:'combat' },
    { kind:'room', type:'combat' },
    { kind:'choice', options:['elite','puzzle'] },
    { kind:'room', type:'combat' },
    { kind:'room', type:'camp' },
    { kind:'room', type:'elite' },
    { kind:'room', type:'combat' },
    { kind:'choice', options:['elite','trap','puzzle'] },
    { kind:'room', type:'combat' },
    { kind:'room', type:'elite' },
    { kind:'room', type:'combat' },
    { kind:'room', type:'combat' },
    { kind:'room', type:'boss' }
  ],
  large:[
    { kind:'room', type:'passage' },
    { kind:'room', type:'combat' },
    { kind:'room', type:'combat' },
    { kind:'choice', options:['elite','puzzle'] },
    { kind:'room', type:'combat' },
    { kind:'room', type:'elite' },
    { kind:'room', type:'combat' },
    { kind:'room', type:'camp' },
    { kind:'choice', options:['elite','trap','puzzle'] },
    { kind:'room', type:'combat' },
    { kind:'room', type:'combat' },
    { kind:'room', type:'elite' },
    { kind:'room', type:'combat' },
    { kind:'choice', options:['elite','combat','puzzle'] },
    { kind:'room', type:'combat' },
    { kind:'room', type:'elite' },
    { kind:'room', type:'combat' },
    { kind:'room', type:'combat' },
    { kind:'room', type:'passage' },
    { kind:'room', type:'boss' }
  ]
};
const GATE_SECRET_DISCOVER_CHANCE = 0.30;
const GATE_PUZZLE_ELITE_REWARD_CHANCE = 0.50;
const RARE_TRAIT_LABELS = {
  // ── snake_case IDs (재료 JSON 기준 35개) ──────────────────────────────
  physical_damage:'물리 피해 증가', magic_damage:'마법 피해 증가',
  fire_damage:'불 속성 피해 증가', water_damage:'물 속성 피해 증가',
  ice_damage:'얼음 속성 피해 증가', earth_damage:'대지 속성 피해 증가',
  wind_damage:'바람 속성 피해 증가', lightning_damage:'전기 속성 피해 증가',
  light_damage:'빛 속성 피해 증가', dark_damage:'어둠 속성 피해 증가',
  crit_chance:'치명타 확률 증가', crit_damage:'치명타 피해 증가',
  physical_defense:'물리피해감소 증가', magic_defense:'마법피해감소 증가',
  fire_resist:'불 속성 저항', water_resist:'물 속성 저항',
  ice_resist:'얼음 속성 저항', earth_resist:'대지 속성 저항',
  wind_resist:'바람 속성 저항', lightning_resist:'전기 속성 저항',
  light_resist:'빛 속성 저항', dark_resist:'어둠 속성 저항',
  poison_apply:'독 부여 확률 증가', bleed_apply:'출혈 부여 확률 증가',
  burn_apply:'화상 부여 확률 증가', curse_apply:'저주 부여 확률 증가',
  poison_resist:'독 저항', bleed_resist:'출혈 저항',
  burn_resist:'화상 저항', curse_resist:'저주 저항',
  healing_done:'치유량 증가', healing_received:'받는 치유량 증가',
  shield_effect:'보호막 효과 증가',
  threat_up:'위협 수치 증가', threat_down:'위협 수치 감소',
  // ── 구버전 camelCase 패밀리 (하위 호환) ─────────────────────────────
  physicalDamage:'물리 피해 증가', magicDamage:'마법 피해 증가',
  elementalDamage:'속성 피해 증가', physicalDefense:'물리피해감소 증가',
  magicDefense:'마법피해감소 증가', elementalDefense:'속성 저항',
  increasedHealing:'치유 증가',
};
const MANA_STONE_LABELS = { E:'최하급 마정석', D:'하급 마정석', C:'중급 마정석', B:'중상급 마정석', A:'상급 마정석', S:'최상급 마정석' };
// Settlement price tables ─────────────────────────────────────────────────────
// 마정석: 1% 순도당 원화 가치
const MANA_STONE_WON_PER_PCT = { E:1000, D:6000, C:60000, B:900000, A:25000000, S:1000000000 };
// 일반재료 가격 범위 — 랜덤 설정
const NORMAL_MATERIAL_WON_RANGE = { E:[2000,4000], D:[10000,20000], C:[100000,200000], B:[1500000,3000000], A:[40000000,80000000], S:[1750000000,3250000000] };
function normalMaterialBaseWon(rank) { const r = String(rank||'E').toUpperCase(); const range = NORMAL_MATERIAL_WON_RANGE[r] || NORMAL_MATERIAL_WON_RANGE.E; return randInt(range[0], range[1]); }
const NORMAL_MATERIAL_BASE_WON = { E:3000, D:15000, C:150000, B:2250000, A:60000000, S:2500000000 }; // legacy fallback
// 희귀재료 등급·티어별 기준가 (JSON suggestedPrice를 런타임에 덮어씀)
// E:6.25만~18.75만 / D:37.5만~112.5만 / C:375만~1,125만 / B:5,500만~1.7억 / A:13.75억~45억 / S:62.5억~1,875억
const RARE_PRICE_BY_RANK_TIER = {
  E: { tier1:187500,        tier2:150000,        tier3:100000,        tier4:62500        },
  D: { tier1:1125000,       tier2:900000,        tier3:600000,        tier4:375000       },
  C: { tier1:11250000,      tier2:9000000,       tier3:6000000,       tier4:3750000      },
  B: { tier1:170000000,     tier2:130000000,     tier3:85000000,      tier4:55000000     },
  A: { tier1:4500000000,    tier2:3500000000,    tier3:2250000000,    tier4:1375000000   },
  S: { tier1:187500000000,  tier2:100000000000,  tier3:37500000000,   tier4:6250000000   },
};
// fallback (tier3 중앙값)
const RARE_MATERIAL_BASE_WON = { E:100000, D:600000, C:6000000, B:85000000, A:2250000000, S:37500000000 };
// 세금 및 수수료 (협회 정산 기준)
const ASSOC_TAX_RATE      = 0.033; // 원천세 3.3%
const ASSOC_FEE_RATE      = 0.017; // 협회 수수료 1.7%
const ASSOC_TOTAL_RATE    = ASSOC_TAX_RATE + ASSOC_FEE_RATE; // 5.0%
const GUILD_TAX_RATE      = 0.033; // 원천세 3.3% (길드가 법인세로 대신 납부)
// 장비 바이아웃 비율
const GEAR_BUYOUT_ASSOC   = 0.85;
const GEAR_BUYOUT_GUILD   = 0.90;
// 월 소득세 구간 (누진공제 포함)
const MONTHLY_INCOME_TAX_BRACKETS = [
  { limit: 1000000,    rate: 0.06,  deduction: 0         },
  { limit: 4000000,    rate: 0.15,  deduction: 90000     },
  { limit: 7500000,    rate: 0.24,  deduction: 450000    },
  { limit: 12500000,   rate: 0.35,  deduction: 1275000   },
  { limit: 25000000,   rate: 0.38,  deduction: 1650000   },
  { limit: 42000000,   rate: 0.40,  deduction: 2150000   },
  { limit: 85000000,   rate: 0.42,  deduction: 2990000   },
  { limit: Infinity,   rate: 0.45,  deduction: 5540000   },
];

// ── EXP / Level System ────────────────────────────────────────────────────────
// EXP needed to reach next level: (level^2 * 10) + 100
const EXP_BASE_BY_RANK = { E:2, D:10, C:40, B:120, A:250, S:400 };
// Elite: ×20~40, Boss: ×100~200 (random roll applied per kill)
const EXP_KIND_MULT_RANGE = {
  Normal:  [1,  1  ],
  Elite:   [20, 40 ],
  Boss:    [100,200],
};
const EXP_MAX_LEVEL = 120;
const MAX_LEVEL_BY_RANK = { E:15, D:25, C:40, B:60, A:80, S:120 };

// ── Equipment System ──────────────────────────────────────────────────────────
// Equipment part types
const EQUIP_PARTS = ['weapon','subweapon','armor','accessory'];
const ALL_EQUIP_SLOTS = ['weapon','subweapon','armor','accessory','bag'];
const EQUIP_PART_LABELS = { weapon:'무기', subweapon:'보조무기', armor:'방어구', accessory:'악세서리', bag:'가방' };

// Base price range [min, max] by rank at +0 (₩)
const EQUIP_PRICE_RANGE = {
  E: [250000,    750000     ],
  D: [1500000,   4500000    ],
  C: [15000000,  45000000   ],
  B: [225000000, 675000000  ],
  A: [5500000000,18000000000],
  S: [250000000000, 750000000000],
};
// Price order multiplier by part (weapon > armor > subweapon > accessory)
const EQUIP_PART_PRICE_MUL = { weapon:1.0, armor:0.75, subweapon:0.55, accessory:0.40 };
// Skill book: ×5 equipment price
const SKILL_BOOK_PRICE_MUL = 5;

// Max enhancement by part
const EQUIP_MAX_ENHANCE = { weapon:5, subweapon:0, armor:5, accessory:5 };
// Enhancement ATK bonus per level by rank (weapons)
const WEAPON_ENHANCE_ATK = { E:1, D:1, C:2, B:3, A:4, S:5 };
// Base weapon ATK by rank
const WEAPON_BASE_ATK = { E:5, D:15, C:25, B:45, A:70, S:100 };
// Armor base stats (main stat per enhance, armor 물리방어/마법방어 range, resistance → 물리피해감소/마법피해감소)
const ARMOR_STAT_BY_RANK = {
  E: { totalStatSum:0,  defRange:[0,5],   resistance:1, enhanceStat:1 },
  D: { totalStatSum:2,  defRange:[0,15],  resistance:2, enhanceStat:2 },
  C: { totalStatSum:5,  defRange:[0,40],  resistance:3, enhanceStat:3 },
  B: { totalStatSum:8,  defRange:[0,75],  resistance:5, enhanceStat:4 },
  A: { totalStatSum:11, defRange:[0,100], resistance:7, enhanceStat:5 },
  S: { totalStatSum:16, defRange:[0,200], resistance:10,enhanceStat:6 },
};
// Accessory base stats by rank
const ACCESSORY_STAT_BY_RANK = {
  E: { totalStatSum:0,   traits:1, enhanceStat:1 },
  D: { totalStatSum:1,   traits:1, enhanceStat:2 },
  C: { totalStatSum:3,   traits:1, enhanceStat:3 },
  B: { totalStatSum:5,   traits:1, enhanceStat:4 },
  A: { totalStatSum:8,   traits:1, enhanceStat:5 },
  S: { totalStatSum:12,  traits:1, enhanceStat:6 },
};
// Shield: 물리방어 = half armor value; ATK = -(물리방어/2)
const SUBWEAPON_DEF_RATIO = 0.5;
// Max infusion by part
const EQUIP_MAX_INFUSE = { weapon:2, subweapon:2, armor:2, accessory:1 };

// Repair fee base price per 1% durability lost (₩) — Weapon is ×2
const REPAIR_FEE_BASE = { E:0, D:10000, C:100000, B:1000000, A:20000000, S:750000000 };

// ── 대장간 강화 시스템 ──────────────────────────────────────────────────────────
// 강화 재료: 같은 등급 마정석 순도 80~100%
// 순도별 성공률 (80%→70%, 85%→77.5%, 90%→85%, 95%→90%, 100%→95%)
// 수수료: 마정석 시세 × 25%
function calcForgeSuccessRate(purity) {
  const p = Math.max(80, Math.min(100, Number(purity || 80)));
  // 선형 보간: purity 80→70%, 90→85%, 100→95%
  // 80~90 구간: 70~85 (slope: 1.5%/%purity), 90~100 구간: 85~95 (slope: 1.0%/%purity)
  if (p <= 90) return (70 + (p - 80) * 1.5) / 100;
  return (85 + (p - 90) * 1.0) / 100;
}
function calcForgeFee(rank, purity) {
  const wonPerPct = MANA_STONE_WON_PER_PCT[rank] || MANA_STONE_WON_PER_PCT.E;
  const stoneValue = wonPerPct * Number(purity || 80);
  return Math.round(stoneValue * 0.25);
}
function calcForgeEnhancedUsedPrice(basePrice, enhance, part, rank) {
  // 강화된 장비의 중고 판매가:
  // 강화 보정된 기준가에서 "사용된 강화 장비" 할인 (최대내구도 99, 현재내구도 99 가정 → ~68.6%)
  const enhanced = calcEquipEnhancedPrice(basePrice, enhance, rank || 'E');
  return Math.round(enhanced * calcUsedEquipConditionMul(99, 99));
}

// Trait types for equipment (all 35 rare material trait IDs, snake_case)
const EQUIP_TRAIT_TYPES = [
  // 공격
  'physical_damage','magic_damage',
  'fire_damage','water_damage','ice_damage','earth_damage',
  'wind_damage','lightning_damage','light_damage','dark_damage',
  'crit_chance','crit_damage',
  // 방어
  'physical_defense','magic_defense',
  'fire_resist','water_resist','ice_resist','earth_resist',
  'wind_resist','lightning_resist','light_resist','dark_resist',
  // 상태이상 부여
  'poison_apply','bleed_apply','burn_apply','curse_apply',
  // 상태이상 저항
  'poison_resist','bleed_resist','burn_resist','curse_resist',
  // 지원
  'healing_done','healing_received','shield_effect','threat_up','threat_down',
];
const EQUIP_TRAIT_LABELS = {
  // snake_case (35개 전체)
  physical_damage:'물리 피해 증가', magic_damage:'마법 피해 증가',
  fire_damage:'불 속성 피해 증가', water_damage:'물 속성 피해 증가',
  ice_damage:'얼음 속성 피해 증가', earth_damage:'대지 속성 피해 증가',
  wind_damage:'바람 속성 피해 증가', lightning_damage:'전기 속성 피해 증가',
  light_damage:'빛 속성 피해 증가', dark_damage:'어둠 속성 피해 증가',
  crit_chance:'치명타 확률 증가', crit_damage:'치명타 피해 증가',
  physical_defense:'물리피해감소 증가', magic_defense:'마법피해감소 증가',
  fire_resist:'불 속성 저항', water_resist:'물 속성 저항',
  ice_resist:'얼음 속성 저항', earth_resist:'대지 속성 저항',
  wind_resist:'바람 속성 저항', lightning_resist:'전기 속성 저항',
  light_resist:'빛 속성 저항', dark_resist:'어둠 속성 저항',
  poison_apply:'독 부여 확률 증가', bleed_apply:'출혈 부여 확률 증가',
  burn_apply:'화상 부여 확률 증가', curse_apply:'저주 부여 확률 증가',
  poison_resist:'독 저항', bleed_resist:'출혈 저항',
  burn_resist:'화상 저항', curse_resist:'저주 저항',
  healing_done:'치유량 증가', healing_received:'받는 치유량 증가',
  shield_effect:'보호막 효과 증가',
  threat_up:'위협 수치 증가', threat_down:'위협 수치 감소',
  // 구버전 camelCase (하위 호환)
  physicalDamage:'물리 피해', magicDamage:'마법 피해', elementalDamage:'속성 피해',
  physicalDefense:'물리피해감소', magicDefense:'마법피해감소', elementalDefense:'속성 저항',
  increasedHealing:'치유 증가'
};
// Trait effect % by rank — fallback for legacy camelCase traits not in the pack
const EQUIP_TRAIT_EFFECT_PCT = {
  E: 3, D: 5, C: 8, B: 12, A: 18, S: 25
};
// Helper: get trait display string with % effect for a given rank.
// Uses per-scale values from DEFAULT_RARE_MATERIAL_PACK when available (snake_case IDs),
// falls back to flat EQUIP_TRAIT_EFFECT_PCT for legacy camelCase traits.
function equipTraitDisplay(traitId, rank) {
  const label = EQUIP_TRAIT_LABELS[traitId] || traitId;
  // Try pack scale values (snake_case IDs)
  const traitDef = (DEFAULT_RARE_MATERIAL_PACK.traits || []).find(t => t.id === traitId);
  if (traitDef && traitDef.scale) {
    const scaleTable = (DEFAULT_RARE_MATERIAL_PACK.valueScales || {})[traitDef.scale];
    const val = scaleTable && scaleTable[String(rank || 'E').toUpperCase()];
    if (val != null) return `${label} +${val}%`;
  }
  // Fallback for camelCase legacy traits
  const pct = EQUIP_TRAIT_EFFECT_PCT[rank] || 0;
  return pct > 0 ? `${label} +${pct}%` : label;
}

// Helper: calculate auto base price for an equipment entry
function calcEquipBasePrice(rank, part) {
  const range = EQUIP_PRICE_RANGE[rank] || EQUIP_PRICE_RANGE.E;
  const mid = Math.round((range[0] + range[1]) / 2);
  const mul = EQUIP_PART_PRICE_MUL[part] || 0.7;
  return Math.round(mid * mul);
}
// Helper: calculate enhanced item market price (new item sold at auction)
// formula: basePrice + enhance × (same-rank 100%-purity mana stone price × 1.30)
function calcEquipEnhancedPrice(basePrice, enhance, rank) {
  if (enhance <= 0) return basePrice;
  const wonPerPct = MANA_STONE_WON_PER_PCT[String(rank || 'E').toUpperCase()] || MANA_STONE_WON_PER_PCT.E;
  const stone100 = wonPerPct * 100; // value of a 100%-purity stone
  return Math.round(basePrice + enhance * stone100 * 1.30);
}
// Helper: used-equipment price multiplier based on maxDurability and current durability.
// maxDur=100(or 초기) → base 70%, maxDur=80(최저) → base 50%, 그 사이는 선형 보간.
// 그 기본 배율에서 현재내구도 비율(dur/maxDur)에 따라 최대 ×0 ~ ×1 범위로 추가 할인.
// 결과: conditionMul ∈ [~0.17, 0.70]
function calcUsedEquipConditionMul(dur, maxDur) {
  const md = Math.max(EQUIP_MAX_DURABILITY_FLOOR, Math.min(100, Number(maxDur ?? 100)));
  // base 배율: maxDur 100→0.70, maxDur 80→0.50 (선형)
  const baseMul = 0.50 + (md - EQUIP_MAX_DURABILITY_FLOOR) / (100 - EQUIP_MAX_DURABILITY_FLOOR) * 0.20;
  // 현재내구도 비율 (0~1)
  const durRatio = md > 0 ? Math.max(0, Math.min(1, Number(dur ?? md) / md)) : 0;
  // durRatio에 따라 base의 60%~100% 사이에서 최종 결정 (완파 시 40% 추가 할인)
  return baseMul * (0.60 + durRatio * 0.40);
}
// Helper: repair fee for a given % durability loss (maxDurability cap applies)
function calcRepairFee(rank, part, lostPct) {
  const base = REPAIR_FEE_BASE[rank] || 0;
  const mul = part === 'weapon' ? 2 : 1;
  return Math.round(base * mul * Math.max(0, lostPct));
}
// Max durability constants
const EQUIP_MAX_DURABILITY_FLOOR = 80; // minimum max durability after many repairs
const EQUIP_MAX_DURABILITY_START = 100;
// Helper: apply "first equip" maxDurability decay (100→99)
function applyFirstEquip(item) {
  if (!item) return item;
  if (item.maxDurability == null) item.maxDurability = EQUIP_MAX_DURABILITY_START;
  if (!item.isUsed) { item.isUsed = true; item.maxDurability = Math.max(EQUIP_MAX_DURABILITY_FLOOR, item.maxDurability - 1); }
  return item;
}
// Helper: apply repair (decrement maxDurability, restore durability to target)
function applyRepair(item, targetDurability) {
  if (!item) return item;
  if (item.maxDurability == null) item.maxDurability = EQUIP_MAX_DURABILITY_START;
  // Each repair reduces max durability by 1 (min 80)
  item.maxDurability = Math.max(EQUIP_MAX_DURABILITY_FLOOR, item.maxDurability - 1);
  item.isUsed = true;
  item.durability = Math.min(item.maxDurability, Math.max(0, Number(targetDurability || item.maxDurability)));
  return item;
}

// Helper: calculate sell price for an inventory item (used in settlement calculator)
// isGuild = true for guild settlement, false for association
function calcInventorySellPrice(it, isGuild) {
  if (!it) return 0;
  if (it.category === 'equipment') {
    const b = Number(it.price || calcEquipBasePrice(it.rank||'E', it.part||'weapon'));
    return Math.floor((it.enhance > 0 ? calcEquipEnhancedPrice(b, it.enhance, it.rank||'E') : b) * (isGuild ? GEAR_BUYOUT_GUILD : GEAR_BUYOUT_ASSOC));
  }
  if (it.category === 'rareMaterial') {
    const r = (it.rank||'E').toUpperCase();
    return (Number(it.suggestedPrice||0) || RARE_MATERIAL_BASE_WON[r] || RARE_MATERIAL_BASE_WON.E) * Number(it.count||1);
  }
  if (it.category === 'manaStone') {
    // rank is it.rank; purity % is stored in it.note (set by manaStoneBucketToInventoryItems)
    const r = (it.rank||'E').toUpperCase();
    const purity = parseInt(it.note||'0', 10);
    return (MANA_STONE_WON_PER_PCT[r] || MANA_STONE_WON_PER_PCT.E) * purity * Number(it.count||1);
  }
  // normalMaterial and everything else
  const r = (it.rank||'E').toUpperCase();
  return (Number(it.suggestedPrice||0) || NORMAL_MATERIAL_BASE_WON[r] || NORMAL_MATERIAL_BASE_WON.E) * Number(it.count||1);
}

const PARTY_BAGS = {
  none:  { id:'none',  name:'가방 없음',         rank:'',  slotBonus:0,  weightMul:1.00, maxWeightBonusG:0 },
  bag_E: { id:'bag_E', name:'E급 기본가방',       rank:'E', slotBonus:8,  weightMul:1.00, maxWeightBonusG:7000 },
  bag_D: { id:'bag_D', name:'D급 멀티백',         rank:'D', slotBonus:12, weightMul:0.95, maxWeightBonusG:10000 },
  bag_C: { id:'bag_C', name:'C급 마정백팩',       rank:'C', slotBonus:16, weightMul:0.90, maxWeightBonusG:15000 },
  bag_B: { id:'bag_B', name:'B급 원정필드백',     rank:'B', slotBonus:20, weightMul:0.85, maxWeightBonusG:20000 },
  bag_A: { id:'bag_A', name:'A급 게이트백팩',     rank:'A', slotBonus:24, weightMul:0.80, maxWeightBonusG:25000 },
  bag_S: { id:'bag_S', name:'S급 마정공간백팩',   rank:'S', slotBonus:28, weightMul:0.70, maxWeightBonusG:30000 },
};
const INVENTORY_BASE_SLOTS = 8;
const INVENTORY_BASE_MAX_WEIGHT_G = 6000;
const PERSONAL_INV_BASE_SLOTS = 8;
const PERSONAL_INV_BASE_MAX_WEIGHT_G = 6000;
const SHARED_INV_BAG_RATIO = 0.20; // 가방 보너스의 20%만 공용인벤에 적용
const NORMAL_MATERIAL_WEIGHT_G = { E:20, D:25, C:30, B:35, A:40, S:50 };
const RARE_MATERIAL_WEIGHT_G = 100;
const MANA_STONE_WEIGHT_G = { E:50, D:80, C:120, B:180, A:300, S:500 };
const CONSUMABLE_WEIGHT_G = { tent:10000, ration:300, water:500, potion:200, convFood:300 };

// ── 편의점 식량 기본 DB ──────────────────────────────────────────────────────
const DEFAULT_CONV_FOOD_DB = [
  { id:'conv_ration',     name:'전투식량',          price:5000,  weightG:300, note:'야영 보급용 (야영지에서 소비)' },
  { id:'conv_water',      name:'물 500ml',          price:1000,  weightG:500, note:'야영 보급용 (야영지에서 소비)' },
  { id:'conv_dosirak1',   name:'제육도시락',         price:4900,  weightG:300, note:'편의점 도시락. 식사 시 소모.' },
  { id:'conv_dosirak2',   name:'돈까스파스타도시락', price:5400,  weightG:300, note:'편의점 도시락. 식사 시 소모.' },
  { id:'conv_pepsi',      name:'펩시제로',           price:2000,  weightG:250, note:'편의점 음료. 식사 시 소모.' },
  { id:'conv_soda',       name:'칠성사이다',         price:2000,  weightG:250, note:'편의점 음료. 식사 시 소모.' },
];
function getConvFoodDb() {
  if (!Array.isArray(model.db.convFoodDb) || model.db.convFoodDb.length === 0) {
    model.db.convFoodDb = DEFAULT_CONV_FOOD_DB.map(f => ({ ...f }));
  }
  return model.db.convFoodDb;
}
function buildConvFoodItem(foodDef, count=1) {
  return { id: foodDef.id, name: foodDef.name, category:'convFood', rank:'', count:Math.max(1,Number(count||1)), unitWeightG:foodDef.weightG||300, stackable:true, stackKey:`convFood:${foodDef.id}`, note: foodDef.note||'' };
}

const DEFAULT_RARE_MATERIAL_PACK = {
  "version": 1,
  "note": "GateBattle v1.5 has no dedicated rare-material DB tab yet. This file is a future-ready trait pack.",
  "valueScales": {
    "percentSmall": {
      "E": 1,
      "D": 2,
      "C": 3,
      "B": 5,
      "A": 7,
      "S": 10
    },
    "statusPercent": {
      "E": 2,
      "D": 4,
      "C": 6,
      "B": 8,
      "A": 10,
      "S": 12
    },
    "critChance": {
      "E": 1,
      "D": 2,
      "C": 3,
      "B": 4,
      "A": 5,
      "S": 7
    },
    "critDamage": {
      "E": 5,
      "D": 10,
      "C": 15,
      "B": 20,
      "A": 25,
      "S": 35
    },
    "threatPercent": {
      "E": 10,
      "D": 20,
      "C": 30,
      "B": 40,
      "A": 50,
      "S": 60
    }
  },
  "traits": [
    {
      "id": "physical_damage",
      "name": "물리 피해 증가",
      "category": "offense",
      "scale": "percentSmall"
    },
    {
      "id": "magic_damage",
      "name": "마법 피해 증가",
      "category": "offense",
      "scale": "percentSmall"
    },
    {
      "id": "fire_damage",
      "name": "불 속성 피해 증가",
      "category": "offense",
      "scale": "percentSmall",
      "element": "fire"
    },
    {
      "id": "water_damage",
      "name": "물 속성 피해 증가",
      "category": "offense",
      "scale": "percentSmall",
      "element": "water"
    },
    {
      "id": "ice_damage",
      "name": "얼음 속성 피해 증가",
      "category": "offense",
      "scale": "percentSmall",
      "element": "ice"
    },
    {
      "id": "earth_damage",
      "name": "대지 속성 피해 증가",
      "category": "offense",
      "scale": "percentSmall",
      "element": "earth"
    },
    {
      "id": "wind_damage",
      "name": "바람 속성 피해 증가",
      "category": "offense",
      "scale": "percentSmall",
      "element": "wind"
    },
    {
      "id": "lightning_damage",
      "name": "전기 속성 피해 증가",
      "category": "offense",
      "scale": "percentSmall",
      "element": "lightning"
    },
    {
      "id": "light_damage",
      "name": "빛 속성 피해 증가",
      "category": "offense",
      "scale": "percentSmall",
      "element": "light"
    },
    {
      "id": "dark_damage",
      "name": "어둠 속성 피해 증가",
      "category": "offense",
      "scale": "percentSmall",
      "element": "dark"
    },
    {
      "id": "crit_chance",
      "name": "치명타 확률 증가",
      "category": "offense",
      "scale": "critChance"
    },
    {
      "id": "crit_damage",
      "name": "치명타 피해 증가",
      "category": "offense",
      "scale": "critDamage"
    },
    {
      "id": "physical_defense",
      "name": "물리피해감소 증가",
      "category": "defense",
      "scale": "percentSmall"
    },
    {
      "id": "magic_defense",
      "name": "마법피해감소 증가",
      "category": "defense",
      "scale": "percentSmall"
    },
    {
      "id": "fire_resist",
      "name": "불 속성 저항",
      "category": "defense",
      "scale": "percentSmall",
      "element": "fire"
    },
    {
      "id": "water_resist",
      "name": "물 속성 저항",
      "category": "defense",
      "scale": "percentSmall",
      "element": "water"
    },
    {
      "id": "ice_resist",
      "name": "얼음 속성 저항",
      "category": "defense",
      "scale": "percentSmall",
      "element": "ice"
    },
    {
      "id": "earth_resist",
      "name": "대지 속성 저항",
      "category": "defense",
      "scale": "percentSmall",
      "element": "earth"
    },
    {
      "id": "wind_resist",
      "name": "바람 속성 저항",
      "category": "defense",
      "scale": "percentSmall",
      "element": "wind"
    },
    {
      "id": "lightning_resist",
      "name": "전기 속성 저항",
      "category": "defense",
      "scale": "percentSmall",
      "element": "lightning"
    },
    {
      "id": "light_resist",
      "name": "빛 속성 저항",
      "category": "defense",
      "scale": "percentSmall",
      "element": "light"
    },
    {
      "id": "dark_resist",
      "name": "어둠 속성 저항",
      "category": "defense",
      "scale": "percentSmall",
      "element": "dark"
    },
    {
      "id": "poison_apply",
      "name": "독 부여 확률 증가",
      "category": "status_apply",
      "scale": "statusPercent",
      "status": "poison"
    },
    {
      "id": "bleed_apply",
      "name": "출혈 부여 확률 증가",
      "category": "status_apply",
      "scale": "statusPercent",
      "status": "bleed"
    },
    {
      "id": "burn_apply",
      "name": "화상 부여 확률 증가",
      "category": "status_apply",
      "scale": "statusPercent",
      "status": "burn"
    },
    {
      "id": "curse_apply",
      "name": "저주 부여 확률 증가",
      "category": "status_apply",
      "scale": "statusPercent",
      "status": "curse"
    },
    {
      "id": "poison_resist",
      "name": "독 저항",
      "category": "status_resist",
      "scale": "statusPercent",
      "status": "poison"
    },
    {
      "id": "bleed_resist",
      "name": "출혈 저항",
      "category": "status_resist",
      "scale": "statusPercent",
      "status": "bleed"
    },
    {
      "id": "burn_resist",
      "name": "화상 저항",
      "category": "status_resist",
      "scale": "statusPercent",
      "status": "burn"
    },
    {
      "id": "curse_resist",
      "name": "저주 저항",
      "category": "status_resist",
      "scale": "statusPercent",
      "status": "curse"
    },
    {
      "id": "healing_done",
      "name": "치유량 증가",
      "category": "support",
      "scale": "percentSmall"
    },
    {
      "id": "healing_received",
      "name": "받는 치유량 증가",
      "category": "support",
      "scale": "percentSmall"
    },
    {
      "id": "shield_effect",
      "name": "보호막 효과 증가",
      "category": "support",
      "scale": "percentSmall"
    },
    {
      "id": "threat_up",
      "name": "위협 수치 증가",
      "category": "support",
      "scale": "threatPercent"
    },
    {
      "id": "threat_down",
      "name": "위협 수치 감소",
      "category": "support",
      "scale": "threatPercent"
    }
  ]
};
const RARE_TRAIT_LEGACY_ALIASES = {
  '물리피해':'physical_damage',
  '마법피해':'magic_damage',
  '물리방어':'physical_defense',
  '마법방어':'magic_defense',
  '치유증가':'healing_done'
};
const RARE_FAMILY_PRESETS = {
  increasedHealing:['healing_done','healing_received','shield_effect'],
  elementalDefense:['fire_resist','water_resist','ice_resist','earth_resist','wind_resist','lightning_resist','light_resist','dark_resist','poison_resist','bleed_resist','burn_resist','curse_resist'],
  physicalDefense:['physical_defense','threat_up'],
  magicDefense:['magic_defense','threat_down'],
  elementalDamage:['fire_damage','water_damage','ice_damage','earth_damage','wind_damage','lightning_damage','light_damage','dark_damage','poison_apply','bleed_apply','burn_apply','curse_apply'],
  physicalDamage:['physical_damage','crit_chance','crit_damage'],
  magicDamage:['magic_damage','healing_done']
};


  const _hasRisu = (typeof Risuai !== 'undefined');
  const _ls = _hasRisu && Risuai.safeLocalStorage ? Risuai.safeLocalStorage : null;

  async function lsGet(key) {
    try {
      if (_ls) return await _ls.getItem(key);
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(PLUGIN_NAME, 'lsGet error', e);
      return null;
    }
  }
  async function lsSet(key, val) {
    try {
      if (_ls) await _ls.setItem(key, String(val));
      else localStorage.setItem(key, String(val));
    } catch (e) {
      console.warn(PLUGIN_NAME, 'lsSet error', e);
    }
  }
  async function argGet(key) {
    try {
      if (_hasRisu && Risuai.getArgument) return await Risuai.getArgument(key);
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(PLUGIN_NAME, 'argGet error', e);
      return null;
    }
  }
  async function argSet(key, val) {
    try {
      if (_hasRisu && Risuai.setArgument) await Risuai.setArgument(key, String(val));
      else localStorage.setItem(key, String(val));
    } catch (e) {
      console.warn(PLUGIN_NAME, 'argSet error', e);
    }
  }

  function deepClone(v) { return JSON.parse(JSON.stringify(v)); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function round3(n) { return Math.round(n * 1000) / 1000; }
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function slugify(str) {
    return String(str || '').trim().toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, '_')
      .replace(/^_+|_+$/g, '') || ('id_' + Date.now());
  }
  function gradeIndex(rank) {
    const idx = GRADE_ORDER.indexOf(String(rank || 'E').toUpperCase());
    return idx < 0 ? 0 : idx;
  }
  function defaultAtkByRank(rank) {
    const table = { E:5, D:15, C:25, B:45, A:70, S:100 };
    return table[String(rank || 'E').toUpperCase()] || 5;
  }
  function rankBonus(rank) {
    const table = { E:0, D:30, C:90, B:180, A:320, S:520 };
    return table[String(rank || 'E').toUpperCase()] || 0;
  }

  const MONSTER_COMBAT_TABLE = {
    E:{ normal:{ hp:[50,90], dmg:[7,10], skill:1.0 }, elite:{ hp:[200,360], dmg:[15,20], skill:1.1 }, boss:{ hp:[500,900], dmg:[35,40], skill:1.25 } },
    D:{ normal:{ hp:[175,275], dmg:[15,20], skill:1.0 }, elite:{ hp:[700,1100], dmg:[35,40], skill:1.2 }, boss:{ hp:[1750,2750], dmg:[55,60], skill:1.5 } },
    C:{ normal:{ hp:[400,700], dmg:[20,25], skill:1.0 }, elite:{ hp:[1800,3150], dmg:[45,50], skill:1.2 }, boss:{ hp:[5000,8750], dmg:[70,80], skill:1.5 } },
    B:{ normal:{ hp:[1250,1750], dmg:[30,35], skill:1.0 }, elite:{ hp:[5500,8000], dmg:[60,65], skill:1.25 }, boss:{ hp:[15000,22500], dmg:[90,100], skill:1.6 } },
    A:{ normal:{ hp:[3000,4500], dmg:[35,40], skill:1.0 }, elite:{ hp:[15000,22500], dmg:[80,90], skill:1.4 }, boss:{ hp:[45000,67500], dmg:[110,120], skill:1.75 } },
    S:{ normal:{ hp:[7500,10000], dmg:[50,60], skill:1.0 }, elite:{ hp:[37500,50000], dmg:[100,110], skill:1.5 }, boss:{ hp:[112500,150000], dmg:[130,150], skill:1.8 } }
  };
  const MONSTER_RESOURCE_TABLE = {
    physical:{ mp:[0,0,0,0,0,0], sp:[20,30,40,55,70,90] },
    magic:{ mp:[20,35,50,70,90,120], sp:[10,15,20,25,30,40] }
  };

  function monsterKindKey(v) {
    const s = String(v || 'Normal').trim().toLowerCase();
    if (s.includes('boss')) return 'boss';
    if (s.includes('elite')) return 'elite';
    return 'normal';
  }
  function hash32(str) {
    let h = 2166136261;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function hash01(str) { return hash32(str) / 4294967295; }
  function rangeValue(min, max, t) { return min + ((max - min) * clamp(t, 0, 1)); }
  function monsterProfileForEntry(entry) {
    const rank = String(entry && entry.rank || 'E').toUpperCase();
    const kind = monsterKindKey(entry && entry.kind);
    const table = (MONSTER_COMBAT_TABLE[rank] || MONSTER_COMBAT_TABLE.E)[kind] || MONSTER_COMBAT_TABLE.E.normal;
    const row = normRow((entry && entry.row) || inferRow(entry && entry.position, entry && entry.job));
    const position = String((entry && (entry.position || entry.role || '')) || '');
    const seedBase = `${entry && (entry.id || entry.name || '')}|${rank}|${kind}|${position}|${row}`;
    let hpT = hash01(seedBase + '|hp');
    let dmgT = hash01(seedBase + '|dmg');
    if (row === 'front') { hpT += 0.12; dmgT += 0.08; }
    else if (row === 'mid') { hpT += 0.03; dmgT += 0.02; }
    else if (row === 'back') { hpT -= 0.10; dmgT -= 0.04; }
    if (position.includes('원거리')) { hpT -= 0.03; dmgT -= 0.01; }
    if (position.includes('마법')) { hpT -= 0.04; dmgT -= 0.02; }
    if (position.includes('근거리')) { dmgT += 0.04; }
    const hp = Math.round(rangeValue(table.hp[0], table.hp[1], hpT));
    const dmg = Math.round(rangeValue(table.dmg[0], table.dmg[1], dmgT));
    const damageType = (entry && entry.damageType === 'magic') ? 'magic' : 'physical';
    const rankIdx = gradeIndex(rank);
    const resPack = MONSTER_RESOURCE_TABLE[damageType];
    const mp = resPack ? resPack.mp[rankIdx] : 0;
    const sp = resPack ? resPack.sp[rankIdx] : 0;
    return {
      kind,
      hp,
      damage:dmg,
      skillMul:Number(table.skill || 1),
      mp,
      sp,
      tableHp:table.hp.slice(),
      tableDmg:table.dmg.slice()
    };
  }
  function splitCsv(str) {
    return String(str || '').split(',').map(v => v.trim()).filter(Boolean);
  }
  function koToElement(v) {
    const s = String(v || '').trim().toLowerCase();
    const map = {
      '없음':'none', 'none':'none',
      '물':'water', 'water':'water',
      '불':'fire', 'fire':'fire',
      '얼음':'ice', 'ice':'ice',
      '대지':'earth', 'earth':'earth',
      '바람':'wind', 'wind':'wind',
      '전기':'electric', 'electric':'electric', 'lightning':'electric',
      '어둠':'dark', 'dark':'dark',
      '빛':'light', 'light':'light'
    };
    return map[s] || 'none';
  }
  function koToStatus(v) {
    const s = String(v || '').trim().toLowerCase();
    const map = {
      '독':'poison', 'poison':'poison',
      '출혈':'bleed', 'bleed':'bleed', 'bleeding':'bleed',
      '기절':'stun', 'stun':'stun',
      '속박':'bind', 'bind':'bind',
      '수면':'sleep', 'sleep':'sleep',
      '화상':'burn', 'burn':'burn',
      '저주':'curse', 'curse':'curse',
      '침묵':'silence', 'silence':'silence',
      '둔화':'slow', 'slow':'slow'
    };
    return map[s] || '';
  }
  function normElement(v) {
    return koToElement(v);
  }
  function normStatus(v) {
    const s = koToStatus(v);
    return STATUS_KEYS.includes(s) ? s : '';
  }
  function elementLabel(v) {
    const map = { none:'무속성', water:'물', fire:'불', ice:'얼음', earth:'대지', wind:'바람', electric:'전기', dark:'어둠', light:'빛' };
    return map[normElement(v)] || '무속성';
  }
  function normRow(v) {
    const s = String(v || '').trim().toLowerCase();
    if (['front', '전열', 'f'].includes(s)) return 'front';
    if (['mid', 'middle', '중열', 'm'].includes(s)) return 'mid';
    if (['back', 'rear', '후열', 'b'].includes(s)) return 'back';
    return '';
  }
  function rowLabel(row) {
    return row === 'front' ? '전열' : row === 'mid' ? '중열' : row === 'back' ? '후열' : '-';
  }
  function inferDamageType(position, job) {
    const t = ((position || '') + ' ' + (job || '')).toLowerCase();
    if (t.includes('마법') || t.includes('법사') || t.includes('정령') || t.includes('cleric') || t.includes('클레릭') || t.includes('소환')) return 'magic';
    return 'physical';
  }
  function inferAttackStat(position, job) {
    const t = ((position || '') + ' ' + (job || '')).toLowerCase();
    if (t.includes('힐러') || t.includes('서포터') || t.includes('마법') || t.includes('법사') || t.includes('클레릭') || t.includes('정령')) return 'int';
    if (t.includes('원거리') || t.includes('투척') || t.includes('궁수')) return 'agi';
    if (t.includes('탱커')) return 'con';
    return 'str';
  }
  function inferRow(position, job) {
    const t = ((position || '') + ' ' + (job || '')).toLowerCase();
    if (t.includes('탱커') || t.includes('근거리')) return 'front';
    if (t.includes('투척')) return 'mid';
    if (t.includes('원거리') || t.includes('궁수') || t.includes('힐러') || t.includes('서포터') || t.includes('마법') || t.includes('법사') || t.includes('정령') || t.includes('소환')) return 'back';
    return 'mid';
  }
  function inferThreatBase(position, row) {
    const t = String(position || '').toLowerCase();
    if (t.includes('탱커')) return 5;
    if (t.includes('근거리')) return 2;
    if (row === 'front') return 2;
    return 1;
  }
  function weightedPick(items) {
    const list = items.filter(x => x && x.weight > 0);
    if (!list.length) return null;
    const total = list.reduce((s, x) => s + x.weight, 0);
    let roll = Math.random() * total;
    for (const item of list) {
      roll -= item.weight;
      if (roll <= 0) return item.value;
    }
    return list[list.length - 1].value;
  }
  function getDefaultResists() {
    return { water:1, fire:1, ice:1, earth:1, wind:1, electric:1, dark:1, light:1 };
  }
  function normResists(raw) {
    const base = getDefaultResists();
    const src = raw && typeof raw === 'object' ? raw : {};
    Object.keys(base).forEach(k => {
      const v = Number(src[k]);
      if (Number.isFinite(v) && v > 0) base[k] = v;
    });
    return base;
  }
  const SPECIES_DEFAULTS = {
    undead: { speciesLabel:'언데드', defaultElement:'dark', immunities:['poison','bleed','curse'], damageTakenMods:{ physical:1.10 } },
    ghost: { speciesLabel:'고스트', defaultElement:'dark', immunities:['poison','bleed','curse'], damageTakenMods:{ physical:0.50, magic:1.25 } },
    beast: { speciesLabel:'야수', defaultElement:'wind', bonusVsBleeding:1.20, aloneDamageTaken:1.10 },
    plant: { speciesLabel:'식물', defaultElement:'earth', immunities:['bleed'], regenPct:0.03, regenBlockedBy:['burn'] },
    slime: { speciesLabel:'슬라임', defaultElement:'water', immunities:['bleed'], damageTakenMods:{ physical:0.70, magic:1.10 } },
    construct: { speciesLabel:'구조체', defaultElement:'electric', immunities:['poison','bleed','sleep'], damageTakenMods:{ magic:0.80, physical:1.15 } },
    elemental: { speciesLabel:'정령', defaultElement:'none' },
    demon: { speciesLabel:'악마', defaultElement:'fire', immunities:['burn'], damageTakenMods:{ dark:0.70 } },
    frost: { speciesLabel:'빙정', defaultElement:'ice', immunities:['sleep'], damageTakenMods:{ physical:0.80 } },
    celestial: { speciesLabel:'천사체', defaultElement:'light', immunities:['curse'], damageTakenMods:{ magic:0.80 } }
  };
  function inferSpecies(raw) {
    const s = String(raw || '').toLowerCase();
    if (!s) return '';
    if (s.includes('언데드') || s.includes('undead')) return 'undead';
    if (s.includes('고스트') || s.includes('ghost')) return 'ghost';
    if (s.includes('야수') || s.includes('beast')) return 'beast';
    if (s.includes('식물') || s.includes('plant')) return 'plant';
    if (s.includes('슬라임') || s.includes('slime')) return 'slime';
    if (s.includes('구조체') || s.includes('construct')) return 'construct';
    if (s.includes('정령') || s.includes('elemental')) return 'elemental';
    if (s.includes('악마') || s.includes('demon')) return 'demon';
    if (s.includes('빙정') || s.includes('frost') || s.includes('얼음아인')) return 'frost';
    if (s.includes('천사체') || s.includes('celestial')) return 'celestial';
    return '';
  }
  function createDefaultMeta() {
    return {
      species:'', speciesLabel:'', baseElement:'none', immunities:[], damageTakenMods:{}, bonusVsBleeding:1, aloneDamageTaken:1, regenPct:0, regenBlockedBy:[], onHitStatus:'', onHitChance:0, onHitTurns:0
    };
  }
  function mergeMeta(base, patch) {
    const out = Object.assign(createDefaultMeta(), base || {});
    const p = patch || {};
    if (p.species) out.species = p.species;
    if (p.speciesLabel) out.speciesLabel = p.speciesLabel;
    if (p.baseElement && p.baseElement !== 'none') out.baseElement = normElement(p.baseElement);
    if (Array.isArray(p.immunities)) out.immunities = Array.from(new Set(out.immunities.concat(p.immunities.map(normStatus).filter(Boolean))));
    if (p.damageTakenMods && typeof p.damageTakenMods === 'object') out.damageTakenMods = Object.assign({}, out.damageTakenMods, p.damageTakenMods);
    if (p.bonusVsBleeding && p.bonusVsBleeding !== 1) out.bonusVsBleeding = Number(p.bonusVsBleeding);
    if (p.aloneDamageTaken && p.aloneDamageTaken !== 1) out.aloneDamageTaken = Number(p.aloneDamageTaken);
    if (p.regenPct) out.regenPct = Number(p.regenPct);
    if (Array.isArray(p.regenBlockedBy)) out.regenBlockedBy = Array.from(new Set(out.regenBlockedBy.concat(p.regenBlockedBy.map(normStatus).filter(Boolean))));
    if (p.onHitStatus) out.onHitStatus = normStatus(p.onHitStatus);
    if (p.onHitChance != null) out.onHitChance = Number(p.onHitChance);
    if (p.onHitTurns != null) out.onHitTurns = Number(p.onHitTurns);
    return out;
  }
  function parseMonsterMeta(entry) {
    const item = entry || {};
    const note = String(item.note || '');
    let meta = createDefaultMeta();
    const inferredSpecies = inferSpecies(item.species || note || item.id || item.name);
    if (inferredSpecies && SPECIES_DEFAULTS[inferredSpecies]) meta = mergeMeta(meta, Object.assign({ species:inferredSpecies }, SPECIES_DEFAULTS[inferredSpecies]));
    const speciesMatch = note.match(/종족\s*:\s*([^/]+)/);
    if (speciesMatch) {
      const sp = inferSpecies(speciesMatch[1]);
      if (sp && SPECIES_DEFAULTS[sp]) meta = mergeMeta(meta, Object.assign({ species:sp }, SPECIES_DEFAULTS[sp]));
    }
    const elMatch = note.match(/기본속성\s*:\s*([^/]+)/);
    if (elMatch) meta.baseElement = normElement(elMatch[1]);
    if (!meta.baseElement || meta.baseElement === 'none') meta.baseElement = normElement(item.baseElement || item.element || meta.baseElement || 'none');
    const prefixMatch = note.match(/접두효과\s*:\s*([^/]+)/);
    if (prefixMatch) {
      const st = normStatus(prefixMatch[1]);
      if (st) {
        const defaultChance = ['stun','bind','sleep'].includes(st) ? 0.18 : 0.28;
        const defaultTurns = ['stun','bind','sleep'].includes(st) ? 1 : 2;
        meta.onHitStatus = st; meta.onHitChance = defaultChance; meta.onHitTurns = defaultTurns;
      }
    }
    if (Array.isArray(item.immunities)) meta = mergeMeta(meta, { immunities:item.immunities });
    if (item.damageTakenMods) meta = mergeMeta(meta, { damageTakenMods:item.damageTakenMods });
    if (item.bonusVsBleeding) meta = mergeMeta(meta, { bonusVsBleeding:item.bonusVsBleeding });
    if (item.aloneDamageTaken) meta = mergeMeta(meta, { aloneDamageTaken:item.aloneDamageTaken });
    if (item.regenPct) meta = mergeMeta(meta, { regenPct:item.regenPct });
    if (item.regenBlockedBy) meta = mergeMeta(meta, { regenBlockedBy:item.regenBlockedBy });
    if (item.onHitStatus) meta = mergeMeta(meta, { onHitStatus:item.onHitStatus, onHitChance:item.onHitChance, onHitTurns:item.onHitTurns });

    const immRe = /(독|출혈|기절|속박|수면|화상|저주)\s*면역/g;
    let m;
    while ((m = immRe.exec(note))) {
      const st = normStatus(m[1]);
      if (st) meta.immunities = Array.from(new Set(meta.immunities.concat([st])));
    }
    const extraRe = /(물리|마법)\s*피해\s*(\d+)%\s*추가로\s*받음/g;
    while ((m = extraRe.exec(note))) {
      meta.damageTakenMods[m[1] === '물리' ? 'physical' : 'magic'] = 1 + (Number(m[2]) / 100);
    }
    const reduceRe = /(물리|마법)\s*피해\s*(\d+)%\s*반감/g;
    while ((m = reduceRe.exec(note))) {
      meta.damageTakenMods[m[1] === '물리' ? 'physical' : 'magic'] = 1 - (Number(m[2]) / 100);
    }
    // 속성별 받는데미지 반감 (예: 어둠속성 받는데미지 30%반감)
    const elemReduceRe = /(어둠|빛|불|물|얼음|대지|바람|전기)\s*속성\s*받는\s*데미지\s*(\d+)%\s*반감/g;
    const elemNameMap = {'어둠':'dark','빛':'light','불':'fire','물':'water','얼음':'ice','대지':'earth','바람':'wind','전기':'electric'};
    while ((m = elemReduceRe.exec(note))) {
      const eKey = elemNameMap[m[1]];
      if (eKey) meta.damageTakenMods[eKey] = 1 - (Number(m[2]) / 100);
    }
    const bleedBonus = note.match(/출혈\s*상태의\s*적\s*공격\s*시\s*(\d+)%\s*피해\s*증가/);
    if (bleedBonus) meta.bonusVsBleeding = 1 + (Number(bleedBonus[1]) / 100);
    const aloneInc = note.match(/혼자\s*남았을\s*때\s*받는\s*피해\s*(\d+)%\s*증가/);
    if (aloneInc) meta.aloneDamageTaken = 1 + (Number(aloneInc[1]) / 100);
    const regenMatch = note.match(/HP\s*(\d+)%\s*회복/);
    if (regenMatch) meta.regenPct = Number(regenMatch[1]) / 100;
    if (/화상\s*상태일\s*때\s*재생\s*비활성화/.test(note)) meta.regenBlockedBy = Array.from(new Set(meta.regenBlockedBy.concat(['burn'])));
    return meta;
  }
  function unitHasImmunity(unit, statusType) {
    const st = normStatus(statusType);
    if (!st) return false;
    return Array.isArray(unit.immunities) && unit.immunities.includes(st);
  }
  function getStatusDefaultProfile(type) {
    const st = normStatus(type);
    const map = {
      poison:{ turns:3, chance:0.28, power:0 },
      bleed:{ turns:3, chance:0.28, power:0 },
      burn:{ turns:5, chance:0.28, power:0 },
      curse:{ turns:3, chance:0.24, power:0 },
      bind:{ turns:2, chance:0.18, power:0 },
      sleep:{ turns:2, chance:0.16, power:0 },
      stun:{ turns:1, chance:0.16, power:0 },
      silence:{ turns:3, chance:0.20, power:0 },
      slow:{ turns:3, chance:0.25, power:0 }
    };
    return Object.assign({ turns:2, chance:0.2, power:0 }, map[st] || {});
  }
  function getElementAdvantageMult(attackElement, targetElement) {
    const atk = normElement(attackElement);
    const tgt = normElement(targetElement);
    if (atk === 'none' || tgt === 'none' || atk === tgt) return 1;
    const idx = ELEMENT_CHAIN.indexOf(atk);
    if (idx < 0) return 1;
    const prev = ELEMENT_CHAIN[(idx - 1 + ELEMENT_CHAIN.length) % ELEMENT_CHAIN.length];
    const next = ELEMENT_CHAIN[(idx + 1) % ELEMENT_CHAIN.length];
    if (tgt === prev) return 1.25;
    if (tgt === next) return 0.75;
    return 1;
  }

  const BUILTIN_SKILLS = {};

  function buildSampleCharacters() {
    return [
      // §2 최유나 — E랭크 전열탱커 무직업 Lv.6
      { id:'char_yuna', name:'최유나', job:'무직업', position:'전열탱커', row:'front', rank:'E', level:6,
        stats:{ str:12, con:19, int:3, agi:14, sense:15 },
        damageType:'physical', attackStat:'con',
        skills:['steelAnvil','shieldProficiency','daggerHandling'],
        note:'전열 탱커 — 패시브 특화' },

      // §3 오하나 — E랭크 중열딜러 투척가 Lv.6
      { id:'char_ohana', name:'오하나', job:'투척가', position:'원거리물리', row:'mid', rank:'E', level:6,
        stats:{ str:8, con:11, int:4, agi:16, sense:15 },
        damageType:'physical', attackStat:'agi',
        skills:['quickThrow','knifeRecall','preciseAim'],
        note:'중열 투척 딜러' },

      // §4 안도현 — E랭크 비전투 수리가 Lv.4
      { id:'char_dohyun', name:'안도현', job:'수리가', position:'비전투', row:'back', rank:'E', level:4,
        stats:{ str:12, con:12, int:5, agi:6, sense:15 },
        damageType:'physical', attackStat:'sense',
        skills:['exceptionalDexterity','fieldMaintenance','quickRepair','fieldAidSupport'],
        note:'비전투 수리가 — 장비 관리 특화' },

      // §5 송하늘 — E랭크 후열딜러 궁수 Lv.6
      { id:'char_haneul', name:'송하늘', job:'궁수', position:'원거리물리', row:'back', rank:'E', level:6,
        stats:{ str:7, con:12, int:4, agi:18, sense:14 },
        damageType:'physical', attackStat:'agi',
        skills:['powerShot','quickShot','fullArrowRecovery','tripleShot'],
        note:'후열 궁수 딜러' },

      // §6 김민수 — E랭크 전열탱커 무직업 Lv.5
      { id:'char_minsu', name:'김민수', job:'무직업', position:'전열탱커', row:'front', rank:'E', level:5,
        stats:{ str:13, con:14, int:3, agi:10, sense:8 },
        damageType:'physical', attackStat:'con',
        skills:['spotlight','shieldBash','taunt'],
        note:'전열 탱커 — 도발 특화' },

      // §7 이하은 — D랭크 후열힐러 클레릭 Lv.14
      { id:'char_haeun', name:'이하은', job:'클레릭', position:'힐러', row:'back', rank:'D', level:14,
        stats:{ str:5, con:16, int:35, agi:8, sense:20 },
        damageType:'magic', attackStat:'int',
        skills:['pray','blessingOfLight','smallGarden'],
        note:'후열 힐러' },

      // §8 이사벨 헤이즈 — D랭크 전열탱커 크루세이더 Lv.12
      { id:'char_isabel', name:'이사벨 헤이즈', job:'크루세이더', position:'전열탱커', row:'front', rank:'D', level:12,
        stats:{ str:20, con:28, int:18, agi:10, sense:15 },
        damageType:'physical', attackStat:'con',
        skills:['holdTheLine','holyProvocation','divineProtection','holyLight','fragmentOfAthena'],
        note:'전열 탱커/크루세이더' },

      // §9 최민준 — C랭크 전열탱커 백부장 Lv.28
      { id:'char_minjun', name:'최민준', job:'백부장', position:'전열탱커', row:'front', rank:'C', level:28,
        stats:{ str:42, con:48, int:15, agi:22, sense:18 },
        damageType:'physical', attackStat:'con',
        skills:['fightingSpiritBoost','formationCommand','moraleManagement','shieldSmash','battleCry','charge'],
        note:'전열 탱커/지휘관' },

      // §10 서지한 — C랭크 후열서포터 무직업(저주체질) Lv.22
      { id:'char_jihan', name:'서지한', job:'무직업', position:'후열서포터', row:'back', rank:'C', level:22,
        stats:{ str:8, con:20, int:42, agi:12, sense:28 },
        damageType:'magic', attackStat:'int',
        skills:['heal','haste','blessingOfLight','energyBolt','vampiricInstinct','bloodSense'],
        note:'후열 서포터/저주체질' },

      // §11 박소원 — C랭크 후열서포터 연금술사 Lv.25
      { id:'char_sowon', name:'박소원', job:'연금술사', position:'후열서포터', row:'back', rank:'C', level:25,
        stats:{ str:15, con:22, int:38, agi:10, sense:30 },
        damageType:'magic', attackStat:'int',
        skills:['potionCraft','potionToss','materialAnalysis','energyShower'],
        note:'후열 서포터/연금술사' },

      // §12 강유라 — C랭크 전열딜러 스트라이커 Lv.28
      { id:'char_yura', name:'강유라', job:'스트라이커', position:'근거리물리', row:'front', rank:'C', level:28,
        stats:{ str:38, con:28, int:5, agi:48, sense:10 },
        damageType:'physical', attackStat:'agi',
        skills:['bodyReinforce','crushingKick','spinSweep','vitalStrike'],
        note:'전열 근접 딜러' },

      // §13 한서연 — B랭크 후열딜러 마법사(화염) Lv.38
      { id:'char_seoyeon', name:'한서연', job:'마법사', position:'원거리마법', row:'back', rank:'B', level:38,
        stats:{ str:8, con:22, int:65, agi:28, sense:32 },
        damageType:'magic', attackStat:'int',
        skills:['flameLance','meteorBarrage','flameWall','manaFocus','energyBolt'],
        note:'후열 화염 마법사' },

      // §14 하루 이토 — B랭크 중열딜러/서포터 정령술사 Lv.35
      { id:'char_haru', name:'하루 이토', job:'정령술사', position:'중열딜러', row:'mid', rank:'B', level:35,
        stats:{ str:8, con:20, int:58, agi:52, sense:38 },
        damageType:'magic', attackStat:'int',
        skills:['summonZephyr','summonBark','galeStrike','rootBind','earthHeal','terrainShift'],
        note:'중열 정령술사' },

      // §15 유진성 — D랭크 비전투 대장장이 Lv.15
      { id:'char_jinseong', name:'유진성', job:'대장장이', position:'비전투', row:'back', rank:'D', level:15,
        stats:{ str:28, con:20, int:5, agi:8, sense:22 },
        damageType:'physical', attackStat:'str',
        skills:['equipmentCraft','appraisal','battlefieldRepair','firepowerTuning'],
        note:'비전투 대장장이' },

      // §16 한아람 — E랭크 비전투/전열보조 짐꾼 Lv.4
      { id:'char_aram', name:'한아람', job:'무직업', position:'근거리물리', row:'front', rank:'E', level:4,
        stats:{ str:14, con:13, int:3, agi:11, sense:10 },
        damageType:'physical', attackStat:'str',
        skills:['fistStrike','hiddenMight','cargoSupport','emergencyDodge'],
        note:'Melee Dealer/Porter · 신체강화형' },

      // ═══════════════════════════════════════════════════════════
      //  부록 A: 고랭크 NPC
      // ═══════════════════════════════════════════════════════════

      // 강민혁 — A랭크 검사 (흑사) Lv.65
      { id:'char_minhyuk', name:'강민혁', job:'검사', position:'전열딜러', row:'front', rank:'A', level:65,
        stats:{ str:82, con:42, int:18, agi:75, sense:38 },
        damageType:'physical', attackStat:'str',
        skills:['auraMastery','shadowDraw','auraSlash','auraArc'],
        note:'A랭크 검사 · 흑사 · 오라 중거리 투사' },

      // 강우석 — A랭크 탱커 (백련) Lv.68
      { id:'char_wooseok', name:'강우석', job:'탱커', position:'전열탱커', row:'front', rank:'A', level:68,
        stats:{ str:52, con:90, int:15, agi:28, sense:50 },
        damageType:'physical', attackStat:'con',
        skills:['impactReduction','defensiveStance','tauntA','chargeA','shieldMastery','conBoost','staminaRecovery','senBoost'],
        note:'A랭크 탱커 · 백련' },

      // 사사키 유아 — A랭크 딜러/탱커 (저승무사) Lv.62
      { id:'char_yua', name:'사사키 유아', job:'저승무사', position:'전열딜러', row:'front', rank:'A', level:62,
        stats:{ str:78, con:55, int:45, agi:72, sense:35 },
        damageType:'physical', attackStat:'str',
        skills:['spiritArmor','weaponManifestation','crescentSlash','spiritSever'],
        note:'A랭크 딜러/탱커 · 저승무사 · 영적 전투' },

      // 임설희 — A랭크 딜러 (백련) Lv.60
      { id:'char_seolhee', name:'임설희', job:'마법사', position:'원거리마법', row:'back', rank:'A', level:60,
        stats:{ str:12, con:30, int:88, agi:35, sense:48 },
        damageType:'magic', attackStat:'int',
        skills:['iceMaker','icicleLance','frostFlower','stairAndSlide'],
        note:'A랭크 빙결 마법사 · 백련 · 아이스 메이커' },

      // 백휘성 — S랭크 딜러 (협회) Lv.85
      { id:'char_hwiseong', name:'백휘성', job:'마법사', position:'원거리마법', row:'back', rank:'S', level:85,
        stats:{ str:15, con:40, int:135, agi:45, sense:65 },
        damageType:'magic', attackStat:'int',
        skills:['auraOfJudge','heliosNova','shacklesOfRadiance'],
        note:'S랭크 빛 마법사 · 협회 · 심판자' },

      // 한지원 — S랭크 서포터 (적호) Lv.78
      { id:'char_jiwon', name:'한지원', job:'서포터', position:'후열서포터', row:'back', rank:'S', level:78,
        stats:{ str:18, con:45, int:120, agi:35, sense:95 },
        damageType:'magic', attackStat:'int',
        skills:['trueGaze','barrierManipulation','healingMagic'],
        note:'S랭크 서포터 · 적호 · 결계/분석' },

      // 박준호 — S랭크 탱커 (적호) Lv.82
      { id:'char_junho', name:'박준호', job:'탱커', position:'전열탱커', row:'front', rank:'S', level:82,
        stats:{ str:88, con:130, int:30, agi:45, sense:55 },
        damageType:'physical', attackStat:'con',
        skills:['byeokryeokjang','uraegyeok'],
        note:'S랭크 탱커 · 적호 · 번개 갑주' },

      // 하월영 — S랭크 탱커(?) (무소속) Lv.90
      { id:'char_wolyoung', name:'하월영', job:'검사', position:'전열딜러', row:'front', rank:'S', level:90,
        stats:{ str:95, con:60, int:25, agi:140, sense:72 },
        damageType:'physical', attackStat:'agi',
        skills:['shunpo','wolseomTriple','parry','insight'],
        note:'S랭크 · 무소속 · 초고속 검사' },

      // 앨리스 크로프트 — A랭크 서포터 (크로노스의 후계자) Lv.58
      { id:'char_alice', name:'앨리스 크로프트', job:'서포터', position:'후열서포터', row:'back', rank:'A', level:58,
        stats:{ str:15, con:28, int:75, agi:50, sense:68 },
        damageType:'magic', attackStat:'int',
        skills:['slowTime','hasteTime','temporalSense','itemExtension'],
        note:'A랭크 시간 서포터 · 크로노스의 후계자' },

      // 이지혜 — A랭크 딜러/소환사 (Nyx) Lv.55
      { id:'char_jihye', name:'이지혜', job:'소환사', position:'원거리마법', row:'back', rank:'A', level:55,
        stats:{ str:12, con:25, int:82, agi:42, sense:58 },
        damageType:'magic', attackStat:'int',
        skills:['reverseSummon','nightsVeil','sharedLethargy'],
        note:'A랭크 소환사 · Nyx · 그림자 소환' },

      // 임진태 — S랭크 딜러 (은랑) Lv.88
      { id:'char_jintae', name:'임진태', job:'딜러', position:'전열딜러', row:'front', rank:'S', level:88,
        stats:{ str:125, con:85, int:20, agi:110, sense:55 },
        damageType:'physical', attackStat:'str',
        skills:['partialTransform','fullTransform','gluttonousInstinct'],
        note:'S랭크 딜러 · 은랑 · 늑대 변신' },

      // 제이크 밀러 — S랭크 딜러/무투가 (무소속) Lv.92
      { id:'char_jake', name:'제이크 밀러', job:'무투가', position:'근거리물리', row:'front', rank:'S', level:92,
        stats:{ str:140, con:90, int:15, agi:95, sense:50 },
        damageType:'physical', attackStat:'str',
        skills:['devastatingBlow','quakeStrike','martialAwakening','instinctRead'],
        note:'S랭크 무투가 · 무소속 · 순수 주먹' },

      // ═══════════════════════════════════════════════════════════
      //  부록 B: 적대 NPC
      // ═══════════════════════════════════════════════════════════

      // 강태식 — C랭크 딜러/암살자 Lv.30
      { id:'char_taesik', name:'강태식', job:'무직업', position:'중열딜러', row:'mid', rank:'C', level:30,
        stats:{ str:18, con:22, int:10, agi:52, sense:38 },
        damageType:'physical', attackStat:'agi',
        skills:['stealth','ambush','poisonBlade','escape'],
        note:'C랭크 암살자' },

      // 권도윤 — B랭크 블랙마켓 Lv.42
      { id:'char_doyun', name:'권도윤', job:'무직업', position:'중열딜러', row:'mid', rank:'B', level:42,
        stats:{ str:25, con:30, int:55, agi:65, sense:42 },
        damageType:'physical', attackStat:'agi',
        skills:['suggestion','phantomStep','knifeStrike'],
        note:'B랭크 블랙마켓' },

      // 유진혁 — A급 에레보스의 피조물 Lv.70
      { id:'char_jinhyuk', name:'유진혁', job:'딜러', position:'전열딜러', row:'front', rank:'A', level:70,
        stats:{ str:72, con:55, int:80, agi:65, sense:48 },
        damageType:'magic', attackStat:'int',
        skills:['darknessManipulation','shadowMeld','abyssalBlade','erebosCloak'],
        note:'A급 · 에레보스의 피조물 · 암흑 조작' },

      // 장은서 — A급 상태창 불신론자 리더 Lv.65
      { id:'char_eunseo', name:'장은서', job:'무직업', position:'중열딜러', row:'mid', rank:'A', level:65,
        stats:{ str:35, con:40, int:30, agi:85, sense:60 },
        damageType:'physical', attackStat:'agi',
        skills:['curseImmunity','bloodletterDagger','shroudOfNonexistence'],
        note:'A급 · 상태창 불신론자 리더 · 저주 아이템 특화' },

      // 신우현 — 비각성 이계 숭배단 Lv.10
      { id:'char_woohyun', name:'신우현', job:'무직업', position:'후열서포터', row:'back', rank:'E', level:10,
        stats:{ str:8, con:10, int:12, agi:7, sense:15 },
        damageType:'magic', attackStat:'int',
        skills:['corruptedResonance','monsterKinship','corruptSpread'],
        note:'비각성 · 이계 숭배단 · 오염 마정석 의존' },

      // 나선영 — A급 이계 숭배단 Lv.68
      { id:'char_seonyoung', name:'나선영', job:'무직업', position:'원거리마법', row:'back', rank:'A', level:68,
        stats:{ str:15, con:35, int:85, agi:30, sense:72 },
        damageType:'magic', attackStat:'int',
        skills:['whisperOfFear','corrosiveMist','manaSight','fearInfusion'],
        note:'A급 · 이계 숭배단 · 공포/부식' },

      // 채하윤 — 前 E랭크 상태창 불신론자 부사령관 Lv.35
      { id:'char_hayun', name:'채하윤', job:'무직업', position:'원거리마법', row:'back', rank:'C', level:35,
        stats:{ str:15, con:20, int:48, agi:45, sense:35 },
        damageType:'magic', attackStat:'int',
        skills:['manaBullet','piercingRound','explosiveRound','homingRound'],
        note:'前 E랭크 · 상태창 불신론자 부사령관 · 마나 탄환' },

      // ─── 추가 캐릭터: 로어북 누락 7명 ───

      // 리베아 — D랭크 · 잊혀진 신격 (Hidden)
      { id:'char_rivea', name:'리베아', job:'잊혀진 신격', position:'원거리마법', row:'back', rank:'D', level:20,
        stats:{ str:5, con:12, int:30, agi:10, sense:18 },
        damageType:'magic', attackStat:'int',
        skills:['manaDrain','lordOfAdversity'],
        note:'공식 D랭크 / 실제 불명 · Forgotten Divinity (Hidden)' },

      // 민채린 — B랭크 · Shadow Hunter
      { id:'char_chaerin', name:'민채린', job:'Shadow Hunter', position:'근거리물리', row:'mid', rank:'B', level:42,
        stats:{ str:30, con:25, int:12, agi:68, sense:48 },
        damageType:'physical', attackStat:'agi',
        skills:['shadowCloak','shadowStrike','twinDaggerSlash'],
        note:'딜러/암살자 · 어둠 은신, 쌍 단검' },

      // 유선화 — A랭크 · 회피형 격투가
      { id:'char_sunhwa', name:'유선화', job:'격투가', position:'전열딜러', row:'front', rank:'A', level:62,
        stats:{ str:55, con:40, int:10, agi:82, sense:45 },
        damageType:'physical', attackStat:'agi',
        skills:['quickStep','counterStance','risingSpirit'],
        note:'Tank/Dealer 하이브리드 · 회피형 · Talos의 의지(Unique 건틀릿)' },

      // 주아람 — B랭크 · 전략가/후방 코디네이터
      { id:'char_ahram', name:'주아람', job:'무직업', position:'후열서포터', row:'back', rank:'B', level:40,
        stats:{ str:15, con:22, int:55, agi:20, sense:60 },
        damageType:'magic', attackStat:'sense',
        skills:['redThread','tacticalCommand'],
        note:'전략가 · 홍선(Unique) · 5명 위치/상태 감지' },

      // 진소희 — A랭크 · 딜러/서포터 · 퇴마사
      { id:'char_sohee', name:'진소희', job:'무직업', position:'원거리마법', row:'back', rank:'A', level:60,
        stats:{ str:12, con:30, int:80, agi:22, sense:55 },
        damageType:'magic', attackStat:'int',
        skills:['exorcismExplosion','exorcismLightning','exorcismBinding','exorcismBarrier'],
        note:'퇴마부(Unique) — 폭파/전격/속박/결계 4종' },

      // 최태준 — A랭크 · 커맨더
      { id:'char_taejoon', name:'최태준', job:'커맨더', position:'후열서포터', row:'back', rank:'A', level:58,
        stats:{ str:25, con:35, int:60, agi:30, sense:70 },
        damageType:'magic', attackStat:'int',
        skills:['commandOrder','infoLink','repositioning'],
        note:'전략/커맨더 · Dimension Ring(Unique, 단일 텔레포트 6h쿨)' },

      // 최태현 — B랭크 · 근접 딜러
      { id:'char_taehyun', name:'최태현', job:'무직업', position:'근거리물리', row:'front', rank:'B', level:45,
        stats:{ str:55, con:35, int:8, agi:52, sense:28 },
        damageType:'physical', attackStat:'str',
        skills:['soulHold','blackThornSlash'],
        note:'소울 홀드(Unique) · 검은 가시 롱소드(Rare)' }
    ];
  }
  function buildSampleMonsters() {
    return [
      { id:'mon_hound', name:'왜곡 사냥개', kind:'Normal', role:'skirmisher', position:'근거리물리', row:'front', rank:'E', stats:{ str:10, con:9, int:2, agi:11, sense:8 }, hp:80, mp:0, sp:40, atk:7, pdef:3, mdef:1, skills:[] },
      { id:'mon_lancer', name:'공허 창병', kind:'Normal', role:'fighter', position:'근거리물리', row:'front', rank:'E', stats:{ str:12, con:10, int:2, agi:9, sense:7 }, hp:90, mp:0, sp:55, atk:8, pdef:4, mdef:1, skills:[] },
      { id:'mon_echo_mage', name:'반향 주술체', kind:'Elite', role:'caster', position:'원거리마법', row:'back', rank:'D', stats:{ str:4, con:10, int:15, agi:8, sense:11 }, hp:220, mp:120, sp:40, atk:16, pdef:5, mdef:8, damageType:'magic', attackStat:'int', skills:['energyBolt','energyShower','shockwave'] },
      { id:'mon_gate_apex', name:'문턱의 포식자', kind:'Boss', role:'boss', position:'근거리물리', row:'front', rank:'D', stats:{ str:16, con:15, int:8, agi:10, sense:10 }, hp:520, mp:90, sp:120, atk:18, pdef:14, mdef:10, skills:['shieldBash','shockwave','fistStrike','taunt'] }
    ];
  }

  function buildDefaultInventory() {
    return { gold:0, bagId:'none', items:[], overflow:[], recent:[] };
  }

  function buildSampleEquipments() {
    // Sample equipment catalog: E/D/C rank, all 4 parts
    return [
      // ── E등급 무기 ──────────────────────────────────────────────
      { id:'eq_e_weapon_01', name:'협회 지급 대검', part:'weapon', rank:'E',
        enhance:0, infuse:0, maxInfuse:2, traits:[], durability:100, maxDurability:100,
        atk:5, pdef:0, mdef:0, mainStat:'str', resistType:'', resistPct:0,
        price:500000, note:'협회에서 신규 헌터에게 대량 보급하는 표준 규격 대검.' },
      { id:'eq_e_weapon_02', name:'E급 단검', part:'weapon', rank:'E',
        enhance:0, infuse:0, maxInfuse:2, traits:[], durability:100, maxDurability:100,
        atk:5, pdef:0, mdef:0, mainStat:'agi', resistType:'', resistPct:0,
        price:400000, note:'빠른 연속공격에 특화된 경량 단검.' },
      // ── E등급 보조무기 ──────────────────────────────────────────
      { id:'eq_e_subweapon_01', name:'낡은 방패', part:'subweapon', rank:'E',
        enhance:0, infuse:0, maxInfuse:1, traits:[], durability:100, maxDurability:100,
        atk:-1, pdef:2, mdef:0, mainStat:'con', resistType:'physical', resistPct:1,
        price:350000, note:'보스 껍데기와 석재를 융합해 조잡하게 만든 방패.' },
      // ── E등급 방어구 ──────────────────────────────────────────
      { id:'eq_e_armor_01', name:'가죽 갑옷', part:'armor', rank:'E',
        enhance:0, infuse:0, maxInfuse:2, traits:[], durability:100, maxDurability:100,
        atk:0, pdef:3, mdef:2, mainStat:'con', resistType:'physical', resistPct:1,
        price:450000, note:'기본 헌터 훈련복에 가죽 패딩을 덧댄 갑옷.' },
      { id:'eq_e_armor_02', name:'강화 면 로브', part:'armor', rank:'E',
        enhance:0, infuse:0, maxInfuse:2, traits:[], durability:100, maxDurability:100,
        atk:0, pdef:1, mdef:4, mainStat:'int', resistType:'magic', resistPct:1,
        price:450000, note:'마력이 주입된 직물로 제작된 마법사형 갑옷.' },
      // ── E등급 악세서리 ──────────────────────────────────────────
      { id:'eq_e_acc_01', name:'쇠반지', part:'accessory', rank:'E',
        enhance:0, infuse:0, maxInfuse:1, traits:[], durability:100, maxDurability:100,
        atk:0, pdef:0, mdef:0, mainStat:'str', resistType:'', resistPct:0,
        price:280000, note:'물리 공격력을 소폭 강화하는 단순한 금속 반지.' },
      // ── D등급 무기 ──────────────────────────────────────────────
      { id:'eq_d_weapon_01', name:'강철 대검', part:'weapon', rank:'D',
        enhance:0, infuse:0, maxInfuse:2, traits:[], durability:100, maxDurability:100,
        atk:15, pdef:0, mdef:0, mainStat:'str', resistType:'', resistPct:0,
        price:3000000, note:'D등급 던전에서 수거한 철광석으로 단조한 대검.' },
      { id:'eq_d_weapon_02', name:'마법 지팡이', part:'weapon', rank:'D',
        enhance:0, infuse:0, maxInfuse:2, traits:[], durability:100, maxDurability:100,
        atk:15, pdef:0, mdef:0, mainStat:'int', resistType:'', resistPct:0,
        price:3500000, note:'마력 증폭 크리스탈이 삽입된 D급 지팡이.' },
      // ── D등급 보조무기 ──────────────────────────────────────────
      { id:'eq_d_subweapon_01', name:'D급 철 방패', part:'subweapon', rank:'D',
        enhance:0, infuse:0, maxInfuse:1, traits:[], durability:100, maxDurability:100,
        atk:-3, pdef:6, mdef:0, mainStat:'con', resistType:'physical', resistPct:2,
        price:2200000, note:'두꺼운 철판으로 만든 D급 표준 방패.' },
      // ── D등급 방어구 ──────────────────────────────────────────
      { id:'eq_d_armor_01', name:'체인 갑옷', part:'armor', rank:'D',
        enhance:0, infuse:0, maxInfuse:2, traits:[], durability:100, maxDurability:100,
        atk:0, pdef:10, mdef:5, mainStat:'con', resistType:'physical', resistPct:2,
        price:2800000, note:'D급 금속 체인을 촘촘히 엮어 만든 갑옷. 총 스탯합 2.' },
      // ── D등급 악세서리 ──────────────────────────────────────────
      { id:'eq_d_acc_01', name:'헌터 인식표', part:'accessory', rank:'D',
        enhance:0, infuse:0, maxInfuse:1, traits:[], durability:100, maxDurability:100,
        atk:0, pdef:0, mdef:0, mainStat:'str', resistType:'', resistPct:0,
        price:2000000, note:'D등급 헌터 공식 인식표. 총 스탯합 1.' },
      // ── C등급 무기 ──────────────────────────────────────────────
      { id:'eq_c_weapon_01', name:'미스릴 롱소드', part:'weapon', rank:'C',
        enhance:0, infuse:0, maxInfuse:2, traits:[], durability:100, maxDurability:100,
        atk:25, pdef:0, mdef:0, mainStat:'str', resistType:'', resistPct:0,
        price:30000000, note:'C급 던전 보스에게서 얻은 미스릴로 제작.' },
      // ── C등급 방어구 ──────────────────────────────────────────
      { id:'eq_c_armor_01', name:'강화 플레이트', part:'armor', rank:'C',
        enhance:0, infuse:0, maxInfuse:2, traits:[], durability:100, maxDurability:100,
        atk:0, pdef:30, mdef:15, mainStat:'con', resistType:'physical', resistPct:3,
        price:28000000, note:'C급 금속 플레이트 풀아머. 총 스탯합 5.' },
      // ── C등급 악세서리 ──────────────────────────────────────────
      { id:'eq_c_acc_01', name:'마력 증폭 반지', part:'accessory', rank:'C',
        enhance:0, infuse:0, maxInfuse:1, traits:[], durability:100, maxDurability:100,
        atk:0, pdef:0, mdef:0, mainStat:'int', resistType:'', resistPct:0,
        price:25000000, note:'마법 피해를 증폭시키는 C급 마법 반지. 총 스탯합 3.' },
    ];
  }

  function buildDefaultDb() {
    return {
      inventory: buildDefaultInventory(),
      characters: [
        { id:'char_guide', name:'⭐ 캐릭터 가이드', job:'무직업', position:'전열탱커', row:'front', rank:'E', level:1,
          stats:{ str:10, con:10, int:10, agi:10, sense:10 },
          hp:100, mp:100, sp:100, atk:0, pdef:0, mdef:0,
          damageType:'physical', attackStat:'str', skills:[],
          note:'【캐릭터 만드는 법】\n1. "새 캐릭터" 클릭 → ID/이름/직업/포지션 입력\n2. 스탯 최소값=10. 모든 스탯 10일 때 HP=MP=SP=100\n3. HP=100+(CON-10)×10+(STR-10)×3\n4. MP=100+(INT-10)×10+(SEN-10)×3\n5. SP=100+(AGI-10)×10+(SEN-10)×3\n6. ATK/물방/마방은 기본 0 (장비·스킬로 증가)\n7. HP/MP/SP를 0으로 두면 스탯 기반 자동 계산\n8. 전열: front(탱커/근접) / mid(투척) / back(원거리/궁수/마법/힐러)\n9. 등급별 스탯합 기준: E:~70 / D:70~90 / C:90~120 / B:120~160 / A:160~200 / S:200~\n\n이 캐릭터는 삭제해도 됩니다.' }
      ],
      monsters: buildSampleMonsters(),
      personas: [
        { id:'persona_main', name:'기본 페르소나', text:'헌터 세계관용 기본 페르소나 메모.' }
      ],
      customSkills: [
        { id:'skill_guide', name:'⭐ 스킬가이드', grade:'E', category:'singleAttack', target:'singleEnemy',
          costs:{ mp:0, sp:0 }, coef:1.0, damageType:'physical', element:'none', statTypes:['str'], duration:0,
          desc:'【스킬 만드는 법】\n1. "새 스킬" 클릭 → ID/이름 입력\n2. 각 항목을 설정 후 저장\n\n【카테고리 설명】\nsingleAttack = 단일 공격 (적 1체)\naoeAttack = 광역 공격 (전체 적)\nsingleCC = 단일 CC (적 1체 + 행동방해)\naoeCC = 광역 CC (전체 적 + 행동방해)\nsingleHeal = 단일 회복 (아군 1체)\naoeHeal = 광역 회복 (전체 아군)\nbuff = 버프 (자신/아군 강화)\nutility = 유틸리티 (자원/상태 관리)\n\n【대상 설명】\nsingleEnemy = 적 1체\nallEnemies = 전체 적 (광역)\nrowFront = 전열 적만 (전열 광역)\nrowMid = 중열 적만\nrowBack = 후열 적만\nrowFrontMid = 전열+중열 적\nrowMidBack = 중열+후열 적\nsingleAlly = 아군 1체\nallAllies = 전체 아군\nself = 자기 자신\n※ 열 공격: 해당 열이 비면 가장 앞 열의 적을 공격\n\n【CC 종류 설명】\nstun = 기절 (행동불가, 1턴, 이후 5턴 면역)\nbind = 속박 (이동불가)\nsleep = 수면 (행동불가, 피격 시 해제, 이후 5턴 면역)\nsilence = 침묵 (스킬 사용불가)\nslow = 둔화 (명중률-30%, 회피율-50%)\n※ CC 확률: 비우면 100%. 0~1 사이 소수로 입력 (예: 0.3=30%)\n\n【상태이상 설명 및 기본 확률/턴수】\npoison = 독 — 확률28%, 3턴, 최대3중첩\n  효과: 매턴 방어무시 DoT (기본값×계수×0.2×중첩수)\nbleed = 출혈 — 확률28%, 3턴\n  효과: 발동 시 해당 공격 피해의 30% 추가피해(1회)\n  + 3턴간 받는 회복량 50% 감소\nburn = 화상 — 확률28%, 5턴, 최대5중첩\n  효과: 매턴 방어무시 DoT (기본값×계수×0.12×중첩수)\n  + 받는 데미지 +10% (중첩 무관)\ncurse = 저주 — 확률24%, 3턴\n  효과: 등급별 공격력/회복량 감소 (E:10%~S:30%)\nsilence = 침묵 — 확률20%, 3턴\n  효과: 스킬 사용불가 (기본공격만 가능)\nslow = 둔화 — 확률25%, 3턴\n  효과: 명중률 -30%, 회피율 -50%\n\n※ 상태이상 확률: 비우면 위 기본값 자동 적용\n0~1 사이 소수로 입력 (예: 0.5=50%)\n\n【등급별 계수 — 순수 공격 (단일 기준)】\n하한 → 상한\nE: 1.2 → 1.5\nD: 1.92 → 2.4\nC: 2.88 → 3.6\nB: 4.8 → 6.0\nA: 7.68 → 9.6\nS: 11.52 → 14.4\n광역/열공격 = 단일 × 0.58\n\n【CC/상태이상 스킬 추천 계수】\n상태이상이 붙는 스킬은 직접 데미지를 낮추는 대신\n상태이상 효과로 총 가치를 보상하는 구조.\n추천: 순수공격 하한값 × 0.8 (20% 약화)\n\n단일 CC/상태이상 추천계수:\nE: 0.96 / D: 1.54 / C: 2.30\nB: 3.84 / A: 6.14 / S: 9.22\n\n광역 CC/상태이상 추천계수 (단일×0.58):\nE: 0.56 / D: 0.89 / C: 1.33\nB: 2.23 / A: 3.56 / S: 5.35\n\n※ 밸런스 기준:\n직접피해 + 상태이상 효과(DoT/추가피해/디버프)\n총합이 최소 상한계수급 이상이면 적절.\n독/화상: 총합≈상한의 102%\n출혈: 직접+즉시추가≈상한의 83% + 회복량50%감소 유틸\n상태이상이 강할수록 계수를 더 낮춰도 됨.\n\n【데미지 공식】\n기본값 = (2 × 주스탯) + (3 × ATK)\n최종데미지 = 기본값 × 계수 × 크리배율 × 속성배율\n※ 크리티컬: ×1.5 / 속성유리: ×1.25 / 속성불리: ×0.75\n\n【상태이상 효과 공식】\n독(DoT): 매턴 기본값 × 계수 × 0.2 × 중첩수 (최대3)\n화상(DoT): 매턴 기본값 × 계수 × 0.12 × 중첩수 (최대5)\n  + 받는 데미지 +10% (중첩 무관)\n출혈: 발동 시 해당 공격 피해의 30% 추가피해(1회)\n  + 3턴간 받는 회복량 50% 감소\n저주: 등급별 공격력/회복량 감소 (E:10%~S:30%)\n\n【E급 예시 (주스탯15, ATK5)】\n기본값 = (2×15)+(3×5) = 45\n상한 직접피해 = 45×1.5 = 67.5\n\n■ 순수 단일공격 (계수1.35): 45×1.35 = 60.75\n■ 순수 광역공격 (계수0.78): 45×0.78 = 35.10\n\n■ 단일CC/상태이상 (추천계수0.96):\n  직접피해: 45×0.96 = 43.20\n  독1중첩 3턴합: 45×0.96×0.2×3 = 25.92\n  → 총합: 43.20+25.92 = 69.12 (상한의 102%) ✓\n  화상1중첩 5턴합: 45×0.96×0.12×5 = 25.92\n  → 총합: 43.20+25.92 = 69.12 + 피격+10% ✓\n  출혈 즉시추가: 43.20×0.3 = 12.96\n  → 총합: 43.20+12.96 = 56.16 (상한83%) + 회복량50%감소 ✓\n\n■ 광역CC/상태이상 (추천계수0.56):\n  직접피해: 45×0.56 = 25.20 (각 적)\n  독1중첩 3턴합: 45×0.56×0.2×3 = 15.12\n  → 총합: 25.20+15.12 = 40.32/적\n  출혈 즉시추가: 25.20×0.3 = 7.56\n  → 총합: 25.20+7.56 = 32.76/적 + 회복량50%감소\n\n이 스킬은 삭제해도 됩니다.' }
      ],
      rareMaterialPack: deepClone(DEFAULT_RARE_MATERIAL_PACK),
      rareMaterialCatalog: [],
      normalMaterialCatalog: [],
      equipments: buildSampleEquipments(),  // { id, name, part, rank, enhance, infuse, maxInfuse, traits, durability, maxDurability, price, atk, pdef, mdef, mainStat, resistType, resistPct, note }
      auctionListings: [],  // { id, item, askPrice, priceRatio, isNpc, listedAt }
      hmUsedListings: [],   // { id, item, usedPrice, conditionPct, isNpc, listedAt }
      team: [],             // [{ charId, ratio }] 팀원 + 정산 비율
      guildId: '',
      customGuildName: '',
      customGuildDesc: '',
      incomeLog: [],
      guildTaxLog: [],
      battleSetup: {
        partySlots: Array(MAX_PARTY).fill(''),
        enemySlots: ['mon_hound', 'mon_hound', 'mon_hound', 'mon_lancer', 'mon_lancer', 'mon_echo_mage', 'mon_gate_apex', '', '', '']
      }
    };
  }

function buildDefaultRuntime() {
  return {
    started:false, finished:false, outcome:'', round:0,
    party:[], enemies:[], queue:[], roundSummaries:[], llmBlock:'', logs:[],
    pendingActions:{},
    totals:{ partyDamage:0, enemyDamage:0, partyHealing:0, enemyHealing:0, partyKills:0, enemyKills:0 },
    warnings:[],
    expGained: 0,    // total EXP earned this battle
    expLog: []       // [{ name, rank, kind, exp, round }]
  };
}
function buildDefaultGateState() {
  return {
    rank:'E',
    size:'small',
    generated:[],
    selectedId:'',
    current:null,
    run:null
  };
}
function buildDefaultState() {
  return {
    visible:false,
    view:'hub',
    dbTab:'characters',
    selected:{ characters:'', monsters:'', personas:'', skills:'', materials:'', equipment:'' },
    runtime: buildDefaultRuntime(),
    gate: buildDefaultGateState(),
    assocFloor: '1',
    shopSub: '',
    shopHunterSub: '',
    shopMatQuery: '',
    shopMatRank: '',
    shopMatTier: '',
    shopMatPage: 0,
    shopBmTab: 'rare',
    guildSub: '',
    settlePartyCount: '3',
    settleType: 'association',
    settleGuildPct: '40',
    settleDate: '',
    settleGearItems: [],
    taxIncome: '',
    taxPayMonth: '',
    equipPartFilter: '',
    shopEquipRank: '',
    shopEquipPart: '',
    shopRepairSel: '',
    shopHmTab: 'sell',
    shopHmRank: '',
    shopHmPart: '',
    auctionTab: 'browse',
    auctionRankFilter: '',
    auctionSearchQ: '',
    auctionSellSel: '',
    auctionBid: null,
    auctionSell: null,
    charInvTab: 'equip',   // 'equip' | 'items'
    personaInvTab: 'equip', // 'equip' | 'items'
    teamView: 'members',   // 'members' | 'settle'
    settleItemSel: {},     // { key: true/false } 판매할 아이템 선택
    settleDistMode: 'equal' // 'equal' | 'ratio'
  };
}

  const model = {
    db: buildDefaultDb(),
    state: buildDefaultState(),
    root:null
  };

  // 판매 경매 단계별 공개 타이머
  let _sellAuctionTimerId = null;
  function _startSellAuctionTimer() {
    if (_sellAuctionTimerId) clearInterval(_sellAuctionTimerId);
    _sellAuctionTimerId = setInterval(async () => {
      const ss = model.state.auctionSell;
      if (!ss || ss.done !== false) { clearInterval(_sellAuctionTimerId); _sellAuctionTimerId = null; return; }
      const total = (ss.fullLog || []).length;
      const next = (ss.revealedCount || 0) + 1;
      if (next >= total) {
        ss.revealedCount = total;
        clearInterval(_sellAuctionTimerId); _sellAuctionTimerId = null;
        await saveState(); renderApp();
        // 로그 div 스크롤 하단
        setTimeout(() => { const el = document.getElementById('gb-sell-auction-log'); if (el) el.scrollTop = el.scrollHeight; }, 50);
      } else {
        ss.revealedCount = next;
        await saveState(); renderApp();
        setTimeout(() => { const el = document.getElementById('gb-sell-auction-log'); if (el) el.scrollTop = el.scrollHeight; }, 50);
      }
    }, 2500);
  }

  function getCustomSkillMap() {
    const map = {};
    (model.db.customSkills || []).forEach(sk => { if (sk && sk.id) map[sk.id] = deepClone(sk); });
    return map;
  }
  function getAllSkillMap() {
    return Object.assign({}, deepClone(BUILTIN_SKILLS), getCustomSkillMap());
  }
  function resolveSkillForUnit(unit, skillId) {
    const def = getAllSkillMap()[skillId];
    if (!def) return null;
    const skill = deepClone(def);
    const rank = String(unit.rank || skill.grade || 'E').toUpperCase();
    if (skill.byRank && skill.byRank[rank]) {
      const patch = skill.byRank[rank];
      Object.keys(patch).forEach((key) => {
        if (patch[key] && typeof patch[key] === 'object' && !Array.isArray(patch[key])) {
          skill[key] = Object.assign({}, skill[key] || {}, patch[key]);
        } else {
          skill[key] = patch[key];
        }
      });
    }
    if (skill.category === 'aoeCC' && skill.baseSingleCoef != null) {
      skill.coef = round3(skill.baseSingleCoef * 0.5);
      skill.costs = skill.costs || { mp:0, sp:0 };
      skill.costs.mp = Math.ceil((skill.costs.mp || 0) * 2);
      skill.costs.sp = Math.ceil((skill.costs.sp || 0) * 2);
    }
    skill.target = skill.target || (skill.category === 'aoeAttack' || skill.category === 'aoeCC' ? 'allEnemies' : 'singleEnemy');
    skill.damageType = skill.damageType || unit.damageType || 'physical';
    skill.element = normElement(skill.element || 'none');
    return skill;
  }
  function listKnownSkillDefs(unit) {
    return (unit.skills || []).map(id => resolveSkillForUnit(unit, id)).filter(Boolean);
  }
  function normaliseStats(raw) {
    const s = raw || {};
    return { str:Number(s.str || 5), con:Number(s.con || 5), int:Number(s.int || 5), agi:Number(s.agi || 5), sense:Number(s.sense || 5) };
  }
  function applyPassiveInitialization(unit) {
    unit.passiveBonuses = { str:0, con:0, int:0, agi:0, sense:0, pdef:0, mdef:0 };
    unit.passiveMods = { shieldSpMul:1, daggerSpMul:1 };
    (unit.skills || []).forEach(skillId => {
      const skill = resolveSkillForUnit(unit, skillId);
      if (!skill || skill.category !== 'passive') return;
      if (skill.passiveBonuses) {
        Object.keys(skill.passiveBonuses).forEach(key => {
          unit.passiveBonuses[key] = (unit.passiveBonuses[key] || 0) + Number(skill.passiveBonuses[key] || 0);
        });
      }
      if (skill.passiveMods) {
        Object.keys(skill.passiveMods).forEach(key => {
          const cur = unit.passiveMods[key] == null ? 1 : unit.passiveMods[key];
          unit.passiveMods[key] = round3(cur * Number(skill.passiveMods[key]));
        });
      }
    });
  }
  function buildUnit(entry, side, slotIndex) {
    const rank = String(entry.rank || 'E').toUpperCase();
    const row = normRow(entry.row) || inferRow(entry.position, entry.job);
    const meta = parseMonsterMeta(entry);
    const isMonster = side === 'enemies';
    const monsterProfile = isMonster ? monsterProfileForEntry(entry) : null;
    // 몬스터: 개별 스탯 없음, HP/ATK만 프로필 테이블에서 가져옴
    const stats = isMonster ? { str:0, con:0, int:0, agi:0, sense:0 } : normaliseStats(entry.stats);
    const baseHp = Number(isMonster ? monsterProfile.hp : (entry.hp || (100 + (stats.con - 10) * 10 + (stats.str - 10) * 3)));
    const defaultMp = isMonster ? monsterProfile.mp : (100 + (stats.int - 10) * 10 + (stats.sense - 10) * 3);
    const defaultSp = isMonster ? monsterProfile.sp : (100 + (stats.agi - 10) * 10 + (stats.sense - 10) * 3);
    const allSkillMap = getAllSkillMap();
    const hasMagicSkill = Array.isArray(entry.skills) && entry.skills.some(id => {
      const sk = allSkillMap[String(id || '').trim()];
      return sk && ((sk.damageType || '') === 'magic' || (Array.isArray(sk.statTypes) && sk.statTypes.includes('int')) || String(sk.category || '').includes('heal') || String(sk.category || '').includes('buff'));
    });
    const baseMp = Number(entry.mp != null && !isMonster ? entry.mp : (isMonster ? Math.max(Number(entry.mp || 0), hasMagicSkill || entry.damageType === 'magic' ? defaultMp : Math.floor(defaultMp * 0.25)) : defaultMp));
    const baseSp = Number(entry.sp != null && !isMonster ? entry.sp : (isMonster ? Math.max(Number(entry.sp || 0), entry.damageType !== 'magic' || !hasMagicSkill ? defaultSp : Math.floor(defaultSp * 0.7)) : defaultSp));
    const unit = {
      uid: `${side}_${entry.id}_${slotIndex}_${Date.now()}_${Math.floor(Math.random()*9999)}`,
      baseId: entry.id,
      sourceId: entry.id,  // tracks original DB character/monster id for EXP flush
      name: entry.name || entry.id || '유닛',
      side,
      isMonster,
      monsterProfile,
      monsterBaseDamage: isMonster ? Number(monsterProfile.damage || 0) : 0,
      monsterSkillMul: isMonster ? Number(monsterProfile.skillMul || 1) : 1,
      job: entry.job || '',
      position: entry.position || entry.role || '',
      role: entry.role || '',
      row,
      kind: entry.kind || (side === 'party' ? 'Hunter' : 'Normal'),
      rank,
      stats,
      hp: Number(entry.currentHp != null ? entry.currentHp : baseHp), maxHp: baseHp,
      mp: Number(entry.currentMp != null ? entry.currentMp : baseMp), maxMp: baseMp,
      sp: Number(entry.currentSp != null ? entry.currentSp : baseSp), maxSp: baseSp,
      // 몬스터: ATK = 프로필 damage, pdef/mdef = 0 (개별 스탯 없음)
      atk: Number(isMonster ? monsterProfile.damage : (entry.atk != null ? entry.atk : 0)),
      pdef: Number(isMonster ? 0 : (entry.pdef != null ? entry.pdef : 0)),
      mdef: Number(isMonster ? 0 : (entry.mdef != null ? entry.mdef : 0)),
      damageType: entry.damageType || inferDamageType(entry.position, entry.job),
      attackStat: entry.attackStat || inferAttackStat(entry.position, entry.job),
      skills: Array.isArray(entry.skills) ? entry.skills.slice() : [],
      ai: entry.ai || null,
      buffs: Array.isArray(entry.buffs) ? deepClone(entry.buffs) : [],
      statuses: Object.assign({ stun:0, bind:0, sleep:0, poison:0, bleed:0, burn:0, curse:0, poisonStacks:0, poisonPower:0, bleedPower:0, burnStacks:0, burnPower:0, stunResistTimer:0, sleepResistTimer:0, bleedHealReduction:0 }, deepClone(entry.statuses || {})),
      cooldowns: {},
      lastAction:'',
      dead:false,
      threatBase: Number(entry.threatBase != null ? entry.threatBase : inferThreatBase(entry.position, row)),
      threatBonus:0,
      note: entry.note || '',
      resists: normResists(entry.resists),
      species: meta.species || '',
      speciesLabel: meta.speciesLabel || '',
      baseElement: normElement(meta.baseElement || entry.baseElement || entry.element || 'none'),
      immunities: Array.isArray(meta.immunities) ? meta.immunities.slice() : [],
      damageTakenMods: Object.assign({}, meta.damageTakenMods || {}),
      bonusVsBleeding: Number(meta.bonusVsBleeding || 1),
      aloneDamageTaken: Number(meta.aloneDamageTaken || 1),
      regenPct: Number(meta.regenPct || 0),
      regenBlockedBy: Array.isArray(meta.regenBlockedBy) ? meta.regenBlockedBy.slice() : [],
      onHitStatus: normStatus(meta.onHitStatus || ''),
      onHitChance: Number(meta.onHitChance || 0),
      onHitTurns: Number(meta.onHitTurns || 0)
    };
    applyPassiveInitialization(unit);
    return unit;
  }

  function getCharById(id) { return (model.db.characters || []).find(x => x.id === id) || null; }
  function getMonsterById(id) { return (model.db.monsters || []).find(x => x.id === id) || null; }
  function getPersonaById(id) { return (model.db.personas || []).find(x => x.id === id) || null; }
  function getCustomSkillById(id) { return (model.db.customSkills || []).find(x => x.id === id) || null; }
  function getRareMaterialPack() {
    if (!model.db.rareMaterialPack || typeof model.db.rareMaterialPack !== 'object') model.db.rareMaterialPack = deepClone(DEFAULT_RARE_MATERIAL_PACK);
    if (!model.db.rareMaterialPack.valueScales) model.db.rareMaterialPack.valueScales = deepClone(DEFAULT_RARE_MATERIAL_PACK.valueScales || {});
    if (!Array.isArray(model.db.rareMaterialPack.traits)) model.db.rareMaterialPack.traits = deepClone(DEFAULT_RARE_MATERIAL_PACK.traits || []);
    if (model.db.rareMaterialPack.version == null) model.db.rareMaterialPack.version = DEFAULT_RARE_MATERIAL_PACK.version || 1;
    if (model.db.rareMaterialPack.note == null) model.db.rareMaterialPack.note = DEFAULT_RARE_MATERIAL_PACK.note || '';
    return model.db.rareMaterialPack;
  }
  function getMaterialTraitById(id) { return (getRareMaterialPack().traits || []).find(x => x.id === id) || null; }
  function getRareMaterialCatalog() {
    if (!Array.isArray(model.db.rareMaterialCatalog)) model.db.rareMaterialCatalog = [];
    // Apply RARE_PRICE_BY_RANK_TIER overrides — replaces baked-in JSON suggestedPrice
    return model.db.rareMaterialCatalog.map(it => {
      const tbl = RARE_PRICE_BY_RANK_TIER[String(it.rank || 'E').toUpperCase()] || RARE_PRICE_BY_RANK_TIER.E;
      const override = (it.priceTier && tbl[it.priceTier]) ? tbl[it.priceTier] : (tbl.tier3 || 0);
      return override ? Object.assign({}, it, { suggestedPrice: override }) : it;
    });
  }
  function getNormalMaterialCatalog() {
    if (!Array.isArray(model.db.normalMaterialCatalog)) model.db.normalMaterialCatalog = [];
    return model.db.normalMaterialCatalog;
  }
  function normalizeRank(rank) { return String(rank || 'E').toUpperCase(); }
  function rankIndex(rank) { return Math.max(0, GRADE_ORDER.indexOf(normalizeRank(rank))); }
  function rankAtLeast(candidate, minimum) { return rankIndex(candidate) >= rankIndex(minimum); }
  function normalizeSpeciesId(species) {
    const raw = String(species || '').trim();
    if (!raw) return '';
    if (SPECIES_KEY_BY_LABEL[raw]) return SPECIES_KEY_BY_LABEL[raw];
    const lowered = raw.toLowerCase();
    if (SPECIES_LABELS[lowered]) return lowered;
    return lowered;
  }
  function normalizeMonsterKind(kind) {
    const k = String(kind || 'Normal').toLowerCase();
    if (k.includes('boss')) return 'Boss';
    if (k.includes('elite')) return 'Elite';
    return 'Normal';
  }
  function safeMaterialKey(base) { return slugify(String(base || 'mat_unknown')); }
  function weightedDropOption(options) {
    const list = Array.isArray(options) ? options.map(opt => ({ value:opt, weight:Number(opt.weight || 0) || 1 })) : [];
    return weightedPick(list) || (Array.isArray(options) && options[0]) || null;
  }
  function findNormalCatalogEntryForSource(sourceRef, rank) {
    const catalog = getNormalMaterialCatalog();
    const wantedRank = normalizeRank(rank);
    if (!catalog.length) return null;
    const sourceId = sourceRef && sourceRef.id ? String(sourceRef.id) : '';
    const byId = sourceId ? catalog.find(it => (String(it.sourceMonsterId || '') === sourceId || slugify(it.sourceMonsterId || '') === slugify(sourceId)) && normalizeRank(it.rank) === wantedRank) : null;
    if (byId) return byId;
    const sourceName = sourceRef && sourceRef.name ? String(sourceRef.name) : '';
    const byName = sourceName ? catalog.find(it => (String(it.sourceMonsterName || '') === sourceName || slugify(it.sourceMonsterName || '') === slugify(sourceName)) && normalizeRank(it.rank) === wantedRank) : null;
    if (byName) return byName;
    const speciesKey = normalizeSpeciesId(sourceRef && sourceRef.species ? sourceRef.species : '');
    const bySpecies = speciesKey ? catalog.find(it => normalizeSpeciesId(it.species || '') === speciesKey && normalizeRank(it.rank) === wantedRank) : null;
    if (bySpecies) return bySpecies;
    return catalog.find(it => normalizeRank(it.rank) === wantedRank && (!speciesKey || normalizeSpeciesId(it.species || '') === speciesKey)) || catalog.find(it => normalizeRank(it.rank) === wantedRank) || null;
  }
  function findRareCatalogItemForSource(sourceRef, rank, traitId) {
    const catalog = getRareMaterialCatalog();
    const wantedRank = normalizeRank(rank);
    if (!catalog.length) return null;
    let pool = catalog.filter(it => normalizeRank(it.rank) === wantedRank);
    if (sourceRef && sourceRef.id) {
      const byId = pool.filter(it => String(it.sourceMonsterId || '') === String(sourceRef.id));
      if (byId.length) pool = byId;
    } else if (sourceRef && sourceRef.name) {
      const byName = pool.filter(it => String(it.sourceMonsterName || '') === String(sourceRef.name));
      if (byName.length) pool = byName;
    }
    if (traitId) {
      const byTrait = pool.filter(it => String(it.traitId || '') === String(traitId));
      if (byTrait.length) pool = byTrait;
    }
    return sampleOne(pool) || null;
  }
  function upsertRewardItem(store, key, payload, count) {
    const safeKey = safeMaterialKey(key || payload.id || payload.name);
    if (!store[safeKey] || typeof store[safeKey] !== 'object') {
      // {count:0} is placed LAST so it always overrides any count in payload.
      // Without this, deepClone(payload) would overwrite the initial {count:0}
      // and the += count below would double-count (e.g., x1 → x2 → x4 across merges).
      store[safeKey] = Object.assign({}, deepClone(payload || {}), { count: 0 });
    }
    store[safeKey].count = Number(store[safeKey].count || 0) + Number(count || 1);
    return store[safeKey];
  }


function ensureSelections() {
  const sel = model.state.selected;
  if (!sel.characters && model.db.characters[0]) sel.characters = model.db.characters[0].id;
  if (sel.characters && !getCharById(sel.characters) && model.db.characters[0]) sel.characters = model.db.characters[0].id;
  if (!sel.monsters && model.db.monsters[0]) sel.monsters = model.db.monsters[0].id;
  if (sel.monsters && !getMonsterById(sel.monsters) && model.db.monsters[0]) sel.monsters = model.db.monsters[0].id;
  if (!sel.personas && model.db.personas[0]) sel.personas = model.db.personas[0].id;
  if (sel.personas && !getPersonaById(sel.personas) && model.db.personas[0]) sel.personas = model.db.personas[0].id;
  if (!sel.skills && model.db.customSkills[0]) sel.skills = model.db.customSkills[0].id;
  if (sel.skills && !getCustomSkillById(sel.skills) && !BUILTIN_SKILLS[sel.skills] && model.db.customSkills[0]) sel.skills = model.db.customSkills[0].id;
  const matPack = getRareMaterialPack();
  if (!sel.materials && matPack.traits[0]) sel.materials = matPack.traits[0].id;
  if (sel.materials && !getMaterialTraitById(sel.materials) && matPack.traits[0]) sel.materials = matPack.traits[0].id;
  const eqs = model.db.equipments || [];
  if (!sel.equipment && eqs[0]) sel.equipment = eqs[0].id;
  if (sel.equipment && !eqs.find(e => e.id === sel.equipment) && eqs[0]) sel.equipment = eqs[0].id;
}

function weightedChoice(list) {
  const total = list.reduce((acc, row) => acc + Number(row[1] || 0), 0);
  let roll = Math.random() * total;
  for (const row of list) {
    roll -= Number(row[1] || 0);
    if (roll <= 0) return row[0];
  }
  return list.length ? list[list.length - 1][0] : null;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sampleOne(arr) { return arr && arr.length ? arr[randInt(0, arr.length - 1)] : null; }
function chance(prob) { return Math.random() < prob; }
function normGateSize(v) {
  const s = String(v || '').toLowerCase();
  if (s.includes('large') || s.includes('대')) return 'large';
  if (s.includes('medium') || s.includes('중')) return 'medium';
  return 'small';
}
function getSpeciesLabel(code) { return SPECIES_LABELS[code] || code || '미상'; }
function gateComboKey(a, b) { return [String(a || ''), String(b || '')].sort().join('+'); }

// ── EXP helper functions ──────────────────────────────────────────────────────
function expNeededForLevel(level) {
  const lv = Math.max(1, Math.floor(level));
  return (lv * lv * 10) + 100;
}
function expForLevelRange(fromLevel, toLevel) {
  let total = 0;
  for (let lv = Math.max(1, fromLevel); lv < toLevel; lv++) total += expNeededForLevel(lv);
  return total;
}
function rollKillExp(rank, kind) {
  const base = EXP_BASE_BY_RANK[String(rank || 'E').toUpperCase()] || EXP_BASE_BY_RANK.E;
  const normKind = normalizeMonsterKind ? normalizeMonsterKind(kind || 'Normal') : String(kind || 'Normal');
  const range = EXP_KIND_MULT_RANGE[normKind] || EXP_KIND_MULT_RANGE.Normal;
  const mult = range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
  return base * mult;
}
// Award exp to a character DB entry; returns { levelsGained, newLevel, oldLevel, messages }
function applyExpToCharacter(charEntry, expGained) {
  if (!charEntry || expGained <= 0) return { levelsGained:0, newLevel:charEntry ? (charEntry.level || 1) : 1, oldLevel:charEntry ? (charEntry.level || 1) : 1, messages:[] };
  if (!charEntry.level || charEntry.level < 1) charEntry.level = 1;
  if (charEntry.exp == null) charEntry.exp = 0;
  if (charEntry.totalExp == null) charEntry.totalExp = 0;
  if (charEntry.freeStatPoints == null) charEntry.freeStatPoints = 0;
  charEntry.exp = Number(charEntry.exp) + expGained;
  charEntry.totalExp = Number(charEntry.totalExp) + expGained;
  const oldLevel = charEntry.level;
  const messages = [];
  const maxLv = MAX_LEVEL_BY_RANK[String(charEntry.rank||'E').toUpperCase()] || EXP_MAX_LEVEL;
  while (charEntry.level < maxLv) {
    const needed = expNeededForLevel(charEntry.level);
    if (charEntry.exp < needed) break;
    charEntry.exp -= needed;
    charEntry.level += 1;
    charEntry.freeStatPoints = (charEntry.freeStatPoints || 0) + 2;
    // 레벨업 보상: HP+2, MP+2, SP+2
    charEntry.hp = (Number(charEntry.hp) || 0) + 2;
    charEntry.mp = (Number(charEntry.mp) || 0) + 2;
    charEntry.sp = (Number(charEntry.sp) || 0) + 2;
    messages.push(`${charEntry.name} Lv${charEntry.level - 1} → Lv${charEntry.level} (레벨업! 스탯포인트 +2)`);
  }
  if (charEntry.level >= maxLv) { charEntry.exp = 0; }
  return { levelsGained: charEntry.level - oldLevel, newLevel: charEntry.level, oldLevel, messages };
}


function gateStateSafe() {
  if (!model.state.gate || typeof model.state.gate !== 'object') model.state.gate = buildDefaultGateState();
  return model.state.gate;
}
// Record a kill EXP event in the runtime (call whenever a monster dies by party action)
function recordKillExp(runtime, deadUnit) {
  if (!deadUnit || !deadUnit.isMonster) return;
  const exp = rollKillExp(deadUnit.rank || 'E', deadUnit.kind || 'Normal');
  if (!runtime.expLog) runtime.expLog = [];
  if (runtime.expGained == null) runtime.expGained = 0;
  runtime.expGained += exp;
  runtime.expLog.push({ name: deadUnit.name, rank: deadUnit.rank || 'E', kind: deadUnit.kind || 'Normal', exp, round: runtime.round });
}
// Apply accumulated runtime EXP to all DB party characters (call on Victory)
function flushExpToDb(runtime) {
  const totalExp = runtime.expGained || 0;
  if (totalExp <= 0) return [];
  const results = [];
  (runtime.party || []).forEach(unit => {
    if (!unit.sourceId) return;
    const charEntry = (model.db.characters || []).find(c => c.id === unit.sourceId);
    if (!charEntry) return;
    const r = applyExpToCharacter(charEntry, totalExp);
    results.push({ name: charEntry.name, exp: totalExp, ...r });
  });
  return results;
}

function getAvailableSpeciesFromDb() {
  const set = new Set();
  (model.db.monsters || []).forEach(mon => {
    const meta = parseMonsterMeta(mon);
    const sp = meta.species || inferSpecies(mon.species || mon.note || mon.id || mon.name);
    if (sp) set.add(sp);
  });
  const arr = Array.from(set);
  return arr.length ? arr : ['undead','ghost','beast','plant','slime','construct','elemental','demon','frost','celestial'];
}
function pickGateSpeciesPair() {
  const available = getAvailableSpeciesFromDb();
  const primary = sampleOne(available) || 'undead';
  const compat = (GATE_SPECIES_COMPAT[primary] || []).filter(sp => available.includes(sp) && sp !== primary);
  const secondary = compat.length ? sampleOne(compat) : sampleOne(available.filter(sp => sp !== primary)) || primary;
  return [primary, secondary];
}
function gateNameFor(primary, secondary) {
  const combo = GATE_COMBO_PLACES[gateComboKey(primary, secondary)] || GATE_COMBO_PLACES[gateComboKey(secondary, primary)];
  if (combo && combo.length) return sampleOne(combo);
  const adj = sampleOne((GATE_NAME_PARTS[primary] || {}).adjectives || ['기이한']);
  const placeSrc = ((GATE_NAME_PARTS[secondary] || {}).places || []).concat((GATE_NAME_PARTS[primary] || {}).places || []);
  const place = sampleOne(placeSrc) || '균열';
  return `${adj} ${place}`;
}
function inferMonsterSpecies(mon) {
  const meta = parseMonsterMeta(mon);
  return meta.species || inferSpecies(mon.species || mon.note || mon.id || mon.name);
}
function normaliseKind(kind) {
  const s = String(kind || 'Normal').toLowerCase();
  if (s.includes('boss')) return 'Boss';
  if (s.includes('elite')) return 'Elite';
  return 'Normal';
}
function filterMonsterPool({ speciesList, rank, kind }) {
  const allowed = new Set((speciesList || []).filter(Boolean));
  return (model.db.monsters || []).filter(mon => {
    const species = inferMonsterSpecies(mon);
    const monKind = normaliseKind(mon.kind);
    return (!allowed.size || allowed.has(species)) && (!rank || String(mon.rank || 'E').toUpperCase() === String(rank || 'E').toUpperCase()) && (!kind || monKind === kind);
  });
}
function findMonsterCandidates(speciesList, rank, kind) {
  const exact = filterMonsterPool({ speciesList, rank, kind });
  if (exact.length) return exact;
  const idx = gradeIndex(rank);
  const around = [];
  if (idx > 0) around.push(GRADE_ORDER[idx - 1]);
  if (idx < GRADE_ORDER.length - 1) around.push(GRADE_ORDER[idx + 1]);
  for (const r of around) {
    const pool = filterMonsterPool({ speciesList, rank:r, kind });
    if (pool.length) return pool;
  }
  const sameSpeciesAnyRank = filterMonsterPool({ speciesList, rank:'', kind });
  if (sameSpeciesAnyRank.length) return sameSpeciesAnyRank;
  const sameKindAny = (model.db.monsters || []).filter(mon => normaliseKind(mon.kind) === kind);
  if (sameKindAny.length) return sameKindAny;
  return (model.db.monsters || []).slice();
}
function chooseSpeciesWeighted(primary, secondary, majorBias) {
  return chance(majorBias == null ? 0.7 : majorBias) ? primary : (secondary || primary);
}
function buildGatePreviewEncounter(gate) {
  const sizeMeta = GATE_SIZE_META[gate.size] || GATE_SIZE_META.small;
  const enemyIds = [];
  const preview = [];
  const normalCount = randInt(sizeMeta.previewNormal[0], sizeMeta.previewNormal[1]);
  const eliteCount = randInt(sizeMeta.previewElite[0], sizeMeta.previewElite[1]);
  // 보스는 게이트 마지막방에 무조건 등장
  const bossCount = randInt(sizeMeta.boss[0], sizeMeta.boss[1]);
  for (let i = 0; i < normalCount; i += 1) {
    const species = chooseSpeciesWeighted(gate.primarySpecies, gate.secondarySpecies, 0.7);
    const pool = findMonsterCandidates([species], gate.rank, 'Normal');
    const chosen = sampleOne(pool);
    if (chosen) {
      enemyIds.push(chosen.id);
      preview.push(`${chosen.name} [${chosen.rank}/${chosen.kind || 'Normal'}]`);
    }
  }
  for (let i = 0; i < eliteCount; i += 1) {
    const species = chooseSpeciesWeighted(gate.primarySpecies, gate.secondarySpecies, 0.8);
    const pool = findMonsterCandidates([species], gate.rank, 'Elite');
    const chosen = sampleOne(pool);
    if (chosen) {
      enemyIds.push(chosen.id);
      preview.push(`${chosen.name} [${chosen.rank}/${chosen.kind || 'Elite'}]`);
    }
  }
  for (let i = 0; i < bossCount; i += 1) {
    const pool = findMonsterCandidates([gate.primarySpecies], gate.rank, 'Boss');
    const chosen = sampleOne(pool);
    if (chosen) {
      enemyIds.push(chosen.id);
      preview.push(`${chosen.name} [${chosen.rank}/${chosen.kind || 'Boss'}]`);
    }
  }
  while (enemyIds.length < MAX_ENEMIES) enemyIds.push('');
  return { enemySlots: enemyIds.slice(0, MAX_ENEMIES), preview };
}
// 광맥 주사위 시스템
function rollVeinCount(sizeKey) {
  const roll = randInt(1, 100);
  if (sizeKey === 'small') {
    if (roll <= 20) return 0;
    if (roll <= 70) return 1;
    return 2;
  }
  if (sizeKey === 'medium') {
    if (roll <= 20) return 1;
    if (roll <= 70) return 2;
    return 3;
  }
  // large
  if (roll <= 15) return 2;
  if (roll <= 55) return 3;
  if (roll <= 85) return 4;
  return 5;
}
function generateGateOption(size, idx, forcedRank) {
  const sizeKey = normGateSize(size);
  const sizeMeta = GATE_SIZE_META[sizeKey] || GATE_SIZE_META.small;
  const [primarySpecies, secondarySpecies] = pickGateSpeciesPair();
  const rank = String(forcedRank || weightedChoice(GATE_RANK_WEIGHTS[sizeKey] || GATE_RANK_WEIGHTS.small) || 'E').toUpperCase();
  const normalCount = randInt(sizeMeta.normal[0], sizeMeta.normal[1]);
  const eliteCount = randInt(sizeMeta.elite[0], sizeMeta.elite[1]);
  const bossCount = randInt(sizeMeta.boss[0], sizeMeta.boss[1]);
  const veinCount = rollVeinCount(sizeKey);
  const nodeCount = randInt(sizeMeta.nodes[0], sizeMeta.nodes[1]);
  const title = gateNameFor(primarySpecies, secondarySpecies);
  const preview = buildGatePreviewEncounter({ size:sizeKey, rank, primarySpecies, secondarySpecies });
  return {
    id: slugify(`${sizeKey}_${rank}_${title}_${Date.now()}_${idx}_${Math.floor(Math.random()*1000)}`),
    title,
    rank,
    size:sizeKey,
    sizeLabel:sizeMeta.label,
    primarySpecies,
    primarySpeciesLabel:getSpeciesLabel(primarySpecies),
    secondarySpecies,
    secondarySpeciesLabel:getSpeciesLabel(secondarySpecies),
    normalCount,
    eliteCount,
    bossCount,
    veinCount,
    nodeCount,
    previewEnemySlots:preview.enemySlots,
    previewLines:preview.preview,
    description:`${sizeMeta.label} ${rank} 게이트. ${getSpeciesLabel(primarySpecies)} 중심, ${getSpeciesLabel(secondarySpecies)} 변이 동반.`
  };
}
function generateGateOptions(size, rank) {
  const sizeKey = normGateSize(size);
  const sizeMeta = GATE_SIZE_META[sizeKey] || GATE_SIZE_META.small;
  const forcedRank = String(rank || gateStateSafe().rank || 'E').toUpperCase();
  const list = [];
  for (let i = 0; i < sizeMeta.options; i += 1) list.push(generateGateOption(sizeKey, i, forcedRank));
  const gs = gateStateSafe();
  gs.rank = forcedRank;
  gs.size = sizeKey;
  gs.generated = list;
  gs.selectedId = list[0] ? list[0].id : '';
  if (!gs.current || gs.current.size !== sizeKey || gs.current.rank !== forcedRank) gs.current = null;
}
function getSelectedGeneratedGate() {
  const gs = gateStateSafe();
  return (gs.generated || []).find(g => g.id === gs.selectedId) || null;
}

function lowerGrade(rank) {
  const idx = gradeIndex(rank);
  return idx > 0 ? GRADE_ORDER[idx - 1] : '';
}

function getRareMaterialScaleKeys() {
  return Object.keys((getRareMaterialPack().valueScales || {}));
}
function resolveMaterialTraitRef(ref) {
  const key = String(ref || '').trim();
  if (!key) return null;
  const pack = getRareMaterialPack();
  const traits = pack.traits || [];
  const byId = traits.find(t => t.id === key);
  if (byId) return byId;
  const alias = RARE_TRAIT_LEGACY_ALIASES[key];
  if (alias) {
    const aliased = traits.find(t => t.id === alias);
    if (aliased) return aliased;
  }
  return traits.find(t => String(t.name || '').trim() === key) || null;
}
function traitScaleValue(trait, rank) {
  if (!trait || !trait.scale) return null;
  const scale = (getRareMaterialPack().valueScales || {})[trait.scale];
  if (!scale) return null;
  const val = scale[String(rank || 'E').toUpperCase()];
  return val == null ? null : Number(val);
}
function traitScaleValueText(trait, rank) {
  const val = traitScaleValue(trait, rank);
  if (val == null || Number.isNaN(val)) return '';
  return '+' + val + '%';
}
function rareTraitDisplayLabel(ref, rank) {
  const trait = resolveMaterialTraitRef(ref);
  if (!trait) return String(ref || '');
  const valText = traitScaleValueText(trait, rank);
  return trait.name + (valText ? ' ' + valText : '');
}
function pickRareTraitByFamily(family) {
  const ids = RARE_FAMILY_PRESETS[family] || [];
  const pack = getRareMaterialPack();
  const pool = (pack.traits || []).filter(t => ids.includes(t.id));
  if (pool.length) return sampleOne(pool).id;
  return RARE_TRAIT_LABELS[family] || family;
}
function createRewardBucket() {
  return { normalMaterials:{}, rareMaterials:{}, manaStones:{}, notes:[] };
}
function mergeRewardBucket(dst, src) {
  ['normalMaterials','rareMaterials'].forEach(key => {
    Object.keys(src[key] || {}).forEach(k => {
      const row = src[key][k];
      if (row && typeof row === 'object') upsertRewardItem(dst[key], k, row, Number(row.count || 0));
      else dst[key][k] = (dst[key][k] || 0) + Number(row || 0);
    });
  });
  Object.keys(src.manaStones || {}).forEach(k => { dst.manaStones[k] = (dst.manaStones[k] || 0) + Number(src.manaStones[k] || 0); });
  if (Array.isArray(src.notes) && src.notes.length) dst.notes = (dst.notes || []).concat(src.notes);
  return dst;
}

function fallbackNormalMaterialName(sourceRef, rank) {
  const speciesKey = normalizeSpeciesId(sourceRef && sourceRef.species ? sourceRef.species : '');
  const name = String((sourceRef && sourceRef.name) || '').trim();
  if (name) {
    const trimmed = name.replace(/^(썩은|부패한|핏빛의|역병 걸린|검게 마른|식어버린|무너진|저주받은|혼탁한|메마른|울부짖는|떠도는|희미한|원한 맺힌|속삭이는|찢어진|비틀린|새하얀|검푸른|식어붙은|굶주린|광폭한|바람 가른|포효하는|검은갈기|돌진하는|피비린내 나는|재빠른|사나운|번개 물린|가시돋친|포자낀|뒤틀린|탐욕의|질긴|뿌리박힌|젖은|끈적한|독기 어린|거품 낀|응고된|차가운|검은|출렁이는|미끌거리는|탁한|과충전된|녹슨|파열된|경보 울리는|비정상 가동의|벼락 새긴|깨진|검게 그을린|마력주입된|타오르는|서리 맺힌|범람하는|갈라진|소용돌이치는|번쩍이는|성광의|그림자 스민)\s+/,'');
    return `${trimmed}의 잔해`;
  }
  const fallbackMap = {
    undead:'뼛조각',
    ghost:'혼령 파편',
    beast:'야수 가죽조각',
    plant:'포자 덩어리',
    slime:'점액 핵편',
    construct:'철편',
    elemental:'원소 파편'
  };
  return fallbackMap[speciesKey] || `${normalizeRank(rank)} 일반재료`;
}
function addNormalMaterial(bucket, rank, count, sourceRef) {
  const wantedRank = normalizeRank(rank);
  for (let i = 0; i < Number(count || 1); i += 1) {
    const entry = findNormalCatalogEntryForSource(sourceRef, wantedRank);
    const picked = entry ? weightedDropOption(entry.dropOptions || []) : null;
if (picked) {
  // [CHANGED] 드랍 옵션에 이름이 있으면 그 이름을 '정답'으로 고정 저장한다.
  const dropName = String(picked.name || '').trim();
  const materialId = String(picked.materialId || '').trim();

  upsertRewardItem(
    bucket.normalMaterials,
    // 스택 키도 이름 우선으로 안정적으로(같은 이름은 같은 더미로 쌓이게)
    `${wantedRank}:${safeMaterialKey(dropName || materialId || 'normal')}`,
    {
      // id도 가능하면 materialId를 쓰고, 없으면 dropName 기반으로 고정
      id: materialId ? materialId : `${wantedRank.toLowerCase()}_${safeMaterialKey(dropName || 'normal')}`,
      // name은 드랍 표시명 그대로 유지 (중요)
      name: dropName || '일반재료',
      rank: wantedRank,
      suggestedPrice: Number(picked.suggestedPrice || 0),
      sourceMonsterName: sourceRef ? String(sourceRef.name || '') : '',
      sourceSpecies: sourceRef ? String(sourceRef.species || '') : '',
      tag: 'normal'
    },
    1
  );
} else {
  const fb = fallbackNormalMaterialName(sourceRef, wantedRank);
  upsertRewardItem(bucket.normalMaterials, `${wantedRank}:${safeMaterialKey(fb)}`, {
    id: `${wantedRank.toLowerCase()}_${safeMaterialKey(fb)}`,
    name: fb,
    rank: wantedRank,
    sourceMonsterName: sourceRef ? String(sourceRef.name || '') : '',
    sourceSpecies: sourceRef ? String(sourceRef.species || '') : '',
    tag: 'normal'
  }, 1);
}
  }
}
function addRareMaterial(bucket, rank, trait, count, sourceRef) {
  const wantedRank = normalizeRank(rank);
  const traitId = typeof trait === 'string' ? trait : (trait && trait.id) || '';
  for (let i = 0; i < Number(count || 1); i += 1) {
    const item = findRareCatalogItemForSource(sourceRef, wantedRank, traitId);
    if (item) {
      upsertRewardItem(bucket.rareMaterials, item.id || `${wantedRank}:${item.name}`, {
        id: item.id || safeMaterialKey(item.name || 'rare_material'),
        name: String(item.name || '희귀재료'),
        rank: wantedRank,
        suggestedPrice: Number(item.suggestedPrice || 0),
        traitId: String(item.traitId || traitId || ''),
        traitName: String(item.traitName || ''),
        note: String(item.note || ''),
        sourceMonsterName: String(item.sourceMonsterName || (sourceRef && sourceRef.name) || ''),
        tag: 'Rare'
      }, 1);
    } else {
      upsertRewardItem(bucket.rareMaterials, `${wantedRank}:${traitId || 'unknown_rare'}`, {
        id: `${wantedRank.toLowerCase()}_${safeMaterialKey(traitId || 'rare')}`,
        name: `${(sourceRef && sourceRef.name) || '미확인 존재'}의 잔핵`,
        rank: wantedRank,
        traitId: traitId,
        note: rareTraitDisplayLabel(traitId || trait, wantedRank),
        sourceMonsterName: sourceRef ? String(sourceRef.name || '') : '',
        tag: 'Rare'
      }, 1);
    }
  }
}
function addManaStone(bucket, rank, purity, count) {
  const key = `${String(rank || 'E').toUpperCase()}:${Number(purity || 1)}%`;
  bucket.manaStones[key] = (bucket.manaStones[key] || 0) + Number(count || 1);
}

// ── Settlement calculator ─────────────────────────────────────────────────────
// Returns { title, lines[], subtotal, fee, feeLabel, net, perPerson, guildShare, final }
// type: 'association' | 'guild'
// guildSharePct: 0~100 (길드 지분 %)
function calcStashSettlement(stash, partyCount, type, guildSharePct, runTitle, gearBuyoutItems) {
  const n = Math.max(1, Math.floor(Number(partyCount) || 1));
  const isGuild = type === 'guild';
  const lines = [];
  let subtotal = 0;

  // Mana stones — rank base × purity%
  Object.keys(stash.manaStones || {}).sort().forEach(key => {
    const count = Number(stash.manaStones[key] || 0);
    if (!count) return;
    const [rank, purityStr] = key.split(':');
    const purity = parseInt(purityStr || '0', 10);
    const wonPerPct = MANA_STONE_WON_PER_PCT[rank] || MANA_STONE_WON_PER_PCT.E;
    const unitValue = wonPerPct * purity;
    const total = unitValue * count;
    subtotal += total;
    const label = MANA_STONE_LABELS[rank] || (rank + ' 마정석');
    if (count > 1) lines.push(`[${rank}] ${label}(${purity}%) x${count} = ${unitValue.toLocaleString('en-US')} x ${count} = ${total.toLocaleString('en-US')}`);
    else           lines.push(`[${rank}] ${label}(${purity}%) = ${total.toLocaleString('en-US')}`);
  });

  // Normal materials — base price per rank
  Object.values(stash.normalMaterials || {}).sort((a,b)=> `${a.rank||''}${a.name||''}`.localeCompare(`${b.rank||''}${b.name||''}`, 'ko')).forEach(row => {
    if (!row || typeof row !== 'object') return;
    const count = Number(row.count || 1);
    const rank = String(row.rank || 'E').toUpperCase();
    const baseWon = Number(row.suggestedPrice || 0) || (NORMAL_MATERIAL_BASE_WON[rank] || NORMAL_MATERIAL_BASE_WON.E);
    const total = baseWon * count;
    subtotal += total;
    const label = row.name || '일반재료';
    if (count > 1) lines.push(`[${rank}] ${label} x${count} = ${baseWon.toLocaleString('en-US')} x ${count} = ${total.toLocaleString('en-US')}`);
    else           lines.push(`[${rank}] ${label} = ${total.toLocaleString('en-US')}`);
  });

  // Rare materials — base price per rank (use suggestedPrice when available)
  Object.values(stash.rareMaterials || {}).sort((a,b)=> `${a.rank||''}${a.name||''}`.localeCompare(`${b.rank||''}${b.name||''}`, 'ko')).forEach(row => {
    if (!row || typeof row !== 'object') return;
    const count = Number(row.count || 1);
    const rank = String(row.rank || 'E').toUpperCase();
    const baseWon = Number(row.suggestedPrice || 0) || (RARE_MATERIAL_BASE_WON[rank] || RARE_MATERIAL_BASE_WON.E);
    const total = baseWon * count;
    subtotal += total;
    const label = row.name || '희귀재료';
    if (count > 1) lines.push(`[${rank}] ${label}(Rare) x${count} = ${baseWon.toLocaleString('en-US')} x ${count} = ${total.toLocaleString('en-US')}`);
    else           lines.push(`[${rank}] ${label}(Rare) = ${total.toLocaleString('en-US')}`);
  });

  // Gear buyout items (optional separate list)
  const gearBuyoutRate = isGuild ? GEAR_BUYOUT_GUILD : GEAR_BUYOUT_ASSOC;
  let gearLines = [];
  (gearBuyoutItems || []).forEach(g => {
    const marketPrice = Number(g.marketPrice || 0);
    if (!marketPrice) return;
    const buyout = Math.floor(marketPrice * gearBuyoutRate);
    subtotal += buyout;
    const pctLabel = isGuild ? '90%' : '85%';
    lines.push(`[${g.rank || '?'}] ${escapeHtml(g.name || '장비')} (시장가 ${marketPrice.toLocaleString('en-US')} / ${pctLabel}) = ${buyout.toLocaleString('en-US')}`);
    gearLines.push({ name: g.name, rank: g.rank, marketPrice, buyout, n });
  });

  // Fees
  const feeRate = isGuild ? GUILD_TAX_RATE : ASSOC_TOTAL_RATE;
  const feeLabel = isGuild ? '세액' : '세액&협회 수수료';
  const fee = Math.floor(subtotal * feeRate);
  const net = subtotal - fee;
  const perPerson = Math.floor(net / n);
  const guildPct = Math.max(0, Math.min(100, Number(guildSharePct) || 0));
  const guildShare = isGuild ? Math.floor(perPerson * (guildPct / 100)) : 0;
  const final = perPerson - guildShare;

  return { lines, subtotal, fee, feeLabel, net, perPerson, guildShare, guildPct, final, n, isGuild, gearLines };
}

function calcMonthlyIncomeTax(totalIncome) {
  const amount = Math.max(0, Number(totalIncome) || 0);
  const bracket = MONTHLY_INCOME_TAX_BRACKETS.find(b => amount <= b.limit) || MONTHLY_INCOME_TAX_BRACKETS[MONTHLY_INCOME_TAX_BRACKETS.length - 1];
  return Math.max(0, Math.floor(amount * bracket.rate) - bracket.deduction);
}

function formatWon(n) {
  return Number(Math.floor(Number(n) || 0)).toLocaleString('en-US');
}
function rewardBucketLines(bucket) {
  const lines = [];
  Object.values(bucket.normalMaterials || {}).sort((a,b)=> `${a.rank||''}${a.name||''}`.localeCompare(`${b.rank||''}${b.name||''}`, 'ko')).forEach(row => {
    if (row && typeof row === 'object') {
      const label = (!row.name || row.name === '일반재료') ? fallbackNormalMaterialName({ name:row.sourceMonsterName || '', species:row.sourceSpecies || '' }, row.rank) : row.name;
      lines.push(`${row.rank || 'E'} ${label || '일반재료'} normal x${row.count || 0}`);
    }
  });
  Object.values(bucket.rareMaterials || {}).sort((a,b)=> `${a.rank||''}${a.name||''}`.localeCompare(`${b.rank||''}${b.name||''}`, 'ko')).forEach(row => {
    if (row && typeof row === 'object') lines.push(`${row.rank || 'E'} ${row.name || '희귀재료'} Rare${row.note ? ' (' + row.note + ')' : ''} x${row.count || 0}`);
  });
  Object.keys(bucket.manaStones || {}).sort().forEach(key => {
    const [rank, purity] = key.split(':');
    lines.push(`${MANA_STONE_LABELS[rank] || (rank + ' 마정석')}(${purity}) x${bucket.manaStones[key]}`);
  });
  (bucket.notes || []).forEach(t => lines.push(t));
  return lines;
}
// [ADD] 드랍 결과만 짧게 출력(없으면 빈 배열). notes/인벤로그/드랍없음 문구 없음.
function rewardBucketDropLines(bucket) {
  const lines = [];

  // normal materials
  Object.values(bucket.normalMaterials || {}).forEach(row => {
    if (!row || typeof row !== 'object') return;
    const count = Number(row.count || 0);
    if (count <= 0) return;

    let label = String(row.name || '').trim();
    if (!label || label === '일반재료') {
      label = fallbackNormalMaterialName(
        { name: row.sourceMonsterName || '', species: row.sourceSpecies || '' },
        row.rank
      );
    }
    const rankLabel = row.rank ? `[${row.rank}] ` : '';
    lines.push(`${rankLabel}[Normal] ${label} x${count}`);
  });

  // rare materials
  Object.values(bucket.rareMaterials || {}).forEach(row => {
    if (!row || typeof row !== 'object') return;
    const count = Number(row.count || 0);
    if (count <= 0) return;

    // note(특성 표기)는 유지 (원하면 여기 포맷도 더 예쁘게 다듬을 수 있음)
    const note = row.note ? ` (${row.note})` : '';
    const rankLabel = row.rank ? `[${row.rank}] ` : '';
    lines.push(`${rankLabel}[Rare] ${row.name || '희귀재료'}${note} x${count}`);
  });

  // mana stones (순도별로 분리 유지)
  Object.keys(bucket.manaStones || {}).sort().forEach(key => {
    const count = Number(bucket.manaStones[key] || 0);
    if (count <= 0) return;

    const [rank, purity] = String(key).split(':');
    lines.push(`${MANA_STONE_LABELS[rank] || (rank + ' 마정석')}(${purity}) x${count}`);
  });

  return lines;
}
// [ADD] 몬스터별 드랍 표시용: rank prefix 없이 아이템만 출력.
function rewardBucketDropLinesCompact(bucket) {
  // rewardBucketDropLines와 비슷하지만, 몬스터별 표시가 목적이라 더 짧게
  const lines = [];

  Object.values(bucket.normalMaterials || {}).forEach(row => {
    if (!row || typeof row !== 'object') return;
    const count = Number(row.count || 0);
    if (count <= 0) return;

    let label = String(row.name || '').trim();
    if (!label || label === '일반재료') {
      label = fallbackNormalMaterialName(
        { name: row.sourceMonsterName || '', species: row.sourceSpecies || '' },
        row.rank
      );
    }
    lines.push(`${label} x${count}`);
  });

  Object.values(bucket.rareMaterials || {}).forEach(row => {
    if (!row || typeof row !== 'object') return;
    const count = Number(row.count || 0);
    if (count <= 0) return;
    const note = row.note ? ` (${row.note})` : '';
    lines.push(`${row.name || '희귀재료'}${note} x${count}`);
  });

  Object.keys(bucket.manaStones || {}).sort().forEach(key => {
    const count = Number(bucket.manaStones[key] || 0);
    if (count <= 0) return;
    const [rank, purity] = String(key).split(':');
    lines.push(`${MANA_STONE_LABELS[rank] || (rank + ' 마정석')}(${purity}) x${count}`);
  });

  return lines;
}
function getInventory() {
  if (!model.db.inventory || typeof model.db.inventory !== 'object') model.db.inventory = buildDefaultInventory();
  if (!Array.isArray(model.db.inventory.items)) model.db.inventory.items = [];
  if (!Array.isArray(model.db.inventory.overflow)) model.db.inventory.overflow = [];
  if (!Array.isArray(model.db.inventory.recent)) model.db.inventory.recent = [];
  if (model.db.inventory.gold == null || Number.isNaN(Number(model.db.inventory.gold))) model.db.inventory.gold = 0;
  // Migrate: ensure equipment items have unitWeightG
  (model.db.inventory.items || []).forEach(it => {
    if (it.category === 'equipment' && !it.unitWeightG) it.unitWeightG = EQUIP_WEIGHT_G[it.part] || 1000;
  });
  return model.db.inventory;
}
function getPartyCharBags() {
  // Returns array of PARTY_BAGS entries for each character in the party (battleSetup.partySlots)
  // Priority: equipped.bag (장비창 가방 슬롯) → bagId (DB 직접 설정)
  const partySlots = (model.db.battleSetup && Array.isArray(model.db.battleSetup.partySlots)) ? model.db.battleSetup.partySlots : [];
  const chars = model.db.characters || [];
  const bags = [];
  partySlots.forEach(cid => {
    if (!cid) return;
    const c = chars.find(x => x.id === cid);
    if (!c) return;
    // Check equipped bag slot first
    const equippedBagId = (c.inventory && c.inventory.equipped && c.inventory.equipped.bag && c.inventory.equipped.bag.bagId) || null;
    const bagId = equippedBagId || c.bagId || 'none';
    const bag = PARTY_BAGS[bagId] || PARTY_BAGS.none;
    bags.push(bag);
  });
  return bags;
}
function inventoryCapacity() {
  const bags = getPartyCharBags();
  // 공용인벤은 가방 보너스의 20%만 적용 (나머지 80%는 개인 짐)
  const totalSlotBonus = Math.floor(bags.reduce((s, b) => s + Number(b.slotBonus || 0), 0) * SHARED_INV_BAG_RATIO);
  const totalWeightBonus = Math.floor(bags.reduce((s, b) => s + Number(b.maxWeightBonusG || 0), 0) * SHARED_INV_BAG_RATIO);
  const bestWeightMul = bags.length > 0 ? Math.min(...bags.map(b => Number(b.weightMul || 1))) : 1.0;
  return { slots: INVENTORY_BASE_SLOTS + totalSlotBonus, maxWeightG: INVENTORY_BASE_MAX_WEIGHT_G + totalWeightBonus, weightMul: bestWeightMul, bags };
}
function inventoryItemKey(item) {
  if (!item) return '';
  return String(item.stackKey || `${item.category||'misc'}:${item.id||item.name||'item'}:${item.rank||''}:${item.note||''}`);
}
function inventoryConsumesSlot(item) {
  // 모든 아이템이 슬롯을 소비한다. (stackable 아이템은 스택 단위로 1칸)
  return true;
}
function inventoryUsedSlots(inv) {
  return (inv && Array.isArray(inv.items) ? inv.items.filter(it => inventoryConsumesSlot(it)).length : 0);
}
function inventoryBaseWeightG(item) { return Math.max(0, Number(item.unitWeightG || 0)) * Math.max(1, Number(item.count || 1)); }
function inventoryUsedWeightG(inv) {
  const cap = inventoryCapacity();
  return Math.round((Array.isArray(inv.items) ? inv.items : []).reduce((s, it) => s + inventoryBaseWeightG(it), 0) * cap.weightMul);
}
function formatWeightG(g) {
  const n = Math.round(Number(g || 0));
  return n >= 1000 ? `${(n/1000).toFixed(2).replace(/\.00$/,'')}kg` : `${n}g`;
}

function buildSupplyItem(kind, count=1) {
  const meta = {
    tent:{ id:'supply_tent', name:'텐트', unitWeightG:CONSUMABLE_WEIGHT_G.tent },
    ration:{ id:'supply_ration', name:'전투식량', unitWeightG:CONSUMABLE_WEIGHT_G.ration },
    water:{ id:'supply_water', name:'물', unitWeightG:CONSUMABLE_WEIGHT_G.water }
  }[String(kind || '')];
  if (!meta) return null;
  return { id:meta.id, name:meta.name, category:'campSupply', rank:'', count:Math.max(1, Number(count || 1)), unitWeightG:meta.unitWeightG, stackable:true, stackKey:`campSupply:${meta.id}` };
}
function buildPickaxeItem(rank='E', count=1) {
  const g = normalizeRank(rank);
  return { id:`pickaxe_${g}`, name:`${g}급 곡괭이`, category:'tool', rank:g, count:Math.max(1, Number(count || 1)), unitWeightG:PICKAXE_WEIGHT_G, stackable:true, stackKey:`tool:pickaxe:${g}` };
}
const TENT_WEIGHT_G = { E:3000, D:6000, C:9000, B:12000, A:15000, S:20000 };
const TENT_CAMP_BONUS = { E:0, D:5, C:10, B:15, A:20, S:30 };
function buildBagItem(bagId='bag_E', count=1) {
  const bag = PARTY_BAGS[bagId] || PARTY_BAGS.bag_E;
  return { id:bag.id, name:bag.name, category:'bag', rank:bag.rank, count:Math.max(1, Number(count||1)), unitWeightG:500, stackable:false, stackKey:`bag:${bag.id}:${Date.now().toString(36)}`, note:`+${bag.slotBonus}칸/무게+${bag.maxWeightBonusG/1000}kg${bag.weightMul < 1 ? `/무게효율${Math.round((1-bag.weightMul)*100)}%` : ''}`, bagId:bag.id };
}
function buildTentItem(rank='E', count=1) {
  const g = normalizeRank(rank);
  const wg = TENT_WEIGHT_G[g] || 3000;
  const bonus = TENT_CAMP_BONUS[g] || 0;
  const note = bonus > 0 ? `야영효율+${bonus}% (${wg/1000}kg)` : `효과없음 (${wg/1000}kg)`;
  return { id:`tent_${g}`, name:`${g}급 텐트`, category:'campSupply', rank:g, count:Math.max(1, Number(count||1)), unitWeightG:wg, stackable:false, stackKey:`tent:${g}:${Date.now().toString(36)}`, note, campBonus:bonus, tentRank:g };
}
function getPickaxeCount(rank='E') {
  const item = findInventoryItemById(`pickaxe_${normalizeRank(rank)}`);
  return item ? Math.max(0, Number(item.count || 0)) : 0;
}
function addPickaxeToInventory(rank='E', count=1) {
  return addInventoryItem(buildPickaxeItem(rank, count));
}
function getBestUsablePickaxeRank(rank='E') {
  const wanted = rankIndex(rank);
  for (let i = GRADE_ORDER.length - 1; i >= wanted; i -= 1) {
    const g = GRADE_ORDER[i];
    if (getPickaxeCount(g) > 0) return g;
  }
  return '';
}
function hasMatchingPickaxe(rank='E') {
  return !!getBestUsablePickaxeRank(rank);
}
function findInventoryItemById(id) {
  const inv = getInventory();
  return (inv.items || []).find(it => String(it.id || '') === String(id || '')) || (inv.overflow || []).find(it => String(it.id || '') === String(id || '')) || null;
}
function getSupplyCount(kind) {
  const item = findInventoryItemById(`supply_${String(kind || '')}`);
  return item ? Math.max(0, Number(item.count || 0)) : 0;
}
function addSupplyToInventory(kind, count=1) {
  const item = buildSupplyItem(kind, count);
  if (!item) return { ok:false, reason:'invalid' };
  return addInventoryItem(item);
}
function grantInventoryItem(raw) {
  const inv = getInventory();
  const item = deepClone(raw || {});
  item.count = Math.max(1, Number(item.count || 1));
  item.stackable = item.stackable !== false;
  item.unitWeightG = Math.max(0, Number(item.unitWeightG || 0));
  const key = inventoryItemKey(item);
  const existing = inv.items.find(x => inventoryItemKey(x) === key);
  if (existing && item.stackable) existing.count = Number(existing.count || 0) + Number(item.count || 0);
  else inv.items.push(item);
  pushInventoryRecent(`${item.name} x${item.count}`);
  return { ok:true, forced:true, item };
}
function consumeInventoryById(id, count=1) {
  const inv = getInventory();
  let need = Math.max(0, Number(count || 0));
  if (!need) return true;
  const pools = [inv.items || [], inv.overflow || []];
  for (const pool of pools) {
    const idx = pool.findIndex(it => String(it.id || '') === String(id || ''));
    if (idx < 0) continue;
    const item = pool[idx];
    const cur = Math.max(0, Number(item.count || 0));
    if (cur < need) return false;
    if (cur === need || item.stackable === false) pool.splice(idx, 1);
    else item.count = cur - need;
    return true;
  }
  return false;
}
function activeGateRun() {
  const run = getGateRun();
  return (run && !run.completed && !run.failed) ? run : null;
}
function normalMaterialUnitWeight(rank) { return Number(NORMAL_MATERIAL_WEIGHT_G[String(rank || 'E').toUpperCase()] || 30); }
function rareMaterialUnitWeight() { return RARE_MATERIAL_WEIGHT_G; }
function manaStoneUnitWeight(purity) { const n = Math.max(1, Math.min(100, Number(String(purity || '').replace(/[^0-9]/g, '')) || 1)); return n * 3; }
function pushInventoryRecent(text) {
  const inv = getInventory();
  inv.recent.unshift(String(text || ''));
  inv.recent = inv.recent.slice(0, 20);
}
function pushInventoryOverflow(item) {
  const inv = getInventory();
  const key = inventoryItemKey(item);
  let existing = inv.overflow.find(x => inventoryItemKey(x) === key);
  if (existing && item.stackable !== false) existing.count = Number(existing.count || 0) + Number(item.count || 0);
  else inv.overflow.push(deepClone(item));
}
function addInventoryItem(raw) {
  const inv = getInventory();
  const item = deepClone(raw || {});
  item.count = Math.max(1, Number(item.count || 1));
  item.stackable = item.stackable !== false;
  item.unitWeightG = Math.max(0, Number(item.unitWeightG || 0));
  const key = inventoryItemKey(item);
  const cap = inventoryCapacity();
  const existing = inv.items.find(x => inventoryItemKey(x) === key);
  const slotAdd = (existing && item.stackable) ? 0 : (inventoryConsumesSlot(item) ? 1 : 0);
  const nextSlots = inventoryUsedSlots(inv) + slotAdd;
  const nextWeight = inventoryUsedWeightG(inv) + Math.round(inventoryBaseWeightG(item) * cap.weightMul);
  if (nextSlots > cap.slots) return { ok:false, reason:'slot', item };
  if (nextWeight > cap.maxWeightG) return { ok:false, reason:'weight', item };
  if (existing && item.stackable) existing.count = Number(existing.count || 0) + Number(item.count || 0);
  else inv.items.push(item);
  pushInventoryRecent(`${item.name} x${item.count}`);
  return { ok:true, item };
}
function removeInventoryItem(key, countMode) {
  const inv = getInventory();
  const idx = inv.items.findIndex(x => inventoryItemKey(x) === key || String(x.iid || '') === String(key));
  if (idx < 0) return false;
  const item = inv.items[idx];
  if (countMode === 'one' && item.stackable && Number(item.count || 0) > 1) item.count = Number(item.count || 0) - 1;
  else inv.items.splice(idx, 1);
  return true;
}
function collectOverflowToInventory() {
  const inv = getInventory();
  const old = (inv.overflow || []).slice();
  inv.overflow = [];
  let moved = 0;
  old.forEach(item => {
    const res = addInventoryItem(item);
    if (res.ok) moved += Number(item.count || 1);
    else pushInventoryOverflow(item);
  });
  return moved;
}
function clearInventoryOverflow() { const inv = getInventory(); inv.overflow = []; }
function rewardRowToInventoryItem(row, kind) {
  if (!row) return null;
if (kind === 'normal') {
  // [CHANGED] 드랍에서 확정된 이름(row.name)을 최우선으로 사용.
  // fallback은 정말 이름이 비어있을 때만 사용(이름 치환으로 다른 아이템처럼 보이는 문제 방지).
  let baseName = String(row.name || '').trim();
  if (!baseName) {
    baseName = fallbackNormalMaterialName(
      { name: row.sourceMonsterName || '', species: row.sourceSpecies || '' },
      row.rank
    );
  }

  return {
    id: row.id || safeMaterialKey(baseName || 'normal_material'),
    name: `${baseName || '일반재료'} [normal]`,
    category: 'normalMaterial',
    rank: String(row.rank || 'E').toUpperCase(),
    count: Number(row.count || 1),
    unitWeightG: normalMaterialUnitWeight(row.rank),
    stackable: true,

    // [IMPORTANT] stackKey도 이름 기반으로 고정해서 같은 이름은 같은 스택으로 쌓이게
    stackKey: `normalMaterial:${String(row.rank || 'E').toUpperCase()}:${safeMaterialKey(baseName)}`,

    suggestedPrice: Number(row.suggestedPrice || 0),
    sourceMonsterName: String(row.sourceMonsterName || ''),
    sourceSpecies: String(row.sourceSpecies || '')
  };
}
  if (kind === 'rare') return { id:row.id || safeMaterialKey(row.name || 'rare_material'), name:`${row.name || '희귀재료'} [Rare]`, category:'rareMaterial', rank:String(row.rank || 'E').toUpperCase(), count:Number(row.count || 1), unitWeightG:rareMaterialUnitWeight(), stackable:true, note:String(row.note || ''), traitId:String(row.traitId || ''), suggestedPrice:Number(row.suggestedPrice || 0), sourceMonsterName:String(row.sourceMonsterName || '') };
  return null;
}
function manaStoneBucketToInventoryItems(bucket) {
  const out = [];
  Object.keys(bucket.manaStones || {}).forEach(key => {
    const [rank, purity] = String(key).split(':');
    out.push({ id:`mana_${rank}_${purity}`, name:`${MANA_STONE_LABELS[rank] || (rank + ' 마정석')}(${purity})`, category:'manaStone', rank:String(rank || 'E').toUpperCase(), count:Number(bucket.manaStones[key] || 0), unitWeightG:manaStoneUnitWeight(purity), stackable:true, note:`${purity}` });
  });
  return out;
}
function depositRewardBucketToInventory(bucket) {
  // [CHANGED] 인벤에 넣는 동작은 유지하되, 로그(인벤 보관/초과)를 반환/출력하지 않는다.
  Object.values(bucket.normalMaterials || {}).forEach(row => {
    const item = rewardRowToInventoryItem(row, 'normal');
    if (!item) return;
    const res = addInventoryItem(item);
    if (!res.ok) pushInventoryOverflow(item);
  });

  Object.values(bucket.rareMaterials || {}).forEach(row => {
    const item = rewardRowToInventoryItem(row, 'rare');
    if (!item) return;
    const res = addInventoryItem(item);
    if (!res.ok) pushInventoryOverflow(item);
  });

  manaStoneBucketToInventoryItems(bucket).forEach(item => {
    const res = addInventoryItem(item);
    if (!res.ok) pushInventoryOverflow(item);
  });

  return [];
}
function seedDefaultInventoryMigration() { getInventory(); }
function roomLabel(type) {
  const map = { passage:'통로', combat:'전투', elite:'엘리트', puzzle:'퍼즐', trap:'함정', boss:'보스', secret:'비밀방', camp:'야영지', damage:'피해', bleed:'출혈', burn:'화상', curse:'저주', bind:'속박' };
  return map[type] || type || '?';
}
function roomHasMineableVeins(room) {
  return !!(room && Number(room.veins || 0) > 0 && !room.mineResolved && !room.mined);
}
function roomDisplayLabel(room, known=true) {
  if (!room) return '?';
  let text = roomLabel(room.type);
  if (known && Number(room.veins || 0) > 0) text += '/광맥';
  return text;
}
function ensureGateLogContainers(run) {
  if (!run) return;
  if (!Array.isArray(run.logs)) run.logs = [];
  if (!Array.isArray(run.fullLogs)) run.fullLogs = run.logs.slice().reverse();
}
function pushGateLog(run, text) {
  if (!run || !text) return;
  ensureGateLogContainers(run);
  run.logs.unshift(String(text));
  if (run.logs.length > 400) run.logs = run.logs.slice(0, 400);
  run.fullLogs.push(String(text));
  if (run.fullLogs.length > 4000) run.fullLogs = run.fullLogs.slice(-4000);
}
function pushBattleLog(runtime, text) {
  if (!runtime || !text) return;
  runtime.logs.push(String(text));
  if (runtime.logs.length > 2500) runtime.logs = runtime.logs.slice(-2500);
}
function battleUnitLabel(unit) {
  if (!unit) return '대상';
  if (unit.isMonster) return `(${normalizeRank(unit.rank || 'E')}) [${normalizeMonsterKind(unit.kind || 'Normal')}] ${unit.name}`;
  return unit.name;
}
function pushHpShiftLog(runtime, unit, beforeHp) {
  if (!runtime || !unit) return;
  const maxHp = Math.max(0, Number(unit.maxHp || unit.hp || 0));
  pushBattleLog(runtime, `${battleUnitLabel(unit)} [${Math.max(0, Number(beforeHp || 0))}/${maxHp}] > [${Math.max(0, Number(unit.hp || 0))}/${maxHp}]`);
}
function pushDamageEventLog(runtime, actor, target, skillName, dmg, crit=false, killed=false) {
  if (!runtime || !actor || !target) return;
  pushBattleLog(runtime, `${actor.name}의 ${skillName} ${target.name}에게${crit ? ' 치명타' : ''} 적중 (피해 ${dmg})${killed ? ' [처치]' : ''}`);
}
function pushHealEventLog(runtime, actor, target, skillName, amount, beforeHp) {
  if (!runtime || !actor || !target) return;
  const maxHp = Math.max(0, Number(target.maxHp || target.hp || 0));
  pushBattleLog(runtime, `${actor.name}의 ${skillName} ${target.name} 회복 (+${amount})`);
  pushBattleLog(runtime, `${battleUnitLabel(target)} [${Math.max(0, Number(beforeHp || 0))}/${maxHp}] > [${Math.max(0, Number(target.hp || 0))}/${maxHp}]`);
}
function applyRoomTraversalMinutes(run, room, minutes=30) {
  if (!run || !room) return;
  if (!room.timeApplied) {
    run.elapsedMinutes = Number(run.elapsedMinutes || 0) + Number(minutes || 0);
    room.timeApplied = true;
  }
}
function markSkippedVeinIfNeeded(run, room) {
  if (roomHasMineableVeins(room)) {
    room.mined = true;
    room.mineResolved = true;
    room.mineSkipped = true;
    pushGateLog(run, `${roomDisplayLabel(room, true)}: 광맥을 채굴하지 않고 이동했다.`);
  }
}
function roomAftermathPrompt(room) {
  const text = roomDisplayLabel(room, true);
  const canMine = roomHasMineableVeins(room);
  return `
    <div class="gb-panel">
      <div class="gb-section-title">방 정리</div>
      <div class="gb-sub">${escapeHtml(text)} 처리 후 다음 행동을 고를 수 있다.</div>
      ${room.rewardLines && room.rewardLines.length ? `<div class="gb-log">${room.rewardLines.map(t => `<div>• ${escapeHtml(t)}</div>`).join('')}</div>` : ''}
      <div class="gb-btn-row">
        ${canMine ? '<button class="gb-btn" id="gb-room-mine">광맥 채굴</button>' : ''}
        <button class="gb-btn primary" id="gb-room-next">다음방 진입</button>
        <button class="gb-btn danger" id="gb-room-retreat">후퇴</button>
      </div>
    </div>`;
}
function rollSingleOreVein(rank) {
  const roll = randInt(1, 100);
  const amount = roll <= 40 ? 2 : (roll <= 80 ? 3 : 4);
  const purityRoll = randInt(1, 100);
  let purity = 15;
  if (purityRoll <= 20) purity = randInt(15, 29);
  else if (purityRoll <= 40) purity = randInt(30, 44);
  else if (purityRoll <= 60) purity = randInt(45, 59);
  else if (purityRoll <= 80) purity = randInt(60, 74);
  else purity = 75;
  return { amount, purity };
}
function mineGateRoom(run, room) {
  if (!run || !room) throw new Error('채굴할 방이 없다.');
  if (!roomHasMineableVeins(room)) throw new Error('채굴할 광맥이 없다.');
  room.mineResolved = true;
  const bundle = createRewardBucket();
  const usablePickaxe = getBestUsablePickaxeRank(run.rank);
  const hasTool = !!usablePickaxe;
  const lines = [];
  for (let i = 0; i < Number(room.veins || 0); i += 1) {
    const base = rollSingleOreVein(run.rank);
    if (hasTool) {
      addManaStone(bundle, run.rank, base.purity, base.amount);
      lines.push(`광맥 ${i+1}: ${usablePickaxe}급 곡괭이 사용 — 마정석 ${base.amount}개 / 순도 ${base.purity}%`);
    } else {
      const roll = randInt(1, 100);
      if (roll <= 33) {
        lines.push(`광맥 ${i+1}: 곡괭이 없음 — 채굴 실패(0개)`);
        continue;
      }
      const factor = roll <= 66 ? (1/3) : (1/2);
      const amount = Math.floor(base.amount * factor);
      const purity = Math.floor(base.purity * factor);
      if (amount <= 0 || purity <= 0) {
        lines.push(`광맥 ${i+1}: 곡괭이 없음 — 채굴 실패(0개)`);
        continue;
      }
      addManaStone(bundle, run.rank, purity, amount);
      lines.push(`광맥 ${i+1}: 곡괭이 없음 — 감산 채굴 ${amount}개 / 순도 ${purity}%`);
    }
  }
  room.mined = true;
  room.mineResolved = true;
  room.mineSkipped = false;
  mergeRewardBucket(run.stash, bundle);
  const invLogs = depositRewardBucketToInventory(bundle);
  const outLines = lines.concat(rewardBucketLines(bundle)).concat(invLogs);
  room.rewardLines = (room.rewardLines || []).concat(outLines);
  outLines.forEach(line => pushGateLog(run, `[채굴] ${line}`));
  return outLines;
}

function stageToken(stage, idx, run) {
  const current = !run.sideRoomActive && idx === run.currentStage;
  if (stage.kind === 'choice' && !stage.chosen && !stage.cleared) {
    return current ? `<span class="gb-badge" style="background:#1d4ed8;">[${stage.options.map(o=>o.key).join('/')}]</span>` : `<span class="gb-badge">[${stage.options.map(o=>o.key).join('/')}]</span>`;
  }
  const room = stage.kind === 'room' ? stage.room : ((stage.options || []).find(o => o.key === stage.chosen) || {}).room;
  if (!room) return '<span class="gb-badge">?</span>';
  const text = (stage.cleared || room.discovered || current) ? roomDisplayLabel(room, true) : '?';
  return `<span class="gb-badge"${current ? ' style="background:#1d4ed8;"' : ''}>${escapeHtml(text)}</span>`;
}
function makeStageRoom(gate, type, key) {
  return {
    id: slugify(`${gate.id}_${key}_${type}_${Math.floor(Math.random()*9999)}`),
    type,
    discovered:false,
    cleared:false,
    encounter:null,
    rewardLines:[],
    notes:[],
    veins:0,
    mined:false,
    mineResolved:false,
    mineSkipped:false,
    timeApplied:false,
    preview:''
  };
}
function stageTemplateForSize(size) {
  const tpl = deepClone(GATE_STAGE_TEMPLATES[normGateSize(size)] || GATE_STAGE_TEMPLATES.small);
  return tpl;
}
function buildPartyEntriesFromSetup() {
  return (model.db.battleSetup.partySlots || []).map(id => getCharById(id)).filter(Boolean).map(base => {
    const e = deepClone(base);
    e.currentHp = Number(e.hp || 0);
    e.currentMp = Number(e.mp || 0);
    e.currentSp = Number(e.sp || 0);
    e.buffs = [];
    e.statuses = { stun:0, bind:0, sleep:0, poison:0, bleed:0, burn:0, curse:0, poisonPower:0, bleedPower:0, burnPower:0 };
    return e;
  });
}
function serializeUnitState(unit) {
  const keepStatuses = Object.assign({ stun:0, bind:0, sleep:0, poison:0, bleed:0, burn:0, curse:0, poisonPower:0, bleedPower:0, burnPower:0 }, deepClone(unit.statuses || {}));
  return {
    id: unit.baseId || unit.uid,
    name: unit.name,
    job: unit.job,
    role: unit.role,
    position: unit.position,
    row: unit.row,
    rank: unit.rank,
    stats: deepClone(unit.stats || {}),
    hp: unit.maxHp,
    mp: unit.maxMp,
    sp: unit.maxSp,
    currentHp: unit.hp,
    currentMp: unit.mp,
    currentSp: unit.sp,
    atk: unit.atk,
    pdef: unit.pdef,
    mdef: unit.mdef,
    damageType: unit.damageType,
    attackStat: unit.attackStat,
    threatBase: unit.threatBase,
    skills: deepClone(unit.skills || []),
    note: unit.note || '',
    resists: deepClone(unit.resists || {}),
    species: unit.species || '',
    baseElement: unit.baseElement || 'none',
    buffs: [],
    statuses: keepStatuses,
    immunities: deepClone(unit.immunities || []),
    damageTakenMods: deepClone(unit.damageTakenMods || {}),
    bonusVsBleeding: Number(unit.bonusVsBleeding || 1),
    aloneDamageTaken: Number(unit.aloneDamageTaken || 1),
    regenPct: Number(unit.regenPct || 0),
    regenBlockedBy: deepClone(unit.regenBlockedBy || []),
    onHitStatus: unit.onHitStatus || '',
    onHitChance: Number(unit.onHitChance || 0),
    onHitTurns: Number(unit.onHitTurns || 0)
  };
}
function createDefaultGateRun(gate) {
  const partyEntries = buildPartyEntriesFromSetup();
  const partyCount = partyEntries.length;
  const stages = stageTemplateForSize(gate.size).map((step, idx) => {
    if (step.kind === 'choice') {
      return {
        kind:'choice',
        id:`stage_${idx}`,
        chosen:'',
        cleared:false,
        options:(step.options || []).map((type, oi) => ({ key:String.fromCharCode(65 + oi), room:makeStageRoom(gate, type, `s${idx}_${oi}`) }))
      };
    }
    return { kind:'room', id:`stage_${idx}`, cleared:false, room:makeStageRoom(gate, step.type, `s${idx}`) };
  });
  const secretEnabled = gate.size === 'large' ? true : (gate.size === 'medium' ? chance(0.6) : chance(0.35));
  const hostCandidates = stages.map((st, idx) => ({ st, idx })).filter(row => row.idx > 1 && row.idx < stages.length - 1 && (row.st.kind !== 'room' || (row.st.kind === 'room' && !['boss','camp'].includes(row.st.room.type))));
  const host = hostCandidates.length ? sampleOne(hostCandidates) : null;
  const campSupplies = { used:false, legacyMigrated:false };
  const run = {
    id: slugify(`${gate.id}_run_${Date.now()}`),
    title: gate.title,
    rank: gate.rank,
    size: gate.size,
    sizeLabel: gate.sizeLabel,
    primarySpecies: gate.primarySpecies,
    primarySpeciesLabel: gate.primarySpeciesLabel,
    secondarySpecies: gate.secondarySpecies,
    secondarySpeciesLabel: gate.secondarySpeciesLabel,
    normalCount: gate.normalCount,
    eliteCount: gate.eliteCount,
    bossCount: gate.bossCount,
    veinCount: gate.veinCount,
    nodeCount: gate.nodeCount,
    stages,
    currentStage:0,
    completed:false,
    failed:false,
    partyState: partyEntries,
    partyStartCount: partyCount,
    campSupplies,
    stash: createRewardBucket(),
    logs:[`게이트 시작: ${gate.title} (${gate.rank}/${gate.sizeLabel})`],
    fullLogs:[`게이트 시작: ${gate.title} (${gate.rank}/${gate.sizeLabel})`],
    pendingBattleRoomId:'',
    sideRoomActive:false,
    elapsedMinutes:0,
    postBattle:null,
    secretPlan: secretEnabled ? { hostStageIndex: host ? host.idx : 2, discovered:false, offered:false, resolved:false, room: makeStageRoom(gate, 'secret', 'secret') } : null
  };
  distributeGateRunContents(run);
  if (run.stages[0] && run.stages[0].kind === 'room') run.stages[0].room.discovered = true;
  return run;
}
function flattenCombatRooms(run) {
  const rooms = [];
  (run.stages || []).forEach(stage => {
    if (stage.kind === 'room') {
      if (['combat','elite','boss'].includes(stage.room.type)) rooms.push(stage.room);
    } else {
      (stage.options || []).forEach(opt => { if (['combat','elite','boss'].includes(opt.room.type)) rooms.push(opt.room); });
    }
  });
  return rooms;
}
function flattenVeinEligibleRooms(run) {
  const rooms = [];
  (run.stages || []).forEach(stage => {
    if (stage.kind === 'room') rooms.push(stage.room);
    else (stage.options || []).forEach(opt => rooms.push(opt.room));
  });
  if (run.secretPlan && run.secretPlan.room) rooms.push(run.secretPlan.room);
  return rooms.filter(room => room && !['camp','passage'].includes(room.type));
}
// Pre-select up to 4 unique Normal monster types for the whole gate.
// Keeps all rooms thematically consistent: ~3 from primary species, 1 slot for secondary.
function buildGateNormalPool(run) {
  const primaries = shuffle(findMonsterCandidates([run.primarySpecies], run.rank, 'Normal').slice());
  const secondaries = (run.secondarySpecies && run.secondarySpecies !== run.primarySpecies)
    ? shuffle(findMonsterCandidates([run.secondarySpecies], run.rank, 'Normal').slice())
    : [];
  const seen = new Set();
  const pool = [];
  // Fill up to 3 slots from primary species first
  for (const m of primaries) {
    if (pool.length >= 3) break;
    if (!seen.has(m.id)) { seen.add(m.id); pool.push(m); }
  }
  // Fill one slot from secondary species
  for (const m of secondaries) {
    if (pool.length >= 4) break;
    if (!seen.has(m.id)) { seen.add(m.id); pool.push(m); }
  }
  // Back-fill remaining slots from primary if secondary didn't fill them
  for (const m of primaries) {
    if (pool.length >= 4) break;
    if (!seen.has(m.id)) { seen.add(m.id); pool.push(m); }
  }
  return pool;
}
function distributeGateRunContents(run) {
  const [minUnits, maxUnits] = ROOM_UNIT_LIMITS[run.size] || ROOM_UNIT_LIMITS.small;
  // Pre-select the fixed Normal monster pool for this gate run (max 4 unique types).
  run.gateNormalPool = buildGateNormalPool(run);
  const combatRooms = flattenCombatRooms(run);
  combatRooms.forEach(room => {
    room.encounter = { normal:0, elite:0, boss:0, waves:1, visibleNormal:0, visibleElite:0, visibleBoss:0, enemySlots:[], previewLines:[] };
    room.minUnits = minUnits;
    room.maxUnits = maxUnits;
    if (room.type === 'elite') room.encounter.elite = 1;
    if (room.type === 'boss') room.encounter.boss = run.bossCount;
  });
  let eliteRemain = Math.max(0, run.eliteCount - combatRooms.reduce((s, room) => s + room.encounter.elite, 0));
  const eliteTargets = shuffle(combatRooms.filter(room => room.type === 'elite' || room.type === 'combat' || room.type === 'boss'));
  while (eliteRemain > 0 && eliteTargets.length) {
    const room = eliteTargets[eliteRemain % eliteTargets.length];
    const used = room.encounter.normal + room.encounter.elite + room.encounter.boss;
    if (used < room.maxUnits) {
      room.encounter.elite += 1;
      eliteRemain -= 1;
    } else {
      eliteTargets.shift();
    }
  }
  let normalRemain = run.normalCount;
  combatRooms.forEach(room => {
    const special = room.encounter.elite + room.encounter.boss;
    const need = Math.max(0, room.minUnits - special);
    const give = Math.min(need, normalRemain);
    room.encounter.normal += give;
    normalRemain -= give;
  });
  let safety = 4000;
  while (normalRemain > 0 && safety-- > 0) {
    const room = sampleOne(combatRooms);
    if (!room) break;
    const total = room.encounter.normal + room.encounter.elite + room.encounter.boss;
    if (total < room.maxUnits) {
      room.encounter.normal += 1;
      normalRemain -= 1;
    } else {
      room.encounter.waves = Math.max(2, room.encounter.waves || 1);
      room.encounter.normal += 1;
      normalRemain -= 1;
    }
  }
  combatRooms.forEach(room => finalizeRoomEncounter(run, room));
  let veinsRemain = run.veinCount;
  const veinRooms = shuffle(flattenVeinEligibleRooms(run));
  while (veinsRemain > 0 && veinRooms.length) {
    const room = veinRooms[veinsRemain % veinRooms.length];
    room.veins = (room.veins || 0) + 1;
    veinsRemain -= 1;
  }
}
function finalizeRoomEncounter(run, room) {
  const total = room.encounter.normal + room.encounter.elite + room.encounter.boss;
  const visibleCap = room.maxUnits;
  let overflow = Math.max(0, total - visibleCap);
  room.encounter.visibleBoss = Math.min(room.encounter.boss, visibleCap);
  let remainingCap = visibleCap - room.encounter.visibleBoss;
  room.encounter.visibleElite = Math.min(room.encounter.elite, remainingCap);
  remainingCap -= room.encounter.visibleElite;
  room.encounter.visibleNormal = Math.min(room.encounter.normal, remainingCap);
  room.encounter.overflow = overflow;
  const enemyIds = [];
  const preview = [];
  for (let i = 0; i < room.encounter.visibleNormal; i += 1) {
    const normalPool = (run.gateNormalPool && run.gateNormalPool.length)
      ? run.gateNormalPool
      : findMonsterCandidates([run.primarySpecies], run.rank, 'Normal');
    const chosen = sampleOne(normalPool);
    if (chosen) { enemyIds.push(chosen.id); preview.push(`${chosen.name} [${chosen.rank}/Normal]`); }
  }
  for (let i = 0; i < room.encounter.visibleElite; i += 1) {
    const species = chooseSpeciesWeighted(run.primarySpecies, run.secondarySpecies, 0.8);
    const chosen = sampleOne(findMonsterCandidates([species], run.rank, 'Elite'));
    if (chosen) { enemyIds.push(chosen.id); preview.push(`${chosen.name} [${chosen.rank}/Elite]`); }
  }
  for (let i = 0; i < room.encounter.visibleBoss; i += 1) {
    const chosen = sampleOne(findMonsterCandidates([run.primarySpecies], run.rank, 'Boss'));
    if (chosen) { enemyIds.push(chosen.id); preview.push(`${chosen.name} [${chosen.rank}/Boss]`); }
  }
  while (enemyIds.length < MAX_ENEMIES) enemyIds.push('');
  room.encounter.enemySlots = enemyIds.slice(0, MAX_ENEMIES);
  room.encounter.previewLines = preview;
  room.preview = `${room.encounter.normal}N / ${room.encounter.elite}E / ${room.encounter.boss}B` + (room.encounter.overflow > 0 ? ` / 잔당 ${room.encounter.overflow}` : '');
}
function getGateRun() {
  const gs = gateStateSafe();
  return gs.run || null;
}
function getCurrentStage(run) {
  if (!run || run.completed || run.failed) return null;
  return run.stages[run.currentStage] || null;
}
function getActiveRoom(run) {
  if (!run) return null;
  if (run.sideRoomActive && run.secretPlan && run.secretPlan.room) return run.secretPlan.room;
  const stage = getCurrentStage(run);
  if (!stage) return null;
  if (stage.kind === 'room') return stage.room;
  if (!stage.chosen) return null;
  const picked = (stage.options || []).find(o => o.key === stage.chosen);
  return picked ? picked.room : null;
}
function getRoomById(run, roomId) {
  if (!run || !roomId) return null;
  if (run.secretPlan && run.secretPlan.room && run.secretPlan.room.id === roomId) return run.secretPlan.room;
  for (const stage of (run.stages || [])) {
    if (stage.kind === 'room' && stage.room.id === roomId) return stage.room;
    if (stage.kind === 'choice') {
      const opt = (stage.options || []).find(o => o.room.id === roomId);
      if (opt) return opt.room;
    }
  }
  return null;
}
function advanceGateRunAfterMainRoom(run, stageIndex, room) {
  const stage = run.stages[stageIndex];
  if (stage) stage.cleared = true;
  applyRoomTraversalMinutes(run, room, 30);
  if (run.secretPlan && !run.secretPlan.discovered && !run.secretPlan.resolved && run.secretPlan.hostStageIndex === stageIndex) {
    if (Math.random() < GATE_SECRET_DISCOVER_CHANCE) {
      run.secretPlan.discovered = true;
      run.secretPlan.offered = true;
      pushGateLog(run, '비밀방의 흔적을 발견했다.');
    }
  }
  run.currentStage = Math.min(run.stages.length, stageIndex + 1);
  if (run.currentStage >= run.stages.length) {
    run.completed = true;
    pushGateLog(run, '게이트의 마지막 방을 넘었다.');
  }
}
function beginGateRunFromSelectedGate() {
  if (activeGateRun()) return false;
  const gate = getSelectedGeneratedGate();
  if (!gate) throw new Error('선택된 게이트가 없다.');
  const party = buildPartyEntriesFromSetup();
  if (!party.length) throw new Error('게이트에 투입할 파티가 비어 있다. 전투 탭에서 파티 편성을 먼저 확인해.');
  const gs = gateStateSafe();
  gs.current = deepClone(gate);
  gs.run = createDefaultGateRun(gate);
  model.state.view = 'gate';
  return true;
}
function buildBattleFromEntries(partyEntries, enemyEntries) {
  const runtime = buildDefaultRuntime();
  runtime.party = (partyEntries || []).map((e, idx) => buildUnit(e, 'party', idx)).slice(0, MAX_PARTY);
  runtime.enemies = (enemyEntries || []).map((e, idx) => buildUnit(e, 'enemies', idx)).slice(0, MAX_ENEMIES);
  if (!runtime.party.length) throw new Error('파티가 비어 있다.');
  if (!runtime.enemies.length) throw new Error('적이 비어 있다.');
  runtime.started = true;
  model.state.runtime = runtime;
}
function buildEnemyEntriesFromSlots(slots) {
  return (slots || []).map(id => getMonsterById(id)).filter(Boolean).map(mon => deepClone(mon));
}
function enterGateRoom(run) {
  const room = getActiveRoom(run);
  if (!room) throw new Error('현재 진입할 방이 없다.');
  room.discovered = true;
  if (room.type === 'passage') {
    room.notes = ['이상한 공간감만이 이어진다.'];
    room.cleared = true;
    pushGateLog(run, '통로를 통과했다.');
    if (run.sideRoomActive) {
      run.sideRoomActive = false;
      run.secretPlan.offered = false;
      run.secretPlan.resolved = true;
    } else {
      advanceGateRunAfterMainRoom(run, run.currentStage, room);
    }
    return;
  }
  if (room.type === 'camp') {
    room.notes = ['장시간 체류할 수 있는 비교적 안정된 공간이다. 야영하거나 그냥 지나칠 수 있다.'];
    return;
  }
  if (room.type === 'trap') {
    resolveTrapRoom(run, room);
    return;
  }
  if (room.type === 'puzzle') {
    room.notes = ['퍼즐의 기작이 드러났다. 해결 시도를 해야 한다.'];
    return;
  }
  if (room.type === 'secret') {
    room.notes = ['숨겨진 공간이 열린다. 안쪽에서 보상의 기척이 느껴진다.'];
    return;
  }
  if (['combat','elite','boss'].includes(room.type)) {
    const enemyEntries = buildEnemyEntriesFromSlots(room.encounter.enemySlots);
    buildBattleFromEntries(run.partyState, enemyEntries);
    run.pendingBattleRoomId = room.id;
    model.state.view = 'battle';
    pushGateLog(run, `${roomDisplayLabel(room, true)} 방에 진입했다.`);
  }
}
function randomAlivePartyIndices(run) {
  return (run.partyState || []).map((u, idx) => ({ u, idx })).filter(row => Number(row.u.currentHp || row.u.hp || 0) > 0);
}
const SENSE_CHECK_BY_RANK = { E:15, D:30, C:50, B:65, A:80, S:100 };
function resolveTrapRoom(run, room) {
  room.discovered = true;
  const alive = randomAlivePartyIndices(run);
  const lines = [];
  // 파티원 중 최고 감각 기준 함정 무력화 판정
  const maxSense = Math.max(0, ...alive.map(row => Number((row.u.stats && row.u.stats.sense) || row.u.sense || 0)));
  const threshold = SENSE_CHECK_BY_RANK[String(run.rank||'E').toUpperCase()] || 15;
  if (maxSense > threshold) {
    lines.push(`감각 ${maxSense} > ${threshold}: 함정 무력화 성공!`);
  } else {
    // 실패: 전원 최대 HP의 10~40% 피해
    alive.forEach(row => {
      const unit = row.u;
      const maxHp = Number(unit.hp || unit.maxHp || 1);
      const pct = randInt(10, 40);
      const dmg = Math.max(1, Math.floor(maxHp * pct / 100));
      unit.currentHp = Math.max(1, Number(unit.currentHp != null ? unit.currentHp : unit.hp) - dmg);
      lines.push(`${unit.name} HP -${dmg} (${pct}%)`);
    });
  }
  room.rewardLines = lines;
  room.cleared = true;
  pushGateLog(run, `함정 발동: ${lines.join(' / ')}`);
  if (roomHasMineableVeins(room)) {
    model.state.view = 'gate';
    return;
  }
  if (run.sideRoomActive) {
    applyRoomTraversalMinutes(run, room, 30);
    run.sideRoomActive = false;
    run.secretPlan.offered = false;
    run.secretPlan.resolved = true;
  } else {
    advanceGateRunAfterMainRoom(run, run.currentStage, room);
  }
}
function pickRareTraitForRoll(roll, bossLike) {
  if (bossLike) {
    if (roll >= 86) return pickRareTraitByFamily(chance(0.5) ? 'physicalDamage' : 'magicDamage');
    if (roll >= 71) return pickRareTraitByFamily('elementalDamage');
    if (roll >= 56) return pickRareTraitByFamily(chance(0.5) ? 'physicalDefense' : 'magicDefense');
    if (roll >= 41) return pickRareTraitByFamily('elementalDefense');
    return pickRareTraitByFamily('increasedHealing');
  }
  if (roll >= 96) return pickRareTraitByFamily(chance(0.5) ? 'physicalDamage' : 'magicDamage');
  if (roll >= 91) return pickRareTraitByFamily('elementalDamage');
  if (roll >= 86) return pickRareTraitByFamily(chance(0.5) ? 'physicalDefense' : 'magicDefense');
  if (roll >= 81) return pickRareTraitByFamily('elementalDefense');
  return pickRareTraitByFamily('increasedHealing');
}
// 드랍 장비 생성: 게이트 보스/엘리트 보상으로 드랍되는 장비
// 20% 확률로 1특성 부여 → maxInfuse+1, 가격에 희귀재료 가치(×1.25) 반영
// 장비 드랍: part 지정 버전 (드랍테이블 결과로 부위 결정 후 호출)
function buildDropEquipment(rank, forcePart) {
  const r = String(rank || 'E').toUpperCase();
  const part = forcePart || EQUIP_PARTS[Math.floor(Math.random() * EQUIP_PARTS.length)];
  const maxInfuseBase = EQUIP_MAX_INFUSE[part] || 1;
  // 보조무기는 기본 특성 1개 보유; 그 외 장비는 20% 확률
  const hasTrait = part === 'subweapon' ? true : (Math.random() < 0.20);
  const traits = [];
  let maxInfuse = maxInfuseBase;
  let traitName = '';
  if (hasTrait) {
    const traitId = EQUIP_TRAIT_TYPES[Math.floor(Math.random() * EQUIP_TRAIT_TYPES.length)];
    traits.push(traitId);
    if (part !== 'subweapon') maxInfuse = maxInfuseBase + 1;
    traitName = EQUIP_TRAIT_LABELS[traitId] || traitId;
  }
  const basePrice = calcEquipBasePrice(r, part);
  // 특성 있는 경우 희귀재료 기준가 × 1.25 추가 (특성주입 비용만큼)
  const traitBonus = hasTrait ? Math.round((RARE_MATERIAL_BASE_WON[r] || RARE_MATERIAL_BASE_WON.E) * 1.25) : 0;
  const price = basePrice + traitBonus;
  const uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const partLabel = EQUIP_PART_LABELS[part] || part;
  const nameSuffixes = { weapon:['검','창','활','완드','도끼'], armor:['갑옷','로브','체인메일','플레이트'], subweapon:['방패','단검'], accessory:['반지','목걸이','팔찌'] };
  const suffArr = nameSuffixes[part] || [partLabel];
  const suff = suffArr[Math.floor(Math.random() * suffArr.length)];
  const name = `${r}급 드랍 ${suff}${hasTrait ? ` [${traitName}]` : ''}`;
  return {
    id: `drop_equip_${r.toLowerCase()}_${part}_${uid}`,
    name,
    part,
    rank: r,
    enhance: 0,
    infuse: traits.length,
    maxInfuse,
    traits,
    durability: 100,
    maxDurability: 100,
    price,
    category: 'equipment',
    isDropped: true,
    stackable: false,
    unitWeightG: EQUIP_WEIGHT_G[part] || 1000,
    stackKey: `equipment:drop_${r}_${part}_${uid}`,
    note: hasTrait ? `게이트 드랍. 특성: ${traitName} | 특성주입 최대 ${maxInfuse}회` : `게이트 드랍. 특성주입 최대 ${maxInfuse}회`,
    atk: part === 'weapon' ? (WEAPON_BASE_ATK[r] || 5) : 0,
    pdef: part === 'armor' ? Math.round((ARMOR_STAT_BY_RANK[r]||{defRange:[0,5]}).defRange[1] * 0.5) : (part === 'subweapon' ? Math.round((ARMOR_STAT_BY_RANK[r]||{defRange:[0,5]}).defRange[1] * 0.25) : 0),
    mdef: part === 'armor' ? Math.round((ARMOR_STAT_BY_RANK[r]||{defRange:[0,5]}).defRange[1] * 0.3) : 0,
    mainStat: part === 'weapon' ? (Math.random() < 0.5 ? 'str' : 'int') : (part === 'armor' ? 'con' : 'str'),
    resistType: '',
    resistPct: 0
  };
}
// 엘리트 장비 드랍 테이블 (롤 기반)
// 1~90=없음, 91~93=악세, 94~96=보조무기, 97~100=방어구
function rollEliteEquipDrop(roll) {
  if (roll <= 90) return null;
  if (roll <= 93) return 'accessory';
  if (roll <= 96) return 'subweapon';
  return 'armor';
}
// 보스 장비 드랍 테이블 (롤 기반)
// 1~50=없음, 51~60=악세, 61~80=보조무기, 81~90=방어구, 91~100=무기
function rollBossEquipDrop(roll) {
  if (roll <= 50) return null;
  if (roll <= 60) return 'accessory';
  if (roll <= 80) return 'subweapon';
  if (roll <= 90) return 'armor';
  return 'weapon';
}
// 레드게이트 보스 장비 드랍 테이블
// 1~20=없음, 21~36=악세, 37~68=보조무기, 69~84=방어구, 85~100=무기
function rollRedGateBossEquipDrop(roll) {
  if (roll <= 20) return null;
  if (roll <= 36) return 'accessory';
  if (roll <= 68) return 'subweapon';
  if (roll <= 84) return 'armor';
  return 'weapon';
}
// 보스 스킬북 드랍 레이블 (98=치유/버프, 99=단일공격/CC, 100=광역공격/CC)
function rollBossSkillBookDrop(roll) {
  if (roll <= 97) return null;
  if (roll === 98) return '치유·버프형';
  if (roll === 99) return '단일 공격·CC형';
  return '광역 공격·CC형';
}
// 레드게이트 보스 스킬북 드랍 (94~95=치유/버프, 96~97=단일, 98~100=광역)
function rollRedGateSkillBookDrop(roll) {
  if (roll <= 93) return null;
  if (roll <= 95) return '치유·버프형';
  if (roll <= 97) return '단일 공격·CC형';
  return '광역 공격·CC형';
}
function addNormalRollLoot(bucket, rank, roll, sourceRef) {
  if (!rank) return;
  if (roll <= 50) return;
  if (roll <= 80) { addNormalMaterial(bucket, rank, 1, sourceRef); return; }
  let purity = 10;
  if (roll <= 84) purity = randInt(10, 19);
  else if (roll <= 90) purity = randInt(20, 29);
  else if (roll <= 92) purity = randInt(30, 39);
  else if (roll <= 94) purity = randInt(40, 49);
  else purity = 50;
  addManaStone(bucket, rank, purity, 1);
}
function addEliteLoot(bundle, rank, sourceRef) {
  const own = randInt(1, 100);
  let purity = 55;
  if (own <= 20) purity = randInt(55, 59);
  else if (own <= 40) purity = randInt(60, 64);
  else if (own <= 60) purity = randInt(65, 69);
  else if (own <= 80) purity = randInt(70, 74);
  else purity = 75;
  addManaStone(bundle, rank, purity, 1);
  if (own >= 76) addRareMaterial(bundle, rank, pickRareTraitForRoll(own, false), 1, sourceRef);
  const low = lowerGrade(rank);
  if (low) addNormalRollLoot(bundle, low, randInt(1, 100), sourceRef);
  // 엘리트 장비 드랍 (독립 롤: 91~93=악세, 94~96=보조무기, 97~100=방어구)
  const equipRoll = randInt(1, 100);
  const equipPart = rollEliteEquipDrop(equipRoll);
  if (equipPart) {
    const eq = buildDropEquipment(rank, equipPart);
    grantInventoryItem(eq);
    bundle.notes.push(`⚔️ 장비 드랍: ${eq.name}${eq.traits.length ? ` [특성: ${eq.traits.map(t=>EQUIP_TRAIT_LABELS[t]||t).join(', ')}]` : ''} (롤: ${equipRoll})`);
  }
}
function addBossLoot(bundle, rank, sourceRef) {
  const own = randInt(1, 100);
  let purity = 80;
  if (own <= 20) purity = randInt(80, 84);
  else if (own <= 40) purity = randInt(85, 89);
  else if (own <= 60) purity = randInt(90, 94);
  else if (own <= 80) purity = randInt(95, 99);
  else purity = 100;
  addManaStone(bundle, rank, purity, 1);
  if (own >= 26) addRareMaterial(bundle, rank, pickRareTraitForRoll(own, true), 1, sourceRef);
  const low = lowerGrade(rank);
  if (low) addNormalRollLoot(bundle, low, randInt(1, 100), sourceRef);
  // 보스 장비 드랍 (독립 롤: 51~60=악세, 61~80=보조무기, 81~90=방어구, 91~100=무기)
  const equipRoll = randInt(1, 100);
  const equipPart = rollBossEquipDrop(equipRoll);
  if (equipPart) {
    const eq = buildDropEquipment(rank, equipPart);
    grantInventoryItem(eq);
    bundle.notes.push(`⚔️ 장비 드랍: ${eq.name}${eq.traits.length ? ` [특성: ${eq.traits.map(t=>EQUIP_TRAIT_LABELS[t]||t).join(', ')}]` : ''} (롤: ${equipRoll})`);
  }
  // 보스 스킬북 드랍 (독립 롤: 98=치유/버프, 99=단일공격/CC, 100=광역공격/CC)
  const sbRoll = randInt(1, 100);
  const sbType = rollBossSkillBookDrop(sbRoll);
  if (sbType) {
    bundle.notes.push(`📖 스킬북 드랍: ${rank}급 [${sbType}] (롤: ${sbRoll}) — 추후 스킬북 시스템 연동 예정`);
  }
}
function addOreVeinLoot(bundle, rank, count) {
  for (let i = 0; i < count; i += 1) {
    const roll = randInt(1, 100);
    const amount = roll <= 40 ? 2 : (roll <= 80 ? 3 : 4);
    let purityRoll = randInt(1, 100);
    let purity = 15;
    if (purityRoll <= 20) purity = randInt(15, 29);
    else if (purityRoll <= 40) purity = randInt(30, 44);
    else if (purityRoll <= 60) purity = randInt(45, 59);
    else if (purityRoll <= 80) purity = randInt(60, 74);
    else purity = 75;
    addManaStone(bundle, rank, purity, amount);
  }
}
// 전투 로그 배열에서 특정 몬스터의 마지막 처치 로그 위치를 찾는다.
// 처치 라인은 두 가지 형태: "/ 처치: 몬스터명" 또는 "몬스터명에게 적중 ... [처치]"
function findLastKillLineIndex(logs, monName) {
  for (let i = logs.length - 1; i >= 0; i--) {
    const line = logs[i];
    if ((line.includes('처치: ') && line.includes(monName)) ||
        (line.includes(monName + '에게') && line.endsWith('[처치]'))) {
      return i;
    }
  }
  return -1;
}

function resolveCombatRoomRewards(run, room) {
  const bundle = createRewardBucket();
  const rt = model.state.runtime;
  const refs = ((room && room.encounter && room.encounter.enemySlots) || [])
    .map(id => getMonsterById(id))
    .filter(Boolean);

  // 몬스터별 드랍 라인(표시용, [전투] 접두 없음)
  const perMonsterDropLines = [];

  if (refs.length) {
    refs.forEach(mon => {
      const one = createRewardBucket();
      const kind = normalizeMonsterKind(mon.kind || 'Normal');
      const monRank = normalizeRank(mon.rank || run.rank);

      if (kind === 'Normal') {
        const own = randInt(1, 100);
        addNormalRollLoot(one, monRank, own, mon);
        const low = lowerGrade(monRank);
        if (low) addNormalRollLoot(one, low, randInt(1, 100), mon);
      } else if (kind === 'Elite') {
        addEliteLoot(one, monRank, mon);
      } else {
        addBossLoot(one, monRank, mon);
      }

      // 드랍이 있을 때만 표시. [전투] 접두 없이 "몬스터명 드랍: ..." 형태로 저장.
      const got = rewardBucketDropLinesCompact(one);
      if (got.length) {
        const dropLine = `${mon.name} 드랍: ${got.join(' / ')}`;
        perMonsterDropLines.push(dropLine);
        // 전투 로그에 처치 직후 위치에 드랍 라인을 삽입한다.
        if (rt && Array.isArray(rt.logs)) {
          const killIdx = findLastKillLineIndex(rt.logs, mon.name);
          if (killIdx >= 0) {
            rt.logs.splice(killIdx + 1, 0, dropLine);
          } else {
            rt.logs.push(dropLine);
          }
        }
      }

      mergeRewardBucket(bundle, one);
    });
  } else {
    const enc = room.encounter || { normal:0, elite:0, boss:0 };
    for (let i = 0; i < Number(enc.normal || 0); i += 1) {
      const own = randInt(1, 100);
      addNormalRollLoot(bundle, run.rank, own, null);
      const low = lowerGrade(run.rank);
      if (low) addNormalRollLoot(bundle, low, randInt(1, 100), null);
    }
    for (let i = 0; i < Number(enc.elite || 0); i += 1) addEliteLoot(bundle, run.rank, null);
    for (let i = 0; i < Number(enc.boss || 0); i += 1) addBossLoot(bundle, run.rank, null);
  }

  mergeRewardBucket(run.stash, bundle);
  depositRewardBucketToInventory(bundle);

  // 합산 요약 라인(summaryLines)은 반환하지 않는다 — 중복 집계 방지.
  // 몬스터별 드랍 라인만 반환해 postBattle UI에 표시한다.
  return perMonsterDropLines;
}
function resolvePuzzleRoom(run, room) {
  room.discovered = true;
  const bundle = createRewardBucket();
  // 파티원 중 최고 감각 기준 퍼즐 판정
  const alive = randomAlivePartyIndices(run);
  const maxSense = Math.max(0, ...alive.map(row => Number((row.u.stats && row.u.stats.sense) || row.u.sense || 0)));
  const threshold = SENSE_CHECK_BY_RANK[String(run.rank||'E').toUpperCase()] || 15;
  if (maxSense > threshold) {
    // 감각 통과: 70% 엘리트, 30% 일반재료
    if (Math.random() < 0.70) {
      addEliteLoot(bundle, run.rank);
      bundle.notes.push(`퍼즐 보상 판정 (감각 ${maxSense} > ${threshold}): 엘리트급 보상`);
    } else {
      addNormalMaterial(bundle, run.rank, randInt(2, 4));
      bundle.notes.push(`퍼즐 보상 판정 (감각 ${maxSense} > ${threshold}): 일반재료`);
    }
  } else {
    // 감각 미달: 일반재료만
    addNormalMaterial(bundle, run.rank, randInt(2, 4));
    bundle.notes.push(`퍼즐 보상 판정 (감각 ${maxSense} ≤ ${threshold}): 일반재료`);
  }
  mergeRewardBucket(run.stash, bundle);
  const invLogs = depositRewardBucketToInventory(bundle);
  if (invLogs.length) bundle.notes = (bundle.notes || []).concat(invLogs);
  room.cleared = true;
  pushGateLog(run, `퍼즐 해결: ${room.rewardLines.join(' / ') || '보상 없음'}`);
  if (roomHasMineableVeins(room)) {
    model.state.view = 'gate';
    return;
  }
  if (run.sideRoomActive) {
    applyRoomTraversalMinutes(run, room, 30);
    run.sideRoomActive = false;
    run.secretPlan.offered = false;
    run.secretPlan.resolved = true;
  } else {
    advanceGateRunAfterMainRoom(run, run.currentStage, room);
  }
}
function resolveSecretRoom(run, room) {
  room.discovered = true;
  const bundle = createRewardBucket();
  addBossLoot(bundle, run.rank);
  mergeRewardBucket(run.stash, bundle);
  const invLogs = depositRewardBucketToInventory(bundle);
  if (invLogs.length) bundle.notes = (bundle.notes || []).concat(invLogs);
  room.rewardLines = rewardBucketLines(bundle);
  room.cleared = true;
  pushGateLog(run, `비밀방 정산: ${room.rewardLines.join(' / ') || '보상 없음'}`);
  if (roomHasMineableVeins(room)) {
    return;
  }
  applyRoomTraversalMinutes(run, room, 30);
  run.sideRoomActive = false;
  if (run.secretPlan) {
    run.secretPlan.offered = false;
    run.secretPlan.resolved = true;
  }
}
function resolveGateBattleAftermath(victory) {
  const run = getGateRun();
  if (!run || !run.pendingBattleRoomId) throw new Error('게이트 전투 상태가 없다.');
  const room = getRoomById(run, run.pendingBattleRoomId);
  if (!room) throw new Error('현재 방을 찾지 못했다.');
  const rt = model.state.runtime;
  if (!rt.started || !rt.finished) throw new Error('전투가 아직 끝나지 않았다.');
  if (!victory) {
    run.failed = true;
    run.postBattle = null;
    run.pendingBattleRoomId = '';
    pushGateLog(run, `게이트 실패: ${roomDisplayLabel(room, true)} 방에서 패퇴.`);
    model.state.view = 'gate';
    model.state.runtime = buildDefaultRuntime();
    return;
  }
  run.partyState = getAlive(rt.party).map(serializeUnitState);
  room.discovered = true;
  room.cleared = true;
  // resolveCombatRoomRewards가 rt.logs에 드랍 라인을 처치 직후에 삽입하므로
  // 반드시 rt.logs를 pushGateLog에 넘기기 전에 먼저 호출해야 한다.
  room.rewardLines = resolveCombatRoomRewards(run, room);
  // 전투 로그를 게이트 로그로 이관. 드랍 라인(" 드랍:")은 [전투] 접두 없이 그대로 표시.
  (rt.logs || []).forEach(line => {
    const prefix = line.includes(' 드랍:') ? '' : '[전투] ';
    pushGateLog(run, `${prefix}${line}`);
  });
  // 승리 라인은 보상 텍스트 없이 단독으로 출력한다 (중복/이중집계 방지).
  pushGateLog(run, `${roomDisplayLabel(room, true)} 방 승리`);
  run.pendingBattleRoomId = '';
  run.postBattle = {
    roomId: room.id,
    roomType: room.type,
    stageIndex: run.currentStage,
    restUsed:false,
    allowRest:true,
    rewardLines: deepClone(room.rewardLines || []),
    sideRoom: !!run.sideRoomActive,
    llmBlock: String(rt.llmBlock || ''),
    outcome: String(rt.outcome || 'Victory')
  };
  model.state.runtime = buildDefaultRuntime();
  model.state.view = 'gate';
}
function continueAfterGateBattle(run) {
  if (!run || !run.postBattle) return;
  const pb = run.postBattle;
  const room = getRoomById(run, pb.roomId);
  if (room) markSkippedVeinIfNeeded(run, room);
  if (pb.sideRoom) {
    if (room) applyRoomTraversalMinutes(run, room, 30);
    run.sideRoomActive = false;
    if (run.secretPlan) {
      run.secretPlan.offered = false;
      run.secretPlan.resolved = true;
    }
  } else if (room) {
    advanceGateRunAfterMainRoom(run, Number(pb.stageIndex || run.currentStage || 0), room);
  }
  run.postBattle = null;
}

function continueAfterClearedRoom(run) {
  if (!run) return;
  const room = getActiveRoom(run);
  if (!room || !room.cleared) return;
  markSkippedVeinIfNeeded(run, room);
  if (run.sideRoomActive) {
    applyRoomTraversalMinutes(run, room, 30);
    run.sideRoomActive = false;
    if (run.secretPlan) {
      run.secretPlan.offered = false;
      run.secretPlan.resolved = true;
    }
  } else {
    advanceGateRunAfterMainRoom(run, run.currentStage, room);
  }
}
function restGateParty(run) {
  if (!run || !run.postBattle) throw new Error('휴식 가능한 시점이 아니다.');
  if (run.postBattle.restUsed) throw new Error('이 방에서는 이미 휴식했다.');
  let lines = [];
  (run.partyState || []).forEach(unit => {
    const maxHp = Number(unit.hp || unit.maxHp || 0);
    const maxMp = Number(unit.mp || unit.maxMp || 0);
    const maxSp = Number(unit.sp || unit.maxSp || 0);
    const hpGain = Math.max(1, Math.floor(maxHp * 0.02));
    const mpGain = Math.max(0, Math.floor(maxMp * 0.02));
    const spGain = Math.max(0, Math.floor(maxSp * 0.02));
    unit.currentHp = clamp(Number(unit.currentHp || 0) + hpGain, 0, maxHp);
    unit.currentMp = clamp(Number(unit.currentMp || 0) + mpGain, 0, maxMp);
    unit.currentSp = clamp(Number(unit.currentSp || 0) + spGain, 0, maxSp);
    lines.push(`${unit.name} HP+${hpGain}${mpGain ? ` / MP+${mpGain}` : ''}${spGain ? ` / SP+${spGain}` : ''}`);
  });
  run.elapsedMinutes = Number(run.elapsedMinutes || 0) + 30;
  run.postBattle.restUsed = true;
  pushGateLog(run, `휴식(30분): ${lines.join(' / ')}`);
  return lines;
}
function campRequirement(run) {
  const n = Math.max(1, Number(run && run.partyStartCount || (run && run.partyState && run.partyState.length) || 1));
  return { tent:1, ration:n, water:n };
}
function campSupplyStock() {
  // Count old supply_tent items and new grade-based tent items
  const tentCount = getSupplyCount('tent') + GRADE_ORDER.reduce((s, g) => {
    const it = findInventoryItemById(`tent_${g}`);
    return s + (it ? Math.max(0, Number(it.count || 0)) : 0);
  }, 0);
  return { tent: tentCount, ration:getSupplyCount('ration'), water:getSupplyCount('water') };
}
function canUseCamp(run) {
  if (!run || !run.campSupplies || run.size === 'small') return false;
  if (run.campSupplies.used) return false;
  const req = campRequirement(run);
  const stock = campSupplyStock();
  return stock.tent >= req.tent && stock.ration >= req.ration && stock.water >= req.water;
}
function campGateParty(run) {
  if (!run) throw new Error('진행 중인 게이트가 없다.');
  const room = getActiveRoom(run);
  if (!room || room.type !== 'camp') throw new Error('야영 가능한 장소가 아니다.');
  if (room.cleared) throw new Error('이 야영지는 이미 처리되었다.');
  if (!canUseCamp(run)) throw new Error('야영에 필요한 보급품이 부족하거나 이미 야영을 사용했다.');
  const req = campRequirement(run);
  if (campSupplyStock().tent < req.tent) throw new Error('텐트가 부족하다.');
  if (!consumeInventoryById('supply_ration', req.ration) || !consumeInventoryById('supply_water', req.water)) throw new Error('야영 보급품이 부족하다.');
  run.campSupplies.used = true;
  const lines = [];
  (run.partyState || []).forEach(unit => {
    const maxHp = Number(unit.hp || unit.maxHp || 0);
    const maxMp = Number(unit.mp || unit.maxMp || 0);
    const maxSp = Number(unit.sp || unit.maxSp || 0);
    const hpGain = Math.max(1, Math.floor(maxHp * 0.60));
    const mpGain = Math.max(0, Math.floor(maxMp * 0.60));
    const spGain = Math.max(0, Math.floor(maxSp * 0.60));
    unit.currentHp = clamp(Number(unit.currentHp || 0) + hpGain, 0, maxHp);
    unit.currentMp = clamp(Number(unit.currentMp || 0) + mpGain, 0, maxMp);
    unit.currentSp = clamp(Number(unit.currentSp || 0) + spGain, 0, maxSp);
    if (unit.statuses) {
      ['poison','bleed','burn','curse','bind','stun','sleep'].forEach(k => { if (Number(unit.statuses[k] || 0) > 0) unit.statuses[k] = 0; });
      ['poisonPower','bleedPower','burnPower'].forEach(k => { if (unit.statuses[k]) unit.statuses[k] = 0; });
    }
    lines.push(`${unit.name} HP+${hpGain}${mpGain ? ` / MP+${mpGain}` : ''}${spGain ? ` / SP+${spGain}` : ''}`);
  });
  room.cleared = true;
  room.rewardLines = lines;
  run.elapsedMinutes = Number(run.elapsedMinutes || 0) + 360;
  pushGateLog(run, `야영(6시간): ${lines.join(' / ')}`);
  if (run.sideRoomActive) {
    run.sideRoomActive = false;
    if (run.secretPlan) { run.secretPlan.offered = false; run.secretPlan.resolved = true; }
  } else {
    advanceGateRunAfterMainRoom(run, run.currentStage, room);
  }
  return lines;
}
function skipCampRoom(run) {
  if (!run) throw new Error('진행 중인 게이트가 없다.');
  const room = getActiveRoom(run);
  if (!room || room.type !== 'camp') throw new Error('야영지가 아니다.');
  room.cleared = true;
  room.rewardLines = ['야영을 하지 않고 지나쳤다.'];
  pushGateLog(run, '야영지를 지나쳤다.');
  if (run.sideRoomActive) {
    run.sideRoomActive = false;
    if (run.secretPlan) { run.secretPlan.offered = false; run.secretPlan.resolved = true; }
  } else {
    advanceGateRunAfterMainRoom(run, run.currentStage, room);
  }
}
function retreatFromGateRun(run) {
  if (!run) return;
  run.failed = true;
  run.postBattle = null;
  run.pendingBattleRoomId = '';
  pushGateLog(run, '게이트에서 후퇴했다.');
  model.state.view = 'gate';
  model.state.runtime = buildDefaultRuntime();
}

function migrateLegacyCampSupplies(run) {
  if (!run || !run.campSupplies || run.campSupplies.legacyMigrated) return;
  const legacy = run.campSupplies;
  ['tent','ration','water'].forEach(kind => {
    const count = Math.max(0, Number(legacy[kind] || 0));
    if (!count) return;
    const res = addSupplyToInventory(kind, count);
    if (!res.ok) pushInventoryOverflow(buildSupplyItem(kind, count));
    legacy[kind] = 0;
  });
  legacy.legacyMigrated = true;
}
function autoHandleFinishedGateBattle() {
  const run = getGateRun();
  const rt = model.state.runtime;
  if (!run || !run.pendingBattleRoomId || !rt || !rt.started || !rt.finished) return false;
  resolveGateBattleAftermath(String(rt.outcome || '') === 'Victory');
  return true;
}
function currentGatePrompt(run) {
  if (!run) return '';
  if (run.completed) return '<div class="gb-sub">게이트 공략 완료. 허브로 돌아가거나 새 게이트를 생성해.</div>';
  if (run.failed) return '<div class="gb-sub" style="color:#fca5a5;">게이트 공략 종료/후퇴. 새 게이트를 고르거나 파티를 재정비해.</div>';
  if (run.postBattle) {
    const afterRoom = getRoomById(run, run.postBattle.roomId);
    const nextLabel = run.postBattle.roomType === 'boss' ? '게이트 종료' : '다음방 진입';
    const canMine = roomHasMineableVeins(afterRoom);
    const allowRest = run.postBattle.allowRest !== false;
    return `
      <div class="gb-panel">
        <div class="gb-section-title">${allowRest ? '전투 후 선택' : '방 정리'}</div>
        <div class="gb-sub">${allowRest ? '전투가 끝났다. 다음 행동을 고를 수 있다.' : '방을 정리했다. 다음 행동을 고를 수 있다.'}</div>
        ${run.postBattle.rewardLines && run.postBattle.rewardLines.length ? `<div class="gb-log">${run.postBattle.rewardLines.map(t => `<div>• ${escapeHtml(t)}</div>`).join('')}</div>` : ''}
        ${allowRest ? (run.postBattle.restUsed ? '<div class="gb-sub">이 방에서는 이미 휴식을 사용했다.</div>' : '<div class="gb-sub">휴식: 30분 경과 / 생존 파티 HP·MP·SP 2% 회복</div>') : ''}
        ${run.postBattle.llmBlock ? `<textarea class="gb-textarea short" readonly>${escapeHtml(run.postBattle.llmBlock)}</textarea>` : ''}
        <div class="gb-btn-row">
          <button class="gb-btn primary" id="gb-postbattle-next">${nextLabel}</button>
          ${allowRest ? `<button class="gb-btn" id="gb-postbattle-rest" ${run.postBattle.restUsed ? 'disabled' : ''}>휴식</button>` : ''}
          ${canMine ? '<button class="gb-btn" id="gb-postbattle-mine">광맥 채굴</button>' : ''}
          <button class="gb-btn danger" id="gb-postbattle-retreat">후퇴</button>
          ${run.postBattle.llmBlock ? '<button class="gb-btn" id="gb-postbattle-copy-llm">결과 블록 복사</button>' : ''}
        </div>
      </div>`;
  }
  if (run.secretPlan && run.secretPlan.offered && !run.sideRoomActive && !run.secretPlan.resolved) {
    return `
      <div class="gb-panel">
        <div class="gb-section-title">비밀방 발견</div>
        <div class="gb-sub">벽 너머에 숨겨진 공간이 열렸다. 진입할지, 그냥 진행할지 고를 수 있다.</div>
        <div class="gb-btn-row"><button class="gb-btn primary" id="gb-secret-enter">비밀방 진입</button><button class="gb-btn" id="gb-secret-skip">그냥 진행</button></div>
      </div>`;
  }
  const room = getActiveRoom(run);
  if (run.sideRoomActive && room) {
    // choice prompt보다 비밀방/사이드룸 우선
  } else {
    const stage = getCurrentStage(run);
    if (!stage) return '<div class="gb-sub">진행할 단계가 없다.</div>';
    if (stage.kind === 'choice' && !stage.chosen) {
      return `
        <div class="gb-panel">
          <div class="gb-section-title">갈림길</div>
          <div class="gb-sub">앞쪽 방의 정체는 알 수 없다. 경로만 선택할 수 있다.</div>
          <div class="gb-btn-row">${(stage.options || []).map(opt => `<button class="gb-btn primary" data-stage-choice="${escapeHtml(opt.key)}">경로 ${escapeHtml(opt.key)}</button>`).join('')}</div>
        </div>`;
    }
  }
  if (!room) return '<div class="gb-sub">현재 방 정보를 찾지 못했다.</div>';
  let actions = '';
  if (room.type === 'camp' && !room.cleared) {
    const req = campRequirement(run);
    const ok = canUseCamp(run);
    const sup = campSupplyStock();
    const used = !!(run.campSupplies && run.campSupplies.used);
    actions = `
      <div class="gb-sub">야영 필요: 텐트 ${sup.tent}/${req.tent} · 식량 ${sup.ration}/${req.ration} · 물 ${sup.water}/${req.water}</div>
      <div class="gb-sub">텐트는 보유만 확인하고 소모하지 않는다. 식량/물만 소비한다.</div>
      <div class="gb-sub">야영: 6시간 경과 / 생존 파티 HP·MP·SP 60% 회복 / 상태이상 일부 완화</div>
      ${used ? '<div class="gb-sub">이 게이트에서는 이미 야영을 사용했다.</div>' : ''}
      <button class="gb-btn primary" id="gb-room-camp" ${ok ? '' : 'disabled'}>야영</button>
      <button class="gb-btn" id="gb-room-skip-camp">그냥 지나가기</button>`;
  } else if (room.type === 'puzzle' && !room.cleared) actions = '<button class="gb-btn primary" id="gb-room-solve-puzzle">퍼즐 해결</button>';
  else if (room.type === 'secret' && !room.cleared) actions = '<button class="gb-btn primary" id="gb-room-open-secret">비밀방 탐색</button>';
  else if (['combat','elite','boss'].includes(room.type) && !room.cleared) actions = '<button class="gb-btn primary" id="gb-room-enter">전투 시작</button>';
  else if (!room.cleared) actions = '<button class="gb-btn primary" id="gb-room-enter">방 진입</button>';
  else if (room.cleared) actions = `${roomHasMineableVeins(room) ? '<button class="gb-btn" id="gb-room-mine">광맥 채굴</button>' : ''}<button class="gb-btn primary" id="gb-room-next">다음방 진입</button><button class="gb-btn danger" id="gb-room-retreat">후퇴</button>`;
  return `
    <div class="gb-panel">
      <div class="gb-section-title">현재 방</div>
      <div><strong>${escapeHtml(room.discovered || room.cleared ? roomDisplayLabel(room, true) : '미확인 방')}</strong></div>
      <div class="gb-sub">${escapeHtml(room.discovered || room.cleared ? ('유형: ' + roomDisplayLabel(room, true)) : '정체를 알 수 없다.')}</div>
      ${room.notes && room.notes.length ? `<div class="gb-log">${room.notes.map(t => `<div>• ${escapeHtml(t)}</div>`).join('')}</div>` : ''}
      ${room.rewardLines && room.rewardLines.length ? `<div class="gb-log">${room.rewardLines.map(t => `<div>• ${escapeHtml(t)}</div>`).join('')}</div>` : ''}
      <div class="gb-btn-row">${actions}</div>
    </div>`;
}
function renderGateRunPanel(run) {
  const tokens = (run.stages || []).map((stage, idx) => stageToken(stage, idx, run)).join(' <span class="gb-sub">→</span> ');
  const stashLines = rewardBucketDropLines(run.stash);
  const sup = campSupplyStock();
  const used = !!(run.campSupplies && run.campSupplies.used);
  return `
    <div class="gb-panel">
      <div class="gb-section-title">진행 중인 게이트</div>
      <div><strong>${escapeHtml(run.title)}</strong> <span class="gb-badge">${escapeHtml(run.rank)}</span> <span class="gb-badge">${escapeHtml(run.sizeLabel)}</span></div>
      <div class="gb-sub">${escapeHtml(run.primarySpeciesLabel)} + ${escapeHtml(run.secondarySpeciesLabel)} / 내부 배치 정보 비공개</div>
      <div class="gb-log"><div>${tokens}</div></div>
      <div class="gb-sub">생존 파티 ${run.partyState.length}명 / 현재 단계 ${Math.min(run.currentStage + 1, run.stages.length)}/${run.stages.length} / 경과 ${Math.floor((run.elapsedMinutes || 0)/60)}h ${(run.elapsedMinutes || 0)%60}m</div>
      <div class="gb-sub">야영 보급(인벤 기준): 텐트 ${sup.tent || 0} / 식량 ${sup.ration || 0} / 물 ${sup.water || 0}${used ? ' / 야영 사용 완료' : ''}</div>
    </div>
    ${currentGatePrompt(run)}
    <div class="gb-grid two">
      <div class="gb-panel">
        <div class="gb-section-title">최근 로그</div>
        <div class="gb-log">${(run.logs || []).slice(0, 150).map(t => `<div>• ${escapeHtml(t)}</div>`).join('') || '<div>아직 로그가 없다.</div>'}</div>
      </div>
      <div class="gb-panel">
        <div class="gb-section-title">현재 정산</div>
        <div class="gb-log">${stashLines.length ? stashLines.map(t => `<div>• ${escapeHtml(t)}</div>`).join('') : '<div>아직 획득한 보상이 없다.</div>'}</div>
      </div>
    </div>
    <div class="gb-panel">
      <div class="gb-section-title">게이트 전체 로그</div>
      <textarea class="gb-textarea" readonly>${escapeHtml(((run.fullLogs || []).slice(-1200)).join('\n'))}</textarea>
    </div>`;
}
async function applyGateSelectionToBattle(goBattle) {
  const gate = getSelectedGeneratedGate();
  if (!gate) throw new Error('선택된 게이트가 없다.');
  model.state.gate.current = deepClone(gate);
  model.db.battleSetup.enemySlots = (gate.previewEnemySlots || []).slice(0, MAX_ENEMIES);
  while (model.db.battleSetup.enemySlots.length < MAX_ENEMIES) model.db.battleSetup.enemySlots.push('');
  model.state.runtime = buildDefaultRuntime();
  if (goBattle) model.state.view = 'battle';
  await saveDb();
  await saveState();
}

function getBuffedStat(unit, statKey) {
    let value = Number((unit.stats && unit.stats[statKey]) || 0) + Number((unit.passiveBonuses && unit.passiveBonuses[statKey]) || 0);
    (unit.buffs || []).forEach(buff => {
      if (buff && buff.stats && buff.stats[statKey]) value += Number(buff.stats[statKey]);
    });
    return value;
  }
  const CURSE_PERCENT_BY_RANK = { E:0.10, D:0.12, C:0.15, B:0.20, A:0.25, S:0.30 };
  function getCursePenalty(unit) {
    if (Number(unit.statuses.curse || 0) <= 0) return 0;
    const rank = normalizeRank(unit.rank);
    return CURSE_PERCENT_BY_RANK[rank] || 0.10;
  }
  function getIncomingDamageMul(unit) {
    let mul = (unit.buffs || []).reduce((acc, buff) => acc * Number(buff.damageTakenMul || 1), 1);
    if (unit && unit.damageTakenMods) {
      // applied later by damage type
    }
    if (Number(unit.aloneDamageTaken || 1) !== 1) {
      const sideUnits = unit.side === 'party' ? model.state.runtime.party : model.state.runtime.enemies;
      if (getAlive(sideUnits).length === 1) mul *= Number(unit.aloneDamageTaken || 1);
    }
    // Curse: rank-based incoming damage increase
    const cursePct = getCursePenalty(unit);
    if (cursePct > 0) mul *= (1 + cursePct);
    // Burn: +10% incoming damage (does not stack)
    if (Number(unit.statuses.burn || 0) > 0) mul *= 1.10;
    // 패시브: 진형 지휘 (전투 시작 2턴 피해감소)
    if (unit.passiveMods && Number(unit.passiveMods.formationDmgReduce || 0) > 0) {
      const runtime = (typeof model !== 'undefined' && model.state && model.state.runtime) ? model.state.runtime : null;
      if (runtime && runtime.round <= 2 && unit.row === 'front') {
        mul *= (1 - unit.passiveMods.formationDmgReduce);
      }
    }
    return mul;
  }
  function getOutgoingMul(unit, target, skill) {
    let mul = 1;
    // Curse: rank-based attack decrease
    const cursePct = getCursePenalty(unit);
    if (cursePct > 0) mul *= (1 - cursePct);
    if (unit.species === 'beast' && target && Number(target.statuses.bleed || 0) > 0) mul *= Number(unit.bonusVsBleeding || 1.2);
    // 소환수 보너스: 제피르 소환 시 질풍격 ×1.2
    if (skill && skill.id === 'galeStrike' && hasSummonBuff(unit, 'zephyr')) mul *= 1.2;
    return mul;
  }
  function getEffectiveDefense(unit, kind) {
    const base = Number(kind === 'magic' ? unit.mdef : unit.pdef);
    const passive = Number((unit.passiveBonuses && unit.passiveBonuses[kind === 'magic' ? 'mdef' : 'pdef']) || 0);
    return Math.max(0, base + passive);
  }
  function getStatPower(unit, skill) {
    const types = (skill && skill.statTypes && skill.statTypes.length > 0) ? skill.statTypes : [unit.attackStat || 'str'];
    const values = types.map(key => getBuffedStat(unit, key));
    return Math.round(values.reduce((a,b)=>a+b,0) / values.length);
  }
  function getSkillCost(unit, skill) {
    const base = Object.assign({ mp:0, sp:0 }, (skill && skill.costs) || {});
    let mp = base.mp || 0;
    let sp = base.sp || 0;
    // 방패숙련: 방패 계열 SP 감소
    if ((skill.id === 'shieldBash' || skill.id === 'shockwave' || skill.id === 'shieldSmash') && unit.passiveMods && unit.passiveMods.shieldSpMul) {
      sp = Math.ceil(sp * (unit.passiveMods.shieldSpMul || 1));
    }
    // 단검숙련: 단검/투척 계열 SP 감소
    if ((skill.id === 'quickThrow' || skill.id === 'knifeRecall') && unit.passiveMods && unit.passiveMods.daggerSpMul) {
      sp = Math.ceil(sp * (unit.passiveMods.daggerSpMul || 1));
    }
    // 사기관리: 전투 시작 2턴 전 아군 MP/SP -12%
    if (unit.passiveMods && Number(unit.passiveMods.moraleCostReduce || 0) > 0) {
      const runtime = (typeof model !== 'undefined' && model.state && model.state.runtime) ? model.state.runtime : null;
      if (runtime && runtime.round <= 2) {
        const reduce = unit.passiveMods.moraleCostReduce;
        mp = Math.ceil(mp * (1 - reduce));
        sp = Math.ceil(sp * (1 - reduce));
      }
    }
    // 심판자의 기운: 적 스킬 비용 +10% (아군 패시브가 적에게 영향)
    if (typeof model !== 'undefined' && model.state && model.state.runtime) {
      const runtime = model.state.runtime;
      const enemySide = unit.side === 'party' ? runtime.enemies : runtime.party;
      const costMul = getAlive(enemySide).reduce((acc, u) => {
        return acc * Number((u.passiveMods && u.passiveMods.enemySkillCostMul) || 1);
      }, 1);
      if (costMul > 1) {
        mp = Math.ceil(mp * costMul);
        sp = Math.ceil(sp * costMul);
      }
    }
    return { mp, sp };
  }
  function canUseSkill(unit, skill) {
    if (!skill || skill.category === 'passive') return false;
    if (Number(unit.cooldowns && unit.cooldowns[skill.id] || 0) > 0) return false;
    // 침묵: 스킬 사용 불가 (기본 공격만 가능)
    if (Number(unit.statuses && unit.statuses.silence || 0) > 0) return false;
    // 대지의 치유: 정령 소환 시에만 사용 가능
    if (skill.id === 'earthHeal' && !hasSummonBuff(unit, 'zephyr') && !hasSummonBuff(unit, 'bark')) return false;
    const cost = getSkillCost(unit, skill);
    return unit.mp >= cost.mp && unit.sp >= cost.sp;
  }
  function paySkillCost(unit, skill) {
    const cost = getSkillCost(unit, skill);
    unit.mp = Math.max(0, unit.mp - cost.mp);
    unit.sp = Math.max(0, unit.sp - cost.sp);
    if (skill.cooldown) unit.cooldowns[skill.id] = Number(skill.cooldown);
    return cost;
  }
  function critChance(unit) {
    let bonus = 0;
    (unit.buffs || []).forEach(b => { if (b.critChanceBonus) bonus += Number(b.critChanceBonus); });
    let sense = getBuffedStat(unit, 'sense');
    // Bind: 속박된헌터 감각 -50%
    if (!unit.isMonster && Number(unit.statuses.bind || 0) > 0) sense = Math.floor(sense * 0.5);
    return clamp(0.25 * (getBuffedStat(unit, 'agi') + sense) + bonus, 3, 35) / 100;
  }
  const EVASION_BY_RANK = { E:0.03, D:0.05, C:0.07, B:0.10, A:0.12, S:0.15 };

  function getBaseEvasion(unit) {
    const rank = normalizeRank(unit.rank);
    return EVASION_BY_RANK[rank] || 0.03;
  }
  function hitChance(attacker, target, skill) {
    let accuracy;
    if (attacker.isMonster) {
      // 몬스터 기본명중률 100%
      accuracy = 1.0;
      // 속박된 몬스터: 명중률 -50%
      if (Number(attacker.statuses.bind || 0) > 0) accuracy *= 0.5;
      // 둔화된 몬스터: 명중률 -30%
      if (Number(attacker.statuses.slow || 0) > 0) accuracy *= 0.7;
    } else {
      // 헌터 명중률 = 70 + 감각 * 0.5
      let sense = getBuffedStat(attacker, 'sense');
      // 속박된 헌터: 감각 -50%, 명중률 -50%
      if (Number(attacker.statuses.bind || 0) > 0) sense = Math.floor(sense * 0.5);
      accuracy = (70 + sense * 0.5) / 100;
      if (Number(attacker.statuses.bind || 0) > 0) accuracy *= 0.5;
      // 둔화된 헌터: 명중률 -30%
      if (Number(attacker.statuses.slow || 0) > 0) accuracy *= 0.7;
    }
    // 대상 회피율 계산 (등급별)
    let evasion = 0;
    if (!target.isMonster) {
      evasion = getBaseEvasion(target);
      // 패시브 회피 보너스 (통찰, 본능 읽기 등)
      if (target.passiveMods && Number(target.passiveMods.evasionBonus || 0) > 0) {
        evasion += Number(target.passiveMods.evasionBonus);
      }
      // 공격자 등급 > 대상 등급 → 대상 회피율 0%
      if (rankIndex(attacker.rank) > rankIndex(target.rank)) {
        evasion = 0;
      }
      // 몬스터가 공격자일시 동급헌터의 회피율을 50%만 적용
      if (attacker.isMonster) {
        evasion *= 0.5;
      }
      // 둔화된 대상: 회피율 -50%
      if (Number(target.statuses.slow || 0) > 0) {
        evasion *= 0.5;
      }
    }
    // 최종 적중률 = 명중률 - 대상 회피율, 100% 이상 → 무조건 적중
    return accuracy - evasion;
  }
  function performHit(attacker, target, skill) {
    // 긴급회피: 다음 1회 공격 100% 회피
    const evasionBuff = (target.buffs || []).find(b => b && b.evasionNext && b.turns > 0);
    if (evasionBuff) {
      evasionBuff.turns = 0; // 1회 소모
      return { hit:false, crit:false };
    }
    const hitRate = hitChance(attacker, target, skill);
    const hit = hitRate >= 1.0 || Math.random() <= hitRate;
    const crit = hit && Math.random() <= critChance(attacker);
    return { hit, crit };
  }
  function computeDamage(attacker, target, skill, crit) {
    const coef = Number(skill && skill.coef != null ? skill.coef : 1.0);
    const damageType = (skill && skill.damageType) || attacker.damageType || 'physical';
    const def = getEffectiveDefense(target, damageType === 'magic' ? 'magic' : 'physical');
    const critMult = crit ? 1.5 : 1.0;
    const element = normElement((skill && skill.element && skill.element !== 'none') ? skill.element : (attacker.baseElement || 'none'));
    const resistMult = element !== 'none' ? Number((target.resists || {})[element] || 1) : 1;
    const elementMul = getElementAdvantageMult(element, target.baseElement || 'none');
    const typeMul = Number((target.damageTakenMods || {})[damageType] || 1);
    const incomingMul = getIncomingDamageMul(target);
    const outgoingMul = getOutgoingMul(attacker, target, skill);
    let rawBase = 0;
    if (attacker && attacker.isMonster && Number(attacker.monsterBaseDamage || 0) > 0) {
      const isSkill = !!(skill && skill.id && skill.id !== 'basicAttack');
      rawBase = Number(attacker.monsterBaseDamage || 1) * (isSkill ? Number(attacker.monsterSkillMul || 1) : 1);
    } else {
      const mainStat = getStatPower(attacker, skill);
      rawBase = (2 * mainStat) + (3 * Number(attacker.atk || 0));
    }
    // 방어 전 피해량 (rawDamage)
    let terrainMul = 1;
    // 지형 전환 효과: 식물(earth) +15%, 화염(fire) -10%
    if (typeof model !== 'undefined' && model.state && model.state.runtime && model.state.runtime.terrain && model.state.runtime.terrain.turnsLeft > 0) {
      if (element === 'earth') terrainMul *= 1.15;
      if (element === 'fire') terrainMul *= 0.90;
      if (attacker.species === 'plant') terrainMul *= 1.15;
    }
    const rawDamage = rawBase * coef * critMult * resistMult * elementMul * typeMul * incomingMul * outgoingMul * terrainMul;
    // 물리/마법 피해감소 공식: 피해감소율 = DEF / (DEF + 1.5 × rawDamage)
    const defReduction = (def > 0 && rawDamage > 0) ? def / (def + 1.5 * rawDamage) : 0;
    let afterStatDef = rawDamage * (1 - defReduction);
    // 패시브: 물리 피해 감소 (충격 감소 등)
    if (damageType === 'physical' && target.passiveMods && Number(target.passiveMods.physicalDmgReduce || 0) > 0) {
      afterStatDef *= (1 - target.passiveMods.physicalDmgReduce);
    }
    // 보너스 피해 (관통탄 등 — 최종 피해에 곱연산)
    let bonusMul = 1;
    if (skill && skill.passiveMods && Number(skill.passiveMods.bonusDamage || 0) > 0) {
      bonusMul += skill.passiveMods.bonusDamage;
    }
    if (attacker.passiveMods && Number(attacker.passiveMods.bonusDamage || 0) > 0) {
      bonusMul += attacker.passiveMods.bonusDamage;
    }
    afterStatDef *= bonusMul;
    return Math.max(1, Math.round(afterStatDef));
  }
  function computeHeal(caster, skill) {
    const mainStat = getStatPower(caster, skill);
    const ss = (2 * mainStat) + (3 * Number(caster.atk || 0));
    const coef = Number(skill && skill.coef != null ? skill.coef : 1.0);
    // Curse reduces outgoing heal by rank-based %
    const cursePct = getCursePenalty(caster);
    const curseMul = cursePct > 0 ? (1 - cursePct) : 1;
    return Math.max(1, Math.round(ss * coef * curseMul));
  }
  function getAlive(units) { return units.filter(u => !u.dead && u.hp > 0); }
  function findUnitByUid(runtime, uid) {
    return runtime.party.concat(runtime.enemies).find(u => u.uid === uid) || null;
  }
  function rowsWithAlive(units) {
    const out = { front:[], mid:[], back:[] };
    getAlive(units).forEach(u => { (out[u.row] || out.mid).push(u); });
    return out;
  }
  function getAccessibleRows(attacker, skill, foes) {
    const aliveRows = rowsWithAlive(foes);
    const anyAlive = ['front','mid','back'].filter(r => aliveRows[r].length > 0);
    if (!anyAlive.length) return [];
    if (skill && (skill.target === 'allEnemies' || skill.category === 'aoeAttack' || skill.category === 'aoeCC')) return anyAlive;
    const t = ((attacker.position || '') + ' ' + (attacker.job || '')).toLowerCase();
    const ranged = t.includes('원거리') || t.includes('궁수') || t.includes('투척') || t.includes('마법') || t.includes('법사') || t.includes('정령') || t.includes('클레릭') || t.includes('힐러') || t.includes('서포터') || (skill && skill.damageType === 'magic');
    if (ranged) return anyAlive;
    if (aliveRows.front.length) return ['front'];
    if (aliveRows.mid.length) return ['mid'];
    return ['back'];
  }
  function choosePriorityTarget(attacker, foes, skill) {
    const alive = getAlive(foes);
    if (!alive.length) return null;
    const allowedRows = getAccessibleRows(attacker, skill, foes);
    const filtered = alive.filter(u => allowedRows.includes(u.row));
    const list = filtered.length ? filtered : alive;
    if (attacker.side === 'party') {
      const boss = list.find(u => String(u.kind || '').toLowerCase() === 'boss');
      if (boss) return boss;
      const elite = list.find(u => String(u.kind || '').toLowerCase() === 'elite');
      if (elite) return elite;
      return list.sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp))[0];
    }
    const healer = list.find(u => (u.position || '').includes('힐러'));
    if (healer) return healer;
    const support = list.find(u => (u.position || '').includes('서포터'));
    if (support) return support;
    return list.sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp))[0];
  }
  function chooseWeightedTarget(attacker, foes, skill, explicitUid) {
    const alive = getAlive(foes);
    if (!alive.length) return null;
    // 강제 도발: 도발 버프가 있으면 도발 시전자를 우선 공격
    const tauntBuff = (attacker.buffs || []).find(b => b && b.forcedTaunt && b.turns > 0);
    if (tauntBuff) {
      const taunter = alive.find(u => u.uid === tauntBuff.source);
      if (taunter && !taunter.dead) return taunter;
    }
    const allowedRows = getAccessibleRows(attacker, skill, foes);
    if (explicitUid) {
      const explicit = alive.find(u => u.uid === explicitUid);
      if (explicit && allowedRows.includes(explicit.row)) return explicit;
    }
    const buckets = rowsWithAlive(foes);
    const rowBase = { front:70, mid:20, back:10 };
    const rowChoices = allowedRows.map(row => ({ value:row, weight:(buckets[row] || []).length ? rowBase[row] : 0 }));
    const pickedRow = weightedPick(rowChoices);
    const rowUnits = (buckets[pickedRow] || []);
    if (!rowUnits.length) return choosePriorityTarget(attacker, foes, skill);
    const unitChoices = rowUnits.map(u => ({ value:u, weight:Math.max(1, Number(u.threatBase || 1) + Number(u.threatBonus || 0)) }));
    return weightedPick(unitChoices) || choosePriorityTarget(attacker, foes, skill);
  }
  function chooseHealTarget(allies) {
    const injured = getAlive(allies).filter(u => u.hp < u.maxHp);
    if (!injured.length) return null;
    return injured.sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp))[0];
  }
  function hasBuff(unit, skillId) {
    return (unit.buffs || []).some(b => b && b.sourceSkill === skillId && b.turns > 0);
  }
  function hasSummonBuff(unit, summonName) {
    return (unit.buffs || []).some(b => b && b.summon === summonName && b.turns > 0);
  }

  function addRoundHighlight(summary, text) {
    if (!text) return;
    if (!summary.highlights.includes(text) && summary.highlights.length < 8) summary.highlights.push(text);
  }
  function applyDamage(target, dmg) {
    let remaining = dmg;
    // 보호막 우선 흡수
    if (Number(target.shieldHp || 0) > 0) {
      const absorbed = Math.min(target.shieldHp, remaining);
      target.shieldHp -= absorbed;
      remaining -= absorbed;
    }
    if (remaining > 0) {
      target.hp = Math.max(0, target.hp - remaining);
    }
    if (target.hp <= 0) target.dead = true;
  }
  function applyHeal(target, heal) {
    // Bleed reduces healing received by 50%
    let effectiveHeal = heal;
    if (Number(target.statuses.bleedHealReduction || 0) > 0) {
      effectiveHeal = Math.max(1, Math.round(heal * 0.5));
    }
    const before = target.hp;
    target.hp = Math.min(target.maxHp, target.hp + effectiveHeal);
    return target.hp - before;
  }
  function applyBuff(targets, skill, sourceUnit) {
    const turns = Number(skill.duration || 0);
    if (turns <= 0 || !skill.buff) return [];
    const changed = [];
    targets.forEach(target => {
      // 도발 면역 체크: tauntResistTimer > 0이면 강제 도발 무효
      if (skill.buff.forcedTaunt && Number(target.statuses && target.statuses.tauntResistTimer || 0) > 0) {
        return; // 면역 — 스킵
      }
      target.buffs = target.buffs || [];
      const buffEntry = {
        sourceSkill:skill.id, name:skill.name, turns,
        stats:Object.assign({}, skill.buff.stats || {}),
        threatBonus:Number(skill.buff.threatBonus || 0),
        damageTakenMul:Number(skill.buff.damageTakenMul || 1),
        source:sourceUnit.uid
      };
      // 특수 버프 속성 복사
      if (skill.buff.ccImmunity) buffEntry.ccImmunity = true;
      if (skill.buff.forcedTaunt) buffEntry.forcedTaunt = true;
      if (skill.buff.evasionNext) buffEntry.evasionNext = Number(skill.buff.evasionNext);
      if (skill.buff.summon) buffEntry.summon = skill.buff.summon;
      if (skill.buff.immobile) buffEntry.immobile = true;
      if (skill.buff.parryStance) { buffEntry.parryStance = true; buffEntry.parryCoef = Number(skill.buff.parryCoef || 1); }
      if (skill.buff.onContactStun) buffEntry.onContactStun = Object.assign({}, skill.buff.onContactStun);
      target.buffs.push(buffEntry);
      if (skill.buff.threatBonus) target.threatBonus += Number(skill.buff.threatBonus || 0);
      changed.push(target.name);
    });
    return changed;
  }
  function removeExpiredBuffEffects(unit, expired) {
    expired.forEach(buff => {
      if (buff.threatBonus) unit.threatBonus = Math.max(0, unit.threatBonus - Number(buff.threatBonus || 0));
      // 도발 해제 시 3턴 면역 부여
      if (buff.forcedTaunt) {
        unit.statuses = unit.statuses || {};
        unit.statuses.tauntResistTimer = 3;
      }
    });
  }
  function applyCc(targets, skill, summary, sourceName, runtime) {
    if (!skill.cc) return;
    targets.forEach(target => {
      if (target.dead) return;
      // CC 면역 버프 확인
      if ((target.buffs || []).some(b => b && b.ccImmunity && b.turns > 0)) {
        addRoundHighlight(summary, `${target.name}은(는) CC 면역 상태`);
        pushBattleLog(runtime, `${target.name}은(는) CC 면역 상태`);
        return;
      }
      const type = normStatus(skill.cc.type);
      if (!type) return;
      // CC 확률 판정
      let ccChance = skill.cc.chance != null ? Number(skill.cc.chance) : 1.0;
      // 소환수 보너스: 바크 소환 시 뿌리속박 CC +10%
      if (skill.id === 'rootBind') {
        const caster = runtime ? (runtime.party.concat(runtime.enemies)).find(u => u.name === sourceName) : null;
        if (caster && hasSummonBuff(caster, 'bark')) ccChance = Math.min(1.0, ccChance + 0.10);
      }
      if (ccChance < 1.0 && Math.random() > ccChance) return;
      if (unitHasImmunity(target, type)) {
        addRoundHighlight(summary, `${target.name}은(는) ${type} 면역`);
        pushBattleLog(runtime, `${target.name}은(는) ${type} 면역`);
        return;
      }
      if (type === 'stun') {
        // Stun resistance: immune for 5 turns after being stunned
        if (Number(target.statuses.stunResistTimer || 0) > 0) {
          addRoundHighlight(summary, `${target.name} 기절 저항 (면역 상태)`);
          pushBattleLog(runtime, `${target.name} 기절 저항 활성 중`);
          return;
        }
        let turns = Number(skill.cc.turns || 1);
        const kind = String(target.kind || '').toLowerCase();
        if (kind === 'boss') turns = Math.min(turns, 1);
        else if (kind === 'elite') turns = Math.min(turns, 2);
        target.statuses.stun = Math.max(Number(target.statuses.stun || 0), turns);
        target.statuses.stunResistTimer = 5; // 5-turn immunity after stun
        addRoundHighlight(summary, `${sourceName}의 ${skill.name} → ${target.name} 기절`);
        pushBattleLog(runtime, `${sourceName} 사용: ${skill.name} → ${target.name} 기절`);
      } else if (type === 'sleep') {
        // Sleep resistance: immune for 5 turns after being slept
        if (Number(target.statuses.sleepResistTimer || 0) > 0) {
          addRoundHighlight(summary, `${target.name} 수면 저항 (면역 상태)`);
          pushBattleLog(runtime, `${target.name} 수면 저항 활성 중`);
          return;
        }
        let turns = Number(skill.cc.turns || 2);
        const kind = String(target.kind || '').toLowerCase();
        if (kind === 'boss' || kind === 'elite') turns = Math.min(turns, 2);
        target.statuses.sleep = Math.max(Number(target.statuses.sleep || 0), turns);
        target.statuses.sleepResistTimer = 5; // 5-turn immunity after sleep
        addRoundHighlight(summary, `${sourceName}의 ${skill.name} → ${target.name} 수면`);
        pushBattleLog(runtime, `${sourceName} 사용: ${skill.name} → ${target.name} 수면`);
      } else if (type === 'silence') {
        let turns = Number(skill.cc.turns || 3);
        const kind = String(target.kind || '').toLowerCase();
        if (kind === 'boss') turns = Math.min(turns, 1);
        else if (kind === 'elite') turns = Math.min(turns, 2);
        target.statuses.silence = Math.max(Number(target.statuses.silence || 0), turns);
        addRoundHighlight(summary, `${sourceName}의 ${skill.name} → ${target.name} 침묵`);
        pushBattleLog(runtime, `${sourceName} 사용: ${skill.name} → ${target.name} 침묵`);
      } else {
        target.statuses[type] = Math.max(Number(target.statuses[type] || 0), Number(skill.cc.turns || 1));
        addRoundHighlight(summary, `${sourceName}의 ${skill.name} → ${target.name} ${type}`);
        pushBattleLog(runtime, `${sourceName} 사용: ${skill.name} → ${target.name} ${type}`);
      }
    });
  }
  function applyStatus(target, skill, summary, sourceName, forcedStatus, runtime, sourceUnit, damageDealt) {
    const srcStatus = forcedStatus ? { type: forcedStatus } : (skill && skill.status);
    if (!srcStatus || !srcStatus.type || target.dead) return false;
    const type = normStatus(srcStatus.type);
    if (!type) return false;
    // CC 면역 버프 확인
    if ((target.buffs || []).some(b => b && b.ccImmunity && b.turns > 0)) {
      addRoundHighlight(summary, `${target.name}은(는) CC 면역 상태`);
      pushBattleLog(runtime, `${target.name}은(는) CC 면역 상태`);
      return false;
    }
    if (unitHasImmunity(target, type)) {
      addRoundHighlight(summary, `${target.name}은(는) ${type} 면역`);
      pushBattleLog(runtime, `${target.name}은(는) ${type} 면역`);
      return false;
    }
    const profile = getStatusDefaultProfile(type);
    const chance = srcStatus.chance == null ? profile.chance : Number(srcStatus.chance);
    if (Math.random() > chance) return false;
    const turns = Number(srcStatus.turns || profile.turns);

    if (type === 'stun') {
      if (Number(target.statuses.stunResistTimer || 0) > 0) return false;
      let t = turns;
      const kind = String(target.kind || '').toLowerCase();
      if (kind === 'boss') t = Math.min(t, 1);
      else if (kind === 'elite') t = Math.min(t, 2);
      target.statuses.stun = Math.max(Number(target.statuses.stun || 0), t);
      target.statuses.stunResistTimer = 5;
    } else if (type === 'sleep') {
      if (Number(target.statuses.sleepResistTimer || 0) > 0) return false;
      let t = turns;
      const kind = String(target.kind || '').toLowerCase();
      if (kind === 'boss' || kind === 'elite') t = Math.min(t, 2);
      target.statuses.sleep = Math.max(Number(target.statuses.sleep || 0), t);
      target.statuses.sleepResistTimer = 5;
    } else if (type === 'bind') {
      target.statuses.bind = Math.max(Number(target.statuses.bind || 0), turns);
    } else if (type === 'curse') {
      target.statuses.curse = Math.max(Number(target.statuses.curse || 0), turns);
    } else if (type === 'poison') {
      // Stack-based: max 3 stacks, 3 turns
      const curStacks = Number(target.statuses.poisonStacks || 0);
      if (curStacks < 3) {
        target.statuses.poisonStacks = curStacks + 1;
      }
      target.statuses.poison = 3; // always reset to 3 turns
      // Calculate poison power per stack from source
      if (sourceUnit) {
        if (sourceUnit.isMonster) {
          // Monster poison: monsterDamage * 40%
          target.statuses.poisonPower = Number(sourceUnit.monsterBaseDamage || 0) * 0.4;
        } else {
          // Hunter poison: (2*MainStat + 3*ATK) * skillCoef * 0.2
          const mainStat = getStatPower(sourceUnit, skill);
          const coef = Number(skill && skill.coef != null ? skill.coef : 1.0);
          target.statuses.poisonPower = (2 * mainStat + 3 * Number(sourceUnit.atk || 0)) * coef * 0.2;
        }
      }
    } else if (type === 'bleed') {
      // Bleed: 출혈 발동 시 해당 공격 데미지의 30% 추가피해(1회) + 3턴 회복 -50%
      target.statuses.bleed = Math.max(Number(target.statuses.bleed || 0), 3);
      target.statuses.bleedHealReduction = 3; // 3 turns of 50% healing reduction
      // 출혈 발동 시 즉시 30% 추가피해 (1회성)
      if (damageDealt && damageDealt > 0 && !target.dead) {
        const bleedExtra = Math.max(1, Math.round(damageDealt * 0.3));
        applyDamage(target, bleedExtra);
        addRoundHighlight(summary, `${target.name} 출혈 추가피해 ${bleedExtra}`);
        pushBattleLog(runtime, `${target.name} 출혈 추가피해 ${bleedExtra}`);
      }
    } else if (type === 'burn') {
      // Stack-based: max 5 stacks, 5 turns
      const curStacks = Number(target.statuses.burnStacks || 0);
      if (curStacks < 5) {
        target.statuses.burnStacks = curStacks + 1;
      }
      target.statuses.burn = 5; // always reset to 5 turns
      // Calculate burn power per stack from source
      if (sourceUnit) {
        if (sourceUnit.isMonster) {
          // Monster burn: monsterDamage * 20%
          target.statuses.burnPower = Number(sourceUnit.monsterBaseDamage || 0) * 0.2;
        } else {
          // Hunter burn: (2*MainStat + 3*ATK) * skillCoef * 0.12
          const mainStat = getStatPower(sourceUnit, skill);
          const coef = Number(skill && skill.coef != null ? skill.coef : 1.0);
          target.statuses.burnPower = (2 * mainStat + 3 * Number(sourceUnit.atk || 0)) * coef * 0.12;
        }
      }
    } else if (type === 'silence') {
      // 침묵: 스킬 사용 불가
      let t = turns;
      const kind = String(target.kind || '').toLowerCase();
      if (kind === 'boss') t = Math.min(t, 1);
      else if (kind === 'elite') t = Math.min(t, 2);
      target.statuses.silence = Math.max(Number(target.statuses.silence || 0), t);
    } else if (type === 'slow') {
      // 둔화: 명중률 -30%, 회피율 -50%
      let t = turns;
      const kind = String(target.kind || '').toLowerCase();
      if (kind === 'boss') t = Math.min(t, 2);
      else if (kind === 'elite') t = Math.min(t, 3);
      target.statuses.slow = Math.max(Number(target.statuses.slow || 0), t);
    }
    addRoundHighlight(summary, `${sourceName}의 ${skill?.name || '공격'} → ${target.name} ${type}`);
    pushBattleLog(runtime, `${sourceName} 사용: ${skill?.name || '공격'} → ${target.name} ${type}`);
    return true;
  }

  // 열 전진 함수: 앞 열이 전멸하면 생존 유닛을 앞으로 끌어온다
  function shiftRowsForward(units, runtime, summary) {
    const alive = units.filter(u => !u.dead);
    if (!alive.length) return;
    const ROW_ORDER = ['front', 'mid', 'back'];
    const hasAlive = r => alive.some(u => u.row === r);
    // 전열 전멸 → 중열을 전열로, 후열을 중열로
    if (!hasAlive('front') && (hasAlive('mid') || hasAlive('back'))) {
      alive.forEach(u => {
        if (u.row === 'mid') { u.row = 'front'; pushBattleLog(runtime, `${u.name} 전열로 전진`); }
      });
      alive.forEach(u => {
        if (u.row === 'back' && !hasAlive('mid')) { u.row = 'mid'; pushBattleLog(runtime, `${u.name} 중열로 전진`); }
      });
      // 중열도 비었으면 후열→전열
      if (!hasAlive('front')) {
        alive.forEach(u => {
          if (u.row === 'mid') { u.row = 'front'; pushBattleLog(runtime, `${u.name} 전열로 전진`); }
        });
      }
    }
    // 중열 전멸 (전열은 있으나 중열 없음) → 후열을 중열로
    if (hasAlive('front') && !hasAlive('mid') && hasAlive('back')) {
      alive.forEach(u => {
        if (u.row === 'back') { u.row = 'mid'; pushBattleLog(runtime, `${u.name} 중열로 전진`); }
      });
    }
  }

  // 열 기반 폴백: 대상 열이 비면 가장 앞 열의 생존자를 반환
  function getRowFallback(alive) {
    const ROW_ORDER = ['front', 'mid', 'back'];
    for (const r of ROW_ORDER) {
      const inRow = alive.filter(u => u.row === r);
      if (inRow.length) return inRow;
    }
    return alive; // 최종 폴백
  }

  function getTargetListForAction(runtime, actor, action, skill) {
    const allies = actor.side === 'party' ? runtime.party : runtime.enemies;
    const foes = actor.side === 'party' ? runtime.enemies : runtime.party;
    if (!skill) return [];
    if (skill.target === 'allEnemies') return getAlive(foes);
    if (skill.target === 'allAllies') return getAlive(allies);
    if (skill.target === 'self') return [actor];
    if (skill.target === 'singleAlly') return [findUnitByUid(runtime, action.target) || chooseHealTarget(allies) || actor].filter(Boolean);
    if (skill.target === 'singleEnemy') return [chooseWeightedTarget(actor, foes, skill, action.target)].filter(Boolean);
    // 열 기반 광역 타겟 (row-based AoE) — 대상 열이 비면 가장 앞 열 폴백
    if (skill.target === 'rowFront') { const t = getAlive(foes).filter(u => u.row === 'front'); return t.length ? t : getRowFallback(getAlive(foes)); }
    if (skill.target === 'rowMid') { const t = getAlive(foes).filter(u => u.row === 'mid'); return t.length ? t : getRowFallback(getAlive(foes)); }
    if (skill.target === 'rowBack') { const t = getAlive(foes).filter(u => u.row === 'back'); return t.length ? t : getRowFallback(getAlive(foes)); }
    // 2열 공격 타겟 (dual-row) — 비면 가장 앞 열 폴백
    if (skill.target === 'rowFrontMid') { const t = getAlive(foes).filter(u => u.row === 'front' || u.row === 'mid'); return t.length ? t : getRowFallback(getAlive(foes)); }
    if (skill.target === 'rowMidBack') { const t = getAlive(foes).filter(u => u.row === 'mid' || u.row === 'back'); return t.length ? t : getRowFallback(getAlive(foes)); }
    return [];
  }

  function resolvePartyAction(runtime, actor, allies, foes) {
    const cmd = (runtime.pendingActions && runtime.pendingActions[actor.uid]) || null;
    if (!cmd || cmd.mode === 'auto') return chooseEnemyAction(actor, allies, foes, true);
    if (cmd.mode === 'basic') return { type:'basic', target:cmd.target || null };
    if (cmd.mode === 'skill') return { type:'skill', skillId:cmd.skillId || '', target:cmd.target || null };
    if (cmd.mode === 'defend') return { type:'defend' };
    if (cmd.mode === 'wait') return { type:'wait' };
    return chooseEnemyAction(actor, allies, foes, true);
  }

  function chooseEnemyAction(unit, allies, foes, isPartyAuto) {
    const aliveAllies = getAlive(allies);
    const aliveFoes = getAlive(foes);
    const skillPool = listKnownSkillDefs(unit).filter(sk => sk.category !== 'passive' && canUseSkill(unit, sk));
    const lowAlly = chooseHealTarget(allies);
    const injuredCount = aliveAllies.filter(u => u.hp < u.maxHp).length;
    const enemyBoss = aliveFoes.find(u => String(u.kind || '').toLowerCase() === 'boss');
    const enemyElite = aliveFoes.find(u => String(u.kind || '').toLowerCase() === 'elite');
    const pos = unit.position || '';

    if ((pos.includes('힐러') || pos.includes('서포터') || unit.job.includes('클레릭')) && lowAlly) {
      const aoeHeal = skillPool.find(sk => sk.category === 'aoeHeal');
      if (aoeHeal && injuredCount >= 3) return { type:'skill', skillId:aoeHeal.id, target:'allAllies' };
      const bestHeal = skillPool.filter(sk => sk.category === 'singleHeal').sort((a,b)=>(b.coef||0)-(a.coef||0))[0];
      if (bestHeal && lowAlly.hp / lowAlly.maxHp <= 0.75) return { type:'skill', skillId:bestHeal.id, target:lowAlly.uid };
    }
    const tauntSkill = skillPool.find(sk => sk.id === 'taunt');
    if (tauntSkill && (pos.includes('탱커') || unit.job.includes('크루세이더')) && !hasBuff(unit, 'taunt') && Math.random() < 0.65) return { type:'skill', skillId:'taunt', target:unit.uid };

    // CC 면역 버프 (방어선 유지)
    const ccImmunitySkill = skillPool.find(sk => sk.buff && sk.buff.ccImmunity && !hasBuff(unit, sk.id));
    if (ccImmunitySkill && pos.includes('탱커') && unit.hp / unit.maxHp <= 0.7) {
      return { type:'skill', skillId:ccImmunitySkill.id, target:unit.uid };
    }
    // 강제 도발 (신성한 도발)
    const tauntEnemy = skillPool.find(sk => sk.buff && sk.buff.forcedTaunt);
    if (tauntEnemy && (enemyBoss || enemyElite)) {
      const target = enemyBoss || enemyElite;
      if (!target.dead) return { type:'skill', skillId:tauntEnemy.id, target:target.uid };
    }
    // 소환 스킬 (제피르, 바크) - 아직 소환 안 된 경우 우선
    const summonSkill = skillPool.find(sk => sk.buff && sk.buff.summon && !hasSummonBuff(unit, sk.buff.summon));
    if (summonSkill && Math.random() < 0.7) {
      return { type:'skill', skillId:summonSkill.id, target:summonSkill.target === 'allAllies' ? 'allAllies' : unit.uid };
    }

    const buffSkill = skillPool.find(sk => sk.category === 'buff' && sk.id !== 'taunt' && !hasBuff(unit, sk.id) && !(sk.buff && sk.buff.forcedTaunt) && !(sk.buff && sk.buff.summon));
    if (buffSkill && (pos.includes('서포터') || pos.includes('원거리') || pos.includes('힐러') || Math.random() < 0.2)) {
      return { type:'skill', skillId:buffSkill.id, target:buffSkill.target === 'allAllies' ? 'allAllies' : unit.uid };
    }
    const singleCC = skillPool.find(sk => sk.category === 'singleCC');
    if (singleCC && (enemyBoss || enemyElite)) {
      const target = enemyBoss || enemyElite;
      if (!target.dead && Number(target.statuses.stun || 0) <= 0) return { type:'skill', skillId:singleCC.id, target:target.uid };
    }
    const aoeCC = skillPool.find(sk => sk.category === 'aoeCC');
    if (aoeCC && aliveFoes.length >= 4 && Math.random() < 0.5) return { type:'skill', skillId:aoeCC.id, target:'allEnemies' };
    const aoeAtk = skillPool.filter(sk => sk.category === 'aoeAttack').sort((a,b)=>(b.coef||0)-(a.coef||0))[0];
    if (aoeAtk && aliveFoes.length >= 3 && !pos.includes('힐러')) return { type:'skill', skillId:aoeAtk.id, target:'allEnemies' };
    // 유틸리티: 자원 회복 또는 자기 버프 유틸리티
    const utilityRestore = skillPool.find(sk => sk.category === 'utility' && sk.resourceRestore);
    if (utilityRestore && unit.sp <= unit.maxSp * 0.3) return { type:'skill', skillId:utilityRestore.id, target:utilityRestore.target === 'self' ? unit.uid : (choosePriorityTarget(unit, foes, utilityRestore) || {}).uid };
    const utilityBuff = skillPool.find(sk => sk.category === 'utility' && sk.buff && !hasBuff(unit, sk.id));
    if (utilityBuff && unit.hp / unit.maxHp <= 0.5 && Math.random() < 0.6) return { type:'skill', skillId:utilityBuff.id, target:unit.uid };
    const singleAtk = skillPool.filter(sk => sk.category === 'singleAttack').sort((a,b)=>(b.coef||0)-(a.coef||0))[0];
    if (singleAtk) return { type:'skill', skillId:singleAtk.id, target:(choosePriorityTarget(unit, foes, singleAtk) || {}).uid };
    return { type:'basic', target:(choosePriorityTarget(unit, foes, null) || {}).uid };
  }

  function resolveSkillOrBasic(runtime, actor, action, summary) {
    if (!actor || actor.dead) return;
    const allies = actor.side === 'party' ? runtime.party : runtime.enemies;
    const foes = actor.side === 'party' ? runtime.enemies : runtime.party;
    if (!getAlive(allies).length || !getAlive(foes).length) return;

    if (action.type === 'wait') {
      actor.lastAction = '대기';
      addRoundHighlight(summary, `${actor.name} 대기`);
      pushBattleLog(runtime, `${actor.name} 대기`);
      return;
    }

    if (action.type === 'defend') {
      actor.buffs = actor.buffs || [];
      actor.buffs.push({ sourceSkill:'defend', name:'방어', turns:1, stats:{}, threatBonus:1, damageTakenMul:0.65, source:actor.uid });
      actor.threatBonus += 1;
      actor.lastAction = '방어';
      addRoundHighlight(summary, `${actor.name} 방어 태세`);
      pushBattleLog(runtime, `${actor.name} 방어 태세`);
      return;
    }

    if (action.type === 'basic') {
      const skill = { id:'basicAttack', name:'기본 공격', category:'singleAttack', target:'singleEnemy', coef:1.0, statTypes:[actor.attackStat || 'str'], damageType:actor.damageType || 'physical', element:'none', costs:{ mp:0, sp:0 } };
      const target = chooseWeightedTarget(actor, foes, skill, action.target);
      if (!target) return;
      const hit = performHit(actor, target, skill);
      if (!hit.hit) {
        actor.lastAction = `기본 공격 → ${target.name} 빗나감`;
        addRoundHighlight(summary, `${actor.name}의 공격이 빗나갔다`);
        pushBattleLog(runtime, `${actor.name}의 기본 공격이 ${target.name}에게 빗나감`);
        return;
      }
      const dmg = computeDamage(actor, target, skill, hit.crit);
      const hpBefore = Number(target.hp || 0);
      applyDamage(target, dmg);
      if (Number(target.statuses.sleep || 0) > 0) target.statuses.sleep = 0;
      if (actor.onHitStatus) applyStatus(target, { name:'기본 공격', status:{ type:actor.onHitStatus, chance:actor.onHitChance, turns:actor.onHitTurns } }, summary, actor.name, null, runtime, actor, dmg);
      actor.lastAction = `기본 공격 → ${target.name} ${dmg}`;
      if (actor.side === 'party') summary.partyDamage += dmg; else summary.enemyDamage += dmg;
      if (target.dead) {
        if (actor.side === 'party') { summary.partyKills += 1; recordKillExp(runtime, target); } else summary.enemyKills += 1;
        addRoundHighlight(summary, `${actor.name}이(가) ${target.name} 처치`);
      }
      if (hit.crit) addRoundHighlight(summary, `${actor.name} 치명타`);
      pushDamageEventLog(runtime, actor, target, '기본 공격', dmg, hit.crit, target.dead);
      pushHpShiftLog(runtime, target, hpBefore);
      return;
    }

    const skill = resolveSkillForUnit(actor, action.skillId);
    if (!skill || !canUseSkill(actor, skill)) return resolveSkillOrBasic(runtime, actor, { type:'basic', target:action.target || null }, summary);
    const cost = paySkillCost(actor, skill);
    actor.lastAction = skill.name;

    if (skill.category === 'buff') {
      const targets = getTargetListForAction(runtime, actor, action, skill);
      const names = applyBuff(targets, skill, actor);
      addRoundHighlight(summary, `${actor.name}의 ${skill.name}${names.length ? ' (' + names.join(', ') + ')' : ''}`);
      pushBattleLog(runtime, `${actor.name} 사용: ${skill.name}${names.length ? ' → ' + names.join(', ') : ''}`);
      actor.lastAction = `${skill.name} (MP-${cost.mp} / SP-${cost.sp})`;
      return;
    }

    if (skill.category === 'singleHeal') {
      const targets = getTargetListForAction(runtime, actor, action, skill);
      const target = targets[0];
      if (!target) return;
      const heal = computeHeal(actor, skill);
      const hpBefore = Number(target.hp || 0);
      const actual = applyHeal(target, heal);
      // 신의 보호: 만HP 시 보호막 전환 (최대 HP 20%)
      if (skill.id === 'divineProtection' && target.hp >= target.maxHp) {
        const shieldMax = Math.round(target.maxHp * 0.20);
        const overflow = Math.min(heal - actual, shieldMax);
        if (overflow > 0) {
          target.shieldHp = Math.min(shieldMax, (target.shieldHp || 0) + overflow);
          addRoundHighlight(summary, `${target.name} 보호막 +${overflow}`);
          pushBattleLog(runtime, `${actor.name}의 ${skill.name} → ${target.name} 보호막 ${target.shieldHp}`);
        }
      }
      if (actor.side === 'party') summary.partyHealing += actual; else summary.enemyHealing += actual;
      addRoundHighlight(summary, `${actor.name}의 ${skill.name} → ${target.name} 회복 ${actual}`);
      pushHealEventLog(runtime, actor, target, skill.name, actual, hpBefore);
      actor.lastAction = `${skill.name} (MP-${cost.mp} / SP-${cost.sp})`;
      return;
    }

    if (skill.category === 'aoeHeal') {
      const targets = getTargetListForAction(runtime, actor, action, skill).filter(u => u.hp < u.maxHp);
      if (!targets.length) return;
      const healPerTarget = computeHeal(actor, skill);
      let actualSum = 0;
      targets.forEach(t => { const before = Number(t.hp || 0); const actual = applyHeal(t, healPerTarget); actualSum += actual; pushHealEventLog(runtime, actor, t, skill.name, actual, before); });
      if (actor.side === 'party') summary.partyHealing += actualSum; else summary.enemyHealing += actualSum;
      addRoundHighlight(summary, `${actor.name}의 ${skill.name} → ${targets.length}명 총 회복 ${actualSum}`);
      pushBattleLog(runtime, `${actor.name}의 ${skill.name} 총 회복 ${actualSum} (${targets.length}명)`);
      actor.lastAction = `${skill.name} (MP-${cost.mp} / SP-${cost.sp})`;
      return;
    }

    if (skill.category === 'utility') {
      const targets = getTargetListForAction(runtime, actor, action, skill);
      const procOk = skill.procChance == null || Math.random() < skill.procChance;
      if (procOk && skill.coef && targets[0] && skill.target !== 'self') {
        const target = targets[0];
        const hit = performHit(actor, target, skill);
        if (hit.hit) {
          const dmg = computeDamage(actor, target, skill, hit.crit);
          const hpBefore = Number(target.hp || 0);
          applyDamage(target, dmg);
          if (Number(target.statuses.sleep || 0) > 0) target.statuses.sleep = 0;
          if (actor.onHitStatus) applyStatus(target, { name:skill.name, status:{ type:actor.onHitStatus, chance:actor.onHitChance, turns:actor.onHitTurns } }, summary, actor.name, null, runtime, actor, dmg);
          if (actor.side === 'party') summary.partyDamage += dmg; else summary.enemyDamage += dmg;
          if (target.dead) {
            if (actor.side === 'party') { summary.partyKills += 1; recordKillExp(runtime, target); } else summary.enemyKills += 1;
            addRoundHighlight(summary, `${actor.name}이(가) ${target.name} 처치`);
          }
          pushDamageEventLog(runtime, actor, target, skill.name, dmg, hit.crit, target.dead);
          pushHpShiftLog(runtime, target, hpBefore);
        }
      }
      if (skill.resourceRestore) {
        actor.mp = Math.min(actor.maxMp, actor.mp + Number(skill.resourceRestore.mp || 0));
        actor.sp = Math.min(actor.maxSp, actor.sp + Number(skill.resourceRestore.sp || 0));
      }
      // 유틸리티 스킬의 버프 속성 적용 (긴급회피, 받아치기 등)
      if (skill.buff && skill.duration) {
        applyBuff([actor], skill, actor);
      } else if (skill.buff && !skill.duration) {
        // duration 없는 버프: 1턴 임시 적용
        const tempSkill = Object.assign({}, skill, { duration:1 });
        applyBuff([actor], tempSkill, actor);
      }
      // 지형 전환: 전장 환경 변경 (식물 +15%, 화염 -10%)
      if (skill.id === 'terrainShift') {
        runtime.terrain = { type:'forest', turnsLeft:3 };
        addRoundHighlight(summary, `${actor.name} 지형 전환: 숲/초원 (식물 +15%, 화염 -10%)`);
        pushBattleLog(runtime, `${actor.name} 지형 전환 발동 — 3턴간 식물 +15%, 화염 -10%`);
      }
      addRoundHighlight(summary, `${actor.name}의 ${skill.name}`);
      pushBattleLog(runtime, `${actor.name} 사용: ${skill.name}`);
      actor.lastAction = `${skill.name} (MP-${cost.mp} / SP-${cost.sp})`;
      return;
    }

    const targets = getTargetListForAction(runtime, actor, action, skill);
    let hitCount = 0, totalDamage = 0;
    const killedNames = [];
    const ccTargets = [];
    targets.forEach(target => {
      const hit = performHit(actor, target, skill);
      if (!hit.hit) {
        // 받아치기: 회피 성공 시 반격
        const parryBuff = (target.buffs || []).find(b => b && b.parryStance && b.turns > 0);
        if (parryBuff && !actor.dead) {
          parryBuff.turns = 0; // 1회 소모
          const parrySkill = { id:'parryCounter', name:'받아치기 반격', coef:Number(parryBuff.parryCoef || 1), statTypes:[target.attackStat || 'agi'], damageType:target.damageType || 'physical', element:'none' };
          const parryDmg = computeDamage(target, actor, parrySkill, false);
          applyDamage(actor, parryDmg);
          totalDamage -= parryDmg; // 반격 피해는 별도 기록
          addRoundHighlight(summary, `${target.name} 받아치기 반격 → ${actor.name} ${parryDmg}`);
          pushBattleLog(runtime, `${target.name} 받아치기 반격 → ${actor.name} ${parryDmg}`);
        }
        return;
      }
      hitCount += 1;
      const dmg = computeDamage(actor, target, skill, hit.crit);
      totalDamage += dmg;
      const hpBefore = Number(target.hp || 0);
      applyDamage(target, dmg);
      if (Number(target.statuses.sleep || 0) > 0) target.statuses.sleep = 0;
      if (skill.cc) ccTargets.push(target);
      applyStatus(target, skill, summary, actor.name, null, runtime, actor, dmg);
      if (actor.onHitStatus) applyStatus(target, { name:skill.name, status:{ type:actor.onHitStatus, chance:actor.onHitChance, turns:actor.onHitTurns } }, summary, actor.name, null, runtime, actor, dmg);
      // 접촉 기절: 근접 공격 시 대상의 벽력장 버프로 공격자 기절
      if (!actor.dead && (skill.damageType === 'physical' || !skill.damageType)) {
        const contactBuff = (target.buffs || []).find(b => b && b.onContactStun && b.turns > 0);
        if (contactBuff) {
          const stunChance = Number(contactBuff.onContactStun.chance || 0.25);
          const stunTurns = Number(contactBuff.onContactStun.turns || 1);
          if (Math.random() < stunChance && Number(actor.statuses.stun || 0) <= 0) {
            actor.statuses.stun = stunTurns;
            addRoundHighlight(summary, `${target.name} 벽력장 → ${actor.name} 접촉 기절`);
            pushBattleLog(runtime, `${target.name}의 벽력장으로 ${actor.name} 기절 ${stunTurns}턴`);
          }
        }
      }
      if (target.dead) { killedNames.push(target.name); if (actor.side === 'party') recordKillExp(runtime, target); }
      if (hit.crit) addRoundHighlight(summary, `${actor.name} 치명타`);
      // 흡혈 (피식자의 단검 등): 피해량의 일정% HP 회복
      let lifestealPct = Number((skill.passiveMods && skill.passiveMods.lifesteal) || 0);
      // 흡혈 본능: MP 10% 이하 시 다음 공격이 대상 HP 5% 흡수
      const vampiricDrain = Number((actor.passiveMods && actor.passiveMods.vampiricDrain) || 0);
      if (vampiricDrain > 0 && actor.mp <= actor.maxMp * 0.1) {
        lifestealPct = Math.max(lifestealPct, vampiricDrain);
      }
      if (lifestealPct > 0 && dmg > 0 && !actor.dead) {
        const stolen = Math.max(1, Math.round(dmg * lifestealPct));
        applyHeal(actor, stolen);
        // 흡혈 본능 발동 시 INT -3 3턴 디버프
        if (vampiricDrain > 0 && actor.mp <= actor.maxMp * 0.1) {
          actor.buffs = actor.buffs || [];
          actor.buffs.push({ sourceSkill:'vampiricInstinct', name:'흡혈 후유증', turns:3, stats:{ int:-3 }, threatBonus:0, damageTakenMul:1, source:actor.uid });
        }
      }
      pushDamageEventLog(runtime, actor, target, skill.name, dmg, hit.crit, target.dead);
      pushHpShiftLog(runtime, target, hpBefore);
    });
    if (actor.side === 'party') summary.partyDamage += totalDamage; else summary.enemyDamage += totalDamage;
    if (actor.side === 'party') summary.partyKills += killedNames.length; else summary.enemyKills += killedNames.length;
    if (!hitCount) {
      addRoundHighlight(summary, `${actor.name}의 ${skill.name} 빗나감`);
      actor.lastAction = `${skill.name} 빗나감`;
      pushBattleLog(runtime, `${actor.name}의 ${skill.name}이(가) 빗나감`);
      return;
    }
    applyCc(ccTargets, skill, summary, actor.name, runtime);
    // CC/공격 스킬에 버프 속성이 있으면 적용 (시간 감속 등: 적에게 CC + 아군에게 버프)
    if (skill.buff && skill.duration) {
      if (skill.buff.stats) {
        // 음수 스탯은 적에게, 양수 스탯은 아군에게 적용
        const hasNeg = Object.values(skill.buff.stats).some(v => v < 0);
        const hasPos = Object.values(skill.buff.stats).some(v => v > 0);
        if (hasNeg) {
          const debuffSkill = Object.assign({}, skill, { buff:{ stats:Object.fromEntries(Object.entries(skill.buff.stats).filter(([,v]) => v < 0)) } });
          applyBuff(getAlive(foes), debuffSkill, actor);
        }
        if (hasPos) {
          const buffOnlySkill = Object.assign({}, skill, { buff:{ stats:Object.fromEntries(Object.entries(skill.buff.stats).filter(([,v]) => v > 0)) } });
          applyBuff(getAlive(allies), buffOnlySkill, actor);
        }
        if (!hasNeg && !hasPos) {
          applyBuff(getAlive(foes), skill, actor);
        }
      } else {
        applyBuff(targets, skill, actor);
      }
    }
    if (killedNames.length) addRoundHighlight(summary, `${actor.name}의 ${skill.name} → ${killedNames.join(', ')} 처치`);
    else addRoundHighlight(summary, `${actor.name}의 ${skill.name} → 피해 ${totalDamage}`);
    pushBattleLog(runtime, `${actor.name}의 ${skill.name} 총 피해 ${totalDamage}${killedNames.length ? ' / 처치: ' + killedNames.join(', ') : ''}`);
    actor.lastAction = `${skill.name} (MP-${cost.mp} / SP-${cost.sp})`;
  }

  function endRoundMaintenance(runtime, units, summary) {
    units.forEach(unit => {
      if (unit.dead) return;
      const expired = [];
      unit.buffs = (unit.buffs || []).map(buff => Object.assign({}, buff, { turns:Number(buff.turns || 0) - 1 })).filter(buff => {
        const alive = buff.turns > 0;
        if (!alive) expired.push(buff);
        return alive;
      });
      removeExpiredBuffEffects(unit, expired);

      // 독: 방어무시 절대데미지, 스택당 poisonPower 피해
      if (Number(unit.statuses.poison || 0) > 0) {
        const stacks = Math.min(3, Number(unit.statuses.poisonStacks || 1));
        const perStack = Math.max(1, Math.round(Number(unit.statuses.poisonPower || 0)));
        const dmg = perStack * stacks;
        if (dmg > 0) {
          applyDamage(unit, dmg);
          addRoundHighlight(summary, `${unit.name} 독 피해 ${dmg} (${stacks}중첩)`);
          pushBattleLog(runtime, `${unit.name} 독 피해 ${dmg} (${stacks}중첩)`);
        }
      }
      // 출혈: 발동 시 1회 30% 추가피해 (applyStatus에서 처리됨, 턴종료 DoT 아님)
      // 화상: 방어무시 절대데미지, 스택당 burnPower 피해
      if (!unit.dead && Number(unit.statuses.burn || 0) > 0) {
        const stacks = Math.min(5, Number(unit.statuses.burnStacks || 1));
        const perStack = Math.max(1, Math.round(Number(unit.statuses.burnPower || 0)));
        const dmg = perStack * stacks;
        if (dmg > 0) {
          applyDamage(unit, dmg);
          addRoundHighlight(summary, `${unit.name} 화상 피해 ${dmg} (${stacks}중첩)`);
          pushBattleLog(runtime, `${unit.name} 화상 피해 ${dmg} (${stacks}중첩)`);
        }
      }
      if (!unit.dead && Number(unit.regenPct || 0) > 0) {
        const blocked = (unit.regenBlockedBy || []).some(key => Number(unit.statuses[key] || 0) > 0);
        if (!blocked) {
          const heal = Math.max(1, Math.round(unit.maxHp * Number(unit.regenPct || 0)));
          const actual = applyHeal(unit, heal);
          if (actual > 0) { addRoundHighlight(summary, `${unit.name} 재생 ${actual}`); pushBattleLog(runtime, `${unit.name} 재생 ${actual}`); }
        }
      }
      // 패시브: SP 자연회복 (스태미나 회복)
      if (!unit.dead && !unit.isMonster && unit.passiveMods && Number(unit.passiveMods.spRegenPct || 0) > 0) {
        const spRegen = Math.max(1, Math.round(unit.maxSp * unit.passiveMods.spRegenPct));
        unit.sp = Math.min(unit.maxSp, unit.sp + spRegen);
      }

      // 상태이상 턴 감소
      ['stun','bind','sleep','poison','bleed','burn','curse','silence','slow'].forEach(key => {
        unit.statuses[key] = Math.max(0, Number(unit.statuses[key] || 0) - 1);
      });
      // 독/화상: 턴이 0이 되면 스택 초기화
      if (Number(unit.statuses.poison || 0) <= 0) unit.statuses.poisonStacks = 0;
      if (Number(unit.statuses.burn || 0) <= 0) unit.statuses.burnStacks = 0;
      // 출혈 치유량 감소 타이머
      if (Number(unit.statuses.bleedHealReduction || 0) > 0) {
        unit.statuses.bleedHealReduction = Math.max(0, unit.statuses.bleedHealReduction - 1);
      }
      // 기절/수면/도발 저항 타이머 감소
      if (Number(unit.statuses.stunResistTimer || 0) > 0) {
        unit.statuses.stunResistTimer = Math.max(0, unit.statuses.stunResistTimer - 1);
      }
      if (Number(unit.statuses.sleepResistTimer || 0) > 0) {
        unit.statuses.sleepResistTimer = Math.max(0, unit.statuses.sleepResistTimer - 1);
      }
      if (Number(unit.statuses.tauntResistTimer || 0) > 0) {
        unit.statuses.tauntResistTimer = Math.max(0, unit.statuses.tauntResistTimer - 1);
      }
      Object.keys(unit.cooldowns || {}).forEach(key => {
        unit.cooldowns[key] = Math.max(0, Number(unit.cooldowns[key] || 0) - 1);
      });
      if (unit.dead) { addRoundHighlight(summary, `${unit.name} 쓰러짐`); pushBattleLog(runtime, `${unit.name} 쓰러짐`); if (unit.isMonster) recordKillExp(runtime, unit); }
    });
    // 열 전진: 앞 열이 전멸하면 생존자를 앞으로 끌어오기
    shiftRowsForward(runtime.enemies, runtime, summary);
    shiftRowsForward(runtime.party, runtime, summary);
    // 지형 전환 턴 감소
    if (runtime.terrain && runtime.terrain.turnsLeft > 0) {
      runtime.terrain.turnsLeft -= 1;
      if (runtime.terrain.turnsLeft <= 0) {
        pushBattleLog(runtime, '지형 전환 효과 종료');
        runtime.terrain = null;
      }
    }
  }

  function buildRoundQueue(runtime) {
    const alive = getAlive(runtime.party).concat(getAlive(runtime.enemies));
    return alive.map(unit => ({
      uid: unit.uid,
      init: (getBuffedStat(unit, 'agi') * 2) + getBuffedStat(unit, 'sense') + randInt(1, 10)
    })).sort((a,b)=>b.init-a.init).map(r=>r.uid);
  }
  function buildRoundSummaryText(summary, runtime) {
    const partyAlive = getAlive(runtime.party).length;
    const enemyAlive = getAlive(runtime.enemies).length;
    const head = `${summary.round}라운드 — 아군 피해 ${summary.enemyDamage}, 적 피해 ${summary.partyDamage}, 아군 처치 ${summary.partyKills}, 적 처치 ${summary.enemyKills}.`;
    const healPart = (summary.partyHealing || summary.enemyHealing) ? ` 회복: 아군 ${summary.partyHealing}, 적 ${summary.enemyHealing}.` : '';
    const tail = summary.highlights.length ? ` 핵심: ${summary.highlights.slice(0, 5).join(' / ')}.` : '';
    return `${head}${healPart} 생존: 아군 ${partyAlive}, 적 ${enemyAlive}.${tail}`;
  }
  function checkBattleEnd(runtime) {
    const partyAlive = getAlive(runtime.party).length;
    const enemyAlive = getAlive(runtime.enemies).length;
    if (partyAlive <= 0 && enemyAlive <= 0) { runtime.finished = true; runtime.outcome = 'Draw'; return true; }
    if (partyAlive <= 0) { runtime.finished = true; runtime.outcome = 'Defeat'; return true; }
    if (enemyAlive <= 0) { runtime.finished = true; runtime.outcome = 'Victory'; return true; }
    return false;
  }
  function buildLlmBlock() {
    const runtime = model.state.runtime;
    const partyAlive = getAlive(runtime.party);
    const enemyAlive = getAlive(runtime.enemies);
    const partyHpNow = runtime.party.reduce((s,u)=>s+Math.max(0,u.hp),0);
    const partyHpMax = runtime.party.reduce((s,u)=>s+Number(u.maxHp||0),0);
    const enemyHpNow = runtime.enemies.reduce((s,u)=>s+Math.max(0,u.hp),0);
    const enemyHpMax = runtime.enemies.reduce((s,u)=>s+Number(u.maxHp||0),0);
    const lines = [];
    lines.push('[Battle Result]');
    lines.push(`Outcome: ${runtime.outcome || 'In Progress'}`);
    lines.push(`Rounds: ${runtime.round}`);
    lines.push(`Party Survivors: ${partyAlive.length}/${runtime.party.length}`);
    lines.push(`Enemy Survivors: ${enemyAlive.length}/${runtime.enemies.length}`);
    lines.push(`Party HP Sum: ${partyHpNow}/${partyHpMax}`);
    lines.push(`Enemy HP Sum: ${enemyHpNow}/${enemyHpMax}`);
    lines.push('');
    lines.push('[Round Summaries]');
    runtime.roundSummaries.forEach(row => lines.push(`- ${row.text}`));
    lines.push('');
    lines.push('[Current State]');
    partyAlive.forEach(u => {
      const buffs = (u.buffs || []).map(b => `${b.name}(${b.turns})`).join(', ');
      const states = [];
      ['stun','bind','sleep','poison','bleed','burn','curse','silence','slow'].forEach(k => { if (u.statuses[k] > 0) states.push(`${k}:${u.statuses[k]}`); });
      if (buffs) states.push(`buff:${buffs}`);
      lines.push(`- ${u.name} [${rowLabel(u.row)}]: HP ${u.hp}/${u.maxHp}, MP ${u.mp}/${u.maxMp}, SP ${u.sp}/${u.maxSp}${states.length ? ' ['+states.join(' | ')+']' : ''}`);
    });
    if (enemyAlive.length) {
      lines.push('');
      lines.push('[Remaining Enemies]');
      enemyAlive.forEach(u => lines.push(`- ${u.name} [${rowLabel(u.row)}]: HP ${u.hp}/${u.maxHp}`));
    }
    lines.push('');
    lines.push('[Detailed Log]');
    (runtime.logs || []).forEach(row => lines.push(`- ${row}`));
    lines.push('');
    lines.push('[Note]');
    lines.push('Use these numbers as fixed outcomes. Add narrative without changing numeric results.');
    return lines.join('\n');
  }

  function resolveOneRound() {
    const runtime = model.state.runtime;
    if (!runtime.started || runtime.finished) return;
    runtime.round += 1;
    runtime.queue = buildRoundQueue(runtime);
    const summary = { round:runtime.round, partyDamage:0, enemyDamage:0, partyHealing:0, enemyHealing:0, partyKills:0, enemyKills:0, highlights:[] };
    for (const uid of runtime.queue) {
      if (runtime.finished) break;
      const actor = findUnitByUid(runtime, uid);
      if (!actor || actor.dead) continue;
      const allies = actor.side === 'party' ? runtime.party : runtime.enemies;
      const foes = actor.side === 'party' ? runtime.enemies : runtime.party;
      if (checkBattleEnd(runtime)) break;
      if (Number(actor.statuses.stun || 0) > 0) {
        addRoundHighlight(summary, `${actor.name} 기절로 행동 불가`);
        continue;
      }
      if (Number(actor.statuses.sleep || 0) > 0) {
        addRoundHighlight(summary, `${actor.name} 수면으로 행동 불가`);
        continue;
      }
      const action = actor.side === 'party' ? resolvePartyAction(runtime, actor, allies, foes) : chooseEnemyAction(actor, allies, foes, false);
      resolveSkillOrBasic(runtime, actor, action, summary);
      if (checkBattleEnd(runtime)) break;
    }
    endRoundMaintenance(runtime, runtime.party.concat(runtime.enemies), summary);
    const text = buildRoundSummaryText(summary, runtime);
    runtime.roundSummaries.push({ round:summary.round, text, raw:summary });
    pushBattleLog(runtime, `[라운드요약] ${text}`);
    runtime.totals.partyDamage += summary.partyDamage;
    runtime.totals.enemyDamage += summary.enemyDamage;
    runtime.totals.partyHealing += summary.partyHealing;
    runtime.totals.enemyHealing += summary.enemyHealing;
    runtime.totals.partyKills += summary.partyKills;
    runtime.totals.enemyKills += summary.enemyKills;
    runtime.pendingActions = {};
    if (!runtime.finished && runtime.round >= 30) {
      runtime.finished = true;
      runtime.outcome = 'Draw';
      runtime.roundSummaries.push({ round:runtime.round, text:'30라운드 제한 도달 — 무승부 처리.', raw:null });
    }
    if (runtime.finished) {
      runtime.llmBlock = buildLlmBlock();
      // Award EXP to DB characters on Victory (only once, guarded by expFlushed flag)
      if (runtime.outcome === 'Victory' && !runtime.expFlushed) {
        runtime.expFlushed = true;
        runtime.expResults = flushExpToDb(runtime);
        if (runtime.expResults.length) {
          const expLines = runtime.expResults.map(r => {
            let s = `${r.name} +${r.exp}EXP (Lv${r.newLevel})`;
            if (r.levelsGained > 0) s += ` ⬆️레벨업 x${r.levelsGained}`;
            return s;
          });
          pushBattleLog(runtime, '[EXP] ' + expLines.join(' / '));
        }
      }
    }
  }
  function autoResolveBattle(maxRounds) {
    const runtime = model.state.runtime;
    let loops = 0;
    while (runtime.started && !runtime.finished && loops < maxRounds) {
      const aliveParty = getAlive(runtime.party);
      const pending = {};
      aliveParty.forEach(u => { pending[u.uid] = { mode:'auto' }; });
      runtime.pendingActions = pending;
      resolveOneRound();
      loops += 1;
    }
  }

  function buildBattleFromSetup() {
    const runtime = buildDefaultRuntime();
    const party = [];
    const enemies = [];
    (model.db.battleSetup.partySlots || []).forEach((id, idx) => {
      if (!id) return;
      const base = getCharById(id);
      if (base) party.push(buildUnit(base, 'party', idx));
    });
    (model.db.battleSetup.enemySlots || []).forEach((id, idx) => {
      if (!id) return;
      const base = getMonsterById(id);
      if (base) enemies.push(buildUnit(base, 'enemies', idx));
    });
    runtime.party = party.slice(0, MAX_PARTY);
    runtime.enemies = enemies.slice(0, MAX_ENEMIES);
    if (!runtime.party.length) throw new Error('파티 슬롯이 비어 있다.');
    if (!runtime.enemies.length) throw new Error('적 슬롯이 비어 있다.');
    runtime.started = true;
    runtime.finished = false;
    model.state.runtime = runtime;
  }

  async function saveDb() { await argSet(KEY_DB, JSON.stringify(model.db)); }
  async function saveState() { await argSet(KEY_STATE, JSON.stringify(model.state)); }
  async function loadAll() {
    let rawDb = await argGet(KEY_DB);
    let rawState = await argGet(KEY_STATE);
    if (!rawDb) rawDb = await argGet('GateBattleV20::db');
    if (!rawDb) rawDb = await argGet('GateBattleV19::db');
    if (!rawDb) rawDb = await argGet('GateBattleV18::db');
    if (!rawDb) rawDb = await argGet('GateBattleV17::db');
    if (!rawDb) rawDb = await argGet('GateBattleV16::db');
    if (!rawDb) rawDb = await argGet('GateBattleV15::db');
    if (!rawDb) rawDb = await argGet('GateBattleV14::db');
    if (!rawDb) rawDb = await argGet('GateBattleV13::db');
    if (!rawDb) rawDb = await argGet('GateBattleV12::db');
    if (!rawState) rawState = await argGet('GateBattleV20::state');
    if (!rawState) rawState = await argGet('GateBattleV19::state');
    if (!rawState) rawState = await argGet('GateBattleV18::state');
    if (!rawState) rawState = await argGet('GateBattleV17::state');
    if (!rawState) rawState = await argGet('GateBattleV16::state');
    if (!rawState) rawState = await argGet('GateBattleV15::state');
    if (!rawState) rawState = await argGet('GateBattleV14::state');
    if (!rawState) rawState = await argGet('GateBattleV13::state');
    if (!rawState) rawState = await argGet('GateBattleV12::state');
    if (!rawDb) rawDb = await argGet('GateBattleV11::db');
    if (!rawState) rawState = await argGet('GateBattleV11::state');
    if (rawDb) {
      try { model.db = Object.assign(buildDefaultDb(), JSON.parse(rawDb)); }
      catch (e) { console.warn(PLUGIN_NAME, 'db parse error', e); model.db = buildDefaultDb(); }
    }
    if (rawState) {
      try {
        const parsed = JSON.parse(rawState);
        if (parsed && typeof parsed === 'object') {
          const next = buildDefaultState();
          model.state = Object.assign(next, parsed);
          model.state.runtime = Object.assign(buildDefaultRuntime(), parsed.runtime || {});
          model.state.gate = Object.assign(buildDefaultGateState(), parsed.gate || {});
          if (model.state.gate && model.state.gate.run && typeof model.state.gate.run === 'object') {
            if (model.state.gate.run.elapsedMinutes == null) model.state.gate.run.elapsedMinutes = 0;
            if (!('postBattle' in model.state.gate.run)) model.state.gate.run.postBattle = null;
            try { (model.state.gate.run.stages || []).forEach(st => { const rooms = []; if (st.kind === 'room' && st.room) rooms.push(st.room); if (st.kind === 'choice') (st.options || []).forEach(o => o && o.room && rooms.push(o.room)); rooms.forEach(r => { if (r.mineResolved == null) r.mineResolved = !!(r.mined || r.mineSkipped); }); }); if (model.state.gate.run.secretPlan && model.state.gate.run.secretPlan.room && model.state.gate.run.secretPlan.room.mineResolved == null) model.state.gate.run.secretPlan.room.mineResolved = !!(model.state.gate.run.secretPlan.room.mined || model.state.gate.run.secretPlan.room.mineSkipped); } catch {}
            if (model.state.gate.run.partyStartCount == null) model.state.gate.run.partyStartCount = Array.isArray(model.state.gate.run.partyState) ? model.state.gate.run.partyState.length : 0;
            if (!model.state.gate.run.campSupplies) { model.state.gate.run.campSupplies = { used:false, legacyMigrated:false }; }
            ensureGateLogContainers(model.state.gate.run);
          }
        }
      } catch (e) {
        console.warn(PLUGIN_NAME, 'state parse error', e);
        model.state = buildDefaultState();
      }
    }
    let vis = await lsGet(KEY_VISIBLE);
    if (vis == null) vis = await lsGet('GateBattleV20::visible');
    if (vis == null) vis = await lsGet('GateBattleV19::visible');
    if (vis == null) vis = await lsGet('GateBattleV18::visible');
    if (vis == null) vis = await lsGet('GateBattleV17::visible');
    if (vis == null) vis = await lsGet('GateBattleV16::visible');
    if (vis == null) vis = await lsGet('GateBattleV15::visible');
    if (vis == null) vis = await lsGet('GateBattleV14::visible');
    if (vis == null) vis = await lsGet('GateBattleV13::visible');
    if (vis == null) vis = await lsGet('GateBattleV12::visible');
    if (vis == null) vis = await lsGet('GateBattleV11::visible');
    model.state.visible = vis === 'true';
    getInventory();
    if (!Array.isArray(model.db.auctionListings)) model.db.auctionListings = [];
    if (!Array.isArray(model.db.hmUsedListings)) model.db.hmUsedListings = [];
    if (!model.state.gate || typeof model.state.gate !== 'object') model.state.gate = buildDefaultGateState();
    if (!Array.isArray(model.state.gate.generated) || !model.state.gate.generated.length) generateGateOptions(model.state.gate.size || 'small', model.state.gate.rank || 'E');
    seedDefaultInventoryMigration();
    ensureSelections();
  }

  function toast(msg, isErr) {
    console[isErr ? 'warn' : 'log'](PLUGIN_NAME, msg);
    const root = model.root;
    if (!root) return;
    let bar = root.querySelector('.gb-toast');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'gb-toast';
      root.appendChild(bar);
    }
    bar.textContent = String(msg);
    bar.classList.toggle('err', !!isErr);
    bar.classList.add('show');
    setTimeout(() => { if (bar) bar.classList.remove('show'); }, 2200);
  }

  function fieldValue(id) {
    const el = model.root && model.root.querySelector(id);
    return el ? el.value : '';
  }
  function checkedValue(id) {
    const el = model.root && model.root.querySelector(id);
    return !!(el && el.checked);
  }

  function unitTagHtml(unit) {
    const tags = [];
    if (unit.dead) tags.push('<span class="gb-dead">DEAD</span>');
    ['stun','bind','sleep','poison','bleed','burn','curse'].forEach(k => { if (unit.statuses[k] > 0) tags.push(`<span class=\"${k==='stun'||k==='sleep'?'gb-stun':'gb-debuff'}\">${k} ${unit.statuses[k]}</span>`); });
    if (unit.baseElement && unit.baseElement !== 'none') tags.push(`<span class="gb-tag">${escapeHtml(elementLabel(unit.baseElement))}</span>`);
    if (unit.speciesLabel) tags.push(`<span class="gb-tag">${escapeHtml(unit.speciesLabel)}</span>`);
    (unit.buffs || []).forEach(b => tags.push(`<span class="gb-buff">${escapeHtml(b.name)} ${b.turns}T</span>`));
    return tags.join(' ');
  }
  function unitRowHtml(unit) {
    const hpPct = unit.maxHp > 0 ? Math.round((unit.hp / unit.maxHp) * 100) : 0;
    const mpPct = unit.maxMp > 0 ? Math.round((unit.mp / unit.maxMp) * 100) : 0;
    const spPct = unit.maxSp > 0 ? Math.round((unit.sp / unit.maxSp) * 100) : 0;
    return `
      <div class="gb-unit ${unit.dead ? 'is-dead' : ''}">
        <div class="gb-unit-top">
          <div><strong>${escapeHtml(unit.name)}</strong> <span class="gb-badge">${escapeHtml(unit.rank)}</span> <span class="gb-badge">${escapeHtml(rowLabel(unit.row))}</span> <span class="gb-badge">${escapeHtml(unit.kind || '')}</span></div>
          <div>${unitTagHtml(unit)}</div>
        </div>
        <div class="gb-sub">${escapeHtml(unit.job || '')} / ${escapeHtml(unit.position || '')} / ${escapeHtml(unit.damageType)} / Threat ${Number(unit.threatBase || 0) + Number(unit.threatBonus || 0)}</div>
        <div class="gb-bar-wrap"><span>HP ${unit.hp}/${unit.maxHp}</span><div class="gb-bar"><div class="gb-bar-fill hp" style="width:${hpPct}%"></div></div></div>
        <div class="gb-bar-wrap"><span>MP ${unit.mp}/${unit.maxMp}</span><div class="gb-bar"><div class="gb-bar-fill mp" style="width:${mpPct}%"></div></div></div>
        <div class="gb-bar-wrap"><span>SP ${unit.sp}/${unit.maxSp}</span><div class="gb-bar"><div class="gb-bar-fill sp" style="width:${spPct}%"></div></div></div>
        <div class="gb-sub">${escapeHtml(unit.lastAction || '')}</div>
      </div>
    `;
  }


// ── 팀 패널 렌더 ──────────────────────────────────────────────────────────────
function renderTeamPanel() {
  if (!Array.isArray(model.db.team)) model.db.team = [];
  const team = model.db.team;
  const allChars = model.db.characters || [];
  const allPersonas = model.db.personas || [];
  const teamView = model.state.teamView || 'members';
  const fmt = n => n >= 1e8 ? `${(n/1e8).toFixed(2)}억` : n >= 10000 ? `${Math.round(n/10000)}만` : n.toLocaleString('en-US');

  // 팀에 없는 캐릭터 목록 (추가 가능)
  const inTeamIds = new Set(team.map(m => m.charId));
  const addableChars = allChars.filter(c => !inTeamIds.has(c.id));
  const addablePersonas = allPersonas.filter(p => !inTeamIds.has(p.id));
  const sharedAlreadyIn = inTeamIds.has('__shared__');

  const memberRows = team.length === 0
    ? '<div class="gb-sub">팀원이 없다. 아래에서 추가하라.</div>'
    : team.map((m, idx) => {
        const isShared = m.charId === '__shared__';
        const char = isShared ? null : (allChars.find(c => c.id === m.charId) || allPersonas.find(p => p.id === m.charId));
        const name = isShared ? '🏛️ 공용 인벤' : (char ? (char.name || m.charId) : m.charId);
        const rank = char ? (char.rank || '') : '';
        return `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(148,163,184,0.1);">
          <span style="flex:1;font-size:13px;"><strong>${escapeHtml(name)}</strong>${rank ? ` <span class="gb-badge">${escapeHtml(rank)}</span>` : ''}</span>
          <label style="font-size:12px;margin:0;display:flex;align-items:center;gap:4px;">비율
            <input type="number" min="0" max="100" style="width:55px;" class="gb-input" data-team-ratio="${idx}" value="${Number(m.ratio||10)}">%
          </label>
          <button class="gb-btn tiny danger" data-team-remove="${idx}">제거</button>
        </div>`;
      }).join('');

  const totalRatio = team.reduce((s, m) => s + Number(m.ratio||10), 0);
  const ratioWarn = team.length > 0 && totalRatio !== 100
    ? `<div class="gb-sub" style="color:#fbbf24;">⚠️ 비율 합계: ${totalRatio}% (100%가 되어야 정산 가능)</div>` : '';

  const addOptions = [
    ...addableChars.map(c => `<option value="${escapeHtml(c.id)}">[캐릭터] ${escapeHtml(c.name||c.id)}</option>`),
    ...addablePersonas.map(p => `<option value="${escapeHtml(p.id)}">[페르소나] ${escapeHtml(p.name||p.id)}</option>`)
  ].join('');

  return `<div class="gb-panel">
    <div class="gb-section-title">👥 팀</div>
    <div class="gb-sub" style="margin-bottom:8px;">게이트 파티 구성원과 정산 비율을 관리한다. 협회 정산 시 이 비율대로 각자 인벤에 분배된다. <strong>공용 인벤</strong>도 팀원으로 추가하면 공용비 분배 가능.</div>
    ${memberRows}
    ${ratioWarn}
    <div class="gb-btn-row" style="margin-top:8px;">
      ${addOptions ? `<select class="gb-input" id="gb-team-add-sel" style="max-width:200px;">
        <option value="">— 추가할 인물 선택 —</option>
        ${addOptions}
      </select>
      <button class="gb-btn" id="gb-team-add-btn">팀에 추가</button>` : ''}
      ${!sharedAlreadyIn ? `<button class="gb-btn" id="gb-team-add-shared">🏛️ 공용 인벤 추가</button>` : ''}
    </div>
  </div>`;
}

function renderHub() {
  const currentGate = gateStateSafe().current;
  const run = getGateRun();
  const currentInfo = currentGate ? `
    <div class="gb-panel">
      <div class="gb-section-title">현재 선택된 게이트</div>
      <div><strong>${escapeHtml(currentGate.title)}</strong> <span class="gb-badge">${escapeHtml(currentGate.rank)}</span> <span class="gb-badge">${escapeHtml(currentGate.sizeLabel || '')}</span></div>
      <div class="gb-sub">${escapeHtml(currentGate.primarySpeciesLabel)} + ${escapeHtml(currentGate.secondarySpeciesLabel)} / 내부 수치 비공개</div>
    </div>` : '';
  const runInfo = run ? `
    <div class="gb-panel">
      <div class="gb-section-title">진행 중인 게이트 공략</div>
      <div><strong>${escapeHtml(run.title)}</strong> <span class="gb-badge">${escapeHtml(run.rank)}</span> <span class="gb-badge">${escapeHtml(run.sizeLabel || '')}</span></div>
      <div class="gb-sub">단계 ${Math.min(run.currentStage + 1, run.stages.length)}/${run.stages.length} / 생존 파티 ${run.partyState.length}명 / ${run.completed ? '완료 — 협회에서 정산 필요' : run.failed ? '실패 — 협회에서 정산 가능' : '진행 중'}</div>
      <div class="gb-btn-row"><button class="gb-btn primary" data-go="gate">게이트 화면으로</button>${(run.completed || run.failed) ? ' <button class="gb-btn" data-go="association">협회에서 정산하기</button>' : ''}</div>
    </div>` : '';
  return `
    <div class="gb-grid four">
      <button class="gb-card-nav" data-go="gate">
        <div class="gb-card-title">⚔️ 게이트</div>
        <div class="gb-sub">소형 / 중형 / 대형 게이트 생성, 선택, 방 단위 진행.</div>
      </button>
      <button class="gb-card-nav" data-go="battle">
        <div class="gb-card-title">🗡️ 전투</div>
        <div class="gb-sub">파티/적 편성, 전열/중열/후열, 수동 행동 선택.</div>
      </button>
      <button class="gb-card-nav" data-go="party">
        <div class="gb-card-title">👥 파티</div>
        <div class="gb-sub">파티 편성, 스탯포인트 배분, 전투 출격 관리.</div>
      </button>
      <button class="gb-card-nav" data-go="character">
        <div class="gb-card-title">🧑 캐릭터</div>
        <div class="gb-sub">페르소나 관리, 장비, 스킬, 레벨 확인.</div>
      </button>
    </div>
    <div class="gb-grid four">
      <button class="gb-card-nav" data-go="inventory">
        <div class="gb-card-title">🎒 공용인벤</div>
        <div class="gb-sub">페르소나 공용 인벤, 가방, 무게, 돈 편집.</div>
      </button>
      <button class="gb-card-nav" data-go="db">
        <div class="gb-card-title">🗂️ DB</div>
        <div class="gb-sub">캐릭터, 페르소나, 스킬, 몬스터를 직접 입력/수정.</div>
      </button>
      <button class="gb-card-nav" data-go="association">
        <div class="gb-card-title">🏛️ 협회</div>
        <div class="gb-sub">게이트 신청·정산, 경매장, 브리핑룸. 정산은 이곳에서.</div>
      </button>
      <button class="gb-card-nav" data-go="shop">
        <div class="gb-card-title">🛒 상점</div>
        <div class="gb-sub">편의점, 백화점, 헌터거리 (수리점·대장간·물약·소모품·재료).</div>
      </button>
    </div>
    <div class="gb-grid four">
      <button class="gb-card-nav" data-go="home">
        <div class="gb-card-title">🏠 집</div>
        <div class="gb-sub">구매 또는 임대 가능한 주거 매물 목록. 계약금·월세 정보 포함.</div>
      </button>
      <button class="gb-card-nav" data-go="guild">
        <div class="gb-card-title">⚜️ 길드</div>
        <div class="gb-sub">길드 정보, 소속 헌터, 임무 보드.</div>
      </button>
    </div>
    ${renderTeamPanel()}
    ${runInfo}
    ${currentInfo}
    <div class="gb-panel">
      <div class="gb-section-title">v2.2 범위</div>
      <div class="gb-sub">허브 / 게이트 / 전투 / 파티 / 캐릭터 / 공용인벤 / DB / 협회(정산·경매) / 상점 / 주거 / 길드 / 가방·무게 / 게이트 자동 생성 / 방 단위 진행 / 광맥 채굴.</div>
      <div class="gb-rule">광역CC = 단일CC의 1/2 계수 + 자원 소모 2배</div>
    </div>
  `;
}

// ── 협회 (Association) ───────────────────────────────────────────────────────
const ASSOC_FLOORS = [
  { id: '1F',  label: '1층 — 메인 로비 / 랭킹 센터 / 정산 카운터' },
  { id: '2F',  label: '2층 — 중앙 경매장' },
  { id: '4F',  label: '4층 — 인사부 (측정·등록·평가)' },
  { id: '7F',  label: '7층 — 엔지니어 로비' },
  { id: 'B5F', label: 'B5층 — 특수 연구 시설' },
];
const ASSOC_LORE = `위치: 서울 종로 | 외관: 도심의 거대한 유리 고층 빌딩. 헌터들이 주도하는 경제 규모를 반영하는 위압적인 규모. 내부: 웅장하고 현대적인 로비. 높은 천장, 형광등 조명, 광택 대리석 바닥. 1층 정산 카운터와 2층 경매장은 직접 연결.`;

function buildSettlementSheet(run, state) {
  if (!run) return null;
  const partyCount = Math.max(1, parseInt(state.settlePartyCount || '3', 10));
  const type = state.settleType || 'association';
  const guildPct = Math.max(0, Math.min(100, parseInt(state.settleGuildPct || '40', 10)));
  const gearItems = state.settleGearItems || [];
  return calcStashSettlement(run.stash, partyCount, type, guildPct, run.title, gearItems);
}

function renderSettlementSheet(result, runTitle) {
  if (!result) return '';
  const { lines, subtotal, fee, feeLabel, net, perPerson, guildShare, guildPct, final, n, isGuild } = result;
  const titleLine = runTitle ? `<div style="font-weight:700;margin-bottom:4px;">${escapeHtml(runTitle)}</div>` : '';
  const itemLines = lines.length
    ? lines.map(l => `<div style="font-family:monospace;font-size:12px;">• ${escapeHtml(l)}</div>`).join('')
    : '<div class="gb-sub">집계된 보상이 없다.</div>';
  return `
    ${titleLine}
    <div style="font-weight:600;margin:6px 0 2px;">[게이트 클리어 정산 내역]</div>
    <div style="background:#0b0d12;border:1px solid rgba(148,163,184,0.14);border-radius:8px;padding:8px;margin-bottom:8px;">${itemLines}</div>
    <div style="font-weight:600;margin-bottom:2px;">[총액]</div>
    <div class="gb-sub">▶ 총합 = ₩${formatWon(subtotal)}</div>
    <div class="gb-sub">▶ ${escapeHtml(feeLabel)} = ₩${formatWon(fee)}</div>
    <div class="gb-sub">▶ 세후 정산액 = ₩${formatWon(net)}</div>
    <div style="font-weight:600;margin:6px 0 2px;">[개인 정산액]</div>
    <div class="gb-sub">▶ 개인 정산액 = ₩${formatWon(net)} × 1/${n} = ₩${formatWon(perPerson)}</div>
    ${isGuild && guildShare > 0 ? `<div class="gb-sub">▶ 길드 지분(${guildPct}%) = ₩${formatWon(guildShare)}</div>` : ''}
    <div class="gb-sub" style="font-weight:700;color:#fbbf24;">▶ 최종 정산액 = ₩${formatWon(final)}</div>
  `;
}

// ── 협회 중앙 경매장 (2F) ────────────────────────────────────────────────────
// NPC 목록 최대 수
const AUCTION_NPC_MAX = 20;
// 경매장 가격 범위: 시장가 85~200%
const AUCTION_PRICE_MIN_RATIO = 0.85;
const AUCTION_PRICE_MAX_RATIO = 2.00;
// 구매 경매 최대 경쟁 상한선
const AUCTION_BUY_MAX_RATIO = 1.80;

function randomAuctionRatio() {
  return AUCTION_PRICE_MIN_RATIO + Math.random() * (AUCTION_PRICE_MAX_RATIO - AUCTION_PRICE_MIN_RATIO);
}

function seedNpcAuctionListings() {
  if (!Array.isArray(model.db.auctionListings)) model.db.auctionListings = [];
  const npcCount = model.db.auctionListings.filter(l => l.isNpc).length;
  const needed = AUCTION_NPC_MAX - npcCount;
  if (needed <= 0) return;
  const grades = ['E','E','E','D','D','D','C','C','B','A'];
  const parts = EQUIP_PARTS;
  for (let i = 0; i < needed; i++) {
    const rank = grades[Math.floor(Math.random() * grades.length)];
    if (Math.random() < 0.70) {
      // 드랍 장비 (반드시 1특성 부여)
      const part = parts[Math.floor(Math.random() * parts.length)];
      const maxInfuseBase = EQUIP_MAX_INFUSE[part] || 1;
      const traitId = EQUIP_TRAIT_TYPES[Math.floor(Math.random() * EQUIP_TRAIT_TYPES.length)];
      const traitName = EQUIP_TRAIT_LABELS[traitId] || traitId;
      const maxInfuse = maxInfuseBase + 1;
      const basePrice = calcEquipBasePrice(rank, part);
      const traitBonus = Math.round((RARE_MATERIAL_BASE_WON[rank] || RARE_MATERIAL_BASE_WON.E) * 1.25);
      const marketPrice = basePrice + traitBonus;
      const ratio = randomAuctionRatio();
      const askPrice = Math.round(marketPrice * ratio);
      const uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + i;
      const nameSuffixes = { weapon:['검','창','활','완드','도끼'], armor:['갑옷','로브','체인메일','플레이트'], subweapon:['방패','단검'], accessory:['반지','목걸이','팔찌'] };
      const suffArr = nameSuffixes[part] || [EQUIP_PART_LABELS[part]||part];
      const suff = suffArr[Math.floor(Math.random() * suffArr.length)];
      const item = {
        id: `npc_drop_equip_${rank.toLowerCase()}_${part}_${uid}`,
        name: `${rank}급 드랍 ${suff} [${traitName}]`,
        part, rank,
        enhance: 0, infuse: 1, maxInfuse, traits: [traitId],
        durability: 100, maxDurability: 100, price: marketPrice,
        category: 'equipment', isDropped: true, stackable: false,
        unitWeightG: EQUIP_WEIGHT_G[part] || 1000,
        stackKey: `equipment:npc_${uid}`, note: `NPC 경매 등록. 특성: ${traitName}`,
        atk: part === 'weapon' ? (WEAPON_BASE_ATK[rank] || 5) : 0,
        pdef: part === 'armor' ? Math.round((ARMOR_STAT_BY_RANK[rank]||{defRange:[0,5]}).defRange[1] * 0.5) : (part === 'subweapon' ? Math.round((ARMOR_STAT_BY_RANK[rank]||{defRange:[0,5]}).defRange[1] * 0.25) : 0),
        mdef: part === 'armor' ? Math.round((ARMOR_STAT_BY_RANK[rank]||{defRange:[0,5]}).defRange[1] * 0.3) : 0,
        mainStat: part === 'weapon' ? (Math.random() < 0.5 ? 'str' : 'int') : (part === 'armor' ? 'con' : 'str'),
        resistType: '', resistPct: 0
      };
      model.db.auctionListings.push({ id: `auc_npc_${uid}`, item, askPrice, marketPrice, priceRatio: ratio, isNpc: true, listedAt: Date.now() });
    } else {
      // 희귀재료 (NPC)
      const traitId = EQUIP_TRAIT_TYPES[Math.floor(Math.random() * EQUIP_TRAIT_TYPES.length)];
      const traitName = EQUIP_TRAIT_LABELS[traitId] || traitId;
      const marketPrice = RARE_MATERIAL_BASE_WON[rank] || RARE_MATERIAL_BASE_WON.E;
      const ratio = randomAuctionRatio();
      const askPrice = Math.round(marketPrice * ratio);
      const uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + '_r' + i;
      const item = {
        id: `npc_rare_${rank.toLowerCase()}_${uid}`,
        name: `${rank}급 희귀재료 [${traitName}]`,
        category: 'rareMaterial', rank, count: 1, traitId, traitName,
        suggestedPrice: marketPrice, stackable: true, stackKey: `rareMaterial:${rank}:${traitId}`,
        note: traitName, unitWeightG: 100
      };
      model.db.auctionListings.push({ id: `auc_npc_${uid}`, item, askPrice, marketPrice, priceRatio: ratio, isNpc: true, listedAt: Date.now() });
    }
  }
}

// 구매 경매 — 경쟁자 즉석 판정 (단계별 인터랙티브용)
function rollBuyCompetitor(currentRatio, step) {
  const COMPETITOR_CHANCE = 0.45;
  const MAX_RATIO = AUCTION_BUY_MAX_RATIO;
  const STEP = 0.10;
  const competitorNames = ['익명 헌터 A','익명 헌터 B','익명 헌터 C','딜러 ??','수집가 #?'];
  if (currentRatio >= MAX_RATIO) return null;
  const roll = Math.random();
  if (roll < COMPETITOR_CHANCE) {
    return {
      name: competitorNames[Math.floor(Math.random() * competitorNames.length)],
      ratio: Math.min(currentRatio + STEP, MAX_RATIO)
    };
  }
  return null;
}

// 판매 경매 시뮬레이션: 85%에서 시작, 60% 확률로 10%씩 상승, 최대 200%
// fullLog: 전체 로그 (단계별로 공개), revealedCount로 애니메이션
function simulateSellAuction(marketPrice) {
  const STEP = 0.10;
  const MAX_RATIO = AUCTION_PRICE_MAX_RATIO;
  const BID_CHANCE_BASE = 0.60; // 기본 입찰 확률
  const bidderNames = ['수집가 A','헌터 마켓 딜러','길드 구매자','무명 헌터','경매 참여자'];
  const fullLog = [];
  let ratio = AUCTION_PRICE_MIN_RATIO;
  let lastBidRatio = null;
  let step = 0;
  fullLog.push(`[경매 시작] 시작가: 시장가 85% = ₩${Math.round(marketPrice*ratio).toLocaleString('en-US')}`);
  while (ratio <= MAX_RATIO) {
    step++;
    const bidChance = BID_CHANCE_BASE * Math.pow(0.88, step - 1); // 단계가 오를수록 입찰 확률 감소
    const roll = Math.random();
    if (roll < bidChance) {
      const bname = bidderNames[Math.floor(Math.random() * bidderNames.length)];
      fullLog.push(`<em>${bname}</em> — 시장가 ${Math.round(ratio*100)}% 입찰 (₩${Math.round(marketPrice*ratio).toLocaleString('en-US')})`);
      lastBidRatio = ratio;
      const nextRatio = ratio + STEP;
      if (nextRatio > MAX_RATIO) { fullLog.push(`[종료] 최대 가격(200%) 도달. 경쟁 종료.`); break; }
      ratio = nextRatio;
    } else {
      fullLog.push(`[경매 종료] 추가 입찰 없음.`);
      break;
    }
  }
  const finalRatio = lastBidRatio !== null ? lastBidRatio : AUCTION_PRICE_MIN_RATIO;
  const finalPrice = Math.round(marketPrice * finalRatio);
  if (lastBidRatio === null) fullLog.push(`[유찰 주의] 입찰자 없음. 시작가 85%로 낙찰.`);
  fullLog.push(`[🔨 낙찰] 최종 낙찰가: 시장가 <strong>${Math.round(finalRatio*100)}%</strong> = ₩${finalPrice.toLocaleString('en-US')}`);
  return { fullLog, finalRatio, finalPrice };
}

function renderAuctionHouseHtml() {
  if (!Array.isArray(model.db.auctionListings)) model.db.auctionListings = [];
  seedNpcAuctionListings();

  const inv = getInventory();
  const gold = Number(inv.gold || 0);
  const tab = model.state.auctionTab || 'browse';
  const fmt = n => n >= 1e8 ? `${(n/1e8).toFixed(2)}억원` : n >= 10000 ? `${Math.round(n/10000)}만원` : `${n.toLocaleString('en-US')}원`;

  const tabBar = `<div class="gb-btn-row">
    <button class="gb-btn${tab==='browse'?' primary':''}" data-auction-tab="browse">🔍 구매</button>
    <button class="gb-btn${tab==='sell'?' primary':''}" data-auction-tab="sell">📦 판매 등록</button>
  </div>`;

  let content = '';

  if (tab === 'browse') {
    // 구매 탭: 검색 → 결과 → 단계별 입찰
    const bidState = model.state.auctionBid;
    if (bidState && bidState.done === false) {
      // 경매 진행 중 (단계별 인터랙티브)
      const listing = (model.db.auctionListings||[]).find(l => l.id === bidState.listingId);
      const it = listing ? listing.item : null;
      const logHtml = (bidState.log||[]).map(l => `<div style="font-size:0.85em;margin-bottom:2px;">${l}</div>`).join('');
      const canAfford = gold >= Math.round(bidState.marketPrice * bidState.currentRatio);
      const myPrice = Math.round(bidState.marketPrice * bidState.currentRatio);
      const fmt2 = fmt;

      let actionArea = '';
      if (bidState.won) {
        // 낙찰 완료 대기
        const canAffordFinal = gold >= bidState.finalPrice;
        actionArea = `
          <div class="gb-sub" style="color:#fbbf24;margin-top:6px;">🏆 낙찰가: <strong>${fmt2(bidState.finalPrice)}</strong> (소지금: ${fmt2(gold)})</div>
          <div class="gb-btn-row">
            ${canAffordFinal ? `<button class="gb-btn primary" data-auction-confirm>✅ 낙찰 확정 (-${fmt2(bidState.finalPrice)})</button>` : `<button class="gb-btn" disabled>소지금 부족</button>`}
            <button class="gb-btn" data-auction-bid-cancel>❌ 포기</button>
          </div>`;
      } else if (bidState.pendingCompetitor) {
        // 경쟁자가 입찰 — 재입찰 또는 포기
        const rePrice = Math.round(bidState.marketPrice * bidState.pendingRatio);
        actionArea = `
          <div class="gb-sub" style="color:#ef4444;margin-top:6px;">⚠️ <strong>${escapeHtml(bidState.pendingCompetitor)}</strong>이(가) ${Math.round(bidState.pendingRatio*100)}% (${fmt2(rePrice)})에 입찰!</div>
          <div class="gb-btn-row">
            ${gold >= rePrice ? `<button class="gb-btn primary" data-auction-rebid>🔄 재입찰 (${fmt2(rePrice)})</button>` : `<button class="gb-btn" disabled>소지금 부족 — 재입찰 불가</button>`}
            <button class="gb-btn danger" data-auction-bid-cancel>❌ 포기</button>
          </div>`;
      } else {
        // 초기 입찰 대기
        actionArea = `
          <div class="gb-sub" style="margin-top:6px;">시작가: <strong>${fmt2(myPrice)}</strong> (시장가 ${Math.round(bidState.currentRatio*100)}%) | 소지금: ${fmt2(gold)}</div>
          <div class="gb-btn-row">
            ${canAfford ? `<button class="gb-btn primary" data-auction-place-bid>🔨 입찰하기 (${fmt2(myPrice)})</button>` : `<button class="gb-btn" disabled>소지금 부족</button>`}
            <button class="gb-btn" data-auction-bid-cancel>❌ 취소</button>
          </div>`;
      }

      content = `
        <div class="gb-panel" style="border:1px solid rgba(251,191,36,0.4);">
          <div class="gb-section-title">🔨 경매 참여 중</div>
          ${it ? `<div class="gb-sub"><strong>${escapeHtml(it.name||it.id)}</strong> <span class="gb-badge">${escapeHtml(it.rank||'E')}</span> 시장가: ${fmt(bidState.marketPrice)}</div>` : ''}
          <div style="background:#0b0d12;border:1px solid rgba(148,163,184,0.1);border-radius:6px;padding:8px;margin:8px 0;max-height:200px;overflow-y:auto;" id="gb-auction-log">${logHtml}</div>
          ${actionArea}
        </div>`;
    } else {
      const listings = model.db.auctionListings;
      const rankFilter = model.state.auctionRankFilter || '';
      const searchQ = (model.state.auctionSearchQ || '').trim().toLowerCase();
      const filtered = listings.filter(l => {
        const it = l.item;
        const rankOk = !rankFilter || (it.rank||'E') === rankFilter;
        const searchOk = !searchQ || (it.name||it.id||'').toLowerCase().includes(searchQ) ||
          (it.note||'').toLowerCase().includes(searchQ) ||
          ((it.traits||[]).some(t => (EQUIP_TRAIT_LABELS[t]||t).includes(searchQ)));
        return rankOk && searchOk;
      });

      const rankBtns = ['','E','D','C','B','A','S'].map(r =>
        `<button class="gb-btn${rankFilter===r?' primary':''}" data-auction-rank="${escapeHtml(r)}">${r||'전체'}</button>`
      ).join('');

      const listingsHtml = filtered.length === 0
        ? '<div class="gb-sub">검색 결과 없음.</div>'
        : filtered.map(l => {
            const it = l.item;
            const mktPrice = l.marketPrice || it.price || it.suggestedPrice || 0;
            const isEquip = it.category === 'equipment';
            const traitTxt = isEquip && (it.traits||[]).length ? `<span class="gb-badge" style="background:#7c3aed;">${(it.traits||[]).map(t=>EQUIP_TRAIT_LABELS[t]||t).join(', ')}</span>` : '';
            const npcBadge = l.isNpc ? '<span class="gb-badge">NPC</span>' : '<span class="gb-badge" style="background:#0284c7;">플레이어</span>';
            return `<div class="gb-unit" style="margin-bottom:6px;padding:8px;border:1px solid rgba(148,163,184,0.15);border-radius:6px;">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
                <div>
                  <strong>${escapeHtml(it.name||it.id)}</strong>
                  <span class="gb-badge">${escapeHtml(it.rank||'E')}</span>
                  ${isEquip ? `<span class="gb-badge">${escapeHtml(EQUIP_PART_LABELS[it.part]||it.part||'')}</span>` : '<span class="gb-badge">희귀재료</span>'}
                  ${npcBadge} ${traitTxt}
                  ${isEquip ? `<div class="gb-sub">주입 최대 ${it.maxInfuse||1}회 | 내구 ${it.durability||100}/${it.maxDurability||100}</div>` : ''}
                  <div class="gb-sub">시장가: ${fmt(mktPrice)}</div>
                </div>
                <button class="gb-btn primary" data-auction-bid="${escapeHtml(l.id)}" data-auction-bid-mkt="${mktPrice}" style="white-space:nowrap;">🔨 경매 참여</button>
              </div>
            </div>`;
          }).join('');

      content = `
        <div class="gb-sub" style="margin-bottom:6px;">소지금: ${fmt(gold)} | 총 ${filtered.length}개 항목</div>
        <div style="display:flex;gap:6px;margin-bottom:6px;">
          <input class="gb-input" id="gb-auction-search" type="text" placeholder="이름·특성 검색..." value="${escapeHtml(model.state.auctionSearchQ||'')}" style="flex:1;">
        </div>
        <div class="gb-btn-row">${rankBtns}</div>
        <button class="gb-btn" data-auction-refresh style="margin-bottom:8px;">🔄 NPC 목록 갱신</button>
        <div>${listingsHtml}</div>`;
    }

  } else {
    // 판매 등록 탭
    const sellState = model.state.auctionSell;
    if (sellState && sellState.done === false) {
      // 판매 경매 진행 중 — 단계별 공개 (revealedCount)
      const fullLog = sellState.fullLog || sellState.log || [];
      const revealed = Math.min(sellState.revealedCount ?? fullLog.length, fullLog.length);
      const isDone = revealed >= fullLog.length;
      const logHtml = fullLog.slice(0, revealed).map(l => `<div style="font-size:0.85em;margin-bottom:2px;">${l}</div>`).join('');
      content = `
        <div class="gb-panel" style="border:1px solid rgba(34,197,94,0.4);">
          <div class="gb-section-title">🔨 판매 경매 진행 중</div>
          <div class="gb-sub"><strong>${escapeHtml(sellState.itemName||'')}</strong> — 시장가: ${fmt(sellState.marketPrice)}</div>
          <div style="background:#0b0d12;border:1px solid rgba(148,163,184,0.1);border-radius:6px;padding:8px;margin:8px 0;max-height:200px;overflow-y:auto;" id="gb-sell-auction-log">${logHtml}${!isDone ? '<div style="color:#94a3b8;font-size:0.8em;animation:gb-blink 1s infinite;">⏳ 입찰 대기 중...</div>' : ''}</div>
          ${isDone ? `
          <div class="gb-sub" style="color:#22c55e;">최종 낙찰가: <strong>${fmt(sellState.finalPrice)}</strong></div>
          <div class="gb-btn-row">
            <button class="gb-btn primary" data-auction-sell-confirm>✅ 판매 완료 (+${fmt(sellState.finalPrice)})</button>
          </div>` : ''}
        </div>`;
    } else {
      const myListings = (model.db.auctionListings||[]).filter(l => !l.isNpc);
      const selKey = model.state.auctionSellSel || '';
      const listableItems = (inv.items||[]).filter(it =>
        (it.category === 'equipment') || (it.category === 'rareMaterial' && Number(it.suggestedPrice||0) > 0)
      );

      const itemListHtml = listableItems.length === 0
        ? '<div class="gb-sub">등록할 수 있는 장비나 희귀재료가 없다.</div>'
        : listableItems.map(it => {
            const ikey = inventoryItemKey(it);
            const isEq = it.category === 'equipment';
            const mktPrice = isEq ? Number(it.price || calcEquipBasePrice(it.rank||'E', it.part||'weapon')) : Number(it.suggestedPrice||0);
            const traitTxt = isEq && (it.traits||[]).length ? ` [${(it.traits||[]).map(t=>EQUIP_TRAIT_LABELS[t]||t).join(', ')}]` : '';
            return `<button class="gb-list-item ${ikey===selKey?'is-active':''}" data-auction-sell-sel="${escapeHtml(ikey)}">
              <strong>${escapeHtml(it.name||it.id)}</strong>${escapeHtml(traitTxt)}
              <span class="gb-badge">${escapeHtml(it.rank||'E')}</span>
              ${isEq ? `<span class="gb-badge">${escapeHtml(EQUIP_PART_LABELS[it.part]||it.part||'')}</span>` : '<span class="gb-badge">희귀재료</span>'}
              <div class="gb-sub">시장가: ${fmt(mktPrice)}</div>
            </button>`;
          }).join('');

      let listActionHtml = '';
      if (selKey) {
        const it = listableItems.find(x => inventoryItemKey(x) === selKey);
        if (it) {
          const isEq = it.category === 'equipment';
          const mktPrice = isEq ? Number(it.price || calcEquipBasePrice(it.rank||'E', it.part||'weapon')) : Number(it.suggestedPrice||0);
          listActionHtml = `
            <div style="margin-top:10px;padding:10px;border:1px solid rgba(34,197,94,0.25);border-radius:6px;">
              <div class="gb-sub">📋 경매 등록: <strong>${escapeHtml(it.name||it.id)}</strong></div>
              <div class="gb-sub">시장가: ${fmt(mktPrice)} | 시작가 85% ~ 최대 200%</div>
              <div class="gb-sub" style="color:#94a3b8;font-size:0.8em;">85%에서 시작해 확률적으로 10%씩 상승합니다.</div>
              <div class="gb-btn-row" style="margin-top:8px;">
                <button class="gb-btn primary" data-auction-sell-start="${escapeHtml(selKey)}" data-auction-sell-mkt="${mktPrice}">🔨 경매 시작</button>
              </div>
            </div>`;
        }
      }

      const myListHtml = myListings.length === 0
        ? '<div class="gb-sub" style="margin-top:8px;">등록된 물품 없음.</div>'
        : myListings.map(l => `<div class="gb-unit" style="display:flex;align-items:center;justify-content:space-between;padding:6px;border:1px solid rgba(148,163,184,0.1);border-radius:4px;margin-bottom:4px;">
            <span>${escapeHtml(l.item.name||l.item.id)} — <strong>${fmt(l.askPrice)}</strong></span>
            <button class="gb-btn" data-auction-cancel="${escapeHtml(l.id)}">취소</button>
          </div>`).join('');

      content = `
        <div class="gb-grid db">
          <div class="gb-panel">
            <div class="gb-section-title">인벤토리 (장비·희귀재료)</div>
            <div class="gb-sub">소지금: ${fmt(gold)}</div>
            <div style="margin-top:8px;">${itemListHtml}</div>
            ${listActionHtml}
          </div>
          <div class="gb-panel">
            <div class="gb-section-title">등록한 물품</div>
            ${myListHtml}
          </div>
        </div>`;
    }
  }

  return `
    <div class="gb-panel">
      <div class="gb-section-title">🏷️ 중앙 경매장 (2F)</div>
      <div class="gb-sub">희귀 드랍 장비·희귀재료 거래. 검색 후 경매 참여 가능.</div>
      ${tabBar}
      <div style="margin-top:10px;">${content}</div>
    </div>`;
}

function renderAssociationView() {
  const floor = model.state.assocFloor || '1F';
  const gs = gateStateSafe();
  const run = gs.run;
  const floorButtons = ASSOC_FLOORS.map(f =>
    `<button class="gb-btn ${floor === f.id ? 'primary' : ''}" data-assoc-floor="${escapeHtml(f.id)}">${escapeHtml(f.label)}</button>`
  ).join('');

  const lorePanel = `
    <div class="gb-panel">
      <div class="gb-section-title">🏛️ 헌터 협회 (서울 종로 본부)</div>
      <div class="gb-sub">${escapeHtml(ASSOC_LORE)}</div>
      <div class="gb-btn-row">${floorButtons}</div>
    </div>`;

  let floorContent = '';

  if (floor === '1F') {
    // ── 1F: 정산 카운터 ────────────────────────────────────────────────────────
    const st = model.state;
    const partyCount = st.settlePartyCount || '3';
    const settleType = st.settleType || 'association';
    const guildPct  = st.settleGuildPct  || '40';
    const settleDate = st.settleDate || '';
    const isGuild   = settleType === 'guild';

    // 판매할 아이템 선택 UI (항상 표시)
    const inv = getInventory();
    const fmtS = n => { const v = Math.floor((n||0) / 10) * 10; return v >= 1e8 ? `${(v/1e8).toFixed(2)}억원` : `${v.toLocaleString('en-US')}원`; };
    // ── 아이템 단가 계산 헬퍼 ────────────────────────────────────────────────
    const calcSellPrice = (it, guild) => calcInventorySellPrice(it, guild);
    const sellableItems = (inv.items||[]).filter(it => {
      if (it.category === 'equipment') {
        // 중고 장비(사용 이력 있음)는 협회에서 판매 불가 — 헌터마켓 이용
        const isUsed = it.isUsed || Number(it.maxDurability ?? 100) < 100 || Number(it.durability ?? 100) < Number(it.maxDurability ?? 100);
        return !isUsed;
      }
      return it.category === 'rareMaterial' || it.category === 'normalMaterial' || it.category === 'manaStone';
    });
    const settleItemSel = st.settleItemSel || {};
    const selectedTotal = sellableItems.reduce((sum, it) => {
      const key = inventoryItemKey(it);
      if (!settleItemSel[key]) return sum;
      return sum + calcSellPrice(it, isGuild);
    }, 0);
    const team = Array.isArray(model.db.team) ? model.db.team : [];
    const totalRatio = team.reduce((s, m) => s + Number(m.ratio||10), 0);

    const sellItemsHtml = sellableItems.length === 0
      ? '<div class="gb-sub">인벤토리에 판매 가능한 아이템이 없다.</div>'
      : sellableItems.map(it => {
          const key = inventoryItemKey(it);
          const sel = !!settleItemSel[key];
          const price = calcSellPrice(it, isGuild);
          return `<label style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid rgba(148,163,184,0.08);cursor:pointer;">
            <input type="checkbox" data-settle-item-sel="${escapeHtml(key)}" ${sel?'checked':''}>
            <span style="flex:1;font-size:12px;"><strong>${escapeHtml(it.name||it.id)}</strong> <span class="gb-badge">${escapeHtml(it.rank||'')}</span>${it.count>1?` ×${it.count}`:''}</span>
            <span style="font-size:11px;color:#94a3b8;">${fmtS(price)}</span>
          </label>`;
        }).join('');

    // ── 아이템 선택 기반 정산 계산 (게이트 무관) ──────────────────────────────
    const ASSOC_FEE = 0.05; // 5%
    const GUILD_FEE = 0.05; // 5% (간단화)
    const feeRate = isGuild ? GUILD_FEE : ASSOC_FEE;
    const feeLabel2 = isGuild ? '세액' : '세액&협회 수수료';
    const partyN = Math.max(1, team.length > 0 ? team.length : parseInt(partyCount, 10));

    // 팀 인원 기반 계산
    const itemFee = Math.floor(selectedTotal * feeRate);
    const itemNet = selectedTotal - itemFee;
    const itemPerPerson = Math.floor(itemNet / partyN);
    const guildShareAmt = isGuild ? Math.floor(itemPerPerson * (parseInt(guildPct,10)/100)) : 0;
    const itemFinal = itemPerPerson - guildShareAmt;

    // 팀 배분 미리보기 (파티원 개인별)
    const teamDistHtml = (team.length > 0 && totalRatio === 100 && selectedTotal > 0) ? team.map(m => {
      const share = Math.floor(itemNet * (m.ratio||10) / 100);
      const allChars = model.db.characters || [];
      const allPersonas = model.db.personas || [];
      const char = allChars.find(c => c.id === m.charId) || allPersonas.find(p => p.id === m.charId);
      const charName = m.charId === '__shared__' ? '공용 인벤' : (char ? (char.name||m.charId) : m.charId);
      return `<div class="gb-sub">• ${escapeHtml(charName)} (${m.ratio||10}%) → <strong>${fmtS(share)}</strong></div>`;
    }).join('') : '';

    // 선택된 아이템 목록 (체크된 것만)
    const selectedItemLines = sellableItems.filter(it => settleItemSel[inventoryItemKey(it)]).map(it => {
      const price = calcSellPrice(it, isGuild);
      const countTxt = it.count > 1 ? ` ×${it.count}` : '';
      return `<div class="gb-sub">• [${escapeHtml(it.rank||'E')}] ${escapeHtml(it.name||it.id)}${countTxt} = ${fmtS(price)}</div>`;
    }).join('');

    const calcSheetHtml = selectedTotal > 0 ? `
    <div style="background:#0b0d12;border:1px solid rgba(148,163,184,0.14);border-radius:8px;padding:8px;margin-top:8px;">
      ${selectedItemLines ? `<div style="font-weight:600;margin-bottom:4px;">[원하는 아이템만 체크]</div>${selectedItemLines}<div class="gb-rule" style="margin:6px 0;"></div>` : ''}
      <div style="font-weight:600;margin-bottom:4px;">[총액]</div>
      <div class="gb-sub">▶ 총합 = ${fmtS(selectedTotal)}</div>
      <div class="gb-sub">▶ ${feeLabel2} = ${fmtS(itemFee)}</div>
      <div class="gb-sub">▶ 세후 정산액 = ${fmtS(itemNet)}</div>
      ${teamDistHtml ? `<div class="gb-rule" style="margin:6px 0;"></div><div style="font-weight:600;margin-bottom:4px;">팀 배분 미리보기</div>${teamDistHtml}` : `<div style="font-weight:600;margin:6px 0 2px;">[개인 정산액] (${partyN}인 기준)</div><div class="gb-sub">▶ 개인 정산액 = ${fmtS(itemNet)} × 1/${partyN} = ${fmtS(itemPerPerson)}</div>${isGuild && guildShareAmt > 0 ? `<div class="gb-sub">▶ 길드 지분(${guildPct}%) = ${fmtS(guildShareAmt)}</div>` : ''}<div class="gb-sub" style="font-weight:700;color:#fbbf24;">▶ 최종 정산액 = ${fmtS(itemFinal)}</div>`}
    </div>` : '';

    // 통합 정산 패널 (아이템 선택 판매)
    const settleFormPanel = `
      <div class="gb-panel">
        <div class="gb-section-title">📋 정산 카운터</div>
        <div class="gb-grid two" style="margin-top:4px;">
          <label>정산 방식
            <select class="gb-input" id="gb-settle-type">
              ${['association','guild'].map(v => `<option value="${v}"${settleType===v?' selected':''}>${v==='association'?'협회 정산':'길드 정산'}</option>`).join('')}
            </select>
          </label>
          <label>정산 날짜 <span class="gb-sub">(소득 기록용)</span>
            <input class="gb-input" id="gb-settle-date" type="text" placeholder="예: 2026-03-14" value="${escapeHtml(settleDate)}" style="width:130px;">
          </label>
          ${team.length === 0 ? `<label>파티 인원 (팀 없을 때)<input class="gb-input" id="gb-settle-party-manual" type="number" min="1" max="20" value="${escapeHtml(partyCount)}" style="width:70px;"></label>` : ''}
          ${isGuild ? `<label>길드 지분 %<input class="gb-input" id="gb-settle-guild-pct" type="number" min="0" max="100" value="${escapeHtml(guildPct)}"></label>` : ''}
        </div>
        <div class="gb-rule" style="margin-top:12px;margin-bottom:8px;"></div>
        <div class="gb-section-title">💰 판매할 아이템 선택</div>
        <div class="gb-sub" style="margin-bottom:6px;">원하는 아이템만 체크. 팔기 전 아래 계산 확인 후 정산하라. <span style="color:#f97316;">⚠️ 중고 장비(사용 이력 있음)는 헌터마켓에서만 판매 가능.</span></div>
        <div style="max-height:220px;overflow-y:auto;border:1px solid rgba(148,163,184,0.15);border-radius:6px;padding:6px;">${sellItemsHtml}</div>
        <div class="gb-btn-row" style="margin-top:6px;">
          <button class="gb-btn tiny" id="gb-settle-item-sel-all">전체 선택</button>
          <button class="gb-btn tiny" id="gb-settle-item-sel-none">전체 해제</button>
        </div>
        ${calcSheetHtml}
        ${selectedTotal > 0 ? `
        ${team.length > 0 && totalRatio !== 100 ? `<div class="gb-sub" style="color:#ef4444;margin-top:4px;">팀 비율 합계 ${totalRatio}% (100% 필요)</div>` : ''}
        <div class="gb-btn-row" style="margin-top:8px;">
          ${team.length > 0 && totalRatio === 100 ? `<button class="gb-btn primary" id="gb-direct-sell-team">✅ 팀 비율로 분배 정산</button>` : `<button class="gb-btn primary" id="gb-direct-sell-single">✅ 공용 인벤으로 정산</button>`}
        </div>` : ''}
      </div>`;

    // ── 소득 기록 로그 ─────────────────────────────────────────────────────────
    const incomeLog = Array.isArray(model.db.incomeLog) ? model.db.incomeLog : [];
    const incomeLogHtml = incomeLog.length
      ? incomeLog.slice().reverse().map((r, idx) => {
          const isGuildEntry = r.type === 'guild';
          return `<div class="gb-unit" style="border-bottom:1px solid rgba(148,163,184,0.1);padding-bottom:6px;margin-bottom:6px;">
            <div class="gb-unit-top">
              <div>
                <strong>${escapeHtml(r.date || '날짜 미입력')}</strong>
                <span class="gb-badge">${isGuildEntry ? '길드' : '협회'}</span>
                <span class="gb-sub"> — ${escapeHtml(r.runTitle || '?')}</span>
                ${r.participant ? `<span class="gb-sub"> / <strong>${escapeHtml(r.participant)}</strong>${r.ratio ? ` ${r.ratio}%` : ''}</span>` : ''}
              </div>
              <button class="gb-btn tiny danger" data-income-log-del="${incomeLog.length - 1 - idx}">삭제</button>
            </div>
            <div class="gb-sub">총합 ₩${formatWon(r.gross)} / ${isGuildEntry ? `법인세 ₩${formatWon(r.corpTax||0)}` : `수수료 ₩${formatWon(r.fee||0)}`} / 지급액 <strong style="color:#fbbf24;">₩${formatWon(r.final||0)}</strong></div>
            ${isGuildEntry && r.guildShare ? `<div class="gb-sub">길드 공금 적립 ₩${formatWon(r.guildShare)}</div>` : ''}
          </div>`;
        }).join('')
      : '<div class="gb-sub">— 기록된 정산 내역이 없다. 정산 시 날짜를 입력하면 자동 기록됨. —</div>';

    const logPanel = `
      <div class="gb-panel">
        <div class="gb-section-title">📜 소득 기록 (세금 신고용)</div>
        <div class="gb-sub" style="margin-bottom:6px;">협회 및 길드 정산 이력. 개인 소득세 신고 참고용. 블랙마켓 거래는 기록되지 않는다.</div>
        ${incomeLogHtml}
      </div>`;

    // Monthly income tax calculator + pay button
    const taxIncome  = st.taxIncome || '';
    const taxMonth   = st.taxPayMonth || '';
    const taxResult  = taxIncome ? calcMonthlyIncomeTax(Number(taxIncome)) : null;
    // Count records matching taxPayMonth
    const incomeLogAll = Array.isArray(model.db.incomeLog) ? model.db.incomeLog : [];
    const matchCount   = taxMonth ? incomeLogAll.filter(r => (r.date || '').startsWith(taxMonth)).length : 0;
    const taxPanel = `
      <div class="gb-panel">
        <div class="gb-section-title">🧾 월 소득세 계산기 (개인)</div>
        <div class="gb-sub">기준: 월 총 소득 / 공식: (총소득 × 세율) − 누진공제액</div>
        <label>월 총 소득 (원)
          <input class="gb-input" id="gb-tax-income" type="number" value="${escapeHtml(taxIncome)}" placeholder="예: 3000000">
        </label>
        <div class="gb-btn-row"><button class="gb-btn" id="gb-tax-calc">세액 계산</button></div>
        ${taxResult !== null ? `<div class="gb-sub" style="color:#fbbf24;font-weight:700;margin-top:8px;">▶ 예상 소득세 = ₩${formatWon(taxResult)}</div><div class="gb-sub">▶ 세후 실수령 = ₩${formatWon(Number(taxIncome) - taxResult)}</div>` : ''}
        <div class="gb-sub" style="margin-top:8px;">세율 구간: 1백만 이하 6% / ~4백만 15% / ~750만 24% / ~1250만 35% / ~2500만 38% / ~4200만 40% / ~8500만 42% / 초과 45%</div>
        <div style="margin-top:10px;border-top:1px solid rgba(148,163,184,0.2);padding-top:8px;">
          <div class="gb-sub" style="font-weight:600;margin-bottom:4px;">💸 납부 완료 처리 — 해당 월 기록 삭제</div>
          <div class="gb-sub">납부한 달을 입력하면 그 달의 소득 기록이 삭제된다 (날짜 앞 7자리 기준, 예: 2026-03).</div>
          <div style="display:flex;gap:6px;align-items:center;margin-top:6px;flex-wrap:wrap;">
            <input class="gb-input" id="gb-tax-pay-month" type="text" placeholder="예: 2026-03" value="${escapeHtml(taxMonth)}" style="width:110px;">
            <button class="gb-btn" id="gb-tax-pay-preview">미리보기 (${matchCount}건)</button>
            <button class="gb-btn danger" id="gb-tax-pay-confirm" ${!taxMonth ? 'disabled' : ''}>✅ 납부 완료 — 기록 삭제</button>
          </div>
        </div>
      </div>`;

    const applicationPanel = `
      <div class="gb-panel">
        <div class="gb-section-title">📝 게이트 신청 창구</div>
        <div class="gb-sub">공식 게이트 신청 및 등급 심사. 게이트 탭에서 생성 후 여기서 공식 등록 가능. (기능 확장 예정)</div>
      </div>`;

    floorContent = settleFormPanel + logPanel + taxPanel + applicationPanel;

  } else if (floor === '2F') {
    floorContent = renderAuctionHouseHtml();
  } else if (floor === '4F') {
    floorContent = `
      <div class="gb-panel">
        <div class="gb-section-title">📊 인사부 (4F) — 측정·등록·평가팀</div>
        <div class="gb-sub">첨단 하이테크 장비를 이용한 마나 측정 및 공식 랭크 부여. 헌터 등록 및 재측정도 이 층에서 진행된다.</div>
        <div class="gb-sub" style="margin-top:8px;">— 랭크 판정 기능 확장 예정. —</div>
      </div>`;
  } else if (floor === '7F') {
    floorContent = `
      <div class="gb-panel">
        <div class="gb-section-title">🔧 엔지니어 로비 (7F)</div>
        <div class="gb-sub">게이트 감지 시스템, 분석 장비, 기술 연구팀이 운영하는 층. 게이트 구조 분석 및 예측 보고서를 발행한다.</div>
        <div class="gb-sub" style="margin-top:8px;">— 게이트 분석 기능 확장 예정. —</div>
      </div>`;
  } else if (floor === 'B5F') {
    floorContent = `
      <div class="gb-panel">
        <div class="gb-section-title">🔬 특수 연구 시설 (B5F)</div>
        <div class="gb-sub">비공개 구역. 희귀 마법 현상 연구, 격리된 마수 표본 보관, 고위험 실험 시설이 위치한다. S랭크 헌터 및 특별 허가자만 출입 가능.</div>
      </div>`;
  }

  return `
    ${lorePanel}
    ${floorContent}
    <div class="gb-btn-row"><button class="gb-btn" data-go="hub">← 허브로</button></div>`;
}

// ── 상점 (Shop) ──────────────────────────────────────────────────────────────
const SHOP_ITEMS = {
  convenience: [], // 편의점 식량은 getConvFoodDb()에서 동적으로 로드
  consumable: [
    { id:'pickaxe_E',  name:'E급 곡괭이',  price:70000,      unit:'개', note:'E등급 광맥 채굴용 (2.5kg)', buildFn: () => buildPickaxeItem('E', 1) },
    { id:'pickaxe_D',  name:'D급 곡괭이',  price:300000,     unit:'개', note:'D등급 광맥 채굴용 (2.5kg)', buildFn: () => buildPickaxeItem('D', 1) },
    { id:'pickaxe_C',  name:'C급 곡괭이',  price:2000000,    unit:'개', note:'C등급 광맥 채굴용 (2.5kg)', buildFn: () => buildPickaxeItem('C', 1) },
    { id:'pickaxe_B',  name:'B급 곡괭이',  price:10000000,   unit:'개', note:'B등급 광맥 채굴용 (2.5kg)', buildFn: () => buildPickaxeItem('B', 1) },
    { id:'pickaxe_A',  name:'A급 곡괭이',  price:70000000,   unit:'개', note:'A등급 광맥 채굴용 (2.5kg)', buildFn: () => buildPickaxeItem('A', 1) },
    { id:'pickaxe_S',  name:'S급 곡괭이',  price:250000000,  unit:'개', note:'S등급 광맥 채굴용 (2.5kg)', buildFn: () => buildPickaxeItem('S', 1) },
    { id:'bag_E', name:'E급 기본가방',     price:30000,      unit:'개', note:'+8칸/무게+7kg', buildFn: () => buildBagItem('bag_E', 1) },
    { id:'bag_D', name:'D급 멀티백',       price:70000,      unit:'개', note:'+12칸/무게+10kg/무게효율5%', buildFn: () => buildBagItem('bag_D', 1) },
    { id:'bag_C', name:'C급 마정백팩',     price:270000,     unit:'개', note:'+16칸/무게+15kg/무게효율10%', buildFn: () => buildBagItem('bag_C', 1) },
    { id:'bag_B', name:'B급 원정필드백',   price:750000,     unit:'개', note:'+20칸/무게+20kg/무게효율15%', buildFn: () => buildBagItem('bag_B', 1) },
    { id:'bag_A', name:'A급 게이트백팩',   price:2300000,    unit:'개', note:'+24칸/무게+25kg/무게효율20%', buildFn: () => buildBagItem('bag_A', 1) },
    { id:'bag_S', name:'S급 마정공간백팩', price:7500000,    unit:'개', note:'+28칸/무게+30kg/무게효율30%', buildFn: () => buildBagItem('bag_S', 1) },
    { id:'tent_E', name:'E급 기본원터치텐트',   price:130000,    unit:'개', note:'효과없음 (3kg)', buildFn: () => buildTentItem('E', 1) },
    { id:'tent_D', name:'D급 필드원터치텐트',   price:350000,    unit:'개', note:'야영효율+5% (6kg)', buildFn: () => buildTentItem('D', 1) },
    { id:'tent_C', name:'C급 게이트필드텐트',   price:870000,    unit:'개', note:'야영효율+10% (9kg)', buildFn: () => buildTentItem('C', 1) },
    { id:'tent_B', name:'B급 럭셔리야영텐트',   price:2300000,   unit:'개', note:'야영효율+15% (12kg)', buildFn: () => buildTentItem('B', 1) },
    { id:'tent_A', name:'A급 스타야영지',       price:7200000,   unit:'개', note:'야영효율+20% (15kg)', buildFn: () => buildTentItem('A', 1) },
    { id:'tent_S', name:'S급 게이트펜션야영지', price:38000000,  unit:'개', note:'야영효율+30% (20kg)', buildFn: () => buildTentItem('S', 1) },
  ],
};
const SHOP_CATEGORIES = [
  { id:'convenience',  label:'🏪 편의점',    desc:'식료품, 음료, 기본 보급품.' },
  { id:'department',   label:'🏬 백화점',    desc:'의류, 생활용품, 일반 장비.' },
  { id:'hunterstreet', label:'🗡️ 헌터거리',  desc:'헌터 전용 상점가. 수리점·대장간·소모품 등.' },
  { id:'equip',        label:'⚔️ 장비상점',  desc:'무기, 방어구, 헌터 전용 장비 구매·판매.' },
  { id:'huntermarket', label:'🏷️ 헌터마켓',  desc:'헌터 간 중고장비 거래 플랫폼. 스킬북은 협회 중앙 경매장 전용.' },
  { id:'blackmarket',  label:'🖤 블랙마켓',  desc:'불법 거래소. 수수료 0%·세금 0%. 적발 위험 있음.' },
];
const HUNTER_STREET_SUBS = [
  { id:'vehicle',    label:'헌터 차량 판매점', desc:'전술 차량, 오토바이, 장갑차 등. (예정)' },
  { id:'equip',      label:'⚔️ 장비상점',     desc:'무기, 방어구, 헌터 전용 장비 구매·판매.' },
  { id:'repair',     label:'수리점',           desc:'무기/방어구 내구도 회복. E등급 무료. 수리마다 최대내구도 -1 (최소 80).' },
  { id:'forge',      label:'대장간',           desc:'같은 등급 마정석(순도 80~100%)으로 장비 강화. 실패 시 마정석 소멸, 장비 유지.' },
  { id:'potion',     label:'물약 상점',        desc:'회복약, 마나포션, 버프 아이템. (예정)' },
  { id:'consumable', label:'소모품 상점',      desc:'곡괭이, 야영 보급품, 기타 소모품.' },
  { id:'material',   label:'재료 상점',        desc:'일반·희귀 재료 구매 및 판매. 검색·필터 지원.' },
];
function shopItemsHtml(items, cat) {
  if (!items || !items.length) return '<div class="gb-sub">현재 판매 중인 상품이 없다.</div>';
  const inv = getInventory();
  return items.map(it => {
    const canAfford = Number(inv.gold || 0) >= it.price;
    return `<div class="gb-unit">
      <div class="gb-unit-top">
        <div><strong>${escapeHtml(it.name)}</strong> ${it.note ? `<span class="gb-sub">${escapeHtml(it.note)}</span>` : ''}</div>
        <div><button class="gb-btn tiny${canAfford ? '' : ' danger'}" data-shop-buy="${escapeHtml(cat)}:${escapeHtml(it.id)}" ${canAfford ? '' : 'disabled'}>₩${Number(it.price).toLocaleString('en-US')} / ${escapeHtml(it.unit)}</button></div>
      </div>
    </div>`;
  }).join('');
}

const MAT_SHOP_BUY_MARKUP  = 1.2;   // 상점 판매가 = suggestedPrice × 1.2 (매입 없음)
const MAT_SHOP_PAGE_SIZE   = 20;

function renderMaterialShopHtml() {
  const inv      = getInventory();
  const gold     = Number(inv.gold || 0);
  const query    = String(model.state.shopMatQuery || '').trim().toLowerCase();
  const rankF    = String(model.state.shopMatRank  || '');
  const tierF    = String(model.state.shopMatTier  || '');
  const page     = Number(model.state.shopMatPage  || 0);

  // ── BUY tab (희귀재료 전용, 120% 가격) ──────────────────────────────────
  const rareCatalog = getRareMaterialCatalog();

  let buyPool = rareCatalog.map(it => ({
    _item: it,
    name:  it.name || it.id || '',
    rank:  String(it.rank || 'E').toUpperCase(),
    tier:  it.priceTier || '',
    trait: it.traitName || '',
    price: Math.ceil((it.suggestedPrice || 0) * MAT_SHOP_BUY_MARKUP),
    suggestedPrice: it.suggestedPrice || 0,
  }));

  // Apply filters
  if (query) {
    buyPool = buyPool.filter(b => {
      const traitKo = (b._item.traitName || RARE_TRAIT_LABELS[b._item.traitId || ''] || '').toLowerCase();
      const noteLo  = (b._item.note || '').toLowerCase();
      return (
        b.name.toLowerCase().includes(query) ||
        b.trait.toLowerCase().includes(query) ||
        traitKo.includes(query) ||
        noteLo.includes(query) ||
        (b._item.sourceMonsterName || '').toLowerCase().includes(query) ||
        (b._item.species || '').toLowerCase().includes(query)
      );
    });
  }
  if (rankF) buyPool = buyPool.filter(b => b.rank === rankF);
  if (tierF) buyPool = buyPool.filter(b => b.tier === tierF);

  const total    = buyPool.length;
  const pages    = Math.ceil(total / MAT_SHOP_PAGE_SIZE) || 1;
  const safePage = Math.max(0, Math.min(page, pages - 1));
  const slice    = buyPool.slice(safePage * MAT_SHOP_PAGE_SIZE, (safePage + 1) * MAT_SHOP_PAGE_SIZE);

  const rankOptions = ['','E','D','C','B','A','S'].map(r =>
    `<option value="${r}" ${rankF === r ? 'selected' : ''}>${r || '전체 등급'}</option>`).join('');
  const tierOptions = [['','전체 티어'],['tier1','tier1 — 공격핵심'],['tier2','tier2 — 속성/상태'],['tier3','tier3 — 방어/치유'],['tier4','tier4 — 저항/유틸']].map(([v,l]) =>
    `<option value="${v}" ${tierF === v ? 'selected' : ''}>${l}</option>`).join('');

  const searchBar = `
    <div class="gb-panel">
      <form id="gb-mat-search-form" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
        <input id="gb-mat-query" class="gb-input" type="text" placeholder="이름·특성·종족 검색…" value="${escapeHtml(query)}" style="flex:1;min-width:140px;">
        <select id="gb-mat-rank" class="gb-input" style="width:110px;">${rankOptions}</select>
        <select id="gb-mat-tier" class="gb-input" style="width:160px;">${tierOptions}</select>
        <button type="submit" class="gb-btn tiny">🔍 검색</button>
      </form>
      <div class="gb-sub" style="margin-top:4px;">희귀재료 전용 · 결과: ${total}개 / ${pages}페이지 | 구매가 = 기준가 × ${Math.round(MAT_SHOP_BUY_MARKUP * 100)}%</div>
    </div>`;

  let itemsHtml = '';
  if (!slice.length) {
    itemsHtml = '<div class="gb-panel"><div class="gb-sub">검색 결과가 없다.</div></div>';
  } else {
    const rows = slice.map(b => {
      const canAfford = gold >= b.price;
      const tierBadge  = b.tier  ? ` <span class="gb-badge">${escapeHtml(b.tier)}</span>` : '';
      const traitBadge = b.trait ? ` <span class="gb-sub">${escapeHtml(b.trait)}</span>` : '';
      const key = `rare:${escapeHtml(b._item.id || '')}`;
      return `<div class="gb-unit">
        <div class="gb-unit-top">
          <div>
            <strong>${escapeHtml(b.name)}</strong>
            <span class="gb-badge">${escapeHtml(b.rank)}</span>
            <span class="gb-badge">희귀</span>${tierBadge}${traitBadge}
          </div>
          <div>
            <button class="gb-btn tiny${canAfford ? '' : ' danger'}" data-mat-buy="${key}" ${canAfford ? '' : 'disabled'}>
              ₩${b.price.toLocaleString('en-US')}
            </button>
          </div>
        </div>
      </div>`;
    }).join('');
    itemsHtml = `<div class="gb-panel">${rows}</div>`;
  }

  const pageBar = pages > 1 ? `
    <div class="gb-btn-row">
      <button class="gb-btn tiny" data-mat-page="${safePage - 1}" ${safePage <= 0 ? 'disabled' : ''}>◀ 이전</button>
      <span class="gb-sub"> ${safePage + 1} / ${pages} </span>
      <button class="gb-btn tiny" data-mat-page="${safePage + 1}" ${safePage >= pages - 1 ? 'disabled' : ''}>다음 ▶</button>
    </div>` : '';

  return searchBar + itemsHtml + pageBar;
}

// ── 장비상점 ─────────────────────────────────────────────────────────────────
function renderEquipShopHtml() {
  const inv = getInventory();
  const gold = Number(inv.gold || 0);
  const eqs = model.db.equipments || [];
  const selRank = model.state.shopEquipRank || '';
  const selPart = model.state.shopEquipPart || '';

  const rankBtns = ['', ...GRADE_ORDER].map(r =>
    `<button class="gb-btn ${selRank===r?'primary':''}" data-equip-shop-rank="${escapeHtml(r)}">${r||'전체'}</button>`
  ).join('');
  const partBtns = ['', ...EQUIP_PARTS].map(p =>
    `<button class="gb-btn ${selPart===p?'primary':''}" data-equip-shop-part="${escapeHtml(p)}">${p ? EQUIP_PART_LABELS[p] : '전체'}</button>`
  ).join('');

  const filtered = eqs.filter(e =>
    (!selRank || e.rank === selRank) && (!selPart || e.part === selPart)
  );

  const itemsHtml = filtered.length === 0
    ? '<div class="gb-sub">조건에 맞는 장비가 없다.</div>'
    : filtered.map(e => {
        const price = Number(e.price || calcEquipEnhancedPrice(calcEquipBasePrice(e.rank, e.part), e.enhance||0, e.rank));
        const canAfford = gold >= price;
        const traitTags = (e.traits||[]).map(t => `<span class="gb-badge">${escapeHtml(equipTraitDisplay(t, e.rank))}</span>`).join(' ');
        const atkLine = e.part==='weapon' ? `ATK+${e.atk||WEAPON_BASE_ATK[e.rank]||0}` : e.part==='subweapon' ? `물리방어+${e.pdef||0} / ATK${-Math.ceil((e.pdef||0)/2)}` : e.part==='armor' ? `물리방어+${e.pdef||0} / 마법방어+${e.mdef||0}${e.resistType?` / ${escapeHtml(EQUIP_TRAIT_LABELS[''+e.resistType]||e.resistType)} 저항 ${e.resistPct||0}%`:''}` : e.part==='accessory' ? (e.traits&&e.traits.length ? `특성: ${(e.traits||[]).map(t=>equipTraitDisplay(t,e.rank)).join(', ')}` : '특성 없음') : '';
        const fmt = n => n >= 1e8 ? `${(n/1e8).toFixed(2)}억` : n >= 10000 ? `${Math.round(n/10000)}만` : n.toLocaleString('en-US');
        return `<div class="gb-unit">
          <div class="gb-unit-top">
            <div>
              <strong>${escapeHtml(e.name)}</strong>
              <span class="gb-badge">${escapeHtml(e.rank)}</span>
              <span class="gb-badge">${escapeHtml(EQUIP_PART_LABELS[e.part]||e.part)}</span>
              ${e.enhance>0?`<span class="gb-badge">+${e.enhance}</span>`:''}
              ${traitTags}
              <div class="gb-sub">${escapeHtml(atkLine)} | 내구도 ${e.durability??100}/${e.maxDurability??100}</div>
              <div class="gb-sub">${escapeHtml(e.note||'')}</div>
            </div>
            <div>
              <button class="gb-btn tiny${canAfford?'':' danger'}" data-equip-shop-buy="${escapeHtml(e.id)}" ${canAfford?'':'disabled'}>
                ₩${fmt(price)}
              </button>
            </div>
          </div>
        </div>`;
      }).join('');

  return `
    <div class="gb-panel">
      <div class="gb-section-title">⚔️ 장비상점</div>
      <div class="gb-sub">무기, 방어구, 보조무기, 악세서리 구매 (신품 +0)</div>
      <div class="gb-sub">소지금: ₩${gold.toLocaleString('en-US')}</div>
      <div class="gb-btn-row" style="margin-top:6px;flex-wrap:wrap;">
        <span class="gb-sub" style="align-self:center;">등급:</span> ${rankBtns}
      </div>
      <div class="gb-btn-row" style="flex-wrap:wrap;">
        <span class="gb-sub" style="align-self:center;">부위:</span> ${partBtns}
      </div>
    </div>
    <div class="gb-panel">${itemsHtml}</div>`;
}

// ── 헌터마켓 (중고장비 거래소) ───────────────────────────────────────────────
const HM_NPC_MAX = 16;

// NPC 중고장비 씨딩: 다양한 등급·부위·내구도로 16개 채움
function seedNpcUsedListings() {
  if (!Array.isArray(model.db.hmUsedListings)) model.db.hmUsedListings = [];
  const npcCount = model.db.hmUsedListings.filter(l => l.isNpc).length;
  const needed = HM_NPC_MAX - npcCount;
  if (needed <= 0) return;
  const grades = ['E','E','E','D','D','D','C','C','B'];
  const parts = EQUIP_PARTS;
  for (let i = 0; i < needed; i++) {
    const rank = grades[Math.floor(Math.random() * grades.length)];
    const part = parts[Math.floor(Math.random() * parts.length)];
    // 현재 내구도: 사용감 있는 중고장비 (40~95 범위)
    const dur = Math.floor(Math.random() * 56) + 40;      // 40~95
    // 최대내구도: 게임 규칙상 최소 80 (EQUIP_MAX_DURABILITY_FLOOR), 최대 99 (100은 새 장비라 헌터마켓 등록 불가)
    const maxDur = Math.max(80, Math.min(99, dur + Math.floor(Math.random() * 10))); // 80~99
    // 강화: 가끔 +1~+3
    const enhance = Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 1 : 0;
    // 특성: 30% 확률로 1개
    const hasTrait = Math.random() < 0.30;
    const traits = hasTrait ? [EQUIP_TRAIT_TYPES[Math.floor(Math.random() * EQUIP_TRAIT_TYPES.length)]] : [];
    const maxInfuseBase = EQUIP_MAX_INFUSE[part] || 1;
    const maxInfuse = hasTrait ? maxInfuseBase + 1 : maxInfuseBase;
    const traitName = hasTrait ? (EQUIP_TRAIT_LABELS[traits[0]] || traits[0]) : '';
    const basePrice = calcEquipBasePrice(rank, part);
    const enhancedBase = enhance > 0 ? calcEquipEnhancedPrice(basePrice, enhance, rank) : basePrice;
    const traitBonus = hasTrait ? Math.round((RARE_MATERIAL_BASE_WON[rank] || RARE_MATERIAL_BASE_WON.E) * 1.25) : 0;
    const marketPrice = enhancedBase + traitBonus;
    const conditionMul = calcUsedEquipConditionMul(dur, maxDur);
    const usedPrice = Math.round(marketPrice * conditionMul);
    const uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + i;
    const nameSuffixes = { weapon:['검','창','활','완드','도끼'], armor:['갑옷','로브','체인메일','플레이트'], subweapon:['방패','단검'], accessory:['반지','목걸이','팔찌'] };
    const suffArr = nameSuffixes[part] || [EQUIP_PART_LABELS[part]||part];
    const suff = suffArr[Math.floor(Math.random() * suffArr.length)];
    const enhLabel = enhance > 0 ? ` +${enhance}` : '';
    const traitLabel = hasTrait ? ` [${traitName}]` : '';
    const item = {
      id: `npc_used_${rank.toLowerCase()}_${part}_${uid}`,
      name: `${rank}급 ${suff}${enhLabel}${traitLabel}`,
      part, rank, enhance, infuse: traits.length, maxInfuse, traits,
      durability: dur, maxDurability: maxDur, price: marketPrice,
      category: 'equipment', isDropped: true, stackable: false,
      unitWeightG: EQUIP_WEIGHT_G[part] || 1000,
      stackKey: `equipment:npc_used_${uid}`,
      note: `NPC 중고 등록${hasTrait ? `. 특성: ${traitName}` : ''}`,
      atk: part === 'weapon' ? (WEAPON_BASE_ATK[rank] || 5) : 0,
      pdef: part === 'armor' ? Math.round((ARMOR_STAT_BY_RANK[rank]||{defRange:[0,5]}).defRange[1] * 0.5) : (part === 'subweapon' ? Math.round((ARMOR_STAT_BY_RANK[rank]||{defRange:[0,5]}).defRange[1] * 0.25) : 0),
      mdef: part === 'armor' ? Math.round((ARMOR_STAT_BY_RANK[rank]||{defRange:[0,5]}).defRange[1] * 0.3) : 0,
      mainStat: part === 'weapon' ? (Math.random() < 0.5 ? 'str' : 'int') : (part === 'armor' ? 'con' : 'str'),
      resistType: '', resistPct: 0
    };
    model.db.hmUsedListings.push({
      id: `hm_npc_${uid}`, item, usedPrice, conditionPct: Math.round(conditionMul * 100), isNpc: true, listedAt: Date.now()
    });
  }
}

function renderHunterMarketHtml() {
  const inv = getInventory();
  const gold = Number(inv.gold || 0);
  const tab = model.state.shopHmTab || 'sell';
  const selRank = model.state.shopHmRank || '';
  const selPart = model.state.shopHmPart || '';

  const tabBar = `
    <div class="gb-btn-row">
      <button class="gb-btn${tab==='sell'?' primary':''}" data-hm-tab="sell">🔁 내 장비 판매</button>
      <button class="gb-btn${tab==='browse'?' primary':''}" data-hm-tab="browse">🔍 중고 장비 검색</button>
    </div>`;

  const notice = `<div class="gb-panel" style="border-color:#6366f1;">
    <div style="color:#6366f1;font-weight:700;">🏷️ 헌터마켓 — 중고장비 전용</div>
    <div class="gb-sub">헌터 간 직거래 플랫폼. 사용/수리된 장비를 등록·거래할 수 있다.</div>
    <div class="gb-sub" style="color:#94a3b8;">⚠️ 스킬북은 헌터마켓에서 거래 불가. <strong>협회 중앙 경매장</strong>에서만 구매·판매 가능.</div>
    <div class="gb-sub">소지금: ₩${gold.toLocaleString('en-US')}</div>
  </div>`;

  if (tab === 'sell') {
    // Show player's owned equipment in inventory — 내구도 100짜리 (새 것)는 중고 등록 불가
    const ownedEquip = (inv.items||[]).filter(it => it.category === 'equipment');
    const usedEquip = ownedEquip.filter(it => {
      const dur = Number(it.durability ?? 100);
      const maxDur = Number(it.maxDurability ?? 100);
      return !(dur === 100 && maxDur === 100);
    });
    if (!ownedEquip.length) {
      return notice + tabBar + '<div class="gb-panel"><div class="gb-sub">인벤토리에 장비가 없다. 장비상점에서 구매하거나 게이트 보상으로 획득하자.</div></div>';
    }
    if (!usedEquip.length) {
      return notice + tabBar + '<div class="gb-panel"><div class="gb-sub">내구도 100%의 새 장비는 헌터마켓에 올릴 수 없다. 사용·수리 이력이 있는 장비만 등록 가능.</div></div>';
    }
    const rows = usedEquip.map(it => {
      const dur = Number(it.durability ?? 100);
      const maxDur = Number(it.maxDurability ?? 100);
      const basePrice = Number(it.price || calcEquipBasePrice(it.rank||'E', it.part||'weapon'));
      // 강화된 장비면 강화 프리미엄 포함
      const enhancedBase = it.enhance > 0 ? calcEquipEnhancedPrice(basePrice, it.enhance, it.rank||'E') : basePrice;
      const conditionMul = calcUsedEquipConditionMul(dur, maxDur);
      const sellPrice = Math.round(enhancedBase * conditionMul);
      const fmt = n => n >= 1e8 ? `${(n/1e8).toFixed(2)}억` : n >= 10000 ? `${Math.round(n/10000)}만` : n.toLocaleString('en-US');
      const durColor = dur < 30 ? '#ef4444' : dur < 60 ? '#f97316' : '#22c55e';
      const statParts = [];
      if (Number(it.atk||0) > 0)  statParts.push(`⚔️ ATK +${it.atk}`);
      if (Number(it.pdef||0) > 0) statParts.push(`🛡️ 물리방어 +${it.pdef}`);
      if (Number(it.mdef||0) > 0) statParts.push(`✨ 마법방어 +${it.mdef}`);
      if (it.mainStat)             statParts.push(`주스탯: ${it.mainStat.toUpperCase()}`);
      if ((it.traits||[]).length)  statParts.push(`특성: ${(it.traits||[]).map(t=>EQUIP_TRAIT_LABELS[t]||t).join(', ')}`);
      const statsLine = statParts.length
        ? `<div class="gb-sub" style="color:#93c5fd;margin-top:2px;">${escapeHtml(statParts.join('  ·  '))}</div>`
        : '';
      const tooltipText = escapeHtml(hmItemTooltip(it));
      return `<div class="gb-unit gb-inv-tooltip-wrap" style="position:relative;overflow:visible;">
        <div class="gb-unit-top">
          <div>
            <strong>${escapeHtml(it.name||it.id)}</strong>
            <span class="gb-badge">${escapeHtml(it.rank||'E')}</span>
            <span class="gb-badge">${escapeHtml(EQUIP_PART_LABELS[it.part||'weapon']||it.part||'')}</span>
            ${it.enhance>0?`<span class="gb-badge">+${it.enhance}</span>`:''}
            <div class="gb-sub">내구도 <span style="color:${durColor};font-weight:700;">${dur}</span>/${maxDur} | 최대내구도 이력: ${100-maxDur}회 수리</div>
            ${statsLine}
            <div class="gb-sub">예상 판매가: ₩${fmt(sellPrice)} (시세 ${Math.round(conditionMul*100)}%)</div>
          </div>
          <div>
            <button class="gb-btn tiny" data-hm-sell="${escapeHtml(inventoryItemKey(it))}:${sellPrice}">판매 ₩${fmt(sellPrice)}</button>
          </div>
        </div>
        <div class="gb-inv-slot-tooltip" style="white-space:pre-line;z-index:300;">${tooltipText}</div>
      </div>`;
    }).join('');
    return notice + tabBar + `<div class="gb-panel">${rows}</div>`;
  }

  // browse tab: hmUsedListings (NPC + player) 기반 중고 매물
  if (!Array.isArray(model.db.hmUsedListings)) model.db.hmUsedListings = [];
  seedNpcUsedListings();
  const allListings = model.db.hmUsedListings;
  const rankBtns = ['', ...GRADE_ORDER].map(r => `<button class="gb-btn ${selRank===r?'primary':''}" data-hm-rank="${escapeHtml(r)}">${r||'전체'}</button>`).join('');
  const partBtns = ['', ...EQUIP_PARTS].map(p => `<button class="gb-btn ${selPart===p?'primary':''}" data-hm-part="${escapeHtml(p)}">${p ? EQUIP_PART_LABELS[p] : '전체'}</button>`).join('');
  const filtered = allListings.filter(l => {
    const it = l.item;
    const maxDur = Number(it.maxDurability ?? 100);
    // 헌터마켓에는 최대내구도 100 (새 장비)는 등록 불가 — 80~99만 허용
    return maxDur >= 80 && maxDur < 100 && (!selRank || (it.rank||'E') === selRank) && (!selPart || it.part === selPart);
  });
  const fmt = n => n >= 1e8 ? `${(n/1e8).toFixed(2)}억` : n >= 10000 ? `${Math.round(n/10000)}만` : n.toLocaleString('en-US');
  // 장비 상세 툴팁 헬퍼
  function hmItemTooltip(e) {
    const lines = [`${e.name}${e.rank ? ` [${e.rank}급]` : ''}`, `부위: ${EQUIP_PART_LABELS[e.part||'weapon']||e.part||''}  |  내구도: ${Number(e.durability??100)}/${Number(e.maxDurability??100)}`];
    if (e.enhance > 0) lines.push(`강화: +${e.enhance}`);
    if (Number(e.atk||0) > 0) lines.push(`ATK: +${e.atk}`);
    if (Number(e.pdef||0) > 0) lines.push(`물리방어: +${e.pdef}`);
    if (Number(e.mdef||0) > 0) lines.push(`마법방어: +${e.mdef}`);
    if (e.mainStat) lines.push(`주 스탯: ${e.mainStat.toUpperCase()}`);
    if (Array.isArray(e.traits) && e.traits.length) lines.push(`특성: ${e.traits.map(t=>EQUIP_TRAIT_LABELS[t]||t).join(', ')}`);
    if (e.resistType && e.resistPct) lines.push(`${EQUIP_TRAIT_LABELS[e.resistType]||e.resistType} 저항 ${e.resistPct}%`);
    if (e.maxInfuse) lines.push(`주입 최대 ${e.maxInfuse}회 (현재 ${e.infuse||0}회)`);
    if (e.note) lines.push(`메모: ${e.note}`);
    return lines.join('\n');
  }
  const browseHtml = filtered.length === 0
    ? '<div class="gb-sub">등록된 중고 장비 없음.</div>'
    : filtered.map(l => {
        const e = l.item;
        const dur = Number(e.durability ?? 100);
        const maxDur = Number(e.maxDurability ?? 100);
        const usedPrice = l.usedPrice;
        const durColor = dur < 30 ? '#ef4444' : dur < 60 ? '#f97316' : '#22c55e';
        const canAfford = gold >= usedPrice;
        const npcBadge = l.isNpc ? '<span class="gb-badge">NPC</span>' : '<span class="gb-badge" style="background:#0284c7;">플레이어</span>';
        const traitTxt = (e.traits||[]).length ? `<span class="gb-badge" style="background:#7c3aed;">${(e.traits||[]).map(t=>EQUIP_TRAIT_LABELS[t]||t).join(', ')}</span>` : '';
        // 스탯 항상 표시
        const statParts = [];
        if (Number(e.atk||0) > 0)  statParts.push(`⚔️ ATK +${e.atk}`);
        if (Number(e.pdef||0) > 0) statParts.push(`🛡️ 물리방어 +${e.pdef}`);
        if (Number(e.mdef||0) > 0) statParts.push(`✨ 마법방어 +${e.mdef}`);
        if (e.mainStat)             statParts.push(`주스탯: ${e.mainStat.toUpperCase()}`);
        if (e.enhance > 0)          statParts.push(`강화: +${e.enhance}`);
        if (e.maxInfuse)            statParts.push(`주입: ${e.infuse||0}/${e.maxInfuse}회`);
        const statsLine = statParts.length
          ? `<div class="gb-sub" style="color:#93c5fd;margin-top:2px;">${escapeHtml(statParts.join('  ·  '))}</div>`
          : '';
        const tooltipText = escapeHtml(hmItemTooltip(e));
        return `<div class="gb-unit gb-inv-tooltip-wrap" style="position:relative;overflow:visible;"><div class="gb-unit-top">
          <div>
            <strong>${escapeHtml(e.name)}</strong>
            <span class="gb-badge">${escapeHtml(e.rank||'E')}</span>
            <span class="gb-badge">${escapeHtml(EQUIP_PART_LABELS[e.part]||e.part||'')}</span>
            ${npcBadge} ${traitTxt}
            <span style="color:${durColor};font-size:0.85em;"> 내구도 ${dur}/${maxDur}</span>
            ${statsLine}
            <div class="gb-sub">중고가 ${l.conditionPct||Math.round(calcUsedEquipConditionMul(dur,maxDur)*100)}% (기준가 ₩${fmt(Number(e.price||0))})</div>
          </div>
          <button class="gb-btn tiny${canAfford?'':' danger'}" data-hm-browse-buy="${escapeHtml(l.id)}:${usedPrice}" ${canAfford?'':'disabled'}>
            중고 ₩${fmt(usedPrice)}
          </button>
        </div>
        <div class="gb-inv-slot-tooltip" style="white-space:pre-line;z-index:300;">${tooltipText}</div>
        </div>`;
      }).join('');
  return notice + tabBar + `
    <div class="gb-panel">
      <button class="gb-btn" data-hm-refresh style="margin-bottom:6px;">🔄 NPC 목록 갱신</button>
      <div class="gb-btn-row" style="flex-wrap:wrap;">
        <span class="gb-sub" style="align-self:center;">등급:</span> ${rankBtns}
      </div>
      <div class="gb-btn-row" style="flex-wrap:wrap;">
        <span class="gb-sub" style="align-self:center;">부위:</span> ${partBtns}
      </div>
    </div>
    <div class="gb-panel">${browseHtml}</div>`;
}

// ── 블랙마켓 ─────────────────────────────────────────────────────────────────
const BM_DETECT_RATE = 0.02;   // 아이템 1개당 적발 확률 2%
const BM_FINE_RATE   = 0.50;   // 적발 시 벌금 = 거래액 × 50% (아이템은 압수·거래 무효)

function renderBlackMarketHtml() {
  const inv  = getInventory();
  const gold = Number(inv.gold || 0);
  const tab  = model.state.shopBmTab || 'rare';

  const tabBar = `
    <div class="gb-btn-row">
      <button class="gb-btn${tab === 'rare' ? ' active' : ''}" data-bm-tab="rare">💎 희귀재료</button>
      <button class="gb-btn${tab === 'gear' ? ' active' : ''}" data-bm-tab="gear">⚔️ 장비 매입</button>
    </div>`;

  const warning = `
    <div class="gb-panel" style="border-color:#f97316;">
      <div style="color:#f97316;font-weight:700;">🚫 불법 거래소 — 협회 신고 없이 처분</div>
      <div class="gb-sub" style="margin-top:4px;">수수료 0% · 세금 0% · 시장가 100% 보장 · 기록 없음</div>
      <div class="gb-sub" style="color:#ef4444;">아이템 1개당 ${(BM_DETECT_RATE * 100).toFixed(0)}% 적발 · 적발 시 아이템 압수·거래 무효 + 벌금 거래액 ${(BM_FINE_RATE * 100).toFixed(0)}%</div>
      <div class="gb-sub">소지금: ₩${gold.toLocaleString('en-US')}</div>
    </div>`;

  if (tab === 'rare') {
    const rareItems = (inv.items || []).filter(it => it.category === 'rareMaterial' && Number(it.suggestedPrice || 0) > 0);
    if (!rareItems.length) {
      return warning + tabBar + '<div class="gb-panel"><div class="gb-sub">판매 가능한 희귀재료가 없다. (기준가 있는 희귀재료만 판매 가능)</div></div>';
    }
    const rows = rareItems.map(it => {
      const sp  = Number(it.suggestedPrice || 0);
      const cnt = Number(it.count || 1);
      const val = sp * cnt;
      const pDetect = (1 - Math.pow(1 - BM_DETECT_RATE, cnt)) * 100;
      const fine    = Math.floor(val * BM_FINE_RATE);
      const ikey    = inventoryItemKey(it);
      return `<div class="gb-unit">
        <div class="gb-unit-top">
          <div>
            <strong>${escapeHtml(it.name || '희귀재료')}</strong>
            <span class="gb-badge">${escapeHtml(it.rank || '')}</span>
            <span class="gb-sub"> ×${cnt} | ₩${sp.toLocaleString('en-US')}/개 → 총 ₩${val.toLocaleString('en-US')}</span>
            <div class="gb-sub" style="color:#f97316;">적발 확률 ${pDetect.toFixed(1)}% | 적발 시 압수·무효 + 벌금 -₩${fine.toLocaleString('en-US')}</div>
          </div>
          <div style="display:flex;gap:4px;">
            <button class="gb-btn tiny" data-bm-sell="${escapeHtml(ikey)}:one">1개</button>
            <button class="gb-btn tiny danger" data-bm-sell="${escapeHtml(ikey)}:all">전부</button>
          </div>
        </div>
      </div>`;
    }).join('');
    return warning + tabBar + `<div class="gb-panel">${rows}</div>`;
  }

  // gear tab — 공용 인벤에서 새 장비 선택 (최대내구도 100 & isUsed 없는 것만)
  const newGearItems = (inv.items || []).filter(it =>
    it.category === 'equipment' &&
    Number(it.maxDurability ?? 100) === 100 &&
    !it.isUsed
  );
  if (!newGearItems.length) {
    return warning + tabBar + `<div class="gb-panel"><div class="gb-sub">공용 인벤에 블랙마켓 매입 가능한 새 장비가 없다. (최대내구도 100 & 미사용 장비만 매입 가능. 중고 장비는 매입 불가.)</div></div>`;
  }
  const gearRows = newGearItems.map(it => {
    const ikey = inventoryItemKey(it);
    const mktPrice = Number(it.price || calcEquipBasePrice(it.rank||'E', it.part||'weapon'));
    const enhPrice = it.enhance > 0 ? calcEquipEnhancedPrice(mktPrice, it.enhance, it.rank||'E') : mktPrice;
    const pDetect = (1 - Math.pow(1 - BM_DETECT_RATE, 1)) * 100;
    const fine = Math.floor(enhPrice * BM_FINE_RATE);
    const fmt = n => n >= 1e8 ? `${(n/1e8).toFixed(2)}억` : n >= 10000 ? `${Math.round(n/10000)}만` : n.toLocaleString('en-US');
    return `<div class="gb-unit">
      <div class="gb-unit-top">
        <div>
          <strong>${escapeHtml(it.name||it.id)}</strong>
          <span class="gb-badge">${escapeHtml(it.rank||'E')}</span>
          <span class="gb-badge">${escapeHtml(EQUIP_PART_LABELS[it.part||'weapon']||it.part||'')}</span>
          ${it.enhance>0?`<span class="gb-badge">+${it.enhance}</span>`:''}
          <div class="gb-sub">시장가 ₩${fmt(enhPrice)} | 내구도 ${Number(it.durability??100)}/${Number(it.maxDurability??100)}</div>
          <div class="gb-sub" style="color:#f97316;">적발 확률 ${pDetect.toFixed(1)}% | 적발 시 압수·무효 + 벌금 -₩${fine.toLocaleString('en-US')}</div>
        </div>
        <button class="gb-btn tiny danger" data-bm-gear-inv="${escapeHtml(ikey)}:${enhPrice}">⚠️ 매입 ₩${fmt(enhPrice)}</button>
      </div>
    </div>`;
  }).join('');
  return warning + tabBar + `<div class="gb-panel">
    <div class="gb-sub" style="margin-bottom:6px;">공용 인벤의 새 장비(미사용)를 시장가 100%에 매입. 소득세 기록 없음. <span style="color:#ef4444;">중고 장비(최대내구도 깎인 것) 매입 불가.</span></div>
    ${gearRows}
  </div>`;
}

// ── 수리점 ────────────────────────────────────────────────────────────────────
function renderRepairShopHtml() {
  const inv = getInventory();
  const gold = Number(inv.gold || 0);
  const ownedEquip = (inv.items || []).filter(it => it.category === 'equipment');
  const selKey = model.state.shopRepairSel || '';

  const listHtml = ownedEquip.length === 0
    ? '<div class="gb-sub">수리 가능한 장비가 없다. 장비상점에서 구매하거나 게이트 보상으로 획득하자.</div>'
    : ownedEquip.map(it => {
        const ikey = inventoryItemKey(it);
        const dur = Number(it.durability ?? 100);
        const maxDur = Number(it.maxDurability ?? 100);
        const isSelected = selKey === ikey;
        const durColor = dur < 30 ? '#ef4444' : dur < 60 ? '#f97316' : '#22c55e';
        return `<button class="gb-list-item ${isSelected?'is-active':''}" data-repair-sel="${escapeHtml(ikey)}">
          <strong>${escapeHtml(it.name||it.id)}</strong>
          <span class="gb-badge">${escapeHtml(it.rank||'E')}</span>
          <span class="gb-badge">${escapeHtml(EQUIP_PART_LABELS[it.part||'weapon']||it.part||'')}</span>
          <span class="gb-sub"> 내구도 <span style="color:${durColor};">${dur}</span>/${maxDur}</span>
        </button>`;
      }).join('');

  // Detail panel for selected item
  let detailHtml = '<div class="gb-sub">왼쪽 목록에서 수리할 장비를 선택하세요.</div>';
  if (selKey) {
    const it = ownedEquip.find(x => inventoryItemKey(x) === selKey);
    if (it) {
      const dur = Number(it.durability ?? 100);
      const maxDur = Number(it.maxDurability ?? 100);
      const rank = it.rank || 'E';
      const part = it.part || 'weapon';
      const lostToMax = maxDur - dur;
      const feeToFull = calcRepairFee(rank, part, lostToMax);
      const fmt = n => n >= 1e8 ? `${(n/1e8).toFixed(2)}억원` : n >= 10000 ? `${Math.round(n/10000)}만원` : `${n.toLocaleString('en-US')}원`;
      const canAfford = gold >= feeToFull;
      const maxDurAfter = Math.max(EQUIP_MAX_DURABILITY_FLOOR, maxDur - 1);
      detailHtml = `
        <div class="gb-section-title">🔧 ${escapeHtml(it.name||it.id)} 수리</div>
        <div class="gb-sub">등급: <strong>${escapeHtml(rank)}</strong> | 부위: <strong>${escapeHtml(EQUIP_PART_LABELS[part]||part)}</strong></div>
        <div class="gb-sub">현재 내구도: <strong>${dur} / ${maxDur}</strong></div>
        <div class="gb-sub">수리 후 최대내구도 예상: <strong>${maxDurAfter}</strong> (매 수리마다 -1, 최소 ${EQUIP_MAX_DURABILITY_FLOOR})</div>
        <div class="gb-sub" style="margin-top:4px;">E등급 수리: 무료 (훈련 장려) | 무기: 기본 수리비 ×2</div>

        <div style="margin-top:8px;">
          <div class="gb-sub">최대내구도(${maxDur})까지 전체 수리:</div>
          <div style="margin-top:4px;">
            <strong>수리비: ${feeToFull === 0 ? '무료' : fmt(feeToFull)}</strong>
            <span class="gb-sub"> (${lostToMax}% 회복 필요)</span>
          </div>
          <div class="gb-btn-row" style="margin-top:8px;">
            <button class="gb-btn primary" id="gb-repair-full" ${canAfford || feeToFull===0 ? '' : 'disabled'}>
              ${feeToFull === 0 ? '무료 수리' : `₩${fmt(feeToFull)} 지불하고 수리`}
            </button>
          </div>
          ${!canAfford && feeToFull > 0 ? `<div class="gb-sub" style="color:#ef4444;">소지금 부족 (₩${gold.toLocaleString('en-US')} / 필요 ₩${fmt(feeToFull)})</div>` : ''}
        </div>

        <div style="margin-top:12px;padding-top:8px;border-top:1px solid rgba(148,163,184,0.15);">
          <div class="gb-sub">부분 수리 (목표 내구도 직접 입력):</div>
          <div class="gb-grid two" style="margin-top:4px;">
            <label>목표 내구도<input class="gb-input" id="gb-repair-target-dur" type="number" min="${dur}" max="${maxDur}" value="${maxDur}" /></label>
            <label style="display:flex;align-items:flex-end;"><button class="gb-btn" id="gb-repair-partial">부분 수리 계산·실행</button></label>
          </div>
          <div id="gb-repair-partial-result" class="gb-sub"></div>
        </div>`;
    }
  }

  return `
    <div class="gb-grid db">
      <div class="gb-panel">
        <div class="gb-section-title">보유 장비</div>
        <div class="gb-sub">소지금: ₩${gold.toLocaleString('en-US')}</div>
        <div style="margin-top:8px;">${listHtml}</div>
      </div>
      <div class="gb-panel">${detailHtml}</div>
    </div>`;
}


function renderForgeShopHtml() {
  const inv = getInventory();
  const gold = Number(inv.gold || 0);
  const ownedEquip = (inv.items||[]).filter(it => it.category === 'equipment');
  const selKey = model.state.shopForgeSel || '';
  const forgeTab = model.state.shopForgeTab || 'enhance';
  const fmt = n => n >= 1e8 ? `${(n/1e8).toFixed(2)}억원` : n >= 10000 ? `${Math.round(n/10000)}만원` : `${n.toLocaleString('en-US')}원`;

  const tabBar = `<div class="gb-btn-row">
    <button class="gb-btn${forgeTab==='enhance'?' primary':''}" data-forge-tab="enhance">⚒️ 강화</button>
    <button class="gb-btn${forgeTab==='infuse'?' primary':''}" data-forge-tab="infuse">💎 특성주입</button>
  </div>`;

  const listHtml = ownedEquip.length === 0
    ? `<div class="gb-sub">${forgeTab==='infuse'?'특성주입':'강화'}할 장비가 없다.</div>`
    : ownedEquip.map(it => {
        const ikey = inventoryItemKey(it);
        const isSelected = ikey === selKey;
        const dur = Number(it.durability ?? 100);
        const maxDur = Number(it.maxDurability ?? 100);
        const maxEnh = EQUIP_MAX_ENHANCE[it.part||'weapon'] || 3;
        const maxInf = it.maxInfuse ?? EQUIP_MAX_INFUSE[it.part||'weapon'] ?? 1;
        const isFull = forgeTab === 'enhance' ? (it.enhance || 0) >= maxEnh : (it.infuse || 0) >= maxInf;
        const badgeText = forgeTab === 'infuse' ? `특성 ${(it.traits||[]).length}/${maxInf}` : `+${it.enhance||0}`;
        return `<button class="gb-list-item ${isSelected?'is-active':''}" data-forge-sel="${escapeHtml(ikey)}">
          <strong>${escapeHtml(it.name||it.id)}</strong>
          <span class="gb-badge">${escapeHtml(it.rank||'E')}</span>
          <span class="gb-badge">${badgeText}</span>
          <div class="gb-sub">내구도 ${dur}/${maxDur}${isFull ? ' | <span style="color:#f97316;">최대</span>' : ''}</div>
        </button>`;
      }).join('');

  let detailHtml = `<div class="gb-sub">왼쪽 목록에서 ${forgeTab==='infuse'?'특성주입':'강화'}할 장비를 선택하세요.</div>`;

  if (selKey) {
    const it = ownedEquip.find(x => inventoryItemKey(x) === selKey);
    if (it) {
      const rank = it.rank || 'E';
      const part = it.part || 'weapon';

      if (forgeTab === 'enhance') {
        // ── 강화 탭 ─────────────────────────────────────────────────────────
        const curEnh = it.enhance || 0;
        const maxEnh = EQUIP_MAX_ENHANCE[part] || 3;
        const baseP = Number(it.price || calcEquipBasePrice(rank, part));
        const wonPerPct100 = (MANA_STONE_WON_PER_PCT[rank] || MANA_STONE_WON_PER_PCT.E) * 100;

        if (curEnh >= maxEnh) {
          detailHtml = `
            <div class="gb-section-title">⚒️ ${escapeHtml(it.name||it.id)}</div>
            <div class="gb-sub" style="color:#f97316;">이미 최대 강화 단계(+${maxEnh})에 도달했다. 더 이상 강화 불가.</div>`;
        } else {
          const stones = (inv.items||[]).filter(si =>
            si.category === 'manaStone' &&
            String(si.rank||'').toUpperCase() === rank.toUpperCase() &&
            Number(si.note || 0) >= 80
          );
          const selStone = model.state.shopForgeStone || '';

          const stoneOptions = stones.length === 0
            ? `<div class="gb-sub" style="color:#ef4444;">${rank}등급 마정석(순도 80% 이상)이 없다. 게이트 공략으로 획득하거나 재료 상점에서 구매하자.</div>`
            : stones.map(si => {
                const skey = inventoryItemKey(si);
                const purity = Number(si.note || 0);
                const rate = calcForgeSuccessRate(purity);
                const fee = calcForgeFee(rank, purity);
                const stoneVal = (MANA_STONE_WON_PER_PCT[rank] || MANA_STONE_WON_PER_PCT.E) * purity;
                return `<button class="gb-list-item ${skey===selStone?'is-active':''}" data-forge-stone="${escapeHtml(skey)}">
                  ${escapeHtml(si.name||si.id)} (순도 ${purity}%) ×${si.count||1}
                  <div class="gb-sub">성공률 <strong>${Math.round(rate*100)}%</strong> | 수수료 ${fmt(fee)} | 마정석 가치 ${fmt(stoneVal)}</div>
                </button>`;
              }).join('');

          let enhanceAction = '';
          if (selStone && stones.find(si => inventoryItemKey(si) === selStone)) {
            const si = stones.find(si => inventoryItemKey(si) === selStone);
            const purity = Number(si.note || 0);
            const rate = calcForgeSuccessRate(purity);
            const fee = calcForgeFee(rank, purity);
            const canAfford = gold >= fee;
            const afterMarketPrice = calcEquipEnhancedPrice(baseP, curEnh + 1, rank);
            const afterUsedPrice = calcForgeEnhancedUsedPrice(baseP, curEnh + 1, part, rank);
            enhanceAction = `
              <div style="margin-top:12px;padding-top:8px;border-top:1px solid rgba(148,163,184,0.15);">
                <div class="gb-sub">🔮 강화 +${curEnh} → +${curEnh+1}</div>
                <div class="gb-sub">성공 확률: <strong style="color:#22c55e;">${Math.round(rate*100)}%</strong></div>
                <div class="gb-sub">실패 시: 장비 유지, 마정석 소멸, 수수료 부과</div>
                <div class="gb-sub">수수료: <strong>${fmt(fee)}</strong> (마정석 가치의 25%)</div>
                <div class="gb-sub">성공 시 경매장 시장가: <strong style="color:#6366f1;">₩${fmt(afterMarketPrice)}</strong></div>
                <div class="gb-sub">성공 시 중고 판매가: ₩${fmt(afterUsedPrice)}</div>
                <div class="gb-sub" style="color:#94a3b8;font-size:0.8em;">강화가 = 기본가 + 단계 × ${rank}등급 100%마정석가(${fmt(wonPerPct100)}) × 1.30</div>
                <div class="gb-btn-row" style="margin-top:8px;">
                  <button class="gb-btn primary" id="gb-forge-do" ${canAfford ? '' : 'disabled'}
                    data-forge-equip="${escapeHtml(inventoryItemKey(it))}"
                    data-forge-stone-key="${escapeHtml(selStone)}"
                    data-forge-fee="${fee}"
                    data-forge-rate="${rate}"
                    data-forge-rank="${escapeHtml(rank)}">
                    강화 실행 (수수료 ${fmt(fee)})
                  </button>
                </div>
                ${!canAfford ? `<div class="gb-sub" style="color:#ef4444;">소지금 부족 (₩${gold.toLocaleString('en-US')} / 필요 ${fmt(fee)})</div>` : ''}
              </div>`;
          }

          detailHtml = `
            <div class="gb-section-title">⚒️ ${escapeHtml(it.name||it.id)} 강화</div>
            <div class="gb-sub">등급: <strong>${escapeHtml(rank)}</strong> | 부위: <strong>${escapeHtml(EQUIP_PART_LABELS[part]||part)}</strong> | 현재 강화: <strong>+${curEnh}</strong> / 최대 +${maxEnh}</div>
            <div class="gb-sub" style="margin-top:4px;color:#a78bfa;">재료: ${rank}등급 마정석 순도 80~100% (소멸) | 수수료: 마정석 가치 ×25%</div>
            <div style="margin-top:8px;">
              <div class="gb-sub">보유 중인 ${rank}등급 마정석 (순도 80% 이상):</div>
              <div style="margin-top:4px;">${stoneOptions}</div>
            </div>
            ${enhanceAction}`;
        }

      } else {
        // ── 특성주입 탭 ──────────────────────────────────────────────────────
        const curInfuse = it.infuse || 0;
        const maxInfuse = it.maxInfuse ?? EQUIP_MAX_INFUSE[part] ?? 1;
        const existingTraits = it.traits || [];

        if (curInfuse >= maxInfuse) {
          detailHtml = `
            <div class="gb-section-title">💎 ${escapeHtml(it.name||it.id)} 특성주입</div>
            <div class="gb-sub">현재 특성: ${existingTraits.map(t => escapeHtml(EQUIP_TRAIT_LABELS[t]||t)).join(', ') || '없음'}</div>
            <div class="gb-sub" style="color:#f97316;">최대 특성 수(${maxInfuse})에 도달했다. 더 이상 주입 불가.</div>`;
        } else {
          const rareMats = (inv.items||[]).filter(mi =>
            mi.category === 'rareMaterial' &&
            mi.traitId &&
            Number(mi.suggestedPrice || 0) > 0 &&
            !existingTraits.includes(mi.traitId)
          );
          const selMat = model.state.shopForgeInfuseMat || '';

          const matOptions = rareMats.length === 0
            ? `<div class="gb-sub" style="color:#ef4444;">주입 가능한 희귀재료가 없다. (traitId 있고, 기준가 있는 재료만 가능) 게이트 보상으로 획득하자.</div>`
            : rareMats.map(mi => {
                const mkey = inventoryItemKey(mi);
                const sp = Number(mi.suggestedPrice || 0);
                const fee = Math.round(sp * 0.25);
                const total = sp + fee;
                const traitLabel = EQUIP_TRAIT_LABELS[mi.traitId] || mi.traitName || mi.traitId || '?';
                return `<button class="gb-list-item ${mkey===selMat?'is-active':''}" data-forge-infuse-mat="${escapeHtml(mkey)}">
                  <strong>${escapeHtml(mi.name||mi.id)}</strong>
                  <span class="gb-badge">${escapeHtml(mi.rank||'E')}</span> ×${mi.count||1}
                  <div class="gb-sub">주입 특성: <strong>${escapeHtml(traitLabel)}</strong> | 재료가 ${fmt(sp)} + 수수료 ${fmt(fee)} = 총 ${fmt(total)}</div>
                </button>`;
              }).join('');

          let infuseAction = '';
          if (selMat && rareMats.find(mi => inventoryItemKey(mi) === selMat)) {
            const mi = rareMats.find(mi => inventoryItemKey(mi) === selMat);
            const sp = Number(mi.suggestedPrice || 0);
            const fee = Math.round(sp * 0.25);
            const total = sp + fee;
            const canAfford = gold >= total;
            const traitLabel = EQUIP_TRAIT_LABELS[mi.traitId] || mi.traitName || mi.traitId || '?';
            infuseAction = `
              <div style="margin-top:12px;padding-top:8px;border-top:1px solid rgba(148,163,184,0.15);">
                <div class="gb-sub">💎 특성 주입: <strong>${escapeHtml(traitLabel)}</strong></div>
                <div class="gb-sub" style="color:#22c55e;">성공률: <strong>100%</strong> (실패 없음)</div>
                <div class="gb-sub">재료비: ${fmt(sp)} | 수수료 (25%): ${fmt(fee)} | <strong>합계: ${fmt(total)}</strong></div>
                <div class="gb-sub" style="color:#94a3b8;font-size:0.8em;">희귀재료 1개 소멸 + 수수료 = 재료가 ×1.25</div>
                <div class="gb-btn-row" style="margin-top:8px;">
                  <button class="gb-btn primary" id="gb-forge-infuse-do" ${canAfford ? '' : 'disabled'}
                    data-forge-equip="${escapeHtml(inventoryItemKey(it))}"
                    data-forge-mat-key="${escapeHtml(selMat)}"
                    data-forge-infuse-fee="${total}"
                    data-forge-trait-id="${escapeHtml(mi.traitId||'')}">
                    특성주입 실행 (합계 ${fmt(total)})
                  </button>
                </div>
                ${!canAfford ? `<div class="gb-sub" style="color:#ef4444;">소지금 부족 (₩${gold.toLocaleString('en-US')} / 필요 ${fmt(total)})</div>` : ''}
              </div>`;
          }

          detailHtml = `
            <div class="gb-section-title">💎 ${escapeHtml(it.name||it.id)} 특성주입</div>
            <div class="gb-sub">등급: <strong>${escapeHtml(rank)}</strong> | 부위: <strong>${escapeHtml(EQUIP_PART_LABELS[part]||part)}</strong> | 특성 ${curInfuse}/${maxInfuse}</div>
            <div class="gb-sub">현재 특성: ${existingTraits.length ? existingTraits.map(t => `<span class="gb-badge">${escapeHtml(EQUIP_TRAIT_LABELS[t]||t)}</span>`).join(' ') : '없음'}</div>
            <div class="gb-sub" style="margin-top:4px;color:#a78bfa;">재료: 희귀재료(traitId 있는 것) 1개 소멸 | 수수료: 재료가 ×25% | 100% 성공</div>
            <div style="margin-top:8px;">
              <div class="gb-sub">보유 희귀재료 (주입 가능한 것):</div>
              <div style="margin-top:4px;">${matOptions}</div>
            </div>
            ${infuseAction}`;
        }
      }
    }
  }

  return `
    ${tabBar}
    <div class="gb-grid db">
      <div class="gb-panel">
        <div class="gb-section-title">보유 장비</div>
        <div class="gb-sub">소지금: ₩${gold.toLocaleString('en-US')}</div>
        <div style="margin-top:8px;">${listHtml}</div>
      </div>
      <div class="gb-panel">${detailHtml}</div>
    </div>`;
}


function renderShopView() {
  const sub = model.state.shopSub || '';
  const hunterSub = model.state.shopHunterSub || '';
  const inv = getInventory();
  const goldLine = `<div class="gb-sub">소지금: ₩${Number(inv.gold || 0).toLocaleString('en-US')}</div>`;

  if (!sub) {
    const catCards = SHOP_CATEGORIES.map(c =>
      `<button class="gb-card-nav" data-shop-sub="${escapeHtml(c.id)}">
         <div class="gb-card-title">${escapeHtml(c.label)}</div>
         <div class="gb-sub">${escapeHtml(c.desc)}</div>
       </button>`
    ).join('');
    return `
      <div class="gb-panel">
        <div class="gb-section-title">🛒 상점가</div>
        <div class="gb-sub">다양한 상점들이 모여 있다.</div>
        ${goldLine}
      </div>
      <div class="gb-grid three">${catCards}</div>
      <div class="gb-btn-row"><button class="gb-btn" data-go="hub">← 허브로</button></div>`;
  }

  if (sub === 'convenience') {
    const db = getConvFoodDb();
    const inv2 = getInventory();
    const convItemsHtml = db.map(f => {
      const canAfford2 = Number(inv2.gold||0) >= f.price;
      const isCampSupply = f.id === 'conv_ration' || f.id === 'conv_water';
      return `<div class="gb-unit">
        <div class="gb-unit-top">
          <div><strong>${escapeHtml(f.name)}</strong> ${isCampSupply ? '<span class="gb-badge" style="background:#15803d44;">야영용</span>' : '<span class="gb-badge">식품</span>'} ${f.note ? `<span class="gb-sub">${escapeHtml(f.note)}</span>` : ''}</div>
          <div><button class="gb-btn tiny${canAfford2 ? '' : ' danger'}" data-conv-food-buy="${escapeHtml(f.id)}" ${canAfford2 ? '' : 'disabled'}>₩${Number(f.price).toLocaleString('en-US')} / 개</button></div>
        </div>
      </div>`;
    }).join('');
    const editRows = db.map((f, idx) => `<div style="display:flex;gap:6px;align-items:center;padding:4px 0;border-bottom:1px solid rgba(148,163,184,0.08);">
      <input type="text" class="gb-input" style="flex:2;" value="${escapeHtml(f.name)}" data-convdb-name="${idx}">
      <input type="number" class="gb-input" style="width:80px;" value="${f.price}" data-convdb-price="${idx}">
      <input type="number" class="gb-input" style="width:70px;" value="${f.weightG||300}" data-convdb-weight="${idx}">
      <button class="gb-btn tiny danger" data-convdb-del="${idx}">삭제</button>
    </div>`).join('');
    return `
      <div class="gb-panel">
        <div class="gb-section-title">🏪 편의점</div>
        <div class="gb-sub">식료품, 음료, 야영 보급품. 식품은 사용하기로 소모. 야영용은 야영지에서 소비.</div>
        ${goldLine}
      </div>
      <div class="gb-panel">${convItemsHtml || '<div class="gb-sub">상품 없음.</div>'}</div>
      <div class="gb-panel">
        <div class="gb-section-title">📝 편의점 식량 DB 관리</div>
        <div class="gb-sub" style="margin-bottom:6px;">이름 / 가격(원) / 무게(g) 순서. 저장 버튼을 눌러야 적용됨.</div>
        <div style="max-height:220px;overflow-y:auto;">${editRows}</div>
        <div class="gb-btn-row" style="margin-top:8px;">
          <button class="gb-btn" id="gb-convdb-add">+ 항목 추가</button>
          <button class="gb-btn primary" id="gb-convdb-save">💾 저장</button>
          <button class="gb-btn danger" id="gb-convdb-reset">기본값 복원</button>
        </div>
      </div>
      <div class="gb-btn-row"><button class="gb-btn" data-shop-sub="">← 상점가로</button> <button class="gb-btn" data-go="hub">← 허브로</button></div>`;
  }

  if (sub === 'department') {
    return `
      <div class="gb-panel">
        <div class="gb-section-title">백화점</div>
        <div class="gb-sub">의류, 생활용품, 일반 가전. (상품 목록 예정)</div>
        ${goldLine}
      </div>
      <div class="gb-btn-row"><button class="gb-btn" data-shop-sub="">← 상점가로</button> <button class="gb-btn" data-go="hub">← 허브로</button></div>`;
  }

  if (sub === 'equip') {
    return `
      <div class="gb-panel">
        <div class="gb-section-title">⚔️ 장비상점</div>
        ${goldLine}
      </div>
      ${renderEquipShopHtml()}
      <div class="gb-btn-row"><button class="gb-btn" data-shop-sub="">← 상점가로</button> <button class="gb-btn" data-go="hub">← 허브로</button></div>`;
  }

  if (sub === 'huntermarket') {
    return `
      <div class="gb-panel">
        <div class="gb-section-title">🏷️ 헌터마켓</div>
        ${goldLine}
      </div>
      ${renderHunterMarketHtml()}
      <div class="gb-btn-row"><button class="gb-btn" data-shop-sub="">← 상점가로</button> <button class="gb-btn" data-go="hub">← 허브로</button></div>`;
  }

  if (sub === 'blackmarket') {
    return `
      ${renderBlackMarketHtml()}
      <div class="gb-btn-row"><button class="gb-btn" data-shop-sub="">← 상점가로</button> <button class="gb-btn" data-go="hub">← 허브로</button></div>`;
  }

  if (sub === 'hunterstreet') {
    if (!hunterSub) {
      const subCards = HUNTER_STREET_SUBS.map(s =>
        `<button class="gb-card-nav" data-shop-hunter-sub="${escapeHtml(s.id)}">
           <div class="gb-card-title">${escapeHtml(s.label)}</div>
           <div class="gb-sub">${escapeHtml(s.desc)}</div>
         </button>`
      ).join('');
      return `
        <div class="gb-panel">
          <div class="gb-section-title">헌터거리</div>
          <div class="gb-sub">헌터 전용 상점들이 모여 있는 거리.</div>
          ${goldLine}
        </div>
        <div class="gb-grid three">${subCards}</div>
        <div class="gb-btn-row"><button class="gb-btn" data-shop-sub="">← 상점가로</button> <button class="gb-btn" data-go="hub">← 허브로</button></div>`;
    }
    const found = HUNTER_STREET_SUBS.find(s => s.id === hunterSub);
    const title = found ? found.label : '헌터거리';
    let itemsHtml = '<div class="gb-sub">상품 목록 준비 중. (예정)</div>';
    if (hunterSub === 'consumable') itemsHtml = shopItemsHtml(SHOP_ITEMS.consumable, 'consumable');
    if (hunterSub === 'material')   itemsHtml = renderMaterialShopHtml();
    if (hunterSub === 'repair')     itemsHtml = renderRepairShopHtml();
    if (hunterSub === 'forge')      itemsHtml = renderForgeShopHtml();
    if (hunterSub === 'equip')      itemsHtml = renderEquipShopHtml();
    return `
      <div class="gb-panel">
        <div class="gb-section-title">${escapeHtml(title)}</div>
        ${goldLine}
      </div>
      ${(hunterSub === 'material' || hunterSub === 'repair' || hunterSub === 'forge' || hunterSub === 'equip') ? itemsHtml : `<div class="gb-panel">${itemsHtml}</div>`}
      <div class="gb-btn-row"><button class="gb-btn" data-shop-hunter-sub="">← 헌터거리로</button> <button class="gb-btn" data-go="hub">← 허브로</button></div>`;
  }

  return `<div class="gb-panel"><div class="gb-sub">알 수 없는 상점 카테고리.</div></div>
    <div class="gb-btn-row"><button class="gb-btn" data-go="hub">← 허브로</button></div>`;
}

// ── 집 (Home) ────────────────────────────────────────────────────────────────
const HOME_LISTINGS = [
  {
    id: 'home_studio_e',
    name: '헌터 구역 원룸',
    area: '20평',
    type: 'rent',
    deposit: 8000000,
    monthlyRent: 800000,
    desc: '헌터 구역 인근 소형 원룸. 방 1개, 화장실 1개. 게이트 반경 2km 이내. 방음 처리 완료. 헌터 등록증 필수.',
    features: ['게이트 반경 2km', '방음 처리', '헌터 등록 필요'],
  },
  {
    id: 'home_apt_c',
    name: 'C랭크 아파트',
    area: '33평',
    type: 'rent',
    deposit: 30000000,
    monthlyRent: 1500000,
    desc: '중급 헌터용 아파트. 방 2개, 화장실 2개, 드레스룸. 헌터 전용 동선(무기 반입 가능), 지하 보관 창고 포함.',
    features: ['무기 반입 허가 건물', '지하 보관 창고', 'C랭크 이상 입주 가능'],
  },
  {
    id: 'home_villa_b',
    name: 'B구역 고급 빌라',
    area: '55평',
    type: 'purchase',
    deposit: 0,
    monthlyRent: 0,
    purchasePrice: 1800000000,
    desc: '중상급 헌터 전용 고급 빌라. 방 3개, 화장실 3개, 훈련실, 회의실. 24시간 보안, 마법 보호막 기본 설치.',
    features: ['마법 보호막 기본', '24시간 보안', '훈련실 포함', 'B랭크 이상'],
  },
  {
    id: 'home_penthouse_a',
    name: 'A클래스 펜트하우스',
    area: '120평',
    type: 'purchase',
    deposit: 0,
    monthlyRent: 0,
    purchasePrice: 8500000000,
    desc: '최상급 헌터 전용 펜트하우스. 최상층 복층 구조. 개인 작전실, 장비 보관고, 훈련 구역 완비. 마법 결계 최고 등급.',
    features: ['최고급 마법 결계', '개인 작전실', '장비 보관고', '복층 구조', 'A랭크 이상'],
  },
  {
    id: 'home_mansion_s',
    name: 'S등급 헌터 저택',
    area: '300평+',
    type: 'purchase',
    deposit: 0,
    monthlyRent: 0,
    purchasePrice: 50000000000,
    desc: '국가 공인 S랭크 헌터 전용 저택. 독립 부지. 전용 게이트 감지 시스템, 길드원 숙소, 훈련장, 수영장, 작전 지휘실 포함. 보안 1등급.',
    features: ['게이트 감지 시스템', '길드원 숙소 가능', '전용 훈련장', '보안 1등급', 'S랭크 전용'],
  },
];
function renderHomeView() {
  const db = model.db;
  const ownedId = db.ownedHomeId || '';
  const listings = HOME_LISTINGS.map(h => {
    const isOwned = ownedId === h.id;
    const priceInfo = h.type === 'rent'
      ? `보증금 ₩${Number(h.deposit).toLocaleString('en-US')} / 월세 ₩${Number(h.monthlyRent).toLocaleString('en-US')}`
      : `매매가 ₩${Number(h.purchasePrice || 0).toLocaleString('en-US')}`;
    const featureHtml = h.features && h.features.length ? `<div class="gb-sub" style="margin-top:4px;">${h.features.map(f => `<span class="gb-badge">${escapeHtml(f)}</span>`).join(' ')}</div>` : '';
    return `
      <div class="gb-panel${isOwned ? '" style="border-color:#2563eb;' : ''}">
        <div class="gb-unit-top">
          <div>
            <strong>${escapeHtml(h.name)}</strong>
            <span class="gb-badge">${escapeHtml(h.area)}</span>
            <span class="gb-badge">${h.type === 'rent' ? '임대' : '매매'}</span>
            ${isOwned ? '<span class="gb-badge" style="background:#16a34a;color:#dcfce7;">현재 거주 중</span>' : ''}
          </div>
          <div>
            ${!isOwned ? `<button class="gb-btn tiny primary" data-home-move="${escapeHtml(h.id)}">입주</button>` : `<button class="gb-btn tiny danger" data-home-move="">퇴거</button>`}
          </div>
        </div>
        <div class="gb-sub" style="margin-top:6px;">${escapeHtml(h.desc)}</div>
        ${featureHtml}
        <div class="gb-sub" style="margin-top:6px;color:#fbbf24;">💰 ${escapeHtml(priceInfo)}</div>
      </div>`;
  }).join('');
  const ownedHome = ownedId ? HOME_LISTINGS.find(h => h.id === ownedId) : null;
  const statusLine = ownedHome
    ? `<div class="gb-sub">현재 거주: <strong>${escapeHtml(ownedHome.name)}</strong> (${escapeHtml(ownedHome.area)} / ${ownedHome.type === 'rent' ? `월세 ₩${Number(ownedHome.monthlyRent).toLocaleString('en-US')}` : '자가'})</div>`
    : '<div class="gb-sub">현재 거주 중인 집이 없다.</div>';
  return `
    <div class="gb-panel">
      <div class="gb-section-title">🏠 주거 매물</div>
      <div class="gb-sub">구입 또는 임대 가능한 매물 목록. 입주 버튼으로 현재 거주지를 변경할 수 있다.</div>
      ${statusLine}
    </div>
    ${listings}
    <div class="gb-btn-row"><button class="gb-btn" data-go="hub">← 허브로</button></div>`;
}

// ── 길드 (Guild) ─────────────────────────────────────────────────────────────
const PRESET_GUILDS = [
  { id:'baeknyeon', name:'백련길드', emoji:'🌸', color:'#818cf8',
    desc:'정화와 재건을 추구하는 고매한 헌터들의 결사체. 빛·치유 속성 특화. 사회적 영향력 최상위.',
    rankReq:'C', specialty:'빛/치유' },
  { id:'eunrang',   name:'은랑길드', emoji:'🐺', color:'#94a3b8',
    desc:'빠른 기동력과 팀워크로 유명한 중견 길드. 균형 잡힌 올라운더 집단. 신입 수용 적극적.',
    rankReq:'D', specialty:'기동/범용' },
  { id:'jeokho',    name:'적호길드', emoji:'🔥', color:'#f97316',
    desc:'불꽃 같은 공격 일변도의 엘리트 전투 집단. 화염·물리 속성 다수. 게이트 공략 최다 기록.',
    rankReq:'C', specialty:'화염/물리' },
  { id:'heuksa',    name:'흑사길드', emoji:'🕷️', color:'#a78bfa',
    desc:'어둠의 게이트 전문 집단. 어둠 속성 특화. 의문의 배후가 있다는 소문이 끊이지 않는다.',
    rankReq:'B', specialty:'어둠/독' },
];

function renderGuildView() {
  const db      = model.db;
  const sub     = model.state.guildSub || '';
  const guildId = String(db.guildId || '');
  const isCustom   = guildId === 'custom';
  const presetGuild = PRESET_GUILDS.find(g => g.id === guildId) || null;
  const currentGuild = isCustom
    ? { name: db.customGuildName || '내 길드', emoji: '⚜️', desc: db.customGuildDesc || '' }
    : presetGuild;

  // ── Current guild header ──────────────────────────────────────────────────
  const guildHeader = currentGuild ? `
    <div class="gb-panel" style="border-color:${presetGuild ? presetGuild.color : '#2563eb'};">
      <div class="gb-section-title">${escapeHtml(currentGuild.emoji)} ${escapeHtml(currentGuild.name)}</div>
      ${presetGuild ? `<span class="gb-badge">${escapeHtml(presetGuild.specialty)}</span> <span class="gb-badge">가입 요건: ${escapeHtml(presetGuild.rankReq)}등급 이상</span>` : '<span class="gb-badge">사용자 정의 길드</span>'}
      <div class="gb-sub" style="margin-top:6px;">${escapeHtml(currentGuild.desc || '')}</div>
    </div>` : '';

  // ── Tax info panel ────────────────────────────────────────────────────────
  const taxPanel = `
    <div class="gb-panel">
      <div class="gb-section-title">🧾 길드 법인세</div>
      <div class="gb-sub">길드원 정산 시 소득세(3.3%) 길드가 대납. 협회 수수료(1.7%)는 면제.</div>
      <div class="gb-sub" style="margin-top:4px;">정산 방법: 협회 → 정산 → <strong>길드 정산</strong> 선택</div>
      <div class="gb-sub">길드 지분 %를 별도 설정해 길드 공금 적립 가능.</div>
    </div>`;

  // ── Members panel ─────────────────────────────────────────────────────────
  const chars = db.characters || [];
  const members = chars.length
    ? chars.map(c => `<div class="gb-sub">• <strong>${escapeHtml(c.name)}</strong> [${escapeHtml(c.job || '직업 미정')}] <span class="gb-badge">${escapeHtml(c.rank || 'E')}</span></div>`).join('')
    : '<div class="gb-sub">등록된 헌터가 없다.</div>';

  // ── If NOT in a guild ─────────────────────────────────────────────────────
  if (!guildId) {
    if (sub === 'create') {
      return `
        <div class="gb-panel">
          <div class="gb-section-title">⚜️ 길드 생성</div>
          <div class="gb-sub">자신만의 길드를 만든다. 이름과 소개를 입력하라.</div>
        </div>
        <div class="gb-panel">
          <form id="gb-guild-create-form" style="display:flex;flex-direction:column;gap:8px;">
            <label>길드 이름<input id="gb-guild-name-input" class="gb-input" type="text" placeholder="길드 이름 (최대 20자)" maxlength="20" style="margin-left:8px;width:200px;"></label>
            <label>길드 소개<input id="gb-guild-desc-input" class="gb-input" type="text" placeholder="소개 (선택)" style="margin-left:8px;width:100%;flex:1;"></label>
            <div class="gb-btn-row" style="margin-top:4px;">
              <button type="submit" class="gb-btn primary">⚜️ 길드 창설</button>
              <button type="button" class="gb-btn" data-guild-sub="">← 취소</button>
            </div>
          </form>
        </div>
        <div class="gb-btn-row"><button class="gb-btn" data-go="hub">← 허브로</button></div>`;
    }
    // Show guild list
    const guildCards = PRESET_GUILDS.map(g => `
      <div class="gb-panel" style="border-color:${g.color}20;">
        <div class="gb-unit-top">
          <div>
            <span style="font-size:18px;">${escapeHtml(g.emoji)}</span>
            <strong style="margin-left:6px;">${escapeHtml(g.name)}</strong>
            <span class="gb-badge">${escapeHtml(g.rankReq)}급 이상</span>
            <span class="gb-badge">${escapeHtml(g.specialty)}</span>
          </div>
          <button class="gb-btn tiny primary" data-guild-join="${escapeHtml(g.id)}">가입</button>
        </div>
        <div class="gb-sub" style="margin-top:6px;">${escapeHtml(g.desc)}</div>
      </div>`).join('');
    return `
      <div class="gb-panel">
        <div class="gb-section-title">⚜️ 길드</div>
        <div class="gb-sub">가입할 길드를 선택하거나 직접 만들 수 있다.</div>
      </div>
      ${guildCards}
      <div class="gb-panel" style="border-color:#2563eb20;">
        <div class="gb-unit-top">
          <div><span style="font-size:18px;">⚜️</span> <strong style="margin-left:6px;">사용자 정의 길드</strong> <span class="gb-badge">직접 만들기</span></div>
          <button class="gb-btn tiny" data-guild-sub="create">길드 창설</button>
        </div>
        <div class="gb-sub" style="margin-top:6px;">자신만의 이름과 소개로 길드를 창설할 수 있다.</div>
      </div>
      <div class="gb-btn-row"><button class="gb-btn" data-go="hub">← 허브로</button></div>`;
  }

  // ── Edit panel ────────────────────────────────────────────────────────────
  if (sub === 'edit') {
    const eg = presetGuild || {};
    const curName = isCustom ? (db.customGuildName || '') : eg.name || '';
    const curDesc = isCustom ? (db.customGuildDesc || '') : eg.desc || '';
    const curEmoji = isCustom ? '⚜️' : eg.emoji || '⚜️';
    return `
      <div class="gb-panel">
        <div class="gb-section-title">✏️ 길드 정보 수정</div>
        <div class="gb-sub">아래 정보를 수정하면 즉시 반영된다.</div>
      </div>
      <div class="gb-panel">
        <form id="gb-guild-edit-form" style="display:flex;flex-direction:column;gap:8px;">
          <label>길드 이름 <input id="gb-guild-edit-name" class="gb-input" type="text" maxlength="20" value="${escapeHtml(curName)}" style="margin-left:8px;width:200px;"></label>
          <label>길드 소개 <input id="gb-guild-edit-desc" class="gb-input" type="text" value="${escapeHtml(curDesc)}" style="margin-left:8px;width:100%;flex:1;"></label>
          ${!isCustom ? `
          <label>가입 요건 등급 <input id="gb-guild-edit-rank" class="gb-input" type="text" maxlength="1" value="${escapeHtml(eg.rankReq||'')}" style="margin-left:8px;width:50px;"></label>
          <label>특화 분야 <input id="gb-guild-edit-spec" class="gb-input" type="text" value="${escapeHtml(eg.specialty||'')}" style="margin-left:8px;width:150px;"></label>
          ` : ''}
          <div class="gb-btn-row" style="margin-top:4px;">
            <button type="submit" class="gb-btn primary">✅ 저장</button>
            <button type="button" class="gb-btn" data-guild-sub="">← 취소</button>
          </div>
        </form>
      </div>
      <div class="gb-btn-row"><button class="gb-btn" data-go="hub">← 허브로</button></div>`;
  }

  // ── Guild tax log ─────────────────────────────────────────────────────────
  const guildTaxLog = Array.isArray(db.guildTaxLog) ? db.guildTaxLog : [];
  const guildTaxLogHtml = guildTaxLog.length
    ? guildTaxLog.slice().reverse().map((r, idx) => `
        <div style="border-bottom:1px solid rgba(148,163,184,0.1);padding-bottom:6px;margin-bottom:6px;">
          <div class="gb-unit-top">
            <div>
              <strong>${escapeHtml(r.date || '날짜 미입력')}</strong>
              <span class="gb-sub"> — ${escapeHtml(r.runTitle || '?')} (${r.members || 1}인)</span>
            </div>
            <button class="gb-btn tiny danger" data-guild-tax-log-del="${guildTaxLog.length - 1 - idx}">삭제</button>
          </div>
          <div class="gb-sub">총합 ₩${formatWon(r.gross)} / 법인세(3.3%) ₩${formatWon(r.corpTax||0)} / 개인 정산 ₩${formatWon(r.net||0)}</div>
          ${r.guildShare ? `<div class="gb-sub">길드 공금 ₩${formatWon(r.guildShare)}</div>` : ''}
        </div>`)
      .join('')
    : '<div class="gb-sub">— 기록된 법인세 내역이 없다. 길드 정산 시 날짜를 입력하면 자동 기록됨. —</div>';

  // ── Already in a guild ────────────────────────────────────────────────────
  return `
    ${guildHeader}
    <div class="gb-btn-row">
      <button class="gb-btn tiny" data-guild-sub="edit">✏️ 길드 정보 수정</button>
    </div>
    <div class="gb-grid two">
      <div class="gb-panel">
        <div class="gb-section-title">소속 헌터</div>
        ${members}
      </div>
      <div class="gb-panel">
        <div class="gb-section-title">임무 보드</div>
        <div class="gb-sub">— 현재 등록된 임무가 없다. —</div>
        <div class="gb-sub" style="margin-top:8px;">게이트 공략, 경호, 조사 등 다양한 임무가 여기에 표시될 예정이다.</div>
      </div>
    </div>
    ${taxPanel}
    <div class="gb-panel">
      <div class="gb-section-title">📜 법인세 납부 기록</div>
      <div class="gb-sub" style="margin-bottom:6px;">길드 정산 이력. 법인세(소득세 3.3%) 신고 참고용.</div>
      ${guildTaxLogHtml}
    </div>
    <div class="gb-btn-row">
      <button class="gb-btn danger" data-guild-leave="">탈퇴</button>
      <button class="gb-btn" data-go="hub">← 허브로</button>
    </div>`;
}

function renderGateView() {
  const gs = gateStateSafe();
  const size = String(gs.size || 'small');
  const rank = String(gs.rank || 'E').toUpperCase();
  const selected = getSelectedGeneratedGate();
  const list = (gs.generated || []);
  const run = getGateRun();
  const rankButtons = GRADE_ORDER.map(r => `<button class="gb-btn ${rank===r?'primary':''}" data-gate-rank="${r}">${escapeHtml(r)}</button>`).join('');
  const sizeButtons = ['small','medium','large'].map(k => `<button class="gb-btn ${size===k?'primary':''}" data-gate-size="${k}">${escapeHtml(GATE_SIZE_META[k].label)}</button>`).join('');
  const cards = list.length ? list.map(g => `
    <button class="gb-card-nav ${g.id===gs.selectedId?'is-selected':''}" data-gate-select="${escapeHtml(g.id)}">
      <div class="gb-card-title">${escapeHtml(g.title)}</div>
      <div class="gb-sub">${escapeHtml(g.rank)} / ${escapeHtml(g.sizeLabel)} / ${escapeHtml(g.primarySpeciesLabel)} + ${escapeHtml(g.secondarySpeciesLabel)}</div>
      <div class="gb-sub">내부 수치와 몬스터 배치는 진입 전 비공개</div>
    </button>
  `).join('') : '<div class="gb-sub">아직 생성된 게이트가 없다. 등급을 고르고 크기를 눌러 생성해.</div>';
  const detail = selected ? `
    <div class="gb-panel">
      <div class="gb-section-title">선택된 게이트</div>
      <div><strong>${escapeHtml(selected.title)}</strong> <span class="gb-badge">${escapeHtml(selected.rank)}</span> <span class="gb-badge">${escapeHtml(selected.sizeLabel)}</span></div>
      <div class="gb-sub">${escapeHtml(selected.description || '')}</div>
      <div class="gb-sub">종족 조합: ${escapeHtml(selected.primarySpeciesLabel)} + ${escapeHtml(selected.secondarySpeciesLabel)}</div>
      <div class="gb-sub">내부 몬스터 수, 광맥, 노드 수는 저장되지만 화면에는 숨김 처리된다.</div>
      <div class="gb-btn-row">
        <button class="gb-btn primary" id="gb-gate-run-start" ${activeGateRun() ? 'disabled' : ''}>${activeGateRun() ? '진행 중인 게이트가 있음' : '이 게이트로 진입'}</button>
        <button class="gb-btn" id="gb-gate-apply">이 게이트를 적 편성에 반영</button>
        <button class="gb-btn" id="gb-gate-apply-go">반영 후 전투 화면으로</button>
        <button class="gb-btn" id="gb-gate-reroll-one">선택 게이트만 다시 굴리기</button>
      </div>
    </div>
  ` : '<div class="gb-panel"><div class="gb-sub">생성된 게이트를 하나 선택해.</div></div>';
  return `
    <div class="gb-panel">
      <div class="gb-section-title">게이트 자동 생성</div>
      <div class="gb-sub">먼저 게이트 등급(E~S)을 고르고, 그 다음 소형/중형/대형을 선택해 생성한다. 내부 몬스터 수·광맥 수·노드 수는 저장되지만 화면에는 숨겨진다.</div>
      <div class="gb-sub">생성 시 게이트 등급/규모/종족 조합에 맞춰 몬스터가 자동 배치된다.</div>
      <div class="gb-btn-row">${rankButtons}</div>
      <div class="gb-btn-row">${sizeButtons}<button class="gb-btn" id="gb-gate-reroll">현재 등급/크기 다시 생성</button></div>
    </div>
    <div class="gb-grid two" style="align-items:start;">
      <div class="gb-grid">${cards}</div>
      <div>${detail}</div>
    </div>
    ${run ? renderGateRunPanel(run) : ''}
  `;
}

function optionHtml(value, label, selected) {
    return `<option value="${escapeHtml(value)}"${selected ? ' selected' : ''}>${escapeHtml(label)}</option>`;
  }
  function characterOptions(selected, allowBlank) {
    const opts = [];
    if (allowBlank) opts.push(optionHtml('', '(비움)', !selected));
    (model.db.characters || []).forEach(c => opts.push(optionHtml(c.id, `${c.name} [${c.job}]`, selected === c.id)));
    return opts.join('');
  }
  function monsterOptions(selected, allowBlank) {
    const opts = [];
    if (allowBlank) opts.push(optionHtml('', '(비움)', !selected));
    (model.db.monsters || []).forEach(c => opts.push(optionHtml(c.id, `${c.name} [${c.kind || 'Normal'}]`, selected === c.id)));
    return opts.join('');
  }
  function targetOptions(runtime, actor, selected) {
    const foes = actor.side === 'party' ? getAlive(runtime.enemies) : getAlive(runtime.party);
    const allies = actor.side === 'party' ? getAlive(runtime.party) : getAlive(runtime.enemies);
    const out = ['<option value="">(자동/기본)</option>'];
    out.push('<optgroup label="적">');
    foes.forEach(u => out.push(optionHtml(u.uid, `${u.name} [${rowLabel(u.row)}]`, selected === u.uid)));
    out.push('</optgroup><optgroup label="아군">');
    allies.forEach(u => out.push(optionHtml(u.uid, `${u.name} [${rowLabel(u.row)}]`, selected === u.uid)));
    out.push('</optgroup>');
    return out.join('');
  }
  function skillOptions(unit, selected) {
    const out = ['<option value="">(스킬 없음)</option>'];
    listKnownSkillDefs(unit).filter(sk => sk.category !== 'passive').forEach(sk => {
      out.push(optionHtml(sk.id, `${sk.name} [${sk.category}]`, selected === sk.id));
    });
    return out.join('');
  }


// ── 골드 이동 패널 ────────────────────────────────────────────────────────────
function renderGoldTransferPanel() {
  const inv = getInventory();
  const sharedGold = Number(inv.gold || 0);
  const allChars = model.db.characters || [];
  const allPersonas = model.db.personas || [];
  const fmtG = n => n >= 1e8 ? `${(n/1e8).toFixed(2)}억원` : n >= 10000 ? `${Math.round(n/10000)}만원` : `${n.toLocaleString('en-US')}원`;

  // 파티에 편성된 캐릭터만 표시
  const partySlotIds = ((model.db.battleSetup || {}).partySlots || []).filter(Boolean);
  const allUnits = [...allChars.map(c => ({ ...c, _type:'char' })), ...allPersonas.map(p => ({ ...p, _type:'persona' }))];
  const partyMembers = partySlotIds.map(id => allUnits.find(u => u.id === id)).filter(Boolean);

  const charRows = partyMembers.map(m => {
    const g = Number((m.inventory && m.inventory.gold) || m.gold || 0);
    return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid rgba(148,163,184,0.08);">
      <span style="flex:1;font-size:12px;"><strong>${escapeHtml(m.name||m.id)}</strong> <span class="gb-badge">${m._type === 'char' ? '캐릭터' : '페르소나'}</span> ${fmtG(g)}</span>
      <input type="number" min="1" placeholder="금액" style="width:90px;" class="gb-input" id="gb-gold-xfer-amt-${escapeHtml(m.id)}" value="">
      <button class="gb-btn tiny" data-gold-to-shared="${escapeHtml(m.id)}" data-gold-xfer-type="${m._type}">→공용</button>
      <button class="gb-btn tiny" data-gold-from-shared="${escapeHtml(m.id)}" data-gold-xfer-type="${m._type}">공용→</button>
    </div>`;
  }).join('');

  return `<div class="gb-panel">
    <div class="gb-section-title">💸 골드 이동</div>
    <div class="gb-sub" style="margin-bottom:6px;">공용 인벤 ↔ 파티원 사이에 골드를 이동한다. <strong>공용: ${fmtG(sharedGold)}</strong></div>
    ${charRows || '<div class="gb-sub">파티에 편성된 캐릭터가 없습니다. 파티 탭에서 먼저 편성하세요.</div>'}
  </div>`;
}

function renderInventoryView() {
  const inv = getInventory();
  const cap = inventoryCapacity();
  const usedSlots = inventoryUsedSlots(inv);
  const usedWeight = inventoryUsedWeightG(inv);
  const items = (inv.items || []).slice().sort((a,b) => `${a.category||''}${a.rank||''}${a.name||''}`.localeCompare(`${b.category||''}${b.rank||''}${b.name||''}`, 'ko'));
  const slotItems = items.filter(it => inventoryConsumesSlot(it));
  const stackItems = items.filter(it => !inventoryConsumesSlot(it));
  const overflow = (inv.overflow || []).slice();
  const recent = (inv.recent || []).slice(0, 12);
  const partyBagSummary = cap.bags && cap.bags.length > 0
    ? cap.bags.map(b => b.name).join(', ')
    : '파티에 가방 없음';
  const supply = campSupplyStock();
  const overflowRows = overflow.length ? overflow.map(it => `<div class="gb-sub">- ${escapeHtml(it.name)} x${Number(it.count||1)}</div>`).join('') : '<div class="gb-sub">없음</div>';

  // ── Slot grid ──────────────────────────────────────────────────────────────
  // Each slot-consuming item occupies one tile; remaining tiles are empty
  const totalSlots = cap.slots;
  const CATEGORY_COLORS = {
    gear:          '#1d4ed8',
    equipment:     '#1d4ed8',
    consumable:    '#15803d',
    supply:        '#15803d',
    potion:        '#7c3aed',
    other:         '#475569',
  };
  function slotColor(it) {
    const c = String(it.category || '').toLowerCase();
    return CATEGORY_COLORS[c] || CATEGORY_COLORS.other;
  }
  const slotTiles = [];
  function buildItemTooltip(it) {
    const lines = [
      it.name + (it.rank ? ` [${it.rank}]` : ''),
      `분류: ${it.category || '기타'} | 수량: ${Number(it.count||1)} | 무게: ${formatWeightG(Math.round(inventoryBaseWeightG(it) * cap.weightMul))}`
    ];
    if (it.part) lines.push(`부위: ${EQUIP_PART_LABELS[it.part] || it.part}`);
    if (it.enhance > 0) lines.push(`강화: +${it.enhance}`);
    if (it.durability != null) lines.push(`내구도: ${it.durability}/${it.maxDurability||it.durability}`);
    if (it.category === 'equipment') {
      const atkVal = Number(it.atk || 0);
      const pdefVal = Number(it.pdef || 0);
      const mdefVal = Number(it.mdef || 0);
      const combatLines = [];
      if (it.part === 'weapon') combatLines.push(`ATK: +${atkVal}`);
      if (it.part === 'subweapon') { combatLines.push(`물리방어: +${pdefVal}`); combatLines.push(`ATK: ${-Math.ceil(pdefVal/2)}`); }
      if (it.part === 'armor') { combatLines.push(`물리방어: +${pdefVal}`); combatLines.push(`마법방어: +${mdefVal}`); }
      if (it.part === 'accessory') combatLines.push(it.traits && it.traits.length ? `특성: ${it.traits.map(t=>EQUIP_TRAIT_LABELS[t]||t).join(', ')}` : '특성 없음');
      if (combatLines.length) lines.push(combatLines.join(' / '));
      if (it.mainStat) lines.push(`주 스탯: ${it.mainStat.toUpperCase()}`);
      if (it.resistType && it.resistPct) lines.push(`${EQUIP_TRAIT_LABELS[it.resistType]||it.resistType} 저항 ${it.resistPct}%`);
    }
    if (it.stats && typeof it.stats === 'object') {
      const statStrs = Object.entries(it.stats).filter(([,v])=>Number(v)!==0).map(([k,v])=>`${k.toUpperCase()}+${v}`);
      if (statStrs.length) lines.push('스탯: ' + statStrs.join(' / '));
    }
    if (Array.isArray(it.traits) && it.traits.length && it.category !== 'equipment') lines.push('특성: ' + it.traits.map(t => EQUIP_TRAIT_LABELS[t] || t).join(', '));
    if (it.effect) lines.push('효과: ' + it.effect);
    if (it.note) lines.push('메모: ' + it.note);
    if (it.suggestedPrice) lines.push(`기준가: ₩${Number(it.suggestedPrice).toLocaleString('en-US')}`);
    return lines.join('\n');
  }
  const isConvFood = it => it && it.category === 'convFood';
  const INV_COLLAPSE_THRESHOLD = 40;
  const invCollapsed = model.state.invGridCollapsed !== false; // default collapsed when > threshold
  for (let i = 0; i < totalSlots; i++) {
    const it = slotItems[i];
    if (it) {
      const key = inventoryItemKey(it);
      const bg = slotColor(it);
      const canUse = isConvFood(it) || it.category === 'campSupply';
      slotTiles.push(`
        <div class="gb-inv-slot filled gb-inv-tooltip-wrap" style="background:${bg}22;border-color:${bg}66;">
          <div class="gb-inv-slot-name">${escapeHtml(it.name)}</div>
          <div class="gb-inv-slot-meta">${escapeHtml(it.rank || '')} · ×${Number(it.count||1)}</div>
          <div class="gb-inv-slot-tooltip">${escapeHtml(buildItemTooltip(it))}</div>
          <div class="gb-inv-slot-btns">
            ${canUse ? `<button class="gb-btn tiny" data-inv-use="${escapeHtml(key)}" title="사용하기">사용</button>` : `<button class="gb-btn tiny" data-inv-drop-one="${escapeHtml(key)}" title="1개 버리기">−1</button>`}
            <button class="gb-btn tiny danger" data-inv-drop-all="${escapeHtml(key)}" title="전체 ${canUse ? '사용' : '버리기'}">${canUse ? '전체사용' : '全버리기'}</button>
          </div>
        </div>`);
    } else {
      slotTiles.push(`<div class="gb-inv-slot empty"><div class="gb-inv-slot-empty-label">${i < usedSlots ? '' : '빈 슬롯'}</div></div>`);
    }
  }
  // collapse: when totalSlots > threshold and state is collapsed, trim trailing empty slots
  const needsCollapse = totalSlots > INV_COLLAPSE_THRESHOLD;
  let visibleTiles = slotTiles;
  let hiddenCount = 0;
  if (needsCollapse && invCollapsed) {
    // show all filled tiles + up to INV_COLLAPSE_THRESHOLD total
    const filledCount = slotItems.length;
    const showCount = Math.max(filledCount, INV_COLLAPSE_THRESHOLD);
    visibleTiles = slotTiles.slice(0, showCount);
    hiddenCount = slotTiles.length - visibleTiles.length;
  }

  // ── Stackable rows (materials, mana stones, consumables that don't use slots)
  const stackRows = stackItems.length ? stackItems.map(it => {
    const key = inventoryItemKey(it);
    const effWeight = Math.round(inventoryBaseWeightG(it) * cap.weightMul);
    return `<div class="gb-unit"><div class="gb-unit-top"><div><strong>${escapeHtml(it.name)}</strong> <span class="gb-badge">${escapeHtml(it.rank || '')}</span> <span class="gb-badge">${escapeHtml(it.category || '')}</span></div><div><button class="gb-btn tiny" data-inv-drop-one="${escapeHtml(key)}">1개 버리기</button> <button class="gb-btn tiny danger" data-inv-drop-all="${escapeHtml(key)}">전체 버리기</button></div></div><div class="gb-sub">수량 ${Number(it.count||1)} / 무게 ${formatWeightG(effWeight)}${it.note ? ` / ${escapeHtml(it.note)}` : ''}${it.suggestedPrice ? ` / 기준가 ₩${Number(it.suggestedPrice).toLocaleString('en-US')}` : ''}</div></div>`;
  }).join('') : '';

  return `
    <div class="gb-grid two">
      <div class="gb-panel">
        <div class="gb-section-title">🎒 공용 인벤토리</div>
        <label>소지금<input class="gb-input" id="gb-inv-gold" type="number" value="${Number(inv.gold||0)}"></label>
        <div class="gb-sub">파티 가방: ${escapeHtml(partyBagSummary)}</div>
        <div class="gb-sub">기본 ${INVENTORY_BASE_SLOTS}칸 / ${formatWeightG(INVENTORY_BASE_MAX_WEIGHT_G)}. 파티원 가방 보너스의 <strong>20%</strong>만 공용인벤에 적용 (나머지는 개인 짐).</div>
        <div class="gb-sub">모든 아이템이 슬롯을 차지한다. 같은 종류(stackable)는 1칸에 합산된다.</div>
        <div class="gb-sub">사용 슬롯 <strong>${usedSlots}/${cap.slots}</strong> / 사용 무게 ${formatWeightG(usedWeight)} / 최대 ${formatWeightG(cap.maxWeightG)}</div>
        <div class="gb-sub">야영 보급: 텐트 ${supply.tent} / 식량 ${supply.ration} / 물 ${supply.water}</div>
        <div class="gb-sub">곡괭이: ${GRADE_ORDER.map(g => `${g}:${getPickaxeCount(g)}`).join(' / ')}</div>
        <div class="gb-btn-row">
          <button class="gb-btn primary" id="gb-inv-save">설정 저장</button>
          <button class="gb-btn" id="gb-inv-collect-overflow">오버플로우 회수</button>
          <button class="gb-btn danger" id="gb-inv-clear-overflow">오버플로우 삭제</button>
        </div>
      </div>
      <div class="gb-panel">
        <div class="gb-section-title">최근 획득</div>
        <div class="gb-log">${recent.length ? recent.map(t => `<div>• ${escapeHtml(t)}</div>`).join('') : '<div>아직 획득 기록이 없다.</div>'}</div>
        <div class="gb-section-title" style="margin-top:12px;">오버플로우</div>
        <div class="gb-log">${overflowRows}</div>
      </div>
    </div>
    <div class="gb-panel">
      <div class="gb-section-title">슬롯 아이템 (${usedSlots}/${cap.slots}칸 사용)</div>
      <div class="gb-inv-grid">${visibleTiles.join('')}</div>
      ${needsCollapse ? `<div class="gb-btn-row" style="margin-top:8px;"><button class="gb-btn tiny" id="gb-inv-grid-toggle">${invCollapsed ? `▼ 빈 슬롯 펼치기 (${hiddenCount}칸 숨김)` : '▲ 빈 슬롯 접기'}</button></div>` : ''}
      ${slotItems.length === 0 ? '<div class="gb-sub" style="margin-top:8px;">슬롯을 차지하는 아이템이 없다. (장비·소모품 등)</div>' : ''}
    </div>
    ${stackItems.length ? `
    <div class="gb-panel">
      <div class="gb-section-title">스택 아이템 (슬롯 내 합산)</div>
      <div>${stackRows}</div>
    </div>` : ''}
    ${renderGoldTransferPanel()}
  `;
}

// ── 파티 관리 뷰 ─────────────────────────────────────────────────────────────
function renderPartyView() {
  const setup = model.db.battleSetup || { partySlots:[], enemySlots:[] };
  const allChars = (model.db.characters || []);
  const allPersonas = (model.db.personas || []);
  const allUnits = allChars.concat(allPersonas);

  // 허브 팀 연동 — 팀이 결성되어 있으면 팀원만 파티에 표시
  const team = Array.isArray(model.db.team) ? model.db.team : [];
  const teamCharIds = team.map(m => m.charId).filter(id => id && id !== '__shared__');

  // 팀이 없으면 빈 화면
  if (teamCharIds.length === 0) {
    return `
      <div class="gb-panel">
        <div class="gb-section-title">👥 파티 관리</div>
        <div class="gb-sub" style="margin:16px 0;">팀이 결성되지 않았습니다. 허브 → 팀 패널에서 먼저 팀을 구성하세요.</div>
        <div class="gb-btn-row"><button class="gb-btn" data-go="hub">허브로 이동</button></div>
      </div>
    `;
  }

  // 팀원을 파티 슬롯에 자동 연동 (battleSetup.partySlots를 팀원 기반으로 갱신)
  if (!model.db.battleSetup) model.db.battleSetup = { partySlots:[], enemySlots:[] };
  if (!model.db.battleSetup.partySlots) model.db.battleSetup.partySlots = [];
  for (let i = 0; i < MAX_PARTY; i++) {
    model.db.battleSetup.partySlots[i] = teamCharIds[i] || '';
  }

  // 현재 파티에 들어있는 캐릭터 (팀 기반)
  const partySlots = [];
  for (let i = 0; i < teamCharIds.length && i < MAX_PARTY; i++) {
    const slotId = teamCharIds[i];
    const unit = allUnits.find(u => u.id === slotId);
    partySlots.push({ index: i, id: slotId, unit });
  }

  // 파티 멤버 카드 렌더
  const partyCards = partySlots.map((slot, i) => {
    if (!slot.unit) {
      return `<div class="gb-panel" style="min-height:120px;display:flex;align-items:center;justify-content:center;opacity:0.5;">
        <div class="gb-sub">슬롯 ${i + 1} — 팀원 (DB에 미등록: ${escapeHtml(slot.id)})</div>
      </div>`;
    }
    const u = slot.unit;
    const stats = u.stats || { str:0, con:0, int:0, agi:0, sense:0 };
    const freePoints = Number(u.freeStatPoints || 0);
    const lv = Number(u.level || 1);
    const curExp = Number(u.exp || 0);
    const needed = expNeededForLevel(lv);
    const expPct = Math.min(100, Math.round((curExp / needed) * 100));
    const statCap = STAT_CAP_BY_RANK[u.rank || 'E'] || STAT_CAP_BY_RANK.E;

    const statNames = { str:'근력', con:'체력', int:'지능', agi:'민첩', sense:'감각' };
    const statRows = Object.entries(statNames).map(([key, label]) => {
      const val = Number(stats[key] || 0);
      const atCap = val >= statCap;
      return `<div style="display:flex;align-items:center;gap:6px;padding:2px 0;">
        <span style="width:40px;font-size:12px;">${label}</span>
        <span style="width:30px;text-align:right;font-weight:600;${atCap?'color:#ef4444;':''}">${val}</span>
        <span class="gb-sub" style="font-size:10px;">/${statCap}</span>
        ${freePoints > 0 && !atCap ? `<button class="gb-btn tiny" data-party-statup="${escapeHtml(u.id)}:${key}" style="padding:1px 6px;font-size:11px;">+1</button>` : ''}
      </div>`;
    }).join('');

    // 장비 요약
    const pInv = getPersonalInv(allChars.find(c=>c.id===u.id) ? 'character' : 'persona', u.id);
    const eqSummary = pInv ? EQUIP_PARTS.map(p => {
      const eq = pInv.equipped[p];
      return eq ? `${EQUIP_PART_LABELS[p]}: ${escapeHtml(eq.name||eq.id)}${eq.enhance>0?` +${eq.enhance}`:''}` : null;
    }).filter(Boolean).join(' / ') || '장착 장비 없음' : '장비정보 없음';
    const personalGold = Number(u.gold || 0);
    const fmtG = n => n >= 1e8 ? `${(n/1e8).toFixed(2)}억` : n >= 10000 ? `${Math.round(n/10000)}만` : n.toLocaleString('en-US');

    return `<div class="gb-panel">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <strong>${escapeHtml(u.name)}</strong> <span class="gb-badge">${escapeHtml(u.rank || 'E')}</span>
          <div class="gb-sub">${escapeHtml(u.job || '직업없음')} / ${escapeHtml(rowLabel(u.row))} / Lv${lv}</div>
        </div>
      </div>
      <div style="margin:6px 0;">
        <div class="gb-sub">EXP: ${curExp}/${needed} (${expPct}%)</div>
        <div style="background:rgba(100,100,100,0.3);height:6px;border-radius:3px;margin-top:3px;">
          <div style="width:${expPct}%;height:100%;background:#3b82f6;border-radius:3px;"></div>
        </div>
      </div>
      <div class="gb-sub" style="margin:4px 0;">HP:${Number(u.hp||0)} MP:${Number(u.mp||0)} SP:${Number(u.sp||0)} ATK:${Number(u.atk||0)}</div>
      <div class="gb-sub" style="margin:2px 0;">💰 소지금: ${fmtG(personalGold)}원</div>
      ${freePoints > 0 ? `<div style="color:#34d399;font-weight:600;font-size:13px;margin:4px 0;">🌟 배분 가능 스탯포인트: ${freePoints}</div>` : ''}
      <div class="gb-sub" style="font-size:11px;margin:2px 0;">스탯 상한: ${statCap} (${u.rank || 'E'}등급)</div>
      <div style="margin-top:4px;">${statRows}</div>
      <div class="gb-sub" style="margin-top:4px;font-size:11px;">⚔️ ${eqSummary}</div>
      <div class="gb-sub" style="margin-top:4px;">스킬: ${(u.skills || []).map(s => {
        const sk = getAllSkillMap()[s];
        if (!sk) return escapeHtml(s);
        const costStr = sk.costs ? [sk.costs.mp ? `MP:${sk.costs.mp}` : '', sk.costs.sp ? `SP:${sk.costs.sp}` : ''].filter(Boolean).join('/') : '';
        const coefStr = sk.coef ? `계수:${sk.coef}` : '';
        const catLabel = { singleAttack:'단일공격', aoeAttack:'광역공격', singleCC:'단일CC', aoeCC:'광역CC', buff:'버프', singleHeal:'힐', aoeHeal:'광역힐', passive:'패시브', utility:'유틸' }[sk.category] || sk.category;
        const tooltip = [catLabel, coefStr, costStr, sk.desc || ''].filter(Boolean).join(' | ');
        return `<span class="gb-skill-tag" title="${escapeHtml(tooltip)}" style="cursor:help;border-bottom:1px dashed rgba(148,163,184,0.4);">${escapeHtml(sk.name)}</span>`;
      }).join(', ') || '없음'}</div>
      <div class="gb-btn-row" style="margin-top:6px;">
        <button class="gb-btn tiny" data-party-inv="${escapeHtml(u.id)}">🎒 인벤토리</button>
      </div>
    </div>`;
  }).join('');

  // 파티 인벤토리 관리 (선택된 파티원)
  const partyInvTarget = model.state.partyInvTarget || '';
  const partyInvUnit = partyInvTarget ? allUnits.find(u => u.id === partyInvTarget) : null;
  const partyInvSection = partyInvUnit ? (() => {
    const type = allChars.find(c => c.id === partyInvUnit.id) ? 'character' : 'persona';
    return `<div class="gb-panel" style="margin-top:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div class="gb-section-title">🎒 ${escapeHtml(partyInvUnit.name)} 인벤토리 관리</div>
        <button class="gb-btn tiny" data-party-inv-close>✕ 닫기</button>
      </div>
      ${renderPersonalInventoryHtml(type, partyInvUnit.id)}
    </div>`;
  })() : '';

  // 파티 골드 이동 패널 (파티원만 표시)
  const partyGoldSection = (() => {
    const inv = getInventory();
    const sharedGold = Number(inv.gold || 0);
    const fmtGG = n => n >= 1e8 ? `${(n/1e8).toFixed(2)}억원` : n >= 10000 ? `${Math.round(n/10000)}만원` : `${n.toLocaleString('en-US')}원`;
    const partyMembers = partySlots.filter(s => s.unit).map(s => s.unit);
    if (!partyMembers.length) return '';
    const rows = partyMembers.map(m => {
      const type = allChars.find(c => c.id === m.id) ? 'char' : 'persona';
      const g = Number((m.inventory && m.inventory.gold) || m.gold || 0);
      return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid rgba(148,163,184,0.08);">
        <span style="flex:1;font-size:12px;"><strong>${escapeHtml(m.name||m.id)}</strong> ${fmtGG(g)}</span>
        <input type="number" min="1" placeholder="금액" style="width:90px;" class="gb-input" id="gb-gold-xfer-amt-${escapeHtml(m.id)}" value="">
        <button class="gb-btn tiny" data-gold-to-shared="${escapeHtml(m.id)}" data-gold-xfer-type="${type}">→공용</button>
        <button class="gb-btn tiny" data-gold-from-shared="${escapeHtml(m.id)}" data-gold-xfer-type="${type}">공용→</button>
      </div>`;
    }).join('');
    return `<div class="gb-panel" style="margin-top:12px;">
      <div class="gb-section-title">💸 파티 골드 이동</div>
      <div class="gb-sub" style="margin-bottom:6px;">파티원 ↔ 공용인벤 골드 이동. <strong>공용: ${fmtGG(sharedGold)}</strong></div>
      ${rows}
    </div>`;
  })();

  return `
    <div class="gb-panel">
      <div class="gb-section-title">👥 파티 관리</div>
      <div class="gb-sub" style="margin-bottom:8px;">허브에서 편성한 팀원이 파티로 자동 연동됩니다. 스탯포인트 배분, 인벤토리 관리, 골드 이동이 가능합니다.</div>
    </div>
    <div class="gb-grid two">${partyCards}</div>
    ${partyInvSection}
    ${partyGoldSection}
    <div class="gb-panel" style="margin-top:12px;">
      <div class="gb-btn-row">
        <button class="gb-btn primary" id="gb-party-save-all">파티 저장</button>
        <button class="gb-btn" data-go="hub">허브 (팀 편성)</button>
        <button class="gb-btn" data-go="battle">전투 화면으로</button>
      </div>
    </div>
  `;
}

// ── 캐릭터 관리 뷰 (페르소나 중심) ──────────────────────────────────────────
function renderCharacterView() {
  const charTab = model.state.charViewTab || 'personas';
  const allPersonas = model.db.personas || [];
  const allChars = model.db.characters || [];
  const items = charTab === 'characters' ? allChars : allPersonas;
  const selectedId = model.state.charViewSelected || '';
  const selected = items.find(c => c.id === selectedId) || null;

  const listHtml = items.length === 0
    ? '<div class="gb-sub">등록된 항목이 없습니다. DB에서 추가해주세요.</div>'
    : items.map(c => {
        const isActive = c.id === selectedId;
        const lv = Number(c.level || 1);
        const freeP = Number(c.freeStatPoints || 0);
        return `<button class="gb-list-item ${isActive ? 'is-active' : ''}" data-charview-select="${escapeHtml(c.id)}">
          ${escapeHtml(c.name)} <span class="gb-sub">[${escapeHtml(c.job || '?')}] Lv${lv}</span>
          ${freeP > 0 ? ` <span style="color:#34d399;">🌟${freeP}</span>` : ''}
        </button>`;
      }).join('');

  let detailHtml = '<div class="gb-sub">좌측에서 캐릭터를 선택하세요.</div>';
  if (selected) {
    const u = selected;
    const stats = u.stats || { str:0, con:0, int:0, agi:0, sense:0 };
    const freePoints = Number(u.freeStatPoints || 0);
    const lv = Number(u.level || 1);
    const curExp = Number(u.exp || 0);
    const needed = expNeededForLevel(lv);
    const expPct = Math.min(100, Math.round((curExp / needed) * 100));

    const statNames = { str:'근력(STR)', con:'체력(CON)', int:'지능(INT)', agi:'민첩(AGI)', sense:'감각(SENSE)' };
    const statEffects = {
      str: '물리공격력 +0.2, HP +3',
      con: 'HP +10',
      agi: '물리공격력 +0.2, SP +10',
      int: '마법공격력 +0.3, MP +10',
      sense: 'SP +3, MP +3'
    };
    const statCap = STAT_CAP_BY_RANK[u.rank || 'E'] || STAT_CAP_BY_RANK.E;
    const statRows = Object.entries(statNames).map(([key, label]) => {
      const val = Number(stats[key] || 0);
      const atCap = val >= statCap;
      return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid rgba(148,163,184,0.1);">
        <span style="width:100px;font-size:13px;font-weight:600;">${label}</span>
        <span style="width:35px;text-align:right;font-size:15px;font-weight:700;${atCap?'color:#ef4444;':''}">${val}</span>
        <span class="gb-sub" style="font-size:10px;">/${statCap}</span>
        <span class="gb-sub" style="flex:1;font-size:11px;">(${statEffects[key]})</span>
        ${freePoints > 0 && !atCap ? `<button class="gb-btn tiny" data-charview-statup="${escapeHtml(u.id)}:${key}" style="padding:2px 8px;">+1</button>` : ''}
      </div>`;
    }).join('');

    const skillMap = getAllSkillMap();
    const skillList = (u.skills || []).map(sId => {
      const sk = skillMap[sId];
      if (!sk) return `<div class="gb-sub" style="padding:2px 0;">• ${escapeHtml(sId)}</div>`;
      const costStr = sk.costs ? [sk.costs.mp ? `MP:${sk.costs.mp}` : '', sk.costs.sp ? `SP:${sk.costs.sp}` : ''].filter(Boolean).join(' / ') : '비용 없음';
      const coefStr = sk.coef != null ? `계수: ${sk.coef}` : '';
      const catLabel = { singleAttack:'단일공격', aoeAttack:'광역공격', singleCC:'단일CC', aoeCC:'광역CC', buff:'버프', singleHeal:'힐', aoeHeal:'광역힐', passive:'패시브', utility:'유틸' }[sk.category] || sk.category;
      const elemStr = sk.element && sk.element !== 'none' ? `속성:${sk.element}` : '';
      const dmgTypeStr = sk.damageType ? `타입:${sk.damageType}` : '';
      const statTypeStr = (sk.statTypes||[]).length ? `스탯:${sk.statTypes.join('/')}` : '';
      const durationStr = sk.duration ? `${sk.duration}턴` : '';
      const ccStr = sk.cc ? `CC:${sk.cc.type}(${sk.cc.turns}턴)` : '';
      const buffStr = sk.buff && sk.buff.stats ? `버프:${Object.entries(sk.buff.stats).map(([k,v])=>`${k}+${v}`).join(',')}` : '';
      const passiveStr = sk.passiveBonuses ? `패시브:${Object.entries(sk.passiveBonuses).map(([k,v])=>`${k}+${v}`).join(',')}` : '';
      const byRankStr = sk.byRank ? '(등급별 성장)' : '';
      const details = [catLabel, coefStr, costStr, dmgTypeStr, elemStr, statTypeStr, durationStr, ccStr, buffStr, passiveStr, byRankStr].filter(Boolean).join(' | ');
      return `<div class="gb-sub" style="padding:2px 0;cursor:help;" title="${escapeHtml(details)}">• <strong>${escapeHtml(sk.name)}</strong> <span class="gb-badge">${escapeHtml(catLabel)}</span> ${coefStr ? `<span class="gb-badge">${coefStr}</span>` : ''} ${costStr ? `<span class="gb-sub" style="font-size:10px;">[${escapeHtml(costStr)}]</span>` : ''} ${sk.desc ? '— ' + escapeHtml(sk.desc) : ''}</div>`;
    }).join('') || '<div class="gb-sub">스킬 없음</div>';

    detailHtml = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div>
          <div style="font-size:18px;font-weight:700;">${escapeHtml(u.name)}</div>
          <div class="gb-sub">${escapeHtml(u.job || '직업없음')} / ${escapeHtml(u.rank || 'E')}등급 / ${escapeHtml(rowLabel(u.row))} / Lv${lv}</div>
        </div>
        <span class="gb-badge" style="font-size:14px;">${escapeHtml(u.rank || 'E')}</span>
      </div>
      <div style="margin:8px 0;">
        <div class="gb-sub">EXP: ${curExp} / ${needed} (${expPct}%)</div>
        <div style="background:rgba(100,100,100,0.3);height:8px;border-radius:4px;margin-top:4px;">
          <div style="width:${expPct}%;height:100%;background:#3b82f6;border-radius:4px;transition:width 0.3s;"></div>
        </div>
      </div>
      <div class="gb-grid two" style="margin:8px 0;">
        <div class="gb-sub">❤️ HP: <strong>${Number(u.hp||0)}</strong></div>
        <div class="gb-sub">💧 MP: <strong>${Number(u.mp||0)}</strong></div>
        <div class="gb-sub">⚡ SP: <strong>${Number(u.sp||0)}</strong></div>
        <div class="gb-sub">⚔️ ATK: <strong>${Number(u.atk||0)}</strong></div>
        <div class="gb-sub">🛡️ 물리방어: <strong>${Number(u.pdef||0)}</strong></div>
        <div class="gb-sub">🔮 마법방어: <strong>${Number(u.mdef||0)}</strong></div>
      </div>
      ${freePoints > 0 ? `<div style="color:#34d399;font-weight:700;font-size:14px;margin:8px 0;padding:6px;background:rgba(52,211,153,0.1);border-radius:6px;">🌟 배분 가능 스탯포인트: ${freePoints}</div>` : ''}
      <div style="margin:8px 0;">
        <div class="gb-section-title" style="font-size:13px;">스탯 <span class="gb-sub" style="font-size:11px;">(상한: ${statCap} / ${u.rank || 'E'}등급)</span></div>
        ${statRows}
      </div>
      <div style="margin:8px 0;">
        <div class="gb-section-title" style="font-size:13px;">스킬</div>
        ${skillList}
      </div>
      ${u.note ? `<div class="gb-sub" style="margin-top:8px;">📝 ${escapeHtml(u.note)}</div>` : ''}
      ${u.id ? renderEquippedStatSection(u, charTab === 'characters' ? 'character' : 'persona') : ''}
    `;
  }

  return `
    <div class="gb-btn-row" style="margin-bottom:8px;">
      <button class="gb-btn ${charTab==='personas'?'primary':''}" data-charview-tab="personas">페르소나</button>
      <button class="gb-btn ${charTab==='characters'?'primary':''}" data-charview-tab="characters">캐릭터</button>
    </div>
    <div class="gb-grid db">
      <div class="gb-panel">
        <div class="gb-section-title">${charTab === 'characters' ? '캐릭터' : '페르소나'} 목록</div>
        ${listHtml}
      </div>
      <div class="gb-panel">
        <div class="gb-section-title">상세 정보</div>
        ${detailHtml}
      </div>
    </div>
    ${selected && selected.id ? renderPersonalInventoryHtml(charTab === 'characters' ? 'character' : 'persona', selected.id) : ''}
  `;
}

function renderBattleSetup() {
  const setup = model.db.battleSetup || { partySlots:[], enemySlots:[] };
  const currentGate = gateStateSafe().current;
  const partyRows = [];
  const enemyRows = [];
  for (let i = 0; i < MAX_PARTY; i += 1) {
    partyRows.push(`<label>파티 ${i+1}<select class="gb-input" id="gb-party-slot-${i}">${characterOptions(setup.partySlots[i] || '', true)}</select></label>`);
  }
  for (let i = 0; i < MAX_ENEMIES; i += 1) {
    enemyRows.push(`<label>적 ${i+1}<select class="gb-input" id="gb-enemy-slot-${i}">${monsterOptions(setup.enemySlots[i] || '', true)}</select></label>`);
  }
  const gateInfo = currentGate ? `
    <div class="gb-panel">
      <div class="gb-section-title">현재 연결된 게이트</div>
      <div><strong>${escapeHtml(currentGate.title)}</strong> <span class="gb-badge">${escapeHtml(currentGate.rank)}</span> <span class="gb-badge">${escapeHtml(currentGate.sizeLabel)}</span></div>
      <div class="gb-sub">${escapeHtml(currentGate.primarySpeciesLabel)} + ${escapeHtml(currentGate.secondarySpeciesLabel)} / 내부 배치 정보 비공개</div>
    </div>` : '';
  return `
    ${gateInfo}
    <div class="gb-grid two">
      <div class="gb-panel"><div class="gb-section-title">파티 편성 (최대 8)</div>${partyRows.join('')}</div>
      <div class="gb-panel"><div class="gb-section-title">적 편성 (최대 10)</div>${enemyRows.join('')}</div>
    </div>
    <div class="gb-btn-row">
      <button class="gb-btn" id="gb-save-setup">편성 저장</button>
      <button class="gb-btn primary" id="gb-start-battle">전투 시작</button>
    </div>
    <div class="gb-panel">
      <div class="gb-sub">적 타깃 규칙: 전열 70 / 중열 20 / 후열 10. 전열 안에서는 탱커 기본 위협 5, 근딜 2로 분배된다. 도발은 위협 +5.</div>
    </div>
  `;
}

function renderCommandPanel(runtime) {
    const rows = getAlive(runtime.party).map(unit => {
      const pending = (runtime.pendingActions && runtime.pendingActions[unit.uid]) || {};
      return `
        <div class="gb-command-row">
          <div><strong>${escapeHtml(unit.name)}</strong><div class="gb-sub">${escapeHtml(rowLabel(unit.row))} / ${escapeHtml(unit.position || '')}</div></div>
          <select class="gb-input" id="gb-act-mode-${unit.uid}">
            ${optionHtml('basic', '기본 공격', (pending.mode || 'basic') === 'basic')}
            ${optionHtml('skill', '스킬', pending.mode === 'skill')}
            ${optionHtml('defend', '방어', pending.mode === 'defend')}
            ${optionHtml('wait', '대기', pending.mode === 'wait')}
            ${optionHtml('auto', '자동', pending.mode === 'auto')}
          </select>
          <select class="gb-input" id="gb-act-skill-${unit.uid}">
            ${skillOptions(unit, pending.skillId || '')}
          </select>
          <select class="gb-input" id="gb-act-target-${unit.uid}">
            ${targetOptions(runtime, unit, pending.target || '')}
          </select>
        </div>
      `;
    });
    return `
      <div class="gb-panel">
        <div class="gb-section-title">이번 라운드 행동 지정</div>
        <div class="gb-sub">스킬/대상 지정 후 라운드 실행. 지정하지 않으면 기본 공격 또는 자동으로 보정된다.</div>
        <div class="gb-command-list">${rows.join('') || '<div class="gb-sub">행동 지정 대상 없음.</div>'}</div>
        <div class="gb-btn-row">
          <button class="gb-btn primary" id="gb-run-round">라운드 실행</button>
          <button class="gb-btn" id="gb-auto-one">1라운드 자동</button>
          <button class="gb-btn" id="gb-auto-battle">끝까지 자동</button>
          <button class="gb-btn" id="gb-reset-battle">전투 종료/리셋</button>
        </div>
      </div>
    `;
  }

  function renderBattleRuntime() {
    const rt = model.state.runtime;
    if (!rt.started) return renderBattleSetup();
    return `
      ${renderCommandPanel(rt)}
      <div class="gb-grid two">
        <div class="gb-panel">
          <div class="gb-section-title">아군 (${getAlive(rt.party).length}/${rt.party.length})</div>
          ${rt.party.map(unitRowHtml).join('')}
        </div>
        <div class="gb-panel">
          <div class="gb-section-title">적 (${getAlive(rt.enemies).length}/${rt.enemies.length})</div>
          ${rt.enemies.map(unitRowHtml).join('')}
        </div>
      </div>
      <div class="gb-grid two">
        <div class="gb-panel">
          <div class="gb-section-title">라운드 요약</div>
          <div class="gb-log">${rt.roundSummaries.length ? rt.roundSummaries.map(row => `<div>• ${escapeHtml(row.text)}</div>`).join('') : '<div>아직 라운드가 진행되지 않았다.</div>'}</div>
        </div>
        <div class="gb-panel">
          <div class="gb-section-title">전투 결과</div>
          <div class="gb-sub">상태: <strong>${escapeHtml(rt.finished ? rt.outcome : ('진행 중 / ' + rt.round + '라운드'))}</strong></div>
          <div class="gb-sub">총 피해 — 아군이 준 피해 ${rt.totals.partyDamage}, 적이 준 피해 ${rt.totals.enemyDamage}</div>
          <div class="gb-sub">총 회복 — 아군 ${rt.totals.partyHealing}, 적 ${rt.totals.enemyHealing}</div>
          <div class="gb-sub">총 처치 — 아군 ${rt.totals.partyKills}, 적 ${rt.totals.enemyKills}</div>
          ${rt.expGained > 0 ? `<div class="gb-sub" style="color:#34d399;font-weight:600;">⭐ 획득 EXP: ${rt.expGained} (처치 ${(rt.expLog||[]).length}건)</div>
            <div class="gb-sub" style="font-size:0.82em;">${(rt.expLog||[]).slice(0,10).map(e=>`${e.name}(${e.rank}/${e.kind}) +${e.exp}`).join(' / ')}${(rt.expLog||[]).length>10?` 외 ${(rt.expLog||[]).length-10}건…`:''}</div>
            ${(rt.expResults||[]).length ? `<div class="gb-sub" style="color:#fbbf24;">${rt.expResults.map(r=>`${r.name} Lv${r.newLevel}${r.levelsGained>0?' ⬆️레벨업!':''}`).join(' / ')}</div>` : ''}` : ''}
          <textarea id="gb-llm-block" class="gb-textarea short" readonly>${escapeHtml(rt.llmBlock || '')}</textarea>
          <div class="gb-btn-row"><button class="gb-btn" id="gb-copy-llm">결과 블록 복사</button></div>
        </div>
      </div>
      <div class="gb-panel">
        <div class="gb-section-title">상세 전투 로그</div>
        <div class="gb-log">${(rt.logs || []).length ? rt.logs.map(row => `<div>• ${escapeHtml(row)}</div>`).join('') : '<div>아직 상세 로그가 없다.</div>'}</div>
      </div>
    `;
  }

  function renderCharacterEditor() {
    ensureSelections();
    const item = deepClone(getCharById(model.state.selected.characters) || {
      id:'', name:'', job:'', position:'', row:'mid', rank:'E',
      stats:{ str:10, con:10, int:10, agi:10, sense:10 }, hp:100, mp:100, sp:100, atk:0, pdef:0, mdef:0,
      damageType:'physical', attackStat:'str', skills:[], note:'',
      level:1, exp:0, totalExp:0
    });
    const list = (model.db.characters || []).map(c => `<button class="gb-list-item ${c.id===model.state.selected.characters?'is-active':''}" data-select-type="characters" data-id="${escapeHtml(c.id)}">${escapeHtml(c.name)} <span class="gb-sub">[${escapeHtml(c.job)}] Lv${Number(c.level||1)}</span></button>`).join('');
    return `
      <div class="gb-grid db">
        <div class="gb-panel"><div class="gb-section-title">캐릭터 목록</div>${list || '<div class="gb-sub">등록된 캐릭터 없음.</div>'}<div class="gb-btn-row"><button class="gb-btn" id="gb-char-new">새 캐릭터</button><button class="gb-btn danger" id="gb-char-clear-all">캐릭터 전체삭제</button></div></div>
        <div class="gb-panel">
          <div class="gb-section-title">캐릭터 편집</div>
          <div class="gb-grid two">
            <label>ID<input class="gb-input" id="gb-char-id" value="${escapeHtml(item.id)}" /></label>
            <label>이름<input class="gb-input" id="gb-char-name" value="${escapeHtml(item.name)}" /></label>
            <label>직업<input class="gb-input" id="gb-char-job" value="${escapeHtml(item.job)}" /></label>
            <label>포지션<input class="gb-input" id="gb-char-position" value="${escapeHtml(item.position)}" /></label>
            <label>행<select class="gb-input" id="gb-char-row">${optionHtml('front','전열',item.row==='front')}${optionHtml('mid','중열',item.row==='mid')}${optionHtml('back','후열',item.row==='back')}</select></label>
            <label>랭크<select class="gb-input" id="gb-char-rank">${GRADE_ORDER.map(g=>optionHtml(g,g,item.rank===g)).join('')}</select></label>
            <label>HP<input class="gb-input" id="gb-char-hp" type="number" value="${escapeHtml(item.hp)}" /></label>
            <label>MP<input class="gb-input" id="gb-char-mp" type="number" value="${escapeHtml(item.mp)}" /></label>
            <label>SP<input class="gb-input" id="gb-char-sp" type="number" value="${escapeHtml(item.sp)}" /></label>
            <label>ATK<input class="gb-input" id="gb-char-atk" type="number" value="${escapeHtml(item.atk)}" /></label>
            <label>물리방어<input class="gb-input" id="gb-char-pdef" type="number" value="${escapeHtml(item.pdef)}" /></label>
            <label>마법방어<input class="gb-input" id="gb-char-mdef" type="number" value="${escapeHtml(item.mdef)}" /></label>
            <label>STR<input class="gb-input" id="gb-char-str" type="number" value="${escapeHtml(item.stats.str)}" /></label>
            <label>CON<input class="gb-input" id="gb-char-con" type="number" value="${escapeHtml(item.stats.con)}" /></label>
            <label>INT<input class="gb-input" id="gb-char-int" type="number" value="${escapeHtml(item.stats.int)}" /></label>
            <label>AGI<input class="gb-input" id="gb-char-agi" type="number" value="${escapeHtml(item.stats.agi)}" /></label>
            <label>SENSE<input class="gb-input" id="gb-char-sense" type="number" value="${escapeHtml(item.stats.sense)}" /></label>
            <label>피해 타입<select class="gb-input" id="gb-char-dmgtype">${optionHtml('physical','physical',item.damageType==='physical')}${optionHtml('magic','magic',item.damageType==='magic')}</select></label>
            <label>공격 스탯<select class="gb-input" id="gb-char-atkstat">${['str','con','int','agi','sense'].map(s=>optionHtml(s,s,item.attackStat===s)).join('')}</select></label>
            <label>기본 위협값<input class="gb-input" id="gb-char-threat" type="number" value="${escapeHtml(item.threatBase != null ? item.threatBase : inferThreatBase(item.position,item.row))}" /></label>
            <label>스킬 ID(쉼표구분)<input class="gb-input" id="gb-char-skills" value="${escapeHtml((item.skills||[]).join(', '))}" /></label>
          </div>
          <div class="gb-sub" style="margin:6px 0;">💡 HP/MP/SP는 비워두면(0) 스탯 기준 자동 계산: HP=100+(CON-10)×10+(STR-10)×3, MP=100+(INT-10)×10+(SEN-10)×3, SP=100+(AGI-10)×10+(SEN-10)×3. ATK/물방/마방은 기본 0 (스킬·장비로만 증가).</div>
          <label>메모<textarea class="gb-textarea short" id="gb-char-note">${escapeHtml(item.note || '')}</textarea></label>
          <div style="margin-top:10px;border-top:1px solid rgba(148,163,184,0.2);padding-top:8px;">
            <div class="gb-section-title">📈 레벨 / 경험치 (DB 직접 수정)</div>
            ${(() => {
              const lv = Number(item.level || 1);
              const curExp = Number(item.exp || 0);
              const totalExp = Number(item.totalExp || 0);
              const needed = expNeededForLevel(lv);
              return `<div class="gb-sub">현재 Lv${lv} / 현재 EXP ${curExp} / ${needed} (다음 레벨까지) / 누적 EXP ${totalExp}</div>`;
            })()}
            <div class="gb-grid two">
              <label>레벨<input class="gb-input" id="gb-char-level" type="number" min="1" max="${EXP_MAX_LEVEL}" value="${Number(item.level || 1)}" /></label>
              <label>현재 EXP<input class="gb-input" id="gb-char-exp" type="number" min="0" value="${Number(item.exp || 0)}" /></label>
              <label>누적 EXP<input class="gb-input" id="gb-char-totalexp" type="number" min="0" value="${Number(item.totalExp || 0)}" /></label>
            </div>
          </div>
          <div class="gb-btn-row"><button class="gb-btn primary" id="gb-char-save">저장</button><button class="gb-btn" id="gb-char-delete">삭제</button></div>
          ${item.id ? renderEquippedStatSection(item, 'character') : ''}
        </div>
      </div>
      ${renderPersonalInventoryHtml('character', item.id)}
    `;
  }

  // ── 개인 인벤토리 + 장비창 렌더 (캐릭터 & 페르소나 공용) ──────────────────
  function getPersonalInv(type, entityId) {
    if (!entityId) return null;
    const arr = type === 'persona' ? (model.db.personas || []) : (model.db.characters || []);
    const entity = arr.find(x => x.id === entityId);
    if (!entity) return null;
    if (!entity.inventory) entity.inventory = { items: [], equipped: { weapon: null, armor: null, subweapon: null, accessory: null, bag: null } };
    if (!entity.inventory.equipped) entity.inventory.equipped = { weapon: null, armor: null, subweapon: null, accessory: null, bag: null };
    if (entity.inventory.equipped.bag === undefined) entity.inventory.equipped.bag = null;
    return entity.inventory;
  }

  // 장착 장비 스탯 합산 반환 { atk, pdef, mdef, str, con, int, agi, sense }
  function calcEquippedStatBonus(equipped) {
    const bonus = { atk:0, pdef:0, mdef:0, str:0, con:0, int:0, agi:0, sense:0 };
    if (!equipped) return bonus;
    EQUIP_PARTS.forEach(part => {
      const eq = equipped[part];
      if (!eq) return;
      bonus.atk   += Number(eq.atk   || 0);
      bonus.pdef  += Number(eq.pdef  || 0);
      bonus.mdef  += Number(eq.mdef  || 0);
      // mainStat +value (간단히 장비 rank 기반 약식 보너스)
      const rankBonus = { E:2, D:5, C:10, B:18, A:28, S:40 };
      const rb = rankBonus[eq.rank||'E'] || 2;
      if (eq.mainStat && bonus[eq.mainStat] !== undefined) bonus[eq.mainStat] += rb;
    });
    return bonus;
  }

  // 장착 스탯 섹션 HTML (캐릭터/페르소나 편집기 공용)
  function renderEquippedStatSection(item, type) {
    const inv = getPersonalInv(type, item.id);
    if (!inv) return '';
    const bonus = calcEquippedStatBonus(inv.equipped);
    const hasAny = Object.values(bonus).some(v => v !== 0);
    const equipNames = EQUIP_PARTS.map(p => {
      const eq = inv.equipped[p];
      if (!eq) return null;
      return `${EQUIP_PART_LABELS[p]}: <strong>${escapeHtml(eq.name||eq.id)}</strong>${eq.enhance>0?` +${eq.enhance}`:''}`;
    }).filter(Boolean);

    const baseAtk = Number(item.atk || 0);
    const basePdef = Number(item.pdef || 0);
    const baseMdef = Number(item.mdef || 0);
    const stats = item.stats || {};
    const fmtDiff = (v, b) => b > 0 ? `${v} <span style="color:#34d399">+${b}</span> = <strong>${v+b}</strong>` : `<strong>${v}</strong>`;

    return `<div style="margin-top:10px;border-top:1px solid rgba(148,163,184,0.2);padding-top:8px;">
      <div class="gb-section-title">⚔️ 장착 장비 스탯 반영</div>
      ${equipNames.length ? `<div class="gb-sub" style="margin-bottom:6px;">${equipNames.join(' / ')}</div>` : '<div class="gb-sub" style="margin-bottom:6px;color:#64748b;">장착 장비 없음</div>'}
      ${hasAny ? `<div class="gb-grid four" style="gap:4px;font-size:12px;">
        <div>ATK ${fmtDiff(baseAtk, bonus.atk)}</div>
        <div>물리방어 ${fmtDiff(basePdef, bonus.pdef)}</div>
        <div>마법방어 ${fmtDiff(baseMdef, bonus.mdef)}</div>
        <div>STR ${fmtDiff(Number(stats.str||0), bonus.str)}</div>
        <div>CON ${fmtDiff(Number(stats.con||0), bonus.con)}</div>
        <div>INT ${fmtDiff(Number(stats.int||0), bonus.int)}</div>
        <div>AGI ${fmtDiff(Number(stats.agi||0), bonus.agi)}</div>
        <div>SENSE ${fmtDiff(Number(stats.sense||0), bonus.sense)}</div>
      </div>` : '<div class="gb-sub">—</div>'}
    </div>`;
  }

  function renderPersonalInventoryHtml(type, entityId) {
    if (!entityId) return '<div class="gb-panel gb-sub">캐릭터/페르소나를 먼저 저장하면 개인 인벤토리를 사용할 수 있다.</div>';
    const inv = getPersonalInv(type, entityId);
    if (!inv) return '';
    const tabKey = type === 'persona' ? 'personaInvTab' : 'charInvTab';
    const activeTab = model.state[tabKey] || 'equip';
    const tabBar = `<div class="gb-btn-row">
      <button class="gb-btn${activeTab==='equip'?' primary':''}" data-personal-inv-tab="${type}:equip">🛡️ 장비창</button>
      <button class="gb-btn${activeTab==='items'?' primary':''}" data-personal-inv-tab="${type}:items">🎒 인벤토리</button>
    </div>`;
    const fmt = n => n >= 1e8 ? `${(n/1e8).toFixed(2)}억` : n >= 10000 ? `${Math.round(n/10000)}만` : n.toLocaleString('en-US');
    if (activeTab === 'equip') {
      // Equipment slots (weapon/subweapon/armor/accessory) 
      const slotHtml = EQUIP_PARTS.map(part => {
        const eq = inv.equipped[part];
        const label = EQUIP_PART_LABELS[part] || part;
        if (eq) {
          const dur = Number(eq.durability ?? 100);
          const maxDur = Number(eq.maxDurability ?? 100);
          const traitTxt = (eq.traits||[]).length ? ` [${(eq.traits||[]).map(t=>EQUIP_TRAIT_LABELS[t]||t).join(',')}]` : '';
          const enhTxt = eq.enhance > 0 ? ` +${eq.enhance}` : '';
          return `<div class="gb-unit"><div class="gb-unit-top">
            <div>
              <span class="gb-sub" style="font-size:0.8em;">${label}</span>
              <div><strong>${escapeHtml(eq.name||eq.id)}${enhTxt}</strong>${traitTxt ? `<span class="gb-sub">${escapeHtml(traitTxt)}</span>` : ''}</div>
              <div class="gb-sub">내구도 ${dur}/${maxDur} | ${escapeHtml(eq.rank||'E')}등급</div>
            </div>
            <button class="gb-btn tiny" data-personal-unequip="${type}:${entityId}:${part}">해제</button>
          </div></div>`;
        }
        return `<div class="gb-unit"><div class="gb-unit-top">
          <div><span class="gb-sub">${label}</span> <span class="gb-sub">(비어 있음)</span></div>
          <div></div>
        </div></div>`;
      }).join('');
      // 가방 슬롯
      const equippedBag = inv.equipped.bag || null;
      const bagSlotHtml = equippedBag
        ? `<div class="gb-unit"><div class="gb-unit-top">
            <div>
              <span class="gb-sub" style="font-size:0.8em;">가방</span>
              <div><strong>${escapeHtml(equippedBag.name||equippedBag.id)}</strong></div>
              <div class="gb-sub">${escapeHtml(equippedBag.note||'')}</div>
            </div>
            <button class="gb-btn tiny" data-personal-unequip="${type}:${entityId}:bag">해제</button>
          </div></div>`
        : `<div class="gb-unit"><div class="gb-unit-top"><div><span class="gb-sub">가방</span> <span class="gb-sub">(없음 — 소모품 상점에서 구매)</span></div><div></div></div></div>`;
      // 인벤에서 장착 가능한 장비 목록 (장비 + 가방)
      const equippableHtml = (inv.items||[]).filter(it => it.category === 'equipment' || it.category === 'bag').map(it => {
        const ikey = inventoryItemKey(it);
        const traitTxt = (it.traits||[]).length ? ` [${(it.traits||[]).map(t=>EQUIP_TRAIT_LABELS[t]||t).join(',')}]` : '';
        const isBag = it.category === 'bag';
        return `<div class="gb-unit"><div class="gb-unit-top">
          <div>
            <strong>${escapeHtml(it.name||it.id)}</strong>${it.enhance>0?` +${it.enhance}`:''}
            <span class="gb-badge">${escapeHtml(it.rank||'')}</span>
            ${!isBag ? `<span class="gb-badge">${escapeHtml(EQUIP_PART_LABELS[it.part||'']||it.part||'')}</span>` : '<span class="gb-badge">가방</span>'}
            ${traitTxt ? `<span class="gb-sub">${escapeHtml(traitTxt)}</span>` : ''}
            ${isBag && it.note ? `<div class="gb-sub">${escapeHtml(it.note)}</div>` : ''}
          </div>
          <button class="gb-btn tiny primary" data-personal-equip="${type}:${entityId}:${escapeHtml(ikey)}">장착</button>
        </div></div>`;
      }).join('');
      return `<div class="gb-panel" style="margin-top:10px;">
        <div class="gb-section-title">⚔️ 개인 장비창 / 인벤토리</div>
        ${tabBar}
        <div class="gb-section-title" style="margin-top:8px;">장착 슬롯</div>
        ${slotHtml}
        <div class="gb-section-title" style="margin-top:8px;">🎒 가방 슬롯</div>
        ${bagSlotHtml}
        <div class="gb-section-title" style="margin-top:8px;">인벤에서 장착</div>
        ${equippableHtml || '<div class="gb-sub">인벤에 장착 가능한 장비/가방 없음. 공용 인벤에서 이동하거나 구매하라.</div>'}
      </div>`;
    }
    // items tab: 개인 인벤 아이템 목록
    const items = inv.items || [];
    const itemsHtml = items.length === 0
      ? '<div class="gb-sub">개인 인벤이 비어 있다. 공용 인벤에서 아이템을 이동하자.</div>'
      : items.map(it => {
          const ikey = inventoryItemKey(it);
          const isEq = it.category === 'equipment';
          const isBag = it.category === 'bag';
          const traitTxt = isEq && (it.traits||[]).length ? ` [${(it.traits||[]).map(t=>EQUIP_TRAIT_LABELS[t]||t).join(',')}]` : '';
          return `<div class="gb-unit"><div class="gb-unit-top">
            <div>
              <strong>${escapeHtml(it.name||it.id)}</strong>
              ${it.rank ? `<span class="gb-badge">${escapeHtml(it.rank||'')}</span>` : ''}
              ${isEq ? `<span class="gb-badge">${escapeHtml(EQUIP_PART_LABELS[it.part]||it.part||'')}</span>` : ''}
              ${isBag ? `<span class="gb-badge">가방</span>` : ''}
              ${traitTxt ? `<span class="gb-sub">${escapeHtml(traitTxt)}</span>` : ''}
              ${isEq ? `<div class="gb-sub">내구도 ${Number(it.durability??100)}/${Number(it.maxDurability??100)}</div>` : ''}
              ${isBag && it.note ? `<div class="gb-sub">${escapeHtml(it.note)}</div>` : ''}
              ${!isEq && !isBag && it.count > 1 ? `<span class="gb-sub"> ×${it.count}</span>` : ''}
            </div>
            <div>
              <button class="gb-btn tiny" data-personal-to-shared="${type}:${entityId}:${escapeHtml(ikey)}">공용으로 이동</button>
            </div>
          </div></div>`;
        }).join('');
    // 공용 인벤에서 가져오기 (모든 아이템)
    const sharedInv = getInventory();
    const sharedAll = (sharedInv.items||[]);
    const fromSharedHtml = sharedAll.length === 0
      ? '<div class="gb-sub">공용 인벤에 아이템 없음.</div>'
      : sharedAll.map(it => {
          const ikey = inventoryItemKey(it);
          const isEq = it.category === 'equipment';
          const isBag = it.category === 'bag';
          return `<div class="gb-unit"><div class="gb-unit-top">
            <div>
              <strong>${escapeHtml(it.name||it.id)}</strong>
              ${it.rank ? `<span class="gb-badge">${escapeHtml(it.rank||'')}</span>` : ''}
              ${isEq ? `<span class="gb-badge">${escapeHtml(EQUIP_PART_LABELS[it.part]||it.part||'')}</span>` : ''}
              ${isBag ? `<span class="gb-badge">가방</span>` : ''}
              ${it.count > 1 ? `<span class="gb-sub"> ×${it.count}</span>` : ''}
            </div>
            <button class="gb-btn tiny primary" data-shared-to-personal="${type}:${entityId}:${escapeHtml(ikey)}">개인으로 이동</button>
          </div></div>`;
        }).join('');
    return `<div class="gb-panel" style="margin-top:10px;">
      <div class="gb-section-title">⚔️ 개인 장비창 / 인벤토리</div>
      ${tabBar}
      <div class="gb-section-title" style="margin-top:8px;">개인 인벤 (${items.length}개)</div>
      ${itemsHtml}
      <div class="gb-section-title" style="margin-top:8px;">📦 공용 인벤에서 이동</div>
      ${fromSharedHtml}
    </div>`;
  }

  function renderMonsterEditor() {
    ensureSelections();
    const item = deepClone(getMonsterById(model.state.selected.monsters) || {
      id:'', name:'', kind:'Normal', role:'', position:'근거리물리', row:'front', rank:'E',
      stats:{ str:5, con:5, int:5, agi:5, sense:5 }, hp:100, mp:0, sp:50, atk:5, pdef:3, mdef:3,
      damageType:'physical', attackStat:'str', skills:[], note:''
    });
    const list = (model.db.monsters || []).map(c => `<button class="gb-list-item ${c.id===model.state.selected.monsters?'is-active':''}" data-select-type="monsters" data-id="${escapeHtml(c.id)}">${escapeHtml(c.name)} <span class="gb-sub">[${escapeHtml(c.kind || 'Normal')}]</span></button>`).join('');
    return `
      <div class="gb-grid db">
        <div class="gb-panel"><div class="gb-section-title">몬스터 목록</div>${list || '<div class="gb-sub">등록된 몬스터 없음.</div>'}<div class="gb-btn-row"><button class="gb-btn" id="gb-mon-new">새 몬스터</button><button class="gb-btn danger" id="gb-mon-clear-all">몬스터 전체 삭제</button></div></div>
        <div class="gb-panel">
          <div class="gb-section-title">몬스터 편집</div>
          <div class="gb-sub">v2.2에서는 몬스터 HP/기본피해/스킬배율을 랭크·종류·행 기준 몬스터 프로필로 다시 계산한다. 저장된 이름/종족/스킬/행/포지션은 그대로 활용된다.</div>
          <div class="gb-grid two">
            <label>ID<input class="gb-input" id="gb-mon-id" value="${escapeHtml(item.id)}" /></label>
            <label>이름<input class="gb-input" id="gb-mon-name" value="${escapeHtml(item.name)}" /></label>
            <label>종류<input class="gb-input" id="gb-mon-kind" value="${escapeHtml(item.kind || '')}" /></label>
            <label>역할<input class="gb-input" id="gb-mon-role" value="${escapeHtml(item.role || '')}" /></label>
            <label>포지션<input class="gb-input" id="gb-mon-position" value="${escapeHtml(item.position || '')}" /></label>
            <label>행<select class="gb-input" id="gb-mon-row">${optionHtml('front','전열',item.row==='front')}${optionHtml('mid','중열',item.row==='mid')}${optionHtml('back','후열',item.row==='back')}</select></label>
            <label>랭크<select class="gb-input" id="gb-mon-rank">${GRADE_ORDER.map(g=>optionHtml(g,g,item.rank===g)).join('')}</select></label>
            <label>HP(참조값)<input class="gb-input" id="gb-mon-hp" type="number" value="${escapeHtml(item.hp)}" /></label>
            <label>MP(참조값)<input class="gb-input" id="gb-mon-mp" type="number" value="${escapeHtml(item.mp)}" /></label>
            <label>SP(참조값)<input class="gb-input" id="gb-mon-sp" type="number" value="${escapeHtml(item.sp)}" /></label>
            <label>ATK(참조값)<input class="gb-input" id="gb-mon-atk" type="number" value="${escapeHtml(item.atk)}" /></label>
            <label>물리방어<input class="gb-input" id="gb-mon-pdef" type="number" value="${escapeHtml(item.pdef)}" /></label>
            <label>마법방어<input class="gb-input" id="gb-mon-mdef" type="number" value="${escapeHtml(item.mdef)}" /></label>
            <label>STR<input class="gb-input" id="gb-mon-str" type="number" value="${escapeHtml(item.stats.str)}" /></label>
            <label>CON<input class="gb-input" id="gb-mon-con" type="number" value="${escapeHtml(item.stats.con)}" /></label>
            <label>INT<input class="gb-input" id="gb-mon-int" type="number" value="${escapeHtml(item.stats.int)}" /></label>
            <label>AGI<input class="gb-input" id="gb-mon-agi" type="number" value="${escapeHtml(item.stats.agi)}" /></label>
            <label>SENSE<input class="gb-input" id="gb-mon-sense" type="number" value="${escapeHtml(item.stats.sense)}" /></label>
            <label>피해 타입<select class="gb-input" id="gb-mon-dmgtype">${optionHtml('physical','physical',item.damageType==='physical')}${optionHtml('magic','magic',item.damageType==='magic')}</select></label>
            <label>공격 스탯<select class="gb-input" id="gb-mon-atkstat">${['str','con','int','agi','sense'].map(s=>optionHtml(s,s,item.attackStat===s)).join('')}</select></label>
            <label>기본 위협값<input class="gb-input" id="gb-mon-threat" type="number" value="${escapeHtml(item.threatBase != null ? item.threatBase : inferThreatBase(item.position,item.row))}" /></label>
            <label>스킬 ID(쉼표구분)<input class="gb-input" id="gb-mon-skills" value="${escapeHtml((item.skills||[]).join(', '))}" /></label>
          </div>
          <label>메모<textarea class="gb-textarea short" id="gb-mon-note">${escapeHtml(item.note || '')}</textarea></label>
          <div class="gb-btn-row"><button class="gb-btn primary" id="gb-mon-save">저장</button><button class="gb-btn" id="gb-mon-delete">삭제</button></div>
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(148,163,184,0.16);">
            <div class="gb-section-title">몬스터 JSON 가져오기 / 내보내기</div>
            <div class="gb-sub">배열 <code>[...]</code> 또는 객체 <code>{"monsters":[...]}</code> 둘 다 지원. 같은 ID는 덮어쓴다.</div>
            <textarea class="gb-textarea short" id="gb-mon-json"></textarea>
            <div class="gb-btn-row">
              <button class="gb-btn" id="gb-mon-export-json">현재 몬스터 내보내기</button>
              <button class="gb-btn" id="gb-mon-import-json">JSON 가져오기</button>
              <button class="gb-btn" id="gb-mon-copy-json">JSON 복사</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderPersonaEditor() {
    ensureSelections();
    const blankPersona = {
      id:'', name:'', job:'', rank:'E', row:'back',
      stats:{ str:5, con:5, int:5, agi:5, sense:5 },
      hp:200, mp:80, sp:80, atk:5, pdef:3, mdef:3,
      damageType:'magic', attackStat:'int', skills:[], level:1, exp:0, totalExp:0, note:''
    };
    const item = deepClone(getPersonaById(model.state.selected.personas) || blankPersona);
    if (!item.stats) item.stats = { str:5, con:5, int:5, agi:5, sense:5 };
    const list = (model.db.personas || []).map(c => `<button class="gb-list-item ${c.id===model.state.selected.personas?'is-active':''}" data-select-type="personas" data-id="${escapeHtml(c.id)}">${escapeHtml(c.name)} <span class="gb-sub">[${escapeHtml(c.job||'페르소나')}] Lv${Number(c.level||1)}</span></button>`).join('');
    return `
      <div class="gb-grid db">
        <div class="gb-panel"><div class="gb-section-title">페르소나 목록</div>${list || '<div class="gb-sub">등록된 페르소나 없음.</div>'}<div class="gb-btn-row"><button class="gb-btn" id="gb-persona-new">새 페르소나</button></div></div>
        <div class="gb-panel">
          <div class="gb-section-title">페르소나 편집</div>
          <div class="gb-grid two">
            <label>ID<input class="gb-input" id="gb-persona-id" value="${escapeHtml(item.id)}" /></label>
            <label>이름<input class="gb-input" id="gb-persona-name" value="${escapeHtml(item.name)}" /></label>
            <label>직업/역할<input class="gb-input" id="gb-persona-job" value="${escapeHtml(item.job||'')}" /></label>
            <label>행<select class="gb-input" id="gb-persona-row">${optionHtml('front','전열',item.row==='front')}${optionHtml('mid','중열',item.row==='mid')}${optionHtml('back','후열',item.row==='back')}</select></label>
            <label>랭크<select class="gb-input" id="gb-persona-rank">${GRADE_ORDER.map(g=>optionHtml(g,g,item.rank===g)).join('')}</select></label>
            <label>HP<input class="gb-input" id="gb-persona-hp" type="number" value="${escapeHtml(item.hp)}" /></label>
            <label>MP<input class="gb-input" id="gb-persona-mp" type="number" value="${escapeHtml(item.mp)}" /></label>
            <label>SP<input class="gb-input" id="gb-persona-sp" type="number" value="${escapeHtml(item.sp)}" /></label>
            <label>ATK<input class="gb-input" id="gb-persona-atk" type="number" value="${escapeHtml(item.atk)}" /></label>
            <label>물리방어<input class="gb-input" id="gb-persona-pdef" type="number" value="${escapeHtml(item.pdef)}" /></label>
            <label>마법방어<input class="gb-input" id="gb-persona-mdef" type="number" value="${escapeHtml(item.mdef)}" /></label>
            <label>STR<input class="gb-input" id="gb-persona-str" type="number" value="${escapeHtml(item.stats.str)}" /></label>
            <label>CON<input class="gb-input" id="gb-persona-con" type="number" value="${escapeHtml(item.stats.con)}" /></label>
            <label>INT<input class="gb-input" id="gb-persona-int" type="number" value="${escapeHtml(item.stats.int)}" /></label>
            <label>AGI<input class="gb-input" id="gb-persona-agi" type="number" value="${escapeHtml(item.stats.agi)}" /></label>
            <label>SENSE<input class="gb-input" id="gb-persona-sense" type="number" value="${escapeHtml(item.stats.sense)}" /></label>
            <label>피해 타입<select class="gb-input" id="gb-persona-dmgtype">${optionHtml('physical','physical',item.damageType==='physical')}${optionHtml('magic','magic',item.damageType==='magic')}</select></label>
            <label>공격 스탯<select class="gb-input" id="gb-persona-atkstat">${['str','con','int','agi','sense'].map(s=>optionHtml(s,s,item.attackStat===s)).join('')}</select></label>
            <label>레벨<input class="gb-input" id="gb-persona-level" type="number" min="1" max="${EXP_MAX_LEVEL}" value="${Number(item.level||1)}" /></label>
            <label>현재 EXP<input class="gb-input" id="gb-persona-exp" type="number" min="0" value="${Number(item.exp||0)}" /></label>
            <label>스킬 ID(쉼표구분)<input class="gb-input" id="gb-persona-skills" value="${escapeHtml((item.skills||[]).join(', '))}" /></label>
          </div>
          <label>메모<textarea class="gb-textarea short" id="gb-persona-note">${escapeHtml(item.note || '')}</textarea></label>
          <div class="gb-btn-row"><button class="gb-btn primary" id="gb-persona-save">저장</button><button class="gb-btn" id="gb-persona-delete">삭제</button></div>
          ${item.id ? renderEquippedStatSection(item, 'persona') : ''}
        </div>
      </div>
      ${renderPersonalInventoryHtml('persona', item.id)}
    `;
  }

  function renderSkillEditor() {
    ensureSelections();
    const selId = model.state.selected.skills || '';
    // Try custom first, then builtin, then default empty
    const allSkills = getAllSkillMap();
    let item;
    if (selId && allSkills[selId]) {
      const sk = deepClone(allSkills[selId]);
      // Flatten for editor fields
      item = {
        id: sk.id || '',
        name: sk.name || '',
        grade: sk.grade || 'E',
        category: sk.category || 'singleAttack',
        target: sk.target || 'singleEnemy',
        coef: sk.coef != null ? sk.coef : 0,
        mp: (sk.costs && sk.costs.mp) || 0,
        sp: (sk.costs && sk.costs.sp) || 0,
        damageType: sk.damageType || 'physical',
        element: sk.element || 'none',
        statTypes: Array.isArray(sk.statTypes) ? sk.statTypes.join(', ') : (sk.statTypes || ''),
        duration: sk.duration || 0,
        ccType: (sk.cc && sk.cc.type) || '',
        ccTurns: (sk.cc && sk.cc.turns) || 1,
        ccChance: (sk.cc && sk.cc.chance != null) ? sk.cc.chance : '',
        buffStat: (sk.buff && sk.buff.stats) ? Object.keys(sk.buff.stats)[0] || '' : '',
        buffValue: (sk.buff && sk.buff.stats) ? Object.values(sk.buff.stats)[0] || 0 : 0,
        statusType: (sk.status && sk.status.type) || '',
        statusTurns: (sk.status && sk.status.turns) || 2,
        statusChance: (sk.status && sk.status.chance != null) ? sk.status.chance : '',
        cooldown: sk.cooldown || 0,
        desc: sk.desc || ''
      };
    } else {
      item = {
        id:'', name:'', grade:'E', category:'singleAttack', target:'singleEnemy', coef:1.0, mp:0, sp:0,
        damageType:'physical', element:'none', statTypes:'str', duration:0, ccType:'', ccTurns:1, ccChance:'', buffStat:'', buffValue:0, statusType:'', statusTurns:2, statusChance:'', cooldown:0, desc:''
      };
    }
    const catLabels = { singleAttack:'단일공격', aoeAttack:'광역공격', singleCC:'단일CC', aoeCC:'광역CC', singleHeal:'힐', aoeHeal:'광역힐', buff:'버프', passive:'패시브', utility:'유틸' };
    const customOverrides = new Set((model.db.customSkills || []).map(s => s.id));
    const builtins = Object.values(BUILTIN_SKILLS).map(sk => {
      const cat = catLabels[sk.category] || sk.category;
      const grade = sk.grade || '?';
      const rarity = sk.rarity ? ` <span class="gb-badge" style="background:#a855f7;color:#fff;">${escapeHtml(sk.rarity)}</span>` : '';
      const isOverridden = customOverrides.has(sk.id);
      const overrideBadge = isOverridden ? ' <span class="gb-badge" style="background:#ef4444;color:#fff;">수정됨</span>' : '';
      // 비용
      const costs = sk.costs || {};
      const costParts = [];
      if (costs.mp) costParts.push('MP:' + costs.mp);
      if (costs.sp) costParts.push('SP:' + costs.sp);
      const costStr = costParts.length ? costParts.join(' / ') : '';
      // 계수
      const coefStr = sk.coef != null ? '계수:' + sk.coef : (sk.baseSingleCoef != null ? '기본계수:' + sk.baseSingleCoef + ' (광역CC→½)' : '');
      // 성장형 byRank
      const byRankStr = sk.byRank ? Object.entries(sk.byRank).map(([g, v]) => {
        const parts = [];
        if (v.coef != null) parts.push('계수:' + v.coef);
        if (v.costs) { if (v.costs.mp) parts.push('MP:' + v.costs.mp); if (v.costs.sp) parts.push('SP:' + v.costs.sp); }
        if (v.buff && v.buff.stats) parts.push('버프:' + Object.entries(v.buff.stats).map(([s,n])=>s.toUpperCase()+'+'+n).join(','));
        if (v.passiveBonuses) parts.push('패시브:' + Object.entries(v.passiveBonuses).map(([s,n])=>s.toUpperCase()+'+'+n).join(','));
        return parts.length ? g + '(' + parts.join(', ') + ')' : '';
      }).filter(Boolean).join(' | ') : '';
      // 기타 정보
      const extras = [];
      if (sk.damageType) extras.push(sk.damageType === 'physical' ? '물리' : '마법');
      if (sk.element && sk.element !== 'none') extras.push('속성:' + sk.element);
      if (sk.cc) extras.push('CC:' + sk.cc.type + ' ' + sk.cc.turns + '턴');
      if (sk.buff && sk.buff.stats) extras.push('버프:' + Object.entries(sk.buff.stats).map(([s,n])=>s.toUpperCase()+'+'+n).join(','));
      if (sk.buff && sk.buff.threatBonus) extras.push('위협+' + sk.buff.threatBonus);
      if (sk.duration) extras.push(sk.duration + '턴');
      if (sk.resourceRestore) extras.push('회복:' + Object.entries(sk.resourceRestore).map(([k,v])=>k.toUpperCase()+'+'+v).join(','));
      if (sk.passiveBonuses) extras.push('패시브:' + Object.entries(sk.passiveBonuses).map(([s,n])=>s.toUpperCase()+'+'+n).join(','));
      if (sk.statTypes) extras.push('스탯:' + (Array.isArray(sk.statTypes) ? sk.statTypes : [sk.statTypes]).join('/'));
      if (sk.cooldown) extras.push('쿨타임:' + sk.cooldown + '턴');
      const extraStr = extras.join(' · ');
      return `<div class="gb-skill-row" data-load-builtin-skill="${escapeHtml(sk.id)}" style="padding:6px 0;border-bottom:1px solid rgba(148,163,184,0.1);cursor:pointer;" title="클릭하면 편집기로 불러옵니다">
        <div><strong>${escapeHtml(sk.name)}</strong> <span class="gb-badge">${escapeHtml(grade)}</span>${rarity} <span class="gb-badge">${escapeHtml(cat)}</span> <span class="gb-badge">${escapeHtml(sk.id)}</span>${overrideBadge}</div>
        <div style="font-size:12px;margin-top:2px;">${coefStr ? `<span style="color:#3b82f6;font-weight:600;">${escapeHtml(coefStr)}</span>` : ''}${costStr ? ` <span style="color:#f59e0b;">[${escapeHtml(costStr)}]</span>` : ''}</div>
        ${byRankStr ? `<div class="gb-sub" style="font-size:11px;margin-top:2px;">📈 성장: ${escapeHtml(byRankStr)}</div>` : ''}
        ${extraStr ? `<div class="gb-sub" style="font-size:11px;margin-top:1px;">${escapeHtml(extraStr)}</div>` : ''}
        <div class="gb-skill-desc" style="margin-top:2px;">${escapeHtml(sk.desc || '')}</div>
      </div>`;
    }).join('');
    const list = (model.db.customSkills || []).filter(c => !BUILTIN_SKILLS[c.id]).map(c => `<button class="gb-list-item ${c.id===model.state.selected.skills?'is-active':''}" data-select-type="skills" data-id="${escapeHtml(c.id)}">${escapeHtml(c.name)} <span class="gb-sub">[${escapeHtml(c.id)}]</span></button>`).join('');
    const isEditingBuiltin = item.id && BUILTIN_SKILLS[item.id];
    const editorTitle = isEditingBuiltin ? `내장 스킬 편집 — <span style="color:#3b82f6;">${escapeHtml(item.name || item.id)}</span>` : '커스텀 스킬 편집';
    return `
      ${builtins ? `<div class="gb-panel">
        <div class="gb-section-title">내장 스킬 <span class="gb-sub">(클릭하면 편집기에 불러옴)</span></div>
        <div class="gb-skill-list">${builtins}</div>
      </div>` : ''}
      <div class="gb-grid db" style="margin-top:12px;">
        <div class="gb-panel"><div class="gb-section-title">커스텀 스킬 목록</div>${list || '<div class="gb-sub">등록된 커스텀 스킬 없음.</div>'}<div class="gb-btn-row"><button class="gb-btn" id="gb-skill-new">새 스킬</button><button class="gb-btn danger" id="gb-skill-clear-all">스킬 전체삭제</button></div></div>
        <div class="gb-panel">
          <div class="gb-section-title">${editorTitle}</div>
          <div class="gb-grid two">
            <label>ID<input class="gb-input" id="gb-skill-id" value="${escapeHtml(item.id)}" /></label>
            <label>이름<input class="gb-input" id="gb-skill-name" value="${escapeHtml(item.name)}" /></label>
            <label>랭크<select class="gb-input" id="gb-skill-grade">${GRADE_ORDER.map(g=>optionHtml(g,g,item.grade===g)).join('')}</select></label>
            <label>카테고리<select class="gb-input" id="gb-skill-category">${['singleAttack','aoeAttack','singleCC','aoeCC','singleHeal','aoeHeal','buff','utility'].map(v=>optionHtml(v,v,item.category===v)).join('')}</select></label>
            <label>대상<select class="gb-input" id="gb-skill-target">${['singleEnemy','allEnemies','rowFront','rowMid','rowBack','rowFrontMid','rowMidBack','singleAlly','allAllies','self'].map(v=>optionHtml(v,v,item.target===v)).join('')}</select></label>
            <label>계수<input class="gb-input" id="gb-skill-coef" type="number" step="0.001" value="${escapeHtml(item.coef)}" /></label>
            <label>MP 비용<input class="gb-input" id="gb-skill-mp" type="number" value="${escapeHtml(item.mp)}" /></label>
            <label>SP 비용<input class="gb-input" id="gb-skill-sp" type="number" value="${escapeHtml(item.sp)}" /></label>
            <label>피해 타입<select class="gb-input" id="gb-skill-dmgtype">${optionHtml('physical','physical',item.damageType==='physical')}${optionHtml('magic','magic',item.damageType==='magic')}</select></label>
            <label>속성<select class="gb-input" id="gb-skill-element">${DAMAGE_ELEMENTS.map(v=>optionHtml(v,v,item.element===v)).join('')}</select></label>
            <label>스탯 타입(쉼표구분)<input class="gb-input" id="gb-skill-stattypes" value="${escapeHtml(item.statTypes)}" /></label>
            <label>지속 턴<input class="gb-input" id="gb-skill-duration" type="number" value="${escapeHtml(item.duration)}" /></label>
            <label>CC 종류<select class="gb-input" id="gb-skill-cctype">${['','stun','bind','sleep','silence','slow'].map(v=>optionHtml(v,v||'(없음)',(item.ccType||'')===v)).join('')}</select></label>
            <label>CC 턴<input class="gb-input" id="gb-skill-ccturns" type="number" value="${escapeHtml(item.ccTurns)}" /></label>
            <label>CC 확률(0~1)<input class="gb-input" id="gb-skill-ccchance" type="number" step="0.01" min="0" max="1" value="${escapeHtml(item.ccChance)}" placeholder="비우면 100%" /></label>
            <label>버프 스탯<select class="gb-input" id="gb-skill-buffstat">${['','str','con','int','agi','sense'].map(v=>optionHtml(v,v||'(없음)',(item.buffStat||'')===v)).join('')}</select></label>
            <label>버프 수치<input class="gb-input" id="gb-skill-buffvalue" type="number" value="${escapeHtml(item.buffValue)}" /></label>
            <label>상태이상<select class="gb-input" id="gb-skill-statustype">${['','poison','bleed','burn','curse','silence','slow'].map(v=>optionHtml(v,v||'(없음)',(item.statusType||'')===v)).join('')}</select></label>
            <label>상태이상 턴<input class="gb-input" id="gb-skill-statusturns" type="number" value="${escapeHtml(item.statusTurns)}" /></label>
            <label>상태이상 확률(0~1)<input class="gb-input" id="gb-skill-statuschance" type="number" step="0.01" min="0" max="1" value="${escapeHtml(item.statusChance)}" placeholder="비우면 기본값" /></label>
            <label>쿨타임(턴)<input class="gb-input" id="gb-skill-cooldown" type="number" value="${escapeHtml(item.cooldown)}" placeholder="0=없음" /></label>
          </div>
          <label>설명<textarea class="gb-textarea short" id="gb-skill-desc">${escapeHtml(item.desc || '')}</textarea></label>
          <div class="gb-btn-row"><button class="gb-btn primary" id="gb-skill-save">저장</button>${isEditingBuiltin ? '<button class="gb-btn" id="gb-skill-restore" style="background:#ef4444;color:#fff;">원본 복원</button>' : '<button class="gb-btn" id="gb-skill-delete">삭제</button>'}</div>
          <div class="gb-sub">${isEditingBuiltin ? '내장 스킬을 수정하면 커스텀 오버라이드로 저장된다. "원본 복원"으로 되돌릴 수 있다.' : '광역 CC는 플러그인 공통 규칙으로 자동 보정된다. 즉 입력 계수는 단일CC 기준으로 넣고, 실제 적용은 1/2 계수 + 비용 2배다.'}</div>
        </div>
      </div>
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(148,163,184,0.16);">
        <div class="gb-section-title">스킬 JSON 가져오기 / 내보내기</div>
        <div class="gb-sub">배열 <code>[...]</code> 또는 객체 <code>{"skills":[...]}</code> 둘 다 지원. 같은 ID는 덮어쓴다. 여러 스킬을 한번에 추가할 수 있다.</div>
        <textarea class="gb-textarea short" id="gb-skill-json" placeholder='[{"id":"fireball","name":"파이어볼","grade":"C","category":"singleAttack","target":"singleEnemy","costs":{"mp":35},"coef":3.2,"statTypes":["int"],"damageType":"magic","element":"fire","desc":"화염 단일 공격"}]'></textarea>
        <div class="gb-btn-row">
          <button class="gb-btn" id="gb-skill-export-json">현재 스킬 내보내기</button>
          <button class="gb-btn" id="gb-skill-import-json">JSON 가져오기</button>
          <button class="gb-btn" id="gb-skill-copy-json">JSON 복사</button>
        </div>
      </div>
    `;
  }


  function renderMaterialEditor() {
    ensureSelections();
    const pack = getRareMaterialPack();
    const rareCatalog = getRareMaterialCatalog();
    const normalCatalog = getNormalMaterialCatalog();
    const scales = getRareMaterialScaleKeys();
    const item = deepClone(getMaterialTraitById(model.state.selected.materials) || {
      id:'', name:'', category:'offense', scale:scales[0] || 'percentSmall', element:'', status:'', note:''
    });
    const list = (pack.traits || []).map(t => {
      const valText = traitScaleValueText(t, 'C');
      const tail = [t.category, valText ? ('C랭크 ' + valText) : ''].filter(Boolean).join(' / ');
      return `<button class="gb-list-item ${t.id===model.state.selected.materials?'is-active':''}" data-select-type="materials" data-id="${escapeHtml(t.id)}">${escapeHtml(t.name)} <span class="gb-sub">[${escapeHtml(t.id)}]</span><div class="gb-sub">${escapeHtml(tail)}</div></button>`;
    }).join('');
    const scalePreview = scales.map(key => {
      const row = pack.valueScales[key] || {};
      return `<div class="gb-skill-row"><div><strong>${escapeHtml(key)}</strong></div><div class="gb-skill-desc">${GRADE_ORDER.map(g => `${g}:${row[g] != null ? row[g] : '-'}`).join(' / ')}</div></div>`;
    }).join('');
    const rarePreview = rareCatalog.slice(0, 5).map(it => `<div class="gb-sub">- ${escapeHtml(it.name || it.id || '이름없음')} <span class="gb-sub">[${escapeHtml(String(it.rank || ''))}]</span></div>`).join('');
    const normalPreview = normalCatalog.slice(0, 5).map(it => `<div class="gb-sub">- ${escapeHtml(it.sourceMonsterName || it.name || it.id || '이름없음')} → ${(it.dropOptions || []).slice(0,2).map(d => escapeHtml(d.name || d.materialId || '재료')).join(', ')}</div>`).join('');
    return `
      <div class="gb-grid db">
        <div class="gb-panel">
          <div class="gb-section-title">희귀재료 특성 목록</div>
          ${list || '<div class="gb-sub">등록된 희귀재료 특성 없음.</div>'}
          <div class="gb-btn-row"><button class="gb-btn" id="gb-mat-new">새 특성</button></div>
        </div>
        <div class="gb-panel">
          <div class="gb-section-title">희귀재료 특성 편집</div>
          <div class="gb-grid two">
            <label>ID<input class="gb-input" id="gb-mat-id" value="${escapeHtml(item.id)}" /></label>
            <label>이름<input class="gb-input" id="gb-mat-name" value="${escapeHtml(item.name)}" /></label>
            <label>카테고리<select class="gb-input" id="gb-mat-category">${['offense','defense','status_apply','status_resist','support'].map(v => optionHtml(v, v, item.category===v)).join('')}</select></label>
            <label>값 스케일<select class="gb-input" id="gb-mat-scale">${scales.map(v => optionHtml(v, v, item.scale===v)).join('')}</select></label>
            <label>속성<select class="gb-input" id="gb-mat-element">${['', ...DAMAGE_ELEMENTS].map(v => optionHtml(v, v || '(없음)', (item.element || '')===v)).join('')}</select></label>
            <label>상태이상<select class="gb-input" id="gb-mat-status">${['', ...STATUS_KEYS].map(v => optionHtml(v, v || '(없음)', (item.status || '')===v)).join('')}</select></label>
          </div>
          <label>메모<textarea class="gb-textarea short" id="gb-mat-note">${escapeHtml(item.note || '')}</textarea></label>
          <div class="gb-btn-row"><button class="gb-btn primary" id="gb-mat-save">저장</button><button class="gb-btn" id="gb-mat-delete">삭제</button></div>
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(148,163,184,0.16);">
            <div class="gb-section-title">재료 JSON 가져오기 / 내보내기</div>
            <div class="gb-sub">지원 형식: 배열 <code>[...]</code>, <code>{"traits":[...]}</code>, 전체 팩 <code>{version,note,valueScales,traits}</code>, 희귀재료 카탈로그 <code>{items:[...]}</code>, 일반재료 드랍 테이블 <code>{entries:[...]}</code>.</div>
            <textarea class="gb-textarea short" id="gb-mat-json"></textarea>
            <div class="gb-btn-row">
              <button class="gb-btn" id="gb-mat-export-json">현재 특성 내보내기</button>
              <button class="gb-btn" id="gb-mat-import-json">JSON 가져오기</button>
              <button class="gb-btn" id="gb-mat-copy-json">JSON 복사</button>
            </div>
          </div>
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(148,163,184,0.16);">
            <div class="gb-section-title">불러온 재료 데이터 요약</div>
            <div class="gb-sub">희귀재료 카탈로그: <strong>${rareCatalog.length}</strong>개</div>
            ${rarePreview || '<div class="gb-sub">희귀재료 카탈로그 미등록</div>'}
            <div style="height:10px;"></div>
            <div class="gb-sub">일반재료 드랍 엔트리: <strong>${normalCatalog.length}</strong>개</div>
            ${normalPreview || '<div class="gb-sub">일반재료 드랍 테이블 미등록</div>'}
          </div>
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(148,163,184,0.16);">
            <div class="gb-section-title">값 스케일 미리보기</div>
            <div class="gb-skill-list">${scalePreview || '<div class="gb-sub">스케일 정보 없음.</div>'}</div>
          </div>
        </div>
      </div>
    `;
  }



  // ── Equipment Editor ──────────────────────────────────────────────────────
  function renderEquipmentEditor() {
    ensureSelections();
    if (!Array.isArray(model.db.equipments)) model.db.equipments = [];
    const sel = model.state.selected.equipment || '';
    const eqs = model.db.equipments;
    const item = deepClone(eqs.find(e => e.id === sel) || {
      id:'', name:'', part:'weapon', rank:'E', enhance:0,
      infuse:0, traits:[], durability:100,
      atk:0, pdef:0, mdef:0, stats:{ str:0, con:0, int:0, agi:0, sense:0 },
      note:'', price:0, resistType:'', resistPct:0
    });

    // Auto-preview calculated values
    const rank = item.rank || 'E';
    const part = item.part || 'weapon';
    const enhance = Number(item.enhance || 0);
    const maxEnhance = EQUIP_MAX_ENHANCE[part] || 0;
    const maxInfuse = EQUIP_MAX_INFUSE[part] || 1;
    const autoBasePrice = calcEquipBasePrice(rank, part);
    const autoEnhPrice = calcEquipEnhancedPrice(autoBasePrice, enhance, rank);
    const rangeText = (() => {
      const r = EQUIP_PRICE_RANGE[rank];
      if (!r) return '';
      const fmt = n => n >= 1e8 ? (n/1e8).toFixed(1)+'억' : n >= 10000 ? Math.round(n/10000)+'만' : n+'원';
      return `${fmt(r[0])} ~ ${fmt(r[1])}`;
    })();

    // Item list filtered by active part filter
    const partFilter = model.state.equipPartFilter || '';

    const partList = EQUIP_PARTS.map(p =>
      `<button class="gb-btn ${partFilter===p?'primary':''}" data-eq-part-filter="${p}">${EQUIP_PART_LABELS[p]}</button>`
    ).join('');

    const filteredEqs = partFilter ? eqs.filter(e => e.part === partFilter) : eqs;
    const list = filteredEqs.map(e => {
      const label = `${e.name || e.id} [${EQUIP_PART_LABELS[e.part]||e.part}/${e.rank}+${e.enhance||0}]`;
      return `<button class="gb-list-item ${e.id===sel?'is-active':''}" data-select-type="equipment" data-id="${escapeHtml(e.id)}">${escapeHtml(label)}</button>`;
    }).join('');

    const traitsHtml = EQUIP_TRAIT_TYPES.map(t => {
      const hasTrait = (item.traits || []).includes(t);
      return `<label style="display:flex;align-items:center;gap:4px;font-size:0.85em;"><input type="checkbox" id="gb-eq-trait-${t}" ${hasTrait?'checked':''} />${escapeHtml(equipTraitDisplay(t, rank))}</label>`;
    }).join('');

    // Weapon ATK auto-calc display
    const baseAtk = WEAPON_BASE_ATK[rank] || 0;
    const atkPerEnhance = WEAPON_ENHANCE_ATK[rank] || 1;
    const calcAtk = part === 'weapon' ? baseAtk + enhance * atkPerEnhance : (part === 'subweapon' ? -Math.ceil((Number(item.pdef||0))/2) : 0);
    const armorStat = ARMOR_STAT_BY_RANK[rank] || {};
    const accessoryStat = ACCESSORY_STAT_BY_RANK[rank] || {};

    const priceDisplay = (() => {
      const p = Number(item.price || autoEnhPrice);
      if (p >= 1e8) return `${(p/1e8).toFixed(2)}억원`;
      if (p >= 10000) return `${Math.round(p/10000)}만원`;
      return `${p.toLocaleString('en-US')}원`;
    })();

    return `
      <div class="gb-grid db">
        <div class="gb-panel">
          <div class="gb-section-title">장비 목록</div>
          <div class="gb-btn-row" style="flex-wrap:wrap;gap:4px;">
            <button class="gb-btn ${!partFilter?'primary':''}" data-eq-part-filter="">전체</button>
            ${partList}
          </div>
          <div style="margin-top:6px;">${list || '<div class="gb-sub">등록된 장비 없음.</div>'}</div>
          <div class="gb-btn-row" style="margin-top:8px;">
            <button class="gb-btn" id="gb-eq-new">새 장비</button>
            <button class="gb-btn" id="gb-eq-export">내보내기</button>
          </div>
        </div>
        <div class="gb-panel">
          <div class="gb-section-title">장비 편집</div>
          <div class="gb-sub" style="color:#94a3b8;">등급별 시세: <strong>${escapeHtml(rangeText)}</strong> | 자동 기준가: <strong>${escapeHtml(priceDisplay)}</strong></div>
          <div class="gb-grid two" style="margin-top:8px;">
            <label>ID<input class="gb-input" id="gb-eq-id" value="${escapeHtml(item.id)}" /></label>
            <label>이름<input class="gb-input" id="gb-eq-name" value="${escapeHtml(item.name)}" /></label>
            <label>부위<select class="gb-input" id="gb-eq-part">
              ${EQUIP_PARTS.map(p => `<option value="${p}" ${item.part===p?'selected':''}>${EQUIP_PART_LABELS[p]}</option>`).join('')}
            </select></label>
            <label>등급<select class="gb-input" id="gb-eq-rank">
              ${GRADE_ORDER.map(g => `<option value="${g}" ${item.rank===g?'selected':''}>${g}</option>`).join('')}
            </select></label>
            <label>강화 (+0~+${maxEnhance})<input class="gb-input" id="gb-eq-enhance" type="number" min="0" max="${maxEnhance}" value="${enhance}" /></label>
            <label>인퓨전 횟수 (최대 ${maxInfuse})<input class="gb-input" id="gb-eq-infuse" type="number" min="0" max="${maxInfuse}" value="${Number(item.infuse||0)}" /></label>
            <label>내구도 (0~100)<input class="gb-input" id="gb-eq-durability" type="number" min="0" max="100" value="${Number(item.durability != null ? item.durability : 100)}" /></label>
            <label>가격 (0=자동)<input class="gb-input" id="gb-eq-price" type="number" min="0" value="${Number(item.price||0)}" /></label>
          </div>

          ${part === 'weapon' ? `
          <div class="gb-sub" style="margin-top:6px;">⚔️ 무기: 기본 ATK <strong>${baseAtk}</strong> + 강화당 <strong>+${atkPerEnhance}</strong> → +${enhance}강 ATK <strong>${baseAtk + enhance*atkPerEnhance}</strong></div>
          <div class="gb-grid two">
            <label>ATK (0=자동)<input class="gb-input" id="gb-eq-atk" type="number" value="${Number(item.atk||0)}" /></label>
          </div>` : ''}

          ${part === 'subweapon' ? `
          <div class="gb-sub" style="margin-top:6px;">🛡️ 보조무기(방패): 물리방어 입력 시 ATK는 자동으로 -(물리방어/2) 적용</div>
          <div class="gb-grid two">
            <label>물리방어<input class="gb-input" id="gb-eq-pdef" type="number" value="${Number(item.pdef||0)}" /></label>
          </div>` : ''}

          ${part === 'armor' ? `
          <div class="gb-sub" style="margin-top:6px;">🛡 방어구: 물리방어/마법방어 ${armorStat.defRange?armorStat.defRange[0]+'~'+armorStat.defRange[1]:''} | 총 스탯합 ${armorStat.totalStatSum||0} | 강화당 주스탯 +${armorStat.enhanceStat||0}</div>
          <div class="gb-sub" style="color:#94a3b8;">⚗️ 저항은 희귀재료 인퓨즈로 부여 (DB에서 직접 수정 가능). 기본 저항 없음.</div>
          <div class="gb-grid two">
            <label>물리방어<input class="gb-input" id="gb-eq-pdef" type="number" value="${Number(item.pdef||0)}" /></label>
            <label>마법방어<input class="gb-input" id="gb-eq-mdef" type="number" value="${Number(item.mdef||0)}" /></label>
            <label>저항 타입 (인퓨즈 결과)<select class="gb-input" id="gb-eq-resist-type">
              <option value="">없음</option>
              ${['physical','magic','fire','ice','lightning','dark','light'].map(t => `<option value="${t}" ${item.resistType===t?'selected':''}>${t}</option>`).join('')}
            </select></label>
            <label>저항 %<input class="gb-input" id="gb-eq-resist-pct" type="number" min="0" max="100" value="${Number(item.resistPct||0)}" /></label>
            <label>총 스탯합 적용 주스탯<select class="gb-input" id="gb-eq-main-stat">
              ${['str','con','int','agi','sense'].map(s => `<option value="${s}" ${item.mainStat===s?'selected':''}>${s}</option>`).join('')}
            </select></label>
          </div>` : ''}

          ${part === 'accessory' ? `
          <div class="gb-sub" style="margin-top:6px;">💍 악세서리: 총 스탯합 ${accessoryStat.totalStatSum||0} | 특성 슬롯 ${accessoryStat.traits||1}개 | 강화당 주스탯 +${accessoryStat.enhanceStat||0}</div>
          <div class="gb-sub" style="color:#a78bfa;">✨ ${rank}등급 특성 효과 예시: 물리/마법 피해 +${(DEFAULT_RARE_MATERIAL_PACK.valueScales.percentSmall||{})[rank]||0}%, 치확 +${(DEFAULT_RARE_MATERIAL_PACK.valueScales.critChance||{})[rank]||0}%, 치피 +${(DEFAULT_RARE_MATERIAL_PACK.valueScales.critDamage||{})[rank]||0}%, 상태이상부여/저항 +${(DEFAULT_RARE_MATERIAL_PACK.valueScales.statusPercent||{})[rank]||0}%</div>
          <div class="gb-grid two">
            <label>총 스탯합 적용 주스탯<select class="gb-input" id="gb-eq-main-stat">
              ${['str','con','int','agi','sense'].map(s => `<option value="${s}" ${item.mainStat===s?'selected':''}>${s}</option>`).join('')}
            </select></label>
          </div>` : ''}

          <div style="margin-top:8px;">
            <div class="gb-section-title">특성(Trait)</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px 14px;">${traitsHtml}</div>
          </div>
          <label style="margin-top:8px;display:block;">메모<textarea class="gb-textarea short" id="gb-eq-note">${escapeHtml(item.note||'')}</textarea></label>
          <div class="gb-btn-row"><button class="gb-btn primary" id="gb-eq-save">저장</button><button class="gb-btn" id="gb-eq-delete">삭제</button></div>

          <div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(148,163,184,0.18);">
            <div class="gb-section-title">🔧 수리비 계산기</div>
            <div class="gb-sub">현재 내구도: <strong>${Number(item.durability != null ? item.durability : 100)}%</strong></div>
            <div class="gb-grid two">
              <label>수리 후 내구도<input class="gb-input" id="gb-eq-repair-target" type="number" min="0" max="100" value="100" /></label>
              <label style="display:flex;align-items:flex-end;">
                <button class="gb-btn" id="gb-eq-calc-repair">수리비 계산</button>
              </label>
            </div>
            <div id="gb-eq-repair-result" class="gb-sub"></div>
          </div>

          <div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(148,163,184,0.18);">
            <div class="gb-section-title">장비 JSON 가져오기</div>
            <textarea class="gb-textarea short" id="gb-eq-json"></textarea>
            <div class="gb-btn-row">
              <button class="gb-btn" id="gb-eq-import-json">JSON 가져오기</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }


function renderDbView() {
    const tab = model.state.dbTab || 'characters';
    const inner = tab === 'characters' ? renderCharacterEditor()
      : tab === 'monsters' ? renderMonsterEditor()
      : tab === 'personas' ? renderPersonaEditor()
      : tab === 'materials' ? renderMaterialEditor()
      : tab === 'equipment' ? renderEquipmentEditor()
      : renderSkillEditor();
    return `
      <div class="gb-btn-row">
        <button class="gb-btn ${tab==='characters'?'primary':''}" data-dbtab="characters">캐릭터</button>
        <button class="gb-btn ${tab==='personas'?'primary':''}" data-dbtab="personas">페르소나</button>
        <button class="gb-btn ${tab==='skills'?'primary':''}" data-dbtab="skills">스킬</button>
        <button class="gb-btn ${tab==='monsters'?'primary':''}" data-dbtab="monsters">몬스터</button>
        <button class="gb-btn ${tab==='materials'?'primary':''}" data-dbtab="materials">재료</button>
        <button class="gb-btn ${tab==='equipment'?'primary':''}" data-dbtab="equipment">장비</button>
      </div>
      <div style="margin-top:12px;">${inner}</div>
    `;
  }


function renderApp() {
  ensureSelections();
  const root = model.root || document.getElementById(UI_ID);
  if (!root) return;
  model.root = root;
  // 판매 경매 애니메이션 타이머 자동 재개 (페이지 재렌더 후)
  const ss = model.state.auctionSell;
  if (ss && ss.done === false && (ss.revealedCount ?? 0) < (ss.fullLog||[]).length && !_sellAuctionTimerId) {
    _startSellAuctionTimer();
  }
  const view = model.state.view || 'hub';
  let body;
  if      (view === 'hub')         body = renderHub();
  else if (view === 'gate')        body = renderGateView();
  else if (view === 'battle')      body = renderBattleRuntime();
  else if (view === 'party')       body = renderPartyView();
  else if (view === 'character')   body = renderCharacterView();
  else if (view === 'inventory')   body = renderInventoryView();
  else if (view === 'association') body = renderAssociationView();
  else if (view === 'shop')        body = renderShopView();
  else if (view === 'home')        body = renderHomeView();
  else if (view === 'guild')       body = renderGuildView();
  else                             body = renderDbView();
  root.innerHTML = `
    <div class="gb-shell ${model.state.visible ? '' : 'hidden'}">
      <div class="gb-header">
        <div>
          <div class="gb-title">⚔️ Gate Battle Prototype v2.2</div>
          <div class="gb-sub">허브 · 게이트 · 전투 · 파티 · 캐릭터 · 공용인벤 · DB</div>
        </div>
        <div style="display:flex; gap:8px; align-items:flex-start; flex-wrap:wrap;">
          <button class="gb-btn ${view==='hub'?'primary':''}" data-go="hub">허브</button>
          <button class="gb-btn ${view==='gate'?'primary':''}" data-go="gate">게이트</button>
          <button class="gb-btn ${view==='battle'?'primary':''}" data-go="battle">전투</button>
          <button class="gb-btn ${view==='party'?'primary':''}" data-go="party">파티</button>
          <button class="gb-btn ${view==='inventory'?'primary':''}" data-go="inventory">공용인벤</button>
          <button class="gb-btn ${view==='character'?'primary':''}" data-go="character">캐릭터</button>
          <button class="gb-btn ${view==='db'?'primary':''}" data-go="db">DB</button>
          <button class="gb-btn" id="gb-close-ui">닫기</button>
        </div>
      </div>
      ${body}
    </div>
  `;
  bindUI();
}

function readPartySlotsFromUI() {
    const slots = [];
    for (let i=0;i<MAX_PARTY;i+=1) slots.push(fieldValue(`#gb-party-slot-${i}`));
    return slots;
  }
  function readEnemySlotsFromUI() {
    const slots = [];
    for (let i=0;i<MAX_ENEMIES;i+=1) slots.push(fieldValue(`#gb-enemy-slot-${i}`));
    return slots;
  }
  function collectPendingActions() {
    const runtime = model.state.runtime;
    const pending = {};
    getAlive(runtime.party).forEach(unit => {
      pending[unit.uid] = {
        mode: fieldValue(`#gb-act-mode-${unit.uid}`) || 'basic',
        skillId: fieldValue(`#gb-act-skill-${unit.uid}`) || '',
        target: fieldValue(`#gb-act-target-${unit.uid}`) || ''
      };
    });
    runtime.pendingActions = pending;
  }

  function upsertById(list, item) {
    const idx = list.findIndex(x => x.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
  }

  async function saveCharacterFromForm() {
    const id = slugify(fieldValue('#gb-char-id') || fieldValue('#gb-char-name'));
    const existingChar = getCharById(id) || {};
    const item = {
      id,
      name: fieldValue('#gb-char-name'),
      job: fieldValue('#gb-char-job'),
      position: fieldValue('#gb-char-position'),
      row: fieldValue('#gb-char-row'),
      rank: fieldValue('#gb-char-rank'),
      hp: Number(fieldValue('#gb-char-hp') || 0),
      mp: Number(fieldValue('#gb-char-mp') || 0),
      sp: Number(fieldValue('#gb-char-sp') || 0),
      atk: Number(fieldValue('#gb-char-atk') || 0),
      pdef: Number(fieldValue('#gb-char-pdef') || 0),
      mdef: Number(fieldValue('#gb-char-mdef') || 0),
      damageType: fieldValue('#gb-char-dmgtype') || 'physical',
      attackStat: fieldValue('#gb-char-atkstat') || 'str',
      threatBase: Number(fieldValue('#gb-char-threat') || 0),
      skills: splitCsv(fieldValue('#gb-char-skills')),
      note: fieldValue('#gb-char-note'),
      level: Math.max(1, Math.min(EXP_MAX_LEVEL, Number(fieldValue('#gb-char-level') || 1))),
      exp: Math.max(0, Number(fieldValue('#gb-char-exp') || 0)),
      totalExp: Math.max(0, Number(fieldValue('#gb-char-totalexp') || 0)),
      bagId: existingChar.bagId || 'none',
      stats: {
        str:Number(fieldValue('#gb-char-str') || 0),
        con:Number(fieldValue('#gb-char-con') || 0),
        int:Number(fieldValue('#gb-char-int') || 0),
        agi:Number(fieldValue('#gb-char-agi') || 0),
        sense:Number(fieldValue('#gb-char-sense') || 0)
      }
    };
    // HP/MP/SP가 0이면 스탯 기반 자동 계산
    if (item.hp <= 0) item.hp = 100 + (item.stats.con - 10) * 10 + (item.stats.str - 10) * 3;
    if (item.mp <= 0) item.mp = 100 + (item.stats.int - 10) * 10 + (item.stats.sense - 10) * 3;
    if (item.sp <= 0) item.sp = 100 + (item.stats.agi - 10) * 10 + (item.stats.sense - 10) * 3;
    if (existingChar.inventory) item.inventory = existingChar.inventory;
    if (!item.name) throw new Error('캐릭터 이름이 비어 있다.');
    upsertById(model.db.characters, item);
    model.state.selected.characters = id;
    await saveDb(); await saveState(); renderApp(); toast('캐릭터 저장 완료');
  }
  async function clearAllMonsters() {
    model.db.monsters = [];
    model.state.selected.monsters = '';
    model.db.battleSetup.enemySlots = Array(MAX_ENEMIES).fill('');
    model.state.runtime = buildDefaultRuntime();
    model.state.gate = buildDefaultGateState();
    generateGateOptions(model.state.gate.size || 'small', model.state.gate.rank || 'E');
    await saveDb(); await saveState(); renderApp(); toast('몬스터 전체 삭제 완료');
  }
  async function clearAllCharacters() {
    model.db.characters = [];
    model.state.selected.characters = '';
    model.db.battleSetup.partySlots = Array(MAX_PARTY).fill('');
    model.db.team = [];
    model.state.runtime = buildDefaultRuntime();
    await saveDb(); await saveState(); renderApp(); toast('캐릭터 전체 삭제 완료');
  }
  async function clearAllCustomSkills() {
    model.db.customSkills = [];
    model.state.selected.skills = '';
    await saveDb(); await saveState(); renderApp(); toast('커스텀 스킬 전체 삭제 완료');
  }
  function exportSkillsJsonText() {
    return JSON.stringify({ skills: deepClone(model.db.customSkills || []) }, null, 2);
  }
  async function importSkillsJsonFromText(raw) {
    const txt = String(raw || '').trim();
    if (!txt) throw new Error('붙여넣은 JSON이 비어 있다.');
    let parsed;
    try { parsed = JSON.parse(txt); }
    catch (e) { throw new Error('JSON 파싱 실패: ' + e.message); }
    const rows = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.skills) ? parsed.skills : null);
    if (!rows) throw new Error('형식이 맞지 않는다. 배열 [...] 또는 { "skills":[...] } 형식이어야 한다.');
    if (!rows.length) throw new Error('가져올 스킬이 없다.');
    let count = 0;
    rows.forEach((row) => {
      if (!row || typeof row !== 'object') return;
      const item = deepClone(row);
      if (!item.id) item.id = slugify(item.name || 'skill_' + count);
      if (!item.name) return;
      if (!item.grade) item.grade = 'E';
      if (!item.category) item.category = 'singleAttack';
      if (!item.target) item.target = 'singleEnemy';
      if (!item.costs) item.costs = { mp:0, sp:0 };
      if (item.coef == null) item.coef = 1.0;
      if (!item.damageType) item.damageType = 'physical';
      if (!item.element) item.element = 'none';
      if (!item.statTypes) item.statTypes = ['str'];
      if (!item.desc) item.desc = '';
      upsertById(model.db.customSkills, item);
      count += 1;
    });
    ensureSelections();
    await saveDb(); await saveState(); renderApp();
    toast(`스킬 ${count}개 가져오기 완료`);
  }
  
  async function saveMonsterFromForm() {
    const id = slugify(fieldValue('#gb-mon-id') || fieldValue('#gb-mon-name'));
    const prev = deepClone(getMonsterById(model.state.selected.monsters) || {});
    const item = normalizeImportedMonster(Object.assign({}, prev, {
      id,
      name: fieldValue('#gb-mon-name'),
      kind: fieldValue('#gb-mon-kind'),
      role: fieldValue('#gb-mon-role'),
      position: fieldValue('#gb-mon-position'),
      row: fieldValue('#gb-mon-row'),
      rank: fieldValue('#gb-mon-rank'),
      hp: Number(fieldValue('#gb-mon-hp') || 0),
      mp: Number(fieldValue('#gb-mon-mp') || 0),
      sp: Number(fieldValue('#gb-mon-sp') || 0),
      atk: Number(fieldValue('#gb-mon-atk') || 0),
      pdef: Number(fieldValue('#gb-mon-pdef') || 0),
      mdef: Number(fieldValue('#gb-mon-mdef') || 0),
      damageType: fieldValue('#gb-mon-dmgtype') || 'physical',
      attackStat: fieldValue('#gb-mon-atkstat') || 'str',
      threatBase: Number(fieldValue('#gb-mon-threat') || 0),
      skills: splitCsv(fieldValue('#gb-mon-skills')),
      note: fieldValue('#gb-mon-note'),
      stats: {
        str:Number(fieldValue('#gb-mon-str') || 0),
        con:Number(fieldValue('#gb-mon-con') || 0),
        int:Number(fieldValue('#gb-mon-int') || 0),
        agi:Number(fieldValue('#gb-mon-agi') || 0),
        sense:Number(fieldValue('#gb-mon-sense') || 0)
      }
    }), 0);
    if (!item.name) throw new Error('몬스터 이름이 비어 있다.');
    upsertById(model.db.monsters, item);
    model.state.selected.monsters = id;
    await saveDb(); await saveState(); renderApp(); toast('몬스터 저장 완료');
  }

  function normalizeImportedMonster(raw, idx) {
    const item = deepClone(raw || {});
    const id = slugify(item.id || item.name || `monster_${idx+1}`);
    const parsedMeta = parseMonsterMeta(item);
    return {
      id,
      name: String(item.name || id),
      kind: String(item.kind || 'Normal'),
      role: String(item.role || ''),
      position: String(item.position || ''),
      row: normRow(item.row || inferRow(item.position, item.job)),
      rank: String(item.rank || 'E').toUpperCase(),
      hp: Number(item.hp || 0),
      mp: Number(item.mp || 0),
      sp: Number(item.sp || 0),
      atk: Number(item.atk || 0),
      pdef: Number(item.pdef || 0),
      mdef: Number(item.mdef || 0),
      damageType: item.damageType === 'magic' ? 'magic' : 'physical',
      attackStat: ['str','con','int','agi','sense'].includes(item.attackStat) ? item.attackStat : 'str',
      threatBase: Number(item.threatBase != null ? item.threatBase : inferThreatBase(item.position, item.row)),
      skills: Array.isArray(item.skills) ? item.skills.map(x => String(x).trim()).filter(Boolean) : splitCsv(String(item.skills || '')),
      note: String(item.note || ''),
      species: item.species || parsedMeta.species || '',
      baseElement: normElement(item.baseElement || item.element || parsedMeta.baseElement || 'none'),
      immunities: Array.isArray(item.immunities) ? item.immunities.map(normStatus).filter(Boolean) : (parsedMeta.immunities || []),
      damageTakenMods: Object.assign({}, parsedMeta.damageTakenMods || {}, item.damageTakenMods || {}),
      bonusVsBleeding: Number(item.bonusVsBleeding || parsedMeta.bonusVsBleeding || 1),
      aloneDamageTaken: Number(item.aloneDamageTaken || parsedMeta.aloneDamageTaken || 1),
      regenPct: Number(item.regenPct || parsedMeta.regenPct || 0),
      regenBlockedBy: Array.isArray(item.regenBlockedBy) ? item.regenBlockedBy.map(normStatus).filter(Boolean) : (parsedMeta.regenBlockedBy || []),
      onHitStatus: normStatus(item.onHitStatus || parsedMeta.onHitStatus || ''),
      onHitChance: Number(item.onHitChance || parsedMeta.onHitChance || 0),
      onHitTurns: Number(item.onHitTurns || parsedMeta.onHitTurns || 0),
      stats: normaliseStats(item.stats || {})
    };
  }
  function exportMonstersJsonText() {
    return JSON.stringify({ monsters: deepClone(model.db.monsters || []) }, null, 2);
  }
  async function importMonstersJsonFromText(raw) {
    const txt = String(raw || '').trim();
    if (!txt) throw new Error('붙여넣은 JSON이 비어 있다.');
    let parsed;
    try { parsed = JSON.parse(txt); }
    catch (e) { throw new Error('JSON 파싱 실패'); }
    const rows = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.monsters) ? parsed.monsters : null);
    if (!rows) throw new Error('형식이 맞지 않는다. 배열 또는 { monsters:[...] } 형식이어야 한다.');
    if (!rows.length) throw new Error('가져올 몬스터가 없다.');
    let count = 0;
    rows.forEach((row, idx) => {
      const item = normalizeImportedMonster(row, idx);
      if (!item.name) return;
      upsertById(model.db.monsters, item);
      count += 1;
    });
    ensureSelections();
    await saveDb();
    await saveState();
    renderApp();
    toast(`몬스터 ${count}개 가져오기 완료`);
  }

  function normalizeImportedMaterialTrait(raw, idx) {
    const item = deepClone(raw || {});
    const id = slugify(item.id || item.name || `rare_trait_${idx+1}`);
    const categories = ['offense','defense','status_apply','status_resist','support'];
    const scaleKeys = getRareMaterialScaleKeys();
    return {
      id,
      name: String(item.name || id),
      category: categories.includes(String(item.category || '')) ? String(item.category) : 'offense',
      scale: scaleKeys.includes(String(item.scale || '')) ? String(item.scale) : (scaleKeys[0] || 'percentSmall'),
      element: item.element ? normElement(item.element) : '',
      status: item.status ? normStatus(item.status) : '',
      note: String(item.note || item.desc || '')
    };
  }
  function normalizeImportedRareMaterialCatalogItem(raw, idx) {
    const item = deepClone(raw || {});
    const id = slugify(item.id || `${item.sourceMonsterId || 'monster'}_${item.traitId || 'trait'}_${idx+1}`);
    return {
      id,
      name: String(item.name || id),
      rank: String(item.rank || 'E').toUpperCase(),
      sourceMonsterName: String(item.sourceMonsterName || ''),
      sourceMonsterId: String(item.sourceMonsterId || ''),
      sourceKind: String(item.sourceKind || ''),
      species: String(item.species || ''),
      traitId: String(item.traitId || ''),
      traitName: String(item.traitName || ''),
      traitScale: String(item.traitScale || ''),
      traitValue: Number(item.traitValue || 0),
      traitUnit: String(item.traitUnit || '%'),
      priceTier: String(item.priceTier || ''),
      basePriceMin: Number(item.basePriceMin || 0),
      basePriceMax: Number(item.basePriceMax || 0),
      suggestedPrice: Number(item.suggestedPrice || 0),
      materialCoreName: String(item.materialCoreName || ''),
      note: String(item.note || '')
    };
  }
  function normalizeImportedNormalMaterialEntry(raw, idx) {
    const item = deepClone(raw || {});
    const id = slugify(item.id || item.sourceMonsterId || `normal_material_entry_${idx+1}`);
    return {
      id,
      sourceMonsterId: String(item.sourceMonsterId || ''),
      sourceMonsterName: String(item.sourceMonsterName || item.name || ''),
      species: String(item.species || ''),
      rank: String(item.rank || 'E').toUpperCase(),
      position: String(item.position || ''),
      row: normRow(item.row || ''),
      damageType: String(item.damageType || ''),
      basePriceMin: Number(item.basePriceMin || 0),
      basePriceMax: Number(item.basePriceMax || 0),
      dropOptions: Array.isArray(item.dropOptions) ? item.dropOptions.map((opt, j) => ({
        materialId: slugify(opt.materialId || opt.name || `mat_${idx+1}_${j+1}`),
        name: String(opt.name || opt.materialId || `재료 ${j+1}`),
        weight: Number(opt.weight || 0),
        rank: String(opt.rank || item.rank || 'E').toUpperCase(),
        suggestedPrice: Number(opt.suggestedPrice || 0)
      })) : []
    };
  }
  function exportRareTraitsJsonText() {
    const pack = getRareMaterialPack();
    return JSON.stringify({ version:pack.version || 1, note:pack.note || '', valueScales:deepClone(pack.valueScales || {}), traits:deepClone(pack.traits || []) }, null, 2);
  }
  async function importMaterialJsonFromText(raw) {
    const txt = String(raw || '').trim();
    if (!txt) throw new Error('붙여넣은 JSON이 비어 있다.');
    let parsed;
    try { parsed = JSON.parse(txt); }
    catch (e) { throw new Error('JSON 파싱 실패'); }

    const pack = getRareMaterialPack();
    const rareCatalog = getRareMaterialCatalog();
    const normalCatalog = getNormalMaterialCatalog();

    let mode = '';
    let rows = null;

    if (Array.isArray(parsed)) {
      const first = parsed[0] || {};
      if (first && typeof first === 'object' && Array.isArray(first.dropOptions)) { mode = 'normalCatalog'; rows = parsed; }
      else if (first && typeof first === 'object' && ('traitId' in first || 'sourceMonsterName' in first || 'materialCoreName' in first)) { mode = 'rareCatalog'; rows = parsed; }
      else { mode = 'traits'; rows = parsed; }
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.traits)) {
      mode = 'traits'; rows = parsed.traits;
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
      mode = 'rareCatalog'; rows = parsed.items;
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.entries)) {
      mode = 'normalCatalog'; rows = parsed.entries;
    }

    if (!mode || !rows) throw new Error('형식이 맞지 않는다. 배열 / {traits:[...]} / {items:[...]} / {entries:[...]} 형식이어야 한다.');
    if (!rows.length) throw new Error('가져올 데이터가 없다.');

    if (mode === 'traits') {
      if (parsed && typeof parsed === 'object' && parsed.valueScales && typeof parsed.valueScales === 'object') pack.valueScales = deepClone(parsed.valueScales);
      if (parsed && typeof parsed === 'object' && parsed.version != null) pack.version = parsed.version;
      if (parsed && typeof parsed === 'object' && parsed.note != null) pack.note = String(parsed.note);
      let count = 0;
      rows.forEach((row, idx) => {
        const item = normalizeImportedMaterialTrait(row, idx);
        if (!item.name) return;
        upsertById(pack.traits, item);
        count += 1;
      });
      ensureSelections();
      await saveDb(); await saveState(); renderApp();
      toast(`희귀재료 특성 ${count}개 가져오기 완료`);
      return;
    }

    if (mode === 'rareCatalog') {
      let count = 0;
      rows.forEach((row, idx) => {
        const item = normalizeImportedRareMaterialCatalogItem(row, idx);
        if (!item.name) return;
        upsertById(rareCatalog, item);
        count += 1;
      });
      await saveDb(); await saveState(); renderApp();
      toast(`희귀재료 카탈로그 ${count}개 가져오기 완료`);
      return;
    }

    if (mode === 'normalCatalog') {
      let count = 0;
      rows.forEach((row, idx) => {
        const item = normalizeImportedNormalMaterialEntry(row, idx);
        if (!item.sourceMonsterName && !item.dropOptions.length) return;
        upsertById(normalCatalog, item);
        count += 1;
      });
      await saveDb(); await saveState(); renderApp();
      toast(`일반재료 드랍 엔트리 ${count}개 가져오기 완료`);
      return;
    }
  }
async function saveMaterialTraitFromForm() {
    const pack = getRareMaterialPack();
    const scaleKeys = getRareMaterialScaleKeys();
    const id = slugify(fieldValue('#gb-mat-id') || fieldValue('#gb-mat-name'));
    const item = {
      id,
      name: fieldValue('#gb-mat-name'),
      category: fieldValue('#gb-mat-category') || 'offense',
      scale: scaleKeys.includes(fieldValue('#gb-mat-scale')) ? fieldValue('#gb-mat-scale') : (scaleKeys[0] || 'percentSmall'),
      element: fieldValue('#gb-mat-element') ? normElement(fieldValue('#gb-mat-element')) : '',
      status: fieldValue('#gb-mat-status') ? normStatus(fieldValue('#gb-mat-status')) : '',
      note: fieldValue('#gb-mat-note') || ''
    };
    if (!item.name) throw new Error('희귀재료 특성 이름이 비어 있다.');
    upsertById(pack.traits, item);
    model.state.selected.materials = id;
    await saveDb(); await saveState(); renderApp(); toast('희귀재료 특성 저장 완료');
  }
  async function savePersonaFromForm() {
    const id = slugify(fieldValue('#gb-persona-id') || fieldValue('#gb-persona-name'));
    if (!id) throw new Error('페르소나 이름이 비어 있다.');
    const existing = getPersonaById(model.state.selected.personas) || {};
    const item = Object.assign({}, existing, {
      id,
      name: fieldValue('#gb-persona-name'),
      job: fieldValue('#gb-persona-job') || '',
      rank: fieldValue('#gb-persona-rank') || 'E',
      row: fieldValue('#gb-persona-row') || 'back',
      stats: {
        str: Number(fieldValue('#gb-persona-str') || 5),
        con: Number(fieldValue('#gb-persona-con') || 5),
        int: Number(fieldValue('#gb-persona-int') || 5),
        agi: Number(fieldValue('#gb-persona-agi') || 5),
        sense: Number(fieldValue('#gb-persona-sense') || 5),
      },
      hp: Number(fieldValue('#gb-persona-hp') || 200),
      mp: Number(fieldValue('#gb-persona-mp') || 80),
      sp: Number(fieldValue('#gb-persona-sp') || 80),
      atk: Number(fieldValue('#gb-persona-atk') || 5),
      pdef: Number(fieldValue('#gb-persona-pdef') || 3),
      mdef: Number(fieldValue('#gb-persona-mdef') || 3),
      damageType: fieldValue('#gb-persona-dmgtype') || 'magic',
      attackStat: fieldValue('#gb-persona-atkstat') || 'int',
      skills: fieldValue('#gb-persona-skills').split(',').map(s=>s.trim()).filter(Boolean),
      level: Number(fieldValue('#gb-persona-level') || 1),
      exp: Number(fieldValue('#gb-persona-exp') || 0),
      totalExp: Number(existing.totalExp || 0),
      note: fieldValue('#gb-persona-note') || '',
    });
    if (!item.name) throw new Error('페르소나 이름이 비어 있다.');
    upsertById(model.db.personas, item);
    model.state.selected.personas = id;
    await saveDb(); await saveState(); renderApp(); toast('페르소나 저장 완료');
  }
  async function saveSkillFromForm() {
    const id = slugify(fieldValue('#gb-skill-id') || fieldValue('#gb-skill-name'));
    const buffStat = fieldValue('#gb-skill-buffstat').trim();
    const buffValue = Number(fieldValue('#gb-skill-buffvalue') || 0);
    const ccType = fieldValue('#gb-skill-cctype').trim();
    const statusType = fieldValue('#gb-skill-statustype').trim();
    const item = {
      id,
      name:fieldValue('#gb-skill-name'),
      grade:fieldValue('#gb-skill-grade'),
      category:fieldValue('#gb-skill-category'),
      target:fieldValue('#gb-skill-target'),
      costs:{ mp:Number(fieldValue('#gb-skill-mp') || 0), sp:Number(fieldValue('#gb-skill-sp') || 0) },
      coef:Number(fieldValue('#gb-skill-coef') || 0),
      damageType:fieldValue('#gb-skill-dmgtype') || 'physical',
      element:normElement(fieldValue('#gb-skill-element') || 'none'),
      statTypes:splitCsv(fieldValue('#gb-skill-stattypes')),
      duration:Number(fieldValue('#gb-skill-duration') || 0),
      desc:fieldValue('#gb-skill-desc')
    };
    const cooldownVal = Number(fieldValue('#gb-skill-cooldown') || 0);
    if (cooldownVal > 0) item.cooldown = cooldownVal;
    if (buffStat && buffValue) item.buff = { stats:{ [buffStat]: buffValue } };
    if (ccType) {
      const ccObj = { type:ccType, turns:Number(fieldValue('#gb-skill-ccturns') || 1) };
      const ccChanceVal = fieldValue('#gb-skill-ccchance').trim();
      if (ccChanceVal !== '') ccObj.chance = Math.max(0, Math.min(1, Number(ccChanceVal)));
      item.cc = ccObj;
    }
    if (statusType) {
      const stObj = { type:statusType, turns:Number(fieldValue('#gb-skill-statusturns') || 2) };
      const stChanceVal = fieldValue('#gb-skill-statuschance').trim();
      if (stChanceVal !== '') stObj.chance = Math.max(0, Math.min(1, Number(stChanceVal)));
      item.status = stObj;
    }
    if (!item.name) throw new Error('스킬 이름이 비어 있다.');
    upsertById(model.db.customSkills, item);
    model.state.selected.skills = id;
    await saveDb(); await saveState(); renderApp(); toast('커스텀 스킬 저장 완료');
  }

  async function saveEquipmentFromForm() {
    const id = slugify(fieldValue('#gb-eq-id') || fieldValue('#gb-eq-name'));
    if (!id) throw new Error('장비 이름 또는 ID가 비어 있다.');
    const part = fieldValue('#gb-eq-part') || 'weapon';
    const rank = fieldValue('#gb-eq-rank') || 'E';
    const enhance = Math.max(0, Math.min(EQUIP_MAX_ENHANCE[part]||0, Number(fieldValue('#gb-eq-enhance')||0)));
    const infuse = Math.max(0, Math.min(EQUIP_MAX_INFUSE[part]||1, Number(fieldValue('#gb-eq-infuse')||0)));
    const durability = Math.max(0, Math.min(100, Number(fieldValue('#gb-eq-durability')||100)));
    const priceInput = Number(fieldValue('#gb-eq-price')||0);
    const autoPrice = calcEquipEnhancedPrice(calcEquipBasePrice(rank, part), enhance, rank);
    const price = priceInput > 0 ? priceInput : autoPrice;
    // Collect traits
    const traits = EQUIP_TRAIT_TYPES.filter(t => {
      const el = document.getElementById(`gb-eq-trait-${t}`);
      return el && el.checked;
    });
    const item = {
      id,
      name: fieldValue('#gb-eq-name') || id,
      part,
      rank,
      enhance,
      infuse,
      durability,
      price,
      traits,
      note: fieldValue('#gb-eq-note') || '',
      atk: Number(fieldValue('#gb-eq-atk')||0),
      pdef: Number(fieldValue('#gb-eq-pdef')||0),
      mdef: Number(fieldValue('#gb-eq-mdef')||0),
      mainStat: fieldValue('#gb-eq-main-stat') || 'str',
      resistType: fieldValue('#gb-eq-resist-type') || '',
      resistPct: Number(fieldValue('#gb-eq-resist-pct')||0),
      stats: { str:0, con:0, int:0, agi:0, sense:0 }
    };
    if (!Array.isArray(model.db.equipments)) model.db.equipments = [];
    upsertById(model.db.equipments, item);
    model.state.selected.equipment = id;
    await saveDb(); await saveState(); renderApp(); toast('장비 저장 완료');
  }

  async function deleteSelected(type) {
    const sel = model.state.selected[type];
    if (!sel) return;
    if (type === 'characters') model.db.characters = model.db.characters.filter(x => x.id !== sel);
    if (type === 'monsters') model.db.monsters = model.db.monsters.filter(x => x.id !== sel);
    if (type === 'personas') model.db.personas = model.db.personas.filter(x => x.id !== sel);
    if (type === 'skills') model.db.customSkills = model.db.customSkills.filter(x => x.id !== sel);
    if (type === 'materials') getRareMaterialPack().traits = getRareMaterialPack().traits.filter(x => x.id !== sel);
    if (type === 'equipment') { if (!Array.isArray(model.db.equipments)) model.db.equipments = []; model.db.equipments = model.db.equipments.filter(x => x.id !== sel); }
    model.state.selected[type] = '';
    ensureSelections();
    await saveDb(); await saveState(); renderApp(); toast('삭제 완료');
  }

  function bindUI() {
    const root = model.root;
    if (!root) return;
    const on = (selector, event, handler) => {
      const els = root.querySelectorAll(selector);
      els.forEach(el => el.addEventListener(event, handler));
    };

    on('#gb-close-ui', 'click', async () => {
      model.state.visible = false;
      await lsSet(KEY_VISIBLE, 'false');
      if (_hasRisu && Risuai.hideContainer) await Risuai.hideContainer();
      renderApp();
    });
    on('[data-go]', 'click', async (ev) => {
      model.state.view = ev.currentTarget.getAttribute('data-go');
      await saveState();
      renderApp();
    });
    // ── 팀 핸들러 ────────────────────────────────────────────────────────────────
    on('#gb-team-add-btn', 'click', async () => {
      const sel = document.getElementById('gb-team-add-sel');
      const charId = sel ? sel.value : '';
      if (!charId) { toast('추가할 인물을 선택하라.', true); return; }
      if (!Array.isArray(model.db.team)) model.db.team = [];
      if (model.db.team.find(m => m.charId === charId)) { toast('이미 팀에 있다.', true); return; }
      const n = model.db.team.length;
      const ratio = n === 0 ? 100 : Math.floor(100 / (n + 1));
      model.db.team.push({ charId, ratio });
      // 비율 균등화
      if (n > 0) {
        const each = Math.floor(100 / model.db.team.length);
        model.db.team.forEach(m => { m.ratio = each; });
        model.db.team[0].ratio += 100 - each * model.db.team.length;
      }
      await saveDb(); renderApp();
    });
    on('#gb-team-add-shared', 'click', async () => {
      if (!Array.isArray(model.db.team)) model.db.team = [];
      if (model.db.team.find(m => m.charId === '__shared__')) { toast('공용 인벤은 이미 팀에 있다.', true); return; }
      const n = model.db.team.length;
      model.db.team.push({ charId: '__shared__', ratio: n === 0 ? 100 : Math.floor(100 / (n + 1)) });
      if (n > 0) {
        const each = Math.floor(100 / model.db.team.length);
        model.db.team.forEach(m => { m.ratio = each; });
        model.db.team[0].ratio += 100 - each * model.db.team.length;
      }
      await saveDb(); renderApp();
    });
    on('[data-team-remove]', 'click', async (ev) => {
      const idx = parseInt(ev.currentTarget.getAttribute('data-team-remove') || '-1', 10);
      if (!Array.isArray(model.db.team) || idx < 0) return;
      model.db.team.splice(idx, 1);
      await saveDb(); renderApp();
    });
    on('[data-team-ratio]', 'input', async (ev) => {
      const idx = parseInt(ev.currentTarget.getAttribute('data-team-ratio') || '-1', 10);
      if (!Array.isArray(model.db.team) || idx < 0) return;
      model.db.team[idx].ratio = Math.max(0, Math.min(100, parseInt(ev.currentTarget.value || '0', 10)));
      await saveDb();
    });
    // ── Association handlers ──────────────────────────────────────────────────
    on('[data-assoc-floor]', 'click', async (ev) => {
      model.state.assocFloor = ev.currentTarget.getAttribute('data-assoc-floor') || '1F';
      await saveState(); renderApp();
    });
    // ── 경매장 핸들러 ──────────────────────────────────────────────────────────────
    on('[data-auction-tab]', 'click', async (ev) => {
      model.state.auctionTab = ev.currentTarget.getAttribute('data-auction-tab') || 'browse';
      model.state.auctionSellSel = '';
      model.state.auctionBid = null;
      model.state.auctionSell = null;
      await saveState(); renderApp();
    });
    on('[data-auction-rank]', 'click', async (ev) => {
      model.state.auctionRankFilter = ev.currentTarget.getAttribute('data-auction-rank') || '';
      await saveState(); renderApp();
    });
    on('[data-auction-refresh]', 'click', async () => {
      if (!Array.isArray(model.db.auctionListings)) model.db.auctionListings = [];
      model.db.auctionListings = model.db.auctionListings.filter(l => !l.isNpc);
      seedNpcAuctionListings();
      await saveDb(); renderApp();
      toast('🔄 NPC 경매 목록 갱신 완료');
    });
    // 검색박스 입력
    on('#gb-auction-search', 'input', async (ev) => {
      model.state.auctionSearchQ = ev.currentTarget.value || '';
      await saveState(); renderApp();
    });
    // 구매 경매 참여 — 단계별 인터랙티브 입찰 시작
    on('[data-auction-bid]', 'click', async (ev) => {
      try {
        const auctionId = ev.currentTarget.getAttribute('data-auction-bid') || '';
        const mktPrice = Number(ev.currentTarget.getAttribute('data-auction-bid-mkt') || '0');
        if (!Array.isArray(model.db.auctionListings)) throw new Error('경매 목록이 없다.');
        const listing = model.db.auctionListings.find(l => l.id === auctionId);
        if (!listing) throw new Error('해당 경매 물품을 찾을 수 없다.');
        const actualMkt = mktPrice || listing.marketPrice || listing.askPrice;
        const startRatio = AUCTION_PRICE_MIN_RATIO; // 85%
        model.state.auctionBid = {
          listingId: auctionId,
          marketPrice: actualMkt,
          currentRatio: startRatio,
          pendingCompetitor: null,
          pendingRatio: null,
          log: [`[경매 참여] <strong>${escapeHtml(listing.item.name||listing.item.id)}</strong> — 시작가 시장가 ${Math.round(startRatio*100)}% (${Math.round(actualMkt*startRatio).toLocaleString('en-US')}원)`],
          won: false,
          finalPrice: null,
          done: false
        };
        await saveState(); renderApp();
      } catch(e) { toast(e.message || String(e), true); }
    });
    // 구매 경매 입찰 확정 (내 턴에서 입찰하기 버튼)
    on('[data-auction-place-bid]', 'click', async () => {
      try {
        const bidState = model.state.auctionBid;
        if (!bidState) throw new Error('경매 데이터가 없다.');
        const inv = getInventory();
        const myPrice = Math.round(bidState.marketPrice * bidState.currentRatio);
        if (Number(inv.gold||0) < myPrice) throw new Error(`소지금 부족 (필요 ${myPrice.toLocaleString('en-US')}원)`);
        bidState.log.push(`[내 입찰] 시장가 ${Math.round(bidState.currentRatio*100)}% = ${myPrice.toLocaleString('en-US')}원`);
        // 경쟁자 판정
        const comp = rollBuyCompetitor(bidState.currentRatio, (bidState.log||[]).length);
        if (comp) {
          bidState.pendingCompetitor = comp.name;
          bidState.pendingRatio = comp.ratio;
          bidState.log.push(`[경쟁자 등장] <em>${escapeHtml(comp.name)}</em>이(가) ${Math.round(comp.ratio*100)}% (${Math.round(bidState.marketPrice*comp.ratio).toLocaleString('en-US')}원)에 입찰!`);
        } else {
          // 낙찰
          bidState.won = true;
          bidState.finalPrice = myPrice;
          bidState.log.push(`[🏆 낙찰] 경쟁자 없음. 시장가 ${Math.round(bidState.currentRatio*100)}% = ${myPrice.toLocaleString('en-US')}원에 낙찰!`);
        }
        await saveState(); renderApp();
      } catch(e) { toast(e.message || String(e), true); }
    });
    // 구매 경매 재입찰 (경쟁자 등장 후)
    on('[data-auction-rebid]', 'click', async () => {
      try {
        const bidState = model.state.auctionBid;
        if (!bidState || !bidState.pendingRatio) throw new Error('재입찰 데이터가 없다.');
        const inv = getInventory();
        const newPrice = Math.round(bidState.marketPrice * bidState.pendingRatio);
        if (Number(inv.gold||0) < newPrice) throw new Error(`소지금 부족 (필요 ${newPrice.toLocaleString('en-US')}원)`);
        bidState.currentRatio = bidState.pendingRatio;
        bidState.pendingCompetitor = null;
        bidState.pendingRatio = null;
        bidState.log.push(`[재입찰] 시장가 ${Math.round(bidState.currentRatio*100)}% = ${newPrice.toLocaleString('en-US')}원`);
        // 경쟁자 재판정
        const comp = rollBuyCompetitor(bidState.currentRatio, (bidState.log||[]).length);
        if (comp) {
          bidState.pendingCompetitor = comp.name;
          bidState.pendingRatio = comp.ratio;
          bidState.log.push(`[경쟁자 등장] <em>${escapeHtml(comp.name)}</em>이(가) ${Math.round(comp.ratio*100)}% (${Math.round(bidState.marketPrice*comp.ratio).toLocaleString('en-US')}원)에 입찰!`);
        } else {
          bidState.won = true;
          bidState.finalPrice = newPrice;
          bidState.log.push(`[🏆 낙찰] 경쟁자 없음. 시장가 ${Math.round(bidState.currentRatio*100)}% = ${newPrice.toLocaleString('en-US')}원에 낙찰!`);
        }
        await saveState(); renderApp();
      } catch(e) { toast(e.message || String(e), true); }
    });
    // 구매 경매 낙찰 확정
    on('[data-auction-confirm]', 'click', async () => {
      try {
        const bidState = model.state.auctionBid;
        if (!bidState) throw new Error('경매 데이터가 없다.');
        const auctionId = bidState.listingId;
        if (!Array.isArray(model.db.auctionListings)) throw new Error('경매 목록이 없다.');
        const idx = model.db.auctionListings.findIndex(l => l.id === auctionId);
        if (idx < 0) throw new Error('해당 경매 물품이 이미 없다. (다른 사람이 낙찰)');
        const listing = model.db.auctionListings[idx];
        const inv = getInventory();
        if (Number(inv.gold||0) < bidState.finalPrice) throw new Error(`소지금 부족 (필요 ${bidState.finalPrice.toLocaleString('en-US')}원)`);
        inv.gold = Number(inv.gold||0) - bidState.finalPrice;
        const buyItem = deepClone(listing.item);
        if (buyItem.category === 'equipment') {
          buyItem.stackable = false;
          buyItem.stackKey = `equipment:auction_${auctionId}_${Date.now()}`;
          buyItem.isUsed = false;
          buyItem.durability = 100;
          buyItem.maxDurability = 100;
          if (!buyItem.unitWeightG) buyItem.unitWeightG = EQUIP_WEIGHT_G[buyItem.part] || 1000;
        }
        grantInventoryItem(buyItem);
        model.db.auctionListings.splice(idx, 1);
        model.state.auctionBid = null;
        await saveDb(); await saveState(); renderApp();
        const fmt = n => n >= 1e8 ? `${(n/1e8).toFixed(2)}억원` : n >= 10000 ? `${Math.round(n/10000)}만원` : `${n.toLocaleString('en-US')}원`;
        toast(`🏷️ ${buyItem.name} 낙찰! (-${fmt(bidState.finalPrice)})`);
      } catch(e) { toast(e.message || String(e), true); }
    });
    // 구매 경매 포기
    on('[data-auction-bid-cancel]', 'click', async () => {
      model.state.auctionBid = null;
      await saveState(); renderApp();
    });
    // 판매 아이템 선택
    on('[data-auction-sell-sel]', 'click', async (ev) => {
      model.state.auctionSellSel = ev.currentTarget.getAttribute('data-auction-sell-sel') || '';
      await saveState(); renderApp();
    });
    // 판매 경매 시작 — 3초 간격 단계별 공개
    on('[data-auction-sell-start]', 'click', async (ev) => {
      try {
        const ikey = ev.currentTarget.getAttribute('data-auction-sell-start') || '';
        const mktPrice = Number(ev.currentTarget.getAttribute('data-auction-sell-mkt') || '0');
        if (!mktPrice) throw new Error('시장가 정보가 없다.');
        const inv = getInventory();
        const it = (inv.items||[]).find(x => inventoryItemKey(x) === ikey);
        if (!it) throw new Error('등록할 아이템을 찾을 수 없다.');
        // 인벤에서 제거 후 경매 진행
        removeInventoryItem(ikey, 'one');
        const sim = simulateSellAuction(mktPrice);
        model.state.auctionSell = {
          itemKey: ikey,
          itemName: it.name || it.id,
          marketPrice: mktPrice,
          fullLog: sim.fullLog,
          revealedCount: 1, // 첫 항목만 즉시 표시
          finalRatio: sim.finalRatio,
          finalPrice: sim.finalPrice,
          done: false
        };
        model.state.auctionSellSel = '';
        await saveDb(); await saveState(); renderApp();
        // 3초 간격으로 로그 공개
        _startSellAuctionTimer();
      } catch(e) { toast(e.message || String(e), true); }
    });
    // 판매 경매 완료 확인 — 골드 지급
    on('[data-auction-sell-confirm]', 'click', async () => {
      try {
        const sellState = model.state.auctionSell;
        if (!sellState) throw new Error('판매 경매 데이터가 없다.');
        const inv = getInventory();
        inv.gold = Number(inv.gold||0) + sellState.finalPrice;
        model.state.auctionSell = null;
        await saveDb(); await saveState(); renderApp();
        const fmt = n => n >= 1e8 ? `${(n/1e8).toFixed(2)}억원` : n >= 10000 ? `${Math.round(n/10000)}만원` : `${n.toLocaleString('en-US')}원`;
        toast(`💰 ${escapeHtml(sellState.itemName)} 판매 완료! +${fmt(sellState.finalPrice)}`);
      } catch(e) { toast(e.message || String(e), true); }
    });
    // 경매 등록 취소 (플레이어가 등록한 물품)
    on('[data-auction-cancel]', 'click', async (ev) => {
      try {
        const auctionId = ev.currentTarget.getAttribute('data-auction-cancel') || '';
        if (!Array.isArray(model.db.auctionListings)) throw new Error('경매 목록이 없다.');
        const idx = model.db.auctionListings.findIndex(l => l.id === auctionId && !l.isNpc);
        if (idx < 0) throw new Error('내 경매 물품을 찾을 수 없다.');
        const listing = model.db.auctionListings[idx];
        const retItem = deepClone(listing.item);
        model.db.auctionListings.splice(idx, 1);
        grantInventoryItem(retItem);
        await saveDb(); await saveState(); renderApp();
        toast(`↩️ ${retItem.name} 경매 취소 완료. 아이템 반환됨.`);
      } catch(e) { toast(e.message || String(e), true); }
    });
    on('#gb-settle-calc', 'click', async () => {
      try {
        const st = model.state;
        st.settleType       = fieldValue('#gb-settle-type')      || 'association';
        st.settleGuildPct   = fieldValue('#gb-settle-guild-pct') || '40';
        st.settleDate       = fieldValue('#gb-settle-date')      || '';
        const manualParty = fieldValue('#gb-settle-party-manual');
        if (manualParty) st.settlePartyCount = manualParty;
        const teamSize = Array.isArray(model.db.team) ? model.db.team.length : 0;
        if (teamSize > 0) st.settlePartyCount = String(teamSize);
        await saveState(); renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-settle-apply', 'click', async () => {
      try {
        const st = model.state;
        st.settleType       = fieldValue('#gb-settle-type')      || 'association';
        st.settleGuildPct   = fieldValue('#gb-settle-guild-pct') || '40';
        st.settleDate       = fieldValue('#gb-settle-date')      || '';
        const manualParty = fieldValue('#gb-settle-party-manual');
        if (manualParty) st.settlePartyCount = manualParty;
        const teamSize = Array.isArray(model.db.team) ? model.db.team.length : 0;
        if (teamSize > 0) st.settlePartyCount = String(teamSize);
        const gs = gateStateSafe();
        if (gs.run) {
          const result = buildSettlementSheet(gs.run, st);
          toast(`✅ 설정 저장됨. 정산 계산 완료 — 최종 개인 지급액: ₩${formatWon(result.final)}`);
        } else {
          toast(`✅ 정산 설정 저장됨 (${st.settleType === 'guild' ? '길드 정산' : '협회 정산'})`);
        }
        await saveState(); renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-assoc-settle', 'click', async () => {
      try {
        const gs = gateStateSafe();
        if (!gs.run) throw new Error('정산할 게이트 공략이 없다.');
        const st = model.state;
        const dateVal = (fieldValue('#gb-settle-date') || st.settleDate || '').trim();
        const result = buildSettlementSheet(gs.run, st);
        const runTitle = gs.run.title || '게이트';
        const goldGain = result ? result.final : 0;
        if (goldGain > 0) {
          const inv = getInventory();
          inv.gold = (Number(inv.gold || 0)) + goldGain;
        }
        // Write income log entry
        if (!Array.isArray(model.db.incomeLog)) model.db.incomeLog = [];
        const isGuildSettle = (st.settleType || 'association') === 'guild';
        const guildName = isGuildSettle
          ? (model.db.guildId === 'custom'
              ? (model.db.customGuildName || '내 길드')
              : ((PRESET_GUILDS.find(g => g.id === model.db.guildId) || {}).name || '길드'))
          : '';
        model.db.incomeLog.push({
          date:       dateVal || '날짜 미입력',
          runTitle:   runTitle,
          gross:      result ? result.subtotal : 0,
          fee:        result ? result.fee : 0,
          corpTax:    isGuildSettle ? (result ? result.fee : 0) : 0,
          net:        result ? result.net : 0,
          perPerson:  result ? result.perPerson : 0,
          guildShare: result ? (result.guildShare || 0) : 0,
          final:      goldGain,
          type:       isGuildSettle ? 'guild' : 'association',
          guildName:  guildName,
        });
        // Write guild tax log for guild settlements
        if (isGuildSettle) {
          if (!Array.isArray(model.db.guildTaxLog)) model.db.guildTaxLog = [];
          model.db.guildTaxLog.push({
            date:       dateVal || '날짜 미입력',
            runTitle:   runTitle,
            gross:      result ? result.subtotal : 0,
            corpTax:    result ? result.fee : 0,
            net:        result ? result.net : 0,
            guildShare: result ? (result.guildShare || 0) : 0,
            members:    Number(st.settlePartyCount || '1'),
          });
        }
        gs.run = null;
        await saveDb(); await saveState(); renderApp();
        toast(`${runTitle} 정산 완료 — ₩${formatWon(goldGain)} 획득. 새 게이트를 진행할 수 있다.`);
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('[data-income-log-del]', 'click', async (ev) => {
      try {
        const idx = parseInt(ev.currentTarget.getAttribute('data-income-log-del') || '-1', 10);
        if (idx < 0) return;
        if (!Array.isArray(model.db.incomeLog)) return;
        model.db.incomeLog.splice(idx, 1);
        await saveDb(); renderApp();
        toast('소득 기록 삭제 완료');
      } catch (e) { toast(e.message || String(e), true); }
    });
    // ── 아이템 직접 판매 핸들러 ──────────────────────────────────────────────
    on('[data-settle-item-sel]', 'change', async (ev) => {
      const key = ev.currentTarget.getAttribute('data-settle-item-sel') || '';
      if (!key) return;
      if (!model.state.settleItemSel) model.state.settleItemSel = {};
      model.state.settleItemSel[key] = ev.currentTarget.checked;
      // 정산 방식/날짜도 함께 저장
      model.state.settleType = fieldValue('#gb-settle-type') || model.state.settleType || 'association';
      model.state.settleDate = fieldValue('#gb-settle-date') || model.state.settleDate || '';
      const manualParty = fieldValue('#gb-settle-party-manual');
      if (manualParty) model.state.settlePartyCount = manualParty;
      await saveState(); renderApp();
    });
    on('#gb-settle-item-sel-all', 'click', async () => {
      const inv = getInventory();
      if (!model.state.settleItemSel) model.state.settleItemSel = {};
      (inv.items||[]).forEach(it => {
        const k = inventoryItemKey(it);
        if (it.category === 'equipment') {
          // 중고 장비 제외 (협회 판매 불가)
          const isUsed = it.isUsed || Number(it.maxDurability ?? 100) < 100 || Number(it.durability ?? 100) < Number(it.maxDurability ?? 100);
          if (!isUsed) model.state.settleItemSel[k] = true;
        } else if (['rareMaterial','normalMaterial','manaStone'].includes(it.category)) {
          model.state.settleItemSel[k] = true;
        }
      });
      await saveState(); renderApp();
    });
    on('#gb-settle-item-sel-none', 'click', async () => {
      model.state.settleItemSel = {};
      await saveState(); renderApp();
    });
    on('#gb-direct-sell-single', 'click', async () => {
      try {
        const inv = getInventory();
        const sel = model.state.settleItemSel || {};
        const isGuild = (model.state.settleType||'association') === 'guild';
        const dateVal = (fieldValue('#gb-settle-date') || model.state.settleDate || '').trim();
        const fmtS = n => { const v = Math.floor((n||0) / 10) * 10; return v >= 1e8 ? `${(v/1e8).toFixed(2)}억원` : `${v.toLocaleString('en-US')}원`; };
        let total = 0;
        const toRemove = [];
        (inv.items||[]).forEach(it => {
          const key = inventoryItemKey(it);
          if (!sel[key]) return;
          const price = calcInventorySellPrice(it, isGuild);
          total += price;
          toRemove.push(key);
        });
        if (toRemove.length === 0) { toast('판매할 아이템을 선택하라.', true); return; }
        toRemove.forEach(k => removeInventoryItem(k, 'all'));
        // 5% 수수료 적용
        const fee = Math.floor(total * 0.05);
        const net = total - fee;
        inv.gold = Number(inv.gold||0) + net;
        model.state.settleItemSel = {};
        // 소득 기록 — 첫 번째 페르소나 이름으로 기록
        if (!Array.isArray(model.db.incomeLog)) model.db.incomeLog = [];
        const _firstP = (model.db.personas || [])[0];
        const _participantName = _firstP ? (_firstP.name || _firstP.id) : '공용 인벤';
        model.db.incomeLog.push({ date: dateVal||'날짜 미입력', runTitle: '직접 판매', gross: total, fee, net, perPerson: net, final: net, type: isGuild ? 'guild' : 'association', participant: _participantName });
        await saveDb(); await saveState(); renderApp();
        toast(`💰 ${toRemove.length}개 아이템 판매 완료 (세전 ${fmtS(total)} → 수수료 5% 차감 후 ${fmtS(net)})`);
      } catch(e) { toast(e.message || String(e), true); }
    });
    on('#gb-direct-sell-team', 'click', async () => {
      try {
        const inv = getInventory();
        const sel = model.state.settleItemSel || {};
        const isGuild = (model.state.settleType||'association') === 'guild';
        const dateVal = (fieldValue('#gb-settle-date') || model.state.settleDate || '').trim();
        const team = Array.isArray(model.db.team) ? model.db.team : [];
        const totalRatio = team.reduce((s, m) => s + Number(m.ratio||10), 0);
        if (team.length === 0) { toast('팀이 없다. 허브에서 팀을 구성하라.', true); return; }
        if (totalRatio !== 100) { toast(`팀 비율 합계가 ${totalRatio}%다. 100%가 되어야 한다.`, true); return; }
        const fmtS = n => { const v = Math.floor((n||0) / 10) * 10; return v >= 1e8 ? `${(v/1e8).toFixed(2)}억원` : `${v.toLocaleString('en-US')}원`; };
        let total = 0;
        const toRemove = [];
        (inv.items||[]).forEach(it => {
          const key = inventoryItemKey(it);
          if (!sel[key]) return;
          total += calcInventorySellPrice(it, isGuild);
          toRemove.push(key);
        });
        if (toRemove.length === 0) { toast('판매할 아이템을 선택하라.', true); return; }
        toRemove.forEach(k => removeInventoryItem(k, 'all'));
        // 5% 수수료 적용
        const fee = Math.floor(total * 0.05);
        const netTotal = total - fee;
        const lines = [];
        for (const m of team) {
          const share = Math.floor(netTotal * (m.ratio||10) / 100);
          const allChars = model.db.characters || [];
          const allPersonas = model.db.personas || [];
          const char = allChars.find(c => c.id === m.charId) || allPersonas.find(p => p.id === m.charId);
          const charName = m.charId === '__shared__' ? '공용 인벤' : (char ? (char.name||m.charId) : m.charId);
          if (m.charId === '__shared__') {
            inv.gold = Number(inv.gold||0) + share;
          } else if (char) {
            if (!char.inventory) char.inventory = { items: [], equipped: { weapon:null, armor:null, subweapon:null, accessory:null, bag:null } };
            char.inventory.gold = (Number(char.inventory.gold||0)) + share;
          } else {
            inv.gold = Number(inv.gold||0) + share;
          }
          lines.push(`${charName}: +${fmtS(share)}`);
        }
        // 소득 기록 — 페르소나 목록 첫 번째 1명만 기록 (팀 전체 분배 합산)
        if (!Array.isArray(model.db.incomeLog)) model.db.incomeLog = [];
        const _firstPersona = (model.db.personas || [])[0];
        const _firstPersonaName = _firstPersona ? (_firstPersona.name || _firstPersona.id) : '공용 인벤';
        model.db.incomeLog.push({ date: dateVal||'날짜 미입력', runTitle: '직접 판매 (팀 분배)', gross: total, fee, net: netTotal, perPerson: netTotal, final: netTotal, type: isGuild?'guild':'association', participant: _firstPersonaName });
        model.state.settleItemSel = {};
        await saveDb(); await saveState(); renderApp();
        toast(`💰 팀 분배 완료 (세전 ${fmtS(total)} → 5% 차감 후 ${fmtS(netTotal)})\n${lines.join(' / ')}`);
      } catch(e) { toast(e.message || String(e), true); }
    });
    on('#gb-tax-calc', 'click', async () => {
      try {
        const income = Number(fieldValue('#gb-tax-income') || '0');
        model.state.taxIncome = String(income);
        await saveState(); renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-tax-pay-preview', 'click', async () => {
      try {
        const month = (fieldValue('#gb-tax-pay-month') || '').trim();
        model.state.taxPayMonth = month;
        await saveState(); renderApp();
        if (!month) { toast('납부 월을 입력하라. (예: 2026-03)', true); return; }
        const log = Array.isArray(model.db.incomeLog) ? model.db.incomeLog : [];
        const cnt = log.filter(r => (r.date || '').startsWith(month)).length;
        toast(`${month} 기준 소득 기록 ${cnt}건이 있다. "납부 완료" 버튼으로 삭제할 수 있다.`);
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-tax-pay-confirm', 'click', async () => {
      try {
        const month = (fieldValue('#gb-tax-pay-month') || model.state.taxPayMonth || '').trim();
        if (!month) throw new Error('납부 월을 입력하라. (예: 2026-03)');
        if (!Array.isArray(model.db.incomeLog)) model.db.incomeLog = [];
        const before = model.db.incomeLog.length;
        model.db.incomeLog = model.db.incomeLog.filter(r => !(r.date || '').startsWith(month));
        const removed = before - model.db.incomeLog.length;
        if (!removed) { toast(`${month}에 해당하는 소득 기록이 없다.`, true); return; }
        model.state.taxPayMonth = '';
        await saveDb(); await saveState(); renderApp();
        toast(`✅ ${month} 소득세 납부 완료 처리 — ${removed}건 기록 삭제됨`);
      } catch (e) { toast(e.message || String(e), true); }
    });
    // ── Shop handlers ─────────────────────────────────────────────────────────
    on('[data-shop-sub]', 'click', async (ev) => {
      model.state.shopSub = ev.currentTarget.getAttribute('data-shop-sub') || '';
      model.state.shopHunterSub = '';
      await saveState(); renderApp();
    });
    on('[data-shop-hunter-sub]', 'click', async (ev) => {
      model.state.shopHunterSub = ev.currentTarget.getAttribute('data-shop-hunter-sub') || '';
      await saveState(); renderApp();
    });
    on('[data-shop-buy]', 'click', async (ev) => {
      try {
        const raw = ev.currentTarget.getAttribute('data-shop-buy') || '';
        const [cat, itemId] = raw.split(':');
        const items = SHOP_ITEMS[cat] || [];
        const shopItem = items.find(it => it.id === itemId);
        if (!shopItem) throw new Error('상품을 찾을 수 없다.');
        const inv = getInventory();
        if (Number(inv.gold || 0) < shopItem.price) throw new Error('소지금이 부족하다.');
        inv.gold = Number(inv.gold || 0) - shopItem.price;
        const item = shopItem.buildFn ? shopItem.buildFn() : null;
        if (!item) throw new Error('아이템 생성 실패.');
        const res = grantInventoryItem(item);
        if (!res.ok) pushInventoryOverflow(item);
        await saveDb(); await saveState(); renderApp();
        toast(`${shopItem.name} 구매 완료 (₩${Number(shopItem.price).toLocaleString('en-US')} 차감)`);
      } catch (e) { toast(e.message || String(e), true); }
    });
    // ── 편의점 식량 구매 핸들러 ───────────────────────────────────────────────
    on('[data-conv-food-buy]', 'click', async (ev) => {
      try {
        const fId = ev.currentTarget.getAttribute('data-conv-food-buy') || '';
        const db = getConvFoodDb();
        const f = db.find(x => x.id === fId);
        if (!f) throw new Error('상품을 찾을 수 없다.');
        const inv = getInventory();
        if (Number(inv.gold||0) < f.price) throw new Error('소지금이 부족하다.');
        inv.gold = Number(inv.gold||0) - f.price;
        // 야영용(ration/water)은 campSupply로, 나머지는 convFood로 추가
        let item;
        if (f.id === 'conv_ration') item = buildSupplyItem('ration', 1);
        else if (f.id === 'conv_water') item = buildSupplyItem('water', 1);
        else item = buildConvFoodItem(f, 1);
        const res = grantInventoryItem(item);
        if (!res.ok) pushInventoryOverflow(item);
        await saveDb(); renderApp();
        toast(`${f.name} 구매 완료 (₩${f.price.toLocaleString('en-US')} 차감)`);
      } catch(e) { toast(e.message||String(e), true); }
    });
    // ── 편의점 DB 관리 핸들러 ─────────────────────────────────────────────────
    on('#gb-convdb-add', 'click', async () => {
      const db = getConvFoodDb();
      db.push({ id:`conv_custom_${Date.now()}`, name:'새 식품', price:3000, weightG:300, note:'편의점 식품' });
      await saveDb(); renderApp();
    });
    on('#gb-convdb-save', 'click', async () => {
      try {
        const db = getConvFoodDb();
        document.querySelectorAll('[data-convdb-name]').forEach(el => {
          const idx = parseInt(el.getAttribute('data-convdb-name')||'0',10);
          if (db[idx]) db[idx].name = el.value.trim() || db[idx].name;
        });
        document.querySelectorAll('[data-convdb-price]').forEach(el => {
          const idx = parseInt(el.getAttribute('data-convdb-price')||'0',10);
          if (db[idx]) db[idx].price = Math.max(0, parseInt(el.value||'0',10));
        });
        document.querySelectorAll('[data-convdb-weight]').forEach(el => {
          const idx = parseInt(el.getAttribute('data-convdb-weight')||'0',10);
          if (db[idx]) db[idx].weightG = Math.max(1, parseInt(el.value||'100',10));
        });
        await saveDb(); renderApp();
        toast('편의점 DB 저장 완료');
      } catch(e) { toast(e.message||String(e), true); }
    });
    on('#gb-convdb-reset', 'click', async () => {
      model.db.convFoodDb = DEFAULT_CONV_FOOD_DB.map(f => ({ ...f }));
      await saveDb(); renderApp();
      toast('편의점 DB 기본값 복원');
    });
    on('[data-convdb-del]', 'click', async (ev) => {
      const idx = parseInt(ev.currentTarget.getAttribute('data-convdb-del')||'0',10);
      const db = getConvFoodDb();
      db.splice(idx, 1);
      await saveDb(); renderApp();
    });
    // ── Material shop search/filter/page handlers ─────────────────────────────
    on('#gb-mat-search-form', 'submit', async (ev) => {
      ev.preventDefault();
      model.state.shopMatQuery = fieldValue('#gb-mat-query') || '';
      model.state.shopMatRank  = fieldValue('#gb-mat-rank')  || '';
      model.state.shopMatTier  = fieldValue('#gb-mat-tier')  || '';
      model.state.shopMatPage  = 0;
      await saveState(); renderApp();
    });
    on('[data-mat-page]', 'click', async (ev) => {
      const p = parseInt(ev.currentTarget.getAttribute('data-mat-page') || '0', 10);
      if (!isNaN(p) && p >= 0) { model.state.shopMatPage = p; await saveState(); renderApp(); }
    });
    on('[data-mat-buy]', 'click', async (ev) => {
      try {
        const key = ev.currentTarget.getAttribute('data-mat-buy') || '';
        const parts = key.split(':');
        const kind = parts[0];
        const inv = getInventory();
        let item = null;
        let price = 0;
        if (kind === 'rare') {
          const id = parts.slice(1).join(':');
          const catalog = getRareMaterialCatalog();
          const found = catalog.find(it => it.id === id);
          if (!found) throw new Error('재료를 찾을 수 없다.');
          price = Math.ceil((found.suggestedPrice || 0) * MAT_SHOP_BUY_MARKUP);
          item = rewardRowToInventoryItem(Object.assign({}, found, { count: 1 }), 'rare');
        }
        if (!item) throw new Error('아이템 생성 실패.');
        if (Number(inv.gold || 0) < price) throw new Error('소지금이 부족하다.');
        inv.gold = Number(inv.gold || 0) - price;
        const res = grantInventoryItem(item);
        if (!res.ok) pushInventoryOverflow(item);
        await saveDb(); await saveState(); renderApp();
        toast(`${item.name} 구매 완료 (₩${price.toLocaleString('en-US')} 차감)`);
      } catch (e) { toast(e.message || String(e), true); }
    });
    // ── Black market handlers ─────────────────────────────────────────────────
    on('[data-bm-tab]', 'click', async (ev) => {
      model.state.shopBmTab = ev.currentTarget.getAttribute('data-bm-tab') || 'rare';
      await saveState(); renderApp();
    });

    // ── Equipment Shop handlers ───────────────────────────────────────────────
    on('[data-equip-shop-rank]', 'click', async (ev) => {
      model.state.shopEquipRank = ev.currentTarget.getAttribute('data-equip-shop-rank') || '';
      await saveState(); renderApp();
    });
    on('[data-equip-shop-part]', 'click', async (ev) => {
      model.state.shopEquipPart = ev.currentTarget.getAttribute('data-equip-shop-part') || '';
      await saveState(); renderApp();
    });
    on('[data-equip-shop-buy]', 'click', async (ev) => {
      try {
        const id = ev.currentTarget.getAttribute('data-equip-shop-buy') || '';
        const eq = (model.db.equipments || []).find(e => e.id === id);
        if (!eq) throw new Error('장비를 찾을 수 없다.');
        const price = Number(eq.price || calcEquipEnhancedPrice(calcEquipBasePrice(eq.rank, eq.part), eq.enhance||0, eq.rank));
        const inv = getInventory();
        if (Number(inv.gold || 0) < price) throw new Error(`소지금 부족 (${Number(inv.gold||0).toLocaleString('en-US')}원 / 필요 ${price.toLocaleString('en-US')}원)`);
        inv.gold = Number(inv.gold || 0) - price;
        // Add to inventory as owned equipment (new = maxDurability 100, isUsed false)
        const newItem = Object.assign({}, deepClone(eq), {
          category: 'equipment',
          isUsed: false,
          durability: 100,
          maxDurability: 100,
          stackable: false,
          unitWeightG: EQUIP_WEIGHT_G[eq.part] || 1000,
          stackKey: `equipment:${eq.id}:${Date.now()}`
        });
        grantInventoryItem(newItem);
        await saveDb(); await saveState(); renderApp();
        toast(`⚔️ ${eq.name} 구매 완료 (-₩${price.toLocaleString('en-US')})`);
      } catch (e) { toast(e.message || String(e), true); }
    });

    // ── Hunter Market handlers ────────────────────────────────────────────────
    on('[data-hm-tab]', 'click', async (ev) => {
      model.state.shopHmTab = ev.currentTarget.getAttribute('data-hm-tab') || 'sell';
      await saveState(); renderApp();
    });
    on('[data-hm-rank]', 'click', async (ev) => {
      model.state.shopHmRank = ev.currentTarget.getAttribute('data-hm-rank') || '';
      await saveState(); renderApp();
    });
    on('[data-hm-part]', 'click', async (ev) => {
      model.state.shopHmPart = ev.currentTarget.getAttribute('data-hm-part') || '';
      await saveState(); renderApp();
    });
    on('[data-hm-refresh]', 'click', async () => {
      if (!Array.isArray(model.db.hmUsedListings)) model.db.hmUsedListings = [];
      model.db.hmUsedListings = model.db.hmUsedListings.filter(l => !l.isNpc);
      seedNpcUsedListings();
      await saveDb(); renderApp();
      toast('🔄 헌터마켓 NPC 목록 갱신 완료');
    });
    on('[data-hm-sell]', 'click', async (ev) => {
      try {
        const raw = ev.currentTarget.getAttribute('data-hm-sell') || '';
        const lastColon = raw.lastIndexOf(':');
        const ikey = raw.substring(0, lastColon);
        const sellPrice = Number(raw.substring(lastColon+1));
        const inv = getInventory();
        const it = inv.items.find(x => inventoryItemKey(x) === ikey);
        if (!it) throw new Error('판매할 장비를 찾을 수 없다.');
        // 판매 = 즉시 골드 획득 (헌터마켓 직거래)
        removeInventoryItem(ikey, 'one');
        inv.gold = Number(inv.gold||0) + sellPrice;
        await saveDb(); await saveState(); renderApp();
        toast(`🏷️ ${it.name} 중고 판매 완료 (+₩${sellPrice.toLocaleString('en-US')})`);
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('[data-hm-browse-buy]', 'click', async (ev) => {
      try {
        const raw = ev.currentTarget.getAttribute('data-hm-browse-buy') || '';
        const lastColon = raw.lastIndexOf(':');
        const listingId = raw.substring(0, lastColon);
        const usedPrice = Number(raw.substring(lastColon+1));
        if (!Array.isArray(model.db.hmUsedListings)) throw new Error('헌터마켓 목록이 없다.');
        const idx = model.db.hmUsedListings.findIndex(l => l.id === listingId);
        if (idx < 0) throw new Error('해당 중고 매물을 찾을 수 없다. (이미 판매됨)');
        const listing = model.db.hmUsedListings[idx];
        const inv = getInventory();
        if (Number(inv.gold||0) < usedPrice) throw new Error(`소지금 부족 (필요 ₩${usedPrice.toLocaleString('en-US')})`);
        inv.gold = Number(inv.gold||0) - usedPrice;
        const buyItem = deepClone(listing.item);
        buyItem.category = 'equipment';
        buyItem.isUsed = true;
        buyItem.stackable = false;
        if (!buyItem.unitWeightG) buyItem.unitWeightG = EQUIP_WEIGHT_G[buyItem.part] || 1000;
        buyItem.stackKey = `equipment:hm_${listingId}_${Date.now()}`;
        grantInventoryItem(buyItem);
        model.db.hmUsedListings.splice(idx, 1);
        await saveDb(); await saveState(); renderApp();
        toast(`🏷️ ${buyItem.name} 중고 구매 완료 (-₩${usedPrice.toLocaleString('en-US')})`);
      } catch (e) { toast(e.message || String(e), true); }
    });

    // ── Repair Shop handlers ──────────────────────────────────────────────────
    on('[data-repair-sel]', 'click', async (ev) => {
      model.state.shopRepairSel = ev.currentTarget.getAttribute('data-repair-sel') || '';
      await saveState(); renderApp();
    });
    on('#gb-repair-full', 'click', async () => {
      try {
        const ikey = model.state.shopRepairSel;
        if (!ikey) throw new Error('수리할 장비를 선택하라.');
        const inv = getInventory();
        const it = inv.items.find(x => inventoryItemKey(x) === ikey);
        if (!it) throw new Error('장비를 찾을 수 없다.');
        const dur = Number(it.durability ?? 100);
        const maxDur = Number(it.maxDurability ?? 100);
        const lost = maxDur - dur;
        const fee = calcRepairFee(it.rank||'E', it.part||'weapon', lost);
        if (fee > 0 && Number(inv.gold||0) < fee) throw new Error(`소지금 부족 (${Number(inv.gold||0).toLocaleString('en-US')}원 / 필요 ${fee.toLocaleString('en-US')}원)`);
        inv.gold = Math.max(0, Number(inv.gold||0) - fee);
        applyRepair(it, maxDur);
        await saveDb(); await saveState(); renderApp();
        toast(`🔧 ${it.name} 수리 완료. 내구도 ${it.durability}/${it.maxDurability}${fee>0?` (-₩${fee.toLocaleString('en-US')})`:' (무료)'}`);
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-repair-partial', 'click', async () => {
      try {
        const ikey = model.state.shopRepairSel;
        if (!ikey) throw new Error('수리할 장비를 선택하라.');
        const inv = getInventory();
        const it = inv.items.find(x => inventoryItemKey(x) === ikey);
        if (!it) throw new Error('장비를 찾을 수 없다.');
        const targetDur = Number(fieldValue('#gb-repair-target-dur') || (it.maxDurability ?? 100));
        const dur = Number(it.durability ?? 100);
        const maxDur = Number(it.maxDurability ?? 100);
        if (targetDur <= dur) {
          const el = model.root && model.root.querySelector('#gb-repair-partial-result');
          if (el) el.textContent = '현재 내구도보다 낮거나 같은 목표는 수리가 필요 없다.';
          return;
        }
        const lost = Math.min(maxDur, targetDur) - dur;
        const fee = calcRepairFee(it.rank||'E', it.part||'weapon', lost);
        if (fee > 0 && Number(inv.gold||0) < fee) {
          const el = model.root && model.root.querySelector('#gb-repair-partial-result');
          if (el) el.textContent = `소지금 부족 (필요 ₩${fee.toLocaleString('en-US')})`;
          return;
        }
        inv.gold = Math.max(0, Number(inv.gold||0) - fee);
        applyRepair(it, Math.min(maxDur, targetDur));
        await saveDb(); await saveState(); renderApp();
        toast(`🔧 ${it.name} 부분 수리 완료. 내구도 ${it.durability}/${it.maxDurability}${fee>0?` (-₩${fee.toLocaleString('en-US')})`:' (무료)'}`);
      } catch (e) { toast(e.message || String(e), true); }
    });


    on('[data-bm-sell]', 'click', async (ev) => {
      try {
        const raw   = ev.currentTarget.getAttribute('data-bm-sell') || '';
        const colonIdx = raw.lastIndexOf(':');
        const ikey  = raw.substring(0, colonIdx);
        const mode  = raw.substring(colonIdx + 1); // 'one' or 'all'
        const inv   = getInventory();
        const it    = inv.items.find(x => inventoryItemKey(x) === ikey);
        if (!it) throw new Error('판매할 아이템을 찾을 수 없다.');
        const sp    = Number(it.suggestedPrice || 0);
        if (!sp) throw new Error('기준가 없는 아이템은 블랙마켓 판매 불가.');
        const cnt   = mode === 'all' ? Number(it.count || 1) : 1;
        const val   = sp * cnt;
        // Detection check: 2% per item
        let caught = false;
        for (let i = 0; i < cnt; i++) {
          if (Math.random() < BM_DETECT_RATE) { caught = true; break; }
        }
        // Item is always removed (seized or sold)
        removeInventoryItem(ikey, mode === 'all' ? 'all' : 'one');
        if (caught) {
          // Seizure: no gold gain, item gone, + 50% fine
          const fine = Math.floor(val * BM_FINE_RATE);
          inv.gold = Math.max(0, Number(inv.gold || 0) - fine);
          await saveDb(); await saveState(); renderApp();
          toast(`⚠️ 협회 특수수사대에 발각됐다! ${it.name} ${cnt}개 압수·거래 무효 + 벌금 ₩${fine.toLocaleString('en-US')} 부과.`, true);
        } else {
          inv.gold = Number(inv.gold || 0) + val;
          await saveDb(); await saveState(); renderApp();
          toast(`🖤 ${it.name} ${cnt}개 블랙마켓 거래 완료 (+₩${val.toLocaleString('en-US')})`);
        }
      } catch (e) { toast(e.message || String(e), true); }
    });
    // ── Forge (대장간 강화) handlers ─────────────────────────────────────────────
    on('[data-forge-tab]', 'click', async (ev) => {
      model.state.shopForgeTab = ev.currentTarget.getAttribute('data-forge-tab') || 'enhance';
      model.state.shopForgeSel = '';
      model.state.shopForgeStone = '';
      model.state.shopForgeInfuseMat = '';
      await saveState(); renderApp();
    });
    on('[data-forge-sel]', 'click', async (ev) => {
      model.state.shopForgeSel = ev.currentTarget.getAttribute('data-forge-sel') || '';
      model.state.shopForgeStone = '';
      model.state.shopForgeInfuseMat = '';
      await saveState(); renderApp();
    });
    on('[data-forge-stone]', 'click', async (ev) => {
      model.state.shopForgeStone = ev.currentTarget.getAttribute('data-forge-stone') || '';
      await saveState(); renderApp();
    });
    on('[data-forge-infuse-mat]', 'click', async (ev) => {
      model.state.shopForgeInfuseMat = ev.currentTarget.getAttribute('data-forge-infuse-mat') || '';
      await saveState(); renderApp();
    });
    on('#gb-forge-do', 'click', async (ev) => {
      try {
        const inv = getInventory();
        const btn = ev.currentTarget;
        const equipKey = btn.getAttribute('data-forge-equip') || '';
        const stoneKey = btn.getAttribute('data-forge-stone-key') || '';
        const fee = Number(btn.getAttribute('data-forge-fee') || '0');
        const rate = Number(btn.getAttribute('data-forge-rate') || '0');
        const btnRank = btn.getAttribute('data-forge-rank') || 'E';
        const equip = inv.items.find(x => inventoryItemKey(x) === equipKey);
        const stone = inv.items.find(x => inventoryItemKey(x) === stoneKey);
        if (!equip) throw new Error('강화할 장비를 찾을 수 없다.');
        if (!stone) throw new Error('마정석을 찾을 수 없다.');
        if (Number(inv.gold || 0) < fee) throw new Error(`소지금 부족. (필요 ₩${fee.toLocaleString('en-US')})`);
        // 수수료 차감
        inv.gold = Math.max(0, Number(inv.gold || 0) - fee);
        // 마정석 1개 소모
        removeInventoryItem(stoneKey, 'one');
        const success = Math.random() < rate;
        if (success) {
          equip.enhance = (equip.enhance || 0) + 1;
          const baseP = Number(equip.price || calcEquipBasePrice(equip.rank||'E', equip.part||'weapon'));
          const newMarketPrice = calcEquipEnhancedPrice(baseP, equip.enhance, equip.rank || btnRank);
          const newUsedPrice = calcForgeEnhancedUsedPrice(baseP, equip.enhance, equip.part, equip.rank || btnRank);
          model.state.shopForgeStone = '';
          await saveDb(); await saveState(); renderApp();
          toast(`✨ 강화 성공! ${equip.name} +${equip.enhance} 달성! 경매장가 ₩${newMarketPrice.toLocaleString('en-US')} | 중고가 ₩${newUsedPrice.toLocaleString('en-US')} (-수수료 ₩${fee.toLocaleString('en-US')})`);
        } else {
          model.state.shopForgeStone = '';
          await saveDb(); await saveState(); renderApp();
          toast(`💥 강화 실패. ${equip.name} 장비 유지, 마정석 소멸 (-수수료 ₩${fee.toLocaleString('en-US')})`, true);
        }
      } catch(e) { toast(e.message || String(e), true); }
    });
    on('#gb-forge-infuse-do', 'click', async (ev) => {
      try {
        const inv = getInventory();
        const btn = ev.currentTarget;
        const equipKey = btn.getAttribute('data-forge-equip') || '';
        const matKey = btn.getAttribute('data-forge-mat-key') || '';
        const totalCost = Number(btn.getAttribute('data-forge-infuse-fee') || '0');
        const traitId = btn.getAttribute('data-forge-trait-id') || '';
        const equip = inv.items.find(x => inventoryItemKey(x) === equipKey);
        const mat = inv.items.find(x => inventoryItemKey(x) === matKey);
        if (!equip) throw new Error('특성주입할 장비를 찾을 수 없다.');
        if (!mat) throw new Error('희귀재료를 찾을 수 없다.');
        if (!traitId) throw new Error('주입할 특성 정보가 없다.');
        const maxInfuse = equip.maxInfuse ?? EQUIP_MAX_INFUSE[equip.part||'weapon'] ?? 1;
        if ((equip.infuse || 0) >= maxInfuse) throw new Error(`이미 최대 특성 수(${maxInfuse})에 도달했다.`);
        if ((equip.traits||[]).includes(traitId)) throw new Error('이미 보유한 특성이다.');
        if (Number(inv.gold || 0) < totalCost) throw new Error(`소지금 부족. (필요 ₩${totalCost.toLocaleString('en-US')})`);
        // 비용 차감 및 재료 소모
        inv.gold = Math.max(0, Number(inv.gold || 0) - totalCost);
        removeInventoryItem(matKey, 'one');
        // 특성 주입 (100% 성공)
        if (!Array.isArray(equip.traits)) equip.traits = [];
        equip.traits.push(traitId);
        equip.infuse = (equip.infuse || 0) + 1;
        model.state.shopForgeInfuseMat = '';
        await saveDb(); await saveState(); renderApp();
        const traitLabel = EQUIP_TRAIT_LABELS[traitId] || traitId;
        toast(`💎 특성주입 성공! ${equip.name}에 [${traitLabel}] 주입 완료. (-₩${totalCost.toLocaleString('en-US')})`);
      } catch(e) { toast(e.message || String(e), true); }
    });

    on('[data-bm-gear-inv]', 'click', async (ev) => {
      try {
        const raw = ev.currentTarget.getAttribute('data-bm-gear-inv') || '';
        const colonIdx = raw.lastIndexOf(':');
        if (colonIdx < 0) return;
        const ikey = raw.slice(0, colonIdx);
        const price = Math.max(0, Number(raw.slice(colonIdx + 1) || '0'));
        const inv = getInventory();
        const it = (inv.items||[]).find(x => inventoryItemKey(x) === ikey);
        if (!it) throw new Error('해당 장비를 인벤토리에서 찾을 수 없다.');
        if (Number(it.maxDurability ?? 100) < 100 || it.isUsed) throw new Error('중고 장비는 블랙마켓 매입 불가. (최대내구도 100 & 미사용 장비만 가능)');
        const caught = Math.random() < BM_DETECT_RATE;
        if (caught) {
          // 적발 — 아이템 압수, 벌금 부과
          removeInventoryItem(ikey, 'all');
          const fine = Math.floor(price * BM_FINE_RATE);
          inv.gold = Math.max(0, Number(inv.gold || 0) - fine);
          await saveDb(); await saveState(); renderApp();
          toast(`⚠️ [${it.rank}] ${it.name} — 발각됐다! 장비 압수·거래 무효 + 벌금 ₩${fine.toLocaleString('en-US')} 부과.`, true);
        } else {
          removeInventoryItem(ikey, 'all');
          inv.gold = Number(inv.gold || 0) + price;
          await saveDb(); await saveState(); renderApp();
          toast(`🖤 [${it.rank}] ${it.name} 블랙마켓 매입 완료 (+₩${price.toLocaleString('en-US')}) — 소득 기록 없음.`);
        }
      } catch (e) { toast(e.message || String(e), true); }
    });
    // ── Guild handlers ────────────────────────────────────────────────────────
    on('[data-guild-sub]', 'click', async (ev) => {
      model.state.guildSub = ev.currentTarget.getAttribute('data-guild-sub') || '';
      await saveState(); renderApp();
    });
    on('[data-guild-join]', 'click', async (ev) => {
      const id = ev.currentTarget.getAttribute('data-guild-join') || '';
      model.db.guildId = id;
      model.state.guildSub = '';
      await saveDb(); await saveState(); renderApp();
      const g = PRESET_GUILDS.find(x => x.id === id);
      toast(g ? `${g.name}에 가입했다.` : '길드 가입 완료');
    });
    on('[data-guild-leave]', 'click', async () => {
      model.db.guildId = '';
      model.db.customGuildName = '';
      model.db.customGuildDesc = '';
      model.state.guildSub = '';
      await saveDb(); await saveState(); renderApp();
      toast('길드에서 탈퇴했다.');
    });
    on('#gb-guild-create-form', 'submit', async (ev) => {
      try {
        ev.preventDefault();
        const name = (fieldValue('#gb-guild-name-input') || '').trim().slice(0, 20);
        const desc = (fieldValue('#gb-guild-desc-input') || '').trim();
        if (!name) throw new Error('길드 이름을 입력하라.');
        model.db.guildId = 'custom';
        model.db.customGuildName = name;
        model.db.customGuildDesc = desc;
        model.state.guildSub = '';
        await saveDb(); await saveState(); renderApp();
        toast(`'${name}' 길드를 창설했다.`);
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-guild-edit-form', 'submit', async (ev) => {
      try {
        ev.preventDefault();
        const name = (fieldValue('#gb-guild-edit-name') || '').trim().slice(0, 20);
        const desc = (fieldValue('#gb-guild-edit-desc') || '').trim();
        if (!name) throw new Error('길드 이름을 입력하라.');
        const guildId = String(model.db.guildId || '');
        if (guildId === 'custom') {
          model.db.customGuildName = name;
          model.db.customGuildDesc = desc;
        } else {
          const pg = PRESET_GUILDS.find(g => g.id === guildId);
          if (pg) {
            pg.name     = name;
            pg.desc     = desc;
            pg.rankReq  = (fieldValue('#gb-guild-edit-rank') || pg.rankReq).toUpperCase().slice(0,1) || pg.rankReq;
            pg.specialty = fieldValue('#gb-guild-edit-spec') || pg.specialty;
          }
        }
        model.state.guildSub = '';
        await saveDb(); await saveState(); renderApp();
        toast('길드 정보가 수정됐다.');
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('[data-guild-tax-log-del]', 'click', async (ev) => {
      try {
        const idx = parseInt(ev.currentTarget.getAttribute('data-guild-tax-log-del') || '-1', 10);
        if (idx < 0) return;
        if (!Array.isArray(model.db.guildTaxLog)) return;
        model.db.guildTaxLog.splice(idx, 1);
        await saveDb(); renderApp();
        toast('법인세 기록 삭제 완료');
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('[data-home-move]', 'click', async (ev) => {
      try {
        const homeId = ev.currentTarget.getAttribute('data-home-move') || '';
        model.db.ownedHomeId = homeId;
        await saveDb(); await saveState(); renderApp();
        toast(homeId ? `입주 완료` : '퇴거 처리 완료');
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-inv-save', 'click', async () => {
      try {
        const inv = getInventory();
        inv.gold = Math.max(0, Number(fieldValue('#gb-inv-gold') || 0));
        await saveDb(); await saveState();
        renderApp();
        toast('인벤토리 설정 저장 완료');
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-inv-grid-toggle', 'click', async () => {
      try {
        model.state.invGridCollapsed = !model.state.invGridCollapsed;
        await saveState(); renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-inv-collect-overflow', 'click', async () => {
      try {
        const moved = collectOverflowToInventory();
        await saveDb(); await saveState();
        renderApp();
        toast(`오버플로우 회수: ${moved}개 이동`);
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-inv-clear-overflow', 'click', async () => {
      clearInventoryOverflow();
      await saveDb(); await saveState();
      renderApp();
      toast('오버플로우 비우기 완료');
    });
    on('[data-supply-add]', 'click', async (ev) => {
      try {
        const kind = ev.currentTarget.getAttribute('data-supply-add') || '';
        const res = grantInventoryItem(buildSupplyItem(kind, 1));
        if (!res.ok) throw new Error('보급품 추가 실패');
        await saveDb(); await saveState(); renderApp(); toast('보급품 추가');
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('[data-supply-remove]', 'click', async (ev) => {
      try {
        const kind = ev.currentTarget.getAttribute('data-supply-remove') || '';
        const ok = consumeInventoryById(`supply_${kind}`, 1);
        if (!ok) throw new Error('해당 보급품이 없다.');
        await saveDb(); await saveState(); renderApp(); toast('보급품 차감');
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('[data-pickaxe-add]', 'click', async (ev) => {
      try {
        const rank = ev.currentTarget.getAttribute('data-pickaxe-add') || 'E';
        const res = grantInventoryItem(buildPickaxeItem(rank, 1));
        if (!res.ok) throw new Error('곡괭이 추가 실패');
        await saveDb(); await saveState(); renderApp(); toast(`${rank}급 곡괭이 추가`);
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('[data-pickaxe-remove]', 'click', async (ev) => {
      try {
        const rank = ev.currentTarget.getAttribute('data-pickaxe-remove') || 'E';
        const ok = consumeInventoryById(`pickaxe_${rank}`, 1);
        if (!ok) throw new Error('해당 등급 곡괭이가 없다.');
        await saveDb(); await saveState(); renderApp(); toast(`${rank}급 곡괭이 차감`);
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('[data-inv-drop-one]', 'click', async (ev) => {
      removeInventoryItem(ev.currentTarget.getAttribute('data-inv-drop-one') || '', 'one');
      await saveDb(); await saveState();
      renderApp();
    });
    on('[data-inv-drop-all]', 'click', async (ev) => {
      removeInventoryItem(ev.currentTarget.getAttribute('data-inv-drop-all') || '', 'all');
      await saveDb(); await saveState();
      renderApp();
    });
    // ── 아이템 사용 핸들러 (식품/보급품 소비) ────────────────────────────────
    on('[data-inv-use]', 'click', async (ev) => {
      try {
        const key = ev.currentTarget.getAttribute('data-inv-use') || '';
        const inv = getInventory();
        const it = (inv.items||[]).find(i => inventoryItemKey(i) === key);
        if (!it) { toast('아이템을 찾을 수 없다.', true); return; }
        removeInventoryItem(key, 'one');
        await saveDb(); await saveState(); renderApp();
        toast(`${it.name} 사용 완료.`);
      } catch(e) { toast(e.message||String(e), true); }
    });
    // ── 골드 이동 핸들러 ─────────────────────────────────────────────────────
    on('[data-gold-to-shared]', 'click', async (ev) => {
      try {
        const id = ev.currentTarget.getAttribute('data-gold-to-shared') || '';
        const xType = ev.currentTarget.getAttribute('data-gold-xfer-type') || 'char';
        const amtEl = document.getElementById(`gb-gold-xfer-amt-${id}`);
        const amt = Math.floor(Number(amtEl ? amtEl.value : 0) || 0);
        if (amt <= 0) { toast('이동할 금액을 입력하라.', true); return; }
        const list = xType === 'persona' ? (model.db.personas||[]) : (model.db.characters||[]);
        const m = list.find(c => c.id === id);
        if (!m) { toast('캐릭터를 찾을 수 없다.', true); return; }
        const mGold = Number((m.inventory && m.inventory.gold) || 0);
        if (mGold < amt) { toast(`소지금 부족 (보유: ${mGold.toLocaleString('en-US')}원)`, true); return; }
        if (!m.inventory) m.inventory = { items:[], equipped:{} };
        m.inventory.gold = mGold - amt;
        const inv = getInventory();
        inv.gold = Number(inv.gold||0) + amt;
        await saveDb(); renderApp();
        toast(`💸 ${m.name} → 공용 ${amt.toLocaleString('en-US')}원 이동 완료`);
      } catch(e) { toast(e.message || String(e), true); }
    });
    on('[data-gold-from-shared]', 'click', async (ev) => {
      try {
        const id = ev.currentTarget.getAttribute('data-gold-from-shared') || '';
        const xType = ev.currentTarget.getAttribute('data-gold-xfer-type') || 'char';
        const amtEl = document.getElementById(`gb-gold-xfer-amt-${id}`);
        const amt = Math.floor(Number(amtEl ? amtEl.value : 0) || 0);
        if (amt <= 0) { toast('이동할 금액을 입력하라.', true); return; }
        const inv = getInventory();
        const sharedGold = Number(inv.gold||0);
        if (sharedGold < amt) { toast(`공용 소지금 부족 (보유: ${sharedGold.toLocaleString('en-US')}원)`, true); return; }
        const list = xType === 'persona' ? (model.db.personas||[]) : (model.db.characters||[]);
        const m = list.find(c => c.id === id);
        if (!m) { toast('캐릭터를 찾을 수 없다.', true); return; }
        if (!m.inventory) m.inventory = { items:[], equipped:{} };
        inv.gold = sharedGold - amt;
        m.inventory.gold = Number((m.inventory.gold)||0) + amt;
        await saveDb(); renderApp();
        toast(`💸 공용 → ${m.name} ${amt.toLocaleString('en-US')}원 이동 완료`);
      } catch(e) { toast(e.message || String(e), true); }
    });
    on('[data-dbtab]', 'click', async (ev) => {
      model.state.dbTab = ev.currentTarget.getAttribute('data-dbtab');
      await saveState();
      renderApp();
    });
    // ── 파티 뷰 핸들러 ────────────────────────────────────────────────────────
    on('[data-party-assign]', 'click', async (ev) => {
      const idx = parseInt(ev.currentTarget.getAttribute('data-party-assign'), 10);
      const sel = document.getElementById(`gb-party-assign-${idx}`);
      if (!sel || !sel.value) { toast('캐릭터를 선택하세요.', true); return; }
      if (!model.db.battleSetup) model.db.battleSetup = { partySlots:[], enemySlots:[] };
      if (!model.db.battleSetup.partySlots) model.db.battleSetup.partySlots = [];
      model.db.battleSetup.partySlots[idx] = sel.value;
      await saveDb(); renderApp();
    });
    on('[data-party-remove]', 'click', async (ev) => {
      const idx = parseInt(ev.currentTarget.getAttribute('data-party-remove'), 10);
      if (!model.db.battleSetup || !model.db.battleSetup.partySlots) return;
      model.db.battleSetup.partySlots[idx] = '';
      await saveDb(); renderApp();
    });
    on('#gb-party-save-all', 'click', async () => {
      await saveDb();
      toast('파티 편성 저장 완료');
    });
    on('[data-party-statup]', 'click', async (ev) => {
      const [charId, statKey] = (ev.currentTarget.getAttribute('data-party-statup') || '').split(':');
      if (!charId || !statKey) return;
      const allUnits = (model.db.characters || []).concat(model.db.personas || []);
      const unit = allUnits.find(u => u.id === charId);
      if (!unit) { toast('캐릭터를 찾을 수 없습니다.', true); return; }
      if (!unit.freeStatPoints || unit.freeStatPoints <= 0) { toast('배분 가능한 스탯포인트가 없습니다.', true); return; }
      if (!unit.stats) unit.stats = { str:0, con:0, int:0, agi:0, sense:0 };
      const cap = STAT_CAP_BY_RANK[unit.rank || 'E'] || STAT_CAP_BY_RANK.E;
      if ((unit.stats[statKey] || 0) >= cap) { toast(`${statKey} 스탯이 상한(${cap})에 도달했습니다.`, true); return; }
      unit.stats[statKey] = (unit.stats[statKey] || 0) + 1;
      unit.freeStatPoints -= 1;
      // 스탯 효과 자동 반영
      const s = unit.stats;
      unit.hp = 100 + s.con * 10 + s.str * 3;
      unit.mp = 100 + s.int * 10 + (s.sense || 0) * 3;
      unit.sp = 100 + s.agi * 10 + (s.sense || 0) * 3;
      unit.atk = Math.round((Number(unit.weaponAtk) || 0) + s.str * 0.2 + s.agi * 0.2 + s.int * 0.3);
      // 레벨업 보너스 HP/MP/SP (+2 per level)
      const lvBonus = Math.max(0, (Number(unit.level) || 1) - 1) * 2;
      unit.hp += lvBonus;
      unit.mp += lvBonus;
      unit.sp += lvBonus;
      await saveDb(); renderApp();
      toast(`${unit.name}: ${statKey} +1 (잔여 ${unit.freeStatPoints}포인트)`);
    });
    on('[data-party-inv]', 'click', async (ev) => {
      model.state.partyInvTarget = ev.currentTarget.getAttribute('data-party-inv') || '';
      await saveState(); renderApp();
    });
    on('[data-party-inv-close]', 'click', async () => {
      model.state.partyInvTarget = '';
      await saveState(); renderApp();
    });
    // ── 캐릭터 뷰 핸들러 ──────────────────────────────────────────────────────
    on('[data-charview-tab]', 'click', async (ev) => {
      model.state.charViewTab = ev.currentTarget.getAttribute('data-charview-tab');
      model.state.charViewSelected = '';
      await saveState(); renderApp();
    });
    on('[data-charview-select]', 'click', async (ev) => {
      model.state.charViewSelected = ev.currentTarget.getAttribute('data-charview-select');
      await saveState(); renderApp();
    });
    on('[data-charview-statup]', 'click', async (ev) => {
      const [charId, statKey] = (ev.currentTarget.getAttribute('data-charview-statup') || '').split(':');
      if (!charId || !statKey) return;
      const allUnits = (model.db.characters || []).concat(model.db.personas || []);
      const unit = allUnits.find(u => u.id === charId);
      if (!unit) { toast('캐릭터를 찾을 수 없습니다.', true); return; }
      if (!unit.freeStatPoints || unit.freeStatPoints <= 0) { toast('배분 가능한 스탯포인트가 없습니다.', true); return; }
      if (!unit.stats) unit.stats = { str:0, con:0, int:0, agi:0, sense:0 };
      const cap = STAT_CAP_BY_RANK[unit.rank || 'E'] || STAT_CAP_BY_RANK.E;
      if ((unit.stats[statKey] || 0) >= cap) { toast(`${statKey} 스탯이 상한(${cap})에 도달했습니다.`, true); return; }
      unit.stats[statKey] = (unit.stats[statKey] || 0) + 1;
      unit.freeStatPoints -= 1;
      // 스탯 효과 자동 반영
      const s = unit.stats;
      unit.hp = 100 + s.con * 10 + s.str * 3;
      unit.mp = 100 + s.int * 10 + (s.sense || 0) * 3;
      unit.sp = 100 + s.agi * 10 + (s.sense || 0) * 3;
      unit.atk = Math.round((Number(unit.weaponAtk) || 0) + s.str * 0.2 + s.agi * 0.2 + s.int * 0.3);
      const lvBonus = Math.max(0, (Number(unit.level) || 1) - 1) * 2;
      unit.hp += lvBonus;
      unit.mp += lvBonus;
      unit.sp += lvBonus;
      await saveDb(); renderApp();
      toast(`${unit.name}: ${statKey} +1 (잔여 ${unit.freeStatPoints}포인트)`);
    });
    on('[data-select-type]', 'click', async (ev) => {
      const type = ev.currentTarget.getAttribute('data-select-type');
      const id = ev.currentTarget.getAttribute('data-id');
      model.state.selected[type] = id;
      await saveState();
      renderApp();
    });
    on('[data-gate-rank]', 'click', async (ev) => {
      const gs = gateStateSafe();
      gs.rank = String(ev.currentTarget.getAttribute('data-gate-rank') || 'E').toUpperCase();
      generateGateOptions(gs.size || 'small', gs.rank);
      await saveState();
      renderApp();
    });
    on('[data-gate-size]', 'click', async (ev) => {
      const gs = gateStateSafe();
      generateGateOptions(ev.currentTarget.getAttribute('data-gate-size'), gs.rank || 'E');
      await saveState();
      renderApp();
    });
    on('#gb-gate-reroll', 'click', async () => {
      const gs = gateStateSafe();
      generateGateOptions(gs.size || 'small', gs.rank || 'E');
      await saveState();
      renderApp();
    });
    on('[data-gate-select]', 'click', async (ev) => {
      gateStateSafe().selectedId = ev.currentTarget.getAttribute('data-gate-select') || '';
      await saveState();
      renderApp();
    });
    on('#gb-gate-reroll-one', 'click', async () => {
      const gs = gateStateSafe();
      const idx = (gs.generated || []).findIndex(g => g.id === gs.selectedId);
      if (idx < 0) return toast('선택된 게이트가 없다.', true);
      gs.generated[idx] = generateGateOption(gs.size || 'small', idx, gs.rank || 'E');
      gs.selectedId = gs.generated[idx].id;
      await saveState();
      renderApp();
    });
    on('#gb-gate-apply', 'click', async () => {
      try {
        await applyGateSelectionToBattle(false);
        toast('선택 게이트를 적 편성에 반영했다.');
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-gate-apply-go', 'click', async () => {
      try {
        await applyGateSelectionToBattle(true);
        toast('게이트를 반영하고 전투 화면으로 이동했다.');
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-gate-run-start', 'click', async () => {
      try {
        if (activeGateRun()) { toast('이미 진행 중인 게이트가 있다.'); return; }
        beginGateRunFromSelectedGate();
        await saveState();
        renderApp();
        toast('게이트에 진입했다.');
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('[data-stage-choice]', 'click', async (ev) => {
      try {
        const run = getGateRun();
        if (run && run.sideRoomActive) throw new Error('비밀방을 먼저 처리해야 한다.');
        const stage = getCurrentStage(run);
        if (!run || !stage || stage.kind !== 'choice') throw new Error('현재 갈림길이 아니다.');
        stage.chosen = ev.currentTarget.getAttribute('data-stage-choice') || '';
        const room = getActiveRoom(run);
        if (room) room.discovered = false;
        await saveState();
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-room-enter', 'click', async () => {
      try {
        const run = getGateRun();
        if (!run) throw new Error('진행 중인 게이트가 없다.');
        enterGateRoom(run);
        await saveState();
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-room-solve-puzzle', 'click', async () => {
      try {
        const run = getGateRun();
        const room = getActiveRoom(run);
        if (!run || !room || room.type !== 'puzzle') throw new Error('현재 퍼즐방이 아니다.');
        resolvePuzzleRoom(run, room);
        await saveState();
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-room-open-secret', 'click', async () => {
      try {
        const run = getGateRun();
        const room = getActiveRoom(run);
        if (!run || !room || room.type !== 'secret') throw new Error('현재 비밀방이 아니다.');
        resolveSecretRoom(run, room);
        await saveState();
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-room-mine', 'click', async () => {
      try {
        const run = getGateRun();
        const room = getActiveRoom(run);
        const lines = mineGateRoom(run, room);
        await saveDb(); await saveState();
        renderApp();
        toast(lines.length ? '광맥 채굴 완료' : '채굴 결과 없음');
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-room-next', 'click', async () => {
      try {
        const run = getGateRun();
        continueAfterClearedRoom(run);
        await saveState();
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-room-retreat', 'click', async () => {
      try {
        retreatFromGateRun(getGateRun());
        await saveState();
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-room-camp', 'click', async () => {
      try {
        const run = getGateRun();
        if (!run) throw new Error('진행 중인 게이트가 없다.');
        const lines = campGateParty(run);
        await saveState();
        renderApp();
        toast(lines.length ? '야영 완료' : '야영 완료');
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-room-skip-camp', 'click', async () => {
      try {
        const run = getGateRun();
        if (!run) throw new Error('진행 중인 게이트가 없다.');
        skipCampRoom(run);
        await saveState();
        renderApp();
        toast('야영지 통과');
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-secret-enter', 'click', async () => {
      try {
        const run = getGateRun();
        if (!run || !run.secretPlan || !run.secretPlan.offered) throw new Error('발견된 비밀방이 없다.');
        run.sideRoomActive = true;
        run.secretPlan.room.discovered = true;
        await saveState();
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-secret-skip', 'click', async () => {
      try {
        const run = getGateRun();
        if (!run || !run.secretPlan || !run.secretPlan.offered) throw new Error('발견된 비밀방이 없다.');
        run.secretPlan.offered = false;
        run.secretPlan.resolved = true;
        await saveState();
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });

    on('#gb-save-setup', 'click', async () => {
      model.db.battleSetup.partySlots = readPartySlotsFromUI();
      model.db.battleSetup.enemySlots = readEnemySlotsFromUI();
      await saveDb(); await saveState();
      toast('편성 저장 완료');
    });
    on('#gb-start-battle', 'click', async () => {
      try {
        model.db.battleSetup.partySlots = readPartySlotsFromUI();
        model.db.battleSetup.enemySlots = readEnemySlotsFromUI();
        buildBattleFromSetup();
        await saveDb(); await saveState();
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });

    on('#gb-run-round', 'click', async () => {
      try {
        collectPendingActions();
        resolveOneRound();
        autoHandleFinishedGateBattle();
        await saveState();
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-auto-one', 'click', async () => {
      try {
        const runtime = model.state.runtime;
        const pending = {};
        getAlive(runtime.party).forEach(u => { pending[u.uid] = { mode:'auto' }; });
        runtime.pendingActions = pending;
        resolveOneRound();
        autoHandleFinishedGateBattle();
        await saveState();
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-auto-battle', 'click', async () => {
      try {
        autoResolveBattle(30);
        autoHandleFinishedGateBattle();
        await saveState();
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-reset-battle', 'click', async () => {
      model.state.runtime = buildDefaultRuntime();
      await saveState();
      renderApp();
    });
    on('#gb-copy-llm', 'click', async () => {
      const text = model.state.runtime.llmBlock || '';
      if (!text) return toast('복사할 결과 블록이 아직 없다.', true);
      try { await navigator.clipboard.writeText(text); toast('결과 블록 복사 완료'); }
      catch (e) { toast('클립보드 복사 실패', true); }
    });
    on('#gb-postbattle-copy-llm', 'click', async () => {
      const run = getGateRun();
      const text = run && run.postBattle ? String(run.postBattle.llmBlock || '') : '';
      if (!text) return toast('복사할 결과 블록이 없다.', true);
      try { await navigator.clipboard.writeText(text); toast('결과 블록 복사 완료'); }
      catch (e) { toast('클립보드 복사 실패', true); }
    });
    on('#gb-postbattle-next', 'click', async () => {
      try {
        const run = getGateRun();
        continueAfterGateBattle(run);
        await saveState();
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-postbattle-rest', 'click', async () => {
      try {
        const run = getGateRun();
        const lines = restGateParty(run);
        toast(lines.length ? '휴식 완료' : '휴식 완료');
        await saveState();
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-postbattle-mine', 'click', async () => {
      try {
        const run = getGateRun();
        const room = run && run.postBattle ? getRoomById(run, run.postBattle.roomId) : null;
        const lines = mineGateRoom(run, room);
        await saveDb(); await saveState();
        renderApp();
        toast(lines.length ? '광맥 채굴 완료' : '채굴 결과 없음');
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-postbattle-retreat', 'click', async () => {
      try {
        retreatFromGateRun(getGateRun());
        await saveState();
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-gate-battle-win', 'click', async () => {
      try {
        resolveGateBattleAftermath(true);
        await saveState();
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-gate-battle-fail', 'click', async () => {
      try {
        resolveGateBattleAftermath(false);
        await saveState();
        renderApp();
      } catch (e) { toast(e.message || String(e), true); }
    });

    on('#gb-char-new', 'click', async () => {
      model.state.selected.characters = '';
      await saveState();
      renderApp();
    });
    on('#gb-char-save', 'click', async () => { try { await saveCharacterFromForm(); } catch (e) { toast(e.message || String(e), true); } });
    on('#gb-char-delete', 'click', async () => { try { await deleteSelected('characters'); } catch (e) { toast(e.message || String(e), true); } });
    on('#gb-char-clear-all', 'click', async () => { try { await clearAllCharacters(); } catch (e) { toast(e.message || String(e), true); } });

    on('#gb-mon-new', 'click', async () => { model.state.selected.monsters = ''; await saveState(); renderApp(); });
    on('#gb-mon-save', 'click', async () => { try { await saveMonsterFromForm(); } catch (e) { toast(e.message || String(e), true); } });
    on('#gb-mon-delete', 'click', async () => { try { await deleteSelected('monsters'); } catch (e) { toast(e.message || String(e), true); } });
    on('#gb-mon-clear-all', 'click', async () => { try { await clearAllMonsters(); } catch (e) { toast(e.message || String(e), true); } });
    on('#gb-mon-export-json', 'click', async () => {
      const el = model.root && model.root.querySelector('#gb-mon-json');
      if (el) el.value = exportMonstersJsonText();
      toast('몬스터 JSON 내보내기 완료');
    });
    on('#gb-mon-import-json', 'click', async () => {
      try { await importMonstersJsonFromText(fieldValue('#gb-mon-json')); }
      catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-mon-copy-json', 'click', async () => {
      try {
        const text = fieldValue('#gb-mon-json') || exportMonstersJsonText();
        await navigator.clipboard.writeText(text);
        toast('JSON 복사 완료');
      } catch (e) { toast('복사 실패', true); }
    });

    on('#gb-persona-new', 'click', async () => { model.state.selected.personas = ''; await saveState(); renderApp(); });
    on('#gb-persona-save', 'click', async () => { try { await savePersonaFromForm(); } catch (e) { toast(e.message || String(e), true); } });
    on('#gb-persona-delete', 'click', async () => { try { await deleteSelected('personas'); } catch (e) { toast(e.message || String(e), true); } });

    // ── 개인 인벤토리 탭 전환 ──
    on('[data-personal-inv-tab]', 'click', async (ev) => {
      const raw = ev.currentTarget.getAttribute('data-personal-inv-tab') || '';
      const [type, tab] = raw.split(':');
      if (type === 'persona') model.state.personaInvTab = tab || 'equip';
      else model.state.charInvTab = tab || 'equip';
      await saveState(); renderApp();
    });
    // ── 개인 장착 (개인인벤 → 장비슬롯) ──
    on('[data-personal-equip]', 'click', async (ev) => {
      try {
        const raw = ev.currentTarget.getAttribute('data-personal-equip') || '';
        const parts = raw.split(':');
        const type = parts[0], entityId = parts[1];
        const ikey = parts.slice(2).join(':');
        const inv = getPersonalInv(type, entityId);
        if (!inv) throw new Error('개인 인벤 없음');
        const idx = (inv.items||[]).findIndex(it => inventoryItemKey(it) === ikey);
        if (idx < 0) throw new Error('장착할 아이템을 개인 인벤에서 찾을 수 없다.');
        const it = inv.items[idx];
        // 가방은 bag 슬롯에, 장비는 part 슬롯에 장착
        const isBag = it.category === 'bag';
        const slot = isBag ? 'bag' : (it.part || 'weapon');
        // 기존 장착 해제 → 개인 인벤으로 반환
        if (inv.equipped[slot]) inv.items.push(inv.equipped[slot]);
        if (!isBag) {
          // 첫 장착 시 내구도 maxDurability 감소 (100→99)
          applyFirstEquip(it);
        }
        inv.equipped[slot] = it;
        inv.items.splice(idx, 1);
        // 가방 장착 시 캐릭터 bagId 동기화
        if (isBag) {
          const arr = type === 'persona' ? (model.db.personas || []) : (model.db.characters || []);
          const entity = arr.find(x => x.id === entityId);
          if (entity) entity.bagId = it.bagId || it.id;
        }
        await saveDb(); await saveState(); renderApp();
        const msg = isBag ? `🎒 ${it.name} 가방 장착 완료` : `⚔️ ${it.name} 장착 완료 (${EQUIP_PART_LABELS[slot]||slot}) — 내구도 ${it.durability}/${it.maxDurability}`;
        toast(msg);
      } catch(e) { toast(e.message||String(e), true); }
    });
    // ── 개인 해제 (장비슬롯 → 개인인벤) ──
    on('[data-personal-unequip]', 'click', async (ev) => {
      try {
        const raw = ev.currentTarget.getAttribute('data-personal-unequip') || '';
        const [type, entityId, slot] = raw.split(':');
        const inv = getPersonalInv(type, entityId);
        if (!inv || !inv.equipped[slot]) throw new Error('해제할 장비 없음');
        const it = inv.equipped[slot];
        inv.equipped[slot] = null;
        if (!Array.isArray(inv.items)) inv.items = [];
        inv.items.push(it);
        // 가방 해제 시 캐릭터 bagId 초기화
        if (slot === 'bag') {
          const arr = type === 'persona' ? (model.db.personas || []) : (model.db.characters || []);
          const entity = arr.find(x => x.id === entityId);
          if (entity) entity.bagId = 'none';
        }
        await saveDb(); await saveState(); renderApp();
        toast(`↩️ ${it.name} 해제 완료`);
      } catch(e) { toast(e.message||String(e), true); }
    });
    // ── 공용 인벤 → 개인 인벤 이동 ──
    on('[data-shared-to-personal]', 'click', async (ev) => {
      try {
        const raw = ev.currentTarget.getAttribute('data-shared-to-personal') || '';
        const parts = raw.split(':');
        const type = parts[0], entityId = parts[1];
        const ikey = parts.slice(2).join(':');
        const sharedInv = getInventory();
        const idx = (sharedInv.items||[]).findIndex(it => inventoryItemKey(it) === ikey);
        if (idx < 0) throw new Error('공용 인벤에서 아이템을 찾을 수 없다.');
        const it = deepClone(sharedInv.items[idx]);
        sharedInv.items.splice(idx, 1);
        const personalInv = getPersonalInv(type, entityId);
        if (!personalInv) throw new Error('개인 인벤 없음');
        if (!Array.isArray(personalInv.items)) personalInv.items = [];
        personalInv.items.push(it);
        await saveDb(); await saveState(); renderApp();
        toast(`📦 ${it.name} → 개인 인벤 이동 완료`);
      } catch(e) { toast(e.message||String(e), true); }
    });
    // ── 개인 인벤 → 공용 인벤 이동 ──
    on('[data-personal-to-shared]', 'click', async (ev) => {
      try {
        const raw = ev.currentTarget.getAttribute('data-personal-to-shared') || '';
        const parts = raw.split(':');
        const type = parts[0], entityId = parts[1];
        const ikey = parts.slice(2).join(':');
        const personalInv = getPersonalInv(type, entityId);
        if (!personalInv) throw new Error('개인 인벤 없음');
        const idx = (personalInv.items||[]).findIndex(it => inventoryItemKey(it) === ikey);
        if (idx < 0) throw new Error('개인 인벤에서 아이템을 찾을 수 없다.');
        const it = deepClone(personalInv.items[idx]);
        personalInv.items.splice(idx, 1);
        grantInventoryItem(it);
        await saveDb(); await saveState(); renderApp();
        toast(`📦 ${it.name} → 공용 인벤 이동 완료`);
      } catch(e) { toast(e.message||String(e), true); }
    });

    on('#gb-mat-new', 'click', async () => { model.state.selected.materials = ''; await saveState(); renderApp(); });
    on('#gb-mat-save', 'click', async () => { try { await saveMaterialTraitFromForm(); } catch (e) { toast(e.message || String(e), true); } });
    on('#gb-mat-delete', 'click', async () => { try { await deleteSelected('materials'); } catch (e) { toast(e.message || String(e), true); } });
    on('#gb-mat-export-json', 'click', async () => {
      const el = model.root && model.root.querySelector('#gb-mat-json');
      if (el) el.value = exportRareTraitsJsonText();
      toast('희귀재료 특성 JSON 내보내기 완료');
    });
    on('#gb-mat-import-json', 'click', async () => {
      try { await importMaterialJsonFromText(fieldValue('#gb-mat-json')); }
      catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-mat-copy-json', 'click', async () => {
      try {
        const text = fieldValue('#gb-mat-json') || exportRareTraitsJsonText();
        await navigator.clipboard.writeText(text);
        toast('희귀재료 특성 JSON 복사 완료');
      } catch (e) { toast('복사 실패', true); }
    });

    // 대상 선택 시 계수 자동 채우기 (수정 가능)
    on('#gb-skill-target', 'change', () => {
      const grade = fieldValue('#gb-skill-grade') || 'E';
      const target = fieldValue('#gb-skill-target') || 'singleEnemy';
      const singleCoefs = { E:1.2, D:1.92, C:2.88, B:4.8, A:7.68, S:11.52 };
      const baseCoef = singleCoefs[grade] || 1.2;
      let coef = baseCoef;
      if (target === 'allEnemies' || target === 'allAllies') coef = Math.round(baseCoef * 0.58 * 1000) / 1000;
      else if (target.startsWith('row')) coef = Math.round(baseCoef * 0.58 * 1000) / 1000;
      const el = model.root && model.root.querySelector('#gb-skill-coef');
      if (el) el.value = coef;
    });
    on('#gb-skill-grade', 'change', () => {
      const grade = fieldValue('#gb-skill-grade') || 'E';
      const target = fieldValue('#gb-skill-target') || 'singleEnemy';
      const singleCoefs = { E:1.2, D:1.92, C:2.88, B:4.8, A:7.68, S:11.52 };
      const baseCoef = singleCoefs[grade] || 1.2;
      let coef = baseCoef;
      if (target === 'allEnemies' || target === 'allAllies') coef = Math.round(baseCoef * 0.58 * 1000) / 1000;
      else if (target.startsWith('row')) coef = Math.round(baseCoef * 0.58 * 1000) / 1000;
      const el = model.root && model.root.querySelector('#gb-skill-coef');
      if (el) el.value = coef;
    });

    on('#gb-skill-new', 'click', async () => { model.state.selected.skills = ''; await saveState(); renderApp(); });
    on('#gb-skill-save', 'click', async () => { try { await saveSkillFromForm(); } catch (e) { toast(e.message || String(e), true); } });
    on('#gb-skill-delete', 'click', async () => { try { await deleteSelected('skills'); } catch (e) { toast(e.message || String(e), true); } });
    on('#gb-skill-clear-all', 'click', async () => { try { await clearAllCustomSkills(); } catch (e) { toast(e.message || String(e), true); } });
    // 스킬 JSON 가져오기/내보내기
    on('#gb-skill-export-json', 'click', async () => {
      const el = model.root && model.root.querySelector('#gb-skill-json');
      if (el) el.value = exportSkillsJsonText();
      toast('스킬 JSON 내보내기 완료');
    });
    on('#gb-skill-import-json', 'click', async () => {
      try { await importSkillsJsonFromText(fieldValue('#gb-skill-json')); }
      catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-skill-copy-json', 'click', async () => {
      try {
        const text = fieldValue('#gb-skill-json') || exportSkillsJsonText();
        await navigator.clipboard.writeText(text);
        toast('스킬 JSON 복사 완료');
      } catch (e) { toast('복사 실패', true); }
    });
    // 내장 스킬 클릭 → 편집기로 불러오기
    on('[data-load-builtin-skill]', 'click', async (ev) => {
      const skillId = ev.currentTarget.getAttribute('data-load-builtin-skill');
      if (skillId) {
        model.state.selected.skills = skillId;
        await saveState(); renderApp();
        toast(`📝 내장 스킬 "${skillId}" 편집기에 로드됨`);
      }
    });
    // 내장 스킬 원본 복원 (오버라이드 삭제)
    on('#gb-skill-restore', 'click', async () => {
      const selId = model.state.selected.skills;
      if (!selId || !BUILTIN_SKILLS[selId]) return;
      model.db.customSkills = (model.db.customSkills || []).filter(x => x.id !== selId);
      await saveDb(); await saveState(); renderApp();
      toast(`↩️ "${selId}" 원본으로 복원 완료`);
    });

    // Equipment tab handlers
    on('#gb-eq-new', 'click', async () => { model.state.selected.equipment = ''; await saveState(); renderApp(); });
    on('#gb-eq-save', 'click', async () => { try { await saveEquipmentFromForm(); } catch (e) { toast(e.message || String(e), true); } });
    on('#gb-eq-delete', 'click', async () => { try { await deleteSelected('equipment'); } catch (e) { toast(e.message || String(e), true); } });
    on('#gb-eq-export', 'click', async () => {
      const text = JSON.stringify({ equipments: model.db.equipments || [] }, null, 2);
      const el = model.root && model.root.querySelector('#gb-eq-json');
      if (el) el.value = text;
      try { await navigator.clipboard.writeText(text); toast('장비 JSON 복사 완료'); } catch { toast('JSON 내보내기 완료 (클립보드 실패)'); }
    });
    on('#gb-eq-import-json', 'click', async () => {
      try {
        const raw = fieldValue('#gb-eq-json');
        if (!raw) throw new Error('JSON이 비어 있다.');
        let parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) parsed = { equipments: parsed };
        const list = parsed.equipments || parsed.equipment || [];
        if (!Array.isArray(list)) throw new Error('올바른 장비 배열이 아니다.');
        if (!Array.isArray(model.db.equipments)) model.db.equipments = [];
        list.forEach(e => { if (e && e.id) upsertById(model.db.equipments, e); });
        await saveDb(); await saveState(); renderApp(); toast(`장비 ${list.length}개 가져오기 완료`);
      } catch (e) { toast(e.message || String(e), true); }
    });
    on('#gb-eq-calc-repair', 'click', () => {
      const sel = model.state.selected.equipment;
      const eq = (model.db.equipments || []).find(e => e.id === sel);
      if (!eq) return;
      const target = Number(fieldValue('#gb-eq-repair-target') || 100);
      const current = Number(eq.durability != null ? eq.durability : 100);
      const lost = Math.max(0, target - current);
      if (lost <= 0) { const el = model.root && model.root.querySelector('#gb-eq-repair-result'); if (el) el.textContent = '수리 불필요 (이미 충분)'; return; }
      const fee = calcRepairFee(eq.rank || 'E', eq.part || 'weapon', lost);
      const el = model.root && model.root.querySelector('#gb-eq-repair-result');
      if (el) el.textContent = `수리비: ${fee === 0 ? '무료 (E등급)' : fee.toLocaleString('en-US') + '원'} (${lost}% 회복)`;
    });
    on('[data-eq-part-filter]', 'click', async (ev) => {
      model.state.equipPartFilter = ev.currentTarget.getAttribute('data-eq-part-filter');
      await saveState(); renderApp();
    });
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${UI_ID} { position:fixed; inset:0; z-index:9999; font-family: Inter, Pretendard, sans-serif; pointer-events:none; }
      #${UI_ID} .hidden { display:none; }
      #${UI_ID} .gb-shell { background:#0f1117; color:#e2e8f0; height:100%; overflow:auto; padding:18px 18px 100px; pointer-events:auto; }
      #${UI_ID} .gb-header { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; margin-bottom:16px; }
      #${UI_ID} .gb-title { font-size:22px; font-weight:800; }
      #${UI_ID} .gb-sub { color:#94a3b8; font-size:12px; line-height:1.45; }
      #${UI_ID} .gb-grid { display:grid; gap:12px; margin-bottom:12px; }
      #${UI_ID} .gb-grid.two { grid-template-columns:repeat(2,minmax(0,1fr)); }
      #${UI_ID} .gb-grid.three { grid-template-columns:repeat(3,minmax(0,1fr)); }
      #${UI_ID} .gb-grid.four { grid-template-columns:repeat(4,minmax(0,1fr)); }
      #${UI_ID} .gb-grid.db { grid-template-columns:320px 1fr; }
      #${UI_ID} .gb-panel { background:#171a23; border:1px solid rgba(148,163,184,0.16); border-radius:14px; padding:12px; }
      #${UI_ID} .gb-section-title { font-size:14px; font-weight:700; margin-bottom:8px; }
      #${UI_ID} label { display:block; font-size:12px; color:#cbd5e1; margin-bottom:8px; }
      #${UI_ID} .gb-input, #${UI_ID} .gb-textarea, #${UI_ID} select { width:100%; box-sizing:border-box; background:#0b0d12; color:#e2e8f0; border:1px solid rgba(148,163,184,0.18); border-radius:10px; padding:8px 10px; margin-top:4px; }
      #${UI_ID} .gb-textarea { min-height:280px; resize:vertical; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size:12px; }
      #${UI_ID} .gb-textarea.short { min-height:180px; }
      #${UI_ID} .gb-btn-row { display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
      #${UI_ID} .gb-btn { background:#222734; color:#e2e8f0; border:1px solid rgba(148,163,184,0.22); border-radius:10px; padding:8px 12px; cursor:pointer; }
      #${UI_ID} .gb-btn.tiny { padding:3px 7px; font-size:11px; border-radius:7px; }
      #${UI_ID} .gb-btn.primary { background:#2563eb; border-color:#2563eb; }
      #${UI_ID} .gb-btn.active  { background:#1d4ed8; border-color:#3b82f6; }
      #${UI_ID} .gb-btn:hover, #${UI_ID} .gb-card-nav:hover, #${UI_ID} .gb-list-item:hover { filter:brightness(1.08); }
      #${UI_ID} .gb-card-nav { text-align:left; background:#171a23; color:#e2e8f0; border:1px solid rgba(148,163,184,0.16); border-radius:14px; padding:18px; cursor:pointer; }
      #${UI_ID} .gb-card-nav.is-selected { border-color:#2563eb; background:#12203f; }
      #${UI_ID} .gb-card-title { font-size:20px; font-weight:800; margin-bottom:8px; }
      #${UI_ID} .gb-rule { margin-top:8px; color:#f6ad55; font-size:12px; font-weight:700; }
      #${UI_ID} .gb-skill-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
      #${UI_ID} .gb-skill-row { background:#0b0d12; border:1px solid rgba(148,163,184,0.12); border-radius:10px; padding:8px; }
      #${UI_ID} .gb-skill-desc { font-size:11px; color:#94a3b8; margin-top:4px; line-height:1.35; }
      #${UI_ID} .gb-list-item { width:100%; text-align:left; display:block; background:#0b0d12; border:1px solid rgba(148,163,184,0.12); border-radius:10px; color:#e2e8f0; padding:10px; margin-bottom:8px; cursor:pointer; }
      #${UI_ID} .gb-list-item.is-active { border-color:#2563eb; background:#12203f; }
      #${UI_ID} .gb-badge { display:inline-block; font-size:10px; padding:2px 6px; border-radius:999px; background:rgba(59,130,246,0.18); color:#bfdbfe; border:1px solid rgba(59,130,246,0.22); margin-left:4px; }
      #${UI_ID} .gb-unit { border:1px solid rgba(148,163,184,0.15); border-radius:10px; padding:10px; margin-bottom:8px; background:#0b0d12; }
      #${UI_ID} .gb-unit.is-dead { opacity:0.55; }
      #${UI_ID} .gb-unit-top { display:flex; justify-content:space-between; gap:10px; align-items:flex-start; }
      #${UI_ID} .gb-bar-wrap { display:grid; grid-template-columns:96px 1fr; align-items:center; gap:8px; font-size:11px; margin-top:6px; }
      #${UI_ID} .gb-bar { height:8px; background:#1e293b; border-radius:999px; overflow:hidden; }
      #${UI_ID} .gb-bar-fill { height:100%; }
      #${UI_ID} .gb-bar-fill.hp { background:#ef4444; }
      #${UI_ID} .gb-bar-fill.mp { background:#3b82f6; }
      #${UI_ID} .gb-bar-fill.sp { background:#eab308; }
      #${UI_ID} .gb-log { font-size:12px; line-height:1.45; max-height:360px; overflow:auto; display:flex; flex-direction:column; gap:6px; }
      #${UI_ID} .gb-command-list { display:flex; flex-direction:column; gap:8px; margin-top:8px; }
      #${UI_ID} .gb-command-row { display:grid; grid-template-columns:180px 140px 1fr 1fr; gap:8px; align-items:center; }
      #${UI_ID} .gb-dead { color:#fca5a5; font-size:11px; }
      #${UI_ID} .gb-stun { color:#fcd34d; font-size:11px; margin-left:4px; }
      #${UI_ID} .gb-buff { color:#93c5fd; font-size:11px; margin-left:4px; }
      #${UI_ID} .gb-debuff { color:#fca5a5; font-size:11px; margin-left:4px; }
      #${UI_ID} .gb-toast { position:fixed; right:20px; bottom:20px; background:#111827; color:#e2e8f0; border:1px solid rgba(148,163,184,0.2); border-radius:10px; padding:10px 12px; opacity:0; transform:translateY(8px); transition:all .18s ease; pointer-events:none; z-index:10000; }
      #${UI_ID} .gb-toast.show { opacity:1; transform:translateY(0); }
      #${UI_ID} .gb-toast.err { border-color:rgba(239,68,68,0.45); color:#fecaca; }
      #${UI_ID} .gb-inv-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(90px,1fr)); gap:8px; margin-top:8px; }
      #${UI_ID} .gb-inv-slot { border:1px solid rgba(148,163,184,0.2); border-radius:10px; min-height:90px; padding:6px; box-sizing:border-box; display:flex; flex-direction:column; justify-content:space-between; }
      #${UI_ID} .gb-inv-slot.filled { background:rgba(59,130,246,0.06); }
      #${UI_ID} .gb-inv-slot.empty { background:#0b0d12; opacity:0.45; }
      #${UI_ID} .gb-inv-slot-name { font-size:11px; font-weight:700; line-height:1.3; word-break:break-word; }
      #${UI_ID} .gb-inv-slot-meta { font-size:10px; color:#94a3b8; margin-top:2px; }
      #${UI_ID} .gb-inv-slot-btns { display:flex; gap:3px; margin-top:4px; }
      #${UI_ID} .gb-inv-slot-empty-label { font-size:10px; color:rgba(148,163,184,0.4); text-align:center; padding-top:30px; }
      /* 아이템 슬롯 툴팁 */
      #${UI_ID} .gb-inv-tooltip-wrap { position:relative; }
      #${UI_ID} .gb-inv-tooltip-wrap .gb-inv-slot-tooltip { display:none; position:absolute; bottom:calc(100% + 6px); left:50%; transform:translateX(-50%); background:#1e2130; color:#e2e8f0; font-size:11px; white-space:pre-line; padding:6px 10px; border-radius:8px; border:1px solid rgba(148,163,184,0.25); pointer-events:none; z-index:200; min-width:160px; max-width:260px; line-height:1.45; }
      #${UI_ID} .gb-inv-tooltip-wrap:hover .gb-inv-slot-tooltip { display:block; }
      /* tooltip for icon-only buttons */
      #${UI_ID} [data-tooltip] { position:relative; }
      #${UI_ID} [data-tooltip]::after { content:attr(data-tooltip); position:absolute; bottom:calc(100% + 5px); left:50%; transform:translateX(-50%); background:#1e2130; color:#e2e8f0; font-size:11px; white-space:nowrap; padding:4px 8px; border-radius:6px; border:1px solid rgba(148,163,184,0.25); pointer-events:none; opacity:0; transition:opacity 0.15s; z-index:100; }
      #${UI_ID} [data-tooltip]:hover::after { opacity:1; }
      @keyframes gb-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      @media (max-width: 1200px) {
        #${UI_ID} .gb-grid.two, #${UI_ID} .gb-grid.three, #${UI_ID} .gb-grid.four, #${UI_ID} .gb-grid.db, #${UI_ID} .gb-skill-list { grid-template-columns:1fr; }
        #${UI_ID} .gb-command-row { grid-template-columns:1fr; }
      }
    `;
    document.head.appendChild(style);
  }
  function ensureRoot() {
    let root = document.getElementById(UI_ID);
    if (!root) {
      root = document.createElement('div');
      root.id = UI_ID;
      document.body.appendChild(root);
    }
    model.root = root;
  }

  async function initPlugin() {
    await loadAll();
    ensureStyle();
    ensureRoot();
    renderApp();

    window.addEventListener('keydown', async (ev) => {
      if (ev.key === 'Escape' && model.state.visible) {
        model.state.visible = false;
        await lsSet(KEY_VISIBLE, 'false');
        if (_hasRisu && Risuai.hideContainer) await Risuai.hideContainer();
        renderApp();
      }
    });

    if (_hasRisu && Risuai.registerButton) {
      Risuai.registerButton({
        name:'⚔️ Gate v1.7',
        icon:'⚔️',
        iconType:'html',
        location:'action'
      }, async () => {
        model.state.visible = true;
        await lsSet(KEY_VISIBLE, 'true');
        if (_hasRisu && Risuai.showContainer) await Risuai.showContainer('fullscreen');
        renderApp();
      });
    }

    if (_hasRisu && model.state.visible && Risuai.showContainer) {
      await Risuai.showContainer('fullscreen');
    }

    console.log(PLUGIN_NAME, 'ready');
  }

  await initPlugin();
} catch (error) {
  console.error('[Gate Battle Prototype v1.7] init error:', error && error.message ? error.message : error, error && error.stack ? error.stack : '');
}
})();
