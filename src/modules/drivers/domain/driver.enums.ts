export enum DriverRole {
  DRIVER = 'DRIVER',
}

export enum DriverStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED',
}

export enum DriverOnboardingStep {
  PROFILE = 'PROFILE',
  PASSWORD = 'PASSWORD',
  DOCUMENTS = 'DOCUMENTS',
  SELFIE = 'SELFIE',
  SUBMITTED = 'SUBMITTED',
}

export enum DriverDocumentType {
  CPF_FRONT = 'CPF_FRONT',
  CPF_BACK = 'CPF_BACK',
  RG_FRONT = 'RG_FRONT',
  RG_BACK = 'RG_BACK',
  CNH_FRONT = 'CNH_FRONT',
  CNH_BACK = 'CNH_BACK',
  SELFIE = 'SELFIE',
}

export enum DriverDocumentStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
