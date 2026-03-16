# Hunter World — 전투 공식 정리

> 코드 기준: `GateBattle_v4_8 복사본.js`

---

## 1. 기본 스탯 공식

| 스탯 | 공식 |
|------|------|
| **HP** | `100 + CON×10 + STR×3` |
| **MP** | `100 + INT×10 + SENSE×3` |
| **SP** | `100 + AGI×10 + SENSE×3` |
| **ATK** | `무기기본공격력 + STR×0.2 + AGI×0.2 + INT×0.3` |
| **pDEF** | `CON × 0.4` |
| **mDEF** | `(INT + SENSE) × 0.25` |

> 레벨업 시 HP/MP/SP에 각각 +2 보너스가 누적 적용됨.
> 몬스터는 개별 스탯(str/con 등)이 없으며, HP/ATK는 등급별 프로필 테이블에서 가져옴.

### 스탯 상한 (등급별)

| E | D | C | B | A | S |
|---|---|---|---|---|---|
| 25 | 40 | 60 | 80 | 100 | 150 |

---

## 2. 데미지 공식

### 헌터 기본 공식
```
Damage = rawBase × coefAfterDef × critMult × resistMult × elementMul × typeMul × incomingMul × outgoingMul
```

각 항목:
- **rawBase** = `(2 × MainStat) + (3 × ATK)`
  - MainStat = 스킬의 statTypes 평균 (예: `['con']` → CON, `['int','sense']` → (INT+SENSE)/2)
- **coefAfterDef** = `스킬계수 × (100 / (100 + DEF))`
  - DEF = 물리 공격이면 pDEF, 마법 공격이면 mDEF
- **critMult** = 크리티컬 시 `1.5`, 아니면 `1.0`
- **resistMult** = 대상의 해당 속성 저항 배율 (기본 1.0)
- **elementMul** = 속성 상성 배율 (유리 1.25, 불리 0.75, 기본 1.0)
- **typeMul** = 종족별 피해 타입 배율 (예: 고스트 → 물리 0.50, 마법 1.25)
- **incomingMul** = 대상에게 적용되는 피격 배율 (저주, 화상 등)
- **outgoingMul** = 공격자에게 적용되는 공격력 배율 (저주 등)

### 몬스터 기본 공식
```
rawBase = monsterBaseDamage × (스킬 사용 시 monsterSkillMul, 기본공격 시 1)
```
> 이후 과정은 헌터와 동일: `rawBase × coefAfterDef × critMult × resistMult × elementMul × typeMul × incomingMul × outgoingMul`

### 몬스터 JSON → 전투 스탯 변환 과정

몬스터 JSON 파일(`monster_pack_full_core_import.json`)에는 **atk/damage 필드가 없음**.
전투 시 `monsterProfileForEntry(entry)` 함수가 `MONSTER_COMBAT_TABLE`을 기반으로 런타임 계산:

1. **JSON에 있는 필드**: `id`, `name`, `kind`(Normal/Elite/Boss), `rank`, `hp`, `damageType`, `attackStat`, `skills`, `position`, `row`, `role`, `threatBase`, `note`
2. **런타임 생성 필드**: `monsterBaseDamage`(=프로필 damage), `monsterSkillMul`(=프로필 skillMul), `atk`(=프로필 damage), `pdef=0`, `mdef=0`, `stats={str:0,con:0,int:0,agi:0,sense:0}`

#### MONSTER_COMBAT_TABLE (등급 × 종류별 범위)

| 등급 | 종류 | HP 범위 | Damage 범위 | skillMul |
|------|------|---------|-------------|----------|
| **E** | Normal | 50~90 | 7~10 | 1.0 |
| **E** | Elite | 200~360 | 15~20 | 1.1 |
| **E** | Boss | 500~900 | 35~40 | 1.25 |
| **D** | Normal | 175~275 | 15~20 | 1.0 |
| **D** | Elite | 700~1100 | 35~40 | 1.2 |
| **D** | Boss | 1750~2750 | 55~60 | 1.5 |
| **C** | Normal | 400~700 | 20~25 | 1.0 |
| **C** | Elite | 1800~3150 | 45~50 | 1.2 |
| **C** | Boss | 5000~8750 | 70~80 | 1.5 |
| **B** | Normal | 1250~1750 | 30~35 | 1.0 |
| **B** | Elite | 5500~8000 | 60~65 | 1.25 |
| **B** | Boss | 15000~22500 | 90~100 | 1.6 |
| **A** | Normal | 3000~4500 | 35~40 | 1.0 |
| **A** | Elite | 15000~22500 | 80~90 | 1.4 |
| **A** | Boss | 45000~67500 | 110~120 | 1.75 |
| **S** | Normal | 7500~10000 | 50~60 | 1.0 |
| **S** | Elite | 37500~50000 | 100~110 | 1.5 |
| **S** | Boss | 112500~150000 | 130~150 | 1.8 |

