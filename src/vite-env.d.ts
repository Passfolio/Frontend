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
  readonly VITE_FOOTER_CONTACT_EMAIL?: string;
  readonly VITE_ADMIN_PORTAL_LOGIN_PATH?: string;
  readonly VITE_ADMIN_PORTAL_SIGNUP_PATH?: string;
  readonly VITE_ADMIN_PORTAL_PROFILE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
