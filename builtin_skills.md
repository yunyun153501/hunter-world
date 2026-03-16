# Hunter World — 전체 스킬 목록 (BUILTIN_SKILLS)

> GateBattle_v5_9.js 기준 — 총 95개 스킬

---

## 📊 분석 요약

### 전체 현황
- **총 스킬 수**: 95개 (범용 13개 + 캐릭터 전용 82개)
- **로어북 명시 스킬**: ~55개 (로어북에 직접 이름이 언급된 스킬)
- **코드 확장(필러) 스킬**: ~40개 (로어북의 포괄적 설명을 구체화하거나 범용 스킬로 추가한 것)
- **성장형(★) 스킬**: 12개 (등급별 계수·비용 테이블 보유)

### 필러 스킬 기준
코드에서 추가되었으나 로어북에 명시적으로 이름이 없는 스킬을 "필러"로 분류:
- 범용 기본 스킬 (energyBolt, shieldBash 등)
- 로어북의 포괄적 설명을 개별 스킬로 구체화한 것 (예: "B랭크 화염 마법" → flameLance, meteorBarrage 등)
- 역할 보완을 위해 추가된 스킬 (예: 안도현의 fieldMaintenance 등)

### 필러 스킬 요약표
| 캐릭터 | 로어북 스킬 수 | 코드 스킬 수 | 필러 스킬 |
|--------|--------------|-------------|----------|
| 안도현 | 1 | 4 | fieldMaintenance, quickRepair, fieldAidSupport |
| 김민수 | 1 | 3 (범용 포함) | shieldBash, taunt (범용) |
| 이사벨 헤이즈 | 2 | 5 | holdTheLine, holyProvocation, divineProtection, holyLight |
| 최민준 | 1 | 6 | formationCommand, moraleManagement, shieldSmash, battleCry, charge |
| 서지한 | 2 | 6 | heal, haste, blessingOfLight, energyBolt (범용) |
| 박소원 | 3 | 4 | energyShower (범용) |
| 강유라 | 2 | 4 | spinSweep, vitalStrike |
| 한서연 | 1 | 5 | 전부 코드 확장 (flameLance, meteorBarrage, flameWall, manaFocus, energyBolt) |
| 유진성 | 2 | 4 | battlefieldRepair, firepowerTuning |
| 한아람 | 2 | 3 (+범용1) | cargoSupport, emergencyDodge |
| 강민혁 | 2 | 4 | auraSlash, auraArc |
| 사사키 유아 | 2 | 4 | crescentSlash, spiritSever |
| 제이크 밀러 | 1 | 4 | 전부 코드 확장 |
| 강태식 | 5 | 4 | escape (Evasion 대체?), poisonBlade |
| 권도윤 | 3 | 3 | knifeStrike (Coin Transaction 대신) |
| 유진혁 | 2 | 4 | abyssalBlade, erebosCloak |
| 신우현 | 2 | 3 | corruptSpread |
| 나선영 | 3 | 4 | whisperOfFear, corrosiveMist, fearInfusion (로어북의 포괄적 설명 구체화) |
| 채하윤 | 1 | 4 | piercingRound, explosiveRound, homingRound |

---

## §1 범용 / 공유 스킬 (13개)

