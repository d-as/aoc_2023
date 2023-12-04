import { getInputLines, logResults, range } from "../util.js";

const input = getInputLines(import.meta);

const NUMBER_REGEX = new RegExp('\\d+', 'g');
const NUMBERS_REGEX = new RegExp(`(?:\\s*${NUMBER_REGEX.source}(?: )?)+`, 'g');
const CARD_REGEX = new RegExp(`Card \\s*(\\d+): (${NUMBERS_REGEX.source}) \\| (${NUMBERS_REGEX.source})`);

interface Card {
  id: number;
  winningNumbers: number[];
  yourNumbers: number[];
}

const parseCard = (line: string): Card | undefined => {
  const match = line.match(CARD_REGEX);

  if (match) {
    const [, id] = match;

    const [winningNumbers, yourNumbers] = match.slice(2).map(numbers => (
      Array.from(numbers.matchAll(NUMBER_REGEX)).map(([number]) => Number(number))
    ));

    return {
      id: Number(id),
      winningNumbers,
      yourNumbers,
    };
  }

  return undefined;
};

const cards = input.map(parseCard).filter(c => c) as Card[];

const getWinningCards = (card: Card): Card[] => {
  const matchCount = card.yourNumbers.filter(number => card.winningNumbers.includes(number)).length;

  if (matchCount) {
    return [
      card,
      ...range(matchCount, card.id).flatMap(cardIndex => getWinningCards(cards[cardIndex]))
    ];
  }

  return [card];
};

const result1 = cards.reduce((sum, card) => (
  sum + card.winningNumbers.reduce((points, number) => {
    const isMatch = card.yourNumbers.includes(number);
    return !points && isMatch ? 1 : points * (isMatch ? 2 : 1);
  }, 0)
), 0);

const result2 = cards.reduce((sum, card) => sum + getWinningCards(card).length, 0);

logResults(result1, result2);
