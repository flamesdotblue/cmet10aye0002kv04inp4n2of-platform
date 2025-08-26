import React, { useMemo, useState } from 'react';

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function calculateWinner(squares) {
  for (const [a, b, c] of WIN_LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: [] };
}

function App() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, D: 0 });

  const { winner, line } = useMemo(() => calculateWinner(squares), [squares]);
  const isBoardFull = useMemo(() => squares.every(Boolean), [squares]);
  const isGameOver = winner !== null || (isBoardFull && !winner);

  const status = useMemo(() => {
    if (winner) return `Winner: ${winner}`;
    if (isBoardFull) return "It's a draw";
    return `Next player: ${xIsNext ? 'X' : 'O'}`;
  }, [winner, isBoardFull, xIsNext]);

  function handleSquareClick(idx) {
    if (squares[idx] || winner) return;
    setSquares(prev => {
      const next = prev.slice();
      next[idx] = xIsNext ? 'X' : 'O';
      return next;
    });
    setXIsNext(prev => !prev);
  }

  function playAgain() {
    setSquares(Array(9).fill(null));
    // Loser starts next, if draw alternate
    if (!winner) {
      setXIsNext(prev => !prev);
    } else {
      setXIsNext(winner === 'X' ? false : true);
    }
  }

  function resetAll() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setScores({ X: 0, O: 0, D: 0 });
  }

  // Update scores exactly once per finished game
  React.useEffect(() => {
    if (!isGameOver) return;
    setScores(prev => {
      // Prevent double counting by checking if already reflected: we can store a hash of board? Simpler: only add if a hidden flag says not counted yet.
      // We'll use a simple reducer: compare with a ref storing last completion snapshot.
      return prev; // actual increment handled below via a separate effect with a ref
    });
  }, [isGameOver]);

  const tallyRef = React.useRef({ countedKey: '' });
  React.useEffect(() => {
    if (!isGameOver) return;
    const key = squares.join('');
    if (tallyRef.current.countedKey === key) return;
    tallyRef.current.countedKey = key;
    setScores(prev => ({
      X: prev.X + (winner === 'X' ? 1 : 0),
      O: prev.O + (winner === 'O' ? 1 : 0),
      D: prev.D + (!winner ? 1 : 0),
    }));
  }, [isGameOver, squares, winner]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Tic-Tac-Toe</h1>
          <p className="text-slate-400 mt-1">Simple, fast, and fun.</p>
        </header>

        <section className="grid grid-cols-3 gap-2 mb-4 select-none">
          {squares.map((val, idx) => {
            const isWinning = line.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleSquareClick(idx)}
                aria-label={`Square ${idx + 1}${val ? `, ${val}` : ''}`}
                className={[
                  'aspect-square rounded-lg border transition-all flex items-center justify-center',
                  'text-4xl font-extrabold',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950',
                  val
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-800'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-800',
                  isWinning ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-950' : '',
                  winner || val ? 'cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
                disabled={Boolean(val) || Boolean(winner)}
              >
                <span className={val === 'X' ? 'text-sky-400 drop-shadow' : 'text-pink-400 drop-shadow'}>
                  {val}
                </span>
              </button>
            );
          })}
        </section>

        <section className="flex items-center justify-between mb-4">
          <div className="text-lg">
            <span className="font-semibold">{status}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={playAgain}
              className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition text-white text-sm"
            >
              {isGameOver ? 'Play again' : 'Reset board'}
            </button>
            <button
              onClick={resetAll}
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 active:bg-slate-900 transition text-slate-200 text-sm border border-slate-700"
            >
              Reset scores
            </button>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="p-3 rounded-md bg-slate-900 border border-slate-800">
            <div className="text-slate-400 mb-1">X wins</div>
            <div className="text-2xl font-bold text-sky-400">{scores.X}</div>
          </div>
          <div className="p-3 rounded-md bg-slate-900 border border-slate-800">
            <div className="text-slate-400 mb-1">Draws</div>
            <div className="text-2xl font-bold text-amber-300">{scores.D}</div>
          </div>
          <div className="p-3 rounded-md bg-slate-900 border border-slate-800">
            <div className="text-slate-400 mb-1">O wins</div>
            <div className="text-2xl font-bold text-pink-400">{scores.O}</div>
          </div>
        </section>

        <footer className="mt-6 text-center text-xs text-slate-500">
          Pro tip: Use optimal play to never lose.
        </footer>
      </div>
    </div>
  );
}

export default App;
