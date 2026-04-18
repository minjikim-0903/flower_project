-- ============================================
-- 🌸 꽃 도감 (Flower Dictionary) DB Schema
-- Supabase (PostgreSQL)
-- ============================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. flowers (꽃 기본 정보)
-- ============================================
CREATE TABLE flowers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ko TEXT NOT NULL,                          -- 한글 이름 (작약)
  name_en TEXT NOT NULL,                          -- 영문 이름 (Peony)
  name_scientific TEXT,                           -- 학명 (Paeonia lactiflora)
  nickname TEXT,                                  -- 별명 (함박꽃, 설중의 꽃)
  slug TEXT NOT NULL UNIQUE,                      -- URL 슬러그 (peony)
  thumbnail_url TEXT,                             -- 대표 이미지 URL
  description TEXT,                               -- 한 줄 소개 (감성적)
  story TEXT,                                     -- 이야기/전설/유래
  vase_life_days INT,                             -- 꽃병 수명 (일)
  care_tip TEXT,                                  -- 관리 팁 텍스트
  price_range TEXT CHECK (price_range IN ('low', 'mid', 'high', 'premium')),
  is_popular BOOLEAN DEFAULT false,               -- 인기 꽃 여부
  is_published BOOLEAN DEFAULT false,             -- 공개 여부
  display_order INT DEFAULT 0,                    -- 정렬 순서
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_flowers_slug ON flowers (slug);
CREATE INDEX idx_flowers_is_published ON flowers (is_published);
CREATE INDEX idx_flowers_is_popular ON flowers (is_popular);
CREATE INDEX idx_flowers_display_order ON flowers (display_order);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_flowers_updated_at
  BEFORE UPDATE ON flowers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 2. flower_images (꽃 이미지 - 1:N)
