import { firstDefined, getInputLines, logResults, range } from "../util.js";

const originalGrid = getInputLines(import.meta).map(line => [...line]) as Grid;
const originalWidth = firstDefined(originalGrid).length;

enum Tile {
  EMPTY  = '.',
  GALAXY = '#',
}

enum GridType {
  ORIGINAL = 'original',
  EXPANDED = 'expanded',
}

const GRID_TYPES = Object.values(GridType);

interface Galaxy {
  id: number;
  coordinates: Record<GridType, Coordinate>;
}

type Grid = Tile[][];
type Coordinate = [number, number];

class GalaxyPair {
  public constructor (
    private readonly a: Galaxy,
    private readonly b: Galaxy,
  ) {
  }

  public getKey (): string {
    return [this.a.id, this.b.id]
      .sort((a, b) => a - b)
      .join('-');
  }

  public getDistance (gridType: GridType): number {
    const [x1, y1, x2, y2] = [
      ...this.a.coordinates[gridType],
      ...this.b.coordinates[gridType],
    ];

    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
  }
}

const expandHorizontally = (grid: Grid): Grid => {
  const expandedColumns = new Set(range(originalWidth).filter(x => grid.every(line => line[x] === Tile.EMPTY)));
  return grid.map(line => [...line].flatMap((tile, x) => expandedColumns.has(x) ? [tile, tile] : [tile]));
};

const expandVertically = (grid: Grid): Grid => (
  grid.flatMap(line => line.includes(Tile.GALAXY) ? [line] : [line, line])
);

const findGalaxyCoordinates = (grid: Grid): Coordinate[] => {
  const coordinates: Coordinate[] = [];

  grid.forEach((line, y) => {
    line.forEach((tile, x) => {
      if (tile === Tile.GALAXY) {
        coordinates.push([x, y]);
      }
    });
  });

  return coordinates;
};

const createGridRecord = <T>(mapFn: (gridType: GridType) => T): Record<GridType, T> => (
  Object.fromEntries(GRID_TYPES.map(gridType => [gridType, mapFn(gridType)])) as Record<GridType, T>
);

const populateGalaxies = (coordinates: Record<GridType, Coordinate[]>): Map<number, Galaxy> => (
  new Map(range(coordinates[GridType.ORIGINAL].length).map(id => ([
    id,
    {
      id,
      coordinates: createGridRecord(gridType => coordinates[gridType][id])
    },
  ])))
);

const grids: Record<GridType, Grid> = {
  [GridType.ORIGINAL]: originalGrid,
  [GridType.EXPANDED]: expandHorizontally(expandVertically(originalGrid)),
};

const galaxies = populateGalaxies(createGridRecord(gridType => findGalaxyCoordinates(grids[gridType])));

const getGalaxyById = (id: number): Galaxy => {
  const galaxy = galaxies.get(id);

  if (!galaxy) {
    throw new Error(`No galaxy with ID: ${id}`);
  }

  return galaxy;
};

const galaxyPairs = new Map(
  range(galaxies.size).flatMap(a => (
    range(galaxies.size).flatMap(b => (
      a === b ? [] : [new GalaxyPair(getGalaxyById(a), getGalaxyById(b))]
    ))
  ))
    .map(pair => [pair.getKey(), pair]),
);

const result1 = Array.from(galaxyPairs.values()).reduce((distance, pair) => (
  distance + pair.getDistance(GridType.EXPANDED)
), 0);

logResults(result1);
