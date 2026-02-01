# Supabase 연결 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 로그인합니다.
2. **New Project** 버튼을 클릭합니다.
3. 프로젝트 정보를 입력합니다:
   - **Name**: `chan-dental-tax` (또는 원하는 이름)
   - **Database Password**: 안전한 비밀번호 생성
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국 서버)
4. **Create new project** 버튼을 클릭하고 프로젝트 생성을 기다립니다.

## 2. API Keys 확인

1. Supabase 프로젝트 대시보드에서 **Settings** > **API** 메뉴로 이동합니다.
2. 다음 정보를 확인합니다:
   - **Project URL**: `https://********.supabase.co`
   - **anon public**: `eyJhbG*****` (공개 키)

## 3. 환경 변수 설정

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 입력합니다:

```env
VITE_SUPABASE_URL=https://********.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG*****
```

> ⚠️ **중요**: `.env` 파일은 절대 Git에 커밋하지 마세요! (`.gitignore`에 이미 포함되어 있습니다)

## 4. 데이터베이스 테이블 생성

### 4.1 dental_revenue 테이블

Supabase Dashboard에서 **SQL Editor**로 이동하여 다음 쿼리를 실행합니다:

```sql
-- Revenue 테이블 생성
CREATE TABLE dental_revenue (
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
CREATE INDEX idx_dental_revenue_date ON dental_revenue(date DESC);

-- Row Level Security (RLS) 활성화
ALTER TABLE dental_revenue ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 설정 (개발 단계)
CREATE POLICY "Enable read access for all users" ON dental_revenue
  FOR SELECT USING (true);

-- 모든 사용자가 삽입할 수 있도록 설정 (개발 단계)
CREATE POLICY "Enable insert access for all users" ON dental_revenue
  FOR INSERT WITH CHECK (true);

-- 모든 사용자가 업데이트할 수 있도록 설정 (개발 단계)
CREATE POLICY "Enable update access for all users" ON dental_revenue
  FOR UPDATE USING (true);

-- 모든 사용자가 삭제할 수 있도록 설정 (개발 단계)
CREATE POLICY "Enable delete access for all users" ON dental_revenue
  FOR DELETE USING (true);
```

### 4.2 dental_expenses 테이블

```sql
-- Expenses 테이블 생성
CREATE TABLE dental_expenses (
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
CREATE INDEX idx_dental_expenses_date ON dental_expenses(date DESC);

-- Row Level Security (RLS) 활성화
ALTER TABLE dental_expenses ENABLE ROW LEVEL SECURITY;

-- 정책 생성 (개발 단계)
CREATE POLICY "Enable all access for all users" ON dental_expenses
  FOR ALL USING (true);
```

### 4.3 샘플 데이터 추가 (선택 사항)

```sql
-- Revenue 샘플 데이터
INSERT INTO dental_revenue (date, total_amount, co_payment, non_insurance, collected_amount, card, cash, uncollected)
VALUES 
  ('2026-02-01', 1000000, 300000, 100000, 900000, 700000, 200000, 100000),
  ('2026-01-31', 1500000, 500000, 200000, 1300000, 1000000, 300000, 200000),
  ('2026-01-30', 800000, 250000, 80000, 720000, 520000, 200000, 80000);

-- Expenses 샘플 데이터
INSERT INTO dental_expenses (date, category, description, amount, payment_method, vendor)
VALUES 
  ('2026-02-01', '재료비', '임플란트 재료', 500000, '카드', '덴탈맥스'),
  ('2026-01-31', '인건비', '직원 급여', 3000000, '계좌이체', '직원'),
  ('2026-01-30', '임대료', '병원 임대료', 2000000, '계좌이체', '건물주');
```

## 5. 애플리케이션에서 데이터 사용하기

### 5.1 Revenue 페이지 수정

`src/pages/Revenue.tsx` 파일을 수정하여 실제 Supabase 데이터를 불러옵니다:

```typescript
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Revenue 컴포넌트 내부에 추가
useEffect(() => {
  const fetchRevenue = async () => {
    const { data, error } = await supabase
      .from('dental_revenue')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      message.error('데이터 로드 실패: ' + error.message);
    } else if (data) {
      setDataSource(data.map(item => ({
        ...item,
        id: item.id.toString(),
      })));
    }
  };
  
  fetchRevenue();
}, []);
```

### 5.2 데이터 저장 로직 수정

```typescript
// editable onSave 핸들러 수정
onSave: async (key, row) => {
  const { error } = await supabase
    .from('dental_revenue')
    .update({
      date: row.date,
      total_amount: row.total_amount,
      co_payment: row.co_payment,
      non_insurance: row.non_insurance,
      collected_amount: row.collected_amount,
      card: row.card,
      cash: row.cash,
      uncollected: row.uncollected,
    })
    .eq('id', key);
  
  if (error) {
    message.error('저장 실패: ' + error.message);
  } else {
    message.success('저장 완료');
  }
},
```

## 6. 연결 확인

1. 개발 서버를 재시작합니다:
   ```bash
   npm run dev
   ```

2. 브라우저에서 `http://localhost:5173`을 열고 개발자 도구(F12)의 **Console** 탭을 확인합니다.

3. 에러가 없다면 성공적으로 연결된 것입니다!

## 7. 보안 강화 (프로덕션 배포 전)

프로덕션 환경에서는 다음 사항을 고려해야 합니다:

### 7.1 인증 설정

```typescript
// 로그인 예제
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### 7.2 RLS 정책 수정

개발 단계에서는 모든 접근을 허용했지만, 프로덕션에서는 인증된 사용자만 접근하도록 수정:

```sql
-- 기존 정책 삭제
DROP POLICY "Enable read access for all users" ON dental_revenue;

-- 인증된 사용자만 접근 가능하도록 수정
CREATE POLICY "Enable access for authenticated users only" ON dental_revenue
  FOR ALL USING (auth.role() = 'authenticated');
```

## 8. 문제 해결

### 연결 오류가 발생하는 경우

1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. 환경 변수 이름이 `VITE_`로 시작하는지 확인
3. 개발 서버를 재시작했는지 확인
4. Supabase 프로젝트가 활성 상태인지 확인

### CORS 오류가 발생하는 경우

Supabase Dashboard > Settings > API > CORS Configuration에서 허용할 도메인을 추가합니다.

## 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
