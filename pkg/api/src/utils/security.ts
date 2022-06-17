import { createHash, randomBytes } from 'crypto';

export const generateKeys = (amount: number) => {
  if (amount < 0) {
    return [];
  }
  const keys = new Array<string>();
  for (let i = 0; i < amount; i++) {
    keys.push(
      createHash('sha256')
        .update(randomBytes(64).toString('hex'))
        .digest('hex')
        .toString(),
    );
  }
  return keys;
};
