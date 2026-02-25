import { PASSWORD_WORDS, PASSWORD_WORD_LIST_SIZE } from '@/data/passwordWords';

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/\\|~';

const MIN_PASSWORD_LENGTH = 1;
const MAX_PASSWORD_LENGTH = 64;
const DEFAULT_PASSWORD_LENGTH = 14;
const MIN_PASSPHRASE_WORDS = 2;
const MAX_PASSPHRASE_WORDS = 11;
const DEFAULT_PASSPHRASE_WORDS = 4;

export interface PasswordGeneratorOptions {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
}

export interface PassphraseGeneratorOptions {
  wordCount?: number;
  separator?: string;
}

export type PasswordStrengthLabel =
  | 'Very weak'
  | 'Weak'
  | 'Fair'
  | 'Strong'
  | 'Very strong';

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: PasswordStrengthLabel;
  entropyBits: number;
  crackTime: string;
}

type PasswordCandidate = {
  value: string;
  requiredSetsUsed: string[];
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getCryptoRandomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error('Invalid random range');
  }

  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.getRandomValues) {
    throw new Error('Secure random generator is not available');
  }

  const maxUint32 = 0xffffffff;
  const range = maxExclusive;
  const limit = maxUint32 - ((maxUint32 + 1) % range);
  const randomArray = new Uint32Array(1);

  let randomValue = 0;
  do {
    cryptoObj.getRandomValues(randomArray);
    randomValue = randomArray[0];
  } while (randomValue > limit);

  return randomValue % range;
}

function pickRandomChar(charset: string): string {
  const index = getCryptoRandomInt(charset.length);
  return charset[index];
}

function shuffleInPlace<T>(values: T[]): void {
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = getCryptoRandomInt(i + 1);
    [values[i], values[j]] = [values[j], values[i]];
  }
}

function resolveEnabledSets(options: PasswordGeneratorOptions): string[] {
  const includeLowercase = options.includeLowercase ?? true;
  const includeUppercase = options.includeUppercase ?? true;
  const includeNumbers = options.includeNumbers ?? true;
  const includeSymbols = options.includeSymbols ?? true;

  const sets: string[] = [];
  if (includeLowercase) sets.push(LOWERCASE);
  if (includeUppercase) sets.push(UPPERCASE);
  if (includeNumbers) sets.push(NUMBERS);
  if (includeSymbols) sets.push(SYMBOLS);
  return sets;
}

function createsTripleRepeat(output: string[], nextChar: string): boolean {
  const length = output.length;
  if (length < 2) return false;
  return output[length - 1] === nextChar && output[length - 2] === nextChar;
}

function createsAsciiSequence(output: string[], nextChar: string): boolean {
  const length = output.length;
  if (length < 2) return false;

  const a = output[length - 2].charCodeAt(0);
  const b = output[length - 1].charCodeAt(0);
  const c = nextChar.charCodeAt(0);
  const isAscending = b === a + 1 && c === b + 1;
  const isDescending = b === a - 1 && c === b - 1;

  return isAscending || isDescending;
}

function pickCharWithPatternGuard(charset: string, current: string[]): string {
  const maxAttempts = 12;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = pickRandomChar(charset);
    if (!createsTripleRepeat(current, candidate) && !createsAsciiSequence(current, candidate)) {
      return candidate;
    }
  }
  return pickRandomChar(charset);
}

function pickRequiredSetsForLength(targetLength: number, sets: string[]): string[] {
  if (targetLength >= sets.length) return sets;
  const setIndexes = sets.map((_, index) => index);
  shuffleInPlace(setIndexes);
  return setIndexes.slice(0, targetLength).map((index) => sets[index]);
}

function buildPasswordCandidate(
  targetLength: number,
  sets: string[],
  mergedCharset: string
): PasswordCandidate {
  const requiredSetsUsed = pickRequiredSetsForLength(targetLength, sets);
  const output: string[] = [];

  for (const set of requiredSetsUsed) {
    output.push(pickCharWithPatternGuard(set, output));
  }

  while (output.length < targetLength) {
    output.push(pickCharWithPatternGuard(mergedCharset, output));
  }

  shuffleInPlace(output);
  return {
    value: output.join(''),
    requiredSetsUsed,
  };
}

function containsCharFromSet(value: string, set: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    if (set.indexOf(value[index]) !== -1) return true;
  }
  return false;
}