#### 프로필 계산 과정 (monsterProfileForEntry)

```
1. rank + kind → MONSTER_COMBAT_TABLE에서 범위 선택
2. hash seed = "id|rank|kind|position|row" → FNV-1a 해시로 0~1 사이 결정론적 값(t) 생성
3. 열(row)에 따른 보정:
   - front: HP +12%, DMG +8%
   - mid:   HP +3%,  DMG +2%
   - back:  HP -10%, DMG -4%
4. 포지션 보정:
   - 원거리: HP -3%, DMG -1%
   - 마법:   HP -4%, DMG -2%
   - 근거리: DMG +4%
5. 최종값 = range(min, max, 보정된 t)
```

#### 몬스터 MP/SP 리소스 테이블

| 등급(인덱스) | 물리형 MP | 물리형 SP | 마법형 MP | 마법형 SP |
|-------------|-----------|-----------|-----------|-----------|
| E (0) | 0 | 20 | 20 | 10 |
| D (1) | 0 | 30 | 35 | 15 |
| C (2) | 0 | 40 | 50 | 20 |
| B (3) | 0 | 55 | 70 | 25 |
| A (4) | 0 | 70 | 90 | 30 |
| S (5) | 0 | 90 | 120 | 40 |

> 마법 스킬이 있는 물리형 몬스터는 기본 MP의 25% 확보 (판정: skills 중 damageType='magic' 또는 statTypes에 'int' 포함 또는 category에 'heal'/'buff' 포함)
> 마법형 몬스터 중 물리 스킬 없으면 SP 70%만 확보

#### 몬스터 공격 예시

E등급 Normal 근거리물리(front열) 몬스터:
- `monsterBaseDamage` ≈ 9 (범위 7~10, front 보정 +8%)
- 기본공격: `rawBase = 9`
- 스킬공격: `rawBase = 9 × 1.0 = 9` (Normal의 skillMul=1.0)
- DEF 적용: `9 × skillCoef × (100/(100+DEF))`

E등급 Boss 근거리물리(front열) 몬스터:
- `monsterBaseDamage` ≈ 39 (범위 35~40, front 보정 +8%)
- 기본공격: `rawBase = 39`
- 스킬공격: `rawBase = 39 × 1.25 = 48.75` (Boss의 skillMul=1.25)

> **핵심**: 몬스터는 개별 스탯(STR/CON 등)이 없으므로 `(2×MainStat + 3×ATK)` 공식을 사용하지 않음.
> 대신 `monsterBaseDamage`를 rawBase로 직접 사용.

---

## 3. 회복 공식

```
Heal = (2 × MainStat + 3 × ATK) × 스킬계수 × curseMul
```
- **curseMul** = 저주 상태면 `(1 - cursePenalty)`, 아니면 1.0
- 출혈 상태인 대상은 회복량 **50% 감소** (`bleedHealReduction`)

---

## 4. 크리티컬 확률

```
CritChance = clamp(0.25 × (AGI + SENSE) + buffBonus, 3, 35) / 100
```
- 최소 3%, 최대 35%
- 속박(bind) 시 SENSE 50% 감소 후 계산
- 크리티컬 배율: **×1.5**

---

## 5. 명중/회피 공식

### 헌터 명중률
```
accuracy = (70 + SENSE × 0.5) / 100
```
- 속박(bind) 시: SENSE 50% 감소 + 명중률 추가 50% 감소

### 몬스터 명중률
```
accuracy = 100%
```
- 속박(bind) 시: 명중률 50% 감소

### 회피율 (등급별)

| E | D | C | B | A | S |
|---|---|---|---|---|---|
| 3% | 5% | 7% | 10% | 12% | 15% |

### 회피 규칙
- **공격자 등급 > 대상 등급** → 대상 회피율 **0%** (무시)
- **몬스터가 공격자** → 헌터 회피율 **50%만 적용**

### 최종 적중률
```
hitRate = accuracy - evasion
```
- hitRate ≥ 1.0 → 무조건 적중

---

## 6. 행동 순서 (이니셔티브)

```
init = (AGI × 2) + SENSE + randInt(1, 10)
```
- 높은 init부터 행동

---

## 7. 속성 상성

속성 순환 체인 (순서):
```
dark → light → ice → fire → water → earth → wind → electric → dark ...
```
- 체인에서 **이전(prev) 속성** 공격 시: **×1.25** (유리)
- 체인에서 **다음(next) 속성** 공격 시: **×0.75** (불리)
- 같은 속성 또는 none: **×1.0**

---

## 8. 상태이상

### 기본 확률/턴수

