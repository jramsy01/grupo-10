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
    let gameOver = false;
  
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

          const piece = initialPositions[position];
          if (isPieceWhite(piece)) {
            square.classList.add("white-piece");
          } else {
            square.classList.add("black-piece");
          }
        }
  
        square.addEventListener("click", () => {
          handleSquareClick(square);
        });
  
        board.appendChild(square);
      }
    }
  
    function isPieceWhite(piece) {
      return ["♙", "♖", "♘", "♗", "♕", "♔"].includes(piece);
    }
    
    function isPieceBlack(piece) {
      return ["♟", "♜", "♞", "♝", "♛", "♚"].includes(piece);
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
    function capturePiece(capturedPiece, byWhite) {
      const container = byWhite
        ? document.getElementById("capturedByPlayer1")
        : document.getElementById("capturedByPlayer2");

      if (container && capturedPiece) {
        const span = document.createElement("span");
        span.textContent = capturedPiece;
        span.classList.add("captured-icon");

        // Detectar si es ficha blanca o negra según el ícono
        const whitePieces = ["♔", "♕", "♖", "♗", "♘", "♙"];
        const blackPieces = ["♚", "♛", "♜", "♝", "♞", "♟"];

        if (whitePieces.includes(capturedPiece)) {
          span.classList.add("white-piece");
        } else if (blackPieces.includes(capturedPiece)) {
          span.classList.add("black-piece");
        }

        container.appendChild(span);
      }
    }
  
    function handleSquareClick(square) {
      const piece = square.textContent;
      if (gameOver) return;

      // Si no hay pieza seleccionada aún
      if (!selectedSquare) {
        // Solo permitir seleccionar una pieza del turno actual
        if (piece && isWhiteTurn === isPieceWhite(piece)) {
          selectedSquare = square;
          square.classList.add("selected-square");

          clearHighlights();
          const moves = getPossibleMoves(square);
          moves.forEach(pos => {
            const sq = document.querySelector(`.square[data-position="${pos}"]`);
            if (sq) sq.classList.add("highlight-move");
          });
        } else {
          const status = document.getElementById("game-status");
          status.textContent = "No puedes mover esa pieza.";
          setTimeout(() => {
          status.textContent = isWhiteTurn ? "Turno de Blancas" : "Turno de Negras";
          }, 1500);
          alert("No puedes mover esa pieza. Es turno del otro jugador.");
        }
      } else {
        // Si se vuelve a hacer clic en la misma pieza, cancelar selección
        if (square === selectedSquare) {
          selectedSquare.classList.remove("selected-square");
          selectedSquare = null;
          clearHighlights();
        } else {
          // Solo permitir movimiento si está resaltado como movimiento válido
          if (!square.classList.contains("highlight-move")) return;

          // Hacer el movimiento
          
          const capturedPiece = square.textContent; // Lo que estaba en la casilla destino

          if (capturedPiece) {
            capturePiece(capturedPiece, isWhiteTurn); // Guarda la captura
          }

          square.textContent = selectedSquare.textContent;
          selectedSquare.textContent = "";

          // Verificar si se capturó al rey
          if (capturedPiece === "♚" || capturedPiece === "♔") {
            gameOver = true;
            const winner = capturedPiece === "♚" ? "¡Victoria de las Blancas!" : "¡Victoria de las Negras!";
            document.getElementById("game-status").innerHTML = `<strong style="color: green;">${winner}</strong>`;
            passBtn.style.display = "none";
            restartBtn.style.display = "inline-block";
            return; // Salimos para evitar cambiar el turno
          }

          // Mover las clases de color
          square.classList.remove("white-piece", "black-piece");
          if (selectedSquare.classList.contains("white-piece")) {
            square.classList.add("white-piece");
          } else if (selectedSquare.classList.contains("black-piece")) {
            square.classList.add("black-piece");
          }
          selectedSquare.classList.remove("white-piece", "black-piece");

          selectedSquare.classList.remove("selected-square");

          selectedSquare.style.outline = "none";
          selectedSquare = null;
          clearHighlights();

          // Cambiar de turno
          isWhiteTurn = !isWhiteTurn;
          document.getElementById("game-status").innerHTML = isWhiteTurn
            ? '⚪ Turno de <span style="color: #f0f0f0; text-shadow: 0 0 2px #000;">Blancas ♙</span>'
            : '⚫ Turno de <span style="color: #f0f0f0;">Negras ♟</span>';
        }
      }
    }
      
   
    const passBtn = document.getElementById("passBtn");
    const restartBtn = document.getElementById("restartBtn");
  
    document.getElementById("game-status").textContent = "Turno de Blancas";

    passBtn.addEventListener("click", () => {
      if (gameOver) return;

      gameOver = true;

      const winner = isWhiteTurn ? "¡Victoria de las Negras por rendición!" : "¡Victoria de las Blancas por rendición!";
      document.getElementById("game-status").innerHTML = `<strong style="color: white;">${winner}</strong>`;

      passBtn.style.display = "none";
      restartBtn.style.display = "inline-block";
    });

    restartBtn.addEventListener("click", () => {
      location.reload(); // recarga la página para reiniciar todo
    });
  });
  