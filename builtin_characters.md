# Hunter World — 캐릭터 비교 분석 (로어북 vs 코드)

> GateBattle_v5_9.js `buildSampleCharacters()` 기준 — 코드 구현 34명 / 로어북 전투 캐릭터 41명

---

## 📊 분석 요약

### 전체 현황
- **코드 구현 캐릭터**: 34명 (본대 16명 + 고랭크 NPC 12명 + 적대 NPC 7명 [신우현 포함])
- **로어북 전투 캐릭터**: 41명 (아군 34명 + 적대 7명)
- **미구현 캐릭터**: 7명 (민채린, 유선화, 주아람, 진소희, 최태준, 최태현, 리베아)

### 주요 불일치 사항

| 구분 | 내용 |
|------|------|
| 포지션 불일치 | 한아람: 로어북 "Melee Dealer/Porter" → 코드 "비전투" |
| 스킬 과다 구현 | 안도현(1→4), 강유라(2→4), 이사벨(2→5), 유진성(2→4), 최민준(1→6), 서지한(2→6), 한서연(1→5), 채하윤(1→4), 나선영(2→4), 김민수(1→3), 제이크(1→4), 유진혁(2→4) 등 |
| 스킬 미구현 | 권도윤: "Coin Transaction" 로어북에 있으나 코드 미구현 |
| 범용 스킬 오분류 | fistStrike(정권)는 한아람 전용이나 범용 스킬로 등록 |
| 직업명 차이 | 사사키 유아 코드 "저승무사" vs 로어북 "Underworld Samurai", 하월영 코드 "검사" vs 로어북 "Sword Master" 등 |

---

## 🔵 본대 캐릭터 (§2–§16)

---

### §2 최유나 (Choi Yu-na)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | E | E | ✅ 일치 |
| 포지션 | 전열탱커 | Tanker | ✅ 일치 |
| 직업 | 무직업 | Classless | ✅ 일치 |
| 레벨 | 6 | - | - |

**스탯**: STR 12 / CON 19 / INT 3 / AGI 14 / SEN 15

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| steelAnvil (강철 모루) | Steel Anvil | ✅ 일치 |
| shieldProficiency (방패숙련) | Shield Proficiency | ✅ 일치 |
| daggerHandling (단검숙련) | Dagger Handling | ✅ 일치 |

📋 **비고**: 완전 일치.

---

### §3 오하나 (Oh Ha-na)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | E | E | ✅ 일치 |
| 포지션 | 원거리물리(mid) | Dealer(투척가) | ✅ 일치 |
| 직업 | 투척가 | 투척가 | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| quickThrow (퀵 스로우) | Quick Throw | ✅ 일치 |
| knifeRecall (나이프 리콜) | Basic Knife Recall | ✅ 일치 |
| preciseAim (정밀 조준) | Precise Aim | ✅ 일치 |

📋 **비고**: 완전 일치.

---

### §4 안도현 (An Do-hyun)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | E | E | ✅ 일치 |
| 포지션 | 비전투(back) | Support(Utility/Repair) | ✅ 일치 |
| 직업 | 수리가 | Classless | ⚠️ 불일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| exceptionalDexterity (탁월한 손재주) | Exceptional Dexterity (Passive) | ✅ 일치 |
| fieldMaintenance (현장 정비) | - | ❌ 코드 전용 (필러) |
| quickRepair (긴급 수리) | - | ❌ 코드 전용 (필러) |
| fieldAidSupport (현장 응급 지원) | - | ❌ 코드 전용 (필러) |

📋 **비고**: 로어북은 스킬 1개만 명시. 코드가 3개의 필러 스킬을 추가. 직업명도 로어북 "Classless" vs 코드 "수리가"로 차이.

---

### §5 송하늘 (Song Ha-neul)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | E | E | ✅ 일치 |
| 포지션 | 원거리물리(back) | Dealer(Archer) | ✅ 일치 |
| 직업 | 궁수 | Archer | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| powerShot (파워 샷) | Power Shot | ✅ 일치 |
| quickShot (퀵 샷) | Quick Shot | ✅ 일치 |
| fullArrowRecovery (전탄회수) | Full Arrow Recovery | ✅ 일치 |
| tripleShot (트리플 샷) | Triple Shot | ✅ 일치 |

📋 **비고**: 완전 일치.

