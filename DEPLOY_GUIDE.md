# 🚀 GitHub & Vercel 배포 가이드

이 문서는 현재 개발된 **사업장현황신고 시스템**을 GitHub에 올리고, Vercel을 통해 실제 웹 사이트로 배포하는 방법을 안내합니다.

---

## 1. 사전 준비물
- [GitHub](https://github.com/) 계정
- [Vercel](https://vercel.com/) 계정 (GitHub 계정으로 로그인 권장)
- 로컬 PC에 [Git](https://git-scm.com/) 설치 완료

---

## 2. GitHub에 프로젝트 올리기 (최초 1회)

### 2.1 Git 초기화 및 커밋
터미널(PowerShell 또는 CMD)에서 프로젝트 루트 폴더(`세무 프로그램`)로 이동 후 다음 명령어를 실행합니다.

```bash
# git 초기화 (이미 되어 있다면 생략 가능)
git init

# 변경 사항 추가
git add .

# 첫 번째 커밋
git commit -m "feat: 사업장현황신고 시스템 초기 구현 및 입력창 최적화 기능 추가"
```

### 2.2 GitHub 저장소 생성
1. GitHub 메인에서 **New repository**를 클릭합니다.
2. Repository name을 설정합니다 (예: `business-report-system`).
3. **Public** 또는 **Private** 중 선택 후 생성합니다.

### 2.3 로컬 코드를 GitHub에 푸시
GitHub 저장소 생성 후 나오는 명령어를 복사하여 실행합니다.

```bash
# 저장소 연결 (본인의 GitHub 주소로 변경하세요)
git remote add origin https://github.com/사용자아이디/저장소이름.git

# 브랜치 이름 변경 (필요한 경우)
git branch -M main

# GitHub로 푸시
git push -u origin main
```

---

## 3. Vercel로 배포하기

1. [Vercel Dashboard](https://vercel.com/dashboard)에 접속합니다.
2. **Add New...** > **Project**를 클릭합니다.
3. 위에서 만든 GitHub 저장소를 찾아서 **Import** 버튼을 누릅니다.

### 3.1 환경 변수(Environment Variables) 설정 (중요! ⭐)
배포 설정 화면의 "Environment Variables" 섹션에서 Supabase 연결 정보를 입력해야 프로그램이 정상 작동합니다. 로컬의 `.env` 파일 내용을 참고하여 다음 항목을 추가하세요.

| Key | Value (로컬 .env 내용 복사) |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key` |

4. 모든 설정이 끝났다면 **Deploy** 버튼을 클릭합니다.

---

## 4. 배포 완료 및 업데이트

- 배포가 완료되면 Vercel에서 제공하는 고유 URL(예: `https://project-name.vercel.app`)을 통해 전 세계 어디서든 접속할 수 있습니다.
- **자동 배포**: 이후 코드를 수정하고 `git push`만 하면, Vercel이 자동으로 변경 사항을 감지하여 다시 배포해 줍니다.

---

## ⚠️ 주의 사항
- **.env 파일**: `.env` 파일은 민감한 정보를 담고 있으므로 절대 GitHub에 직접 올리지 마세요. (`.gitignore`에 이미 포함되어 있습니다.) 대신 반드시 Vercel 설정 화면에서 입력해야 합니다.
- **GitHub 저장소**: 공개(Public) 저장소로 만들 경우, 소스 코드가 누구나 볼 수 있게 되므로 보안에 유의하세요. 개인적인 용도라면 **Private** 저장소를 추천합니다.
