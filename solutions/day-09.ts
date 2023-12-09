import { firstDefined, getInputLines, lastDefined, logResults } from "../util.js";

const input = getInputLines(import.meta);

const histories = input.map(line => line.split(' ').map(Number));

const differences = histories.map(history => {
  const diffs: number[][] = [history];

  while (true) {
    const diff = lastDefined(diffs);
    diffs.push(diff.slice(1).map((n, i) => n - diff[i]));

    if (lastDefined(diffs).every(n => n === 0)) {
      break;
    }
  }

  return diffs;
});

const predictions1 = differences.map(diffs => (
  diffs
    .map(lastDefined)
    .reduce((a, b) => a + b)
));

const predictions2 = differences
  .map(diffs => {
    let prediction = 0;
    let diff = diffs.reverse().map(firstDefined);

    while (diff.length >= 2) {
      const [a, b] = diff;
      prediction = b - a;
      diff = [prediction, ...diff.slice(2)];
    }

    return prediction;
  });


logResults(...[predictions1, predictions2].map(predictions => predictions.reduce((a, b) => a + b)));