---

### §6 김민수 (Kim Min-su)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | E | E | ✅ 일치 |
| 포지션 | 전열탱커 | Tanker(Classless) | ✅ 일치 |
| 직업 | 무직업 | Classless | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| spotlight (이목집중) | Spotlight/이목집중 (Rare) | ✅ 일치 |
| shieldBash (쉴드 배쉬) | - | ❌ 코드 전용 (필러) |
| taunt (도발) | - | ❌ 코드 전용 (필러) |

📋 **비고**: 로어북은 Spotlight 1개만 명시. shieldBash, taunt는 코드 필러 스킬.

---

### §7 이하은 (Lee Ha-eun)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | D | D | ✅ 일치 |
| 포지션 | 힐러(back) | Supporter(Healer) | ✅ 일치 |
| 직업 | 클레릭 | Cleric | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| pray (기도) | Pray | ✅ 일치 |
| blessingOfLight (빛의 축복) | Blessing of Light | ✅ 일치 |
| smallGarden (작은 정원) | Small Garden | ✅ 일치 |

📋 **비고**: 완전 일치.

---

### §8 이사벨 헤이즈 (Isabel Hayes)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | D | D | ✅ 일치 |
| 포지션 | 전열탱커 | Tanker | ✅ 일치 |
| 직업 | 크루세이더 | Crusader | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| holdTheLine (전선 사수) | - | ❌ 코드 확장 (신앙 기반 신성 에너지) |
| holyProvocation (신성 도발) | - | ❌ 코드 확장 (신앙 기반 신성 에너지) |
| divineProtection (신성 보호막) | - | ❌ 코드 확장 (신앙 기반 신성 에너지) |
| holyLight (성스러운 빛) | - | ❌ 코드 확장 (신앙 기반 신성 에너지) |
| fragmentOfAthena (아테나의 파편) | Fragment of Athena (Unique, 잠재) | ✅ 일치 |

📋 **비고**: 로어북은 "신앙 기반 신성 에너지"와 fragmentOfAthena만 명시. holdTheLine, holyProvocation, divineProtection, holyLight는 코드에서 신성 에너지를 구체화한 확장 스킬.

---

### §9 최민준 (Choi Min-jun)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | C | C | ✅ 일치 |
| 포지션 | 전열탱커 | Tanker | ✅ 일치 |
| 직업 | 백부장 | Centurion/백부장(Hidden) | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| fightingSpiritBoost (투지 강화) | Fighting Spirit Enhancement | ✅ 일치 |
| formationCommand (대열 지휘) | - | ❌ 코드 전용 (필러) |
| moraleManagement (사기 관리) | - | ❌ 코드 전용 (필러) |
| shieldSmash (쉴드 스매쉬) | - | ❌ 코드 전용 (필러) |
| battleCry (전투 함성) | - | ❌ 코드 전용 (필러) |
| charge (돌격) | - | ❌ 코드 전용 (필러) |

📋 **비고**: 로어북은 Fighting Spirit Enhancement 1개만 명시. 코드가 5개의 필러 스킬을 대량 추가 (1→6).

---

### §10 서지한 (Seo Ji-han)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | C | C | ✅ 일치 |
| 포지션 | 후열서포터 | Supporter(버프/힐) | ✅ 일치 |
| 직업 | 무직업 | Classless | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| heal (힐) | C랭크 버프/힐 | ⚠️ 범용 스킬로 힐 역할 구현 |
| haste (헤이스트) | C랭크 버프/힐 | ⚠️ 범용 스킬로 버프 역할 구현 |
| blessingOfLight (빛의 축복) | C랭크 버프/힐 | ⚠️ 범용 스킬로 버프 역할 구현 |
| energyBolt (에너지 볼트) | - | ❌ 코드 전용 (필러) |
| vampiricInstinct (흡혈 본능) | 뱀파이어 변이 저주 | ✅ 일치 (저주 구현) |
| bloodSense (혈액 감지) | 뱀파이어 변이 저주 | ✅ 일치 (저주 구현) |

📋 **비고**: heal, haste, blessingOfLight, energyBolt는 "C랭크 버프/힐" 역할을 위한 범용 필러. vampiricInstinct, bloodSense는 뱀파이어 저주 설정과 일치.

---

