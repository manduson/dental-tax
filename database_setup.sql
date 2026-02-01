-- =============================================
-- Chan Dental Tax Database Schema
-- =============================================

-- 1. dental_revenue 테이블 생성
CREATE TABLE IF NOT EXISTS dental_revenue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  total_amount NUMERIC(12,2) DEFAULT 0,
  co_payment NUMERIC(12,2) DEFAULT 0,
  non_insurance NUMERIC(12,2) DEFAULT 0,
  collected_amount NUMERIC(12,2) DEFAULT 0,
  card NUMERIC(12,2) DEFAULT 0,
  cash NUMERIC(12,2) DEFAULT 0,
  uncollected NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 날짜별 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_dental_revenue_date ON dental_revenue(date DESC);

-- Row Level Security (RLS) 활성화
ALTER TABLE dental_revenue ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 설정 (개발 단계)
DROP POLICY IF EXISTS "Enable read access for all users" ON dental_revenue;
CREATE POLICY "Enable read access for all users" ON dental_revenue
  FOR SELECT USING (true);

-- 모든 사용자가 삽입할 수 있도록 설정 (개발 단계)
DROP POLICY IF EXISTS "Enable insert access for all users" ON dental_revenue;
CREATE POLICY "Enable insert access for all users" ON dental_revenue
  FOR INSERT WITH CHECK (true);

-- 모든 사용자가 업데이트할 수 있도록 설정 (개발 단계)
DROP POLICY IF EXISTS "Enable update access for all users" ON dental_revenue;
CREATE POLICY "Enable update access for all users" ON dental_revenue
  FOR UPDATE USING (true);

-- 모든 사용자가 삭제할 수 있도록 설정 (개발 단계)
DROP POLICY IF EXISTS "Enable delete access for all users" ON dental_revenue;
CREATE POLICY "Enable delete access for all users" ON dental_revenue
  FOR DELETE USING (true);

-- =============================================
-- 2. dental_expenses 테이블 생성
-- =============================================
CREATE TABLE IF NOT EXISTS dental_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  category VARCHAR(100),
  description TEXT,
  amount NUMERIC(12,2) DEFAULT 0,
  payment_method VARCHAR(50),
  vendor VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 날짜별 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_dental_expenses_date ON dental_expenses(date DESC);

-- Row Level Security (RLS) 활성화
ALTER TABLE dental_expenses ENABLE ROW LEVEL SECURITY;

-- 정책 생성 (개발 단계)
DROP POLICY IF EXISTS "Enable all access for all users" ON dental_expenses;
CREATE POLICY "Enable all access for all users" ON dental_expenses
  FOR ALL USING (true);

-- =============================================
-- 3. dental_credit_cards 테이블 생성 (신용카드 관리)
-- =============================================
CREATE TABLE IF NOT EXISTS dental_credit_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, pending
  card_name VARCHAR(100) NOT NULL,
  card_number VARCHAR(100),
  issue_date DATE,
  expiry_date DATE,
  annual_fee NUMERIC(12,2) DEFAULT 0,
  benefits TEXT,
  usage TEXT,
  notes TEXT,
  url TEXT,
  registration_date DATE DEFAULT CURRENT_DATE,
  sort_order INTEGER DEFAULT 0, -- 순서 저장용 컬럼
  payment_date INTEGER, -- 결제일 (1-31)
  min_performance TEXT, -- 전월실적
  discount_target TEXT, -- 할인처
  discount_limit TEXT, -- 할인한도
  discount_exclude TEXT, -- 할인제외
  performance_exclude TEXT, -- 실적제외
  recurring_payments TEXT, -- 정기결제 항목 (컴마 구분)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) 활성화
ALTER TABLE dental_credit_cards ENABLE ROW LEVEL SECURITY;

-- 정책 생성 (개발 단계)
DROP POLICY IF EXISTS "Enable all access for all users" ON dental_credit_cards;
CREATE POLICY "Enable all access for all users" ON dental_credit_cards
  FOR ALL USING (true);

-- =============================================
-- 4. 샘플 데이터 추가
-- =============================================

