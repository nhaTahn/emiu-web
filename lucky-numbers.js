export function randomBelow(max, source = globalThis.crypto) {
  if (!Number.isInteger(max) || max < 1 || max > 0x100000000) throw new RangeError('Khoảng bốc số không hợp lệ.');
  const word = new Uint32Array(1), limit = 0x100000000 - (0x100000000 % max);
  do { source.getRandomValues(word); } while (word[0] >= limit);
  return word[0] % max;
}

export function drawLuckyBundle(pick = randomBelow) {
  return { number: drawLuckyNumber(pick), luckySet: drawLuckySet(pick) };
}

export function drawLuckyNumber(pick = randomBelow) {
  return String(pick(99) + 1).padStart(2, '0');
}

export function drawLuckySet(pick = randomBelow) {
  const pool = Array.from({ length: 45 }, (_, index) => index + 1);
  return Array.from({ length: 6 }, () => pool.splice(pick(pool.length), 1)[0]).sort((a, b) => a - b);
}

export function normaliseLuckySet(value) {
  if (!Array.isArray(value) || value.length !== 6 || new Set(value).size !== 6 || !value.every(number => Number.isInteger(number) && number >= 1 && number <= 45)) return undefined;
  return [...value].sort((a, b) => a - b);
}

export function formatLuckySet(value) {
  return normaliseLuckySet(value)?.map(number => String(number).padStart(2, '0')).join(' · ') || '';
}
