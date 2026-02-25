export type PasswordGeneratorFaqItem = {
  question: string;
  answer: string;
};

export const PASSWORD_GENERATOR_FAQ: PasswordGeneratorFaqItem[] = [
  {
    question: 'How long should a secure password be?',
    answer:
      'Use 12 characters as a practical minimum. For important accounts, 16 or more is stronger.',
  },
  {
    question: 'Are passphrases better than random passwords?',
    answer:
      'They can be, especially when they combine multiple random words and are unique per account.',
  },
  {
    question: 'Do I need symbols and numbers?',
    answer:
      'For classic passwords, yes. Mixing character types increases entropy and slows brute-force attacks.',
  },
  {
    question: 'Is this generator private?',
    answer:
      'Yes. Generation happens in your browser only. We do not store or transmit generated passwords.',
  },
  {
    question: 'Should I change passwords regularly?',
    answer:
      'Change them immediately after suspected compromise or breach alerts. Routine updates for high-value accounts are also recommended.',
  },
  {
    question: 'What is the biggest password mistake?',
    answer:
      'Reusing the same password across multiple services. One breach can expose every reused account.',
  },
  {
    question: 'Can I store generated passwords in a browser?',
    answer:
      'A dedicated password manager is safer, especially if you use shared devices or multiple platforms.',
  },
  {
    question: 'How does temp mail help account security?',
    answer:
      'Disposable addresses reduce spam exposure and limit the blast radius when signup databases leak.',
  },
];
