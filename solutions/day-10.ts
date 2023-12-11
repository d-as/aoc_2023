import { first, getInputLines, logResults, range } from "../util.js";

const smallGrid = getInputLines(import.meta).map(line => [...line]) as Grid;
const smallWidth = first(smallGrid)?.length ?? 0;
const smallHeight = smallGrid.length;
const largeWidth = smallWidth * 3;
const largeHeight = smallHeight * 3;

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

type Grid = Tile[][];

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

const LARGE_TILES: Record<Tile, Array<`${Tile}${Tile}${Tile}`>> = {
  [Tile.GROUND]:          [
                            '...',
                            '...',
                            '...',
                          ],
  [Tile.START_POSITION]:  [
                            '.S.',
                            'SSS',
                            '.S.',
                          ],
  [Tile.VERTICAL_PIPE]:   [
                            '.|.',
                            '.|.',
                            '.|.',
                          ],
  [Tile.HORIZONTAL_PIPE]: [
                            '...',
                            '---',
                            '...',
                          ],
  [Tile.NORTH_EAST_BEND]: [
                            '.|.',
                            '.L-',
                            '...',
                          ],
  [Tile.NORTH_WEST_BEND]: [
                            '.|.',
                            '-J.',
                            '...',
                          ],
  [Tile.SOUTH_EAST_BEND]: [
                            '...',
                            '.F-',
                            '.|.',
                          ],
  [Tile.SOUTH_WEST_BEND]: [
                            '...',
                            '-7.',
                            '.|.',
                          ],
};

type Coordinate = [number, number];

const coordinateEquals = ([x1, y1]: Coordinate, [x2, y2]: Coordinate): boolean => (
  x1 === x2 && y1 === y2
);

const getTile = (grid: Grid, [x, y]: Coordinate): Tile | undefined => (
  grid[y]?.[x] as Tile
);

const getNextCoordinate = (coordinate: Coordinate, direction: Direction): Coordinate => (
  coordinate.map((n, i) => n + DIRECTION_OFFSETS[direction][i]) as Coordinate
);

const getNextTile = (grid: Grid, coordinate: Coordinate, direction: Direction): Tile | undefined => (
  getTile(grid, getNextCoordinate(coordinate, direction))
);

const getValidLoopDirections = (coordinate: Coordinate): Direction[] => (
  DIRECTIONS.filter(direction => (
    ALLOWED_MOVES[getTile(smallGrid, coordinate) ?? Tile.GROUND]?.[direction]?.includes(
      getNextTile(smallGrid, coordinate, direction) as Tile
    )
  ))
);

const getValidGridDirections = (grid: Grid, coordinate: Coordinate): Direction[] => (
  DIRECTIONS.filter(direction => getNextTile(grid, coordinate, direction) === Tile.GROUND)
);

const findStartPosition = (): Coordinate => {
  for (let x = 0; x < smallWidth; x++) {
    for (let y = 0; y < smallHeight; y++) {
      if (getTile(smallGrid, [x, y]) === Tile.START_POSITION) {
        return [x, y];
      }
    }
  }
  throw new Error('Start position not found');
};

const getLoop = (startPosition: Coordinate): Coordinate[] => {
  const loop: Coordinate[] = [startPosition];
  let coordinate = startPosition;
  let direction: Direction | undefined;

  while (true) {
    [direction] = getValidLoopDirections(coordinate).filter(d => (
      d !== (direction !== undefined ? OPPOSITE_DIRECTIONS[direction] : undefined)
    ));

    coordinate = getNextCoordinate(coordinate, direction);

    if (coordinateEquals(coordinate, startPosition)) {
      break;
    }

    loop.push(coordinate);
  }

  return loop;
};

const serializeCoordinate = (coordinate: Coordinate): string => (
  coordinate.join(',')
);

const deserializeCoordinate = (coordinate: string): Coordinate => (
  coordinate.split(',').map(Number) as Coordinate
);

const loop = getLoop(findStartPosition());
const result1 = loop.length / 2;

const loopCoordinateSet = new Set(loop.map(serializeCoordinate));
const largeGrid: Grid = range(largeHeight).map(() => [...Tile.GROUND.repeat(largeWidth)] as Tile[]);

smallGrid.forEach((line, y) => {
  [...line].forEach((tile, x) => {
    if (!loopCoordinateSet.has(serializeCoordinate([x, y]))) {
      tile = Tile.GROUND;
    }

    LARGE_TILES[tile as Tile].forEach((row, yOffset) => {
      [...row].forEach((tile, xOffset) => {
        largeGrid[(y * 3) + yOffset][(x * 3) + xOffset] = tile as Tile;
      });
    });
  });
});

const getRealCoordinate = ([x, y]: Coordinate): Coordinate => (
  [Math.floor(x / 3), Math.floor(y / 3)]
);

const getOutsideCoordinateSet = (): Set<string> => {
  const visitedCoordinateSet = new Set<string>();
  const startCoordinate: Coordinate = [0, 0];
  const coordinates = [startCoordinate];
  visitedCoordinateSet.add(serializeCoordinate(startCoordinate));

  while (coordinates.length) {
    const [coordinate] = coordinates;
    coordinates.shift();
    const validDirections = getValidGridDirections(largeGrid, coordinate);
  
    const nextCoordinates =
      validDirections
        .map(direction => getNextCoordinate(coordinate, direction))
        .filter(coordinate => !visitedCoordinateSet.has(serializeCoordinate(coordinate)));

    nextCoordinates.forEach(nextCoordinate => visitedCoordinateSet.add(serializeCoordinate(nextCoordinate)));
    coordinates.push(...nextCoordinates);
  }

  return new Set(
    Array.from(visitedCoordinateSet)
      .map(deserializeCoordinate)
      .map(getRealCoordinate)
      .map(serializeCoordinate)
      .filter(coordinate => !loopCoordinateSet.has(coordinate))
  );
};

const outsideCoordinateSet = getOutsideCoordinateSet();

const result2 = range(smallHeight).flatMap(y => (
  range(smallWidth)
    .filter(x => {
      const coordinate = serializeCoordinate([x, y]);
      return !loopCoordinateSet.has(coordinate) && !outsideCoordinateSet.has(coordinate);
    })
    .length
))
  .reduce((a, b) => a + b);

logResults(result1, result2);
