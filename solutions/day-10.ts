import { first, getInputLines, logResults, range } from "../util.js";

const input = getInputLines(import.meta);
const width = first(input)?.length ?? 0;
const height = input.length;

enum Tile {
  GROUND          = '.',
  START_POSITION  = 'S',
  VERTICAL_PIPE   = '|',
  HORIZONTAL_PIPE = '-',
  NORTH_EAST_BEND = 'L',
  NORTH_WEST_BEND = 'J',
  SOUTH_EAST_BEND = 'F',
  SOUTH_WEST_BEND = '7',
}

enum Direction {
  LEFT  = 'left',
  RIGHT = 'right',
  UP    = 'up',
  DOWN  = 'down',
}

const DIRECTIONS = Object.values(Direction);

const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  [Direction.LEFT]:  Direction.RIGHT,
  [Direction.RIGHT]: Direction.LEFT,
  [Direction.UP]:    Direction.DOWN,
  [Direction.DOWN]:  Direction.UP,
};

const DIRECTION_OFFSETS: Record<Direction, Coordinate> = {
  [Direction.LEFT]:  [-1,  0],
  [Direction.RIGHT]: [ 1,  0],
  [Direction.UP]:    [ 0, -1],
  [Direction.DOWN]:  [ 0,  1],
};

const ALLOWED_MOVES: Partial<Record<Tile, Partial<Record<Direction, Tile[]>>>> = {
  [Tile.VERTICAL_PIPE]: {
    [Direction.UP]:    [Tile.START_POSITION,  Tile.VERTICAL_PIPE,   Tile.SOUTH_EAST_BEND, Tile.SOUTH_WEST_BEND],
    [Direction.DOWN]:  [Tile.START_POSITION,  Tile.VERTICAL_PIPE,   Tile.NORTH_EAST_BEND, Tile.NORTH_WEST_BEND],
  },
  [Tile.HORIZONTAL_PIPE]: {
    [Direction.LEFT]:  [Tile.START_POSITION,  Tile.HORIZONTAL_PIPE, Tile.NORTH_EAST_BEND, Tile.SOUTH_EAST_BEND],
    [Direction.RIGHT]: [Tile.START_POSITION,  Tile.HORIZONTAL_PIPE, Tile.NORTH_WEST_BEND, Tile.SOUTH_WEST_BEND],
  },
  [Tile.NORTH_EAST_BEND]: {
    [Direction.RIGHT]: [Tile.START_POSITION,  Tile.HORIZONTAL_PIPE, Tile.NORTH_WEST_BEND, Tile.SOUTH_WEST_BEND],
    [Direction.UP]:    [Tile.START_POSITION,  Tile.VERTICAL_PIPE,   Tile.SOUTH_EAST_BEND, Tile.SOUTH_WEST_BEND],
  },
  [Tile.NORTH_WEST_BEND]: {
    [Direction.LEFT]:  [Tile.START_POSITION,  Tile.HORIZONTAL_PIPE, Tile.NORTH_EAST_BEND, Tile.SOUTH_EAST_BEND],
    [Direction.UP]:    [Tile.START_POSITION,  Tile.VERTICAL_PIPE,   Tile.SOUTH_EAST_BEND, Tile.SOUTH_WEST_BEND],
  },
  [Tile.SOUTH_EAST_BEND]: {
    [Direction.RIGHT]: [Tile.START_POSITION,  Tile.HORIZONTAL_PIPE, Tile.NORTH_WEST_BEND, Tile.SOUTH_WEST_BEND],
    [Direction.DOWN]:  [Tile.START_POSITION,  Tile.VERTICAL_PIPE,   Tile.NORTH_EAST_BEND, Tile.NORTH_WEST_BEND],
  },
  [Tile.SOUTH_WEST_BEND]: {
    [Direction.LEFT]:  [Tile.START_POSITION,  Tile.HORIZONTAL_PIPE, Tile.NORTH_EAST_BEND, Tile.SOUTH_EAST_BEND],
    [Direction.DOWN]:  [Tile.START_POSITION,  Tile.VERTICAL_PIPE,   Tile.NORTH_EAST_BEND, Tile.NORTH_WEST_BEND],
  },
  [Tile.START_POSITION]: {
    [Direction.LEFT]:  [Tile.HORIZONTAL_PIPE, Tile.NORTH_EAST_BEND, Tile.SOUTH_EAST_BEND],
    [Direction.RIGHT]: [Tile.HORIZONTAL_PIPE, Tile.NORTH_WEST_BEND, Tile.SOUTH_WEST_BEND],
    [Direction.UP]:    [Tile.VERTICAL_PIPE,   Tile.SOUTH_EAST_BEND, Tile.SOUTH_WEST_BEND],
    [Direction.DOWN]:  [Tile.VERTICAL_PIPE,   Tile.NORTH_EAST_BEND, Tile.NORTH_WEST_BEND],
  },
};

type Coordinate = [number, number];

const coordinateEquals = ([x1, y1]: Coordinate, [x2, y2]: Coordinate): boolean => (
  x1 === x2 && y1 === y2
);

const getTile = ([x, y]: Coordinate): Tile | undefined => (
  input[y]?.[x] as Tile
);

const getNextCoordinate = (coordinate: Coordinate, direction: Direction): Coordinate => (
  coordinate.map((n, i) => n + DIRECTION_OFFSETS[direction][i]) as Coordinate
);

const getValidDirections = (coordinate: Coordinate): Direction[] => (
  DIRECTIONS.filter(direction => (
    ALLOWED_MOVES[getTile(coordinate) ?? Tile.GROUND]?.[direction]?.includes(
      getTile(getNextCoordinate(coordinate, direction)) as Tile
    )
  ))
);

const findStartPosition = (): Coordinate => {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (getTile([x, y]) === Tile.START_POSITION) {
        return [x, y];
      }
    }
  }
  throw new Error('Start position not found');
};

const getPath = (startPosition: Coordinate): Coordinate[] => {
  const path: Coordinate[] = [startPosition];
  let coordinate = startPosition;
  let direction: Direction | undefined;

  while (true) {
    [direction] = getValidDirections(coordinate).filter(d => (
      d !== (direction !== undefined ? OPPOSITE_DIRECTIONS[direction] : undefined)
    ));

    if (direction === undefined) {
      console.log('No valid directions');
      break;
    }

    coordinate = getNextCoordinate(coordinate, direction);

    if (coordinateEquals(coordinate, startPosition)) {
      break;
    }

    path.push(coordinate);
  }

  return path;
};

const result1 = getPath(findStartPosition()).length / 2;

logResults(result1);
