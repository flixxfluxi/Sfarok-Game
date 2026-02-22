const BOARD_SIZE = 6;
const PIECES_PER_PLAYER = 10;
const Player = { RED: 'RED', BLUE: 'BLUE' };

const INITIAL_BOARD = Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => null));

function getLineId(cells) {
  return cells.sort((a,b) => (a.x - b.x) || (a.y - b.y)).map(c => `${c.x},${c.y}`).join('|');
}

function formsSquareAt(board,x,y,player){
  const patterns = [
    [[0,0],[0,1],[1,0],[1,1]],
    [[0,-1],[0,0],[1,-1],[1,0]],
    [[-1,0],[-1,1],[0,0],[0,1]],
    [[-1,-1],[-1,0],[0,-1],[0,0]]
  ];
  for(const pattern of patterns){
    if(pattern.every(([dx,dy])=>{
      const nx=x+dx, ny=y+dy;
      return nx>=0 && nx<BOARD_SIZE && ny>=0 && ny<BOARD_SIZE && board[nx][ny]===player;
    })) return true;
  }
  return false;
}

function getExactLinesAt(board,x,y,player){
  const lines=[];
  let hS=y; while(hS>0 && board[x][hS-1]===player) hS--;
  let hE=y; while(hE<BOARD_SIZE-1 && board[x][hE+1]===player) hE++;
  if(hE - hS +1 ===3) lines.push(getLineId([{x,y:hS},{x,y:hS+1},{x,y:hS+2}]));
  let vS=x; while(vS>0 && board[vS-1][y]===player) vS--;
  let vE=x; while(vE<BOARD_SIZE-1 && board[vE+1][y]===player) vE++;
  if(vE - vS +1 ===3) lines.push(getLineId([{x:vS,y},{x:vS+1,y},{x:vE,y}]));
  return lines;
}

function hasAnyLineAt(board,x,y,player){
  let hC=1, i=y-1; while(i>=0 && board[x][i]===player){ hC++; i--; }
  i=y+1; while(i<BOARD_SIZE && board[x][i]===player){ hC++; i++; }
  if (hC>=3) return true;
  let vC=1, j=x-1; while(j>=0 && board[j][y]===player){ vC++; j--; }
  j=x+1; while(j<BOARD_SIZE && board[j][y]===player){ vC++; j++; }
  return vC>=3;
}

function getValidMoves(board,x,y){
  const moves=[];
  const dirs=[[-1,0],[1,0],[0,-1],[0,1]];
  for(const [dx,dy] of dirs){
    const nx=x+dx, ny=y+dy;
    if (nx>=0 && nx<BOARD_SIZE && ny>=0 && ny<BOARD_SIZE && board[nx][ny]===null) moves.push({x:nx,y:ny});
  }
  return moves;
}

function getLegalActions(state){
  const { board, currentPlayer, placedCount, phaseSubState, comboUsedPieceIds } = state;
  // WIN CHECK: if a player's placedCount indicates placement finished and they
  // now have fewer than 3 pieces on board, the opponent wins.
  const players = [Player.RED, Player.BLUE];
  for (const p of players) {
    if (placedCount[p] >= PIECES_PER_PLAYER) {
      let count = 0;
      for (let rx = 0; rx < BOARD_SIZE; rx++) for (let ry = 0; ry < BOARD_SIZE; ry++) if (board[rx][ry] === p) count++;
      if (count < 3) { state.winner = p === Player.RED ? Player.BLUE : Player.RED; return []; }
    }
  }
  const actions = [];

  if (phaseSubState === 'REMOVE_PHASE') {
    const opponent = currentPlayer === Player.RED ? Player.BLUE : Player.RED;
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        if (board[x][y] === opponent) actions.push({ type: 'REMOVE', x, y });
      }
    }
    return actions;
  }

  // No special CONTINUE_COMBO action: when pendingCaptures>0 we include both scoring MOVE actions
  // and REMOVE actions (getLegalActions below handles the combo window).

  const isPlacement = placedCount[currentPlayer] < PIECES_PER_PLAYER;
  if (isPlacement) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        if (board[x][y] === null) {
          const tb = board.map(r => [...r]); tb[x][y] = currentPlayer;
          if (!hasAnyLineAt(board, x, y, currentPlayer) && !formsSquareAt(tb, x, y, currentPlayer)) {
            actions.push({ type: 'PLACE', x, y });
          }
        }
      }
    }

    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        if (board[x][y] === currentPlayer) {
          if (phaseSubState === 'COMBO_MOVE' && comboUsedPieceIds?.includes(`${x},${y}`)) continue;
          const moves = getValidMoves(board, x, y);
          for (const m of moves) {
            const tb = board.map(r => [...r]); tb[x][y] = null; tb[m.x][m.y] = currentPlayer;
            const newLines = getExactLinesAt(tb, m.x, m.y, currentPlayer);
            if (newLines.length > 0) actions.push({ type: 'MOVE', from: { x, y }, to: { x: m.x, y: m.y }, capture: true, newLines });
          }
        }
      }
    }
    return actions;
  }

  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (board[x][y] === currentPlayer) {
        if (phaseSubState === 'COMBO_MOVE' && comboUsedPieceIds?.includes(`${x},${y}`)) continue;
        const moves = getValidMoves(board, x, y);
        for (const m of moves) {
          const tb = board.map(r => [...r]); tb[x][y] = null; tb[m.x][m.y] = currentPlayer;
          const newLines = getExactLinesAt(tb, m.x, m.y, currentPlayer);
          actions.push({ type: 'MOVE', from: { x, y }, to: { x: m.x, y: m.y }, capture: newLines.length > 0, newLines });
        }
      }
    }
  }

  return actions;
}