> 여러 캐릭터가 공유하는 기본 스킬. 일부는 특정 캐릭터 로어북 출처이나 범용으로 등록됨.

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 에너지볼트 | energyBolt | E | singleAttack | singleEnemy | MP30 | 1.5 | INT | magic | — | 기본 단일 마법 공격. | 🔧 범용 필러 |
| 에너지샤워 | energyShower | E | aoeAttack | allEnemies | MP40 | 0.875 | INT | magic | — | 기본 광역 마법 공격. | 🔧 범용 필러 |
| 실드강타 | shieldBash | E | singleCC | singleEnemy | MP20/SP20 | 0.875 | CON | physical | stun 1턴 | 단일 CC. 1턴 기절. | 🔧 범용 필러 |
| 충격파 | shockwave | E | aoeCC | allEnemies | MP40/SP40 | 0.4375 | CON | physical | stun 1턴 | 광역 CC. | 🔧 범용 필러 |
| 헤이스트 | haste | D | buff | allAllies | MP25 | — | INT, SEN | buff: agi+4 | — | 3턴 파티원 AGI+4. | 🔧 범용 필러 |
| 힐 | heal | D | singleHeal | singleAlly | MP40 | 2.0 | INT | — | — | 기본 단일 회복. | 🔧 범용 필러 |
| 기도 | pray | D | singleHeal | singleAlly | MP45 | 2.2 | INT | — | — | 힐보다 조금 강한 단일 회복. | ✅ 이하은 로어북 |
| 빛의 축복 | blessingOfLight | D | buff | allAllies | MP25 | — | INT, SEN | buff: int+4 | — | 3턴 전 아군 INT+4. | ✅ 이하은 로어북 |
| 파워샷 | powerShot | E | singleAttack | singleEnemy | MP20/SP20 | 1.5 | AGI | physical | — | 집중 화살. | ✅ 송하늘 로어북 |
| 퀵샷 | quickShot | E | singleAttack | singleEnemy | SP15 | 1.2 | AGI | physical | — | 저비용 단일 공격. | ✅ 송하늘 로어북 |
| 정권 | fistStrike | E | singleAttack | singleEnemy | MP20/SP20 | 1.5 | STR, CON | physical | — | 근접 단일 공격. | ✅ 한아람 로어북 (범용 오분류) |
| 도발 | taunt | E | buff | self | SP20 | — | CON | buff: threat+5 | — | 3턴 위협 증가. | 🔧 범용 필러 |
| 작은 정원 | smallGarden | E★ | aoeHeal | allAllies | MP30(E) | 0.875(E) | INT | — | — | 성장형 광역 회복. | ✅ 이하은 로어북 |

> **참고**: pray, blessingOfLight (이하은), powerShot, quickShot (송하늘), fistStrike (한아람), smallGarden (이하은)은 특정 캐릭터 로어북 출처이나 코드에서 범용으로 등록됨.

---

## §2 최유나 (3개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 강철 모루 | steelAnvil | E★ | passive | — | — | — | CON | — | — | 물리방어/마법방어 증가. E(pdef+1/mdef+1)→S(+11/+11) | ✅ 로어북 |
| 방패숙련 | shieldProficiency | E | passive | — | — | — | CON | — | — | 방패 SP 10% 감소. | ✅ 로어북 |
| 단검숙련 | daggerHandling | E | passive | — | — | — | AGI, SEN | — | — | 단검/투척 SP 10% 감소. | ✅ 로어북 |

---

## §3 오하나 (3개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 퀵스로 | quickThrow | E | singleAttack | singleEnemy | SP40 | 1.5 | AGI, SEN | physical | — | 투척 단일 공격. | ✅ 로어북 |
| 무기회수 | knifeRecall | E | utility | singleEnemy | MP20 | 1.5 | AGI, SEN | physical | — | 무기회수 + 30% 확률 공격. SP+10 회수. | ✅ 로어북 |
| 민첩한 조준 | preciseAim | E★ | buff | allAllies | MP25(E) | — | AGI, SEN | buff: agi+2/sen+2(E)→+12/+12(S) | — | 성장형 광역 버프. | ✅ 로어북 |

---

## §4 안도현 (4개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 탁월한 손재주 | exceptionalDexterity | E★ | passive | — | — | — | SEN | — | — | 성장형 SEN 증가. E(sense+1)→S(+6) | ✅ 로어북 |
| 현장정비 | fieldMaintenance | E | passive | — | — | — | SEN | — | — | 장비 내구도 소모 50% 감소. | ⚠️ 코드 확장 |
| 빠른수리 | quickRepair | E | utility | singleAlly | MP0/SP0 | — | SEN | — | — | 장비 내구도 +10. 장비당 1회. | ⚠️ 코드 확장 |
| 응급처치지원 | fieldAidSupport | E | passive | — | — | — | SEN | — | — | 야영 HP/MP/SP 회복 +10%. | ⚠️ 코드 확장 |

