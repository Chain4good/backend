import { KycDocumentType } from './kyc-document-type.enum';

describe('KycDocumentType Enum', () => {
  it('should have correct enum values', () => {
    expect(KycDocumentType.NATIONAL_ID).toBe('NATIONAL_ID');
    expect(KycDocumentType.DRIVER_LICENSE).toBe('DRIVER_LICENSE');
    expect(KycDocumentType.PASSPORT).toBe('PASSPORT');
  });

  it('should have exactly 3 enum values', () => {
    const values = Object.values(KycDocumentType);
    expect(values).toHaveLength(3);
    expect(values).toContain('NATIONAL_ID');
    expect(values).toContain('DRIVER_LICENSE');
    expect(values).toContain('PASSPORT');
  });

  it('should have correct enum keys', () => {
    const keys = Object.keys(KycDocumentType);
    expect(keys).toHaveLength(3);
    expect(keys).toContain('NATIONAL_ID');
    expect(keys).toContain('DRIVER_LICENSE');
    expect(keys).toContain('PASSPORT');
  });

  it('should be usable in switch statements', () => {
    const getDocumentDescription = (type: KycDocumentType): string => {
      switch (type) {
        case KycDocumentType.NATIONAL_ID:
          return 'National Identity Card';
        case KycDocumentType.DRIVER_LICENSE:
          return 'Driver License';
        case KycDocumentType.PASSPORT:
          return 'Passport';
        default:
          return 'Unknown document type';
      }
    };

    expect(getDocumentDescription(KycDocumentType.NATIONAL_ID)).toBe('National Identity Card');
    expect(getDocumentDescription(KycDocumentType.DRIVER_LICENSE)).toBe('Driver License');
    expect(getDocumentDescription(KycDocumentType.PASSPORT)).toBe('Passport');
  });

  it('should be comparable with string values', () => {
    expect(KycDocumentType.NATIONAL_ID === 'NATIONAL_ID').toBe(true);
    expect(KycDocumentType.DRIVER_LICENSE === 'DRIVER_LICENSE').toBe(true);
    expect(KycDocumentType.PASSPORT === 'PASSPORT').toBe(true);
  });

  it('should support array operations', () => {
    const allTypes = Object.values(KycDocumentType);
    
    expect(allTypes.includes(KycDocumentType.NATIONAL_ID)).toBe(true);
    expect(allTypes.includes(KycDocumentType.DRIVER_LICENSE)).toBe(true);
    expect(allTypes.includes(KycDocumentType.PASSPORT)).toBe(true);
    
    expect(allTypes.filter(type => type.includes('ID'))).toEqual(['NATIONAL_ID']);
    expect(allTypes.filter(type => type.includes('LICENSE'))).toEqual(['DRIVER_LICENSE']);
  });

  it('should be serializable to JSON', () => {
    const documentData = {
      type: KycDocumentType.PASSPORT,
      url: 'https://example.com/passport.jpg'
    };

    const json = JSON.stringify(documentData);
    const parsed = JSON.parse(json);

    expect(parsed.type).toBe('PASSPORT');
    expect(parsed.type).toBe(KycDocumentType.PASSPORT);
  });
});
