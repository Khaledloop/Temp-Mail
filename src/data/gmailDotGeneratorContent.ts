export type GmailDotFaqItem = {
  question: string;
  answer: string;
};

export type GmailDotComparisonRow = {
  type: string;
  example: string;
  behavior: string;
};

export const GMAIL_DOT_GENERATOR_FAQ: GmailDotFaqItem[] = [
  {
    question: 'What does the Gmail dot trick do?',
    answer:
      'For personal @gmail.com addresses, Gmail treats dotted and non-dotted versions of the same local part as one inbox.',
  },
  {
    question: 'Can someone register my dotted Gmail variation?',
    answer:
      'No. Gmail states that dotted variants of the same username are considered the same account and cannot be registered separately.',
  },
  {
    question: 'Do dots behave the same for work or school Google accounts?',
    answer:
      'Not always. Google notes that dots can matter for work or school addresses on custom domains.',
  },
  {
    question: 'What does +tag mean in Gmail aliases?',
    answer:
      'A +tag lets you create labeled variants for filtering and testing, such as username+qa@gmail.com.',
  },
  {
    question: 'Will every website accept +tag addresses?',
    answer:
      'No. Some forms reject plus signs. If that happens, use dot-only aliases for testing.',
  },
  {
    question: 'Why include googlemail.com aliases?',
    answer:
      'Some legacy users and systems still reference googlemail.com. Testing both formats can help QA signup and login flows.',
  },
  {
    question: 'Why does this generator cap output?',
    answer:
      'The number of combinations grows exponentially. Capping output keeps the tool fast and stable in the browser.',
  },
  {
    question: 'Is the generator private?',
    answer:
      'Yes. Generation runs fully client-side in your browser without backend API calls.',
  },
  {
    question: 'What is this tool useful for?',
    answer:
      'QA testing, campaign source tracking, inbox rule testing, and signup flow validation.',
  },
  {
    question: 'Can I use this for referral or trial abuse?',
    answer:
      'Do not use aliases for abuse. Use this tool for legitimate testing, organization, and security workflows.',
  },
];

export const GMAIL_DOT_COMPARISON_ROWS: GmailDotComparisonRow[] = [
  {
    type: 'Dot only',
    example: 'john.smith@gmail.com',
    behavior: 'Routes to the same personal Gmail inbox as johnsmith@gmail.com.',
  },
  {
    type: 'Plus tag',
    example: 'johnsmith+qa@gmail.com',
    behavior: 'Useful for filters and testing. Some third-party forms may reject +.',
  },
  {
    type: 'Dot + plus',
    example: 'john.smith+news@gmail.com',
    behavior: 'Combines dot formatting and +tag for segmented tracking.',
  },
  {
    type: 'Googlemail variant',
    example: 'johnsmith@googlemail.com',
    behavior: 'Useful for compatibility testing in legacy or strict systems.',
  },
];

export const GMAIL_DOT_BEST_PRACTICES = [
  {
    title: 'Use dot-only for broad compatibility',
    description:
      'When a website blocks + symbols, dot variants usually remain accepted and still support testing.',
  },
  {
    title: 'Reserve +tags for campaign attribution',
    description:
      'Use +signup, +billing, or +newsletter tags to identify where messages originate.',
  },
  {
    title: 'Document alias patterns in QA plans',
    description:
      'Keep naming conventions consistent so your team can reproduce test scenarios quickly.',
  },
  {
    title: 'Validate email normalization in backend',
    description:
      'If your product relies on unique users by email, define how dots and +tags are handled.',
  },
  {
    title: 'Filter and label aggressively in Gmail',
    description:
      'Create Gmail filters based on +tags to auto-label and reduce inbox noise during tests.',
  },
  {
    title: 'Avoid sensitive account use',
    description:
      'Use aliases for testing and low-trust signups, not for critical recovery addresses.',
  },
];

export const GMAIL_DOT_COMMON_MISTAKES = [
  'Assuming every provider treats dots like Gmail does.',
  'Using +tags on forms that explicitly reject the plus character.',
  'Forgetting to remove dots/+tags when deduplicating users in analytics.',
  'Using alias variations to bypass platform policies or limits.',
  'Testing with too many variants without a naming convention.',
];

export const GMAIL_DOT_SEARCH_TERMS = [
  'gmail dot generator',
  'gmail alias generator',
  'gmail dot trick',
  'gmail dot variations generator',
  'gmail dot plus trick',
  'google mail alias maker',
  'unlimited gmail generator',
  'gmail generator for testing',
  'gmail dot generator github',
  'gmail dot variation generator netlify',
  'gmail dot email generator',
  'generate gmail address variants',
];

export const GMAIL_DOT_REFERENCE_LINKS = [
  {
    label: "Google Help: Dots don't matter in Gmail addresses",
    href: 'https://support.google.com/mail/answer/7436150?hl=en',
  },
  {
    label: 'Google Help: Create a username (Gmail character rules)',
    href: 'https://support.google.com/mail/answer/9211434?hl=en',
  },
  {
    label: 'Google Workspace: Advanced email filtering behavior',
    href: 'https://support.google.com/a/answer/1346934?hl=en',
  },
  {
    label: 'Article: Gmail plus addressing examples and use cases',
    href: 'https://start.streak.com/post/gmail-plus-addressing-trick',
  },
  {
    label: 'Article: Gmail aliases explained with practical workflows',
    href: 'https://www.streak.com/post/how-to-create-gmail-alias',
  },
];
