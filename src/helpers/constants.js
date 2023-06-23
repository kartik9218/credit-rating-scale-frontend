export const onboardingSteps = [
  {
    id: "00",
    label: "Basic Details",
  },
  {
    id: "01",
    label: "Address",
  },
  {
    id: "02",
    label: "Key Contacts (KMP)",
  },
  {
    id: "03",
    label: "Listing Details",
  },
  {
    id: "04",
    label: "Board of Directors",
  },
  {
    id: "05",
    label: "Shareholder Pattern",
  },
  {
    id: "06",
    label: "Stakeholder Details",
  },
];

export const INTERACTION_TYPE = Object.freeze({
  BANKER: "Banker",
  AUDITOR: "Auditor",
  IPA_TRUSTEE: "IPA Trustee",
  PLANT_VISIT: "Plant Visit",
  AUDIT_COMMITTEE: "Audit Committee",
  MANAGEMENT: "Management",
});

export const TAB = Object.freeze({
  BASIC_DETAIL: "BASIC DETAIL",
  ADDRESS_DETAIL: "ADDRESS DETAIL",
  LISTING_DETAIL: "LISTING DETAIL",
  KEYCONTACT_DETAILS: "KEYCONTACT DETAILS",
  BOARD_DIRECTOR: "BOARD DIRECTOR",
  SHAREHOLDER_PATTERN: "SHAREHOLDER PATTERN",
  STAKEHOLDER_DETAILS: "STAKEHOLDER DETAILS",
});

export const ERRORS = Object.freeze({
  TOKEN_EXPIRED:"TokenExpiredError: jwt expired",
}) 
