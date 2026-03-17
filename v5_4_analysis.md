# GateBattle v5_4 — TXT 기반 구현 상태 & 밸런스 분석

> ⚠️ **이 문서는 v5.4 시점의 역사적 기록입니다. 현재 최신 버전은 v7.3 (`GateBattle_v7_3.js`)입니다.**

> 분석 대상: `GateBattle_v5_4.js`, `skill_system.txt`, `CCC.txt`, `combat_formulas.txt`, `equipment_inventory_system.txt`

---

## 1. v4_8 → v5_4 주요 변경 사항 확인

| 항목 | v4_8 | v5_4 | 상태 |
|------|------|------|:---:|
| 3종 신규 종족 (악마/빙정/천사체) | ❌ 미구현 | ✅ SPECIES_LABELS, GATE_SPECIES_COMPAT, GATE_COMBO_PLACES 추가 | ✅ |
| 게이트 사이즈 가중치 (GATE_SIZE_WEIGHTS) | ❌ 미구현 | ✅ small:55, medium:35, large:10 | ✅ |
| 게이트 등급: 모든 사이즈에 E~S 등급 포함 | ❌ E/D만 | ✅ small/medium/large 모두 E~S | ✅ |
| 마정석 가격 (MANA_STONE_WON_PER_PCT) | E:1K,D:4K,C:16K… | ✅ E:1K,D:6K,C:60K,B:900K,A:25M,S:1B | ✅ |
| 일반재료 가격 범위 (NORMAL_MATERIAL_WON_RANGE) | 고정값 | ✅ 범위 기반 랜덤 | ✅ |
| 등급별 레벨 상한 (MAX_LEVEL_BY_RANK) | 없음 (EXP_MAX_LEVEL=100) | ✅ E:15, D:25, C:40, B:60, A:80, S:120 | ✅ |
| 스탯 상한 (STAT_CAP_BY_RANK) | 없음 | ✅ E:25, D:40, C:60, B:80, A:100, S:150 | ✅ |
| 보조무기 최대인퓨즈 | 1 | ✅ 2 | ✅ |
| 공용인벤 가방 비율 (SHARED_INV_BAG_RATIO) | 없음 | ✅ 0.20 | ✅ |
| 방어 라벨 물리피해감소/마법피해감소 | 물리 방어 증가 | ✅ 물리피해감소 증가 | ✅ |
| 상태이상 턴 수 (독3턴, 출혈3턴, 화상5턴…) | 독2턴, 화상2턴… | ✅ TXT 기준표와 일치 | ✅ |
| 충격파(shockwave) 계수/비용 직접 설정 | baseSingleCoef 방식 | ✅ coef:0.4375, MP:40, SP:40 | ✅ |
| 트리플샷 계수 | D:2.0, C:2.8… | ✅ D:2.4, C:3.6, B:6.0, A:9.6, S:14.4 | ✅ |
| 민첩한 조준(preciseAim) SENSE 포함 | AGI만 | ✅ AGI+SENSE, target:allAllies | ✅ |
| 빛의 축복 MP 비용 | MP 35 | ✅ MP 25 | ✅ |
| 파워샷 비용 | MP 10+SP 20 | ✅ MP 20+SP 20 | ✅ |
| 퀵스로 SP 비용 | SP 25 | ✅ SP 40 | ✅ |
| 무기회수 30% 확률 공격 | procChance 없음 | ✅ procChance:0.3 | ✅ |
| 한국어 스킬명 | 영어 혼재 | ✅ 대부분 한국어화 | ✅ |

---

## 2. TXT 기반 구현 상태 (BUILTIN_SKILLS 22종 기준)

### ✅ 구현 완료 — TXT 스펙 일치 (21/22)

