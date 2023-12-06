import { getInputLines, logResults, matchPatterns } from "../util.js";

const input = getInputLines(import.meta);

enum Category {
  SEED = 'seed',
  SOIL = 'soil',
  FERTILIZER = 'fertilizer',
  WATER = 'water',
  LIGHT = 'light',
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  LOCATION = 'location',
}

interface Mapping<T> {
  from: T;
  to: T;
}

interface RangeInfo {
  destinationRangeStart: number;
  sourceRangeStart: number;
  rangeLength: number;
}

const CATEGORIES = Object.values(Category);
const CATEGORIES_JOINED = CATEGORIES.join('|');

const MAPPINGS: Array<Mapping<Category>> = CATEGORIES.slice(0, CATEGORIES.length - 1).map((from, i) => ({
  from,
  to: CATEGORIES[i + 1],
}));

const SEEDS_REGEX = /seeds: ((?:\d+\s?)+)/;
const CATEGORY_MAP_HEADER_REGEX = new RegExp(`(${CATEGORIES_JOINED})-to-(${CATEGORIES_JOINED}) map:`);
const CATEGORY_MAP_VALUES_REGEX = /^(\d+) (\d+) (\d+)$/;

let seeds: number[] = [];
let mapping: Mapping<Category>;
const categories = new Map<Category, Map<Category, RangeInfo[]>>;

input.forEach(line => {
  const [
    categoryMapValues,
    categoryMapHeader,
    seedsMatch,
  ] = matchPatterns(line, CATEGORY_MAP_VALUES_REGEX, CATEGORY_MAP_HEADER_REGEX, SEEDS_REGEX);

  if (categoryMapValues) {
    const [destinationRangeStart, sourceRangeStart, rangeLength] = categoryMapValues.map(Number);
    const { from, to } = mapping;

    if (!categories.has(from)) {
      categories.set(from, new Map());
    }

    categories.get(from)?.set(to, [...categories.get(from)?.get(to) ?? [], {
      destinationRangeStart,
      sourceRangeStart,
      rangeLength,
    }]);
  } else if (categoryMapHeader) {
    const [from, to] = categoryMapHeader as Category[];
    mapping = { from, to };
  } else if (seedsMatch) {
    const [seedValues] = seedsMatch;
    seeds = seedValues.split(' ').map(Number);
  }
});

const matchingRange = (value: number) => ({ sourceRangeStart, rangeLength }: RangeInfo) => (
  sourceRangeStart <= value && value - sourceRangeStart < rangeLength
);

const convertValue = (value: number, ranges: RangeInfo[]): number => {
  const range = ranges.find(matchingRange(value));
  return range ? (value + (range.destinationRangeStart - range.sourceRangeStart)) : value;
};

const getMappingRanges = ({ from, to }: Mapping<Category>): RangeInfo[] => (
  categories.get(from)?.get(to) as RangeInfo[]
);

const locations = seeds.map(seed => (
  MAPPINGS.reduce((value, mapping) => convertValue(value, getMappingRanges(mapping)), seed)
));

const seedRanges: Array<Mapping<number>> =
  seeds
    .filter((_, i) => i % 2 === 0)
    .map((from, i) => ({
      from,
      to: from + seeds[(2 * i) + 1] - 1,
    }));

const getIntersectingRanges = (range: Mapping<number>, ranges: RangeInfo[]): Array<Mapping<number>> => {
  const breakpoints = [
    range.from,
    range.to,
    ...ranges.map(range => range.sourceRangeStart),
  ]
    .filter(breakpoint => breakpoint >= range.from && breakpoint <= range.to)
    .sort((a, b) => a - b);

  const intersectingRanges =
    breakpoints
      .slice(0, breakpoints.length - 1).map((from, i) => ({
        from,
        to: breakpoints[i + 1] - (i === breakpoints.length - 2 ? 0 : 1),
      }))
      .filter(({ from, to }) => ranges.find(matchingRange(from)) && ranges.find(matchingRange(to)))

  return intersectingRanges.length > 0 ? intersectingRanges : [range];
};

const locationRanges = seedRanges.flatMap(seedRange => (
  MAPPINGS.reduce((ranges, mapping) => {
    const mappingRanges = getMappingRanges(mapping);

    return ranges
      .flatMap(range => getIntersectingRanges(range, mappingRanges))
      .map(({ from, to }) => {
        const convertedValue = convertValue(from, mappingRanges);

        return {
          from: convertedValue,
          to: convertedValue + to - from,
        };
      });
  }, [seedRange])
));

const [result1] = locations.sort((a, b) => a - b);
const [result2] = locationRanges.map(range => range.from).sort((a, b) => a - b);

logResults(result1, result2);
