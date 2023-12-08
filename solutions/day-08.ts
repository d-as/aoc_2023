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

const getNode = (id: string): Node => (
  nodes.get(id) as Node
);

const isGhostStartNode = ({ ID }: Node) => (
  ID.endsWith('A')
);

const isGhostEndNode = ({ ID }: Node) => (
  ID.endsWith('Z')
);

const gcd = (a: number, b: number): number => (
  b === 0 ? a : gcd(b, a % b)
);

const lcm = (a: number, b: number): number => (
  (a * b) / gcd(a, b)
);

const multiLcm = (numbers: number[]): number => {
  const [n] = numbers;
  return numbers.slice(1).reduce((a, b) => lcm(a, b), n);
};

const getSteps = (node: Node, isEndNode: (node: Node) => boolean) => {
  let steps = 0;
  let direction: Direction;
  const directions = createDirectionGenerator();

  while (true) {
    [direction, steps] = directions.next().value;
    node = getNode(node[direction]);
  
    if (isEndNode(node)) {
      break;
    }
  }

  return steps;
};

const result1 = getSteps(getNode(START_NODE), ({ ID }) => ID === END_NODE);

const ghostNodes = Array.from(nodes.values()).filter(isGhostStartNode);
const result2 = multiLcm(ghostNodes.map(node => getSteps(node, isGhostEndNode)));

logResults(result1, result2);