---

## §5 송하늘 (2개 고유)

> powerShot, quickShot은 §1 범용에 등록.

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 전탄회수 | fullArrowRecovery | E★ | aoeAttack | allEnemies | MP40(E) | 0.875(E)→8.4(S) | AGI | physical | — | 성장형 전탄회수. SP+25 회수. | ✅ 로어북 |
| 트리플샷 | tripleShot | E★ | singleAttack | singleEnemy | MP15/SP15(E) | 1.5(E)→14.4(S) | AGI | physical | — | 성장형 3연타. | ✅ 로어북 |

---

## §6 김민수 (1개 고유)

> shieldBash, taunt은 §1 범용에 등록.

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 이목집중 | spotlight | E★ | buff | self | MP30(E) | — | CON | buff: threat+10(E)→+60(S) | — | 성장형 광역 도발. | ✅ 로어북 |

---

## §7 이하은 (0개 고유)

> pray, blessingOfLight, smallGarden 모두 §1 범용에 등록.

(고유 스킬 없음 — 범용 섹션 참조)

---

## §8 이사벨 헤이즈 (5개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 방어선 유지 | holdTheLine | D | buff | self | SP40 | — | CON | buff: ccImmunity | — | 3턴 CC 완전 면역. | ⚠️ 코드 확장 (신앙 기반 구체화) |
| 신성한 도발 | holyProvocation | D | buff | singleEnemy | MP15/SP15 | — | CON | buff: forcedTaunt | — | 2턴 강제 도발. 쿨다운 3턴. | ⚠️ 코드 확장 |
| 신의 보호 | divineProtection | D | singleHeal | singleAlly | MP30 | 2.0 | INT | — | — | 치유 + 만HP 시 보호막(최대HP 20%). | ⚠️ 코드 확장 |
| 성스러운 빛 | holyLight | D | singleAttack | singleEnemy | MP30 | 1.92 | INT | magic, light | — | 빛 단일 공격. 언데드/암흑 ×1.3. | ⚠️ 코드 확장 |
| 아테나의 파편 | fragmentOfAthena | D(unique★) | passive | — | — | — | CON | — | — | 잠재/미발현. Fragment→Successor→Avatar. | ✅ 로어북 |

---

## §9 최민준 (6개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 투심 향상 | fightingSpiritBoost | C★ | buff | allAllies | MP30(C) | — | CON | buff: str+3/agi+3(C)→str+8/agi+7(S) | — | 성장형 광역 버프. | ✅ 로어북 |
| 진형 지휘 | formationCommand | C | passive | — | — | — | CON | — | — | 전투 시작 2턴 피해감소 +8%. | ⚠️ 코드 확장 |
| 사기관리 | moraleManagement | C | passive | — | — | — | CON | — | — | 전투 시작 2턴 SP/MP -12%. | ⚠️ 코드 확장 |
| 방패강타 | shieldSmash | C | singleCC | singleEnemy | MP25/SP25 | 2.88 | CON, STR | physical | stun 1턴(20%) | C급 단일 CC. | ⚠️ 코드 확장 |
| 도발함성 | battleCry | C | buff | self | SP30 | — | CON | buff: threat+8 | — | 광역 도발. | ⚠️ 코드 확장 |
| 돌진 | charge | C | singleAttack | singleEnemy | MP20/SP30 | 3.2 | STR | physical | — | 단일 공격. 후열 적 ×1.2. | ⚠️ 코드 확장 |

---

## §10 서지한 (2개 고유)

> heal, haste, blessingOfLight, energyBolt은 §1 범용에 등록.

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 흡혈 본능 | vampiricInstinct | C(curse) | passive | — | — | — | INT | — | — | MP 10% 이하 시 HP 5% 흡수. INT -3 3턴. | ✅ 로어북 (뱀파이어 저주) |
| 피의 감각 | bloodSense | C(curse) | passive | — | — | — | SEN | — | — | 출혈 감지 + 기습 회피 +15%. | ✅ 로어북 (뱀파이어 저주) |

---

## §11 박소원 (3개 고유)