### §11 박소원 (Park So-won)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | C | C | ✅ 일치 |
| 포지션 | 후열서포터 | Supporter | ✅ 일치 |
| 직업 | 연금술사 | Alchemist | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| potionCraft (포션 제조) | Potion Crafting | ✅ 일치 |
| potionToss (포션 투척) | Potion Toss | ✅ 일치 |
| materialAnalysis (소재 분석) | Material Analysis | ✅ 일치 |
| energyShower (에너지 샤워) | - | ❌ 코드 전용 (필러) |

📋 **비고**: 로어북 3개 스킬 완전 일치. energyShower 1개만 필러.

---

### §12 강유라 (Kang Yu-ra)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | C | C | ✅ 일치 |
| 포지션 | 근거리물리(front) | Striker | ✅ 일치 |
| 직업 | 스트라이커 | Striker | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| bodyReinforce (바디 강화) | 기본 바디 강화 패시브 | ✅ 일치 |
| crushingKick (분쇄 킥) | 근접 킥/타격 | ✅ 일치 |
| spinSweep (회전 쓸기) | - | ❌ 코드 확장 |
| vitalStrike (급소 타격) | - | ❌ 코드 확장 |

📋 **비고**: bodyReinforce, crushingKick은 로어북과 일치. spinSweep, vitalStrike는 코드 확장 스킬.

---

### §13 한서연 (Han Seo-yeon)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | B | B | ✅ 일치 |
| 포지션 | 원거리마법(back) | Dealer(Mage) | ✅ 일치 |
| 직업 | 마법사 | Fire Mage | ⚠️ 부분 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| flameLance (화염창) | B랭크 화염 마법 | ⚠️ 코드 구체화 |
| meteorBarrage (유성 난사) | B랭크 화염 마법 | ⚠️ 코드 구체화 |
| flameWall (화염벽) | B랭크 화염 마법 | ⚠️ 코드 구체화 |
| manaFocus (마나 집중) | B랭크 화염 마법 | ⚠️ 코드 구체화 |
| energyBolt (에너지 볼트) | - | ❌ 코드 전용 (필러) |

📋 **비고**: 로어북은 "B랭크 화염 마법"으로만 명시. 코드가 5개의 구체적 스킬로 확장. 모두 코드에서 생성.

---

### §14 하루 이토 (Haru Ito)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | B | B | ✅ 일치 |
| 포지션 | 중열딜러(mid) | Dealer/Supporter | ✅ 일치 |
| 직업 | 정령술사 | Elementalist/정령술사 | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| summonZephyr (제퍼 소환) | Spirits: Zephyr | ✅ 일치 |
| summonBark (바크 소환) | Spirits: Bark | ✅ 일치 |
| galeStrike (돌풍 타격) | Wind 속성 | ✅ 일치 (바람 계열) |
| rootBind (뿌리 속박) | Earth 속성 | ✅ 일치 (대지 계열) |
| earthHeal (대지 치유) | Plant 속성 | ✅ 일치 (식물 계열) |
| terrainShift (지형 변환) | - | ❌ 코드 확장 |

📋 **비고**: 대부분 잘 매칭. summonZephyr/summonBark는 정령과 일치, galeStrike/rootBind/earthHeal은 Wind-Earth-Plant 속성 구현. terrainShift만 코드 확장.

---

### §15 유진성 (Yoo Jin-seong)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | D | D | ✅ 일치 |
| 포지션 | 비전투(back) | 비전투(대장장이) | ✅ 일치 |
| 직업 | 대장장이 | 대장장이 | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| equipmentCraft (장비 제작) | Equipment Crafting | ✅ 일치 |
| appraisal (감정) | Appraisal | ✅ 일치 |
| battlefieldRepair (전장 수리) | - | ❌ 코드 전용 (필러) |
| firepowerTuning (화력 조율) | - | ❌ 코드 전용 (필러) |

📋 **비고**: 로어북 2개 스킬 일치. battlefieldRepair, firepowerTuning은 코드 필러.

---

### §16 한아람 (Han A-ram)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | E | E | ✅ 일치 |
| 포지션 | 비전투(front) | Melee Dealer/Porter | ❌ 불일치 |
| 직업 | 무직업 | Classless | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| hiddenMight (이면의 완력) | Latent Strength/이면의 완력 (Rare, Passive) | ✅ 일치 |
| cargoSupport (짐 운반 보조) | - | ❌ 코드 전용 (필러) |
| emergencyDodge (긴급 회피) | - | ❌ 코드 전용 (필러) |
| *(범용 스킬)* fistStrike (정권) | 정권(E) | ⚠️ 범용 스킬로 오분류 |

