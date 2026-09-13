import {
  generateInternalEmail,
  generateToken,
  hashToken,
  isPrivilegedRole,
  normalizeEmail,
  normalizeIdentity,
  permissionsFromRoles,
} from './identity.utils';

describe('normalizeEmail', () => {
  it('trims surrounding whitespace', () => {
    expect(normalizeEmail('  user@Example.com ')).toBe('user@example.com');
  });

  it('lowercases the address', () => {
    expect(normalizeEmail('User.Name@Example.COM')).toBe('user.name@example.com');
  });

  it('applies Unicode NFKC normalization', () => {
    // full-width latin 'o' collapses to ASCII 'o'
    expect(normalizeEmail('user@example.c\uFF4Fm')).toBe('user@example.com');
  });

  it('returns an empty string for empty input', () => {
    expect(normalizeEmail('   ')).toBe('');
  });

  it('is idempotent', () => {
    const first = normalizeEmail('  User.Name@Example.C\uFF4Fm ');
    expect(normalizeEmail(first)).toBe(first);
  });

  it('collapses equivalent identities to the same canonical key', () => {
    const variants = [
      'User.Name@Example.COM',
      '  user.name@example.com  ',
      'uSEr.naMe@exampl\uFF45.com',
    ];
    const canonical = normalizeEmail('user.name@example.com');
    for (const variant of variants) {
      expect(normalizeEmail(variant)).toBe(canonical);
    }
  });
});

describe('normalizeIdentity', () => {
  it('collapses casing, whitespace and NFKC variants to one canonical key', () => {
    const variants = [
      'STU1001',
      '  stu1001  ',
      'StU1001',
      'STU\uFF11\uFF10\uFF10\uFF11',
    ];
    const canonical = normalizeIdentity('stu1001');
    for (const variant of variants) {
      expect(normalizeIdentity(variant)).toBe(canonical);
    }
  });

  it('matches normalizeEmail semantics for email-like identifiers', () => {
    expect(normalizeIdentity('  User.Name@Example.COM ')).toBe(
      normalizeEmail('  User.Name@Example.COM '),
    );
  });

  it('is idempotent', () => {
    const first = normalizeIdentity('  StU.1001@Ex.C\uFF4Fm ');
    expect(normalizeIdentity(first)).toBe(first);
  });
});

describe('hashToken', () => {
  it('is deterministic and hex-encoded', () => {
    const token = 'abc-123';
    const first = hashToken(token);
    expect(first).toBe(hashToken(token));
    expect(first).toMatch(/^[0-9a-f]{64}$/);
  });

  it('never contains the raw token', () => {
    const token = 'opaque-plaintext-token';
    expect(hashToken(token).includes(token)).toBe(false);
  });

  it('produces a 256-bit digest', () => {
    expect(hashToken('x').length).toBe(64);
  });
});

describe('generateToken', () => {
  it('returns a non-empty opaque token', () => {
    const token = generateToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThanOrEqual(32);
  });

  it('generates unique tokens', () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).not.toBe(b);
  });
});

describe('isPrivilegedRole', () => {
  it('flags platform, organization and institution admin roles', () => {
    expect(isPrivilegedRole('PLATFORM_ADMIN')).toBe(true);
    expect(isPrivilegedRole('ORG_ADMIN')).toBe(true);
    expect(isPrivilegedRole('PRIMARY_INSTITUTION_ADMIN')).toBe(true);
    expect(isPrivilegedRole('TENANT_ADMIN')).toBe(true);
    expect(isPrivilegedRole('INSTITUTION_ADMIN')).toBe(true);
    expect(isPrivilegedRole('PRINCIPAL')).toBe(true);
  });

  it('does not flag low-privilege roles', () => {
    expect(isPrivilegedRole('TEACHER')).toBe(false);
    expect(isPrivilegedRole('PARENT')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isPrivilegedRole('institution_admin')).toBe(true);
  });
});

describe('generateInternalEmail', () => {
  it('generates a deterministic institution-scoped internal address', () => {
    expect(generateInternalEmail('Jane', 'Okafor', 'GA')).toBe('jane.okafor@ga.local');
    expect(generateInternalEmail('Jane', 'Okafor', 'GA')).toBe(
      generateInternalEmail('Jane', 'Okafor', 'GA'),
    );
  });

  it('normalizes names and the institution code', () => {
    expect(generateInternalEmail('  Adaeze', 'Chukwu-Okafor', '  GA-01 ')).toBe(
      'adaeze.chukwuokaf@ga01.local',
    );
  });

  it('uses the supplied suffix to resolve collisions', () => {
    expect(generateInternalEmail('Jane', 'Okafor', 'GA', '2')).toBe(
      'jane.okafor.2@ga.local',
    );
  });

  it('never leaks an external-style address', () => {
    const address = generateInternalEmail('Jane', 'Okafor', 'GA');
    expect(address.endsWith('.local')).toBe(true);
  });
});

describe('permissionsFromRoles', () => {
  it('flattens role permissions and de-duplicates', () => {
    const roles = [
      {
        role: {
          permissions: [
            { permission: { resource: 'identity:invitation', action: 'list' } },
            { permission: { resource: 'identity:invitation', action: 'read' } },
          ],
        },
      },
      {
        role: {
          permissions: [
            { permission: { resource: 'identity:invitation', action: 'list' } },
            { permission: { resource: 'identity:user', action: 'read' } },
          ],
        },
      },
    ];

    expect(permissionsFromRoles(roles)).toEqual([
      'identity:invitation:list',
      'identity:invitation:read',
      'identity:user:read',
    ]);
  });

  it('returns an empty list when the user has no roles/permissions', () => {
    expect(permissionsFromRoles([])).toEqual([]);
  });
});