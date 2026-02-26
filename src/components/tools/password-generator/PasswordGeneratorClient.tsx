'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PASSWORD_GENERATOR_FAQ } from '@/data/passwordGeneratorContent';
import {
  evaluatePasswordStrength,
  generatePassphrase,
  generatePassword,
  PASSWORD_LIMITS,
} from '@/utils/passwordGenerator';

type GeneratorMode = 'password' | 'passphrase';

type ComparisonRow = {
  type: string;
  example: string;
  timeToBreak: string;
};

type SeparatorOption = {
  label: string;
  value: string;
};

const BEST_PRACTICES = [
  {
    title: 'Make passwords long',
    description:
      'Use at least 12 characters. For critical accounts, 16+ gives a stronger safety margin.',
  },
  {
    title: 'Use unique credentials everywhere',
    description:
      'One leaked password should never unlock multiple accounts or services.',
  },
  {
    title: 'Enable two-step verification',
    description:
      'Even if a password leaks, second-factor checks can block account takeover attempts.',
  },
  {
    title: 'Avoid personal details',
    description:
      'Names, birthdays, and public profile details are easy to guess and automate.',
  },
  {
    title: 'Prefer a password manager',
    description:
      'Managers generate and store unique credentials so you do not need to memorize them.',
  },
  {
    title: 'Rotate after security incidents',
    description:
      'If a platform reports a breach, replace the affected password immediately.',
  },
];

const COMMON_MISTAKES = [
  'Reusing one password across many websites.',
  'Choosing short credentials that are easy to brute-force.',
  'Using keyboard patterns such as qwerty123 or 1q2w3e.',
  'Building passwords from personal information found on social media.',
  'Keeping old passwords unchanged after public breach notifications.',
];

const CHECKLIST_ITEMS = [
  'Use two-step verification whenever possible.',
  'Enable device lock with fingerprint, Face ID, or PIN.',
  'Never send passwords through email or chat messages.',
  'Log out from shared or public computers after use.',
  'Avoid saving passwords in browsers on shared devices.',
  'Delete sensitive verification emails after account setup.',
];

const COMPARISON_ROWS: ComparisonRow[] = [
  { type: 'Common sequence', example: '123456', timeToBreak: 'Under 1 second' },
  { type: 'Dictionary word', example: 'password', timeToBreak: 'Under 1 second' },
  { type: 'Personal pattern', example: 'John1988', timeToBreak: 'Minutes' },
  { type: 'Short random', example: 'X9m@wT', timeToBreak: 'Hours to days' },
  {
    type: 'Passphrase (4 words)',
    example: 'ocean-lantern-planet-honey',
    timeToBreak: 'Years to decades',
  },
  {
    type: 'Complex random (16+)',
    example: '4xGz!dL!p29jK!sf#',
    timeToBreak: 'Centuries+',
  },
];

const PASSPHRASE_SEPARATORS: SeparatorOption[] = [
  { label: 'Space', value: ' ' },
  { label: '-', value: '-' },
  { label: '_', value: '_' },
  { label: '.', value: '.' },
  { label: ',', value: ',' },
  { label: '?', value: '?' },
];

