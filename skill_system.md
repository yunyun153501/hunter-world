# Hunter World — 스킬 시스템

> 코드 기준: `GateBattle_v4_8 복사본.js`

---

## 1. 스킬 카테고리

| 카테고리 | 설명 | 대상 |
|----------|------|------|
| **singleAttack** | 단일 대상 공격 | 적 1체 |
| **aoeAttack** | 광역 공격 | 전체 적 |
| **singleCC** | 단일 CC + 공격 | 적 1체 |
| **aoeCC** | 광역 CC + 공격 | 전체 적 |
| **singleHeal** | 단일 회복 | 아군 1체 |
| **aoeHeal** | 광역 회복 | 전체 아군 (분배) |
| **buff** | 버프 | 자신/아군 |
| **utility** | 유틸리티 | 자원 회복 등 |
| **passive** | 패시브 | 상시 적용 |

---

## 2. 내장 스킬 전체 목록 (22종)

### 공격 스킬

| 이름 | ID | 등급 | 카테고리 | 계수 | 비용 | 스탯 | 속성 |
|------|-----|:---:|----------|:---:|------|------|------|
| 에너지볼트 | energyBolt | E | singleAttack | 1.5 | MP 30 | INT | magic |
| 에너지샤워 | energyShower | E | aoeAttack | 0.875 | MP 40 | INT | magic |
| 실드강타 | shieldBash | E | singleCC | 0.875 | MP 20 + SP 20 | CON | physical |
| 충격파 | shockwave | E | aoeCC | 0.4375 | MP 40 + SP 40 | CON | physical |
| 파워샷 | powerShot | E | singleAttack | 1.5 | MP 20 + SP 20 | AGI | physical |
| 퀵샷 | quickShot | E | singleAttack | 1.2 | SP 15 | AGI | physical |
| 퀵스로 | quickThrow | E | singleAttack | 1.5 | SP 40 | AGI+SENSE | physical |
| 정권 | fistStrike | E | singleAttack | 1.5 | MP 20 + SP 20 | STR+CON | physical |

### 회복 스킬

| 이름 | ID | 등급 | 카테고리 | 계수 | 비용 | 스탯 |
|------|-----|:---:|----------|:---:|------|------|
| 힐 | heal | D | singleHeal | 2.0 | MP 40 | INT |
| 기도 | pray | D | singleHeal | 2.2 | MP 45 | INT |

### 버프 스킬

| 이름 | ID | 등급 | 카테고리 | 효과 | 비용 | 지속 |
|------|-----|:---:|----------|------|------|:---:|
| 헤이스트 | haste | D | buff | AGI+4 | MP 25 | 3턴 |
| 빛의 축복 | blessingOfLight | D | buff | INT+4 | MP 25 | 3턴 |
| 도발 | taunt | E | buff | 위협+5 | SP 20 | 3턴 |

### 유틸리티 스킬

| 이름 | ID | 등급 | 카테고리 | 효과 | 비용 |
|------|-----|:---:|----------|------|------|
| Full Arrow Recovery | fullArrowRecovery | E | utility | SP +25 회복 | MP 30 |
| 무기회수 | knifeRecall | E | utility | 30% 확률 + SP +10 회복 | MP 20 |

### 패시브 스킬

| 이름 | ID | 등급 | 효과 |
|------|-----|:---:|------|
| Shield Proficiency | shieldProficiency | E | 방패 계열 SP 비용 -10% |
| Dagger Handling | daggerHandling | E | 단검/투척 계열 SP 비용 -10% |

---

## 3. 성장형(희귀) 스킬

등급이 오르면 계수와 비용이 함께 성장하는 스킬:

### 트리플샷 (tripleShot)
| 등급 | 계수 | MP 비용 | SP 비용 |
|:---:|:---:|:---:|:---:|
| E | 1.5 | 15 | 15 |
| D | 2.4 | 20 | 17 |
| C | 3.6 | 22 | 20 |
| B | 6.0 | 27 | 23 |
| A | 9.6 | 35 | 25 |
| S | 14.4 | 45 | 30 |

> 단일 대상 | AGI 스탯 | physical | 희귀 등급

### 민첩한 조준 (preciseAim)
| 등급 | AGI 보너스 | SENSE 보너스 | MP 비용 |
|:---:|:---:|:---:|:---:|
| E | +2 | +2 | 15 |
| D | +4 | +4 | 20 |
| C | +6 | +6 | 25 |
| B | +8 | +8 | 30 |
| A | +10 | +10 | 35 |
| S | +12 | +12 | 40 |

