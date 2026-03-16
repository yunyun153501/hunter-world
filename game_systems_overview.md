# Hunter World — 게임 시스템 총괄 문서

> 코드 기준: `GateBattle_v4_8 복사본.js` (10,296줄)
> 플러그인 명: ⚔️ 게이트 전투 프로토타입 v2.2.0

---

## 프로젝트 구조

| 파일 | 설명 |
|------|------|
| `GateBattle_v4_8 복사본.js` | 메인 게임 엔진 (전투, UI, 데이터 전부 포함) |
| `combat_formulas.md` | 전투 공식 정리 |
| `monster_pack_full_core_import.json` | 몬스터 데이터 (JSON) |
| `normal_material_catalog_core.json` | 일반 재료 카탈로그 |
| `rare_material_catalog_core.json` | 희귀 재료 카탈로그 |
| `skill_definitions.json` | 스킬 정의 데이터 |
| `skill_generator.json` | 스킬 생성기 데이터 |

---

## 핵심 시스템 목록

### 1. 전투 시스템 (`combat_formulas.md`)
- 턴제 전투, 이니셔티브, 스킬 해결
- 데미지/방어/회복 공식
- 크리티컬, 명중/회피, 속성 상성
- 상태이상 (DoT, CC)
- AI 행동 결정

### 2. 게이트 시스템 (`gate_system.md`)
- 게이트 생성/선택 (소형/중형/대형)
- 등급별 가중치, 종족 조합
- 방(Room) 구조: 전투/퍼즐/함정/선택/비밀방/야영
- 전리품 분배, 광맥 채굴

### 3. 캐릭터/파티 시스템 (`character_party_system.md`)
- 캐릭터 생성, 스탯 구조
- 레벨업, 경험치, 스탯포인트
- 등급 시스템, 스탯 상한
- 파티 편성, 가방, 팀 구성

### 4. 장비/인벤토리 시스템 (`equipment_inventory_system.md`)
- 장비 종류 (무기/보조무기/방어구/악세서리)
- 강화, 특성주입 (인퓨즈)
- 인벤토리 (공용/개인), 슬롯, 무게
- 내구도, 수리

### 5. 경제 시스템 (`economy_system.md`)
- 화폐 (₩), 마정석 가치
- 정산 (협회/길드), 세금
- 경매장, 헌터마켓, 블랙마켓
- 상점 체계 (편의점, 백화점, 헌터거리)
- 주거 시스템

### 6. 스킬 시스템 (`skill_system.md`)
- 내장 스킬 22종 상세
- 스킬 카테고리별 해결 방식
- 등급별 계수/비용 기준
- 성장형(희귀) 스킬
- 패시브 스킬

### 7. 몬스터/종족 시스템 (`monster_species_system.md`)
- 10종족 특성 (면역, 피해배율, 특수효과)
- 몬스터 프로필 생성 과정
- 몬스터 전투 테이블
- 몬스터 AI
- 종 조합 규칙

---

## 데이터 구조

### 메인 데이터 모델 (model.db)

```
model.db = {
  inventory       → 공용 인벤토리 { gold, bagId, items[], overflow[], recent[] }
  characters[]    → 캐릭터 목록
  monsters[]      → 몬스터 목록
  personas[]      → 페르소나 목록
  customSkills[]  → 커스텀 스킬 목록
  rareMaterialPack    → 희귀 재료 팩
  rareMaterialCatalog → 희귀 재료 카탈로그
  normalMaterialCatalog → 일반 재료 카탈로그
  equipments[]    → 장비 목록
  auctionListings[]   → 경매장 목록
  hmUsedListings[]    → 헌터마켓 중고장비 목록
  team[]          → 팀 구성 [{ charId, ratio }]
  guildId         → 소속 길드
  incomeLog[]     → 수입 기록
  guildTaxLog[]   → 길드 세금 기록
  battleSetup     → 전투 편성 { partySlots[8], enemySlots[10] }
}
```

### 게임 상태 (model.state)

```
model.state = {
  visible     → UI 표시 여부
  view        → 현재 화면 ('hub', 'gate', 'battle', 'party', 'character', 'db', ...)
  runtime     → 전투 진행 상태
  gate        → 게이트 진행 상태
  ...UI 상태 필드들
}
```

---

## 허브 (메인 화면) 구성

| 카드 | 아이콘 | 설명 |
|------|-------|------|
| **게이트** | ⚔️ | 소형/중형/대형 게이트 생성·선택·진행 |
| **전투** | 🗡️ | 파티/적 편성, 수동 행동 선택 |
| **파티** | 👥 | 파티 편성, 스탯포인트 배분 |
| **캐릭터** | 🧑 | 페르소나 관리, 장비, 스킬 |
| **공용인벤** | 🎒 | 공용 인벤토리, 가방, 무게 |
| **DB** | 🗂️ | 캐릭터/몬스터/스킬 직접 편집 |
| **협회** | 🏛️ | 게이트 정산, 경매장, 브리핑 |
| **상점** | 🛒 | 편의점, 백화점, 헌터거리 |
| **집** | 🏠 | 주거 매물 (구매/임대) |
| **길드** | ⚜️ | 길드 정보, 소속 헌터, 임무 |

---

## 등급 체계

게임 전반에서 사용되는 등급:

```
E → D → C → B → A → S
```

등급은 다음에 영향:
- 헌터 스탯 상한 (E:25 ~ S:150)
- 게이트 난이도/보상
- 장비 기본 스탯/가격
- 몬스터 전투력
- 마정석/재료 가치
- 스킬 계수/비용