-- ============================================
CREATE TABLE flower_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flower_id UUID NOT NULL REFERENCES flowers(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,                                  -- 대체 텍스트
  is_primary BOOLEAN DEFAULT false,               -- 대표 이미지 여부
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_flower_images_flower_id ON flower_images (flower_id);

-- ============================================
-- 3. flower_meanings (꽃말 - 색상별, 1:N)
-- ============================================
CREATE TABLE flower_meanings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flower_id UUID NOT NULL REFERENCES flowers(id) ON DELETE CASCADE,
  color TEXT NOT NULL,                            -- 색상 이름 (핑크)
  color_hex TEXT,                                 -- 색상 코드 (#FFB6C1)
  meaning TEXT NOT NULL,                          -- 꽃말 (순수함, 사랑의 맹세)
  description TEXT,                               -- 꽃말 설명
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_flower_meanings_flower_id ON flower_meanings (flower_id);

-- ============================================
-- 4. flower_seasons (계절 시기 - 1:N)
-- ============================================
CREATE TYPE season_enum AS ENUM ('spring', 'summer', 'autumn', 'winter');

CREATE TABLE flower_seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flower_id UUID NOT NULL REFERENCES flowers(id) ON DELETE CASCADE,
  season season_enum NOT NULL,
  month_start INT NOT NULL CHECK (month_start BETWEEN 1 AND 12),
  month_end INT NOT NULL CHECK (month_end BETWEEN 1 AND 12),
  note TEXT,                                      -- "5월이 가장 활성해요"
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_flower_seasons_flower_id ON flower_seasons (flower_id);
CREATE INDEX idx_flower_seasons_months ON flower_seasons (month_start, month_end);

-- ============================================
-- 5. occasions (상황 마스터)
-- ============================================
CREATE TABLE occasions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                             -- 프로포즈
  slug TEXT NOT NULL UNIQUE,                      -- propose
  emoji TEXT,                                     -- 💍
  description TEXT,                               -- 상황 설명
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5-1. flower_occasions (꽃 ↔ 상황 매핑 - N:M)
CREATE TABLE flower_occasions (
  flower_id UUID NOT NULL REFERENCES flowers(id) ON DELETE CASCADE,
  occasion_id UUID NOT NULL REFERENCES occasions(id) ON DELETE CASCADE,
  PRIMARY KEY (flower_id, occasion_id)
);

CREATE INDEX idx_flower_occasions_occasion ON flower_occasions (occasion_id);

-- ============================================
-- 6. tags (태그 마스터)
-- ============================================
CREATE TYPE tag_category_enum AS ENUM ('season', 'color', 'mood', 'style');

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category tag_category_enum NOT NULL,
  name TEXT NOT NULL,                             -- 태그 이름
  slug TEXT NOT NULL UNIQUE,                      -- URL 슬러그
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tags_category ON tags (category);

-- 6-1. flower_tags (꽃 ↔ 태그 매핑 - N:M)
CREATE TABLE flower_tags (
  flower_id UUID NOT NULL REFERENCES flowers(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (flower_id, tag_id)
);

CREATE INDEX idx_flower_tags_tag ON flower_tags (tag_id);

-- ============================================
-- 7. flower_pairings (어울리는 조합 - N:M 자기참조)
-- ============================================
CREATE TABLE flower_pairings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flower_id UUID NOT NULL REFERENCES flowers(id) ON DELETE CASCADE,
  paired_flower_id UUID NOT NULL REFERENCES flowers(id) ON DELETE CASCADE,
  note TEXT,                                      -- "내추럴한 그린과 만나면 세련된 느낌"
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_pairing UNIQUE (flower_id, paired_flower_id),
  CONSTRAINT no_self_pairing CHECK (flower_id != paired_flower_id)
);

CREATE INDEX idx_flower_pairings_flower ON flower_pairings (flower_id);
CREATE INDEX idx_flower_pairings_paired ON flower_pairings (paired_flower_id);

-- ============================================
-- 8. RLS (Row Level Security) - Supabase
-- ============================================

-- 모든 테이블 RLS 활성화
ALTER TABLE flowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE flower_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE flower_meanings ENABLE ROW LEVEL SECURITY;
ALTER TABLE flower_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flower_occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE flower_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE flower_pairings ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (published 꽃만)
CREATE POLICY "flowers_public_read" ON flowers
  FOR SELECT USING (is_published = true);

CREATE POLICY "flower_images_public_read" ON flower_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM flowers WHERE flowers.id = flower_images.flower_id AND flowers.is_published = true)
  );

CREATE POLICY "flower_meanings_public_read" ON flower_meanings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM flowers WHERE flowers.id = flower_meanings.flower_id AND flowers.is_published = true)
  );

CREATE POLICY "flower_seasons_public_read" ON flower_seasons
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM flowers WHERE flowers.id = flower_seasons.flower_id AND flowers.is_published = true)
  );

CREATE POLICY "occasions_public_read" ON occasions
  FOR SELECT USING (true);

CREATE POLICY "flower_occasions_public_read" ON flower_occasions
  FOR SELECT USING (true);

CREATE POLICY "tags_public_read" ON tags
  FOR SELECT USING (true);

CREATE POLICY "flower_tags_public_read" ON flower_tags
  FOR SELECT USING (true);

CREATE POLICY "flower_pairings_public_read" ON flower_pairings
  FOR SELECT USING (true);

-- 관리자 쓰기 정책 (service_role 또는 admin 체크)
-- 실제 이용 시 auth.uid() 기반으로 admin 테이블 조인하거나
-- service_role key로 관리하세요
CREATE POLICY "flowers_admin_all" ON flowers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "flower_images_admin_all" ON flower_images
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "flower_meanings_admin_all" ON flower_meanings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "flower_seasons_admin_all" ON flower_seasons
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "occasions_admin_all" ON occasions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "flower_occasions_admin_all" ON flower_occasions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "tags_admin_all" ON tags
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "flower_tags_admin_all" ON flower_tags
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "flower_pairings_admin_all" ON flower_pairings
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 9. Views (자주 쓰는 조회용 뷰)
-- ============================================

