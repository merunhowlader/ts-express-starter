import {
  hashPassword,
  verifyPassword,
} from '../../../src/common/utils/password.js';

describe('Password utility', () => {
  it('should hash a password', async () => {
    const password = 'TestPassword123!';

    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash).toBeTruthy();
  });

  it('should verify a correct password', async () => {
    const password = 'TestPassword123!';

    const hash = await hashPassword(password);

    const result = await verifyPassword(
      password,
      hash,
    );

    expect(result).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const password = 'TestPassword123!';
    const wrongPassword = 'WrongPassword123!';

    const hash = await hashPassword(password);

    const result = await verifyPassword(
      wrongPassword,
      hash,
    );

    expect(result).toBe(false);
  });
});