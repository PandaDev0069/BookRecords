import { generateUniqueId } from '../uuid';

describe('generateUniqueId', () => {
  // Store original crypto object
  const originalCrypto = global.crypto;

  afterEach(() => {
    // Restore original crypto object after each test
    Object.defineProperty(global, 'crypto', {
      value: originalCrypto,
      writable: true,
      configurable: true,
    });
  });

  describe('when crypto.randomUUID is available', () => {
    it('should use crypto.randomUUID to generate UUID', () => {
      const mockUUID = '550e8400-e29b-41d4-a716-446655440000';
      const mockRandomUUID = jest.fn(() => mockUUID);

      // Mock crypto.randomUUID by replacing the entire crypto object
      Object.defineProperty(global, 'crypto', {
        value: {
          randomUUID: mockRandomUUID,
        },
        writable: true,
        configurable: true,
      });

      const result = generateUniqueId();

      expect(mockRandomUUID).toHaveBeenCalled();
      expect(result).toBe(mockUUID);
    });

    it('should generate valid UUID v4 format', () => {
      // Ensure crypto.randomUUID exists in test environment
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        const id = generateUniqueId();

        // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
        const uuidV4Regex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(id).toMatch(uuidV4Regex);
      }
    });
  });

  describe('when crypto.randomUUID is not available (fallback)', () => {
    beforeEach(() => {
      // Mock environment without crypto.randomUUID
      Object.defineProperty(global, 'crypto', {
        value: undefined,
        writable: true,
        configurable: true,
      });
    });

    it('should generate a UUID v4-like string using fallback', () => {
      const id = generateUniqueId();

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidV4Regex);
    });

    it('should generate different IDs on consecutive calls', () => {
      const id1 = generateUniqueId();
      const id2 = generateUniqueId();
      const id3 = generateUniqueId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should have correct version number (4) in UUID', () => {
      const id = generateUniqueId();
      const versionChar = id.charAt(14); // 15th character (0-indexed)

      expect(versionChar).toBe('4');
    });

    it('should have correct variant bits in UUID', () => {
      const id = generateUniqueId();
      const variantChar = id.charAt(19); // 20th character (0-indexed)

      // Variant should be 8, 9, a, or b
      expect(['8', '9', 'a', 'b']).toContain(variantChar.toLowerCase());
    });
  });

  describe('uniqueness', () => {
    it('should generate unique IDs when called multiple times rapidly', () => {
      const ids = new Set<string>();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        ids.add(generateUniqueId());
      }

      // All IDs should be unique
      expect(ids.size).toBe(iterations);
    });

    it('should not have collisions when creating IDs in quick succession', () => {
      // This tests the original problem with Date.now().toString()
      const ids: string[] = [];

      for (let i = 0; i < 100; i++) {
        ids.push(generateUniqueId());
      }

      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('format validation', () => {
    it('should always return a string with correct length', () => {
      const id = generateUniqueId();

      // UUID format is 36 characters (32 hex + 4 hyphens)
      expect(id).toHaveLength(36);
    });

    it('should have hyphens in correct positions', () => {
      const id = generateUniqueId();

      expect(id.charAt(8)).toBe('-');
      expect(id.charAt(13)).toBe('-');
      expect(id.charAt(18)).toBe('-');
      expect(id.charAt(23)).toBe('-');
    });

    it('should only contain valid hexadecimal characters and hyphens', () => {
      const id = generateUniqueId();
      const validCharsRegex = /^[0-9a-f-]+$/i;

      expect(id).toMatch(validCharsRegex);
    });
  });

  describe('when crypto exists but randomUUID does not', () => {
    beforeEach(() => {
      // Mock environment with crypto but no randomUUID
      Object.defineProperty(global, 'crypto', {
        value: {
          randomUUID: undefined,
        },
        writable: true,
        configurable: true,
      });
    });

    it('should fall back to manual UUID generation', () => {
      const id = generateUniqueId();
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(id).toMatch(uuidV4Regex);
    });
  });
});
