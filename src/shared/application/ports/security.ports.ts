export interface AuthClaims {
  sub: string;
  role: string;
  permissions: string[];
}

export interface AuthTokenPort {
  signAccessToken(claims: AuthClaims): Promise<string>;
  verifyAccessToken(token: string): Promise<AuthClaims>;
}

export interface PasswordHasherPort {
  hash(raw: string): Promise<string>;
  compare(raw: string, hashed: string): Promise<boolean>;
}

export interface IdempotencyInput {
  key: string;
  scope: string;
  requestedBy: string;
  requestHash: string;
  ttlSeconds: number;
}

export interface IdempotencyResult {
  isDuplicate: boolean;
  responseCode?: number;
  responseBody?: Record<string, unknown>;
}

export interface IdempotencyPort {
  reserve(input: IdempotencyInput): Promise<IdempotencyResult>;
  complete(
    key: string,
    scope: string,
    responseCode: number,
    responseBody: Record<string, unknown>,
  ): Promise<void>;
}