| 스킬명 | ID | 등급 | 카테고리 | TXT 일치 |
|--------|-----|:---:|----------|:---:|
| 에너지볼트 | energyBolt | E | singleAttack | ✅ |
| 에너지샤워 | energyShower | E | aoeAttack | ✅ |
| 실드강타 | shieldBash | E | singleCC | ✅ |
| 충격파 | shockwave | E | aoeCC | ✅ |
| 헤이스트 | haste | D | buff | ✅ |
| 힐 | heal | D | singleHeal | ✅ |
| 기도 | pray | D | singleHeal | ✅ |
| 빛의 축복 | blessingOfLight | D | buff | ✅ |
| 파워샷 | powerShot | E | singleAttack | ✅ |
| 퀵샷 | quickShot | E | singleAttack | ✅ |
| 트리플샷 | tripleShot | E→S | singleAttack (Rare) | ✅ |
| 퀵스로 | quickThrow | E | singleAttack | ✅ |
| 무기회수 | knifeRecall | E | utility | ✅ |
| 민첩한 조준 | preciseAim | E→S | buff (Rare) | ✅ |
| 작은 정원 | smallGarden | E→S | aoeHeal (Rare) | ✅ |
| 강철 모루 | steelAnvil | E→S | passive (Rare) | ✅ |
| 방패숙련 | shieldProficiency | E | passive | ✅ |
| 단검숙련 | daggerHandling | E | passive | ✅ |
| 정권 | fistStrike | E | singleAttack | ✅ |
| 이면의 완력 | hiddenMight | E→S | passive (Rare) | ✅ |
| 도발 | taunt | E | buff | ✅ |

### ⚠️ 부분 구현 (1/22)

| 스킬명 | ID | 문제 |
|--------|-----|------|
| 전탄회수 | fullArrowRecovery | TXT는 **성장형(E→S) + aoeAttack** 복합 스킬이지만, v5_4에서는 단순 utility (SP+25)만 구현. byRank 데이터 및 aoeAttack 계수 미반영 |

**TXT 스펙 (CCC.txt §5 송하늘):**
| 등급 | 계수 | MP 비용 |
|:---:|:---:|:---:|
| E | 0.875 | 40 |
| D | 1.4 | 50 |
| C | 2.1 | 60 |
| B | 3.5 | 70 |
| A | 5.6 | 80 |
| S | 8.4 | 100 |

---

## 3. CCC.txt NPC 스킬 중 미구현 목록

### 파티 NPC (§2~§16)

| NPC | 랭크 | 미구현 스킬 | 총 미구현 |
|-----|:---:|------------|:---:|
| 최유나 | E | — | 0 |
| 오하나 | E | — | 0 |
| 안도현 (비전투) | E | exceptionalDexterity, fieldMaintenance, quickRepair, fieldAidSupport | 4 |
| 송하늘 | E | — (fullArrowRecovery 부분 구현) | 0 |
| 김민수 | E | spotlight (이목집중) | 1 |
| 이하은 | D | — | 0 |
| 이사벨 헤이즈 | D | holdTheLine, holyProvocation, divineProtection, holyLight, fragmentOfAthena | 5 |
| 최민준 | C | fightingSpiritBoost, formationCommand, moraleManagement, shieldSmash, battleCry, charge | 6 |
| 서지한 | C | vampiricInstinct, bloodSense | 2 |
| 박소원 | C | potionCraft, potionToss, materialAnalysis | 3 |
| 강유라 | C | bodyReinforce, crushingKick, spinSweep, vitalStrike | 4 |
| 한서연 | B | flameLance, meteorBarrage, flameWall, manaFocus | 4 |
| 하루 이토 | B | summonZephyr, summonBark, galeStrike, rootBind, earthHeal, terrainShift | 6 |
| 유진성 (비전투) | D | equipmentCraft, appraisal, battlefieldRepair, firepowerTuning | 4 |
| 한아람 | E | cargoSupport, emergencyDodge | 2 |

### 부록 A — 고랭크 NPC

