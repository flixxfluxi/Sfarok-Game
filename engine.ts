import { Player, CellValue, AILevel, GameState, PhaseSubState, Move, Piece } from './types'; 
import { BOARD_SIZE, PIECES_PER_PLAYER } from './constants'; 
import { gameService } from './components/gameService';  

// FIX: Set to false so the game plays naturally
const DEBUG_FORCE_PLAYER_WIN = false;
let debugAIMoveCount = 0;

/**  
 * ==========================================  
 * 0. AUDIO UTILITY
 * ==========================================  
 */ 
const playSound = (soundName: string) => {
    try {
        const audio = new Audio(`/sounds/${soundName}.mp3`);
        audio.play().catch(() => {}); 
    } catch (e) {}
};

/**
 * ==========================================
 * 1. WIN SCREEN & STATS LOGIC
 * ==========================================
 */

async function handleWin(winner: Player) {
  if ((handleWin as any)._ran) return;
  (handleWin as any)._ran = true;
  playSound('win');

  // @ts-ignore
  const playerColor = gameService.playerColor ?? Player.RED;
  const result = winner === playerColor ? 'wins' : 'losses';

  try {
    // @ts-ignore
    const db = window.firebase?.firestore();
    // @ts-ignore
    const user = window.firebase?.auth()?.currentUser;
    if (db && user) {
      try {
        const start = gameService.getMatchStartTime?.();
        const durationSeconds = start ? Math.floor((Date.now() - start) / 1000) : 0;

        // @ts-ignore
        const inc = window.firebase.firestore.FieldValue.increment(1);
        // @ts-ignore
        const incTime = window.firebase.firestore.FieldValue.increment(durationSeconds);
        const statsRef = db.collection('stats').doc(user.uid);

        // @ts-ignore
        const incWins = result === 'wins' ? inc : window.firebase.firestore.FieldValue.increment(0);
        // @ts-ignore
        const incLosses = result === 'losses' ? inc : window.firebase.firestore.FieldValue.increment(0);

        await statsRef.set({
          matches: inc,
          wins: incWins,
          losses: incLosses,
          timePlayed: incTime
        }, { merge: true });
      } catch (err) {
        console.error('Failed updating stats:', err);
      }
    }
    gameService.endMatch(result);
  } catch (e) {
    console.error('handleWin error:', e);
  }

  showWinAnimation(winner);
}

