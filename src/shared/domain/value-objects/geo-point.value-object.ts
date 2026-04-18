import { DomainError } from '../errors/domain-error';

export class GeoPoint {
  private constructor(
    public readonly latitude: number,
    public readonly longitude: number,
  ) {}

  static create(latitude: number, longitude: number): GeoPoint {
    if (latitude < -90 || latitude > 90) {
      throw new DomainError('Latitude must be between -90 and 90.', 'INVALID_LATITUDE');
    }
    if (longitude < -180 || longitude > 180) {
      throw new DomainError('Longitude must be between -180 and 180.', 'INVALID_LONGITUDE');
    }
    return new GeoPoint(latitude, longitude);
  }
}
