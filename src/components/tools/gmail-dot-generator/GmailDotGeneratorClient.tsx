'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import {
  GMAIL_DOT_BEST_PRACTICES,
  GMAIL_DOT_COMMON_MISTAKES,
  GMAIL_DOT_COMPARISON_ROWS,
  GMAIL_DOT_GENERATOR_FAQ,
  GMAIL_DOT_REFERENCE_LINKS,
  GMAIL_DOT_SEARCH_TERMS,
} from '@/data/gmailDotGeneratorContent';

const MAX_ALIAS_COUNT = 1024;
const MAX_PLUS_TAGS = 12;
const MAX_PLUS_TAG_LENGTH = 32;
const EMAIL_DOMAINS = ['gmail.com', 'googlemail.com'] as const;

type CopyState = 'idle' | 'copied';

type GmailParseResult = {
  localBase: string;
  domain: (typeof EMAIL_DOMAINS)[number];
};

function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

function estimateTotalPossibleText(
  localBaseLength: number,
  domainCount: number,
  plusTagCount: number,
  includeDot: boolean
): string {
  const exponent = includeDot ? Math.max(0, localBaseLength - 1) : 0;
  const multiplier = domainCount * (1 + plusTagCount);

  if (exponent <= 52) {
    return formatNumber(Math.pow(2, exponent) * multiplier);
  }

  return `~2^${exponent} x ${multiplier}`;
}

function parseInputAddress(rawValue: string): GmailParseResult | null {
  const input = rawValue.trim().toLowerCase();
  if (!input || input.includes(' ')) return null;

  const parts = input.split('@');
  if (parts.length !== 2) return null;

  const localRaw = parts[0] || '';
  const domainRaw = parts[1] || '';
  if (!EMAIL_DOMAINS.includes(domainRaw as (typeof EMAIL_DOMAINS)[number])) {
    return null;
  }

  const localWithoutPlus = localRaw.split('+')[0] || '';
  const localBase = localWithoutPlus.replace(/\./g, '');
  if (!localBase || !/^[a-z0-9_-]+$/.test(localBase)) {
    return null;
  }

  return {
    localBase,
    domain: domainRaw as (typeof EMAIL_DOMAINS)[number],
  };
}

function parsePlusTags(rawValue: string): string[] {
  const tags = rawValue
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .map((tag) => tag.replace(/[^a-z0-9._-]/g, ''))
    .filter((tag) => Boolean(tag) && tag.length <= MAX_PLUS_TAG_LENGTH);

  return Array.from(new Set(tags)).slice(0, MAX_PLUS_TAGS);
}