📋 **비고**: **주요 불일치** — 로어북은 "Melee Dealer/Porter"이나 코드는 "비전투"로 포지션이 다름. fistStrike(정권)는 한아람 전용 스킬이나 범용 스킬로 등록되어 캐릭터 스킬 목록에 없음 — 전투 시 한아람이 정권을 사용할 수 없는 문제 발생 가능. cargoSupport, emergencyDodge는 필러.

---

## 🟡 부록 A: 고랭크 NPC

---

### 강민혁 (Kang Min-hyuk)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | A | A | ✅ 일치 |
| 포지션 | 전열딜러 | Dealer(중거리 검사) | ✅ 일치 |
| 직업 | 검사 | Swordsman | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| auraMastery (오라 마스터리) | Aura Mastery (Passive/Unique) | ✅ 일치 |
| shadowDraw (그림자 발도) | Shadow Draw (시그니처) | ✅ 일치 |
| auraSlash (오라 베기) | - | ❌ 코드 확장 |
| auraArc (오라 아크) | - | ❌ 코드 확장 |

📋 **비고**: 핵심 2개 스킬 일치. auraSlash, auraArc는 코드 확장. 로어북 장비 Eclipse Blade(Unique)는 코드 미구현.

---

### 강우석 (Kang Woo-seok)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | A | A | ✅ 일치 |
| 포지션 | 전열탱커 | Tanker | ✅ 일치 |
| 직업 | 탱커 | Tanker | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| impactReduction (충격 감소) | Impact Reduction | ✅ 일치 |
| defensiveStance (방어 태세) | Defensive Stance | ✅ 일치 |
| tauntA (도발) | Taunt | ✅ 일치 |
| chargeA (돌격) | Charge | ✅ 일치 |
| shieldMastery (방패 마스터리) | Shield Mastery | ✅ 일치 |
| conBoost (CON 부스트) | CON Boost | ✅ 일치 |
| staminaRecovery (체력 회복) | Stamina Recovery | ✅ 일치 |
| senBoost (SEN 부스트) | SEN Boost | ✅ 일치 |

📋 **비고**: 완전 일치. 8개 스킬 모두 매칭.

---

### 사사키 유아 (Sasaki Yua)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | A | A | ✅ 일치 |
| 포지션 | 전열딜러 | Dealer/Tank | ✅ 일치 |
| 직업 | 저승무사 | Underworld Samurai(Hidden) | ⚠️ 의미 일치, 표기 차이 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| spiritArmor (영혼 갑옷) | Spirit Armor | ✅ 일치 |
| weaponManifestation (무기 현현) | Weapon Manifestation | ✅ 일치 |
| crescentSlash (초승달 베기) | - | ❌ 코드 확장 |
| spiritSever (영혼 절단) | - | ❌ 코드 확장 |

📋 **비고**: 핵심 2개 일치. crescentSlash, spiritSever는 코드 확장. 직업명: 코드 "저승무사" vs 로어북 "Underworld Samurai".

---

### 임설희 (Im Seol-hee)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | A | A | ✅ 일치 |
| 포지션 | 원거리마법 | Dealer(Mage) | ✅ 일치 |
| 직업 | 마법사 | Classless | ⚠️ 코드 "마법사" vs 로어북 "Classless" |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| iceMaker (아이스 메이커) | Ice Maker (Unique) | ✅ 일치 |
| icicleLance (아이시클 랜스) | Icicle Lances | ✅ 일치 |
| frostFlower (서리꽃) | Frost Flowers | ✅ 일치 |
| stairAndSlide (계단과 미끄럼틀) | Stair & Slide | ✅ 일치 |

📋 **비고**: 스킬 완전 일치. 직업명만 코드 "마법사" vs 로어북 "Classless"로 차이.

---

