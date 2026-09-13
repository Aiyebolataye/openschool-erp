import { resolveDeliveryProviderName } from './delivery-provider';

describe('resolveDeliveryProviderName', () => {
  it('defaults to dev outside production', () => {
    expect(resolveDeliveryProviderName('development', undefined)).toBe('dev');
  });

  it('resolves dev explicitly outside production', () => {
    expect(resolveDeliveryProviderName('development', 'dev')).toBe('dev');
    expect(resolveDeliveryProviderName('test', 'DEV')).toBe('dev');
  });

  it('resolves none in any environment when explicitly configured', () => {
    expect(resolveDeliveryProviderName('development', 'none')).toBe('none');
    expect(resolveDeliveryProviderName('production', 'none')).toBe('none');
  });

  it('rejects dev in production', () => {
    expect(() => resolveDeliveryProviderName('production', 'dev')).toThrow(
      /DELIVERY_PROVIDER=dev is not allowed in production/,
    );
    expect(() => resolveDeliveryProviderName('production', undefined)).toThrow(
      /DELIVERY_PROVIDER=dev is not allowed in production/,
    );
  });

  it('rejects unknown provider names', () => {
    expect(() => resolveDeliveryProviderName('development', 'smtp')).toThrow(
      /Unsupported DELIVERY_PROVIDER/,
    );
  });
});