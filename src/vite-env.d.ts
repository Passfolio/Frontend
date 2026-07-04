/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LANDING_INSIGHTS_JSON?: string;
  readonly VITE_LANDING_BENTO_MAIN_IMAGE_URL?: string;
  readonly VITE_LANDING_BENTO_JD_IMAGE_URL?: string;
  readonly VITE_LANDING_BENTO_REPORT_IMAGE_URL?: string;
  readonly VITE_FOOTER_REPRESENTATIVE_NAME?: string;
  readonly VITE_FOOTER_BUSINESS_REGISTRATION_NUMBER?: string;
  readonly VITE_FOOTER_JOB_INFO_SERVICE_REPORT_NUMBER?: string;
  readonly VITE_FOOTER_ADDRESS?: string;
  readonly VITE_FOOTER_CONTACT_PHONE?: string;
  readonly VITE_ADMIN_PORTAL_LOGIN_PATH?: string;
  readonly VITE_ADMIN_PORTAL_SIGNUP_PATH?: string;
  readonly VITE_ADMIN_PORTAL_PROFILE_PATH?: string;
  readonly VITE_ADMIN_PORTAL_TEST_PATH?: string;
  /** 'true'면 서비스 점검 모드 — API 의존 라우트가 /maintenance로 리다이렉트된다 */
  readonly VITE_SERVICE_MAINTENANCE?: string;
  /** 서비스 대표 문의 이메일 (점검 안내·공지·고객센터 mailto 등에 표시) */
  readonly VITE_SERVICE_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
