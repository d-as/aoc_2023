import { firstDefined, getInputLines, logResults, range } from "../util.js";

const originalGrid = getInputLines(import.meta).map(line => [...line]) as Grid;
const originalSize = firstDefined(originalGrid).length;

enum Tile {
  EMPTY  = '.',
  GALAXY = '#',
}

enum GridType {
  ORIGINAL      = 'original',
  EXPANDED      = 'expanded',
  MEGA_EXPANDED = 'mega_expanded',
}

const GRID_TYPES = Object.values(GridType);

const GRID_EXPANSION_RATES: Record<GridType, number> = {
  [GridType.ORIGINAL]:      1,
  [GridType.EXPANDED]:      2,
  [GridType.MEGA_EXPANDED]: originalSize,
};

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

    return this.getTrueDistance(Math.abs(x2 - x1)) + this.getTrueDistance(Math.abs(y2 - y1));
  }

  private getTrueDistance (distance: number): number {
    return distance + (Math.floor(distance / originalSize) * (1e6 - originalSize)); 
  }
}

const expandHorizontally = (grid: Grid, gridType: GridType): Grid => {
  const expandedColumns = new Set(range(originalSize).filter(x => grid.every(line => line[x] === Tile.EMPTY)));

  return grid.map(line => [...line].flatMap((tile, x) => (
    expandedColumns.has(x) ? range(GRID_EXPANSION_RATES[gridType]).map(() => tile) : [tile]
  )));
};

const expandVertically = (grid: Grid, gridType: GridType): Grid => (
  grid.flatMap(line => line.includes(Tile.GALAXY) ? [line] : range(GRID_EXPANSION_RATES[gridType]).map(() => line))
);

const expandGrid = (grid: Grid, gridType: GridType): Grid => (
  gridType === GridType.ORIGINAL ? grid : expandHorizontally(expandVertically(grid, gridType), gridType)
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

const grids = createGridRecord(gridType => expandGrid(originalGrid, gridType));
const galaxies = populateGalaxies(createGridRecord(gridType => findGalaxyCoordinates(grids[gridType])));

const getGalaxyById = (id: number): Galaxy => (
  galaxies.get(id) as Galaxy
);

const galaxyPairs = new Map(
  range(galaxies.size).flatMap(a => (
    range(galaxies.size).flatMap(b => (
      a === b ? [] : [new GalaxyPair(getGalaxyById(a), getGalaxyById(b))]
    ))
  ))
    .map(pair => [pair.getKey(), pair]),
);

const results = GRID_TYPES.slice(1).map(gridType => (
  Array.from(galaxyPairs.values()).reduce((distance, pair) => (
    distance + pair.getDistance(gridType)
  ), 0)
));

logResults(...results);