-- Revenue 샘플 데이터
INSERT INTO dental_revenue (date, total_amount, co_payment, non_insurance, collected_amount, card, cash, uncollected)
VALUES
  ('2026-02-01', 1000000, 300000, 100000, 900000, 700000, 200000, 100000),
  ('2026-01-31', 1500000, 500000, 200000, 1300000, 1000000, 300000, 200000),
  ('2026-01-30', 800000, 250000, 80000, 720000, 520000, 200000, 80000),
  ('2026-01-29', 1200000, 400000, 150000, 1050000, 800000, 250000, 150000),
  ('2026-01-28', 950000, 320000, 90000, 860000, 650000, 210000, 90000)
ON CONFLICT (id) DO NOTHING;

-- Expenses 샘플 데이터
INSERT INTO dental_expenses (date, category, description, amount, payment_method, vendor)
VALUES
  ('2026-02-01', '재료비', '임플란트 재료', 500000, '카드', '오스템'),
  ('2026-01-31', '인건비', '직원 급여', 3000000, '계좌이체', '직원'),
  ('2026-01-30', '임대료', '병원 임대료', 2000000, '계좌이체', '건물주'),
  ('2026-01-29', '재료비', '치과 재료 구매', 350000, '카드', '치과재료상'),
  ('2026-01-28', '유틸리티', '전기/수도/가스', 150000, '자동이체', '한국전력')
ON CONFLICT (id) DO NOTHING;

-- Credit Cards 샘플 데이터 (Notion 기반)
INSERT INTO dental_credit_cards (card_name, card_number, issue_date, expiry_date, annual_fee, benefits, usage, notes, url, status, registration_date)
VALUES
  ('삼성 아멕스 플래티넘', '3762 0000 0000 000', '2022-11-04', '2028-11-01', 700000, '기프트 카드 100만원(1% 적립) / 바우처 25.12.19까지 / 해외 3%, 골프/주유/호텔 5% 적립', '600만원 이상 바우처, 해외/호텔 특화', '전월 100만원 이상 1.5만P, 200만원 이상 4만P 추가 적립', 'blog.naver.com/Pos...759525', 'active', '2025-11-04'),
  ('KB국민 쿠팡 와우 카드', '4518 0000 0000 0000', '2024-02-01', '2030-02-01', 20000, '쿠팡 4% 적립 (최대 4만원)', '쿠팡 결제 전용, 100만원 초과시 미적립', '2026.4.14까지 4% 적립 프로모션', 'cardpine.com/kb%...a09.90/', 'active', '2024-02-01'),
  ('롯데 아멕스 플래티넘', '3763 0000 0000 000', '2023-11-01', '2028-10-31', 500000, '대한항공/아시아나 마일리지 적립(1,500원당 6P), 특급호텔 20만원 할인', '1년차 1200만원, 2년차 600만원 실적시 혜택', '26.2.28까지 600만원 실적시 추가 혜택', 'm.lottecard.co.kr/app..._10871', 'active', '2023-11-01'),
  ('LOCA LIKIT 1.2', '5321 0000 0000 0000', '2022-01-01', '2027-02-01', 10000, '전 가맹점 1.2% 할인, 온라인 1.5% 할인', '무실적 서브 카드 (공과금 등 제외)', '최대 할인한도 없음', 'm.blog.naver.com/w2...440338', 'active', '2022-01-01'),
  ('신한 본보이 베스트', '4234 0000 0000 0000', '2023-06-01', '2028-06-01', 267000, '무료 숙박권 1매, 메리어트 골드 등급, 조식 5만원 할인(연2회)', '전월 실적 30만원 유지 필요', '1000만원 이상 5,000P, 2천만원 이상 10,000P 추가 제공', 'blog.naver.com/sir...587234', 'active', '2023-06-01'),
  ('현대 아멕스 플래티넘', '3764 0000 0000 000', '2023-04-01', '2028-04-01', 1000000, 'MR 적립 (1-3배), 골프장/호텔 바우처, 메탈 플레이트', '연 3600만원 사용 시 10만 MR 적립', '세금은 적립 제외되나 실적은 인정됨', 'yhj1826.tistory.com/ent...%82%98', 'active', '2023-04-01'),
  ('토스 하나와이드', '5412 0000 0000 0000', '2023-08-01', '2028-08-01', 20000, '전월실적 무관 1%, 40만원 이상 2% 할인', '세금/공과금 제외, 월 최대 10만원 할인', '주카드용 추천', '-', 'active', '2023-08-01'),
  ('삼성 BIZ ID BENEFIT', '5522 0000 0000 0000', '2023-09-01', '2028-09-01', 30000, '사업 필수 경비 1.5% 할인, 4대보험/주유/전기요금 할인', '전월실적 30만원 이상', '세금 등은 실적 제외, 사업자용 카드', '-', 'active', '2023-09-01')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 4. dental_inventory 테이블 생성 (재고 관리)
