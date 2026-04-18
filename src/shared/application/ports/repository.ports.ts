export interface PaginationQuery {
  page: number;
  pageSize: number;
}

export interface DeliveryRecord {
  id: string;
  serviceType: 'DELIVERY';
  customerId: string;
  driverId?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRecord {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalRecord {
  id: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reason?: string;
  reviewedAt?: Date;
}

export interface LedgerEntryRecord {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  type: 'DEBIT' | 'CREDIT';
  referenceId: string;
  createdAt: Date;
}

export interface DeliveryRepositoryPort {
  findById(id: string): Promise<DeliveryRecord | null>;
  save(delivery: DeliveryRecord): Promise<void>;
  findByCustomerId(customerId: string, page: PaginationQuery): Promise<DeliveryRecord[]>;
}

export interface UserRepositoryPort {
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  save(user: UserRecord): Promise<void>;
}

export interface ApprovalRepositoryPort {
  findPending(page: PaginationQuery): Promise<ApprovalRecord[]>;
  save(approval: ApprovalRecord): Promise<void>;
}

export interface LedgerRepositoryPort {
  append(entry: LedgerEntryRecord): Promise<void>;
  findByReference(referenceId: string): Promise<LedgerEntryRecord[]>;
}
