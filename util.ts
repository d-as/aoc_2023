import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  DAY_MILLISECONDS,
  HOUR_MILLISECONDS,
  INPUT_PATH,
  INPUT_PREFIX,
  MINUTE_MILLISECONDS,
  PUZZLE_COUNT,
  SECOND_MILLISECONDS,
  SOLUTION_PREFIX,
} from './constants.js';

export const getYear = (date: Date): number => (
  date.getFullYear()
);

export const Assert = {
  validYear: (year: number): number => {
    if (year < 2015 || year > getYear(new Date()) || !Number.isInteger(year)) {
      throw new Error(`Invalid year: ${year}`);
    }
    return year;
  },
  validDay: (day: number): number => {
    if (day < 1 || day > PUZZLE_COUNT || !Number.isInteger(day)) {
      throw new Error(`Invalid day: ${day}`);
    }
    return day;
  }
};

export const padDay = (day: number): string => (
  Assert.validDay(day).toString().padStart(2, '0')
);

export const range = (size: number, start = 0): number[] => (
  [...Array(size).keys()].map(n => n += start)
);

export const clamp = (value: number, min: number, max: number): number => (
  Math.min(Math.max(value, min), max)
);

export const plural = <T>(value: T[] | number) => (
  (Array.isArray(value) ? value.length : value) !== 1 ? 's' : ''
);

export const getInputURL = (year: number, day: number) => (
  `https://adventofcode.com/${Assert.validYear(year)}/day/${Assert.validDay(day)}/input` as const
);

export const getPuzzleReleaseDate = (year: number, day: number): Date => {
  return new Date(`${Assert.validYear(year)}-12-${padDay(day)}:00:00:00-05:00`);
};

export const getReleasedPuzzleCount = (date: Date): number => (
  clamp(
    (
      Math.floor((date.getTime() - getPuzzleReleaseDate(getYear(date), 1).getTime()) / DAY_MILLISECONDS)
    ) + 1,
    0,
    PUZZLE_COUNT
  )
);

export const formatDate = (date: Date): string => (
  [
    Intl.DateTimeFormat([], { weekday: 'long' }).format(date),
    Intl.DateTimeFormat([], {
      dateStyle: 'short',
      timeStyle: 'short',
    })
      .format(date)
  ]
    .join(' ')
);

export const getTimeText = (value: number, text: string): string | undefined => (
  value > 0 ? `${value} ${text}${plural(value)}` : undefined
);

export const getNextPuzzleText = (date: Date, releasedPuzzleCount: number): string => {
  const year = getYear(date);

  const allPuzzlesReleased = releasedPuzzleCount === PUZZLE_COUNT;

  const nextRelease = getPuzzleReleaseDate(
    allPuzzlesReleased ? year + 1 : year,
    allPuzzlesReleased ? 1 : releasedPuzzleCount + 1,
  );

  const timeToNextPuzzle = (nextRelease.getTime() - date.getTime());

  const days = Math.floor(timeToNextPuzzle / DAY_MILLISECONDS);
  const hours = Math.floor((timeToNextPuzzle % DAY_MILLISECONDS) / HOUR_MILLISECONDS);
  const minutes = Math.floor((timeToNextPuzzle % HOUR_MILLISECONDS) / MINUTE_MILLISECONDS);
  const seconds = Math.floor((timeToNextPuzzle % MINUTE_MILLISECONDS) / SECOND_MILLISECONDS);

  const nextPuzzleText = [
    getTimeText(days, 'day'),
    getTimeText(hours, 'hour'),
    getTimeText(minutes, 'minute'),
    getTimeText(seconds, 'second'),
  ]
    .filter(n => n)
    .join(', ');

  return [nextPuzzleText, `(${formatDate(nextRelease)})`].join(' ');
};

export const getInputFileName = (day: number) => (
  `${INPUT_PREFIX}${padDay(day)}.txt` as const
);

export const getSolutionFileName = (day: number) => (
  `${SOLUTION_PREFIX}${padDay(day)}.ts` as const
);

export const inputFileExists = (day: number, files: string[]): boolean => (
  files.includes(getInputFileName(day))
);

export const solutionFileExists = (day: number, files: string[]): boolean => (
  files.includes(getSolutionFileName(day))
);

export const getDayFromFilename = (filename: string): number => {
  const [day] = path.basename(filename).match(/\d{2}/) as RegExpMatchArray;
  return Number(day);
}

export const getInputLines = (importMeta: ImportMeta): string[] => {
  const filename = fileURLToPath(importMeta.url);

  const inputPath = path.join(
    path.dirname(filename),
    '..',
    INPUT_PATH,
    getInputFileName(getDayFromFilename(filename))
  );

  return fs.readFileSync(inputPath).toString().split('\n');
};

export const first = <T>(items?: T[]): T | undefined => {
  if (!items) {
    return undefined;
  }
  const [value] = items;
  return value;
}

export const firstDefined = <T>(items?: T[]): T => (
  first(items) as T
);

export const last = <T>(items?: T[]): T | undefined => (
  items ? items[items.length - 1] : undefined
);

export const lastDefined = <T>(items?: T[]): T => (
  last(items) as T
);

export const logResults = (...results: number[]): void => {
  results.forEach((result, i) => console.log(`Part ${i + 1}: ${Intl.NumberFormat().format(result)} (${result})`));
}
