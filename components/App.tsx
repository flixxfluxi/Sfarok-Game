import React, { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Screen, GameState, Phase, Player, Settings, CellValue, GameMode, AILevel, Profile, PhaseSubState } from '../types';
import { INITIAL_BOARD, BOARD_SIZE, PIECES_PER_PLAYER } from '../constants';
import { getAIMove, getLegalActions, getScoringMoves, getValidMoves, getExactLinesAt } from '../engine';
import { MainMenu } from './MainMenu';
import { GameScreen } from './GameScreen';
import { SettingsScreen } from './SettingsScreen';
import { HowToPlay } from './HowToPlay';
import { LoginScreen } from './LoginScreen';
import { ModeSelection } from './ModeSelection';
import { DifficultySelection } from './DifficultySelection';
import { OnlineRoom } from './OnlineRoom';
import { MultiplayerService } from '../multiplayer';
import { translations, TranslationKey } from '../i18n';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.LOGIN);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('dala_settings');
    return saved ? JSON.parse(saved) : { 
      darkMode: true, 
      soundEnabled: true, 
      hapticsEnabled: true,
      nickname: 'Guest',
      language: 'en'
    };
  });

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const newProfile: Profile = {
          uid: user.uid,
          email: user.email || '',
          nickname: user.displayName || 'Warrior',
          photoURL: user.photoURL || undefined,
          isGuest: false
        };
        setProfile(newProfile);
        if (activeScreen === Screen.LOGIN) setActiveScreen(Screen.MENU);
      } else if (!profile?.isGuest) {
        setProfile(null);
        setActiveScreen(Screen.LOGIN);
      }
    });
    return () => unsubscribe();
  }, [activeScreen]);

  // Translation helper
  const t = (key: TranslationKey): string => translations[settings.language][key] || key;
  const isRTL = settings.language === 'ar';

  const [gameState, setGameState] = useState<GameState>({
    board: INITIAL_BOARD.map(row => [...row]),
    currentPlayer: Player.RED,
    phase: Phase.PLACEMENT,
    phaseSubState: PhaseSubState.NORMAL,
    captured: { RED: 0, BLUE: 0 },
    piecesToPlace: { RED: 10, BLUE: 10 },
    placedCount: { RED: 2, BLUE: 2 },
    winner: null,
    movesCount: 0,
    waitingForCapture: false,
    pendingCaptures: 0,
    selectedPiece: null,
    mode: GameMode.OFFLINE_LOCAL,
    formedLines: [],
    comboUsedPieceIds: []
  });

  const [invalidMoveCell, setInvalidMoveCell] = useState<{ x: number; y: number } | null>(null);
  const mpService = useRef<MultiplayerService | null>(null);
  const lastPendingRef = useRef<number>(0);

  // Save settings & apply dark mode
  useEffect(() => {
    (window as any).__engineTest = (window as any).__engineTest || { testsRun: 0, freezeCount: 0, illegalStateCount: 0 };
    if (settings.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('dala_settings', JSON.stringify(settings));
  }, [settings]);

  const switchTurn = (current: Player) => (current === Player.RED ? Player.BLUE : Player.RED);

  // Reset game logic
  const resetGame = useCallback((mode: GameMode = gameState.mode, ai?: AILevel, color?: Player, code?: string) => {
    const newState: GameState = {
      board: INITIAL_BOARD.map(row => [...row]),
      currentPlayer: Player.RED,
      phase: Phase.PLACEMENT,
      phaseSubState: PhaseSubState.NORMAL,
      captured: { RED: 0, BLUE: 0 },
      piecesToPlace: { RED: 10, BLUE: 10 },
      placedCount: { RED: 2, BLUE: 2 },
      winner: null,
      movesCount: 0,
      waitingForCapture: false,
      pendingCaptures: 0,
      selectedPiece: null,
      mode,
      aiLevel: ai,
      playerColor: color || Player.RED,
      roomCode: code,
      formedLines: [],
      comboUsedPieceIds: []
    };
    setGameState(newState);

    try {
      const opponent = mode === GameMode.OFFLINE_AI ? 'AI' : mode === GameMode.OFFLINE_LOCAL ? 'Local' : (code || 'Online');
      (gameService as any).playerColor = color || Player.RED;
      gameService.startMatch(mode, opponent);
    } catch (e) {
      console.error('Failed to start match in gameService:', e);
    }

    if (mode === GameMode.ONLINE && code) {
      if (mpService.current) mpService.current.close();
      mpService.current = new MultiplayerService(code);
      mpService.current.onMessage(setGameState);
    }
  }, [gameState.mode]);

  const startGameIfAuthed = (mode: GameMode, ai?: AILevel, color?: Player, code?: string) => {
    if (!profile) {
      setActiveScreen(Screen.LOGIN);
      return;
    }
    resetGame(mode, ai, color, code);
    setActiveScreen(Screen.GAME);
  };

  const countPiecesOnBoard = (board: CellValue[][], player: Player) => {
    return board.flat().filter(cell => cell === player).length;
  };

  const checkGameOver = (state: GameState): GameState => {
    const opponent = switchTurn(state.currentPlayer);
    const oppCount = countPiecesOnBoard(state.board, opponent) + (PIECES_PER_PLAYER - state.placedCount[opponent]);
    if (oppCount === 0) return { ...state, winner: state.currentPlayer, phase: Phase.GAME_OVER };
    return state;
  };

  const finalizeTurnInternal = (state: GameState): GameState => {
    let nextPhase = state.phase;
    if (state.placedCount.RED === PIECES_PER_PLAYER && state.placedCount.BLUE === PIECES_PER_PLAYER) nextPhase = Phase.MOVEMENT;
    return checkGameOver({ 
      ...state, 
      currentPlayer: switchTurn(state.currentPlayer), 
      phase: nextPhase, 
      phaseSubState: PhaseSubState.NORMAL,
      waitingForCapture: false, 
      pendingCaptures: 0, 
      selectedPiece: null,
      formedLines: [],
      comboUsedPieceIds: []
    });
  };

  // Perform Action logic (PLACE, MOVE, REMOVE)
  const performAction = useCallback((action: any, currentState: GameState): GameState | null => {
    const actions = getLegalActions(currentState);
    const validAction = actions.find(a => {
      if (a.type !== action.type) return false;
      if (a.type === 'PLACE' || a.type === 'REMOVE') return a.x === action.x && a.y === action.y;
      if (a.type === 'MOVE') return a.from.x === action.from.x && a.from.y === action.from.y && a.to.x === action.to.x && a.to.y === action.to.y;
      return false;
    });

    if (!validAction) return null;

    const logAndAssert = (s: GameState) => {
      const comboActive = (s.pendingCaptures || 0) > 0;
      let legal: any[] = [];
      try { legal = getLegalActions(s); } catch(e){ console.error(e); }

      try {
        (window as any).__engineTest = (window as any).__engineTest || { testsRun: 0, freezeCount: 0, illegalStateCount: 0 };
        if ((s.pendingCaptures || 0) > 0 && (lastPendingRef.current || 0) === 0) (window as any).__engineTest.testsRun += 1;
        lastPendingRef.current = s.pendingCaptures || 0;
      } catch (e) {}

      if (comboActive && legal.length === 0) {
        try { (window as any).__engineTest.illegalStateCount++; (window as any).__engineTest.freezeCount++; } catch(e){}
        throw new Error('Illegal engine state: no legal actions while comboActive === true');
      }

      return s;
    };

    const newBoard = currentState.board.map(r => [...r]);
    let nextState = { ...currentState, movesCount: currentState.movesCount + 1, selectedPiece: null };

    if (validAction.type === 'PLACE') {
      newBoard[validAction.x][validAction.y] = currentState.currentPlayer;
      nextState.board = newBoard;
      const newPlaced = { ...currentState.placedCount, [currentState.currentPlayer]: currentState.placedCount[currentState.currentPlayer] + 1 };
      nextState.placedCount = newPlaced;
      nextState.piecesToPlace = { ...currentState.piecesToPlace, [currentState.currentPlayer]: PIECES_PER_PLAYER - newPlaced[currentState.currentPlayer] };

      const createdLines = (validAction as any).newLines || getExactLinesAt(nextState.board, validAction.x, validAction.y, currentState.currentPlayer);
      if (createdLines?.length) {
        nextState.pendingCaptures = (currentState.pendingCaptures || 0) + createdLines.length;
        nextState.waitingForCapture = true;
        nextState.phaseSubState = PhaseSubState.REMOVE_PHASE;

        const postActions = getLegalActions(nextState);
        if (!postActions.some(a => a.type === 'REMOVE')) throw new Error('Exact-3 not triggering removal');

        return logAndAssert(nextState);
      }

      return logAndAssert(finalizeTurnInternal(nextState));
    }

    if (validAction.type === 'MOVE') {
      newBoard[validAction.from.x][validAction.from.y] = null;
      newBoard[validAction.to.x][validAction.to.y] = currentState.currentPlayer;
      nextState.board = newBoard;

      if (validAction.capture) {
        nextState.pendingCaptures += validAction.newLines.length;
        nextState.comboUsedPieceIds = [...(currentState.comboUsedPieceIds || []), `${validAction.from.x},${validAction.from.y}`];
        nextState.formedLines = [...(currentState.formedLines || []), ...validAction.newLines];
        nextState.waitingForCapture = true;
        return logAndAssert(nextState);
      }

      if (currentState.pendingCaptures > 0) {
        nextState.waitingForCapture = true;
        return logAndAssert(nextState);
      } else {
        return logAndAssert(finalizeTurnInternal(nextState));
      }
    }

    if (validAction.type === 'REMOVE') {
      newBoard[validAction.x][validAction.y] = null;
      nextState.board = newBoard;
      nextState.captured = { ...currentState.captured, [currentState.currentPlayer]: currentState.captured[currentState.currentPlayer] + 1 };
      nextState.pendingCaptures = Math.max(0, (currentState.pendingCaptures || 0) - 1);

      if (nextState.pendingCaptures > 0) {
        nextState.waitingForCapture = true;
        return logAndAssert(nextState);
      } else {
        nextState.waitingForCapture = false;
        nextState.comboUsedPieceIds = [];
        nextState.formedLines = [];
        return logAndAssert(finalizeTurnInternal(nextState));
      }
    }

    return null;
  }, []);

  const handleCellClick = (x: number, y: number) => {
    if (gameState.winner) return;
    if (gameState.mode === GameMode.OFFLINE_AI && gameState.currentPlayer === Player.BLUE) return;

    const piece = gameState.board[x][y];

    if (gameState.waitingForCapture && piece !== null && piece !== gameState.currentPlayer) {
      const next = performAction({ type: 'REMOVE', x, y }, gameState);
      if (next) setGameState(next);
      return;
    }

    if (piece === gameState.currentPlayer) {
      const comboActive = (gameState.pendingCaptures || 0) > 0;
      if (comboActive && gameState.comboUsedPieceIds?.includes(`${x},${y}`)) return;

      if (gameState.selectedPiece && gameState.selectedPiece.x === x && gameState.selectedPiece.y === y) {
        setGameState(prev => ({ ...prev, selectedPiece: null }));
        return;
      }

      let validMoves: { x: number; y: number }[] = [];
      if (gameState.phase === Phase.PLACEMENT && gameState.placedCount[gameState.currentPlayer] < PIECES_PER_PLAYER) {
        const cand = getValidMoves(gameState.board, x, y);
        for (const m of cand) {
          const tb = gameState.board.map(r => [...r]); tb[x][y] = null; tb[m.x][m.y] = gameState.currentPlayer;
          if (getExactLinesAt(tb, m.x, m.y, gameState.currentPlayer).length) validMoves.push(m);
        }
      } else validMoves = getValidMoves(gameState.board, x, y);

      if (!validMoves.length) { setGameState(prev => ({ ...prev, selectedPiece: null })); return; }

      setGameState(prev => ({ ...prev, selectedPiece: { x, y } }));
      return;
    }

    if (gameState.selectedPiece && piece === null) {
      const next = performAction({ type: 'MOVE', from: gameState.selectedPiece, to: { x, y } }, gameState);
      if (next) setGameState(next);
      else { setInvalidMoveCell({ x, y }); setGameState(prev => ({ ...prev, selectedPiece: null })); setTimeout(() => setInvalidMoveCell(null), 400); }
      return;
    }

    if (gameState.phaseSubState === PhaseSubState.NORMAL && gameState.placedCount[gameState.currentPlayer] < PIECES_PER_PLAYER && piece === null) {
      const next = performAction({ type: 'PLACE', x, y }, gameState);
      if (next) setGameState(next);
      return;
    }

    setGameState(prev => ({ ...prev, selectedPiece: null }));
  };

  const handleLogout = async () => { await signOut(auth); setProfile(null); setActiveScreen(Screen.LOGIN); };

  // Guest login handler
  const handleGuestLogin = (nickname?: string) => {
    const name = nickname?.trim() || 'Guest';
    setProfile({ uid: 'guest_' + Date.now(), nickname: name, email: '', isGuest: true });
    setActiveScreen(Screen.MENU);
    setSettings(prev => ({ ...prev, nickname: name }));
  };

  useEffect(() => {
    if (gameState.winner || gameState.mode !== GameMode.OFFLINE_AI || gameState.currentPlayer !== Player.BLUE) return;
    const timer = setTimeout(() => {
      const action = getAIMove(gameState, gameState.aiLevel || AILevel.MEDIUM);
      if (action) { const next = performAction(action, gameState); if (next) setGameState(next); }
    }, 600);
    return () => clearTimeout(timer);
  }, [gameState, performAction]);

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {activeScreen === Screen.LOGIN && <LoginScreen t={t} onGuestLogin={handleGuestLogin} />}
      {activeScreen === Screen.MENU && <MainMenu profile={profile} onPlay={() => !profile ? setActiveScreen(Screen.LOGIN) : setActiveScreen(Screen.MODE_SELECT)} onSettings={() => setActiveScreen(Screen.SETTINGS)} onHowToPlay={() => setActiveScreen(Screen.HOW_TO_PLAY)} darkMode={settings.darkMode} t={t} isRTL={isRTL} />}
      {activeScreen === Screen.MODE_SELECT && <ModeSelection onBack={() => setActiveScreen(Screen.MENU)} onLocal={() => startGameIfAuthed(GameMode.OFFLINE_LOCAL)} onAI={() => setActiveScreen(Screen.DIFFICULTY_SELECT)} onOnline={() => setActiveScreen(Screen.ONLINE_WAITING)} t={t} />}
      {activeScreen === Screen.DIFFICULTY_SELECT && <DifficultySelection onBack={() => setActiveScreen(Screen.MODE_SELECT)} onSelect={(level) => startGameIfAuthed(GameMode.OFFLINE_AI, level)} t={t} />}
      {activeScreen === Screen.ONLINE_WAITING && <OnlineRoom onBack={() => setActiveScreen(Screen.MODE_SELECT)} onStart={(code, color) => startGameIfAuthed(GameMode.ONLINE, undefined, color, code)} t={t} />}
      {activeScreen === Screen.GAME && (
        <GameScreen
  gameState={gameState}
  invalidMoveCell={invalidMoveCell}
  onCellClick={handleCellClick}
   onRestart={() => {
    // Create a fresh new game state but keep the current mode/AI/room
    resetGame(gameState.mode, gameState.aiLevel, gameState.playerColor, gameState.roomCode);
    setActiveScreen(Screen.GAME);
  }}
  onBack={() => setActiveScreen(Screen.MENU)}
  onSurrender={() =>
    setGameState(
      finalizeTurnInternal({
        ...gameState,
        winner: switchTurn(gameState.currentPlayer),
      })
    )
  }
  onPerformAction={(a) => {
    const next = performAction(a, gameState);
    if (next) setGameState(next);
  }}
  settings={settings}
  t={t}
/>
      )}
      {activeScreen === Screen.SETTINGS && <SettingsScreen settings={settings} onUpdate={setSettings} onBack={() => setActiveScreen(Screen.MENU)} onLogout={handleLogout} t={t} isRTL={isRTL} />}
      {activeScreen === Screen.HOW_TO_PLAY && <HowToPlay onBack={() => setActiveScreen(Screen.MENU)} t={t} />}
    </div>
  );
};

export default App;