> energyShower은 §1 범용에 등록.

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 포션제조 | potionCraft | E★ | utility | self | — | — | INT, SEN | — | — | 성장형 포션 제조. | ✅ 로어북 |
| 포션던지기 | potionToss | C | utility | singleAlly | MP0/SP0 | — | AGI | — | — | 아군 포션 투척. | ✅ 로어북 |
| 재료분석 | materialAnalysis | C | passive | — | — | — | SEN | — | — | 채집물 등급·속성·용도 감별. | ✅ 로어북 |

---

## §12 강유라 (4개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 신체강화 | bodyReinforce | C★ | buff | self | MP25(C) | — | STR, AGI | buff: str+3/agi+3(C)→+7/+7(S) | — | 성장형 자가 버프. | ✅ 로어북 |
| 파쇄격 | crushingKick | C | singleAttack | singleEnemy | MP20/SP30 | 3.4 | STR, AGI | physical | — | 근접 고계수 단일. | ✅ 로어북 |
| 회전축격 | spinSweep | C | aoeAttack | allEnemies | MP30/SP35 | 2.0 | STR, AGI | physical | — | 전열 광역 공격. | ⚠️ 코드 확장 |
| 급소가격 | vitalStrike | C | singleCC | singleEnemy | MP20/SP25 | 2.0 | AGI, SEN | physical | bind 2턴(22%) | 단일 CC. | ⚠️ 코드 확장 |

---

## §13 한서연 (5개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 화염창 | flameLance | B | singleAttack | singleEnemy | MP50 | 5.6 | INT | magic, fire | — | 단일 화염. 빙결 ×1.3. | ⚠️ 코드 확장 (B랭크 화염 마법 구체화) |
| 유성포격 | meteorBarrage | B | aoeAttack | allEnemies | MP55 | 3.2 | INT | magic, fire | — | 광역 화염. | ⚠️ 코드 확장 |
| 화염벽 | flameWall | B | aoeCC | allEnemies | MP45/SP45 | 1.6 | INT | magic, fire | burn 5턴(32%, 최대5중첩) | 광역 CC. | ⚠️ 코드 확장 |
| 마나집중 | manaFocus | B | buff | self | MP40 | — | INT | buff: int+8 | — | 자가 INT+8, 3턴. | ⚠️ 코드 확장 |
| 에너지볼트 | energyBolt | E | singleAttack | singleEnemy | MP30 | 1.5 | INT | magic | — | 기본 단일 마법 공격. (범용) | 🔧 범용 필러 |

---

## §14 하루 이토 (6개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 정령소환: 제피르 | summonZephyr | B | buff | allAllies | MP45 | — | INT, AGI | buff: agi+6, summon='zephyr' | — | 바람 정령 소환. 5턴. | ✅ 로어북 (Zephyr) |
| 정령소환: 바크 | summonBark | B | buff | allAllies | MP45 | — | INT, CON | buff: con+4, summon='bark' | — | 나무 정령 소환. 5턴. | ✅ 로어북 (Bark) |
| 질풍격 | galeStrike | B | singleAttack | singleEnemy | MP40/SP20 | 5.2 | INT, AGI | magic, wind | — | 바람 단일 공격. 제피르 시 ×1.2. | ✅ 로어북 (Wind) |
| 뿌리속박 | rootBind | B | aoeCC | allEnemies | MP50/SP40 | 1.5 | INT | magic, earth | bind 2턴(22%) | 광역 CC. 바크 시 32%. | ✅ 로어북 (Earth) |
| 대지의 치유 | earthHeal | B | aoeHeal | allAllies | MP50 | 3.8 | INT | — | — | 정령 소환 시 광역 회복. | ✅ 로어북 (Plant) |
| 지형 전환 | terrainShift | B | utility | self | MP55 | — | INT | — | — | 전장 숲/초원 변경 3턴. 1전투 1회. 쿨 99. | ⚠️ 코드 확장 |

---