export function generatePassword(options: PasswordGeneratorOptions = {}): string {
  const targetLength = clamp(
    Math.floor(options.length ?? DEFAULT_PASSWORD_LENGTH),
    MIN_PASSWORD_LENGTH,
    MAX_PASSWORD_LENGTH
  );

  const sets = resolveEnabledSets(options);
  if (sets.length === 0) {
    throw new Error('Enable at least one character type');
  }

  const mergedCharset = sets.join('');
  const attempts = clamp(Math.ceil(targetLength / 4), 3, 8);

  let bestValue = '';
  let bestScore = Number.NEGATIVE_INFINITY;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const candidate = buildPasswordCandidate(targetLength, sets, mergedCharset);
    const score = candidatePasswordQuality(candidate.value, candidate.requiredSetsUsed);
    if (score > bestScore || !bestValue) {
      bestValue = candidate.value;
      bestScore = score;
    }
  }

  return bestValue;
}

export function generatePassphrase(
  options: PassphraseGeneratorOptions = {}
): string {
  const wordCount = clamp(
    Math.floor(options.wordCount ?? DEFAULT_PASSPHRASE_WORDS),
    MIN_PASSPHRASE_WORDS,
    MAX_PASSPHRASE_WORDS
  );
  const separator =
    typeof options.separator === 'string' && options.separator.length
      ? options.separator
      : '-';

  const wordPool = PASSWORD_WORDS.filter((word) => /^[a-z]+$/.test(word) && word.length >= 4);
  const safePool = wordPool.length ? wordPool : PASSWORD_WORDS;

  const buildWordsCandidate = (): string[] => {
    const words: string[] = [];
    const usedIndexes = new Set<number>();

    while (words.length < wordCount) {
      const wordIndex = getCryptoRandomInt(safePool.length);
      const canUseUnique = safePool.length >= wordCount;
      if (canUseUnique && usedIndexes.has(wordIndex)) {
        continue;
      }
      usedIndexes.add(wordIndex);
      words.push(safePool[wordIndex]);
    }

    return words;
  };

  const passphraseWordsQuality = (words: string[]): number => {
    if (!words.length) return 0;
    const uniqueWords = new Set(words).size;
    const uniqueFirstLetters = new Set(words.map((word) => word[0])).size;
    const averageLength =
      words.reduce((total, word) => total + word.length, 0) / words.length;

    return (
      (uniqueWords / words.length) * 7 +
      (uniqueFirstLetters / words.length) * 3 +
      Math.min(averageLength, 8) * 0.55
    );
  };

  let bestWords: string[] = [];
  let bestScore = Number.NEGATIVE_INFINITY;
  const attempts = clamp(wordCount + 1, 3, 7);

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const candidateWords = buildWordsCandidate();
    const score = passphraseWordsQuality(candidateWords);
    if (score > bestScore || bestWords.length === 0) {
      bestScore = score;
      bestWords = candidateWords;
    }
  }

  return bestWords.join(separator);
}

function estimatePasswordEntropy(value: string): number {
  let charsetSize = 0;
  if (/[a-z]/.test(value)) charsetSize += 26;
  if (/[A-Z]/.test(value)) charsetSize += 26;
  if (/[0-9]/.test(value)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(value)) charsetSize += SYMBOLS.length;

  if (charsetSize === 0) {
    charsetSize = Math.max(1, new Set(value.split('')).size);
  }

  return value.length * Math.log2(charsetSize);
}

function sequencePenalty(value: string): number {
  if (value.length < 3) return 0;
  let penalty = 0;

  for (let i = 2; i < value.length; i += 1) {
    const a = value.charCodeAt(i - 2);
    const b = value.charCodeAt(i - 1);
    const c = value.charCodeAt(i);

    const isAscending = b === a + 1 && c === b + 1;
    const isDescending = b === a - 1 && c === b - 1;
    if (isAscending || isDescending) {
      penalty += 1.6;
    }
  }

  return penalty;
}

function repeatPenalty(value: string): number {
  let repeats = 0;
  for (let i = 1; i < value.length; i += 1) {
    if (value[i] === value[i - 1]) {
      repeats += 1;
    }
  }
  return repeats * 1.35;
}

