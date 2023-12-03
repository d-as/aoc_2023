import { first, getInputLines, last } from "../util.js";

const input = getInputLines(import.meta);

const DIGITS = [
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
];

const DIGIT_REGEX_1 = /\d/;
const DIGIT_REGEX_2 = new RegExp(`(?=(${DIGIT_REGEX_1.source}|${DIGITS.join('|')}))`, 'g');

const isDigit = (digit: string): boolean => (
  DIGIT_REGEX_1.test(digit)
);

const getDigit = (match?: RegExpMatchArray): string | undefined => {
  const digit = first(match?.slice(1));
  return digit && DIGITS.includes(digit) ? `${DIGITS.indexOf(digit) + 1}` : digit;
};

const result1 = input.reduce((sum, [...line]) => {
  const [firstDigit, lastDigit] = [line.find(isDigit), line.findLast(isDigit)];
  return sum + (firstDigit ? Number(firstDigit + lastDigit) : 0);
}, 0);

const result2 = input.reduce((sum, line) => {
  const digits = Array.from(line.matchAll(DIGIT_REGEX_2));
  const [firstMatch, lastMatch] = [first(digits), last(digits)];
  const [firstDigit, lastDigit] = [firstMatch, lastMatch].map(getDigit);
  return sum + (firstDigit ? Number(firstDigit + lastDigit) : 0);
}, 0);

[result1, result2].forEach((result, i) => console.log(`Result ${i + 1}: ${result}`));