function showWinAnimation(winner: Player) {     
    const isRed = winner === Player.RED;
    const winnerName = isRed ? 'RED' : 'BLUE';     
    const themeColor = isRed ? '#ef4444' : '#3b82f6'; 
    
    const overlay = document.createElement('div');     
    overlay.id = "force-win-overlay";     
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
        background: rgba(10, 10, 15, 0.85); backdrop-filter: blur(12px);
        display: flex; justify-content: center; align-items: center; 
        z-index: 10000; font-family: 'Inter', system-ui, sans-serif;
    `;      

    overlay.innerHTML = `
        <style>
            @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes pulseGlow { 0% { box-shadow: 0 0 20px ${themeColor}44; } 50% { box-shadow: 0 0 50px ${themeColor}77; } 100% { box-shadow: 0 0 20px ${themeColor}44; } }
            .win-card {
                background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
                border: 1px solid rgba(255,255,255,0.1);
                padding: 50px 40px; border-radius: 40px; text-align: center;
                animation: slideUp 0.6s cubic-bezier(0.17, 0.76, 0.3, 1) both;
                position: relative; max-width: 400px; width: 90%;
                animation: slideUp 0.6s ease-out, pulseGlow 3s infinite;
            }
            .trophy { font-size: 70px; margin-bottom: 15px; display: block; filter: drop-shadow(0 0 15px ${themeColor}); }
            .win-title { color: white; font-size: 3.5rem; margin: 0; font-weight: 900; letter-spacing: -2px; text-transform: uppercase; }
            .win-sub { color: rgba(255,255,255,0.5); font-size: 1rem; margin-bottom: 30px; letter-spacing: 2px; text-transform: uppercase; }
            .btn-stack { display: flex; flex-direction: column; gap: 12px; }
            .win-btn { padding: 18px; border-radius: 20px; font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: all 0.2s; border: none; text-transform: uppercase; }
            .btn-primary { background: ${themeColor}; color: white; box-shadow: 0 10px 20px -5px ${themeColor}66; }
            .btn-primary:hover { transform: translateY(-2px); filter: brightness(1.1); }
            .btn-secondary { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); }
            .btn-secondary:hover { background: rgba(255,255,255,0.1); }
        </style>
        <div class="win-card">
            <span class="trophy">${isRed ? '👑' : '💎'}</span>
            <h1 class="win-title">${winnerName} WINS!</h1>
            <p class="win-sub">Victory Achieved</p>
            <div class="btn-stack">
                <button class="win-btn btn-primary" onclick="
                    const overlay = document.getElementById('force-win-overlay');
                    if (overlay) overlay.remove();
                    const restartBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().toUpperCase() === 'RESTART');
                    if (restartBtn) { restartBtn.click(); } else { window.location.reload(); }
                ">Play Again</button>
                <button class="win-btn btn-secondary" onclick="window.location.href='/'">Main Menu</button>
            </div>
        </div>
    `;     
    document.body.appendChild(overlay); 
}

/**  
 * ==========================================  
 * 2. CORE ENGINE LOGIC
 * ==========================================  
 */ 
const getLineId = (cells: {x: number, y: number}[]): string => 
  cells.sort((a, b) => (a.x - b.x) || (a.y - b.y)).map(c => `${c.x},${c.y}`).join('|');

export const getConnectedCount = (board: CellValue[][], x: number, y: number, player: Player): number => {
  let maxCount = 1;
  let hCount = 1;
  let hLeft = y - 1;
  while (hLeft >= 0 && board[x][hLeft] === player) { hCount++; hLeft--; }
  let hRight = y + 1;
  while (hRight < BOARD_SIZE && board[x][hRight] === player) { hCount++; hRight++; }
  maxCount = Math.max(maxCount, hCount);
  let vCount = 1;
  let vUp = x - 1;
  while (vUp >= 0 && board[vUp][y] === player) { vCount++; vUp--; }
  let vDown = x + 1;
  while (vDown < BOARD_SIZE && board[vDown][y] === player) { vCount++; vDown++; }
  maxCount = Math.max(maxCount, vCount);
  return maxCount;
};

export const getExactLinesAt = (board: CellValue[][], x: number, y: number, player: Player): string[] => {   
  const lines: string[] = [];   
  let hS = y; 
  while (hS > 0 && board[x][hS - 1] === player) hS--;   
  let hE = y; 
  while (hE < BOARD_SIZE - 1 && board[x][hE + 1] === player) hE++;   
  if (hE - hS + 1 === 3) lines.push(getLineId([{x, y: hS}, {x, y: hS + 1}, {x, y: hS + 2}]));
  let vS = x; 
  while (vS > 0 && board[vS - 1][y] === player) vS--;   
  let vE = x; 
  while (vE < BOARD_SIZE - 1 && board[vE + 1][y] === player) vE++;   
  if (vE - vS + 1 === 3) lines.push(getLineId([{x: vS, y}, {x: vS + 1, y}, {x: vS + 2, y}]));
  return lines; 
};  

export const formsSquareAt = (board: CellValue[][], x: number, y: number, player: Player): boolean => {   
  const patterns = [[[0, 0], [0, 1], [1, 0], [1, 1]], [[0, -1], [0, 0], [1, -1], [1, 0]], [[-1, 0], [-1, 1], [0, 0], [0, 1]], [[-1, -1], [-1, 0], [0, -1], [0, 0]]];   
  for (const pattern of patterns) {     
    let count = 0;     
    for (const [dx, dy] of pattern) {       
      const nx = x + dx, ny = y + dy;       
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[nx][ny] === player) count++;     
    }     
    if (count === 4) return true;   
  }   
  return false; 
};  

export const getValidMoves = (board: CellValue[][], x: number, y: number): { x: number; y: number }[] => {   
  const moves: { x: number; y: number }[] = [];   
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];   
  for (const [dx, dy] of dirs) {     
    const nx = x + dx, ny = y + dy;     
    if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[nx][ny] === null) moves.push({ x: nx, y: ny });   
  }   
  return moves; 
};  

/**  
 * ==========================================  
 * 3. HELPER FUNCTIONS FOR LEGAL ACTIONS
 * ==========================================  
 */

const getRemoveActions = (state: GameState): any[] => {
  const { board, currentPlayer } = state;
  const opponent = currentPlayer === Player.RED ? Player.BLUE : Player.RED;
  const actions: any[] = [];
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (board[x][y] === opponent) actions.push({ type: 'REMOVE', x, y });
    }
  }
  return actions;
};

export const getScoringMoves = (state: GameState): any[] => {
  const { board, currentPlayer, formedLines = [] } = state;
  const scoring: any[] = [];
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (board[x][y] === currentPlayer) {
        const moves = getValidMoves(board, x, y);
        for (const m of moves) {
          const tempB = board.map(r => [...r]);
          tempB[x][y] = null; tempB[m.x][m.y] = currentPlayer;
          if (getConnectedCount(tempB, m.x, m.y, currentPlayer) > 3) continue;
          const lines = getExactLinesAt(tempB, m.x, m.y, currentPlayer).filter(id => !formedLines.includes(id));
          if (lines.length > 0) scoring.push({ type: 'MOVE', from: { x, y }, to: { x: m.x, y: m.y }, capture: true, newLines: lines });
        }
      }
    }
  }
  return scoring;
};

/**  
 * ==========================================  
 * 3. MAIN ACTION HANDLER
 * ==========================================  
 */ 
export const getLegalActions = (state: GameState) => {   
  if (!state || !state.board) return [];
  const { board, currentPlayer, placedCount, pendingCaptures = 0 } = state;   
  const actions: any[] = [];    

  // FIX: Only check for victory if BOTH players have finished placing all pieces
  const allPlacementFinished = (placedCount?.[Player.RED] || 0) >= PIECES_PER_PLAYER && 
                               (placedCount?.[Player.BLUE] || 0) >= PIECES_PER_PLAYER;

  if (allPlacementFinished) {
    const players = [Player.RED, Player.BLUE];   
    for (const p of players) {       
        let onBoard = 0;           
        for (let rx = 0; rx < BOARD_SIZE; rx++) {
          for (let ry = 0; ry < BOARD_SIZE; ry++) {
            if (board[rx][ry] === p) onBoard++;
          }
        }
        if (onBoard < 3) { 
          handleWin(p === Player.RED ? Player.BLUE : Player.RED); 
          return []; 
        }       
    }
  }

  if (pendingCaptures > 0) {
    const comboActions = [...getRemoveActions(state), ...getScoringMoves(state)];
    if (comboActions.length === 0) throw new Error("Illegal combo state");
    return comboActions;
  }

  const isPlacement = (placedCount?.[currentPlayer] || 0) < PIECES_PER_PLAYER;   
  if (isPlacement) {     
    for (let x = 0; x < BOARD_SIZE; x++) {       
      for (let y = 0; y < BOARD_SIZE; y++) {         
        if (board[x][y] === null) {           
          const tempB = board.map(r => [...r]); 
          tempB[x][y] = currentPlayer;
          if (getConnectedCount(tempB, x, y, currentPlayer) > 3) continue;
          if (getExactLinesAt(tempB, x, y, currentPlayer).length > 0) continue;
          if (formsSquareAt(tempB, x, y, currentPlayer)) continue;
          actions.push({ type: 'PLACE', x, y, capture: false });
        }       
      }     
    }     
  }    

  for (let x = 0; x < BOARD_SIZE; x++) {     
    for (let y = 0; y < BOARD_SIZE; y++) {       
      if (board[x][y] === currentPlayer) {         
        const moves = getValidMoves(board, x, y);         
        for (const m of moves) {           
          const tempB = board.map(r => [...r]); 
          tempB[x][y] = null; tempB[m.x][m.y] = currentPlayer;
          if (getConnectedCount(tempB, m.x, m.y, currentPlayer) > 3) continue;
          const lines = getExactLinesAt(tempB, m.x, m.y, currentPlayer);
          if (isPlacement) {
            if (lines.length > 0) actions.push({ type: 'MOVE', from: { x, y }, to: { x: m.x, y: m.y }, capture: true, newLines: lines });
          } else {
            if (lines.length > 0) actions.push({ type: 'MOVE', from: { x, y }, to: { x: m.x, y: m.y }, capture: true, newLines: lines });         
            else actions.push({ type: 'MOVE', from: { x, y }, to: { x: m.x, y: m.y }, capture: false });
          }
        }       
      }     
    }   
  }
  return actions; 
};  

/**
 * ==========================================
 * 4. APPLY ACTION LOGIC
 * ==========================================
 */
export const applyAction = (state: GameState, action: any): GameState => {
    const { board, currentPlayer, placedCount, pendingCaptures = 0, formedLines = [] } = state;
    const newBoard = board.map(row => [...row]);
    const nextPlayer = currentPlayer === Player.RED ? Player.BLUE : Player.RED;

    if (action.type === 'PLACE') {
        newBoard[action.x][action.y] = currentPlayer;
        return {
            ...state,
            board: newBoard,
            placedCount: { ...placedCount, [currentPlayer]: (placedCount[currentPlayer] || 0) + 1 },
            currentPlayer: nextPlayer,
            phaseSubState: PhaseSubState.NORMAL,
            pendingCaptures: 0,
            formedLines: []
        };
    }

    if (action.type === 'MOVE') {
        newBoard[action.from.x][action.from.y] = null;
        newBoard[action.to.x][action.to.y] = currentPlayer;
        if (action.capture) {
            return {
                ...state,
                board: newBoard,
                pendingCaptures: pendingCaptures + (action.newLines?.length || 0),
                formedLines: [...formedLines, ...(action.newLines || [])],
                phaseSubState: PhaseSubState.REMOVE_PHASE,
                currentPlayer: currentPlayer 
            };
        } else {
            return {
                ...state,
                board: newBoard,
                currentPlayer: nextPlayer,
                phaseSubState: PhaseSubState.NORMAL,
                pendingCaptures: 0,
                formedLines: []
            };
        }
    }

    if (action.type === 'REMOVE') {
        newBoard[action.x][action.y] = null;
        const newPendingCaptures = pendingCaptures - 1;
        if (newPendingCaptures > 0) {
            return { ...state, board: newBoard, pendingCaptures: newPendingCaptures, phaseSubState: PhaseSubState.REMOVE_PHASE, currentPlayer: currentPlayer };
        } else {
            return { ...state, board: newBoard, pendingCaptures: 0, phaseSubState: PhaseSubState.NORMAL, currentPlayer: nextPlayer, formedLines: [] };
        }
    }
    return state;
};

export function handleClickPiece(selectedPiece: Piece | null, clickedPiece: Piece, state: GameState): Piece | null {     
    if (state.phaseSubState === PhaseSubState.REMOVE_PHASE && state.pendingCaptures > 0) {
        const opponent = state.currentPlayer === Player.RED ? Player.BLUE : Player.RED;
        if (clickedPiece.player === opponent) {
            playSound('select');
            return clickedPiece;
        }
        if (clickedPiece.player === state.currentPlayer) {
            if (selectedPiece && selectedPiece.x === clickedPiece.x && selectedPiece.y === clickedPiece.y) {
                playSound('deselect');
                return null;
            }
            playSound('select');
            return clickedPiece;
        }
        return selectedPiece;
    }

    // AI/Local color protection
    // @ts-ignore
    const myColor = gameService.playerColor;
    if (myColor !== undefined && clickedPiece.player !== myColor) return selectedPiece;
    
    // DESELECT LOGIC: Return null if the same piece is clicked
    if (selectedPiece && selectedPiece.x === clickedPiece.x && selectedPiece.y === clickedPiece.y) {
        playSound('deselect');
        return null; 
    }
    playSound('select');
    return clickedPiece; 
}

export const getAIMove = (gameState: GameState, level: AILevel) => {
  const actions = getLegalActions(gameState);
  if (!actions || actions.length === 0) return null;

  if (DEBUG_FORCE_PLAYER_WIN) {
    debugAIMoveCount++;
    if (debugAIMoveCount >= 10) {
      debugAIMoveCount = 0;
      try { handleWin(Player.RED); } catch (e) {}
      return null;
    }
  }
  
  if (gameState.pendingCaptures > 0 && level !== AILevel.EASY) {
    const scoringMoves = actions.filter(a => a.type === 'MOVE' && a.capture);
    if (scoringMoves.length > 0) return scoringMoves[Math.floor(Math.random() * scoringMoves.length)];
  }
  return actions[Math.floor(Math.random() * actions.length)];
};