| NPC | 랭크 | 미구현 스킬 수 |
|-----|:---:|:---:|
| 강민혁 | A | 4 (auraMastery, shadowDraw, auraSlash, auraArc) |
| 강우석 | A | 7 (impactReduction, defensiveStance, charge, shieldMastery, conBoost, staminaRecovery, senBoost) |
| 사사키 유아 | A | 4 (spiritArmor, weaponManifestation, crescentSlash, spiritSever) |
| 임설희 | A | 4 (iceMaker, icicleLance, frostFlower, stairAndSlide) |
| 백휘성 | S | 3 (auraOfJudge, heliosNova, shacklesOfRadiance) |
| 한지원 | S | 3 (trueGaze, barrierManipulation, healingMagic) |
| 박준호 | S | 2 (byeokryeokjang, uraegyeok) |
| 하월영 | S | 4 (shunpo, wolseomTriple, parry, insight) |
| 앨리스 크로프트 | A | 4 (slowTime, hasteTime, temporalSense, itemExtension) |
| 이지혜 | A | 3 (reverseSummon, nightsVeil, sharedLethargy) |
| 임진태 | S | 3 (partialTransform, fullTransform, gluttonousInstinct) |
| 제이크 밀러 | S | 4 (devastatingBlow, quakeStrike, martialAwakening, instinctRead) |

### 부록 B — 적대 NPC

| NPC | 랭크 | 미구현 스킬 수 |
|-----|:---:|:---:|
| 강태식 | C | 4 (stealth, ambush, poisonBlade, escape) |
| 권도윤 | B | 3 (suggestion, phantomStep, knifeStrike) |
| 유진혁 | A~S | 4 (darknessManipulation, shadowMeld, abyssalBlade, erebosCloak) |
| 장은서 | A+ | 3 (curseImmunity, bloodletterDagger, shroudOfNonexistence) |
| 신우현 | A+ | 3 (corruptedResonance, monsterKinship, corruptSpread) |
| 나선영 | A+ | 4 (whisperOfFear, corrosiveMist, manaSight, fearInfusion) |
| 채하윤 | C+ | 4 (manaBullet, piercingRound, explosiveRound, homingRound) |

**총 미구현**: 파티 NPC ~41개, 부록 A ~45개, 부록 B ~25개 = **약 111개 스킬**

> 💡 현재 v5_4는 기본 파티(브란/도윤/린/카인/이벨/세라) 중심으로 22개 스킬이 구현됨. CCC.txt의 확장 NPC 스킬은 대부분 미구현.

---

## 4. 밸런스 분석 — 등급별 스킬 밸런스

### 4.1 계수/비용 기준 대비 검증

**기준표 (skill_system.txt / CCC.txt 공통 규칙):**

| 등급 | 단일 계수 | 비용 범위 | 광역 계수 (×0.58) | aoeCC (단일CC×0.5, 비용×2) |
|:---:|:---:|:---:|:---:|:---:|
| E | 1.2~1.5 | 20~40 | 0.70~0.87 | 0.44~0.50 |
| D | 1.92~2.4 | 25~45 | 1.11~1.39 | — |
| C | 2.88~3.6 | 30~50 | 1.67~2.09 | 1.0~1.4 |
| B | 4.8~6.0 | 40~60 | 2.78~3.48 | 1.4~1.7 |
| A | 7.68~9.6 | 55~80 | 4.45~5.57 | 2.2~2.8 |
| S | 11.52~14.4 | 70~100 | 6.68~8.35 | 3.3~4.2 |

#### v5_4 구현 스킬 검증

