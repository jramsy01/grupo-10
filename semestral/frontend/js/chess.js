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

  // ===== SISTEMA DE IA INTELIGENTE =====
  
  // Valores de las piezas para evaluación
  const pieceValues = {
      "♙": 1, "♟": -1,    // Peones
      "♖": 5, "♜": -5,    // Torres
      "♘": 3, "♞": -3,    // Caballos
      "♗": 3, "♝": -3,    // Alfiles
      "♕": 9, "♛": -9,    // Damas
      "♔": 1000, "♚": -1000 // Reyes
  };

  // Tablas de posición estratégica para cada pieza
  const positionTables = {
      pawn: [
          [0,  0,  0,  0,  0,  0,  0,  0],
          [50, 50, 50, 50, 50, 50, 50, 50],
          [10, 10, 20, 30, 30, 20, 10, 10],
          [5,  5, 10, 25, 25, 10,  5,  5],
          [0,  0,  0, 20, 20,  0,  0,  0],
          [5, -5,-10,  0,  0,-10, -5,  5],
          [5, 10, 10,-20,-20, 10, 10,  5],
          [0,  0,  0,  0,  0,  0,  0,  0]
      ],
      knight: [
          [-50,-40,-30,-30,-30,-30,-40,-50],
          [-40,-20,  0,  0,  0,  0,-20,-40],
          [-30,  0, 10, 15, 15, 10,  0,-30],
          [-30,  5, 15, 20, 20, 15,  5,-30],
          [-30,  0, 15, 20, 20, 15,  0,-30],
          [-30,  5, 10, 15, 15, 10,  5,-30],
          [-40,-20,  0,  5,  5,  0,-20,-40],
          [-50,-40,-30,-30,-30,-30,-40,-50]
      ],
      bishop: [
          [-20,-10,-10,-10,-10,-10,-10,-20],
          [-10,  0,  0,  0,  0,  0,  0,-10],
          [-10,  0,  5, 10, 10,  5,  0,-10],
          [-10,  5,  5, 10, 10,  5,  5,-10],
          [-10,  0, 10, 10, 10, 10,  0,-10],
          [-10, 10, 10, 10, 10, 10, 10,-10],
          [-10,  5,  0,  0,  0,  0,  5,-10],
          [-20,-10,-10,-10,-10,-10,-10,-20]
      ],
      rook: [
          [0,  0,  0,  0,  0,  0,  0,  0],
          [5, 10, 10, 10, 10, 10, 10,  5],
          [-5, 0,  0,  0,  0,  0,  0, -5],
          [-5, 0,  0,  0,  0,  0,  0, -5],
          [-5, 0,  0,  0,  0,  0,  0, -5],
          [-5, 0,  0,  0,  0,  0,  0, -5],
          [-5, 0,  0,  0,  0,  0,  0, -5],
          [0,  0,  0,  5,  5,  0,  0,  0]
      ],
      queen: [
          [-20,-10,-10, -5, -5,-10,-10,-20],
          [-10,  0,  0,  0,  0,  0,  0,-10],
          [-10,  0,  5,  5,  5,  5,  0,-10],
          [-5,   0,  5,  5,  5,  5,  0, -5],
          [0,    0,  5,  5,  5,  5,  0, -5],
          [-10,  5,  5,  5,  5,  5,  0,-10],
          [-10,  0,  5,  0,  0,  0,  0,-10],
          [-20,-10,-10, -5, -5,-10,-10,-20]
      ],
      king: [
          [-30,-40,-40,-50,-50,-40,-40,-30],
          [-30,-40,-40,-50,-50,-40,-40,-30],
          [-30,-40,-40,-50,-50,-40,-40,-30],
          [-30,-40,-40,-50,-50,-40,-40,-30],
          [-20,-30,-30,-40,-40,-30,-30,-20],
          [-10,-20,-20,-20,-20,-20,-20,-10],
          [20, 20,  0,  0,  0,  0, 20, 20],
          [20, 30, 10,  0,  0, 10, 30, 20]
      ]
  };

  // Sistema de razonamiento de la IA
  class ChessAI {
      constructor() {
          this.maxDepth = 4;
          this.transpositionTable = new Map();
      }

      // Función principal que elige el mejor movimiento
      async chooseBestMove() {
          showAIThinking("🤖 Analizando posición...");
          
          // Simular tiempo de pensamiento más realista
          await this.delay(1000 + Math.random() * 2000);
          
          const allMoves = this.getAllPossibleMoves(false); // false = negras
          
          if (allMoves.length === 0) {
              hideAIThinking();
              return null;
          }

          showAIThinking("🧠 Evaluando " + allMoves.length + " movimientos posibles...");
          await this.delay(500);

          let bestMove = null;
          let bestScore = Infinity; // IA juega negras, busca score más bajo
          let bestReasoning = "";

          // Evaluar cada movimiento posible
          for (let i = 0; i < allMoves.length; i++) {
              const move = allMoves[i];
              
              showAIThinking(`🔍 Analizando movimiento ${i + 1}/${allMoves.length}: ${move.from} → ${move.to}`);
              
              // Hacer el movimiento temporalmente
              const originalPiece = this.makeTemporaryMove(move);
              
              // Evaluar la posición resultante
              const score = this.minimax(this.maxDepth - 1, -Infinity, Infinity, true);
              const reasoning = this.analyzeMove(move, score);
              
              // Deshacer el movimiento
              this.undoTemporaryMove(move, originalPiece);
              
              // Si este movimiento es mejor, guardarlo
              if (score < bestScore) {
                  bestScore = score;
                  bestMove = move;
                  bestReasoning = reasoning;
              }
              
              await this.delay(200);
          }

          showAIThinking(`✅ Mejor movimiento encontrado: ${bestMove.from} → ${bestMove.to}`);
          showAIThinking(`💭 Razonamiento: ${bestReasoning}`);
          
          await this.delay(1500);
          hideAIThinking();
          
          return bestMove;
      }

      // Algoritmo Minimax con poda Alpha-Beta
      minimax(depth, alpha, beta, isMaximizing) {
          if (depth === 0) {
              return this.evaluatePosition();
          }

          const moves = this.getAllPossibleMoves(isMaximizing);
          
          if (moves.length === 0) {
              // Jaque mate o ahogado
              return isMaximizing ? -10000 : 10000;
          }

          if (isMaximizing) {
              let maxEvaluation = -Infinity;
              for (const move of moves) {
                  const originalPiece = this.makeTemporaryMove(move);
                  const evaluation = this.minimax(depth - 1, alpha, beta, false);
                  this.undoTemporaryMove(move, originalPiece);
                  
                  maxEvaluation = Math.max(maxEvaluation, evaluation);
                  alpha = Math.max(alpha, evaluation);
                  
                  if (beta <= alpha) break; // Poda Alpha-Beta
              }
              return maxEvaluation;
          } else {
              let minEvaluation = Infinity;
              for (const move of moves) {
                  const originalPiece = this.makeTemporaryMove(move);
                  const evaluation = this.minimax(depth - 1, alpha, beta, true);
                  this.undoTemporaryMove(move, originalPiece);
                  
                  minEvaluation = Math.min(minEvaluation, evaluation);
                  beta = Math.min(beta, evaluation);
                  
                  if (beta <= alpha) break; // Poda Alpha-Beta
              }
              return minEvaluation;
          }
      }

      // Evalúa la posición actual del tablero
      evaluatePosition() {
          let score = 0;
          
          // Evaluar material y posición
          for (let row = 8; row >= 1; row--) {
              for (let col = 0; col < 8; col++) {
                  const pos = letters[col] + row;
                  const piece = getPieceAt(pos);
                  
                  if (piece) {
                      // Valor material
                      score += pieceValues[piece] || 0;
                      
                      // Valor posicional
                      score += this.getPositionalValue(piece, col, 8 - row);
                  }
              }
          }

          // Bonificaciones estratégicas adicionales
          score += this.evaluateKingSafety();
          score += this.evaluatePawnStructure();
          score += this.evaluatePieceActivity();
          
          return score;
      }

      // Obtiene valor posicional de una pieza
      getPositionalValue(piece, col, row) {
          const pieceType = this.getPieceType(piece);
          const isWhite = isPieceWhite(piece);
          
          if (!positionTables[pieceType]) return 0;
          
          const table = positionTables[pieceType];
          const value = table[row] ? table[row][col] : 0;
          
          return isWhite ? value : -value;
      }

      // Determina el tipo de pieza
      getPieceType(piece) {
          const types = {
              "♙": "pawn", "♟": "pawn",
              "♖": "rook", "♜": "rook",
              "♘": "knight", "♞": "knight",
              "♗": "bishop", "♝": "bishop",
              "♕": "queen", "♛": "queen",
              "♔": "king", "♚": "king"
          };
          return types[piece] || "pawn";
      }

      // Evalúa la seguridad del rey
      evaluateKingSafety() {
          let score = 0;
          
          // Buscar reyes
          const whiteKing = this.findKing(true);
          const blackKing = this.findKing(false);
          
          if (whiteKing) {
              score += this.calculateKingSafety(whiteKing, true);
          }
          
          if (blackKing) {
              score -= this.calculateKingSafety(blackKing, false);
          }
          
          return score;
      }

      // Evalúa estructura de peones
      evaluatePawnStructure() {
          let score = 0;
          
          for (let col = 0; col < 8; col++) {
              const whitePawns = [];
              const blackPawns = [];
              
              for (let row = 1; row <= 8; row++) {
                  const piece = getPieceAt(letters[col] + row);
                  if (piece === "♙") whitePawns.push(row);
                  if (piece === "♟") blackPawns.push(row);
              }
              
              // Penalizar peones doblados
              if (whitePawns.length > 1) score -= 10;
              if (blackPawns.length > 1) score += 10;
              
              // Recompensar peones pasados
              if (whitePawns.length === 1 && blackPawns.length === 0) {
                  score += 20;
              }
              if (blackPawns.length === 1 && whitePawns.length === 0) {
                  score -= 20;
              }
          }
          
          return score;
      }

      // Evalúa actividad de las piezas
      evaluatePieceActivity() {
          let score = 0;
          
          // Contar movimientos posibles para cada bando
          const whiteMoves = this.getAllPossibleMoves(true).length;
          const blackMoves = this.getAllPossibleMoves(false).length;
          
          // Más movilidad = mejor posición
          score += (whiteMoves - blackMoves) * 0.5;
          
          return score;
      }

      // Analiza un movimiento específico y genera razonamiento
      analyzeMove(move, score) {
          const piece = getPieceAt(move.from);
          const capturedPiece = getPieceAt(move.to);
          
          let reasoning = [];
          
          // Análisis de captura
          if (capturedPiece) {
              const captureValue = Math.abs(pieceValues[capturedPiece] || 0);
              reasoning.push(`Captura ${this.getPieceName(capturedPiece)} (+${captureValue} puntos)`);
          }
          
          // Análisis de amenazas
          if (this.createsThreat(move)) {
              reasoning.push("Crea amenaza directa");
          }
          
          // Análisis de defensa
          if (this.improvesDefense(move)) {
              reasoning.push("Mejora defensa");
          }
          
          // Análisis posicional
          if (score < -50) {
              reasoning.push("Excelente posición");
          } else if (score < 0) {
              reasoning.push("Posición favorable");
          } else if (score > 50) {
              reasoning.push("Posición complicada");
          }
          
          return reasoning.length > 0 ? reasoning.join(", ") : "Movimiento sólido";
      }

      // Métodos auxiliares
      findKing(isWhite) {
          const kingPiece = isWhite ? "♔" : "♚";
          for (let row = 1; row <= 8; row++) {
              for (let col = 0; col < 8; col++) {
                  const pos = letters[col] + row;
                  if (getPieceAt(pos) === kingPiece) {
                      return pos;
                  }
              }
          }
          return null;
      }

      calculateKingSafety(kingPos, isWhite) {
          // Implementación simplificada de seguridad del rey
          const surroundingSquares = this.getSurroundingSquares(kingPos);
          let safety = 0;
          
          surroundingSquares.forEach(pos => {
              const piece = getPieceAt(pos);
              if (piece && isPieceWhite(piece) === isWhite) {
                  safety += 5; // Piezas propias cerca del rey dan seguridad
              }
          });
          
          return safety;
      }

      getSurroundingSquares(pos) {
          const col = pos.charCodeAt(0);
          const row = parseInt(pos[1]);
          const squares = [];
          
          for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                  if (dr === 0 && dc === 0) continue;
                  
                  const newRow = row + dr;
                  const newCol = col + dc;
                  
                  if (newRow >= 1 && newRow <= 8 && newCol >= 97 && newCol <= 104) {
                      squares.push(String.fromCharCode(newCol) + newRow);
                  }
              }
          }
          
          return squares;
      }

      createsThreat(move) {
          // Verificar si el movimiento crea una amenaza
          const originalPiece = this.makeTemporaryMove(move);
          const enemyKing = this.findKing(true); // Rey blanco
          
          if (enemyKing) {
              const moves = getPossibleMoves(document.querySelector(`[data-position="${move.to}"]`));
              const threatens = moves.includes(enemyKing);
              this.undoTemporaryMove(move, originalPiece);
              return threatens;
          }
          
          this.undoTemporaryMove(move, originalPiece);
          return false;
      }

      improvesDefense(move) {
          // Lógica simplificada para detectar si mejora la defensa
          const piece = getPieceAt(move.from);
          return piece === "♚" || piece === "♜"; // Rey o torre moviéndose puede mejorar defensa
      }

      getPieceName(piece) {
          const names = {
              "♙": "peón", "♟": "peón",
              "♖": "torre", "♜": "torre",
              "♘": "caballo", "♞": "caballo",
              "♗": "alfil", "♝": "alfil",
              "♕": "dama", "♛": "dama",
              "♔": "rey", "♚": "rey"
          };
          return names[piece] || "pieza";
      }

      // Obtener todos los movimientos posibles para un bando
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

      // Hacer movimiento temporal para evaluación
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

      // Método de delay para simular pensamiento
      delay(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
      }
  }

  // Instancia de la IA
  const chessAI = new ChessAI();

  // ===== FUNCIONES DE INTERFAZ PARA LA IA =====
  
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
              status.style.color = isWhiteTurn ? "#f0f0f0" : "#333";
          }
      }
  }

  // ===== CÓDIGO ORIGINAL CON MODIFICACIONES PARA IA =====
  
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

  // ===== FUNCIÓN PRINCIPAL PARA MANEJAR CLICS =====
  async function handleSquareClick(square) {
    const piece = square.textContent;
    if (gameOver || aiThinking) return;

    // Solo permitir movimientos durante el turno del jugador (blancas)
    if (!isWhiteTurn) {
      showAIThinking("🤖 Espera, es mi turno...");
      setTimeout(hideAIThinking, 1000);
      return;
    }

    // Si no hay pieza seleccionada aún
    if (!selectedSquare) {
      // Solo permitir seleccionar piezas blancas en el turno del jugador
      if (piece && isPieceWhite(piece)) {
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
        const originalText = status.innerHTML;
        status.innerHTML = "❌ Solo puedes mover tus piezas (blancas)";
        status.style.color = "#ff5722";
        setTimeout(() => {
          status.innerHTML = originalText;
          status.style.color = "#f0f0f0";
        }, 1500);
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

        // Hacer el movimiento del jugador
        await makePlayerMove(selectedSquare, square);
      }
    }
  }

  // ===== FUNCIÓN PARA EJECUTAR MOVIMIENTO DEL JUGADOR =====
  async function makePlayerMove(fromSquare, toSquare) {
    const capturedPiece = toSquare.textContent;

    if (capturedPiece) {
      capturePiece(capturedPiece, true); // Jugador captura
    }

    // Realizar el movimiento
    toSquare.textContent = fromSquare.textContent;
    fromSquare.textContent = "";

    // Verificar si se capturó al rey negro (victoria del jugador)
    if (capturedPiece === "♚") {
      gameOver = true;
      const status = document.getElementById("game-status");
      status.innerHTML = "🏆 ¡Felicitaciones! ¡Has ganado!";
      status.style.color = "#4caf50";
      document.getElementById("passBtn").style.display = "none";
      document.getElementById("restartBtn").style.display = "inline-block";
      return;
    }

    // Mover las clases de color
    toSquare.classList.remove("white-piece", "black-piece");
    if (fromSquare.classList.contains("white-piece")) {
      toSquare.classList.add("white-piece");
    }
    fromSquare.classList.remove("white-piece", "black-piece");

    // Limpiar selección
    fromSquare.classList.remove("selected-square");
    selectedSquare = null;
    clearHighlights();

    // Cambiar turno a la IA y mover inmediatamente
    isWhiteTurn = false;
    updateGameStatus();

    // IA mueve inmediatamente sin delay
    makeAIMove();
  }

  // ===== FUNCIÓN PRINCIPAL PARA MOVIMIENTO DE LA IA =====
  async function makeAIMove() {
    if (gameOver || isWhiteTurn) return;

    try {
      const bestMove = await chessAI.chooseBestMove();
      
      if (!bestMove) {
        // IA no tiene movimientos (jaque mate o ahogado)
        gameOver = true;
        const status = document.getElementById("game-status");
        status.innerHTML = "🏆 ¡Has ganado! La IA no tiene movimientos válidos";
        status.style.color = "#4caf50";
        document.getElementById("passBtn").style.display = "none";
        document.getElementById("restartBtn").style.display = "inline-block";
        return;
      }

      // Ejecutar el movimiento de la IA
      const fromSquare = document.querySelector(`[data-position="${bestMove.from}"]`);
      const toSquare = document.querySelector(`[data-position="${bestMove.to}"]`);
      
      if (!fromSquare || !toSquare) return;

      // Animación visual del movimiento de la IA
      fromSquare.classList.add("ai-thinking");
      toSquare.classList.add("ai-thinking");
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      fromSquare.classList.remove("ai-thinking");
      toSquare.classList.remove("ai-thinking");

      const capturedPiece = toSquare.textContent;

      if (capturedPiece) {
        capturePiece(capturedPiece, false); // IA captura
      }

      // Realizar el movimiento
      toSquare.textContent = fromSquare.textContent;
      fromSquare.textContent = "";

      // Verificar si la IA capturó al rey blanco (victoria de la IA)
      if (capturedPiece === "♔") {
        gameOver = true;
        const status = document.getElementById("game-status");
        status.innerHTML = "🤖 ¡La IA ha ganado! Has perdido tu rey";
        status.style.color = "#ff5722";
        document.getElementById("passBtn").style.display = "none";
        document.getElementById("restartBtn").style.display = "inline-block";
        return;
      }

      // Mover las clases de color
      toSquare.classList.remove("white-piece", "black-piece");
      if (fromSquare.classList.contains("black-piece")) {
        toSquare.classList.add("black-piece");
      }
      fromSquare.classList.remove("white-piece", "black-piece");

      // Cambiar turno de vuelta al jugador
      isWhiteTurn = true;
      updateGameStatus();

      // Verificar si el jugador tiene movimientos válidos
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
      const status = document.getElementById("game-status");
      status.innerHTML = "❌ Error en la IA. Tu turno continúa.";
      status.style.color = "#ff5722";
      isWhiteTurn = true;
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
      location.reload(); // Recarga la página para reiniciar todo
    });
  }

  // ===== ESTILOS CSS ADICIONALES PARA LA IA =====
  const style = document.createElement('style');
  style.textContent = `
      .ai-thinking {
          background-color: #ff9800 !important;
          animation: aiPulse 0.8s infinite;
      }
      
      @keyframes aiPulse {
          0%, 100% { 
              opacity: 1; 
              transform: scale(1);
          }
          50% { 
              opacity: 0.7; 
              transform: scale(1.05);
          }
      }
      
      .selected-square {
          background-color: #ffeb3b !important;
          box-shadow: inset 0 0 20px rgba(255,193,7,0.8);
      }
      
      .highlight-move {
          background-color: #4caf50 !important;
          box-shadow: inset 0 0 15px rgba(76,175,80,0.7);
      }
      
      #game-status {
          transition: all 0.3s ease;
      }
      
      .captured-icon {
          display: inline-block;
          margin: 2px;
          padding: 2px;
          font-size: 18px;
          border-radius: 3px;
          background: rgba(255,255,255,0.1);
      }
  `;
  document.head.appendChild(style);

  console.log("🤖 IA de Ajedrez Inteligente cargada correctamente");
  console.log("💡 La IA usará razonamiento estratégico para elegir los mejores movimientos");
});