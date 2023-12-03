import { firstDefined, getInputLines } from "../util.js";

const input = getInputLines(import.meta);

enum Cube {
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue',
}

const VALID_BAG: Record<Cube, number> = {
  [Cube.RED]: 12,
  [Cube.GREEN]: 13,
  [Cube.BLUE]: 14,
};

const CUBE_REGEX = new RegExp(`(\\d+) (${Object.values(Cube).join('|')})`, 'g');
const CUBE_SET_REGEX = new RegExp(`(${CUBE_REGEX.source}(?:, )?)+(?:; )?`, 'g');
const GAME_REGEX = new RegExp(`Game (\\d+): ((${CUBE_SET_REGEX.source})+)`);

const getCube = (match: RegExpMatchArray): [number, Cube] => {
  const [, count, colour] = match as [string, string, Cube];
  return [Number(count), colour];
}

const isValidCubeCount = (match: RegExpMatchArray): boolean => {
  const [count, colour] = getCube(match);
  return Number(count) <= VALID_BAG[colour];
};

const getCubePower = (matches: RegExpMatchArray[]): number => {
  const cubes = matches.map(getCube);

  return Object.values(Cube).map(colour => (
    cubes
      .filter(([, cubeColour]) => colour === cubeColour)
      .toSorted(([a], [b]) => b - a)
  ))
    .map(firstDefined)
    .reduce((power, [count]) => power * count, 1);
};

const results = input.reduce(([gameIdSum, powerSum], line) => {
  const match = line.match(GAME_REGEX);
  let power = 0;

  if (match) {
    const [, gameId, cubes] = match;
    const cubeSets = Array.from(cubes.matchAll(CUBE_SET_REGEX)).map(firstDefined);
    const cubeMatches = cubeSets.flatMap(cubeSet => Array.from(cubeSet.matchAll(CUBE_REGEX)));

    power = getCubePower(cubeMatches);

    if (cubeMatches.every(isValidCubeCount)) {
      return [gameIdSum + Number(gameId), powerSum + power];
    }
  }

  return [gameIdSum, powerSum + power];
}, [0, 0]);

results.forEach((result, i) => console.log(`Part ${i + 1}: ${result}`));
