import { getInputLines, last, logResults } from "../util.js";

const input = getInputLines(import.meta);

const histories = input.map(line => (
  line.split(' ').map(Number)
));

const differences = histories.map(history => {
  const diffs: number[][] = [history];

  while (true) {
    const diff = last(diffs);

    diffs.push(
      diff.slice(1).map((n, i) => (
        n - diff[i]
      ))
    );

    if (last(diffs).every(n => n === 0)) {
      break;
    }
  }

  return diffs;
});

const predictions = differences.map(diffs => (
  diffs
    .map(last)
    .reduce((a, b) => a + b)
));

const result1 = predictions.reduce((a, b) => a + b);

logResults(result1);