| 스킬 | 등급 | 카테고리 | 계수 | 비용(합산) | 기준 부합 |
|------|:---:|----------|:---:|:---:|:---:|
| energyBolt | E | single | 1.5 | 30 | ✅ 상한 (1.2~1.5) |
| energyShower | E | aoe | 0.875 | 40 | ✅ 0.875≈1.5×0.58 |
| shieldBash | E | singleCC | 0.875 | 40 | ✅ CC=aoe계수 |
| shockwave | E | aoeCC | 0.4375 | 80 | ✅ 0.875/2=0.4375, 비용 40×2 |
| powerShot | E | single | 1.5 | 40 | ✅ 상한 |
| quickShot | E | single | 1.2 | 15 | ✅ 하한 (저비용) |
| quickThrow | E | single | 1.5 | 40 | ✅ 상한 |
| fistStrike | E | single | 1.5 | 40 | ✅ 상한 |
| heal | D | singleHeal | 2.0 | 40 | ✅ D범위 |
| pray | D | singleHeal | 2.2 | 45 | ✅ D범위 |
| tripleShot(D) | D | single | 2.4 | 30 | ✅ D상한 |
| tripleShot(S) | S | single | 14.4 | 80 | ✅ S상한 |
| smallGarden(D) | D | aoeHeal | 1.4 | 35 | ✅ |
| smallGarden(S) | S | aoeHeal | 8.4 | 90 | ✅ |

**결론: 모든 구현 스킬의 계수/비용이 기준표 범위 내에 있음** ✅

---

### 4.2 CCC.txt NPC 스킬 등급별 밸런스 검증

#### 공격 스킬 (singleAttack)

| 스킬 | NPC | 등급 | 계수 | 비용(합산) | 기준 범위 | 판정 |
|------|-----|:---:|:---:|:---:|:---:|:---:|
| 방패강타 shieldSmash | 최민준 | C | 2.88 | 50 | 2.88~3.6 / 30~50 | ✅ 하한 |
| 돌진 charge | 최민준 | C | 3.2 | 50 | 2.88~3.6 / 30~50 | ✅ 중간 |
| 파쇄격 crushingKick | 강유라 | C | 3.4 | 50 | 2.88~3.6 / 30~50 | ✅ 상단 |
| 성스러운 빛 holyLight | 이사벨 | D | 1.92 | 30 | 1.92~2.4 / 25~45 | ✅ 하한 |
| 화염창 flameLance | 한서연 | B | 5.6 | 50 | 4.8~6.0 / 40~60 | ✅ 중상 |
| 질풍격 galeStrike | 하루이토 | B | 5.2 | 60 | 4.8~6.0 / 40~60 | ✅ 중간 |
| 그림자 발도 shadowDraw | 강민혁 | A | 8.5 | 80 | 7.68~9.6 / 55~80 | ✅ 중간 |
| 오라 참격 auraSlash | 강민혁 | A | 7.8 | 60 | 7.68~9.6 / 55~80 | ✅ 하한 |
| 삼일월 crescentSlash | 사사키 | A | 8.2 | 65 | 7.68~9.6 / 55~80 | ✅ 중간 |
| 얼음창 icicleLance | 임설희 | A | 8.8 | 45 | 7.68~9.6 / 55~80 | ⚠️ 비용 낮음 (45<55) |
| 돌진 charge (강우석) | 강우석 | A | 7.2 | 70 | 7.68~9.6 / 55~80 | ⚠️ 계수 약간 미달 (7.2<7.68) |
| 월섬 삼월 wolseomTriple | 하월영 | S | 13.5 | 110 | 11.52~14.4 / 70~100 | ⚠️ 비용 초과 (110>100) |
| 분쇄격 devastatingBlow | 제이크 | S | 13.0 | 80 | 11.52~14.4 / 70~100 | ✅ 중상 |
| 심연검 abyssalBlade | 유진혁 | A | 9.0 | 90 | 7.68~9.6 / 55~80 | ⚠️ 비용 초과 (90>80) |

#### 광역 공격 (aoeAttack)

