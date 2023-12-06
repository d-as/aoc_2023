import { getInputLines, logResults, range } from "../util.js";

const [timesStr, distancesStr] = getInputLines(import.meta).map(line => line.split(/\s+/).slice(1));
const [times, distances] = [timesStr, distancesStr].map(str => str.map(Number));

interface Race {
  time: number;
  distance: number;
}

const races = times.map((time, i) => ({
  time,
  distance: distances[i],
}));

const calculateDistance = ({ time }: Race, holdTime: number): number => (
  (time - holdTime) * holdTime
);

const calculateMargin = (race: Race): number => (
  range(race.time).filter(time => calculateDistance(race, time) > race.distance).length
);

const result1 = races.reduce((result, race) => result * calculateMargin(race), 1);

const concatStrings = (str: string[]): string => (
  str.reduce((a, b) => a + b)
);

const longRace: Race = {
  time: Number(concatStrings(timesStr)),
  distance: Number(concatStrings(distancesStr)),
};

const result2 = calculateMargin(longRace);

logResults(result1, result2);