-- 9-1. 꽃 상세 정보 뷰 (꽃말, 시즌 포함)
CREATE OR REPLACE VIEW v_flower_detail AS
SELECT
  f.*,
  -- 꽃말 배열
  COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'color', fm.color,
        'color_hex', fm.color_hex,
        'meaning', fm.meaning,
        'description', fm.description
      ) ORDER BY fm.sort_order
    ) FROM flower_meanings fm WHERE fm.flower_id = f.id),
    '[]'::jsonb
  ) AS meanings,
  -- 계절 시기 배열
  COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'season', fs.season,
        'month_start', fs.month_start,
        'month_end', fs.month_end,
        'note', fs.note
      )
    ) FROM flower_seasons fs WHERE fs.flower_id = f.id),
    '[]'::jsonb
  ) AS seasons,
  -- 이미지 배열
  COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'image_url', fi.image_url,
        'alt_text', fi.alt_text,
        'is_primary', fi.is_primary
      ) ORDER BY fi.sort_order
    ) FROM flower_images fi WHERE fi.flower_id = f.id),
    '[]'::jsonb
  ) AS images
FROM flowers f
WHERE f.is_published = true;

-- 9-2. 지금 제철인 꽃 뷰
CREATE OR REPLACE VIEW v_flowers_in_season AS
SELECT DISTINCT
  f.id,
  f.name_ko,
  f.name_en,
  f.slug,
  f.thumbnail_url,
  f.description,
  fs.season,
  fs.note AS season_note
FROM flowers f
JOIN flower_seasons fs ON fs.flower_id = f.id
WHERE f.is_published = true
  AND EXTRACT(MONTH FROM now()) BETWEEN fs.month_start AND fs.month_end;

-- ============================================
-- 10. 시드 데이터 — 상황 (occasions)
-- ============================================
INSERT INTO occasions (name, slug, emoji, description, sort_order) VALUES
  ('프로포즈',  'propose',      '💍', '함께 하고 싶은 마음을 전할 때',       1),
  ('웨딩',      'wedding',      '💐', '결혼식을 더 아름답게 장식할 때',       2),
  ('생일',      'birthday',     '🎂', '하나뿐인 고마운 사람에게',              3),
  ('졸업',      'graduation',   '🎓', '새로운 시작을 축하할 때',              4),
  ('감사',      'thanks',       '🙏', '고마운 마음을 꽃으로 전할 때',         5),
  ('위로',      'comfort',      '🤍', '힘든 시간을 보내는 사람에게',          6),
  ('기념일',    'anniversary',  '🥂', '함께한 시간을 기억할 때',              7),
  ('응원',      'cheer',        '✨', '도전하는 사람에게 힘을 줄 때',         8),
  ('개업/취직', 'celebration',  '🎊', '새 출발과 성취를 축하할 때',           9),
  ('장례/추모', 'memorial',     '🕊️', '떠난 분을 기리며',                    10);

-- ============================================
-- 11. 시드 데이터 — 태그 (tags)
-- ============================================

-- 계절
INSERT INTO tags (category, name, slug, sort_order) VALUES
  ('season', '봄',     'spring',     1),
  ('season', '여름',   'summer',     2),
  ('season', '가을',   'autumn',     3),
  ('season', '겨울',   'winter',     4),
  ('season', '사계절', 'all-season', 5);

-- 색상
INSERT INTO tags (category, name, slug, sort_order) VALUES
  ('color', '화이트', 'white',  1),
  ('color', '핑크',   'pink',   2),
  ('color', '레드',   'red',    3),
  ('color', '옐로우', 'yellow', 4),
  ('color', '퍼플',   'purple', 5),
  ('color', '오렌지', 'orange', 6),
  ('color', '블루',   'blue',   7),
  ('color', '그린',   'green',  8),
  ('color', '믹스',   'mix',    9);

