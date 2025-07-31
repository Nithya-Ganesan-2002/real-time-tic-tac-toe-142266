import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Color theme (referenced via CSS variables for UI):
 * primary:   #1976D2 (main board color/accent)
 * secondary: #424242 (dark text/outline)
 * accent:    #FFCA28 (winner highlight)
 */

// PUBLIC_INTERFACE
function App() {
  // Main game state: values for each board cell ("X", "O", or null)
  const [board, setBoard] = useState(Array(9).fill(null));
  // Player turn: true = X's turn, false = O's turn
  const [xIsNext, setXIsNext] = useState(true);
  // Has someone won or is it a draw?
  const winner = calculateWinner(board);
  const isBoardFull = board.every(cell => cell !== null);
  const isDraw = !winner && isBoardFull;

  // PUBLIC_INTERFACE
  function handleSquareClick(idx) {
    // Ignore if there’s a winner, draw, or cell is filled
    if (winner || board[idx]) return;
    // Mark cell with current player's symbol
    const newBoard = board.slice();
    newBoard[idx] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  }

  // Render status message at the top
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
  } else {
    status = (
      <span>
        Next turn: <span className={xIsNext ? "x-text" : "o-text"}>{xIsNext ? "X" : "O"}</span>
      </span>
    );
  }

  // Render the game layout
  return (
    <div className="ttt-root">
      <div className="ttt-container">
        <h1 className="ttt-title">Tic Tac Toe</h1>
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

// BOARD COMPONENT
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

// SQUARE COMPONENT
function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square${highlight ? ' ttt-square--highlight' : ''}${value === "X" ? ' ttt-square--x' : value === "O" ? ' ttt-square--o' : ''}`}
      onClick={onClick}
      aria-label={value ? value : "Empty square"}
      tabIndex={0}
    >
      {value}
    </button>
  );
}

// Game logic helpers
// PUBLIC_INTERFACE
function calculateWinner(squares) {
  /** Returns "X", "O", or null if no winner yet */
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diags
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]; // "X" or "O"
    }
  }
  return null;
}

// Helper to highlight which squares form the win
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

export default App;
