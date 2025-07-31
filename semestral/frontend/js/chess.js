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
  let aiThinking = false;

  // ===== SISTEMA DE IA OPTIMIZADA =====
  
  // Valores de las piezas para evaluación
  const pieceValues = {
      "♙": 1, "♟": -1,
      "♖": 5, "♜": -5,
      "♘": 3, "♞": -3,
      "♗": 3, "♝": -3,
      "♕": 9, "♛": -9,
      "♔": 1000, "♚": -1000
  };

  // Tablas de posición simplificadas
  const positionBonus = {
      pawn: {center: 20, advance: 10},
      knight: {center: 15, edge: -20},
      bishop: {diagonal: 10, center: 5},
      rook: {openFile: 10, seventhRank: 15},
      queen: {center: 5, active: 10},
      king: {safety: 20, endgame: 10}
  };

  // Sistema de IA rápida
  class FastChessAI {
      constructor() {
          this.maxDepth = 3; // Reducido de 4 a 3 para mayor velocidad
          this.moveCache = new Map();
      }

      // Función principal optimizada
      async chooseBestMove() {
          showAIThinking("🤖 Calculando...");
          
          // Delay mínimo solo para mostrar que está pensando
          await this.delay(100);
          
          const allMoves = this.getAllPossibleMoves(false);
          
          if (allMoves.length === 0) {
              hideAIThinking();
              return null;
          }

          let bestMove = null;
          let bestScore = Infinity;

          // Ordenar movimientos por prioridad (capturas primero)
          const sortedMoves = this.prioritizeMoves(allMoves);

          // Evaluar solo los mejores movimientos
          const movesToEvaluate = Math.min(sortedMoves.length, 15);
          
          for (let i = 0; i < movesToEvaluate; i++) {
              const move = sortedMoves[i];
              
              const originalPiece = this.makeTemporaryMove(move);
              const score = this.minimax(this.maxDepth - 1, -Infinity, Infinity, true);
              this.undoTemporaryMove(move, originalPiece);
              
              if (score < bestScore) {
                  bestScore = score;
                  bestMove = move;
              }
          }

          await this.delay(200); // Delay mínimo final
          hideAIThinking();
          
          return bestMove;
      }

      // Priorizar movimientos prometedores
      prioritizeMoves(moves) {
          return moves.sort((a, b) => {
              const captureA = getPieceAt(a.to) ? 1 : 0;
              const captureB = getPieceAt(b.to) ? 1 : 0;
              
              // Priorizar capturas
              if (captureA !== captureB) return captureB - captureA;
              
              // Priorizar movimientos al centro
              const centerA = this.isCenterSquare(a.to) ? 1 : 0;
              const centerB = this.isCenterSquare(b.to) ? 1 : 0;
              
              return centerB - centerA;
          });
      }

      // Verificar si es casilla central
      isCenterSquare(pos) {
          const col = pos.charCodeAt(0) - 97;
          const row = parseInt(pos[1]);
          return col >= 3 && col <= 4 && row >= 3 && row <= 6;
      }

      // Minimax optimizado
      minimax(depth, alpha, beta, isMaximizing) {
          if (depth === 0) {
              return this.quickEvaluate();
          }

          const moves = this.getAllPossibleMoves(isMaximizing);
          
          if (moves.length === 0) {
              return isMaximizing ? -10000 : 10000;
          }

          // Solo evaluar los primeros movimientos en niveles profundos
          const movesToCheck = depth > 1 ? Math.min(moves.length, 10) : moves.length;

          if (isMaximizing) {
              let maxEval = -Infinity;
              for (let i = 0; i < movesToCheck; i++) {
                  const move = moves[i];
                  const originalPiece = this.makeTemporaryMove(move);
                  const evaluacion = this.minimax(depth - 1, alpha, beta, false);
                  this.undoTemporaryMove(move, originalPiece);
                  
                  maxEval = Math.max(maxEval, evaluacion);
                  alpha = Math.max(alpha, evaluacion);
                  
                  if (beta <= alpha) break;
              }
              return maxEval;
          } else {
              let minEval = Infinity;
              for (let i = 0; i < movesToCheck; i++) {
                  const move = moves[i];
                  const originalPiece = this.makeTemporaryMove(move);
                  const evaluacion = this.minimax(depth - 1, alpha, beta, true);
                  this.undoTemporaryMove(move, originalPiece);
                  
                  minEval = Math.min(minEval, evaluacion);
                  beta = Math.min(beta, eval);
                  
                  if (beta <= alpha) break;
              }
              return minEval;
          }
      }

      // Evaluación rápida de posición
      quickEvaluate() {
          let score = 0;
          
          // Solo evaluar material y posición básica
          for (let row = 8; row >= 1; row--) {
              for (let col = 0; col < 8; col++) {
                  const pos = letters[col] + row;
                  const piece = getPieceAt(pos);
                  
                  if (piece) {
                      // Valor material
                      score += pieceValues[piece] || 0;
                      
                      // Bonus simple por posición
                      if (this.isCenterSquare(pos)) {
                          score += isPieceWhite(piece) ? 5 : -5;
                      }
                  }
              }
          }
          
          return score;
      }

      // Obtener todos los movimientos posibles
      getAllPossibleMoves(isWhite) {
          const moves = [];
          
          for (let row = 1; row <= 8; row++) {
              for (let col = 0; col < 8; col++) {
                  const pos = letters[col] + row;
                  const square = document.querySelector(`[data-position="${pos}"]`);
                  const piece = square?.textContent;
                  
                  if (piece && isPieceWhite(piece) === isWhite) {
                      const possibleMoves = getPossibleMoves(square);
                      possibleMoves.forEach(targetPos => {
                          moves.push({
                              from: pos,
                              to: targetPos,
                              piece: piece
                          });
                      });
                  }
              }
          }
          
          return moves;
      }

      // Hacer movimiento temporal
      makeTemporaryMove(move) {
          const fromSquare = document.querySelector(`[data-position="${move.from}"]`);
          const toSquare = document.querySelector(`[data-position="${move.to}"]`);
          
          const originalPiece = toSquare.textContent;
          toSquare.textContent = fromSquare.textContent;
          fromSquare.textContent = "";
          
          return originalPiece;
      }

      // Deshacer movimiento temporal
      undoTemporaryMove(move, originalPiece) {
          const fromSquare = document.querySelector(`[data-position="${move.from}"]`);
          const toSquare = document.querySelector(`[data-position="${move.to}"]`);
          
          fromSquare.textContent = toSquare.textContent;
          toSquare.textContent = originalPiece;
      }

      // Delay mínimo
      delay(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
      }
  }

  // Instancia de la IA rápida
  const chessAI = new FastChessAI();

  // ===== FUNCIONES DE INTERFAZ =====
  
  function showAIThinking(message) {
      const status = document.getElementById("game-status");
      status.innerHTML = `🤖 <em>${message}</em>`;
      status.style.color = "#ff9800";
      aiThinking = true;
  }

  function hideAIThinking() {
      aiThinking = false;
      updateGameStatus();
  }

  function updateGameStatus() {
      const status = document.getElementById("game-status");
      if (!aiThinking) {
          if (gameOver) {
              status.style.color = "#4caf50";
          } else {
              status.innerHTML = isWhiteTurn ? "⚪ Tu turno (Blancas)" : "⚫ Turno de la IA (Negras)";
              status.style.color = "#f0f0f0";
          }
      }
  }

  // ===== CREAR TABLERO =====
  
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

    // Rey
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

  // ===== MANEJO DE CLICS =====
  async function handleSquareClick(square) {
    const piece = square.textContent;
    if (gameOver || aiThinking) return;

    if (!isWhiteTurn) {
      return;
    }

    if (!selectedSquare) {
      if (piece && isPieceWhite(piece)) {
        selectedSquare = square;
        square.classList.add("selected-square");

        clearHighlights();
        const moves = getPossibleMoves(square);
        moves.forEach(pos => {
          const sq = document.querySelector(`.square[data-position="${pos}"]`);
          if (sq) sq.classList.add("highlight-move");
        });
      }
    } else {
      if (square === selectedSquare) {
        selectedSquare.classList.remove("selected-square");
        selectedSquare = null;
        clearHighlights();
      } else {
        if (!square.classList.contains("highlight-move")) return;

        await makePlayerMove(selectedSquare, square);
      }
    }
  }

  // ===== MOVIMIENTO DEL JUGADOR =====
  async function makePlayerMove(fromSquare, toSquare) {
    const capturedPiece = toSquare.textContent;

    if (capturedPiece) {
      capturePiece(capturedPiece, true);
    }

    toSquare.textContent = fromSquare.textContent;
    fromSquare.textContent = "";

    if (capturedPiece === "♚") {
      gameOver = true;
      const status = document.getElementById("game-status");
      status.innerHTML = "🏆 ¡Felicitaciones! ¡Has ganado!";
      status.style.color = "#4caf50";
      document.getElementById("passBtn").style.display = "none";
      document.getElementById("restartBtn").style.display = "inline-block";
      return;
    }

    toSquare.classList.remove("white-piece", "black-piece");
    if (fromSquare.classList.contains("white-piece")) {
      toSquare.classList.add("white-piece");
    }
    fromSquare.classList.remove("white-piece", "black-piece");

    fromSquare.classList.remove("selected-square");
    selectedSquare = null;
    clearHighlights();

    isWhiteTurn = false;
    updateGameStatus();

    // IA mueve inmediatamente
    setTimeout(() => makeAIMove(), 50);
  }

  // ===== MOVIMIENTO DE LA IA =====
  async function makeAIMove() {
    if (gameOver || isWhiteTurn) return;

    try {
      const bestMove = await chessAI.chooseBestMove();
      
      if (!bestMove) {
        gameOver = true;
        const status = document.getElementById("game-status");
        status.innerHTML = "🏆 ¡Has ganado! La IA no tiene movimientos válidos";
        status.style.color = "#4caf50";
        document.getElementById("passBtn").style.display = "none";
        document.getElementById("restartBtn").style.display = "inline-block";
        return;
      }

      const fromSquare = document.querySelector(`[data-position="${bestMove.from}"]`);
      const toSquare = document.querySelector(`[data-position="${bestMove.to}"]`);
      
      if (!fromSquare || !toSquare) return;

      // Animación breve
      fromSquare.classList.add("ai-thinking");
      toSquare.classList.add("ai-thinking");
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      fromSquare.classList.remove("ai-thinking");
      toSquare.classList.remove("ai-thinking");

      const capturedPiece = toSquare.textContent;

      if (capturedPiece) {
        capturePiece(capturedPiece, false);
      }

      toSquare.textContent = fromSquare.textContent;
      fromSquare.textContent = "";

      if (capturedPiece === "♔") {
        gameOver = true;
        const status = document.getElementById("game-status");
        status.innerHTML = "🤖 ¡La IA ha ganado! Has perdido tu rey";
        status.style.color = "#ff5722";
        document.getElementById("passBtn").style.display = "none";
        document.getElementById("restartBtn").style.display = "inline-block";
        return;
      }

      toSquare.classList.remove("white-piece", "black-piece");
      if (fromSquare.classList.contains("black-piece")) {
        toSquare.classList.add("black-piece");
      }
      fromSquare.classList.remove("white-piece", "black-piece");

      isWhiteTurn = true;
      updateGameStatus();

      const playerMoves = chessAI.getAllPossibleMoves(true);
      if (playerMoves.length === 0) {
        gameOver = true;
        const status = document.getElementById("game-status");
        status.innerHTML = "🤖 ¡La IA ha ganado! No tienes movimientos válidos";
        status.style.color = "#ff5722";
        document.getElementById("passBtn").style.display = "none";
        document.getElementById("restartBtn").style.display = "inline-block";
      }

    } catch (error) {
      console.error("Error en movimiento de IA:", error);
      hideAIThinking();
      isWhiteTurn = true;
      updateGameStatus();
    }
  }

  // ===== CONFIGURACIÓN INICIAL =====
  updateGameStatus();

  // ===== CONTROLES DEL JUEGO =====
  const passBtn = document.getElementById("passBtn");
  const restartBtn = document.getElementById("restartBtn");

  if (passBtn) {
    passBtn.addEventListener("click", () => {
      if (gameOver || aiThinking) return;

      gameOver = true;
      const status = document.getElementById("game-status");
      status.innerHTML = "🏳️ Te has rendido. ¡La IA gana!";
      status.style.color = "#ff5722";
      passBtn.style.display = "none";
      restartBtn.style.display = "inline-block";
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      location.reload();
    });
  }

  console.log("🤖 IA de Ajedrez Rápida cargada");
  console.log("⚡ Optimizada para respuestas instantáneas");
});