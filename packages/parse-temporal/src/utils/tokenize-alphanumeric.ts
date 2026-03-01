const NON_ALNUM_RE = /[^\dA-Za-z]+/;

export const tokenizeAlphanumeric = (s: string): string[] =>
  s.split(NON_ALNUM_RE);