-- =============================================
CREATE TABLE IF NOT EXISTS dental_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  unit VARCHAR(20),
  minimum_stock INTEGER DEFAULT 5,
  location VARCHAR(100),
  price NUMERIC(12,2) DEFAULT 0,
  vendor VARCHAR(200),
  last_order_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE dental_inventory ENABLE ROW LEVEL SECURITY;

-- 정책 생성 (개발 단계)
DROP POLICY IF EXISTS "Enable all access for all users" ON dental_inventory;
CREATE POLICY "Enable all access for all users" ON dental_inventory
  FOR ALL USING (true);

-- Inventory 샘플 데이터
INSERT INTO dental_inventory (item_name, category, stock_quantity, unit, minimum_stock, price, vendor)
VALUES
  ('임플란트 픽스처 (오스템 TS3)', '임플란트', 50, '개', 10, 85000, '오스템'),
  ('치과용 마스크 (L사이즈)', '소모품', 200, '매', 50, 150, '3M'),
  ('복합 레진 (A2)', '충전재', 12, '개', 3, 45000, '글래스스'),
  ('일회용 글러브 (M)', '소모품', 15, '박스', 5, 8000, '신흥'),
  ('알지네이트', '인상재', 8, '개', 2, 12000, '지씨코리아')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 5. 사업장현황신고 관련 테이블 (신고서, 검토표, 검토부표)
-- =============================================

-- 5-1. 사업장현황신고서 (기본)
CREATE TABLE IF NOT EXISTS business_status_report (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_year INTEGER NOT NULL,
  business_info JSONB, -- 상호, 성명, 소재지 등
  revenue_summary JSONB, -- 수입금액 명세 및 구성
  deduction_info JSONB, -- 적격증빙 수취금액
  facility_info JSONB, -- 시설 현황
  expense_summary JSONB, -- 기본경비
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(report_year)
);

-- 5-2. 의료업자 수입금액 검토표
CREATE TABLE IF NOT EXISTS medical_income_review (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_year INTEGER NOT NULL,
  facility_detail JSONB, -- 진료실, 인원 현황 등
  income_detail JSONB, -- 보험/비보험 상세
  medicine_usage JSONB, -- 의약품 등 사용검토
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(report_year)
);

-- 5-3. 치과병의원 수입금액검토부표
CREATE TABLE IF NOT EXISTS dental_income_supplement (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_year INTEGER NOT NULL,
  medical_equipment JSONB, -- 주요 의료기기 현황
  non_insurance_detail JSONB, -- 비보험 수입금액 상세
  material_usage JSONB, -- 주요 사용 재료 현황
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(report_year)
);

-- RLS 활성화 및 정책
ALTER TABLE business_status_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_income_review ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_income_supplement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for all users" ON business_status_report FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON medical_income_review FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON dental_income_supplement FOR ALL USING (true);

-- =============================================
-- 6. 병원 기본 정보 마스터 프로필
-- =============================================
CREATE TABLE IF NOT EXISTS hospital_profile (
  id INTEGER PRIMARY KEY DEFAULT 1, -- 단일 레코드만 유지
  biz_name VARCHAR(100),
  biz_no VARCHAR(20),
  rep_name VARCHAR(50),
  address TEXT,
  tel VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(100),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT one_row_only CHECK (id = 1)
);

-- 초기 데이터 (샘플)
INSERT INTO hospital_profile (id, biz_name, biz_no, rep_name, address, tel)
VALUES (1, '찬치과의원', '616-93-18253', '박찬', '제주특별자치도 제주시 중앙로371-1, 비 (이도이동,2층)', '064-755-2228')
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE hospital_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for all users" ON hospital_profile FOR ALL USING (true);

-- 완료 메시지
SELECT 'Database setup completed successfully!' as message;
