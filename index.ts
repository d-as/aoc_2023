import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

import {
  INPUT_PATH,
  INPUT_PREFIX,
  PUZZLE_COUNT,
  SOLUTIONS_PATH,
  SOLUTION_PREFIX,
  SOLUTION_TEMPLATE_NAME,
} from './constants.js';

import {
  Assert,
  formatDate,
  getDayFromFilename,
  getInputFileName,
  getInputURL,
  getNextPuzzleText,
  getReleasedPuzzleCount,
  getSolutionFileName,
  getYear,
  inputFileExists,
  plural,
  range,
  solutionFileExists,
} from './util.js';

dotenv.config();

let { SESSION_COOKIE } = process.env;

if (!SESSION_COOKIE) {
  console.log('Missing SESSION_COOKIE in .env');
}

const currentDate = new Date();
const year = Assert.validYear(getYear(currentDate));
const releasedPuzzleCount = getReleasedPuzzleCount(currentDate);
const inputFiles = fs.readdirSync(INPUT_PATH);

console.log('Advent of Code', year);

console.log('Current date:', formatDate(currentDate));

console.log('Released puzzles:', `${releasedPuzzleCount}/${PUZZLE_COUNT}`);

if (releasedPuzzleCount > 0) {
  console.log('Latest puzzle:', `https://adventofcode.com/${year}/day/${releasedPuzzleCount}`);
}

console.log('Next puzzle in:', getNextPuzzleText(currentDate, releasedPuzzleCount));

const inputFilesToBeFetched = range(releasedPuzzleCount, 1)
  .filter(day => !inputFileExists(day, inputFiles));

if (SESSION_COOKIE && inputFilesToBeFetched.length > 0) {
  console.log(
    `Fetching ${inputFilesToBeFetched.length} input file${plural(inputFilesToBeFetched)}`
  );

  let invalidSessionCookie = false;

  Promise.all(
    inputFilesToBeFetched
      .map(day => fetch(getInputURL(year, day), {
        headers: {
          Cookie: `session=${SESSION_COOKIE}`
        }
      }))
  )
    .then(responses => {
      responses.forEach((response, i) => {
        response.text().then(input => {
          if (input.startsWith('Please')) {
            if (!invalidSessionCookie) {
              invalidSessionCookie = true;
              console.log('Invalid session cookie');
            }
          } else {
            fs.writeFileSync(path.join(INPUT_PATH, getInputFileName(inputFilesToBeFetched[i])), input);
          }
        });
      })
    });
}

const solutionFiles = fs.readdirSync(SOLUTIONS_PATH);

const solutionFilesToBeCreated = range(releasedPuzzleCount, 1)
  .filter(day => !solutionFileExists(day, solutionFiles))
  .map(getSolutionFileName);

if (solutionFilesToBeCreated.length > 0) {
  const template = fs.readFileSync(path.join(SOLUTIONS_PATH, SOLUTION_TEMPLATE_NAME));

  console.log(
    `Creating ${solutionFilesToBeCreated.length} solution file${plural(solutionFilesToBeCreated)}`
  );

  solutionFilesToBeCreated.forEach(solution => (
    fs.writeFileSync(path.join(SOLUTIONS_PATH, solution), template)
  ));
}

const sortByFileName = (a: string, b: string) => getDayFromFilename(b) - getDayFromFilename(a);

const [latestSolution] = fs.readdirSync(SOLUTIONS_PATH)
  .filter(file => file.match(new RegExp(`${SOLUTION_PREFIX}\\d{2}`)))
  .sort(sortByFileName);

if (latestSolution) {
  const input = fs.readFileSync(path.join(INPUT_PATH, getInputFileName(getDayFromFilename(latestSolution))));

  if (input) {
    console.log(`Executing ${latestSolution}:\n`);

    exec(`tsx ${path.join(SOLUTIONS_PATH, latestSolution)}`, (error, stdout, stderr) => {
      if (error) {
        return console.error(error);
      } else if (stdout) {
        console.log(stdout);
      } else if (stderr) {
        console.error(stderr);
      }
    });
  } else {
    console.log('Missing input file. Try running the script again.');
  }
} else {
  console.log('No solutions found');
}
