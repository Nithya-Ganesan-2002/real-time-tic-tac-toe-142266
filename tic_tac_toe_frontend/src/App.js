import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Color theme (via CSS in App.css)
 *  - primary:   #1976D2 (main board/accents)
 *  - secondary: #424242 (text, outlines)
 *  - accent:    #FFCA28 (winner highlight)
 */

const MODES = {
  HUMAN: "Two Players",
  AI: "Play vs AI"
};

// ----------- PUBLIC_INTERFACE
function App() {
  // Game mode: "Two Players" (local) or "Play vs AI"
  const [mode, setMode] = useState(MODES.HUMAN);

  // Game state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [aiThinking, setAIThinking] = useState(false);

  // Winners/Draw
  const winner = calculateWinner(board);
  const isBoardFull = board.every(cell => cell !== null);
  const isDraw = !winner && isBoardFull;

  // Determine who's the AI
  const isAIMode = mode === MODES.AI;
  const aiSymbol = "O";

  // AI turn effect
  useEffect(() => {
    // If AI mode, AI is "O", not over, O's turn
    if (
      isAIMode &&
      !winner &&
      !isDraw &&
      !aiThinking &&
      !xIsNext // O's turn, so possibly AI
    ) {
      setAIThinking(true);
      setTimeout(() => {
        const move = computeAIMove(board, aiSymbol);
        if (move !== null && !board[move]) {
          const newBoard = board.slice();
          newBoard[move] = aiSymbol;
          setBoard(newBoard);
          setXIsNext(true);
        }
        setAIThinking(false);
      }, 500); // Nice 0.5s pause for realism/UX
    }
    // eslint-disable-next-line
  }, [board, xIsNext, winner, isDraw, isAIMode, aiThinking]);

  // Handle click: only if correct player's turn
  // ----------- PUBLIC_INTERFACE
  function handleSquareClick(idx) {
    // If AI mode, and it's O's turn or AI "thinking", humans can't click
    if (
      winner ||
      board[idx] ||
      (isAIMode && !xIsNext)
    ) {
      return;
    }
    const next = xIsNext ? "X" : "O";
    const newBoard = board.slice();
    newBoard[idx] = next;
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }

  // ----------- PUBLIC_INTERFACE
  function handleRestart() {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setAIThinking(false);
  }

  function handleModeChange(e) {
    const selected = e.target.value;
    // If changing mode mid-game, just reset
    setMode(selected);
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setAIThinking(false);
  }

  // Status message
  let status;
  if (winner) {
    status = (
      <span>
        <span className="winner-text">
          Winner: {winner}
        </span>
      </span>
    );
  } else if (isDraw) {
    status = <span className="draw-text">It's a draw!</span>;
  } else if (isAIMode && !xIsNext) {
    status = (
      <span>
        <span className="o-text">AI is playing...</span>
      </span>
    );
  } else {
    status = (
      <span>
        Next turn: <span className={xIsNext ? "x-text" : "o-text"}>{xIsNext ? "X" : (isAIMode ? "You" : "O")}</span>
      </span>
    );
  }

  return (
    <div className="ttt-root">
      <div className="ttt-container">
        <h1 className="ttt-title">Tic Tac Toe</h1>

        <ModeSelector
          mode={mode}
          onModeChange={handleModeChange}
        />

        <div className="ttt-status">{status}</div>
        <Board board={board} onSquareClick={handleSquareClick} winner={winner} />

        <button className="ttt-restart-btn" onClick={handleRestart} aria-label="Restart">
          Restart Game
        </button>
      </div>
      <footer className="ttt-footer">
        <span>Made with <span role="img" aria-label="react">⚛️</span></span>
      </footer>
    </div>
  );
}

// -------- Mode selector component
function ModeSelector({ mode, onModeChange }) {
  return (
    <div style={{
      marginBottom: "1.2em",
      display: "flex",
      gap: "1em",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap"
    }}>
      <label htmlFor="ttt-mode" style={{
        fontWeight: 500,
        color: "var(--ttt-secondary)",
        fontSize: "1.1em"
      }}>
        Game Mode:
      </label>
      <select
        id="ttt-mode"
        value={mode}
        onChange={onModeChange}
        style={{
          padding: "0.5em 1.1em",
          fontSize: "1em",
          borderRadius: "var(--ttt-btn-radius)",
          border: "1.5px solid var(--ttt-board-outline)",
          background: "var(--ttt-board-bg)",
          color: "var(--ttt-primary)",
          fontWeight: "bold",
        }}
        aria-label="Game mode"
      >
        <option value={MODES.HUMAN}>{MODES.HUMAN}</option>
        <option value={MODES.AI}>{MODES.AI}</option>
      </select>
    </div>
  );
}

// -------- BOARD COMPONENT
function Board({ board, onSquareClick, winner }) {
  // Highlight winning cells if present
  const winningLine = winner ? findWinningLine(board) : [];
  return (
    <div className="ttt-board">
      {board.map((val, idx) => (
        <Square
          key={idx}
          value={val}
          onClick={() => onSquareClick(idx)}
          highlight={winningLine.includes(idx)}
        />
      ))}
    </div>
  );
}

// -------- SQUARE COMPONENT
function Square({ value, onClick, highlight }) {
  return (
    <button
      className={
        `ttt-square${highlight ? ' ttt-square--highlight' : ''}`
        + (value === "X" ? ' ttt-square--x' : value === "O" ? ' ttt-square--o' : '')
      }
      onClick={onClick}
      aria-label={value ? value : "Empty square"}
      tabIndex={0}
      disabled={value !== null}
    >
      {value}
    </button>
  );
}

// -------- Game logic helpers
// -------- PUBLIC_INTERFACE
function calculateWinner(squares) {
  /** Returns "X", "O", or null if no winner yet */
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diags
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// -------- Helper: returns [indexes] of winning line, or []
function findWinningLine(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return line;
    }
  }
  return [];
}

// --------- AI LOGIC (simple but effective!)
// -------- PUBLIC_INTERFACE
function computeAIMove(board, ai) {
  // ai: "O" (but could be "X")
  const other = ai === "X" ? "O" : "X";

  // 1. Win: if AI can win, do it
  for (let idx = 0; idx < 9; ++idx) {
    if (!board[idx]) {
      const testBoard = board.slice();
      testBoard[idx] = ai;
      if (calculateWinner(testBoard) === ai) return idx;
    }
  }
  // 2. Block: if opponent can win, block it
  for (let idx = 0; idx < 9; ++idx) {
    if (!board[idx]) {
      const testBoard = board.slice();
      testBoard[idx] = other;
      if (calculateWinner(testBoard) === other) return idx;
    }
  }
  // 3. Take center if open
  if (!board[4]) return 4;
  // 4. Take one of the corners if open
  const corners = [0,2,6,8].filter(i => !board[i]);
  if (corners.length > 0) return corners[Math.floor(Math.random()*corners.length)];
  // 5. Take any open side
  const sides = [1,3,5,7].filter(i => !board[i]);
  if (sides.length > 0) return sides[Math.floor(Math.random()*sides.length)];
  return null; // No possible moves (should not happen)
}

export default App;