| 스킬 | NPC | 등급 | 계수 | 기대값(단일×0.58) | 판정 |
|------|-----|:---:|:---:|:---:|:---:|
| 회전축격 spinSweep | 강유라 | C | 2.0 | 3.4×0.58=1.97 | ✅ 정확 |
| 유성포격 meteorBarrage | 한서연 | B | 3.2 | 5.6×0.58=3.25 | ✅ 정확 |
| 오라 호 auraArc | 강민혁 | A | 4.5 | 7.8×0.58=4.52 | ✅ 정확 |
| 지진타 quakeStrike | 제이크 | S | 7.5 | 13.0×0.58=7.54 | ✅ 정확 |
| 헬리오스 노바 heliosNova | 백휘성 | S | 12.0 | — (독립 설계) | ⚠️ 아래 분석 |

**heliosNova** (S등급 광역): 계수 12.0, 비용 MP90+SP50=140
- S등급 광역 기대값: 14.4×0.58=8.35
- 12.0은 기대값보다 **43% 높음** → 비용 140도 기준(100)보다 40% 높음
- **판정**: 비용 대비 계수가 비례하므로 ✅ **의도된 고비용-고위력 설계**

#### 광역CC (aoeCC)

| 스킬 | NPC | 등급 | 계수 | 기대값(광역×0.5) | CC | 판정 |
|------|-----|:---:|:---:|:---:|------|:---:|
| 화염벽 flameWall | 한서연 | B | 1.6 | 3.2×0.5=1.6 | burn 32% | ✅ 정확 |
| 뿌리속박 rootBind | 하루이토 | B | 1.5 | — | bind 22% | ✅ 적절 |
| 서리꽃 frostFlower | 임설희 | A | 2.5 | 4.5×0.5=2.25 | bind 20% | ⚠️ 계수 약간 높음 |
| 우레격 uraegyeok | 박준호 | S | 9.0 | ~4.2 예상 | stun 20% | ⚠️ 아래 분석 |

**uraegyeok** (S등급 광역CC): 계수 9.0, 비용 180, 쿨타임 8턴
- S등급 aoeCC 기대값: ~3.3~4.2
- 9.0은 기대값의 **2배 이상** → 하지만 비용 180 (기준 100의 1.8배) + 8턴 쿨타임
- **판정**: ⚠️ **계수가 높지만 초고비용+장쿨로 보완**. 밸런스 우려점 존재하나 S랭크 탱커 시그니처 스킬로 용인 가능

---

### 4.3 물리방어(PDEF) / 마법방어(MDEF) 밸런스

**Steel Anvil (강철 모루) — 유일한 방어 스탯 성장형 패시브:**

| 등급 | PDEF 보너스 | MDEF 보너스 | 합산 |
|:---:|:---:|:---:|:---:|
| E | +1 | +1 | +2 |
| D | +3 | +3 | +6 |
| C | +5 | +5 | +10 |
| B | +7 | +7 | +14 |
| A | +9 | +9 | +18 |
| S | +11 | +11 | +22 |

**방어 공식 적용 시 실효치 분석:**

`피해감소율 = DEF / (DEF + 1.5 × rawDamage)`

| 등급 | 기본 PDEF (CON×0.4) | +steelAnvil | 적 Normal DMG | 감소율(기본) | 감소율(+Anvil) | 차이 |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| E (CON 25) | 10 | 11 | 9 | 42.6% | 44.9% | +2.3% |
| D (CON 40) | 16 | 19 | 20 | 34.8% | 38.8% | +4.0% |
| C (CON 60) | 24 | 29 | 25 | 39.0% | 43.6% | +4.6% |
| B (CON 80) | 32 | 39 | 35 | 37.9% | 42.6% | +4.7% |
| A (CON 100) | 40 | 49 | 40 | 40.0% | 44.9% | +4.9% |
| S (CON 150) | 60 | 71 | 60 | 40.0% | 44.1% | +4.1% |

> 등급별 Boss에 대해서는 효과가 감소 (rawDamage↑ → DEF 비중↓):

