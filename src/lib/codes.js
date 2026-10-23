import { randomInt } from 'crypto';

// Unambiguous characters only (no 0/O, 1/I)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function makeCode() {
  let s = '';
  for (let i = 0; i < 8; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `HB-${s}`;
}
