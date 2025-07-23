document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("chess-board");
    const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
  
    const initialPositions = {
      a8: "♜", b8: "♞", c8: "♝", d8: "♛", e8: "♚", f8: "♝", g8: "♞", h8: "♜",
      a7: "♟", b7: "♟", c7: "♟", d7: "♟", e7: "♟", f7: "♟", g7: "♟", h7: "♟",
      a2: "♙", b2: "♙", c2: "♙", d2: "♙", e2: "♙", f2: "♙", g2: "♙", h2: "♙",
      a1: "♖", b1: "♘", c1: "♗", d1: "♕", e1: "♔", f1: "♗", g1: "♘", h1: "♖"
    };
  
    board.innerHTML = "";
  
    let selectedSquare = null;
    let isWhiteTurn = true;
  
    for (let row = 8; row >= 1; row--) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.classList.add("square");
        const isWhite = (row + col) % 2 === 0;
        square.classList.add(isWhite ? "white" : "black");
  
        const position = letters[col] + row;
        square.dataset.position = position;
  
        if (initialPositions[position]) {
          square.textContent = initialPositions[position];
        }
  
        square.addEventListener("click", () => {
          handleSquareClick(square);
        });
  
        board.appendChild(square);
      }
    }
  
    function isPieceWhite(piece) {
      if (!piece) return false;
      return piece.charCodeAt(0) >= 9812;
    }
  
    function clearHighlights() {
      const squares = document.querySelectorAll(".square");
      squares.forEach(sq => {
        sq.classList.remove("highlight-move");
        sq.style.outline = "none";
      });
    }
  
    function getPieceAt(pos) {
      const sq = document.querySelector(`.square[data-position="${pos}"]`);
      return sq ? sq.textContent : null;
    }
  
    function getPossibleMoves(square) {
      const pos = square.dataset.position;
      const col = pos.charCodeAt(0);
      const row = parseInt(pos[1]);
      const piece = square.textContent;
      const moves = [];
  
      const whitePawn = "♙";
      const blackPawn = "♟";
  
      function isEmpty(position) {
        return !getPieceAt(position);
      }
  
      function isEnemy(position) {
        const target = getPieceAt(position);
        return target && isPieceWhite(target) !== isPieceWhite(piece);
      }
  
      function isOnBoard(r, c) {
        return r >= 1 && r <= 8 && c >= 97 && c <= 104;
      }
  
      // Peones blanco
      if (piece === whitePawn) {
        const forward = row + 1;
        const forwardPos = String.fromCharCode(col) + forward;
        if (forward <= 8 && isEmpty(forwardPos)) {
          moves.push(forwardPos);
          if (row === 2) {
            const doubleForwardPos = String.fromCharCode(col) + (row + 2);
            if (isEmpty(doubleForwardPos)) moves.push(doubleForwardPos);
          }
        }
        const captures = [
          String.fromCharCode(col - 1) + (row + 1),
          String.fromCharCode(col + 1) + (row + 1),
        ];
        captures.forEach(p => {
          if (isEnemy(p)) moves.push(p);
        });
      }
  
      // Peones negro
      else if (piece === blackPawn) {
        const forward = row - 1;
        const forwardPos = String.fromCharCode(col) + forward;
        if (forward >= 1 && isEmpty(forwardPos)) {
          moves.push(forwardPos);
          if (row === 7) {
            const doubleForwardPos = String.fromCharCode(col) + (row - 2);
            if (isEmpty(doubleForwardPos)) moves.push(doubleForwardPos);
          }
        }
        const captures = [
          String.fromCharCode(col - 1) + (row - 1),
          String.fromCharCode(col + 1) + (row - 1),
        ];
        captures.forEach(p => {
          if (isEnemy(p)) moves.push(p);
        });
      }
  
      // Torre
      else if (piece === "♖" || piece === "♜") {
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        directions.forEach(([dr, dc]) => {
          let r = row + dr, c = col + dc;
          while (isOnBoard(r, c)) {
            const p = String.fromCharCode(c) + r;
            if (isEmpty(p)) {
              moves.push(p);
            } else {
              if (isEnemy(p)) moves.push(p);
              break;
            }
            r += dr;
            c += dc;
          }
        });
      }
  
      // Caballo
      else if (piece === "♘" || piece === "♞") {
        const offsets = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
        offsets.forEach(([dr, dc]) => {
          const r = row + dr, c = col + dc;
          if (isOnBoard(r, c)) {
            const p = String.fromCharCode(c) + r;
            if (isEmpty(p) || isEnemy(p)) moves.push(p);
          }
        });
      }
  
      // Alfil
      else if (piece === "♗" || piece === "♝") {
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        directions.forEach(([dr, dc]) => {
          let r = row + dr, c = col + dc;
          while (isOnBoard(r, c)) {
            const p = String.fromCharCode(c) + r;
            if (isEmpty(p)) {
              moves.push(p);
            } else {
              if (isEnemy(p)) moves.push(p);
              break;
            }
            r += dr;
            c += dc;
          }
        });
      }
  
      // Dama
      else if (piece === "♕" || piece === "♛") {
        const directions = [
          [1, 0], [-1, 0], [0, 1], [0, -1],
          [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];
        directions.forEach(([dr, dc]) => {
          let r = row + dr, c = col + dc;
          while (isOnBoard(r, c)) {
            const p = String.fromCharCode(c) + r;
            if (isEmpty(p)) {
              moves.push(p);
            } else {
              if (isEnemy(p)) moves.push(p);
              break;
            }
            r += dr;
            c += dc;
          }
        });
      }
  
      // Rey (sin enroque)
      else if (piece === "♔" || piece === "♚") {
        const directions = [
          [1, 0], [-1, 0], [0, 1], [0, -1],
          [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];
        directions.forEach(([dr, dc]) => {
          const r = row + dr, c = col + dc;
          if (isOnBoard(r, c)) {
            const p = String.fromCharCode(c) + r;
            if (isEmpty(p) || isEnemy(p)) moves.push(p);
          }
        });
      }
  
      return moves;
    }
  
    function handleSquareClick(square) {
      const piece = square.textContent;
  
      if (!selectedSquare) {
        if (piece && isWhiteTurn === isPieceWhite(piece)) {
          selectedSquare = square;
          square.style.outline = "3px solid #00f";
  
          clearHighlights();
          const moves = getPossibleMoves(square);
          moves.forEach(pos => {
            const sq = document.querySelector(`.square[data-position="${pos}"]`);
            if (sq) sq.classList.add("highlight-move");
          });
        }
      } else {
        if (square === selectedSquare) {
          square.style.outline = "none";
          selectedSquare = null;
          clearHighlights();
        } else {
          if (!square.classList.contains("highlight-move")) return;
  
          square.textContent = selectedSquare.textContent;
          selectedSquare.textContent = "";
  
          selectedSquare.style.outline = "none";
          selectedSquare = null;
          clearHighlights();
  
          isWhiteTurn = !isWhiteTurn;
          document.getElementById("game-status").textContent = isWhiteTurn
            ? "Turno de Blancas"
            : "Turno de Negras";
        }
      }
    }
  
    const loggedInUser = "Jaime Rojas";
    const playerNameSpan = document.getElementById("playerName");
    if (playerNameSpan) playerNameSpan.textContent = loggedInUser;
  
    document.getElementById("game-status").textContent = "Turno de Blancas";
  });
  