## §15 유진성 (4개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 장비제작 | equipmentCraft | D★ | utility | self | — | — | STR, SEN | — | — | 성장형 장비 제조. D(str+1)→S(+5) | ✅ 로어북 |
| 감정 | appraisal | D★ | passive | — | — | — | SEN | — | — | 성장형 장비/재료 감정. D(sense+1)→S(+5) | ✅ 로어북 |
| 전장 응급수선 | battlefieldRepair | D | utility | singleAlly | SP30 | — | STR, SEN | — | — | 전투 중 내구도 +15. | ⚠️ 코드 확장 |
| 화력 최적화 | firepowerTuning | D | buff | singleAlly | MP20/SP20 | — | STR, SEN | buff: atk+5 | — | ATK +5, 3턴. | ⚠️ 코드 확장 |

---

## §16 한아람 (2개 고유)

> fistStrike는 §1 범용에 등록. hiddenMight도 범용으로 오분류.

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 하역지원 | cargoSupport | E | passive | — | — | — | STR, CON | — | — | 아이템 운반량 +20%. 채굴 +10%. | ⚠️ 코드 확장 |
| 긴급회피 | emergencyDodge | E | utility | self | SP25 | — | AGI | buff: evasionNext 1.0 | — | 다음 1회 100% 회피. 쿨 5턴. | ⚠️ 코드 확장 |

---

## 부록 A: 고랭크 NPC 스킬

### 강민혁 (4개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 오라 마스터리 | auraMastery | A(unique) | passive | — | — | — | STR, AGI | — | — | 오라 중거리 투사. | ✅ 로어북 |
| 그림자 발도 | shadowDraw | A(rare) | singleAttack | singleEnemy | MP40/SP40 | 8.5 | AGI, STR | physical | — | 선제 발도. | ✅ 로어북 |
| 오라 참격 | auraSlash | A | singleAttack | singleEnemy | MP35/SP25 | 7.8 | STR | physical | — | 중거리 검기 투사. | ⚠️ 코드 확장 |
| 오라 호 | auraArc | A | aoeAttack | allEnemies | MP45 | 4.5 | STR | physical | — | 중거리 반원 검기. | ⚠️ 코드 확장 |

### 강우석 (8개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 충격 감소 | impactReduction | A(rare) | passive | — | — | — | CON | — | — | 물리 피해 -15%. | ✅ 로어북 |
| 방어 태세 | defensiveStance | A | buff | self | MP30/SP30 | — | CON | buff: con+8/immobile | — | CON+8, 3턴. 이동불가. | ✅ 로어북 |
| 도발 | tauntA | A | buff | self | SP30 | — | CON | buff: threat+10 | — | 3턴 위협+10. | ✅ 로어북 |
| 돌진 | chargeA | A | singleAttack | singleEnemy | MP30/SP40 | 7.2 | CON | physical | — | 단일 공격. 후열 ×1.2. | ✅ 로어북 |
| 방패숙련 | shieldMastery | A | passive | — | — | — | CON | — | — | 방패 SP -15%. | ✅ 로어북 |
| 체력증강 | conBoost | A | passive | — | — | — | CON | — | — | CON +6 상시. | ✅ 로어북 |
| 스태미나 회복 | staminaRecovery | A | passive | — | — | — | CON | — | — | 턴 시작 SP +5%. | ✅ 로어북 |
| 감각증강 | senBoost | A | passive | — | — | — | SEN | — | — | SEN +4 상시. | ✅ 로어북 |

### 사사키 유아 (4개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 혼령 갑주 | spiritArmor | A | buff | self | MP50 | — | INT, CON | buff: pdef+12/mdef+8 | — | 5턴. | ✅ 로어북 |
| 무장 구현 | weaponManifestation | A | buff | self | MP45 | — | INT, STR | buff: atk+15 | — | 5턴. | ✅ 로어북 |
| 삼일월 | crescentSlash | A | singleAttack | singleEnemy | MP30/SP35 | 8.2 | STR, AGI | physical | — | 고계수 참격. | ⚠️ 코드 확장 |
| 귀혼참 | spiritSever | A(rare) | singleCC | singleEnemy | MP40/SP40 | 5.0 | INT, STR | magic | sleep 2턴(18%) | 수면 CC. | ⚠️ 코드 확장 |