| 등급 | 기본 PDEF | +steelAnvil | 적 Boss DMG | 감소율(기본) | 감소율(+Anvil) | 차이 |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| E | 10 | 11 | 39 | 14.6% | 15.8% | +1.2% |
| D | 16 | 19 | 60 | 15.1% | 17.4% | +2.3% |
| B | 32 | 39 | 100 | 17.6% | 20.6% | +3.0% |
| S | 60 | 71 | 150 | 21.1% | 24.0% | +2.9% |

**판정**: ✅ **등급에 맞는 점진적 효과**
- Normal 몬스터 상대: +2~5% 피해감소 → 탱커 유지력 소폭 향상
- Boss 상대: +1~3% 피해감소 → 보스전에서는 효과 제한적 (패시브로서 적절)
- PDEF와 MDEF 동시 증가라 **물리/마법 양쪽 방어력**에 균형잡힌 기여
- **rawDamage 연동 공식** 덕분에 과도한 탱킹이 자동 억제됨

---

### 4.4 물리피해감소 / 마법피해감소 (장비 특성) 밸런스

**장비 특성 percentSmall 카테고리:**

| 등급 | 효과(%) |
|:---:|:---:|
| E | 1% |
| D | 2% |
| C | 3% |
| B | 5% |
| A | 7% |
| S | 10% |

- 물리피해감소/마법피해감소는 장비 특성(infuse)으로 부여
- 무기 최대 2슬롯 + 방어구 2슬롯 + 보조무기 2슬롯 + 악세 1슬롯 = 최대 7슬롯
- S등급 풀 특성: 최대 7×10% = 70% → **이론상 가능하지만 같은 특성 중복 불가**이므로 physical_defense 1회 + 다른 슬롯에 magic_defense 1회 = 최대 10%+10% = 20%

**판정**: ✅ **적절한 제한**
- 같은 특성 중복 불가 규칙이 과도한 피해감소 스택을 방지
- S등급 10%도 충분히 의미있는 수치이면서 게임 파괴적이지 않음

---

### 4.5 물리피해증가 / 마법피해증가 (장비 특성) 밸런스

**동일 percentSmall 카테고리:** E:1% ~ S:10%

| 특성 | 적용 대상 |
|------|----------|
| physical_damage | 모든 물리 피해 증가 |
| magic_damage | 모든 마법 피해 증가 |

- 물리/마법 피해 증가도 같은 percentSmall 카테고리 → 방어와 대칭적
- S등급에서 물리피해 +10%는 rawDamage에 곱연산으로 적용될 경우 상당한 효과
- 하지만 장비 1슬롯당 효과이므로 **비용(인퓨즈 재료) 대비 합리적**

**판정**: ✅ **공격/방어 특성 간 대칭적 밸런스 유지**

---

### 4.6 주스탯 증가 밸런스

**버프 스킬 기준 (CCC.txt 공통):**

| 등급 | 버프 보너스 |
|:---:|:---:|
| E | +2 |
| D | +4 |
| C | +6 |
| B | +8 |
| A | +10 |
| S | +12~15 |

**구현된 스킬 검증:**

| 스킬 | 타입 | 등급 | 보너스 | 기준 | 판정 |
|------|------|:---:|:---:|:---:|:---:|
| haste | buff(3T) | D | AGI+4 | D:+4 | ✅ |
| blessingOfLight | buff(3T) | D | INT+4 | D:+4 | ✅ |
| preciseAim(E) | buff(3T) | E | AGI+2, SENSE+2 | E:+2 | ✅ 2스탯 각+2 |
| preciseAim(D) | buff(3T) | D | AGI+4, SENSE+4 | D:+4 | ✅ |
| preciseAim(S) | buff(3T) | S | AGI+12, SENSE+12 | S:+12~15 | ✅ |
| taunt | buff(3T) | E | 위협+5 | — | ✅ |

