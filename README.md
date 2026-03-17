# Hunter World — 게이트 전투 시뮬레이션 플러그인 (v7.4.0)

> **GateBattle_v7_3.js** 기반 — [RisuAI](https://risuai.net) 플러그인

Hunter World는 RisuAI에서 동작하는 게이트 전투 시뮬레이션 게임 플러그인입니다.
캐릭터, 스킬, 장비, 몬스터 등을 직접 설계하고 전투를 시뮬레이션할 수 있습니다.

---

## 주요 기능

- **전투 시뮬레이션**: 턴제 전투, 속성 상성, 상태이상, CC, 열(row) 시스템
- **캐릭터 / 페르소나**: DB에서 캐릭터와 페르소나를 관리하고 파티 슬롯에 편성
- **스킬 시스템**: 153+ 내장 스킬, 커스텀 스킬 생성, JSON 가져오기/내보내기
- **장비 / 인벤토리**: 무기·방어구·보조무기·악세서리, 강화, 특성주입(인퓨즈), 내구도
- **희귀도(Rarity)**: Normal(흰색), Rare(파랑), Unique(분홍), Legendary(진한 노랑) — 장비·스킬 공통
  - 장비 희귀도 자동 판정: 무기/방어구는 특성 유무, 보조무기/악세서리는 내장 특성 티어 기준
  - Unique/Legendary 아이템은 상점·경매장·헌터마켓에 자동 노출되지 않음 (DB 수동 등록만 가능)
- **특수효과(Special Effect)**: 장비·스킬에 버프(아군 강화) 또는 디버프(적 받는 피해 증가) 효과 부여
- **은신(Stealth)**: 버프 스킬로 유닛을 타겟 불가 상태로 만듦 (보스 광역은 무시, 공격 시 해제)
- **몬스터 / 종족**: 10종족 특성, 등급별 전투 테이블, 결정론적 프로필 생성
- **경제 시스템**: 마정석 시세, 경매장, 헌터마켓, 블랙마켓, 세금, 정산
- **DB 관리 UI**: 캐릭터·스킬·장비·몬스터 에디터, "새 항목" 버튼으로 선택 해제 및 필드 초기화

---

## 문서 목록

| 파일 | 설명 |
|------|------|
| `builtin_characters.md` | 전체 캐릭터 목록 (41명) |
| `builtin_skills.md` | 전체 스킬 목록 (153종) |
| `how_to_create_skills.md` | 스킬 만드는 법 가이드 |
| `how_to_create_characters.md` | 캐릭터 만드는 법 가이드 |
| `combat_formulas.txt` | 전투 공식 정리 |
| `skill_system.txt` | 스킬 시스템 상세 |
| `character_party_system.txt` | 캐릭터 / 파티 시스템 |
| `economy_system.txt` | 경제 시스템 |
| `equipment_inventory_system.txt` | 장비 / 인벤토리 시스템 |
| `monster_species_system.txt` | 몬스터 / 종족 시스템 |

---

## 데이터 파일

| 파일 | 설명 |
|------|------|
| `builtin_skills.json` | 내장 스킬 원본 데이터 |
| `builtin_skills_export.json` | 내장 스킬 내보내기용 |
| `monster_pack_full_core_import.json` | 몬스터 팩 데이터 |
| `normal_material_catalog_core.json` | 일반 재료 카탈로그 |
| `rare_material_catalog_core.json` | 희귀 재료 카탈로그 |