### 임설희 (4개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 아이스 메이커 | iceMaker | A(unique) | utility | self | MP40 | — | INT | — | — | 자유 빙결 조형. | ✅ 로어북 |
| 얼음창 투사 | icicleLance | A | singleAttack | singleEnemy | MP45 | 8.8 | INT | magic, ice | — | 빙결 단일 고계수. | ✅ 로어북 |
| 서리꽃 | frostFlower | A | aoeCC | allEnemies | MP55/SP30 | 2.5 | INT | magic, ice | bind 2턴(20%) | 광역 CC. | ✅ 로어북 |
| 계단&미끄럼틀 | stairAndSlide | A | utility | self | MP35 | — | INT | — | — | 전술 이동로 생성. 3턴. | ✅ 로어북 |

### 백휘성 (3개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 심판자의 기운 | auraOfJudge | S(rare) | passive | — | — | — | INT | — | — | 적 스킬 비용 +10%. | ✅ 로어북 |
| 헬리오스 노바 | heliosNova | S | aoeAttack | allEnemies | MP90/SP50 | 12.0 | INT | magic, light | — | 빛/열 광역 섬멸. | ✅ 로어북 |
| 빛의 속박 | shacklesOfRadiance | S(rare) | singleCC | singleEnemy | MP70 | 8.0 | INT | magic, light | silence 3턴 | 마법 봉인 3턴. | ✅ 로어북 |

### 한지원 (3개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 진실의 시선 | trueGaze | S(unique) | passive | — | — | — | SEN | — | — | 스탯/약점 해석. | ✅ 로어북 |
| 결계 조작 | barrierManipulation | S(rare) | buff | allAllies | MP80 | — | INT, SEN | buff: pdef+10/mdef+10 | — | 다층 방벽. 3턴. | ✅ 로어북 |
| 치유 마법 | healingMagic | S | singleHeal | singleAlly | MP45 | 2.4 | INT | — | — | 경상 즉시 회복. | ✅ 로어북 |

### 박준호 (2개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 벽력장 | byeokryeokjang | S | buff | self | MP80/SP60 | — | CON, STR | buff: pdef+20/mdef+15/onContactStun(25%,1턴) | — | 번개 갑주. 5턴. | ✅ 로어북 |
| 우레격 | uraegyeok | S | aoeCC | allEnemies | MP100/SP80 | 9.0 | CON, STR | physical, lightning | stun 1턴(20%) | 광역 stun. 쿨 8턴. | ✅ 로어북 |

### 하월영 (4개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 순보 | shunpo | S(rare) | utility | self | SP40 | — | AGI | — | — | 초고속 이동. | ✅ 로어북 |
| 월섬 "삼월" | wolseomTriple | S(rare) | singleAttack | singleEnemy | MP50/SP60 | 13.5 | AGI, STR | physical | — | 3연참 고계수. | ✅ 로어북 (Wolseom) |
| 받아치기 | parry | S | utility | self | SP25 | — | AGI, SEN | buff: parryStance/coef 4.0 | — | 피격 직전 반격 자세. | ✅ 로어북 |
| 통찰 | insight | S | passive | — | — | — | SEN | — | — | 회피율 +10%. | ✅ 로어북 |

### 앨리스 크로프트 (4개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 시간 감속 | slowTime | A | aoeCC | allEnemies | MP65 | — | INT | magic | slow 3턴, agi-8(debuff) | 적 전체 둔화. | ✅ 로어북 |
| 시간 가속 | hasteTime | A | buff | allAllies | MP55 | — | INT | buff: agi+8 | — | 전 아군 AGI+8. 2턴. | ✅ 로어북 |
| 시간 감지 | temporalSense | A | passive | — | — | — | SEN, INT | — | — | 시간 능력 탐지. | ✅ 로어북 |
| 소모품 연장 | itemExtension | A(unique) | passive | — | — | — | INT | — | — | 소모품 지속 +20%. | ✅ 로어북 |