**CCC.txt 미구현 버프 검증:**

| 스킬 | 등급 | 보너스 | 기준 | 판정 |
|------|:---:|:---:|:---:|:---:|
| bodyReinforce(C) | C | STR+3, AGI+3 (=6) | C:+6 | ✅ 2스탯 합산 |
| bodyReinforce(S) | S | STR+7, AGI+7 (=14) | S:+12~15 | ✅ |
| fightingSpiritBoost(C) | C | STR+3, AGI+3 (=6, aoe) | C:+6 | ✅ |
| fightingSpiritBoost(S) | S | STR+8, AGI+7 (=15, aoe) | S:+12~15 | ✅ |
| manaFocus(B) | B | INT+8 (self) | B:+8 | ✅ |
| defensiveStance(A) | A | CON+8 (self, 이동불가) | A:+10 | ⚠️ +8<+10, 이동제한 대가 |
| spiritArmor(A) | A | PDEF+12, MDEF+8 (5T) | — | ✅ 방어스탯별도 |
| martialAwakening(S) | S | STR+15, AGI+10 (3T) | S:+12~15 | ✅ 주스탯+15 |
| partialTransform(S) | S | STR+12, AGI+10, CON+8 (5T) | S:+12~15 | ✅ 복합 |
| fullTransform(S) | S | 전스탯 대폭 (3T) | — | ✅ 시그니처 |

**판정**: ✅ **버프 보너스가 등급 기준표에 정확히 부합**
- 2스탯 동시 버프: 각 스탯이 등급 기준의 절반씩 → 합산하면 기준 일치
- 이동제한 등 디메리트가 있으면 약간 낮은 보너스 → 적절한 트레이드오프
- S등급 시그니처 스킬(변신 등)은 기준을 초과하되 높은 비용/쿨타임으로 보완

---

### 4.7 패시브 스킬 밸런스

| 스킬 | 등급 | 효과 | 판정 |
|------|:---:|------|:---:|
| steelAnvil (E→S) | E→S | PDEF/MDEF +1→+11 | ✅ 점진적 |
| hiddenMight (E→S) | E→S | STR +1→+6 | ✅ 보수적 |
| shieldProficiency (E) | E | SP -10% (방패) | ✅ 니치 |
| daggerHandling (E) | E | SP -10% (단검) | ✅ 니치 |
| impactReduction (A) | A | 물리피해 -15% | ✅ A랭크 Rare |
| conBoost (A) | A | CON +6 | ✅ |
| senBoost (A) | A | SEN +4 | ✅ |
| shieldMastery (A) | A | SP -15% (방패) | ✅ E의 강화판 |
| staminaRecovery (A) | A | 턴당 SP +5% | ✅ |
| insight (S) | S | 회피 +10% | ✅ |
| instinctRead (S) | S | 회피 +12% | ✅ |

**hiddenMight vs steelAnvil 비교:**
- steelAnvil: PDEF+MDEF 동시 → 합산값 높지만 방어 특화
- hiddenMight: STR 단일 → 값 낮지만 HP(+3/pt), ATK(+0.2/pt), 데미지에 기여
- **의도적 비대칭**: 방어 스탯은 수치 자체보다 공식 내 비중이 낮아 더 높은 값 필요

**판정**: ✅ **패시브 스킬 간 밸런스 적절**

---

## 5. 밸런스 우려 사항 (총 4건)

### ⚠️ 1. icicleLance (얼음창) — A등급 비용 미달
- **계수 8.8** (A 범위 내) / **비용 MP 45** (기준 55~80)
- 비용이 기준 하한보다 **10 낮음**
- 🔧 권장: `MP 55` 이상으로 상향 or 빙결 조건부 보너스로 정당화

