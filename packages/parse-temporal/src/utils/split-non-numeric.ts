const NON_NUMERIC_RE = /[^\d]+/;

export const splitNonNumeric = (s: string): string[] => s.split(NON_NUMERIC_RE);