### 이지혜 (3개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 반전 소환 | reverseSummon | A | utility | self | MP30 | — | INT | — | — | 야간/그림자 포탈. | ✅ 로어북 |
| 밤의 장막 | nightsVeil | A | passive | — | — | — | INT, SEN | — | — | 비전투 은폐 + 어그로 감소. | ✅ 로어북 |
| 공유된 나른함 | sharedLethargy | A | passive | — | — | — | INT | — | — | 적 경계심 감소. | ✅ 로어북 |

### 임진태 (3개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 늑대 변신(부분) | partialTransform | S | buff | self | MP60 | — | STR, AGI, CON | buff: str+12/agi+10/con+8 | — | 부분 변신. 5턴. | ✅ 로어북 |
| 늑대 변신(완전) | fullTransform | S | buff | self | MP100/SP80 | — | STR, AGI, CON | buff: str+20/agi+18/con+15/int+5/sense+10 | — | 완전 변신. 3턴. | ✅ 로어북 |
| 탐식 본능 | gluttonousInstinct | S(unique) | passive | — | — | — | STR, CON | — | — | 출혈/사망 시 스탯 증가. 폭주 위험. | ✅ 로어북 |

### 제이크 밀러 (4개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 분쇄격 | devastatingBlow | S | singleAttack | singleEnemy | SP80 | 13.0 | STR | physical | — | 고계수 단일 물리. | ⚠️ 코드 확장 (마스터급 맨손 격투 구체화) |
| 지진타 | quakeStrike | S | aoeAttack | allEnemies | MP30/SP70 | 7.5 | STR, CON | physical | — | 지면 충격파 광역. | ⚠️ 코드 확장 |
| 무투가의 각성 | martialAwakening | S | buff | self | MP50/SP50 | — | STR, AGI | buff: str+15/agi+10 | — | 자가 버프. 3턴. | ⚠️ 코드 확장 |
| 본능 읽기 | instinctRead | S | passive | — | — | — | SEN, AGI | — | — | 회피율 +12%. | ⚠️ 코드 확장 |

---

## 부록 B: 적대 NPC 스킬

### 강태식 (4개)

> 로어북에는 Lockpicking도 언급되나 미구현.

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 은밀 | stealth | C | passive | — | — | — | AGI, SEN | — | — | 존재감 억제. | ✅ 로어북 |
| 기습 | ambush | C | singleAttack | singleEnemy | SP35 | 3.6 | AGI | physical | — | 은신 시 자동 치명타. | ✅ 로어북 |
| 독도포 | poisonBlade | C | singleCC | singleEnemy | MP15/SP25 | 2.5 | AGI | physical | poison 3턴(35%) | 독 35%. | ✅ 로어북 (Poison) |
| 도주 | escape | C | utility | self | SP40 | — | AGI | — | — | 전투 이탈. | ⚠️ 코드 확장 (Evasion 대체?) |

### 권도윤 (3개)

> 로어북의 "Coin Transaction" 미구현. knifeStrike로 대체됨.

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 암시 | suggestion | B(rare) | singleCC | singleEnemy | MP45 | — | INT | magic | confuse 1턴 | 1턴 혼란. | ✅ 로어북 |
| 환영보 | phantomStep | B(rare) | utility | self | SP35 | — | AGI | — | — | 단거리 무음 이동. | ✅ 로어북 |
| 단검 일격 | knifeStrike | B | singleAttack | singleEnemy | SP40 | 5.0 | AGI | physical | — | 단검 물리 공격. | ⚠️ 코드 확장 (Coin Transaction 대신) |

### 유진혁 (4개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 어둠 조작 | darknessManipulation | A | utility | self | MP60 | — | INT, STR | — | — | 암흑 형태 생성. | ✅ 로어북 |
| 그림자 융합 | shadowMeld | A | utility | self | SP40 | — | AGI, INT | — | — | 그림자 잠복 + 기습. | ✅ 로어북 |
| 심연검 | abyssalBlade | A(rare) | singleAttack | singleEnemy | MP45/SP45 | 9.0 | STR, INT | magic, dark | — | 암흑 속성. 빛 ×0.7. | ⚠️ 코드 확장 |
| 에레보스의 외투 | erebosCloak | A | passive | — | — | — | INT, CON | — | — | 어둠 환경: 스탯+5, 피해감소 10%. | ⚠️ 코드 확장 |