function getScoringMoves(state){
  return getLegalActions(state).filter(a => a.capture);
}

function getAIMove(state){
  const actions = getLegalActions(state);
  if (!actions || actions.length === 0) { if (!state.winner) throw new Error('Engine stall detected'); return null; }
  const scoring = actions.filter(a => a.capture || a.type === 'REMOVE');
  return (scoring.length > 0 ? scoring[0] : actions[Math.floor(Math.random() * actions.length)]);
}

function createInitial(){
  return {
    board: INITIAL_BOARD.map(r => [...r]),
    currentPlayer: Player.RED,
    phase: 'PLACEMENT',
    phaseSubState: 'NORMAL',
    captured: { RED: 0, BLUE: 0 },
    piecesToPlace: { RED: PIECES_PER_PLAYER, BLUE: PIECES_PER_PLAYER },
    placedCount: { RED: 2, BLUE: 2 },
    winner: null,
    movesCount: 0,
    waitingForCapture: false,
    pendingCaptures: 0,
    selectedPiece: null,
    comboUsedPieceIds: [],
    formedLines: []
  };
}

function applyAction(state, action){
  const ns = JSON.parse(JSON.stringify(state));
  if (action.type === 'PLACE') {
    ns.board[action.x][action.y] = ns.currentPlayer;
    ns.placedCount[ns.currentPlayer]++;
  } else if (action.type === 'MOVE') {
    ns.board[action.from.x][action.from.y] = null;
    ns.board[action.to.x][action.to.y] = ns.currentPlayer;
    if (action.capture) {
      ns.pendingCaptures += (action.newLines || []).length;
      ns.comboUsedPieceIds.push(`${action.from.x},${action.from.y}`);
      ns.formedLines.push(...(action.newLines || []));
      // Always transition to REMOVE_PHASE immediately after scoring; combo chaining is optional
      ns.phaseSubState = 'REMOVE_PHASE';
      ns.waitingForCapture = true;
      return ns;
    }
  } else if (action.type === 'REMOVE') {
    ns.board[action.x][action.y] = null;
    ns.captured[ns.currentPlayer]++;
    // decrement pending captures
    ns.pendingCaptures = Math.max(0, (ns.pendingCaptures || 0) - 1);
    if (ns.pendingCaptures > 0) {
      ns.phaseSubState = 'REMOVE_PHASE';
      ns.waitingForCapture = true;
      return ns;
    } else {
      // finalize turn once all pending captures are used
      ns.currentPlayer = ns.currentPlayer === Player.RED ? Player.BLUE : Player.RED;
      ns.phaseSubState = 'NORMAL';
      ns.waitingForCapture = false;
      ns.pendingCaptures = 0;
      ns.comboUsedPieceIds = [];
      ns.formedLines = [];
      return ns;
    }
  }

  // No explicit CONTINUE_COMBO action in the simulation harness.

  // finalize non-scoring move
  ns.currentPlayer = ns.currentPlayer === Player.RED ? Player.BLUE : Player.RED;
  if (ns.placedCount.RED >= PIECES_PER_PLAYER && ns.placedCount.BLUE >= PIECES_PER_PLAYER) ns.phase = 'MOVEMENT';
  return ns;
}

function runSingle(){
  let state = createInitial();
  let steps = 0;
  while (!state.winner && steps < 2000) {
    let a;
    try {
      a = getAIMove(state);
      if (!a) {
        // If engine signaled no actions but game has a winner, end normally.
        if (state.winner) return { stalled: false, winner: state.winner };
        return { stalled: true, state };
      }
    } catch (e) {
      console.error('STALLED STATE', { step: steps, phase: state.phase, phaseSubState: state.phaseSubState, pendingCaptures: state.pendingCaptures, placedCount: state.placedCount });
      console.error('BOARD', JSON.stringify(state.board));
      throw e;
    }
    const legal = getLegalActions(state);
    const valid = legal.find(x => JSON.stringify(x) === JSON.stringify(a));
    if (!valid) return { stalled: true, state };
    state = applyAction(state, valid);
    steps++;
  }
  return { stalled: false, winner: state.winner };
}

function runAll(){
  let stalled = 0;
  let illegalTransitions = 0;
  const totalAI = 100;
  const totalRand = 50;

  for (let i = 0; i < totalAI; i++) {
    const r = runSingle(); if (r.stalled) { stalled++; console.log('AIvAI match', i, 'stalled state snapshot:', r.state); }
  }
  for (let j = 0; j < totalRand; j++) {
    const r = runSingle(); if (r.stalled) { stalled++; console.log('Rand match', j, 'stalled state snapshot:', r.state); }
  }

  console.log('Sim finished. stalled=', stalled, ' totalMatches=', (totalAI + totalRand), ' illegalTransitions=', illegalTransitions);
}

runAll();