| 상태이상 | 기본 확률 | 기본 턴수 | 비고 |
|----------|----------|----------|------|
| **독(poison)** | 28% | 3턴 | 스택형 (최대 3중첩) |
| **출혈(bleed)** | 28% | 3턴 | 치유량 50% 감소 3턴 |
| **화상(burn)** | 28% | 5턴 | 스택형 (최대 5중첩) |
| **저주(curse)** | 24% | 3턴 | 공격/회복 감소 |
| **속박(bind)** | 18% | 2턴 | 감각/명중 감소 |
| **수면(sleep)** | 16% | 2턴 | 행동불가, 피격 시 해제 |
| **기절(stun)** | 16% | 1턴 | 행동불가 |

### DoT (지속 피해)

**독(Poison)**:
- 헌터 시전: 틱당 `(2×MainStat + 3×ATK) × skillCoef × 0.2` (스택당)
- 몬스터 시전: 틱당 `monsterBaseDamage × 0.4` (스택당)
- 방어 무시 절대 데미지
- 최대 3중첩

**출혈(Bleed)**:
- 출혈을 일으킨 공격 데미지의 **30%** 를 매 턴 추가 피해
- 치유량 **50% 감소** 3턴

**화상(Burn)**:
- 헌터 시전: 틱당 `(2×MainStat + 3×ATK) × skillCoef × 0.12` (스택당)
- 몬스터 시전: 틱당 `monsterBaseDamage × 0.2` (스택당)
- 방어 무시 절대 데미지
- 최대 5중첩
- 피격 데미지 **+10%** 증가

### CC (군중 제어)

**기절(Stun)**:
- 보스: 최대 1턴
- 엘리트: 최대 2턴
- 해제 후 **5턴 면역** (stunResistTimer)

**수면(Sleep)**:
- 보스/엘리트: 최대 2턴
- 피격 시 즉시 해제
- 해제 후 **5턴 면역** (sleepResistTimer)

**속박(Bind)**:
- 헌터: 감각(SENSE) **-50%**, 명중률 **-50%**
- 몬스터: 명중률 **-50%**

### 저주(Curse) — 등급별 감소율

| E | D | C | B | A | S |
|---|---|---|---|---|---|
| 10% | 12% | 15% | 20% | 25% | 30% |

- 공격 데미지 **감소** (outgoingMul)
- 피격 데미지 **증가** (incomingMul)
- 회복량 **감소** (curseMul)

---

## 9. 종족 특성

| 종족 | 기본속성 | 면역 | 피해배율 | 특수 |
|------|---------|------|---------|------|
| 언데드 | dark | 독,출혈,저주 | 물리 ×1.10 | — |
| 고스트 | dark | 독,출혈,저주 | 물리 ×0.50, 마법 ×1.25 | — |
| 야수 | wind | — | — | 출혈 대상에게 ×1.20, 혼자일 때 피격 ×1.10 |
| 식물 | earth | 출혈 | — | 매턴 HP 3% 재생 (화상 시 차단) |
| 슬라임 | water | 출혈 | 물리 ×0.70, 마법 ×1.10 | — |
| 구조체 | electric | 독,출혈,수면 | 마법 ×0.80, 물리 ×1.15 | — |
| 정령 | none | — | — | — |
| 악마 | fire | 화상 | dark ×0.70 | — |
| 빙정 | ice | 수면 | 물리 ×0.80 | — |
| 천사체 | light | 저주 | 마법 ×0.80 | — |

---

## 10. 스킬 계수/비용 기준표 (단일 대상)

| 등급 | 계수 범위 | 비용 범위 |
|------|----------|----------|
| E | 1.2 ~ 1.5 | 20 ~ 30 |
| D | 1.92 ~ 2.4 | 25 ~ 35 |
| C | 2.88 ~ 3.6 | 30 ~ 40 |
| B | 4.8 ~ 6.0 | 40 ~ 50 |
| A | 7.68 ~ 9.6 | 55 ~ 60 |
| S | 11.52 ~ 14.4 | 70 ~ 80 |

> 광역 스킬: 단일 대상 계수의 약 **58%** (0.875/1.5)
> 광역 CC: 단일 CC 대비 계수 **1/2**, 비용 **2배**
> 희귀 성장형 스킬: 상한값 사용

---

## 11. 타겟팅 / 전열 규칙

### 근접 공격자
- 전열에 생존자 있으면 → 전열만 공격 가능
- 전열 전멸 → 중열 → 후열 순으로 접근

### 원거리/마법 공격자
- 모든 열 공격 가능

### 광역 스킬 (allEnemies)
- 모든 살아있는 열 대상

### 열별 타겟 선택 가중치
```
front: 70, mid: 20, back: 10
```
- 위협(threat) 수치에 따라 동일 열 내 가중 선택

---

## 12. 패시브 스킬 효과

- 패시브 보너스: 스탯/방어력에 고정 보너스 추가 (`passiveBonuses`)
- 패시브 모드: 비용 배율 변경 (`passiveMods`)
  - 예: Shield Proficiency → 방패 계열 SP ×0.9
  - 예: Dagger Handling → 단검/투척 계열 SP ×0.9