### 백휘성 (Baek Hwi-seong)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | S | S | ✅ 일치 |
| 포지션 | 원거리마법 | Dealer | ✅ 일치 |
| 직업 | 마법사 | Herald of Helios(Hidden) | ⚠️ 코드 "마법사" vs 로어북 Hidden 직업 미반영 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| auraOfJudge (심판의 오라) | Aura of the Judge | ✅ 일치 |
| heliosNova (헬리오스 노바) | Helios Nova | ✅ 일치 |
| shacklesOfRadiance (광휘의 족쇄) | Shackles of Radiance | ✅ 일치 |

📋 **비고**: 스킬 완전 일치. 직업: 코드 "마법사" vs 로어북 "Herald of Helios(Hidden)" — Hidden 직업 미반영.

---

### 한지원 (Han Ji-won)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | S | S | ✅ 일치 |
| 포지션 | 후열서포터 | Support Specialist | ✅ 일치 |
| 직업 | 서포터 | Classless | ⚠️ 코드 "서포터" vs 로어북 "Classless" |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| trueGaze (진실의 시선) | True Gaze (Unique) | ✅ 일치 |
| barrierManipulation (결계 조작) | Barrier Manipulation | ✅ 일치 |
| healingMagic (치유 마법) | Healing Magic | ✅ 일치 |

📋 **비고**: 스킬 완전 일치.

---

### 박준호 (Park Jun-ho)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | S | S | ✅ 일치 |
| 포지션 | 전열탱커 | Tanker | ✅ 일치 |
| 직업 | 탱커 | Byeogun Gapju(Hidden) | ⚠️ Hidden 직업 미반영 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| byeokryeokjang (벽력장) | Byeokryeokjang | ✅ 일치 |
| uraegyeok (우뢰격) | Uraegyeok | ✅ 일치 |

📋 **비고**: 스킬 완전 일치.

---

### 하월영 (Ha Wol-yeong)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | S | S | ✅ 일치 |
| 포지션 | 전열딜러 | Tanker→솔로 검사 | ✅ 일치 |
| 직업 | 검사 | Sword Master | ⚠️ 코드 "검사" vs 로어북 "Sword Master" |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| shunpo (순보) | Shunpo | ✅ 일치 |
| wolseomTriple (월섬 트리플) | Wolseom | ✅ 일치 (코드명 wolseomTriple) |
| parry (패리) | Parry | ✅ 일치 |
| insight (통찰) | Insight | ✅ 일치 |

�� **비고**: 스킬 완전 일치. 코드에서 wolseomTriple로 명명 vs 로어북 "Wolseom". 직업: 코드 "검사" vs 로어북 "Sword Master".

---

### 앨리스 크로프트 (Alice Croft)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | A | A | ✅ 일치 |
| 포지션 | 후열서포터 | Supporter | ✅ 일치 |
| 직업 | 서포터 | Successor of Chronos(Hidden) | ⚠️ Hidden 직업 미반영 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| slowTime (슬로우 타임) | Slow Time | ✅ 일치 |
| hasteTime (헤이스트 타임) | Haste Time | ✅ 일치 |
| temporalSense (시간 감지) | 시간능력 감지 | ✅ 일치 |
| itemExtension (아이템 연장) | 소비아이템 연장 | ✅ 일치 |

📋 **비고**: 스킬 완전 일치.

---

### 이지혜 (Lee Ji-hye)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | A | A | ✅ 일치 |
| 포지션 | 원거리마법 | Dealer/Summoner | ✅ 일치 |
| 직업 | 소환사 | Nyx(Hidden) | ⚠️ 코드 "소환사" vs 로어북 "Nyx(Hidden)" |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| reverseSummon (역소환) | Reverse Summon | ✅ 일치 |
| nightsVeil (밤의 장막) | Night's Veil | ✅ 일치 |
| sharedLethargy (공유 무기력) | Shared Lethargy | ✅ 일치 |

📋 **비고**: 스킬 완전 일치.

---

### 임진태 (Im Jin-tae)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | S | S | ✅ 일치 |
| 포지션 | 전열딜러 | Dealer/Bruiser | ✅ 일치 |
| 직업 | 딜러 | Werewolf(Hidden) | ⚠️ 코드 "딜러" vs 로어북 "Werewolf(Hidden)" |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| partialTransform (부분 변신) | 부분/완전 늑대 변신 | ✅ 일치 |
| fullTransform (완전 변신) | 부분/완전 늑대 변신 | ✅ 일치 |
| gluttonousInstinct (탐식 본능) | Gluttonous Instinct | ✅ 일치 |

