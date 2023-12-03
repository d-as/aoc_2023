import { getInputLines, logResults, range } from "../util.js";

const input = getInputLines(import.meta);

type Coordinate = [number, number];

interface Part {
  value: number;
  coordinates: Coordinate[];
  gears: Coordinate[];
}

const coordinateEquals = ([x1, y1]: Coordinate, [x2, y2]: Coordinate) => (
  x1 === x2 && y1 === y2
);

const isSymbol = (character?: string): boolean => (
  character ? !/\s|\d|\./.test(character) : false
);

const isGear = (character?: string): boolean => (
  character === '*'
);

const getAdjacentCoordinates = ([x, y]: Coordinate): Coordinate[] => (
  range(3, -1).flatMap(yOffset => (
    range(3, -1).map(xOffset => [x + xOffset, y + yOffset]) as Coordinate[]
  ))
);

const getTile = ([x, y]: Coordinate): string | undefined => (
  input[y]?.[x]
);

const isPartAdjacentToSymbol = (part: Part): [boolean, Coordinate[]] => {
  const symbols = part.coordinates.flatMap(getAdjacentCoordinates).filter(coordinate => isSymbol(getTile(coordinate)));
  const gears = symbols.filter(coordinate => isGear(getTile(coordinate)));
  return [symbols.length > 0, gears];
};

const getUniqueGears = (gears: Coordinate[]): Coordinate[] => (
  Array.from(new Set(gears.map(coordinate => coordinate.join(','))))
    .map(coordinate => coordinate.split(',').map(Number)) as Coordinate[]
);

const getGearRatio = (parts: Part[]): number => (
  parts.reduce((gearRatio, part) => gearRatio * part.value, 1)
);

const parts: Part[] = input.flatMap((line, y) => (
  Array.from(line.matchAll(/\d+/g)).map(match => {
    const [part] = match;
    const offset = match.index as number;

    return {
      value: Number(part),
      coordinates: range(part.length).map(x => [x + offset, y]),
      gears: [],
    };
  })
));

const [result1, validParts, gears] = parts.reduce(([validPartSum, validParts, gears], part) => {
  const [adjacentToSymbol, adjacentGears] = isPartAdjacentToSymbol(part);
  part.gears = adjacentGears;

  return [
    validPartSum + (adjacentToSymbol ? part.value : 0),
    [...validParts, ...(adjacentToSymbol ? [part] : [])],
    [...gears, ...adjacentGears],
  ];
}, [0, [] as Part[], [] as Coordinate[]]);

const result2 = getUniqueGears(gears).reduce((gearRatioSum, gear) => {
  const adjacentParts = validParts.filter(part => part.gears.some(partGear => coordinateEquals(partGear, gear)));
  return gearRatioSum + (adjacentParts.length === 2 ? getGearRatio(adjacentParts) : 0);
}, 0);

logResults(result1, result2);
