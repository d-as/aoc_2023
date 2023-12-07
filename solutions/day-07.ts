import { getInputLines, logResults } from "../util.js";

const input = getInputLines(import.meta);

enum Card {
  TWO   = '2',
  THREE = '3',
  FOUR  = '4',
  FIVE  = '5',
  SIX   = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE  = '9',
  T     = 'T',
  J     = 'J',
  Q     = 'Q',
  K     = 'K',
  A     = 'A',
}

enum HandType {
  HIGH_CARD,
  ONE_PAIR,
  TWO_PAIR,
  THREE_OF_A_KIND,
  FULL_HOUSE,
  FOUR_OF_A_KIND,
  FIVE_OF_A_KIND,
}

type Hand = Card[];

const CARDS = Object.values(Card);
const CARDS_WITHOUT_J = CARDS.filter(card => card !== Card.J);

const INPUT_REGEX = new RegExp(`((?:${CARDS.join('|')}){5}) (\\d+)`);

const getCardValue = (card: Card, useJokers: boolean): number => {
  if (useJokers && card === Card.J) {
    return 1;
  }

  const index = CARDS.slice(CARDS.indexOf(Card.T)).indexOf(card);
  return index === -1 ? Number(card) : index + 10;
};

const getCardCount = (hand: Card[]) => (card: Card): number => (
  hand.filter(c => c === card).length
);

const getCardSequence = (card: Card, count: number): Card[] => (
  card
    .toString()
    .repeat(count)
    .split('') as Hand
);

const getCardCombinations = (length: number): Hand[] => {
  if (length === 1) {
    return CARDS_WITHOUT_J.map(card => [card]);
  } else if (length === 2) {
    return CARDS_WITHOUT_J.flatMap(a => CARDS_WITHOUT_J.map(b => [a, b]));
  } else if (length === 3) {
    return CARDS_WITHOUT_J.flatMap(a => CARDS_WITHOUT_J.flatMap(b => CARDS_WITHOUT_J.map(c => [a, b, c])));
  }
  throw new Error(`Invalid length: ${length}`);
};

const getPossibleHands = (hand: Card[], useJokers: boolean): Hand[] => {
  const jokerCount = getCardCount(hand)(Card.J);

  if (!useJokers || jokerCount === 0) {
    return [hand];
  }
  
  if (jokerCount === hand.length) {
    return [getCardSequence(Card.A, hand.length)];
  } else if (jokerCount === hand.length - 1) {
    return [getCardSequence(hand.find(card => card !== Card.J) as Card, hand.length)];
  }

  const handStr = hand.join('');

  return getCardCombinations(jokerCount).map(combination => (
    combination
      .reduce((possibleHand, card) => possibleHand.replace(Card.J, card), handStr)
      .split('') as Hand
  ));
};

const getHandType = (hand: Hand, useJokers: boolean): HandType => {
  const [bestHand] = getPossibleHands(hand, useJokers).map(possibleHand => {
    const [maxCardCount, secondCardCount] =
      Array.from(new Set(possibleHand))
        .map(getCardCount(possibleHand))
        .sort((a, b) => b - a);

    if (maxCardCount === 5) {
      return HandType.FIVE_OF_A_KIND;
    } else if (maxCardCount === 4) {
      return HandType.FOUR_OF_A_KIND;
    } else if (maxCardCount === 3) {
      return secondCardCount === 2 ? HandType.FULL_HOUSE : HandType.THREE_OF_A_KIND;
    } else if (maxCardCount === 2) {
      return secondCardCount === 2 ? HandType.TWO_PAIR : HandType.ONE_PAIR;
    }
    return HandType.HIGH_CARD;
  })
    .sort((a, b) => b - a);

  return bestHand;
};

const getHandScore = (hand: Hand, useJokers: boolean): number => (
  getHandType(hand, useJokers) * Math.pow(16, hand.length) + (
    hand
      .map((card, i) => getCardValue(card, useJokers) * Math.pow(16, hand.length - i - 1))
      .reduce((a, b) => a + b)
  )
);

const [result1, result2] = [false, true].map(useJokers => (
  input
    .map(line => {
      const [, cards, bid] = line.match(INPUT_REGEX) ?? [];
      const hand = [...cards] as Hand;

      return {
        hand,
        bid: Number(bid),
        score: getHandScore(hand, useJokers),
      };
    })
    .sort((a, b) => a.score - b.score)
    .map(({ bid }, i) => bid * (i + 1))
    .reduce((a, b) => a + b)
));

logResults(result1, result2);
