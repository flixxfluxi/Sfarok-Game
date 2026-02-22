import { Player, CellValue, AILevel, GameState, PhaseSubState, Move, Piece } from './types'; 
import { BOARD_SIZE, PIECES_PER_PLAYER } from './constants'; 
import { gameService } from './components/gameService';  

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
let statsUpdated = false;  

function handleWin(winner: Player) {     
    if (statsUpdated) return;     
    statsUpdated = true;          
    playSound('win');

    // @ts-ignore
    const playerColor = gameService.playerColor ?? Player.RED; 
    const result = winner === playerColor ? "wins" : "losses";

    try {
        // @ts-ignore
        const db = window.firebase?.firestore();
        // @ts-ignore
        const user = window.firebase?.auth()?.currentUser;
        if (db && user) {
            // @ts-ignore
            const inc = window.firebase.firestore.FieldValue.increment(1);
            const statsRef = db.collection('stats').doc(user.uid);
            const data = result === "wins" ? { wins: inc, matches: inc } : { losses: inc, matches: inc };
            statsRef.update(data).catch(() => statsRef.set(data, { merge: true }));
        }
        gameService.endMatch(result);
    } catch (e) {}

    showWinAnimation(winner); 
}  

function showWinAnimation(winner: Player) {     
    const winnerName = winner === Player.RED ? 'RED' : 'BLUE';     
    const color = winner === Player.RED ? '#ef4444' : '#3b82f6';          
    const overlay = document.createElement('div');     
    overlay.id = "force-win-overlay";     
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 10000; font-family: 'Inter', sans-serif;`;      
    
    overlay.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 24px; text-align: center; box-shadow: 0 0 40px ${color}; max-width: 90%;">
            <h1 style="color: ${color}; font-size: 3.5rem; margin: 0; font-weight: 800;">${winnerName} WINS!</h1>
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 25px;">
                <button onclick="window.location.href='/mode-selection'" style="background: ${color}; color: white; border: none; padding: 15px 30px; font-size: 1.1rem; font-weight: bold; border-radius: 50px; cursor: pointer;">PLAY AGAIN</button>
                <button onclick="window.location.href='/'" style="background: #f3f4f6; color: #1f2937; border: 2px solid #e5e7eb; padding: 15px 30px; font-size: 1.1rem; font-weight: bold; border-radius: 50px; cursor: pointer;">MAIN MENU</button>
            </div>
        </div>`;     
    document.body.appendChild(overlay); 
}

/**  
 * ==========================================  
 * 2. CORE ENGINE LOGIC
 * ==========================================  
 */ 
const getLineId = (cells: {x: number, y: number}[]): string => 
  cells.sort((a, b) => (a.x - b.x) || (a.y - b.y)).map(c => `${c.x},${c.y}`).join('|');

/**
 * Returns connected count in both directions for horizontal and vertical.
 * Used to detect if placement/move creates 4 or more in a row.
 */
export const getConnectedCount = (board: CellValue[][], x: number, y: number, player: Player): number => {
  let maxCount = 1; // the piece itself
  
  // Horizontal count
  let hCount = 1;
  let hLeft = y - 1;
  while (hLeft >= 0 && board[x][hLeft] === player) {
    hCount++;
    hLeft--;
  }
  let hRight = y + 1;
  while (hRight < BOARD_SIZE && board[x][hRight] === player) {
    hCount++;
    hRight++;
  }
  maxCount = Math.max(maxCount, hCount);
  
  // Vertical count
  let vCount = 1;
  let vUp = x - 1;
  while (vUp >= 0 && board[vUp][y] === player) {
    vCount++;
    vUp--;
  }
  let vDown = x + 1;
  while (vDown < BOARD_SIZE && board[vDown][y] === player) {
    vCount++;
    vDown++;
  }
  maxCount = Math.max(maxCount, vCount);
  
  return maxCount;
};