function generateDotLocals(localBase: string, maxCount: number): string[] {
  if (localBase.length <= 1) return [localBase];
  const max = Math.max(1, maxCount);
  const gapCount = localBase.length - 1;
  const results: string[] = [localBase];
  if (results.length >= max) return results;

  const buildFromGapIndexes = (indexes: number[]) => {
    const gapSet = new Set(indexes);
    let out = '';
    for (let i = 0; i < localBase.length; i += 1) {
      out += localBase[i];
      if (i < localBase.length - 1 && gapSet.has(i)) {
        out += '.';
      }
    }
    return out;
  };

  const walkCombinations = (
    dotCount: number,
    startGap: number,
    chosen: number[]
  ): boolean => {
    if (chosen.length === dotCount) {
      results.push(buildFromGapIndexes(chosen));
      return results.length >= max;
    }

    for (let gap = startGap; gap < gapCount; gap += 1) {
      chosen.push(gap);
      const reachedLimit = walkCombinations(dotCount, gap + 1, chosen);
      chosen.pop();
      if (reachedLimit) return true;
    }
    return false;
  };

  // Ordered generation:
  // 1) no-dot version first
  // 2) all 1-dot variants (left to right)
  // 3) all 2-dot variants ... and so on
  for (let dots = 1; dots <= gapCount; dots += 1) {
    const reachedLimit = walkCombinations(dots, 0, []);
    if (reachedLimit) break;
  }

  return results;
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

export function GmailDotGeneratorClient() {
  const [emailInput, setEmailInput] = useState('');
  const [includeDot, setIncludeDot] = useState(true);
  const [includeGooglemail, setIncludeGooglemail] = useState(false);
  const [includePlusAliases, setIncludePlusAliases] = useState(false);
  const [plusTagsInput, setPlusTagsInput] = useState('test, qa, signup');
  const [aliases, setAliases] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [generatedSummary, setGeneratedSummary] = useState<{
    localBase: string;
    totalPossibleText: string;
    produced: number;
    truncated: boolean;
    optionsText: string;
  } | null>(null);

  const outputValue = useMemo(() => aliases.join('\n'), [aliases]);

  const handleGenerate = useCallback(() => {
    setCopyState('idle');
    setError('');

    const parsed = parseInputAddress(emailInput);
    if (!parsed) {
      setAliases([]);
      setGeneratedSummary(null);
      setError('Enter a valid Gmail address (gmail.com or googlemail.com).');
      return;
    }

    const domains = includeGooglemail
      ? Array.from(new Set(['gmail.com', 'googlemail.com']))
      : [parsed.domain];

    const plusTags = includePlusAliases ? parsePlusTags(plusTagsInput) : [];
    if (includePlusAliases && plusTags.length === 0) {
      setAliases([]);
      setGeneratedSummary(null);
      setError('Add at least one valid +tag (comma separated).');
      return;
    }

    const totalPossibleText = estimateTotalPossibleText(
      parsed.localBase.length,
      domains.length,
      includePlusAliases ? plusTags.length : 0,
      includeDot
    );

    const baseLimitDenominator =
      domains.length * (1 + (includePlusAliases ? plusTags.length : 0));
    const localLimit = Math.max(
      1,
      Math.ceil(MAX_ALIAS_COUNT / Math.max(1, baseLimitDenominator))
    );

    const localVariants = includeDot
      ? generateDotLocals(parsed.localBase, localLimit)
      : [parsed.localBase];

    const baseAliases: string[] = [];
    for (const local of localVariants) {
      for (const domain of domains) {
        if (baseAliases.length >= MAX_ALIAS_COUNT) break;
        baseAliases.push(`${local}@${domain}`);
      }
      if (baseAliases.length >= MAX_ALIAS_COUNT) break;
    }

    const plusAliases: string[] = [];
    if (includePlusAliases && baseAliases.length < MAX_ALIAS_COUNT) {
      for (const local of localVariants) {
        for (const domain of domains) {
          for (const tag of plusTags) {
            if (baseAliases.length + plusAliases.length >= MAX_ALIAS_COUNT) break;
            plusAliases.push(`${local}+${tag}@${domain}`);
          }
          if (baseAliases.length + plusAliases.length >= MAX_ALIAS_COUNT) break;
        }
        if (baseAliases.length + plusAliases.length >= MAX_ALIAS_COUNT) break;
      }
    }

    const nextAliases = [...baseAliases, ...plusAliases].slice(0, MAX_ALIAS_COUNT);

    setAliases(nextAliases);
    setGeneratedSummary({
      localBase: parsed.localBase,
      totalPossibleText,
      produced: nextAliases.length,
      truncated: nextAliases.length >= MAX_ALIAS_COUNT,
      optionsText: `dot: ${includeDot ? 'on' : 'off'} | googlemail: ${
        includeGooglemail ? 'on' : 'off'
      } | +tag: ${includePlusAliases ? 'on' : 'off'}`,
    });
  }, [
    emailInput,
    includeDot,
    includeGooglemail,
    includePlusAliases,
    plusTagsInput,
  ]);

  const handleCopyAll = useCallback(async () => {
    if (!outputValue) return;
    const didCopy = await copyTextToClipboard(outputValue);
    if (!didCopy) return;
    setCopyState('copied');
    window.setTimeout(() => setCopyState('idle'), 1800);
  }, [outputValue]);

  const handleDownload = useCallback(() => {
    if (!outputValue || typeof window === 'undefined') return;
    const blob = new Blob([outputValue], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.href = url;
    link.download = `gmail-dot-generator-${stamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, [outputValue]);

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
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
          <span className="text-gray-700 dark:text-gray-300">Gmail Dot Generator</span>
        </div>

        <header className="mb-8 text-center">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl dark:text-gray-100">
            Free Gmail Dot Generator
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-400">
            Create unlimited Google Gmail aliases for free.
          </p>
        </header>

        <section className="rounded-[2rem] border border-gray-200/90 bg-white/85 p-6 shadow-[0_35px_90px_-50px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur-md dark:border-white/10 dark:bg-[#0d0d0d] dark:ring-white/10 sm:p-8">
          <label
            htmlFor="gmail-input"
            className="text-xs font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400"
          >
            Base Gmail Address
          </label>
          <input
            id="gmail-input"
            type="email"
            inputMode="email"
            autoComplete="off"
            spellCheck={false}
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleGenerate();
              }
            }}
            placeholder="username@gmail.com"
            className="mt-3 w-full rounded-2xl border border-gray-300/90 bg-white px-4 py-3 text-base font-semibold text-gray-900 outline-none transition focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.18)] dark:border-white/10 dark:bg-[#151515] dark:text-gray-100"
          />

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:-translate-y-0.5 hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-500"
            >
              Generate
            </button>
            <button
              type="button"
              onClick={handleCopyAll}
              disabled={!outputValue}
              className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-black uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50 ${
                copyState === 'copied'
                  ? 'border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'border-gray-300/90 bg-white text-gray-900 hover:bg-gray-100 dark:border-white/15 dark:bg-white/10 dark:text-gray-100 dark:hover:bg-white/20'
              }`}
            >
              {copyState === 'copied' ? 'Copied' : 'Copy All'}
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-300/80 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </p>
          )}

          {generatedSummary && (
            <div className="mt-4 rounded-xl border border-gray-300/70 bg-white/80 px-4 py-3 text-sm text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
              <p>
                Options:{' '}
                <span className="font-black text-gray-900 dark:text-gray-100">
                  {generatedSummary.optionsText}
                </span>
              </p>
              <p>
                Base: <span className="font-black text-gray-900 dark:text-gray-100">{generatedSummary.localBase}</span>
              </p>
              <p>
                Showing{' '}
                <span className="font-black text-gray-900 dark:text-gray-100">
                  {generatedSummary.produced}
                </span>{' '}
                aliases out of estimated{' '}
                <span className="font-black text-gray-900 dark:text-gray-100">
                  {generatedSummary.totalPossibleText}
                </span>
                .
              </p>
              {generatedSummary.truncated && (
                <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  Output is capped at {MAX_ALIAS_COUNT} aliases for performance.
                </p>
              )}
            </div>
          )}

          <div className="mt-5">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400">
              Generated Results
            </label>
            <div className="mt-2 rounded-2xl border border-gray-200/90 bg-white p-2 dark:border-white/10 dark:bg-[#121212]">
              <textarea
                readOnly
                value={outputValue || 'Generated aliases will appear here, one per line.'}
                className="h-[320px] w-full resize-none rounded-xl border border-gray-200/90 bg-gray-50 p-4 font-mono text-sm leading-6 text-gray-800 outline-none dark:border-white/10 dark:bg-[#0b0b0b] dark:text-gray-100"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!outputValue}
              className="rounded-full border border-gray-300/80 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-transparent dark:text-gray-100 dark:hover:bg-white/10"
            >
              Download .txt
            </button>
          </div>

          <div className="mt-6 border-t border-gray-200/80 pt-5 dark:border-white/10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400">
              Options
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={includeDot}
                  onChange={(event) => setIncludeDot(event.target.checked)}
                  className="h-4 w-4 rounded accent-brand-600"
                />
                Include dot aliases
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={includeGooglemail}
                  onChange={(event) => setIncludeGooglemail(event.target.checked)}
                  className="h-4 w-4 rounded accent-brand-600"
                />
                Include googlemail.com
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={includePlusAliases}
                  onChange={(event) => setIncludePlusAliases(event.target.checked)}
                  className="h-4 w-4 rounded accent-brand-600"
                />
                Include +tag aliases
              </label>
            </div>

            {includePlusAliases && (
              <div className="mt-4">
                <label
                  htmlFor="plus-tags"
                  className="text-xs font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400"
                >
                  +Tags (comma separated)
                </label>
                <input
                  id="plus-tags"
                  type="text"
                  value={plusTagsInput}
                  onChange={(event) => setPlusTagsInput(event.target.value)}
                  placeholder="test, qa, signup"
                  className="mt-2 w-full rounded-xl border border-gray-300/90 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none transition focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.18)] dark:border-white/10 dark:bg-[#151515] dark:text-gray-100"
                />
              </div>
            )}
          </div>
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
            Alias Variant Comparison
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 text-sm dark:border-white/10 dark:bg-white/5">
              <thead className="bg-gray-100/80 text-left text-xs uppercase tracking-widest text-gray-700 dark:bg-white/10 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Example</th>
                  <th className="px-4 py-3">Expected behavior</th>
                </tr>
              </thead>
              <tbody>
                {GMAIL_DOT_COMPARISON_ROWS.map((row) => (
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
                      {row.behavior}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 space-y-8 rounded-[2rem] border border-gray-200/80 bg-white/85 p-6 ring-1 ring-black/5 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:ring-white/10 sm:p-8">
          <article className="space-y-3">
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
              Why Use a Gmail Dot Generator?
            </h2>
            <p className="text-base leading-8 text-gray-700 dark:text-gray-300">
              This tool helps you generate deterministic Gmail alias patterns for testing
              account signup flows, referral attribution, and inbox filtering. It is
              especially useful for QA teams, growth teams, and solo builders validating
              email normalization logic.
            </p>
            <p className="text-base leading-8 text-gray-700 dark:text-gray-300">
              Every alias is generated locally in your browser. No backend API is required,
              so you can test quickly without sending your generated combinations to external
              services.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
              How This Tool Works
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-base leading-8 text-gray-700 dark:text-gray-300">
              <li>It removes dots from the local part, then rebuilds all dot combinations.</li>
              <li>Optionally appends +tags for source tracking and QA segmentation.</li>
              <li>Optionally outputs googlemail.com variants for compatibility testing.</li>
              <li>Applies a safe maximum output limit to prevent browser freezing.</li>
            </ul>
          </article>

          <article className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
              Best Practices
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {GMAIL_DOT_BEST_PRACTICES.map((item) => (
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
              Common Mistakes to Avoid
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-base leading-8 text-gray-700 dark:text-gray-300">
              {GMAIL_DOT_COMMON_MISTAKES.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="mt-10 rounded-[2rem] border border-gray-200/80 bg-white/85 p-6 ring-1 ring-black/5 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:ring-white/10 sm:p-8">
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">
            Popular Related Searches
          </h2>
          <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-400">
            Common search terms used by users looking for Gmail alias and dot-variation
            tools:
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {GMAIL_DOT_SEARCH_TERMS.map((term) => (
              <span
                key={term}
                className="rounded-full border border-gray-300/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:border-white/15 dark:bg-white/5 dark:text-gray-300"
              >
                {term}
              </span>
            ))}
          </div>
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
            {GMAIL_DOT_GENERATOR_FAQ.map((item) => (
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
        </section>

        <section className="mt-10 rounded-[2rem] border border-gray-200/80 bg-white/85 p-6 ring-1 ring-black/5 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:ring-white/10 sm:p-8">
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            References and Further Reading
          </h2>
          <ul className="mt-4 space-y-3">
            {GMAIL_DOT_REFERENCE_LINKS.map((ref) => (
              <li key={ref.href}>
                <a
                  href={ref.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  {ref.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-[2rem] border border-gray-200/80 bg-white/85 p-8 text-center ring-1 ring-black/5 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:ring-white/10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            Improve Signup Testing
          </p>
          <h2 className="mt-3 text-3xl font-black text-gray-900 dark:text-gray-100">
            Combine Gmail Aliases with Temp Mail and Strong Passwords
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400">
            Use Gmail alias variations for testing, Temp Mail for low-trust signups,
            and strong credentials for account protection.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              prefetch={false}
              className="inline-flex rounded-full bg-brand-700 px-6 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-lg dark:bg-brand-600 dark:hover:bg-brand-500"
            >
              Use Temp Mail Lab
            </Link>
            <Link
              href="/tools/password-generator"
              prefetch={false}
              className="inline-flex rounded-full border border-gray-300/90 bg-white px-6 py-3 text-sm font-black uppercase tracking-widest text-gray-900 transition hover:-translate-y-0.5 hover:bg-gray-100 dark:border-white/20 dark:bg-transparent dark:text-gray-100 dark:hover:bg-white/10"
            >
              Try Password Generator
            </Link>
            <Link
              href="/tools"
              prefetch={false}
              className="inline-flex rounded-full border border-gray-300/90 bg-white px-6 py-3 text-sm font-black uppercase tracking-widest text-gray-900 transition hover:-translate-y-0.5 hover:bg-gray-100 dark:border-white/20 dark:bg-transparent dark:text-gray-100 dark:hover:bg-white/10"
            >
              Explore All Tools
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