-- 감정
INSERT INTO tags (category, name, slug, sort_order) VALUES
  ('mood', '사랑',   'love',        1),
  ('mood', '그리움', 'longing',     2),
  ('mood', '응원',   'cheer',       3),
  ('mood', '축하',   'celebration', 4),
  ('mood', '위로',   'comfort',     5),
  ('mood', '감사',   'gratitude',   6),
  ('mood', '설렘',   'excitement',  7);

-- 스타일
INSERT INTO tags (category, name, slug, sort_order) VALUES
  ('style', '클래식', 'classic',  1),
  ('style', '내추럴', 'natural',  2),
  ('style', '모던',   'modern',   3),
  ('style', '러블리', 'lovely',   4),
  ('style', '빈티지', 'vintage',  5),
  ('style', '미니멀', 'minimal',  6);

-- ============================================
-- 12. 시드 데이터 — 꽃 샘플 (작약)
-- ============================================
INSERT INTO flowers (
  name_ko, name_en, name_scientific, nickname, slug,
  description, story, vase_life_days, care_tip, price_range,
  is_popular, is_published, display_order
) VALUES (
  '작약', 'Peony', 'Paeonia lactiflora', '함박꽃, 설중의 꽃', 'peony',
  '겹겹이 피어나는 꽃잎이 마치 드레스를 입은 듯한 꽃. 꽃 중의 여왕이라 불려요.',
  '작약에는 그리스 신화가 담겨 있어요. 신들의 의사였던 파에온(Paeon)이 림프숫 신들의 질투를 사자, 제우스가 그를 아름다운 꽃으로 변신시켜 지켜주었다고 해요. 한국에서는 "함박꽃"이라 불리며, 옛날에 함박 웃음에 비유되다고 하여 붙여진 이름이었어요. 웨딩 부케로 사랑받는 이유는 이 풍성하고 우아한 자태 덕분이죠.',
  7,
  '봉오리 상태에서 구매하면 더 오래 즐길 수 있어요. 줄기를 사선으로 잘라 깨끗한 물에 꽂아주세요.',
  'high',
  true, true, 1
);

-- 작약 꽃말
INSERT INTO flower_meanings (flower_id, color, color_hex, meaning, description, sort_order)
SELECT f.id, v.color, v.color_hex, v.meaning, v.description, v.sort_order
FROM flowers f,
(VALUES
  ('핑크',   '#FFB6C1', '순수함, 사랑의 맹세',   '핑크 작약은 첫사랑의 설렘을 담고 있어요',     1),
  ('화이트', '#FFFFFF', '부드러움, 순결',         '순백의 작약은 웨딩 부케의 단골이에요',         2),
  ('레드',   '#DC143C', '번영, 영화',             '붉은색은 화사한 에너지를 가져다준다고 해요',   3)
) AS v(color, color_hex, meaning, description, sort_order)
WHERE f.slug = 'peony';

-- 작약 계절
INSERT INTO flower_seasons (flower_id, season, month_start, month_end, note)
SELECT f.id, 'spring'::season_enum, 4, 6, '5월이 가장 활성해요'
FROM flowers f WHERE f.slug = 'peony';

-- 작약 상황 매핑
INSERT INTO flower_occasions (flower_id, occasion_id)
SELECT f.id, o.id
FROM flowers f, occasions o
WHERE f.slug = 'peony'
  AND o.slug IN ('wedding', 'propose', 'birthday');

-- 작약 태그 매핑
INSERT INTO flower_tags (flower_id, tag_id)
SELECT f.id, t.id
FROM flowers f, tags t
WHERE f.slug = 'peony'
  AND (
    (t.category = 'season' AND t.slug = 'spring')
    OR (t.category = 'color' AND t.slug IN ('pink', 'white', 'red'))
    OR (t.category = 'mood' AND t.slug IN ('love', 'excitement'))
    OR (t.category = 'style' AND t.slug IN ('classic', 'lovely'))
  );