export const getExactLinesAt = (board: CellValue[][], x: number, y: number, player: Player): string[] => {   
  const lines: string[] = [];   
  
  // Horizontal: find exact length 3
  let hS = y; 
  while (hS > 0 && board[x][hS - 1] === player) hS--;   
  let hE = y; 
  while (hE < BOARD_SIZE - 1 && board[x][hE + 1] === player) hE++;   
  if (hE - hS + 1 === 3) {
    lines.push(getLineId([{x, y: hS}, {x, y: hS + 1}, {x, y: hS + 2}]));
  }
  
  // Vertical: find exact length 3
  let vS = x; 
  while (vS > 0 && board[vS - 1][y] === player) vS--;   
  let vE = x; 
  while (vE < BOARD_SIZE - 1 && board[vE + 1][y] === player) vE++;   
  if (vE - vS + 1 === 3) {
    lines.push(getLineId([{x: vS, y}, {x: vS + 1, y}, {x: vS + 2, y}]));
  }
  
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
      if (board[x][y] === opponent) {
        actions.push({ type: 'REMOVE', x, y });
      }
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
          tempB[x][y] = null;
          tempB[m.x][m.y] = currentPlayer;
          
          // Check for 4+ connected (illegal)
          const connected = getConnectedCount(tempB, m.x, m.y, currentPlayer);
          if (connected > 3) continue;
          
          const lines = getExactLinesAt(tempB, m.x, m.y, currentPlayer).filter(id => !formedLines.includes(id));
          
          if (lines.length > 0) {
            scoring.push({ type: 'MOVE', from: { x, y }, to: { x: m.x, y: m.y }, capture: true, newLines: lines });
          }
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
  
  const { board, currentPlayer, placedCount, phaseSubState, pendingCaptures = 0, formedLines = [] } = state;   
  const actions: any[] = [];    
  const opponent = currentPlayer === Player.RED ? Player.BLUE : Player.RED;

  // WIN CHECK
  const players = [Player.RED, Player.BLUE];   
  for (const p of players) {       
    if ((placedCount?.[p] || 0) >= PIECES_PER_PLAYER) {           
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

  // CAPTURE PHASE - allow optional combo chaining
  if (pendingCaptures > 0) {
    const removeActions = getRemoveActions(state);
    const scoringMoves = getScoringMoves(state);
    const comboActions = [...removeActions, ...scoringMoves];
    
    // Safety check: must have legal actions while in capture window
    if (comboActions.length === 0) {
      throw new Error("Illegal combo state: pendingCaptures > 0 but no legal actions available");
    }
    
    return comboActions;
  }

  // PLACEMENT & MOVEMENT PHASE
  const isPlacement = (placedCount?.[currentPlayer] || 0) < PIECES_PER_PLAYER;   
  
  // During PLACEMENT: can place only if no exact-3, no 4+, and no 2x2 square
  if (isPlacement) {     
    for (let x = 0; x < BOARD_SIZE; x++) {       
      for (let y = 0; y < BOARD_SIZE; y++) {         
        if (board[x][y] === null) {           
          const tempB = board.map(r => [...r]); 
          tempB[x][y] = currentPlayer;
          
          // Check for exact-3 (illegal during placement)
          const lines = getExactLinesAt(tempB, x, y, currentPlayer);
          if (lines.length > 0) continue;
          
          // Check for 4+ connected (illegal during placement)
          const connected = getConnectedCount(tempB, x, y, currentPlayer);
          if (connected > 3) continue;
          
          // Check for 2x2 square (illegal during placement)
          const square = formsSquareAt(tempB, x, y, currentPlayer);
          if (square) continue;
          
          actions.push({ type: 'PLACE', x, y, capture: false });
        }       
      }     
    }     
  }    

  // MOVEMENT PHASE
  for (let x = 0; x < BOARD_SIZE; x++) {     
    for (let y = 0; y < BOARD_SIZE; y++) {       
      if (board[x][y] === currentPlayer) {         
        const moves = getValidMoves(board, x, y);         
        for (const m of moves) {           
          const tempB = board.map(r => [...r]); 
          tempB[x][y] = null; 
          tempB[m.x][m.y] = currentPlayer;
          
          // Check for 4+ connected (illegal in movement)
          const connected = getConnectedCount(tempB, m.x, m.y, currentPlayer);
          if (connected > 3) continue;
          
          const lines = getExactLinesAt(tempB, m.x, m.y, currentPlayer);
          
          // During PLACEMENT: only moves that create exact-3 are allowed
          if (isPlacement) {
            if (lines.length > 0) {
              actions.push({ type: 'MOVE', from: { x, y }, to: { x: m.x, y: m.y }, capture: true, newLines: lines });
            }
          } else {
            // During NORMAL phase: 
            // - exact-3 is a capture move
            // - otherwise it's a normal move
            // - 2x2 is allowed during movement
            if (lines.length > 0) {
              actions.push({ type: 'MOVE', from: { x, y }, to: { x: m.x, y: m.y }, capture: true, newLines: lines });         
            } else {
              actions.push({ type: 'MOVE', from: { x, y }, to: { x: m.x, y: m.y }, capture: false });
            }
          }
        }       
      }     
    }   
  }
  
  return actions; 
};  

/**
 * ==========================================
 * 4. APPLY ACTION LOGIC (PHASE TRANSITIONS)
 * ==========================================
 */
export const applyAction = (state: GameState, action: any): GameState => {
    const { board, currentPlayer, placedCount, pendingCaptures = 0, formedLines = [] } = state;
    const newBoard = board.map(row => [...row]);
    const nextPlayer = currentPlayer === Player.RED ? Player.BLUE : Player.RED;

    if (action.type === 'PLACE') {
        // Place piece on board
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
        // Move piece
        newBoard[action.from.x][action.from.y] = null;
        newBoard[action.to.x][action.to.y] = currentPlayer;
        
        if (action.capture) {
            // Capture: form exact-3, accumulate pending captures
            const newPendingCaptures = pendingCaptures + (action.newLines?.length || 0);
            
            return {
                ...state,
                board: newBoard,
                pendingCaptures: newPendingCaptures,
                formedLines: [...formedLines, ...(action.newLines || [])],
                phaseSubState: PhaseSubState.REMOVE_PHASE,
                currentPlayer: currentPlayer // DO NOT switch turn
            };
        } else {
            // Normal move: no capture
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
        // Remove opponent piece
        newBoard[action.x][action.y] = null;
        
        const newPendingCaptures = pendingCaptures - 1;
        
        if (newPendingCaptures > 0) {
            // More pieces to remove, same player continues
            return {
                ...state,
                board: newBoard,
                pendingCaptures: newPendingCaptures,
                phaseSubState: PhaseSubState.REMOVE_PHASE,
                currentPlayer: currentPlayer // Stay same player for optional combo
            };
        } else {
            // All captures done, switch turn and reset
            return {
                ...state,
                board: newBoard,
                pendingCaptures: 0,
                phaseSubState: PhaseSubState.NORMAL,
                currentPlayer: nextPlayer,
                formedLines: [] // Reset formedLines for next player
            };
        }
    }

    return state;
};

export function handleClickPiece(selectedPiece: Piece | null, clickedPiece: Piece, state: GameState): Piece | null {     
    // During REMOVE phase: only opponent pieces are selectable (or scoring moves available)
    if (state.phaseSubState === PhaseSubState.REMOVE_PHASE && state.pendingCaptures > 0) {
        const opponent = state.currentPlayer === Player.RED ? Player.BLUE : Player.RED;
        if (clickedPiece.player === opponent) {
            playSound('select');
            return clickedPiece;
        }
        // If clicking own piece, allow move selection for optional combo
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

    // Normal play: only current player pieces are selectable
    // @ts-ignore
    const myColor = gameService.playerColor;
    if (myColor !== undefined && clickedPiece.player !== myColor) {
        return selectedPiece;
    }
    
    // Deselection: clicking same piece again deselects it
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
  
  // During optional combo phase, prefer scoring moves over removes
  if (gameState.pendingCaptures > 0 && level !== AILevel.EASY) {
    const scoringMoves = actions.filter(a => a.type === 'MOVE' && a.capture);
    if (scoringMoves.length > 0) {
      return scoringMoves[Math.floor(Math.random() * scoringMoves.length)];
    }
  }
  
  return actions[Math.floor(Math.random() * actions.length)];
};