📋 **비고**: 스킬 완전 일치.

---

### 제이크 밀러 (Jake Miller)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | S | S | ✅ 일치 |
| 포지션 | 근거리물리 | Dealer(맨손 격투) | ✅ 일치 |
| 직업 | 무투가 | Martial Artist | ✅ 일치 |
| 레벨 | 92 | 85 | ⚠️ 불일치 (코드 92 vs 로어북 85) |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| devastatingBlow (파괴적 일격) | 마스터급 맨손 격투 | ⚠️ 코드 구체화 |
| quakeStrike (지진 타격) | 마스터급 맨손 격투 | ⚠️ 코드 구체화 |
| martialAwakening (무술 각성) | 마스터급 맨손 격투 | ⚠️ 코드 구체화 |
| instinctRead (본능 판독) | 마스터급 맨손 격투 | ⚠️ 코드 구체화 |

�� **비고**: 로어북은 "마스터급 맨손 격투"로만 명시. 코드가 4개의 구체적 스킬로 확장. 레벨도 코드 92 vs 로어북 85로 불일치 — 로어북 기준이 원작 설정이므로 코드 레벨 조정 검토 필요.

---

## 🔴 부록 B: 적대 NPC

---

### 강태식 (Kang Tae-sik)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | C | C(위장 D/E) | ✅ 일치 |
| 포지션 | 중열딜러 | Rogue | ✅ 일치 |
| 직업 | 무직업 | Rogue | ⚠️ 코드 "무직업" vs 로어북 "Rogue" |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| stealth (은신) | Stealth | ✅ 일치 |
| ambush (기습) | Ambush | ✅ 일치 |
| poisonBlade (독날) | Poison | ✅ 일치 (독 계열 매칭) |
| escape (탈출) | Evasion | ⚠️ 유사 (escape ≈ Evasion) |
| - | Lockpicking | ❌ 코드 미구현 |

📋 **비고**: stealth, ambush 일치. poisonBlade ≈ Poison, escape ≈ Evasion 유사 매칭. Lockpicking은 코드 미구현.

---

### 권도윤 (Kwon Do-yun)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | B | B | ✅ 일치 |
| 포지션 | 중열딜러 | 블랙마켓 간부 | ✅ 일치 |
| 직업 | 무직업 | 블랙마켓 간부 | ⚠️ 불일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| suggestion (암시) | Suggestion | ✅ 일치 |
| phantomStep (환영 보법) | Phantom Step | ✅ 일치 |
| knifeStrike (나이프 스트라이크) | - | ❌ 코드 전용 (Coin Transaction 대체) |
| - | Coin Transaction | ❌ 코드 미구현 |

📋 **비고**: suggestion, phantomStep 일치. 로어북의 Coin Transaction이 코드에서 knifeStrike로 대체됨 — **스킬 미구현 사항**.

---

### 유진혁 (Yoo Jin-hyuk)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | A | 전 A→S추정 | ✅ 일치 |
| 포지션 | 전열딜러 | Dealer(근접/스텔스) | ✅ 일치 |
| 직업 | 딜러 | Creature of Erebus(Hidden) | ⚠️ Hidden 직업 미반영 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| darknessManipulation (어둠 조작) | Darkness Manipulation | ✅ 일치 |
| shadowMeld (그림자 융합) | Shadow Meld | ✅ 일치 |
| abyssalBlade (심연의 검) | - | ❌ 코드 확장 |
| erebosCloak (에레보스 망토) | - | ❌ 코드 확장 |

📋 **비고**: 핵심 2개 일치. abyssalBlade, erebosCloak는 코드 확장. Hidden 직업 미반영.

---

### 장은서 (Jang Eun-seo)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | A | 비등록 | ⚠️ 코드는 A, 로어북은 비등록 |
| 포지션 | 중열딜러 | 상태창 불신론자 리더 | ✅ 일치 |
| 직업 | 무직업 | 비등록 | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| curseImmunity (저주 면역) | 저주 아이템 면역 | ✅ 일치 |
| bloodletterDagger (혈서의 단검) | Bloodletter Dagger (장비) | ⚠️ 로어북에서는 장비로 분류 |
| shroudOfNonexistence (비존재의 장막) | Shroud of Non-existence (장비) | ⚠️ 로어북에서는 장비로 분류 |

