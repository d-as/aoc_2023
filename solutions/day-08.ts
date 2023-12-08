import { getInputLines, logResults } from "../util.js";

const [directionInput, ...nodeInput] = getInputLines(import.meta);

enum Direction {
  LEFT  = 'L',
  RIGHT = 'R',
}

interface Node {
  ID: string;
  [Direction.LEFT]: string;
  [Direction.RIGHT]: string;
}

const START_NODE = 'AAA';
const END_NODE   = 'ZZZ';

const NODE_INPUT_REGEX = /([A-Z]{3}) = \(([A-Z]{3}), ([A-Z]{3})\)/;

const nodes = new Map<string, Node>(nodeInput.map(line => {
  const [, ID, L, R] = line.match(NODE_INPUT_REGEX) ?? [];
  return [ID, { ID, L, R }];
}));

function* createDirectionGenerator(): Generator<[Direction, number], never> {
  let steps = 0;

  while (true) {
    yield [directionInput[(steps++) % directionInput.length] as Direction, steps];
  }
}

let direction: Direction;
let steps: number;
let node = nodes.get(START_NODE) as Node;

const directions = createDirectionGenerator();

const getNode = (id: string): Node => (
  nodes.get(id) as Node
)

while (true) {
  [direction, steps] = directions.next().value;
  node = getNode(node[direction]);

  if (node.ID === END_NODE) {
    break;
  }
}

logResults(steps);
