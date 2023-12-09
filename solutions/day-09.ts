import { first, getInputLines, last, logResults } from "../util.js";

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

const predictions1 = differences.map(diffs => (
  diffs
    .map(last)
    .reduce((a, b) => a + b)
));

const predictions2 = differences
  .map(diffs => {
    let prediction = 0;

    let diff =
      diffs
        .reverse()
        .map(first);

    while (diff.length >= 2) {
      const [a, b] = diff;
      prediction = b - a;

      diff = [
        prediction,
        ...diff.slice(2),
      ];
    }

    return prediction;
  });

const result1 = predictions1.reduce((a, b) => a + b);

const result2 = predictions2.reduce((a, b) => a + b);

logResults(result1, result2);
