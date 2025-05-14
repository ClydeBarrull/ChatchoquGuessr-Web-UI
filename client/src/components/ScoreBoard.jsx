const colourName = (name, results) =>
  results[name] === true
    ? 'text-green-600'
    : results[name] === false
    ? 'text-red-600'
    : '';

const ScoreBoard = ({ leaderboard, results }) => (
  <div className="bg-white p-4 rounded shadow w-full max-w-sm">
    <h3 className="font-semibold mb-2">Scores</h3>
    <ul>
      {leaderboard.map((p) => (
        <li key={p.name} className="flex justify-between">
          <span className={colourName(p.name, results)}>{p.name}</span>
          <span>{p.score}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default ScoreBoard;