### 장은서 (3개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 저주 면역 | curseImmunity | A(unique) | passive | — | — | — | CON, SEN | — | — | 저주 아이템 페널티 무시. | ✅ 로어북 |
| 피식자의 단검 | bloodletterDagger | A | singleAttack | singleEnemy | SP45 | 8.5 | AGI | physical | — | HP 흡수 5%. | ⚠️ 로어북은 장비로 분류 |
| 비존재의 장막 | shroudOfNonexistence | A | passive | — | — | — | SEN | — | — | 마나 신호 은폐. | ⚠️ 로어북은 장비로 분류 |

### 신우현 (3개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 오염된 공명 | corruptedResonance | A(curse) | singleAttack | singleEnemy | MP40 | 7.5 | INT | magic, dark | — | 오염 마정석 소모 공격. | ✅ 로어북 |
| 몬스터 친화 | monsterKinship | E(curse) | passive | — | — | — | SEN | — | — | 몬스터 비공격·의사소통. | ✅ 로어북 |
| 오염 확산 | corruptSpread | A(curse) | aoeCC | allEnemies | MP50 | 2.0 | INT | magic, dark | curse 3턴(28%) | 범위 저주 + 독. | ⚠️ 코드 확장 |

### 나선영 (4개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 공포의 속삭임 | whisperOfFear | A(rare) | singleCC | singleEnemy | MP50 | — | INT | magic | sleep 2턴(20%) | 수면/속박. | ⚠️ 코드 확장 (저주 사용 구체화) |
| 부식의 안개 | corrosiveMist | A | aoeCC | allEnemies | MP55/SP35 | 2.0 | INT | magic | poison 3턴(30%) | 독 + 저주. | ⚠️ 코드 확장 (DoT 구체화) |
| 마나 시야 | manaSight | A(curse) | passive | — | — | — | SEN, INT | — | — | 마나/감정 감지. | ✅ 로어북 (감정/마나 감지) |
| 공포 주입 | fearInfusion | A(rare) | singleCC | singleEnemy | MP60 | — | INT | magic | fear 2턴 | 공포 상태 2턴. | ⚠️ 코드 확장 |

### 채하윤 (4개)

| 이름 | ID | 등급 | 카테고리 | 대상 | 비용 | 계수 | 스탯 | 속성 | CC | 설명 | 출처 |
|------|-----|------|---------|------|------|------|------|------|-----|------|------|
| 마나 탄환 | manaBullet | C(rare) | singleAttack | singleEnemy | MP20 | 3.0 | INT, AGI | magic | — | 탄환 형태 변형 가능. | ✅ 로어북 |
| 관통탄 | piercingRound | C(rare) | singleAttack | singleEnemy | MP25 | 3.2 | AGI | physical | — | 최종 피해 +30%. | ⚠️ 코드 확장 (마나탄환 변형) |
| 폭발탄 | explosiveRound | C(rare) | aoeAttack | allEnemies | MP30 | 1.8 | INT | magic | — | 소범위 폭발. | ⚠️ 코드 확장 |
| 추적탄 | homingRound | C(rare) | singleAttack | singleEnemy | MP35 | 2.5 | SEN | magic | — | 회피 불가 추적. | ⚠️ 코드 확장 |

---

## 범례

| 기호 | 의미 |
|------|------|
| ✅ | 로어북에 명시적으로 이름/설명이 일치하는 스킬 |
| ⚠️ | 로어북의 포괄적 설명을 코드에서 구체화하거나 역할 보완으로 추가한 스킬 |
| 🔧 | 범용 필러 — 로어북에 없으나 기본 전투 구성을 위해 추가된 스킬 |
| ★ | 성장형 스킬 — 등급별(E→S) 계수·비용 테이블 보유 |
| (rare) | 희귀 등급 스킬 |
| (unique) | 고유 등급 스킬 |
| (curse) | 저주 계열 스킬 |