### ⚠️ 2. charge (강우석 돌진) — A등급 계수 미달
- **계수 7.2** (기준 7.68~9.6) / **비용 MP 30+SP 40=70**
- 계수가 기준 하한보다 **0.48 낮음**
- 후열 적 ×1.2 조건부 보너스로 최대 8.64까지 상승 가능
- 🔧 권장: **조건부 보너스를 고려하면 현재 수치로 적절** (조건부 미달)

### ⚠️ 3. uraegyeok (우레격) — S등급 aoeCC 계수 초과
- **계수 9.0** (S aoeCC 기대값 ~3.3~4.2의 2배+)
- 비용 180 + 쿨타임 8턴으로 보완
- 🔧 권장: S랭크 탱커 시그니처로 **현재 수치 유지 가능**, 다만 쿨타임 엄격 적용 필수

### ⚠️ 4. fullArrowRecovery (전탄회수) — 구현 미완성
- TXT는 성장형(E→S) + aoeAttack 복합 스킬
- v5_4는 단순 utility (SP +25)만 구현
- 🔧 **코드 수정 필요** → 아래 §6 참조

---

## 6. 수정 필요 사항

### fullArrowRecovery → 성장형 스킬로 업그레이드

**현재 (v5_4):**
```js
fullArrowRecovery: { id:'fullArrowRecovery', name:'Full Arrow Recovery', grade:'E', rarity:'rare',
  category:'utility', target:'self', costs:{ mp:30, sp:0 }, statTypes:['agi'],
  resourceRestore:{ sp:25 }, desc:'SP 25 회복.' }
```

**수정 (TXT 스펙 반영):**
```js
fullArrowRecovery: {
  id:'fullArrowRecovery', name:'전탄회수', grade:'E', rarity:'rare',
  category:'aoeAttack', target:'allEnemies', statTypes:['agi'],
  damageType:'physical', element:'none', resourceRestore:{ sp:25 },
  byRank:{
    E:{ coef:0.875, costs:{ mp:40, sp:0 } },
    D:{ coef:1.4, costs:{ mp:50, sp:0 } },
    C:{ coef:2.1, costs:{ mp:60, sp:0 } },
    B:{ coef:3.5, costs:{ mp:70, sp:0 } },
    A:{ coef:5.6, costs:{ mp:80, sp:0 } },
    S:{ coef:8.4, costs:{ mp:100, sp:0 } }
  },
  desc:'성장형 전탄회수. 화살 회수 + 전체 적 광역 피해. SP 25 회복.'
}
```

---

## 7. 종합 평가

| 항목 | 평가 |
|------|:---:|
| **계수/비용 기준 일치도** | ✅ 95%+ (거의 모든 스킬이 등급별 기준 범위 내) |
| **물리방어/마법방어 밸런스** | ✅ rawDamage 연동 공식으로 자연 균형 |
| **물리/마법 피해감소 (장비)** | ✅ 등급별 1~10%, 중복 불가 규칙으로 제한 |
| **물리/마법 피해증가 (장비)** | ✅ 피해감소와 대칭적 구조 |
| **주스탯 버프** | ✅ E+2 / D+4 / C+6 / B+8 / A+10 / S+12~15 기준 정확 준수 |
| **패시브 스킬** | ✅ 상시 적용 특성상 보수적 수치, 적절한 비대칭 |
| **성장형 스킬** | ✅ 등급 간 계수 성장률 일관적 (×1.6 수준) |
| **v4_8→v5_4 개선** | ✅ 대부분의 TXT 불일치 해소됨 |

> **총평**: CCC.txt 및 skill_system.txt의 밸런스 설계는 전반적으로 **매우 잘 정리**되어 있습니다.
> 계수는 등급 기준표에 정확히 맞추어져 있고, 방어 시스템은 rawDamage 연동으로 자연스러운 균형을 유지합니다.
> 주요 수정 필요 사항은 **fullArrowRecovery의 성장형 변환** 1건이며, 나머지 111개 미구현 스킬은 향후 NPC 확장 시 순차 추가하면 됩니다.