> 전체 아군 버프 | 3턴 지속

### 작은 정원 (smallGarden)
| 등급 | 계수 | MP 비용 |
|:---:|:---:|:---:|
| E | 0.875 | 25 |
| D | 1.4 | 30 |
| C | 2.1 | 35 |
| B | 3.5 | 40 |
| A | 5.6 | 50 |
| S | 8.4 | 60 |

> 광역 회복 | INT 스탯 | 부상 아군에게 분배

### Steel Anvil (steelAnvil)
| 등급 | 물리피해감소 | 마법피해감소 |
|:---:|:---:|:---:|
| E | +1 | +1 |
| D | +3 | +3 |
| C | +5 | +5 |
| B | +7 | +7 |
| A | +9 | +9 |
| S | +11 | +11 |

> 패시브 | 상시 적용

### 이면의 완력 (hiddenMight)
| 등급 | STR 보너스 |
|:---:|:---:|
| E | +1 |
| D | +2 |
| C | +3 |
| B | +4 |
| A | +5 |
| S | +6 |

> 패시브 | 상시 적용

---

## 4. 스킬 계수/비용 기준표

### 단일 대상 기준

| 등급 | 계수 범위 | 비용 범위 |
|------|:---:|:---:|
| E | 1.2 ~ 1.5 | 20 ~ 30 |
| D | 1.92 ~ 2.4 | 25 ~ 35 |
| C | 2.88 ~ 3.6 | 30 ~ 40 |
| B | 4.8 ~ 6.0 | 40 ~ 50 |
| A | 7.68 ~ 9.6 | 55 ~ 60 |
| S | 11.52 ~ 14.4 | 70 ~ 80 |

### 파생 규칙
- **광역 공격**: 단일 계수의 약 **58%** (0.875 / 1.5)
- **광역 CC**: 단일 CC 대비 계수 **1/2**, 비용 **2배**
- **희귀 성장형**: 상한값 사용

### aoeCC 자동 계산
- `baseSingleCoef`가 명시적으로 설정된 경우에만 자동 반/배 적용
- 직접 `coef`가 설정된 스킬은 그대로 사용

---

## 5. 스킬 해결 방식

### 공격 스킬 (singleAttack / aoeAttack)
```
rawBase = (2 × MainStat) + (3 × ATK)
rawDamage = rawBase × coef × critMult × elementMul × resistMult × typeMul × incomingMul × outgoingMul
최종피해 = 방어 공식 적용 (DEF 기반)
```

### CC 스킬 (singleCC / aoeCC)
1. 데미지 적용 (공격과 동일)
2. CC 판정: 기본 확률 × 보정
3. CC 성공 시 상태 부여 (stun, sleep 등)
4. 면역 체크 (stunResistTimer, sleepResistTimer)

### 회복 스킬 (singleHeal)
```
Heal = (2 × MainStat + 3 × ATK) × 스킬계수 × curseMul
```
- 저주 시 `curseMul = 1 - cursePenalty`
- 출혈 대상은 회복량 50% 감소

### 광역 회복 (aoeHeal)
```
totalHeal = (2 × MainStat + 3 × ATK) × 계수
perTarget = totalHeal ÷ 부상 아군 수
```
> 총 회복량을 부상 아군에게 균등 분배

### 버프 (buff)
- 스탯 보너스 부여 (지속시간 동안)
- 위협 수치 증감
- 지속시간 종료 시 자동 해제

### 패시브 (passive)
- 전투 시작 시 `passiveBonuses`에 등록
- 스탯/방어 보정 상시 적용
- `passiveMods`로 비용 배율 변경

---

## 6. 상태이상 판정

### 기본 확률/턴수

| 상태이상 | 기본 확률 | 기본 턴수 | 비고 |
|----------|:---:|:---:|------|
| 독(poison) | 28% | 3턴 | 최대 3중첩 |
| 출혈(bleed) | 28% | 3턴 | 치유량 -50% |
| 화상(burn) | 28% | 5턴 | 최대 5중첩 |
| 저주(curse) | 24% | 3턴 | 공격/회복 감소 |
| 속박(bind) | 18% | 2턴 | 감각/명중 감소 |
| 수면(sleep) | 16% | 2턴 | 행동불가, 피격 해제 |
| 기절(stun) | 16% | 1턴 | 행동불가 |

### 보스/엘리트 CC 제한
- **기절**: 보스 최대 1턴, 엘리트 최대 2턴 → 해제 후 **5턴 면역**
- **수면**: 보스/엘리트 최대 2턴, 피격 시 즉시 해제 → 해제 후 **5턴 면역**
