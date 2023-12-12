import { getInputLines, logResults, range } from "../util.js";

const input = getInputLines(import.meta);

enum SpringType {
  OPERATIONAL = '.',
  DAMAGED     = '#',
  UNKNOWN     = '?',
}

const SPRING_TYPES = Object.values(SpringType);

const getDamagedSpringCounts = (springArrangement: string): number[] => {
  const damagedSpringCounts: number[] = [];
  let consecutiveDamagedSprings = 0;

  [...springArrangement].forEach(spring => {
    if (spring === SpringType.DAMAGED) {
      consecutiveDamagedSprings++;
    } else if (consecutiveDamagedSprings) {
      damagedSpringCounts.push(consecutiveDamagedSprings);
      consecutiveDamagedSprings = 0;
    }
  });

  if (consecutiveDamagedSprings) {
    damagedSpringCounts.push(consecutiveDamagedSprings);
  }

  return damagedSpringCounts;
};

const isValidDamagedSprings = (springArrangement: string, expectedDamagedSpringCounts: number[]): boolean => {
  const damagedSpringCounts = getDamagedSpringCounts(springArrangement);

  return (
    damagedSpringCounts.length === expectedDamagedSpringCounts.length &&
    damagedSpringCounts.every((n, i) => n === expectedDamagedSpringCounts[i])
  );
};

const getValidArrangementCount = (springs: string, damagedSpringCounts: number[]): number => {
  const unknownCount = [...springs].filter(spring => spring === SpringType.UNKNOWN).length;

  return new Set(
    range(Math.pow(2, unknownCount))
      .map(n => [...n.toString(2).padStart(unknownCount, '0')].reduce((arrangement, digit) => (
        arrangement.replace(SpringType.UNKNOWN, SPRING_TYPES[Number(digit)])
      ), springs))
      .filter(springArrangement => isValidDamagedSprings(springArrangement, damagedSpringCounts)),
  )
    .size;
};

const result1 = input.reduce((sum, line) => {
  const [springs, damagedSpringCounts] = line.split(' ');
  return sum + getValidArrangementCount(springs, damagedSpringCounts.split(',').map(Number));
}, 0);

logResults(result1);
