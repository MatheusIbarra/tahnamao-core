import { DeliveryRecord } from '@src/shared/application/ports/repository.ports';

export function makeDeliveryRecord(overrides: Partial<DeliveryRecord> = {}): DeliveryRecord {
  const now = new Date();
  return {
    id: 'del_001',
    serviceType: 'DELIVERY',
    customerId: 'cust_001',
    status: 'REQUESTED',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