📋 **비고**: curseImmunity 일치. bloodletterDagger, shroudOfNonexistence는 로어북에서 장비(Equipment)로 분류되나 코드에서 스킬로 처리됨 — **장비/스킬 분류 불일치**. 장비 시스템 구현 시 스킬에서 장비로 이전 필요.

---

### 신우현 (Shin Woo-hyun)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | E | 비각성자 | ✅ 일치 (비각성자 ≈ E) |
| 포지션 | 후열서포터 | 이계숭배단 | ✅ 일치 |
| 직업 | 무직업 | 이계숭배단 | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| corruptedResonance (오염된 공명) | Corrupted Resonance | ✅ 일치 |
| monsterKinship (몬스터 교감) | Monster Kinship | ✅ 일치 |
| corruptSpread (오염 확산) | - | ❌ 코드 확장 |

📋 **비고**: 핵심 2개 일치. corruptSpread는 코드 확장.

---

### 나선영 (Na Seon-yeong)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | A | A+추정 | ✅ 일치 |
| 포지션 | 원거리마법 | 이계숭배단 | ✅ 일치 |
| 직업 | 무직업 | 이계숭배단 | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| whisperOfFear (공포의 속삭임) | 저주 사용 | ✅ 일치 (저주 계열) |
| corrosiveMist (부식 안개) | DoT | ✅ 일치 (DoT 구현) |
| manaSight (마나 시야) | 마나 감지 | ✅ 일치 |
| fearInfusion (공포 주입) | 감정 감지 | ⚠️ 유사 매칭 |

📋 **비고**: manaSight ≈ 마나 감지 일치. whisperOfFear/corrosiveMist는 저주/DoT 구현. fearInfusion은 감정 감지와 유사 매칭. 로어북 대비 코드 확장 (2→4).

---

### 채하윤 (Chae Ha-yun)

| 항목 | 코드 | 로어북 | 비교 |
|------|------|--------|------|
| 등급 | C | 전 E rank | ⚠️ 코드 C vs 로어북 전 E |
| 포지션 | 원거리마법 | 상태창 불신론자 부사령관 | ✅ 일치 |
| 직업 | 무직업 | 무직업 | ✅ 일치 |
| 레벨 | - | - | - |

**스킬 비교**:

| 코드 스킬 | 로어북 스킬 | 상태 |
|-----------|------------|------|
| manaBullet (마나 탄환) | Mana Bullet (Rare) | ✅ 일치 |
| piercingRound (관통탄) | - | ❌ 코드 확장 (마나탄환 변형) |
| explosiveRound (폭발탄) | - | ❌ 코드 확장 (마나탄환 변형) |
| homingRound (유도탄) | - | ❌ 코드 확장 (마나탄환 변형) |

📋 **비고**: manaBullet만 일치. piercingRound, explosiveRound, homingRound는 마나탄환의 코드 변형 확장 (1→4).

---

## 🚫 미구현 캐릭터 (로어북에는 있으나 코드 미구현)

| 이름 | 등급 | 역할 | 직업 | 로어북 스킬 | 비고 |
|------|------|------|------|------------|------|
| 민채린 (Min Chae-rin) | B | Dealer/Assassin | Shadow Hunter | 어둠 은신, 그림자 기습 | Shadow Hunter Kit |
| 유선화 (Yoo Sun-hwa) | A | Tank/Dealer | 회피형 격투가 | Quick Step, Counter, Fighting Spirit Boost | 회피형 격투가 |
| 주아람 (Joo Ah-ram) | B | 전략가/후방 | Classless | Red Thread/홍선 (Unique) | 전략 특화 |
| 진소희 (Jin So-hee) | A | Dealer/Supporter | Classless | Exorcism Talisman/퇴마부 (Unique) — 폭파부/전격부/속박부/결계부 | 퇴마 계열 |
| 최태준 (Choi Tae-joon) | A | 전략/커맨더 | Commander | 유틸리티/버프 킷, Equipment: Dimension Ring (Unique) | 커맨더 |
| 최태현 (Choi Tae-hyun) | B | Dealer(근접) | Classless | Soul Hold/소울 홀드 (Unique) | 근접 딜러 |
| 리베아 (Rivea) | D | Forgotten Divinity (Hidden) | Hidden | Mana Drain, Lord of Adversity | 숨겨진 직업 |

---
