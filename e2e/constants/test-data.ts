export const VALID_LOGIN = {
  email: "qa@example.com",
  password: "Secret@123",
} as const;

export const INVALID_LOGIN = {
  wrongPassword: "wrongpassword",
  nonExistentEmail: "nonexistent@example.com",
} as const;

export const VALID_SIGNUP = {
  fullName: "Test User",
  organisationName: "Test Org",
  email: "signup-test@example.com",
  phone: "9876543210",
  password: "Test@1234",
} as const;

export const INVALID_SIGNUP = {
  fullNameTooShort: "Ab",
  fullNameInvalidChars: "User123",
  organisationTooShort: "AB",
  emailInvalid: "notanemail",
  phoneWrongLength: "123",
  phoneNonNumeric: "987654321a",
  passwordWeak: "simple",
  passwordNoSpecial: "Password123",
  passwordNoNumber: "Password!!",
} as const;

export const VALID_RESET_PASSWORD = {
  email: "reset-test@example.com",
} as const;

export const VALID_SET_NEW_PASSWORD = {
  password: "NewPass@123",
  confirmPassword: "NewPass@123",
} as const;

export const INVALID_SET_NEW_PASSWORD = {
  shortPassword: "Abc@12",
  mismatchPassword: "Mismatch@123",
  passwordMismatch: "Mismatch@123",
} as const;

export const ERROR_MESSAGES = {
  LOGIN: {
    EMAIL_REQUIRED: "Email is required",
    EMAIL_INVALID: "Please enter a valid email",
    PASSWORD_REQUIRED: "Password is required",
    PASSWORD_MIN: "Password must be at least 6 characters",
  },
  SIGNUP: {
    NAME_REQUIRED: "Name is required",
    NAME_INVALID: "Please enter a valid name",
    NAME_MIN: "Name must be at least 3 characters",
    NAME_MAX: "Name must be at most 20 characters",
    ORG_REQUIRED: "Organisation name is required",
    ORG_MIN: "Name must be at least 3 characters",
    EMAIL_REQUIRED: "Email is required",
    EMAIL_INVALID: "Please enter a valid email",
    PASSWORD_REQUIRED: "Password is required",
    PASSWORD_RULES:
      "Password must contain at least one number, one letter, one special character, and be at least 8 characters long",
    PHONE_REQUIRED: "Phone number is required",
    PHONE_DIGITS: "Phone number must contain only digits",
    PHONE_LENGTH: "Number must be exactly 10 digits",
    TERMS_REQUIRED: "You must accept the terms and conditions",
  },
  RESET_PASSWORD: {
    EMAIL_REQUIRED: "Email is required",
    EMAIL_INVALID: "Please enter a valid email",
  },
  OTP: {
    INVALID_OTP: "Invalid OTP",
  },
  SET_NEW_PASSWORD: {
    REQUIRED: "All fields are required",
    ALL_FIELDS_REQUIRED: "All fields are required",
    MIN_LENGTH: "Password must be at least 8 characters",
    PASSWORD_MIN: "Password must be at least 8 characters",
    MISMATCH: "Passwords do not match",
    PASSWORDS_MISMATCH: "Passwords do not match",
  },
} as const;