function capitalizeWord(value: string): string {
  if (!value) return value;
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function clampNumericInput(
  rawValue: string,
  min: number,
  max: number,
  fallback: number
): number {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

function strengthBarClass(score: number): string {
  if (score <= 0) return 'bg-red-500';
  if (score === 1) return 'bg-orange-500';
  if (score === 2) return 'bg-amber-500';
  if (score === 3) return 'bg-green-500';
  return 'bg-emerald-600';
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Continue to fallback.
  }

  try {
    if (typeof document === 'undefined') return false;
    const input = document.createElement('input');
    input.value = text;
    input.style.position = 'fixed';
    input.style.top = '0';
    input.style.left = '0';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.focus();
    input.select();
    const didCopy = document.execCommand('copy');
    document.body.removeChild(input);
    return didCopy;
  } catch {
    return false;
  }
}

export function PasswordGeneratorClient() {
  const [mode, setMode] = useState<GeneratorMode>('password');
  const [passwordLength, setPasswordLength] = useState<number>(
    PASSWORD_LIMITS.defaultLength
  );
  const [wordCount, setWordCount] = useState<number>(PASSWORD_LIMITS.defaultWords);
  const [passphraseSeparator, setPassphraseSeparator] = useState('-');
  const [capitalizeFirstLetter, setCapitalizeFirstLetter] = useState(true);
  const [addPassphraseNumbers, setAddPassphraseNumbers] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedValue, setGeneratedValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [tipsChecked, setTipsChecked] = useState<boolean[]>(
    CHECKLIST_ITEMS.map(() => false)
  );

  const hasAnyPasswordSetEnabled =
    includeUppercase || includeLowercase || includeNumbers || includeSymbols;
  const usesDefaultAlnumFallback = mode === 'password' && !hasAnyPasswordSetEnabled;

  const buildValue = useCallback(() => {
    try {
      if (mode === 'password') {
        const value = generatePassword({
          length: passwordLength,
          includeUppercase: usesDefaultAlnumFallback ? true : includeUppercase,
          includeLowercase: usesDefaultAlnumFallback ? true : includeLowercase,
          includeNumbers: usesDefaultAlnumFallback ? true : includeNumbers,
          includeSymbols: usesDefaultAlnumFallback ? false : includeSymbols,
        });
        setGeneratedValue(value);
      } else {
        let value = generatePassphrase({
          wordCount,
          separator: passphraseSeparator,
        });

        if (capitalizeFirstLetter) {
          value = value
            .split(passphraseSeparator)
            .map((word) => capitalizeWord(word))
            .join(passphraseSeparator);
        }

        if (addPassphraseNumbers) {
          const suffix = generatePassword({
            length: 2,
            includeUppercase: false,
            includeLowercase: false,
            includeNumbers: true,
            includeSymbols: false,
          });
          value = `${value}${passphraseSeparator}${suffix}`;
        }

        setGeneratedValue(value);
      }
      setErrorMessage('');
      setCopyState('idle');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate password.';
      setGeneratedValue('');
      setErrorMessage(message);
    }
  }, [
    mode,
    usesDefaultAlnumFallback,
    passwordLength,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    wordCount,
    passphraseSeparator,
    capitalizeFirstLetter,
    addPassphraseNumbers,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    buildValue();
  }, [buildValue]);

  const strength = useMemo(
    () => evaluatePasswordStrength(generatedValue, mode),
    [generatedValue, mode]
  );

  const strengthWidth = useMemo(() => {
    const entropy = strength.entropyBits;
    const normalized = Math.max(8, Math.min(100, (entropy / 95) * 100));
    return `${normalized}%`;
  }, [strength.entropyBits]);

  const handleCopy = useCallback(async () => {
    if (!generatedValue) return;
    const didCopy = await copyTextToClipboard(generatedValue);
    if (didCopy) {
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    }
  }, [generatedValue]);

  const handleTipToggle = useCallback((index: number) => {
    setTipsChecked((previous) =>
      previous.map((value, itemIndex) => (itemIndex === index ? !value : value))
    );
  }, []);

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 text-center text-[11px] font-medium tracking-wide text-gray-500 dark:text-gray-400">
          <Link href="/" prefetch={false} className="hover:text-gray-900 dark:hover:text-white">
            Home
          </Link>
          <span className="mx-2">{'>'}</span>
          <Link
            href="/tools"
            prefetch={false}
            className="hover:text-gray-900 dark:hover:text-white"
          >
            Tools
          </Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-gray-700 dark:text-gray-300">Password Generator</span>
        </div>

        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl dark:text-gray-100">
            Free Password Generator
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-400">
            Generate strong passwords or passphrases instantly. Everything runs locally
            in your browser for private, fast, and secure credential creation.
          </p>
        </header>

        <section className="mx-auto max-w-3xl rounded-[2rem] border border-gray-200/90 bg-[#f4f4f7] p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.35)] ring-1 ring-black/5 dark:border-white/10 dark:bg-[#131313] dark:ring-white/10 sm:p-8">
          <div className="rounded-full border border-gray-300/90 bg-[#ececf1] px-6 py-4 font-mono text-[1.1rem] font-semibold tracking-wide text-gray-900 dark:border-white/15 dark:bg-[#1f1f1f] dark:text-gray-100 sm:text-[2rem]">
            <input
              type="text"
              readOnly
              spellCheck={false}
              autoComplete="off"
              value={generatedValue || 'No value generated'}
              className="w-full border-none bg-transparent text-left outline-none"
              title={generatedValue || 'No value generated'}
            />
          </div>

          <div className="mt-5 h-2 rounded-full bg-[#d9d9df] dark:bg-[#2a2a2f]">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${strengthBarClass(
                strength.score
              )}`}
              style={{ width: strengthWidth }}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={buildValue}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-[#f0f0f4] px-5 py-3 text-[1.05rem] font-semibold text-gray-900 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/15 dark:bg-[#222] dark:text-gray-100 dark:hover:bg-[#2a2a2a]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8 8 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8 8 0 0 1-15.357-2m15.357 2H15" />
              </svg>
              Generate new
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!generatedValue}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[1.05rem] font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
                copyState === 'copied'
                  ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700'
                  : 'bg-brand-700 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500'
              }`}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h10" />
              </svg>
              {copyState === 'copied' ? 'Copied' : 'Copy password'}
            </button>
          </div>

          <div className="mt-6 rounded-full border border-gray-300 bg-[#dad9e2] p-1 dark:border-white/15 dark:bg-[#252530]">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setMode('password')}
                className={`rounded-full px-5 py-3 text-xl font-semibold transition ${
                  mode === 'password'
                    ? 'bg-[#f4f4f7] text-gray-900 shadow-sm dark:bg-[#1a1a1a] dark:text-gray-100'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => setMode('passphrase')}
                className={`rounded-full px-5 py-3 text-xl font-semibold transition ${
                  mode === 'passphrase'
                    ? 'bg-[#f4f4f7] text-gray-900 shadow-sm dark:bg-[#1a1a1a] dark:text-gray-100'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                Passphrase
              </button>
            </div>
          </div>

          {mode === 'password' ? (
            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[auto_70px_1fr]">
                <label
                  htmlFor="password-length"
                  className="text-xl font-semibold text-gray-900 dark:text-gray-100"
                >
                  Password length
                </label>
                <input
                  id="password-length-number"
                  type="number"
                  min={PASSWORD_LIMITS.minLength}
                  max={PASSWORD_LIMITS.maxLength}
                  value={passwordLength}
                  onChange={(event) => {
                    const nextValue = clampNumericInput(
                      event.target.value,
                      PASSWORD_LIMITS.minLength,
                      PASSWORD_LIMITS.maxLength,
                      PASSWORD_LIMITS.defaultLength
                    );
                    setPasswordLength(nextValue);
                  }}
                  className="h-11 rounded-xl border border-gray-300 bg-[#f0f0f4] px-3 text-center text-lg font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/40 dark:border-white/15 dark:bg-[#1f1f24] dark:text-gray-100"
                />
                <input
                  id="password-length"
                  type="range"
                  min={PASSWORD_LIMITS.minLength}
                  max={PASSWORD_LIMITS.maxLength}
                  value={passwordLength}
                  onChange={(event) => setPasswordLength(Number(event.target.value))}
                  className="h-2 w-full accent-brand-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <label className="inline-flex items-center gap-2 text-lg text-gray-900 dark:text-gray-100">
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    onChange={(event) => setIncludeUppercase(event.target.checked)}
                    className="h-5 w-5 accent-brand-700"
                  />
                  Uppercase
                </label>
                <label className="inline-flex items-center gap-2 text-lg text-gray-900 dark:text-gray-100">
                  <input
                    type="checkbox"
                    checked={includeLowercase}
                    onChange={(event) => setIncludeLowercase(event.target.checked)}
                    className="h-5 w-5 accent-brand-700"
                  />
                  Lowercase
                </label>
                <label className="inline-flex items-center gap-2 text-lg text-gray-900 dark:text-gray-100">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(event) => setIncludeNumbers(event.target.checked)}
                    className="h-5 w-5 accent-brand-700"
                  />
                  Numbers
                </label>
                <label className="inline-flex items-center gap-2 text-lg text-gray-900 dark:text-gray-100">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(event) => setIncludeSymbols(event.target.checked)}
                    className="h-5 w-5 accent-brand-700"
                  />
                  Symbols
                </label>
              </div>

              {usesDefaultAlnumFallback ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No checkbox selected. Generating with letters and numbers by default.
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[auto_70px_1fr]">
                <label
                  htmlFor="passphrase-words"
                  className="text-xl font-semibold text-gray-900 dark:text-gray-100"
                >
                  Number of words
                </label>
                <input
                  type="number"
                  min={PASSWORD_LIMITS.minWords}
                  max={PASSWORD_LIMITS.maxWords}
                  value={wordCount}
                  onChange={(event) => {
                    const nextValue = clampNumericInput(
                      event.target.value,
                      PASSWORD_LIMITS.minWords,
                      PASSWORD_LIMITS.maxWords,
                      PASSWORD_LIMITS.defaultWords
                    );
                    setWordCount(nextValue);
                  }}
                  className="h-11 rounded-xl border border-gray-300 bg-[#f0f0f4] px-3 text-center text-lg font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/40 dark:border-white/15 dark:bg-[#1f1f24] dark:text-gray-100"
                />
                <input
                  id="passphrase-words"
                  type="range"
                  min={PASSWORD_LIMITS.minWords}
                  max={PASSWORD_LIMITS.maxWords}
                  value={wordCount}
                  onChange={(event) => setWordCount(Number(event.target.value))}
                  className="h-2 w-full accent-brand-600"
                />
              </div>

              <div className="rounded-2xl border border-gray-200/90 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5 sm:border-0 sm:bg-transparent sm:p-0">
                <p className="text-center text-xl font-semibold text-gray-900 dark:text-gray-100 sm:text-left">
                  Separator
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-5 sm:gap-y-3">
                  {PASSPHRASE_SEPARATORS.map((separator) => (
                    <label
                      key={`${separator.label}-${separator.value}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300/90 bg-white/75 px-3 py-2 text-lg text-gray-900 dark:border-white/15 dark:bg-white/5 dark:text-gray-100 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0"
                    >
                      <input
                        type="radio"
                        name="passphrase-separator"
                        checked={passphraseSeparator === separator.value}
                        onChange={() => setPassphraseSeparator(separator.value)}
                        className="h-5 w-5 accent-brand-700"
                      />
                      {separator.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6">
                <label className="inline-flex items-center gap-2 text-lg text-gray-900 dark:text-gray-100">
                  <input
                    type="checkbox"
                    checked={capitalizeFirstLetter}
                    onChange={(event) => setCapitalizeFirstLetter(event.target.checked)}
                    className="h-5 w-5 accent-brand-700"
                  />
                  Capitalize the first letter
                </label>
                <label className="inline-flex items-center gap-2 text-lg text-gray-900 dark:text-gray-100">
                  <input
                    type="checkbox"
                    checked={addPassphraseNumbers}
                    onChange={(event) => setAddPassphraseNumbers(event.target.checked)}
                    className="h-5 w-5 accent-brand-700"
                  />
                  Add numbers
                </label>
              </div>
            </div>
          )}

          {errorMessage ? (
            <p className="mt-4 text-lg font-semibold text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
          ) : null}

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            We do not store or share passwords you generate.
          </p>

          <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            Strength: {strength.label} - Entropy: {strength.entropyBits} bits - Estimated
            crack time: {strength.crackTime}
          </p>
        </section>

        <section className="mt-10 rounded-[2rem] border border-gray-200/80 bg-white/85 p-6 ring-1 ring-black/5 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:ring-white/10 sm:p-8">
          <h2 className="inline-flex items-center gap-3 text-2xl font-black text-gray-900 dark:text-gray-100">
            <svg
              className="h-6 w-6 text-brand-700 dark:text-brand-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 10h18M9 4v16M15 4v16" />
            </svg>
            Password Strength Comparison
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 text-sm dark:border-white/10 dark:bg-white/5">
              <thead className="bg-gray-100/80 text-left text-xs uppercase tracking-widest text-gray-700 dark:bg-white/10 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Password Type</th>
                  <th className="px-4 py-3">Example</th>
                  <th className="px-4 py-3">Time to Break</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    key={`${row.type}-${row.example}`}
                    className="border-t border-gray-200/80 dark:border-white/10"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">
                      {row.type}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">
                      {row.example}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {row.timeToBreak}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="inline-flex items-center gap-3 text-4xl font-black text-gray-900 dark:text-gray-100">
            <svg
              className="h-8 w-8 text-brand-700 dark:text-brand-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Extra Security Tips
          </h2>
          <p className="mt-3 text-base text-gray-700 dark:text-gray-300">
            Check yourself by clicking the checkboxes below:
          </p>
          <div className="mt-5 space-y-3">
            {CHECKLIST_ITEMS.map((item, index) => (
              <label
                key={item}
                className="flex items-start gap-3 text-lg text-gray-800 dark:text-gray-200"
              >
                <input
                  type="checkbox"
                  checked={tipsChecked[index]}
                  onChange={() => handleTipToggle(index)}
                  className="mt-1 h-5 w-5 accent-brand-700"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="mt-10 space-y-8 rounded-[2rem] border border-gray-200/80 bg-white/85 p-6 ring-1 ring-black/5 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:ring-white/10 sm:p-8">
          <article className="space-y-3">
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
              Why Use a Password Generator?
            </h2>
            <p className="text-base leading-8 text-gray-700 dark:text-gray-300">
              Weak credentials remain one of the most common causes of account breaches.
              A generator removes guessable patterns by creating high-entropy passwords
              that are difficult to brute-force and hard to predict.
            </p>
            <p className="text-base leading-8 text-gray-700 dark:text-gray-300">
              If every account gets a different password, one leaked platform no longer
              exposes your entire digital identity. This is the fastest practical security
              improvement for most users.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
              How to Create Strong Passwords
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-base leading-8 text-gray-700 dark:text-gray-300">
              <li>Choose long credentials with enough entropy.</li>
              <li>Mix character classes for standard passwords.</li>
              <li>Use random passphrases when memorability is needed.</li>
              <li>Never reuse passwords between services.</li>
              <li>Store them in a trusted password manager.</li>
            </ul>
          </article>

          <article className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
              Password Security Best Practices
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {BEST_PRACTICES.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-gray-100">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-gray-700 dark:text-gray-300">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="space-y-3">
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
              How Our Password Generator Works
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-base leading-8 text-gray-700 dark:text-gray-300">
              <li>Uses browser cryptographic randomness for secure output.</li>
              <li>Builds passwords with selected character sets and length.</li>
              <li>Supports random passphrases from a local word list.</li>
              <li>Calculates entropy-based strength and crack-time estimates.</li>
              <li>Runs fully local without sending generated values to servers.</li>
            </ul>
          </article>

          <article className="space-y-3">
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
              Common Password Mistakes to Avoid
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-base leading-8 text-gray-700 dark:text-gray-300">
              {COMMON_MISTAKES.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="mt-10 rounded-[2rem] border border-gray-200/80 bg-white/85 p-6 ring-1 ring-black/5 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:ring-white/10 sm:p-8">
          <h2 className="inline-flex items-center gap-3 text-4xl font-black text-gray-900 dark:text-gray-100">
            <svg
              className="h-8 w-8 text-brand-700 dark:text-brand-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4" />
              <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
            </svg>
            Frequently asked questions
          </h2>
          <div className="mt-6">
            {PASSWORD_GENERATOR_FAQ.map((item) => (
              <details
                key={item.question}
                className="group border-b border-gray-200/80 py-4 dark:border-white/10"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  <span>{item.question}</span>
                  <span className="text-gray-400 transition-transform duration-200 group-open:rotate-180">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 pr-8 text-sm leading-7 text-gray-700 dark:text-gray-300">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            Couldn&apos;t find something? Learn more in our{' '}
            <Link href="/privacy#contact" className="underline hover:text-gray-900 dark:hover:text-white">
              help center
            </Link>
            .
          </p>
        </section>

        <section className="mt-10 rounded-[2rem] border border-gray-200/80 bg-white/85 p-6 ring-1 ring-black/5 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:ring-white/10 sm:p-8">
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">
            Why Choose Our Password Generator
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-gray-100">
                Private by design
              </h3>
              <p className="mt-2 text-sm leading-7 text-gray-700 dark:text-gray-300">
                Everything runs in your browser, with no password storage on our side.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-gray-100">
                Works with Temp Mail Lab
              </h3>
              <p className="mt-2 text-sm leading-7 text-gray-700 dark:text-gray-300">
                Use secure credentials with disposable email for safer low-trust signups.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-gray-100">
                Instant and practical
              </h3>
              <p className="mt-2 text-sm leading-7 text-gray-700 dark:text-gray-300">
                Generate and copy strong passwords in one click with clear strength feedback.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-gray-200/80 bg-white/85 p-8 text-center ring-1 ring-black/5 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:ring-white/10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            Improve Account Privacy
          </p>
          <h2 className="mt-3 text-3xl font-black text-gray-900 dark:text-gray-100">
            Pair Strong Passwords with Temp Mail
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400">
            Strong credentials reduce account takeovers. Temporary email reduces data
            exposure during signups. Use both for safer online onboarding.
          </p>
          <Link
            href="/"
            prefetch={false}
            className="mt-6 inline-flex rounded-full bg-brand-700 px-6 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-lg dark:bg-brand-600 dark:hover:bg-brand-500"
          >
            Use Temp Mail Lab
          </Link>
        </section>
      </div>
    </div>
  );
}