function candidatePasswordQuality(value: string, requiredSetsUsed: string[]): number {
  if (!value.length) return 0;

  const uniqueRatio = new Set(value.split('')).size / value.length;
  const setCoverage = requiredSetsUsed.reduce((total, set) => {
    return total + (containsCharFromSet(value, set) ? 1 : 0);
  }, 0);
  const coverageScore = requiredSetsUsed.length
    ? setCoverage / requiredSetsUsed.length
    : 0;
  const penalty = sequencePenalty(value) + repeatPenalty(value);

  return uniqueRatio * 14 + coverageScore * 6 - penalty * 1.7;
}

function characterDistributionAdjustment(value: string): number {
  if (!value.length) return 0;

  const frequencies = new Map<string, number>();
  for (const char of value) {
    frequencies.set(char, (frequencies.get(char) || 0) + 1);
  }

  const uniqueRatio = frequencies.size / value.length;
  const uniqueBonus = (uniqueRatio - 0.55) * 12;

  let shannon = 0;
  for (const count of Array.from(frequencies.values())) {
    const p = count / value.length;
    shannon -= p * Math.log2(p);
  }
  const shannonBonus = shannon * 1.4;

  const categoryBonus =
    (/[a-z]/.test(value) ? 0.8 : 0) +
    (/[A-Z]/.test(value) ? 0.8 : 0) +
    (/[0-9]/.test(value) ? 0.8 : 0) +
    (/[^a-zA-Z0-9]/.test(value) ? 1 : 0);

  const penalty = sequencePenalty(value) + repeatPenalty(value);
  return uniqueBonus + shannonBonus + categoryBonus - penalty;
}

function estimatePassphraseEntropy(value: string): number {
  const words = value
    .trim()
    .split(/[^a-zA-Z]+/)
    .filter(Boolean);
  const wordCount = Math.max(1, words.length);

  let entropy = wordCount * Math.log2(PASSWORD_WORD_LIST_SIZE);
  if (/[0-9]/.test(value)) entropy += 4;
  if (/[^a-zA-Z0-9-]/.test(value)) entropy += 6;

  return entropy;
}

function passphraseAdjustment(value: string): number {
  const words = value
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());

  if (!words.length) return 0;

  const uniqueCount = new Set(words).size;
  const uniquenessBonus = (uniqueCount / words.length) * 6;
  const duplicatePenalty = (words.length - uniqueCount) * 2.2;
  const numberBonus = /[0-9]/.test(value) ? 1.8 : 0;

  return uniquenessBonus + numberBonus - duplicatePenalty;
}

function scoreFromEntropy(
  entropyBits: number
): { score: 0 | 1 | 2 | 3 | 4; label: PasswordStrengthLabel; crackTime: string } {
  if (entropyBits < 28) {
    return { score: 0, label: 'Very weak', crackTime: 'Under 1 second' };
  }
  if (entropyBits < 36) {
    return { score: 1, label: 'Weak', crackTime: 'Minutes to hours' };
  }
  if (entropyBits < 60) {
    return { score: 2, label: 'Fair', crackTime: 'Days to months' };
  }
  if (entropyBits < 80) {
    return { score: 3, label: 'Strong', crackTime: 'Years to decades' };
  }
  return { score: 4, label: 'Very strong', crackTime: 'Centuries or more' };
}

export function evaluatePasswordStrength(
  value: string,
  mode: 'password' | 'passphrase'
): PasswordStrengthResult {
  if (!value.trim()) {
    return {
      score: 0,
      label: 'Very weak',
      entropyBits: 0,
      crackTime: 'Under 1 second',
    };
  }

  const baseEntropy =
    mode === 'passphrase'
      ? estimatePassphraseEntropy(value)
      : estimatePasswordEntropy(value);
  const adjustment =
    mode === 'passphrase'
      ? passphraseAdjustment(value)
      : characterDistributionAdjustment(value);
  const entropyBits = Math.max(0, baseEntropy + adjustment);

  const summary = scoreFromEntropy(entropyBits);
  return {
    score: summary.score,
    label: summary.label,
    entropyBits: Number(entropyBits.toFixed(1)),
    crackTime: summary.crackTime,
  };
}

export const PASSWORD_LIMITS = {
  minLength: MIN_PASSWORD_LENGTH,
  maxLength: MAX_PASSWORD_LENGTH,
  defaultLength: DEFAULT_PASSWORD_LENGTH,
  minWords: MIN_PASSPHRASE_WORDS,
  maxWords: MAX_PASSPHRASE_WORDS,
  defaultWords: DEFAULT_PASSPHRASE_WORDS,
} as const;
