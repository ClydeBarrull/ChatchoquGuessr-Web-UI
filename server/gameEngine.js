
export function pickRounds(rows, rounds = 11) { // faut mettre 1 de plus 11 = 10 déso jsp pas coder
  const byAuthor = {};
  rows.forEach(({ message, author }) => {
    if (!byAuthor[author]) byAuthor[author] = [];
    byAuthor[author].push(message);
    // byAuthor[author].push("https://tenor.com/view/horse-cat-ride-it-gif-20219971");
  });
  const authors = Object.entries(byAuthor)
    .filter(([, msgs]) => msgs.length >= 5)
    .map(([a]) => a);
  shuffle(authors);
  const selectedAuthors = authors.slice(0, rounds);
  return selectedAuthors.map((author) => {
    const msgs = shuffle([...byAuthor[author]]).slice(0, 5);
    return { author, messages: msgs };
  });
}

export function scoreGuess(base, step, visibleIdx) {
  const pts = base - step * visibleIdx;
  return pts < 0 ? 0 : pts;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
