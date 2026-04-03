export const LOGIN = {
  PAGE_HEADING: "Login",
  EMAIL_PLACEHOLDER: "Email ID",
  PASSWORD_PLACEHOLDER: "Password",
  SUBMIT_BUTTON: "Log In",
  FORGOT_PASSWORD_LINK: "Forgot Password?",
  SIGN_UP_LINK: "Sign Up",
} as const;

export const SIGNUP = {
  PAGE_HEADING: "Sign Up",
  FULL_NAME_LABEL: "Full Name",
  ORGANISATION_NAME_LABEL: "Organisation Name",
  EMAIL_LABEL: "Email ID",
  PHONE_LABEL: "Phone",
  PASSWORD_LABEL: "Password",
  TERMS_CHECKBOX_LABEL: /By clicking, you agree to our/,
  SUBMIT_BUTTON: "Sign Up",
  LOGIN_LINK: "Login",
} as const;

export const OTP = {
  PAGE_HEADING: "Verify Your Email",
  CODE_SENT_TO: "A verification code has been sent to",
  VERIFY_BUTTON: "Verify & Continue",
  RESEND_BUTTON: "Resend OTP",
  BACK_TO_LOGIN: "Back to Login",
  BACK_BUTTON: "Back",
  OTP_INPUT_ID_PREFIX: "otp-input-",
} as const;

export const RESET_PASSWORD = {
  PAGE_HEADING: "Forgot Password?",
  SUBTITLE: "Enter your email to receive a verification code",
  EMAIL_PLACEHOLDER: "Email ID",
  SUBMIT_BUTTON: "Submit",
  REMEMBER_PASSWORD: "Remember your password?",
  LOGIN_LINK: "Login",
} as const;

export const SET_NEW_PASSWORD = {
  PAGE_HEADING: "Set New Password",
  SUBTITLE: "Create a new password for your account",
  NEW_PASSWORD_LABEL: "New Password",
  CONFIRM_PASSWORD_LABEL: "Confirm Password",
  RESET_BUTTON: "Reset Password",
  BACK_TO_LOGIN: "Back to Login",
} as const;

export const DASHBOARD = {
  MFE_LOADING: "[data-mfe-loading]",
  FALLBACK_TEXT: "Sorry, this page is currently unavailable.",
  LOADING_TEXT: "Please wait for a moment",
} as const;

export const INVITE = {
  PATH_PREFIX: "/invite/",
} as const;
