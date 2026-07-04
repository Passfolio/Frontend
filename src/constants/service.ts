/**
 * 서비스 대표 문의 이메일 — .env(로컬) 및 배포 환경 빌드 변수의 VITE_SERVICE_EMAIL로 제어.
 * 점검 안내·공지사항·고객센터/의견 보내기 mailto·개인정보 보호책임자·푸터 문의 표기에 사용된다.
 */
export const SERVICE_EMAIL = import.meta.env.VITE_SERVICE_EMAIL?.trim() || 'hooby@passfolio.dev';
