
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { POKEMON_DB, MAP_DATA } from './constants';
import { PokemonInstance, PokemonTemplate, GameState, LogEntry, Move } from './types';

/** 
 * ==========================================================================================
 * ADVANCED NATIVE RNG PROTECTION ENGINE - SECURITY CORE V3
 * ==========================================================================================
 * Hệ thống giám sát tầng sâu bảo vệ hàm Math.random() khỏi các script can thiệp.
 */

// Lưu trữ bản tham chiếu Native ngay khi script được tải
const __ORIGINAL_MATH_RANDOM__ = Math.random;
const __NATIVE_FUNCTION_STRING__ = Math.random.toString();

/**
 * Kiểm tra tính nguyên bản của RNG thông qua kiểm tra chuỗi hàm và tính biến thiên.
 */
const isRngValid = (): boolean => {
  try {
    const currentRandom = Math.random;
    
    // 1. Kiểm tra mã nguồn native
    if (currentRandom.toString() !== __NATIVE_FUNCTION_STRING__) return false;
    
    // 2. Kiểm tra tính ngẫu nhiên cơ bản (Chống lại việc gán hằng số)
    const samples = [currentRandom(), currentRandom(), currentRandom(), currentRandom()];
    const allSame = samples.every(v => v === samples[0]);
    if (allSame) return false;

    // 3. Kiểm tra các trường hợp cực đoan như trả về 0 liên tục
    if (samples.every(v => v === 0)) return false;

    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Thực hiện khôi phục cưỡng bức Math.random về native code.
 */
const emergencyRngRestore = () => {
  try {
    // Sử dụng Object.defineProperty để thử khóa thuộc tính
    Object.defineProperty(Math, 'random', {
      value: __ORIGINAL_MATH_RANDOM__,
      writable: false,
      configurable: true,
      enumerable: false
    });
  } catch (e) {
    // Dự phòng gán trực tiếp
    Math.random = __ORIGINAL_MATH_RANDOM__;
  }
};

/**
 * Vòng lặp giám sát Heartbeat - Chạy độc lập với React Lifecycle
 */
setInterval(() => {
  if (!isRngValid()) {
    emergencyRngRestore();
    // Ghi nhận cảnh báo ngầm (chỉ hiện ở local)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.warn("[ACE-SECURITY] RNG Tampering detected. Native function restored immediately.");
    }
  }
}, 100);

// --- HÀM TIỆN ÍCH TOÁN HỌC AN TOÀN ---
const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const expNeeded = (level: number) => 50 + (level - 1) * 15;

/**
 * ĐỊNH NGHĨA HẰNG SỐ HỆ THỐNG
 */
const SYSTEM_CONSTANTS = {
  AUTO_MOVE_DELAY: 180,
  BATTLE_START_DELAY: 2200,
  BALL_ANIM_MS: 850,
  TEAM_LIMIT: 6,
  LEVEL_LIMIT: 100,
  LEGENDARY_LEVEL_LIMIT: 35,
  BASE_SPAWN_CHANCE: 0.15,
  HEAL_TILE: 3,
  GRASS_TILE: 1,
  WALL_TILE: 2
};

type WeatherType = 'Clear' | 'Rain' | 'Snow' | 'Fog';

/**
 * COMPONENT CHÍNH - APP ENGINE
 */
const App: React.FC = () => {
  // --- STATE HOOKS ---
  const [gameState, setGameState] = useState<GameState>('start');
  const [playerTeam, setPlayerTeam] = useState<PokemonInstance[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [enemy, setEnemy] = useState<PokemonInstance | null>(null);
  const [pos, setPos] = useState({ x: 3, y: 4 });
  const [isBusy, setIsBusy] = useState(false);
  const [isAutoMoving, setIsAutoMoving] = useState(false);
  const [mustSwitch, setMustSwitch] = useState(false);
  const [battleView, setBattleView] = useState<'main' | 'moves'>('main');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [battleFlash, setBattleFlash] = useState(false);
  const [pokeballAnim, setPokeballAnim] = useState(false);
  const [pokeballShake, setPokeballShake] = useState(false);
  const [enemyFainted, setEnemyFainted] = useState(false);
  const [playerShaking, setPlayerShaking] = useState(false);
  const [enemyShaking, setEnemyShaking] = useState(false);
  const [weather, setWeather] = useState<WeatherType>('Clear');
  const [isPortrait, setIsPortrait] = useState(false);

  // --- REFS ---
  const dynamicConfig = useRef({ spawnRate: 0.05, powerMultiplier: 2.0 });
  const logsScrollRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  /**
   * ==========================================================================================
   * SECURITY LAYER: FORCE-QUIT ON BLUR / HIDE
   * ==========================================================================================
   */
  useEffect(() => {
    // Không kích hoạt khi đang ở màn hình khởi đầu
    if (gameState === 'start') return;

    const executeForceQuit = () => {
      // Xóa sạch dấu vết và thoát về trang trống
      window.location.replace("about:blank");
    };

    const onVisibilityAction = () => {
      if (document.visibilityState === 'hidden') {
        executeForceQuit();
      }
    };

    const onWindowBlur = () => {
      executeForceQuit();
    };

    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('visibilitychange', onVisibilityAction);

    return () => {
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('visibilitychange', onVisibilityAction);
    };
  }, [gameState]);

  /**
   * ==========================================================================================
   * SECURITY LAYER: DEVTOOLS DEFENSE
   * ==========================================================================================
   */
  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) return;

    // Chặn chuột phải
    const preventContext = (e: MouseEvent) => e.preventDefault();
    
    // Chặn phím tắt F12, Ctrl+Shift+I, v.v.
    const preventShortcuts = (e: KeyboardEvent) => {
      const { key, ctrlKey, shiftKey } = e;
      if (key === 'F12') { e.preventDefault(); return false; }
      if (ctrlKey && shiftKey && (key === 'I' || key === 'J' || key === 'C')) { e.preventDefault(); return false; }
      if (ctrlKey && key === 'u') { e.preventDefault(); return false; }
    };

    // Phát hiện kích thước cửa sổ thay đổi bất thường (DevTools mở)
    const checkInspectorSize = () => {
      const threshold = 165;
      const isOpened = window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold;
      if (isOpened) {
        window.location.href = "https://www.google.com";
      }
    };

    window.addEventListener('contextmenu', preventContext);
    window.addEventListener('keydown', preventShortcuts);
    const inspectInterval = setInterval(checkInspectorSize, 2500);

    return () => {
      window.removeEventListener('contextmenu', preventContext);
      window.removeEventListener('keydown', preventShortcuts);
      clearInterval(inspectInterval);
    };
  }, []);

  /**
   * ==========================================================================================
   * ENGINE CORE: CONFIG SYNCHRONIZATION
   * ==========================================================================================
   */
  useEffect(() => {
    const syncEngine = async () => {
      try {
        const response = await fetch('/api/engine');
        const data = await response.json();
        if (data && data.spawnRate) {
          dynamicConfig.current = {
            spawnRate: data.spawnRate,
            powerMultiplier: data.multipliers.hp
          };
        }
      } catch (err) {
        // Fallback cho chế độ offline
        dynamicConfig.current = { spawnRate: 0.04, powerMultiplier: 1.8 };
      }
    };
    syncEngine();

    // Disable console logs in production
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const emptyFunc = () => {};
      console.log = emptyFunc; console.info = emptyFunc; console.warn = emptyFunc; console.error = emptyFunc;
    }
  }, []);

  /**
   * ==========================================================================================
   * UI CORE: ORIENTATION MONITORING
   * ==========================================================================================
   */
  useEffect(() => {
    const updateOrientation = () => {
      const isMobile = window.matchMedia("(max-width: 1024px)").matches;
      if (isMobile) {
        setIsPortrait(window.innerHeight > window.innerWidth);
      } else {
        setIsPortrait(false);
      }
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  /**
   * ==========================================================================================
   * BATTLE LOGS HANDLER
   * ==========================================================================================
   */
  const pushLog = useCallback((msg: string, type: LogEntry['type'] = 'normal') => {
    setLogs(current => {
      const updated = [...current, { msg, type, id: Date.now() + Math.random() }];
      return updated.slice(-40); // Giữ stack vừa phải
    });
  }, []);

  useEffect(() => {
    if (logsScrollRef.current) {
      logsScrollRef.current.scrollTop = logsScrollRef.current.scrollHeight;
    }
  }, [logs]);

  /**
   * ==========================================================================================
   * POKEMON GENERATOR
   * ==========================================================================================
   */
  const spawnPokemon = (template: PokemonTemplate, level = 5, noBuff = false): PokemonInstance => {
    const isLegend = !!template.isLegendary;
    const finalLevel = isLegend ? Math.min(level, SYSTEM_CONSTANTS.LEGENDARY_LEVEL_LIMIT) : level;
    
    // Thuật toán chỉ số cơ bản
    let health = Math.floor(template.maxHp * (1 + finalLevel / 18) + finalLevel * 2.5);
    let attack = Math.floor(template.atk * (1 + finalLevel / 45));
    
    // Áp dụng nhân hệ số cho Boss/Legendary
    if (isLegend && !noBuff) {
      const m = dynamicConfig.current.powerMultiplier;
      health = Math.floor(health * m);
      attack = Math.floor(attack * m);
    }
    
    return { 
      ...template, 
      level: finalLevel, 
      maxHp: health, 
      currentHp: health, 
      baseAtk: attack, 
      exp: 0, 
      uid: Math.random() 
    };
  };

  /**
   * ==========================================================================================
   * GAMEPLAY ACTIONS: INITIALIZATION
   * ==========================================================================================
   */
  const pickStarter = (s: PokemonTemplate) => {
    const instance = spawnPokemon(s, 5);
    setPlayerTeam([instance]);
    setGameState('lobby');
    pushLog(`Khởi tạo hệ thống ACE... Thành công!`, 'system');
    pushLog(`Bạn đã nhận được ${s.name}. Một khởi đầu hứa hẹn!`);
  };

  /**
   * ==========================================================================================
   * GAMEPLAY ACTIONS: BATTLE SYSTEM
   * ==========================================================================================
   */
  const triggerBattle = useCallback(async () => {
    if (isBusy) return;
    
    const maxLv = playerTeam.reduce((m, p) => Math.max(m, p.level), 1);
    const encounterLegend = Math.random() < dynamicConfig.current.spawnRate;
    
    let target: PokemonTemplate;
    let lv: number;

    // Phân bổ thời tiết ngẫu nhiên khi vào trận
    const weatherPool: WeatherType[] = ['Clear', 'Rain', 'Snow', 'Fog'];
    const chosenWeather = weatherPool[Math.floor(Math.random() * weatherPool.length)];
    setWeather(chosenWeather);

    if (encounterLegend) {
      target = POKEMON_DB.legendary[Math.floor(Math.random() * POKEMON_DB.legendary.length)];
      lv = Math.min(maxLv + 8, SYSTEM_CONSTANTS.LEGENDARY_LEVEL_LIMIT);
    } else {
      target = POKEMON_DB.wild[Math.floor(Math.random() * POKEMON_DB.wild.length)];
      const avg = Math.floor(playerTeam.reduce((a, b) => a + b.level, 0) / playerTeam.length);
      lv = clamp(avg + randInt(-2, 2), 1, SYSTEM_CONSTANTS.LEVEL_LIMIT);
    }

    const wildPk = spawnPokemon(target, lv);
    setEnemy(wildPk);
    setGameState('vs');
    setMustSwitch(false);
    setBattleView('main');
    setEnemyFainted(false);
    setLogs([]);
    
    const firstAlive = playerTeam.findIndex(p => p.currentHp > 0);
    setActiveIdx(firstAlive >= 0 ? firstAlive : 0);

    setTimeout(() => {
      setGameState('battle');
      pushLog(wildPk.isLegendary ? `⚠ NĂNG LƯỢNG CAO: PHÁT HIỆN ${wildPk.name}!` : `Một ${wildPk.name} hoang dã xuất hiện!`);
      
      // Thông báo môi trường chiến đấu
      if (chosenWeather === 'Rain') pushLog("Cơn mưa nặng hạt làm ướt chiến trường...", 'system');
      if (chosenWeather === 'Snow') pushLog("Bão tuyết khiến tầm nhìn giảm sút!", 'system');
      if (chosenWeather === 'Fog') pushLog("Sương mù che khuất mọi thứ...", 'system');
    }, SYSTEM_CONSTANTS.BATTLE_START_DELAY);
  }, [playerTeam, pushLog, isBusy]);

  /**
   * ==========================================================================================
   * GAMEPLAY ACTIONS: EXPLORATION
   * ==========================================================================================
   */
  const canPass = (x: number, y: number) => {
    if (y < 0 || y >= MAP_DATA.length || x < 0 || x >= MAP_DATA[0].length) return false;
    const tile = MAP_DATA[y][x];
    return tile !== SYSTEM_CONSTANTS.WALL_TILE;
  };

  const handleStep = useCallback((dx: number, dy: number) => {
    if (gameState !== 'lobby' || isBusy || isAutoMoving) return;
    
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    
    if (!canPass(nx, ny)) return;
    
    setPos({ x: nx, y: ny });
    const tileType = MAP_DATA[ny][nx];
    
    // Trung tâm hồi phục
    if (tileType === SYSTEM_CONSTANTS.HEAL_TILE) {
      setPlayerTeam(team => team.map(p => ({ ...p, currentHp: p.maxHp })));
      pushLog("Năng lượng đội hình đã được nạp đầy!", "system");
    }
    
    // Tỉ lệ gặp quái trong bụi rậm
    if (tileType === SYSTEM_CONSTANTS.GRASS_TILE && Math.random() < SYSTEM_CONSTANTS.BASE_SPAWN_CHANCE) {
      triggerBattle();
    }
  }, [gameState, isBusy, isAutoMoving, pos, triggerBattle, pushLog]);

  /**
   * Pathfinding cơ bản cho tương tác click map
   */
  const calculatePath = (start: {x: number, y: number}, end: {x: number, y: number}) => {
    const q: {x: number, y: number, steps: {x: number, y: number}[]}[] = [{...start, steps: []}];
    const visited = new Set([`${start.x},${start.y}`]);
    const dirs = [{x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}];
    
    while (q.length > 0) {
      const {x, y, steps} = q.shift()!;
      if (x === end.x && y === end.y) return steps;
      
      for (const d of dirs) {
        const nx = x + d.x;
        const ny = y + d.y;
        if (canPass(nx, ny) && !visited.has(`${nx},${ny}`)) {
          visited.add(`${nx},${ny}`);
          q.push({x: nx, y: ny, steps: [...steps, {x: nx, y: ny}]});
        }
      }
    }
    return null;
  };

  const onMapClick = async (tx: number, ty: number) => {
    if (gameState !== 'lobby' || isBusy || isAutoMoving) return;
    if (tx === pos.x && ty === pos.y) return;
    
    const way = calculatePath(pos, {x: tx, y: ty});
    if (!way || way.length === 0) return;
    
    setIsAutoMoving(true);
    for (const step of way) {
      if (gameState !== 'lobby') break;
      setPos(step);
      const currentTile = MAP_DATA[step.y][step.x];
      
      if (currentTile === SYSTEM_CONSTANTS.HEAL_TILE) {
        setPlayerTeam(t => t.map(p => ({ ...p, currentHp: p.maxHp })));
      }
      
      if (currentTile === SYSTEM_CONSTANTS.GRASS_TILE && Math.random() < SYSTEM_CONSTANTS.BASE_SPAWN_CHANCE) {
        triggerBattle();
        break;
      }
      
      await new Promise(r => setTimeout(r, SYSTEM_CONSTANTS.AUTO_MOVE_DELAY));
    }
    setIsAutoMoving(false);
  };

  /**
   * KEYBOARD LISTENERS
   */
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      const lowerKey = e.key.toLowerCase();
      if (lowerKey === 'arrowup' || lowerKey === 'w') handleStep(0, -1);
      if (lowerKey === 'arrowdown' || lowerKey === 's') handleStep(0, 1);
      if (lowerKey === 'arrowleft' || lowerKey === 'a') handleStep(-1, 0);
      if (lowerKey === 'arrowright' || lowerKey === 'd') handleStep(1, 0);
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [handleStep]);

  /**
   * ==========================================================================================
   * BATTLE ACTIONS: RESOLUTION
   * ==========================================================================================
   */
  const finalizeBattle = (isDefeat = false) => {
    if (isDefeat) {
      // Hình phạt khi thua: Đưa về trạm hồi máu
      setPlayerTeam(t => t.map(p => ({ ...p, currentHp: p.maxHp })));
      const centers: {x:number, y:number}[] = [];
      MAP_DATA.forEach((r, y) => r.forEach((c, x) => c === 3 && centers.push({x, y})));
      if (centers.length) setPos(centers[Math.floor(Math.random() * centers.length)]);
    }
    setGameState('lobby');
    setEnemy(null);
    setIsBusy(false);
    setMustSwitch(false);
    setEnemyFainted(false);
    setWeather('Clear');
    setIsAutoMoving(false);
  };

  /**
   * TÍNH TOÁN SÁT THƯƠNG PHỨC HỢP
   */
  const getDamage = (move: Move, attacker: PokemonInstance, forPlayer: boolean) => {
    let power = move.pwr;
    
    // Tương tác thời tiết
    if (weather === 'Rain') {
      if (move.type === 'Water') power *= 1.3;
      if (move.type === 'Fire') power *= 0.7;
    }
    if (weather === 'Snow' && move.type === 'Ice') power *= 1.3;
    if (weather === 'Clear' && move.type === 'Fire') power *= 1.2;

    const base = Math.floor((power / 6) * (attacker.level / 5) + (attacker.baseAtk / 16));
    const randomVariation = (Math.random() * 0.20) + 0.85; // 85% to 105%
    
    return Math.max(2, Math.floor((forPlayer ? base + 8 : base) * randomVariation));
  };

  /**
   * LOGIC LƯỢT ĐỐI THỦ
   */
  const executeEnemyAI = async (currentWild: PokemonInstance, activePk: PokemonInstance) => {
    if (!currentWild || currentWild.currentHp <= 0) return;
    
    const move = currentWild.moves[Math.floor(Math.random() * currentWild.moves.length)];
    pushLog(`${currentWild.name} tấn công bằng ${move.name}!`, 'enemy');
    
    // Cơ chế trượt đòn dựa trên thời tiết
    let failRate = 0;
    if (weather === 'Snow') failRate = 0.12;
    if (weather === 'Fog') failRate = 0.22;

    if (Math.random() < failRate) {
      pushLog(`Đòn tấn công bị chệch hướng!`, 'system');
      return;
    }

    setPlayerShaking(true);
    setBattleFlash(true);
    const damage = getDamage(move, currentWild, false);
    
    await new Promise(r => setTimeout(r, 650));
    
    setPlayerShaking(false);
    setBattleFlash(false);
    
    setPlayerTeam(currentTeam => {
      const nextTeam = [...currentTeam];
      nextTeam[activeIdx].currentHp = Math.max(0, nextTeam[activeIdx].currentHp - damage);
      
      if (nextTeam[activeIdx].currentHp <= 0) {
        pushLog(`${nextTeam[activeIdx].name} đã mất khả năng chiến đấu!`, 'system');
        setMustSwitch(true);
        if (!nextTeam.some(pk => pk.currentHp > 0)) {
          pushLog("Đội hình đã cạn kiệt năng lượng. Rút lui về trạm hồi phục...", "system");
          setTimeout(() => finalizeBattle(true), 1300);
        }
      }
      return nextTeam;
    });
  };

  /**
   * THỰC HIỆN CHIÊU THỨC
   */
  const doMove = async (move: Move) => {
    if (isBusy || !enemy) return;
    setIsBusy(true);
    
    const p = playerTeam[activeIdx];
    pushLog(`${p.name} sử dụng ${move.name}!`, 'player');
    
    let missRate = 0;
    if (weather === 'Snow') missRate = 0.05;
    if (weather === 'Fog') missRate = 0.10;

    if (Math.random() < missRate) {
      pushLog(`Chiêu thức của ${p.name} không trúng mục tiêu!`, 'system');
      await new Promise(r => setTimeout(r, 650));
      await executeEnemyAI(enemy, p);
      setIsBusy(false);
      setBattleView('main');
      return;
    }

    setEnemyShaking(true);
    const dmgValue = getDamage(move, p, true);
    const updatedEnemyHp = Math.max(0, enemy.currentHp - dmgValue);
    setEnemy(e => e ? { ...e, currentHp: updatedEnemyHp } : null);
    
    await new Promise(r => setTimeout(r, 650));
    setEnemyShaking(false);
    
    if (updatedEnemyHp <= 0) {
      pushLog(`${enemy.name} đã bị khuất phục!`, 'system');
      setEnemyFainted(true);
      
      const lvDiff = enemy.level - p.level;
      const expPoints = lvDiff > 0 ? lvDiff * 40 : 25;
      pushLog(`Kinh nghiệm tăng thêm ${expPoints} đơn vị!`);
      
      setPlayerTeam(team => {
        const next = [...team];
        const currentPk = next[activeIdx];
        const cap = currentPk.isLegendary ? SYSTEM_CONSTANTS.LEGENDARY_LEVEL_LIMIT : SYSTEM_CONSTANTS.LEVEL_LIMIT;
        
        if (currentPk.level < cap) {
          currentPk.exp += expPoints;
          while (currentPk.exp >= expNeeded(currentPk.level)) {
            currentPk.exp -= expNeeded(currentPk.level);
            currentPk.level++;
            currentPk.maxHp += 12;
            currentPk.baseAtk += 3;
            currentPk.currentHp = currentPk.maxHp;
            pushLog(`🌟 THĂNG CẤP! ${currentPk.name} đạt cấp ${currentPk.level}!`, 'system');
            if (currentPk.level >= cap) break;
          }
        }
        return next;
      });
      
      setTimeout(() => finalizeBattle(false), 1200);
      return;
    }
    
    await executeEnemyAI(enemy, p);
    setIsBusy(false);
    setBattleView('main');
  };

  /**
   * THU PHỤC POKEMON
   */
  const attemptCapture = async () => {
    if (isBusy || mustSwitch || !enemy) return;
    setIsBusy(true);
    setPokeballAnim(true);
    pushLog("Kích hoạt giao thức thu phục!", 'system');
    
    await new Promise(r => setTimeout(r, SYSTEM_CONSTANTS.BALL_ANIM_MS));
    setPokeballAnim(false);
    setEnemyFainted(true); 
    
    for (let j = 0; j < 3; j++) {
      setPokeballShake(true);
      await new Promise(r => setTimeout(r, 800));
      setPokeballShake(false);
    }
    
    const healthPercent = enemy.currentHp / enemy.maxHp;
    let rate;
    
    if (enemy.isLegendary) {
      rate = clamp(0.04 + (1 - healthPercent) * 0.30, 0.04, 0.55);
    } else {
      rate = clamp(0.65 + (1 - healthPercent) * 0.30, 0.15, 0.98);
    }
    
    if (Math.random() < rate) {
      pushLog(`Thành công! ${enemy.name} đã được mã hóa vào đội hình.`, 'system');
      setShowToast(true);
      
      const newMember = { ...enemy, currentHp: enemy.maxHp, uid: Math.random() };
      setPlayerTeam(prev => {
        if (prev.length < SYSTEM_CONSTANTS.TEAM_LIMIT) return [...prev, newMember];
        pushLog("Bộ nhớ đầy! Pokemon đã được chuyển vào PC.", "system");
        return prev;
      });
      
      setTimeout(() => {
        setShowToast(false);
        finalizeBattle(false);
      }, 1500);
    } else {
      pushLog(`Thất bại! ${enemy.name} đã thoát khỏi giao thức.`, 'system');
      setEnemyFainted(false);
      await executeEnemyAI(enemy, playerTeam[activeIdx]);
      setIsBusy(false);
      setBattleView('main');
    }
  };

  /**
   * CHẠY TRỐN
   */
  const attemptRun = async () => {
    if (isBusy || mustSwitch || !enemy) return;
    setIsBusy(true);
    pushLog("Đang thiết lập tuyến đường rút lui...", 'system');
    
    await new Promise(r => setTimeout(r, 600));
    
    const escaped = Math.random() < (enemy.isLegendary ? 0.35 : 0.88);
    
    if (escaped) {
      pushLog("Rút lui thành công!", 'system');
      setTimeout(() => finalizeBattle(false), 500);
    } else {
      pushLog("Tuyến đường bị chặn! Không thể rút lui.", 'system');
      await executeEnemyAI(enemy, playerTeam[activeIdx]);
      setIsBusy(false);
      setBattleView('main');
    }
  };

  /**
   * STYLE BUILDER CHO CHIÊU THỨC
   */
  const getMoveTheme = (type: string) => {
    const t = type.toLowerCase();
    const themes: Record<string, string> = {
      fire: "border-l-4 border-l-red-500 bg-red-950/40 hover:bg-red-900/60",
      water: "border-l-4 border-l-blue-500 bg-blue-950/40 hover:bg-blue-900/60",
      grass: "border-l-4 border-l-emerald-500 bg-emerald-950/40 hover:bg-emerald-900/60",
      electric: "border-l-4 border-l-yellow-500 bg-yellow-950/40 hover:bg-yellow-900/60",
      psychic: "border-l-4 border-l-purple-500 bg-purple-950/40 hover:bg-purple-900/60",
      dragon: "border-l-4 border-l-indigo-500 bg-indigo-950/40 hover:bg-indigo-900/60",
      flying: "border-l-4 border-l-sky-500 bg-sky-950/40 hover:bg-sky-900/60",
      normal: "border-l-4 border-l-slate-400 bg-slate-900/40 hover:bg-slate-800/60"
    };
    return themes[t] || themes.normal;
  };

  /**
   * ==========================================================================================
   * MAIN UI RENDERER
   * ==========================================================================================
   */
  return (
    <div ref={mainContainerRef} className="relative h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-200">
      
      {/* MOBILE ORIENTATION GUARD */}
      {isPortrait && (
        <div className="fixed inset-0 z-[2000] bg-slate-950 flex flex-col items-center justify-center p-10 text-center animate-in fade-in">
          <div className="w-24 h-24 mb-6 text-yellow-500 phone-rotate-anim">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" /></svg>
          </div>
          <h2 className="text-xl font-black uppercase tracking-tighter mb-2">Vui lòng xoay ngang</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tối ưu hóa hiển thị cho ACE Engine</p>
        </div>
      )}

      {/* SECURITY STATUS WATERMARK */}
      <div className="hidden lg:block fixed top-3 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
        <div className="px-5 py-1.5 bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-full text-[8px] font-black uppercase tracking-[0.4em] flex items-center gap-3">
           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
           SECURITY STATUS: ENCRYPTED
        </div>
      </div>

      {/* --- START SCREEN --- */}
      {gameState === 'start' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-900 relative">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/30 rounded-full blur-[140px]"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-600/30 rounded-full blur-[140px]"></div>
          </div>
          
          <div className="mb-10 relative z-10 animate-float-enemy">
             <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] border-4 border-slate-800">
                <div className="w-full h-1/2 bg-red-500 absolute top-0 rounded-t-full border-b-4 border-slate-800"></div>
                <div className="w-6 h-6 bg-white rounded-full border-4 border-slate-800 z-20"></div>
             </div>
          </div>

          <h1 className="text-5xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 uppercase tracking-tighter drop-shadow-lg">ACE POKEMON</h1>
          <p className="mb-14 text-[9px] text-slate-500 uppercase tracking-[0.8em] font-black">Native RNG Protection Active</p>
          
          <div className="flex flex-wrap justify-center gap-6 relative z-10 w-full max-w-5xl">
            {POKEMON_DB.starters.map(s => (
              <button key={s.id} onClick={() => pickStarter(s)} className="bg-slate-800/40 backdrop-blur-lg p-5 rounded-2xl hover:bg-slate-700/60 transition-all border border-white/5 flex flex-col items-center w-40 group shadow-2xl">
                <div className="w-16 h-16 mb-4 relative">
                  <div className="absolute inset-0 bg-white/5 rounded-full blur-xl group-hover:bg-white/10"></div>
                  <img src={s.img} className="w-full h-full object-contain pixelated group-hover:scale-110 transition-transform duration-300" />
                </div>
                <p className="font-black uppercase text-[10px] text-slate-400 group-hover:text-yellow-500 tracking-widest">{s.name}</p>
              </button>
            ))}
          </div>
          
          <div className="mt-20 text-[8px] text-slate-600 font-bold uppercase tracking-widest bg-black/20 px-4 py-2 rounded-full border border-white/5">
            Security Hash: {Math.random().toString(16).slice(2, 10).toUpperCase()}
          </div>
        </div>
      )}

      {/* --- WORLD MAP --- */}
      {gameState === 'lobby' && (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-10"></div>
          
          <div className="relative bg-slate-900 p-1.5 rounded-xl border-4 border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden scale-95 sm:scale-100">
            <div id="game-grid">
              {MAP_DATA.map((row, y) => (
                <div key={y} className="flex">
                  {row.map((tile, x) => (
                    <div 
                      key={`${x}-${y}`} 
                      onClick={() => onMapClick(x, y)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center cursor-pointer hover:brightness-110 active:brightness-95 transition-all ${tile === 1 ? 'grass-tile' : tile === 2 ? 'wall-tile' : tile === 3 ? 'heal-tile' : 'path-tile'}`}
                    >
                      {tile === 3 && <div className="text-xl animate-pulse">➕</div>}
                      {pos.x === x && pos.y === y && (
                        <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-[0_0_12px_rgba(239,68,68,0.6)] z-10 transition-all duration-300 scale-110">
                           <div className="w-full h-1 bg-white/20 mt-1"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* D-PAD MOBILE */}
          <div className="mt-10 grid grid-cols-3 gap-3 sm:hidden z-10">
            <div></div>
            <button className="d-pad-btn" onClick={() => handleStep(0, -1)}>▲</button>
            <div></div>
            <button className="d-pad-btn" onClick={() => handleStep(-1, 0)}>◀</button>
            <button className="d-pad-btn" onClick={() => handleStep(0, 1)}>▼</button>
            <button className="d-pad-btn" onClick={() => handleStep(1, 0)}>▶</button>
          </div>

          {/* TOP BUTTONS */}
          <button onClick={() => setMenuOpen(true)} className="absolute top-6 right-6 px-5 py-3 bg-slate-800 border border-white/10 rounded-xl shadow-2xl hover:bg-slate-700 transition-all group flex items-center gap-3">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Đội hình</div>
            <div className="w-6 h-6 bg-red-600 rounded-md text-[10px] flex items-center justify-center font-black">{playerTeam.length}</div>
          </button>
        </div>
      )}

      {/* --- VS SCREEN --- */}
      {gameState === 'vs' && enemy && (
        <div className="fixed inset-0 z-[100] vs-container flex flex-col items-center justify-center">
          <div className="vs-split-bg"></div>
          <div className="absolute inset-0 flex items-center justify-center gap-8 sm:gap-32 z-10 w-full px-10">
            <div className="flex flex-col items-center animate-in slide-in-from-left duration-700">
              <div className="w-32 h-32 sm:w-48 sm:h-48 drop-shadow-2xl">
                <img src={playerTeam[activeIdx].img} className="w-full h-full object-contain pixelated" style={{ transform: 'scaleX(-1)' }} />
              </div>
              <div className="mt-8 bg-blue-600 px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] skew-x-[-15deg] border border-white/40">ACE</div>
            </div>
            
            <div className="vs-text-container">
              <h1 className="text-7xl sm:text-[10rem] font-black italic tracking-tighter vs-glitch text-white" style={{ WebkitTextStroke: '2px #fbbf24' }}>VS</h1>
            </div>
            
            <div className="flex flex-col items-center animate-in slide-in-from-right duration-700">
              <div className="w-32 h-32 sm:w-48 sm:h-48 drop-shadow-2xl">
                <img src={enemy.img} className="w-full h-full object-contain pixelated" />
              </div>
              <div className="mt-8 bg-red-600 px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] skew-x-[-15deg] border border-white/40">WILD</div>
            </div>
          </div>
        </div>
      )}

      {/* --- BATTLE SCENE --- */}
      {gameState === 'battle' && enemy && (
        <div className={`fixed inset-0 battle-bg z-[80] flex flex-col ${weather === 'Rain' ? 'brightness-75' : weather === 'Fog' ? 'brightness-90' : ''}`}>
          <div className="battle-field-ground"></div>
          <div className={`absolute inset-0 pointer-events-none z-[100] ${battleFlash ? 'flash-red' : ''}`}></div>
          
          {/* WEATHER EFFECTS */}
          <div className="weather-layer">
            {weather === 'Rain' && Array.from({ length: 120 }).map((_, i) => (
              <div key={i} className="rain-drop" style={{ left: `${Math.random() * 110 - 5}%`, animationDelay: `${Math.random() * 0.8}s` }}></div>
            ))}
            {weather === 'Snow' && Array.from({ length: 70 }).map((_, i) => (
              <div key={i} className="snow-flake" style={{ left: `${Math.random() * 100}%`, width: `${Math.random() * 5 + 3}px`, height: `${Math.random() * 5 + 3}px`, animationDelay: `${Math.random() * 4}s` }}></div>
            ))}
            {weather === 'Fog' && <div className="fog-layer fog-active"></div>}
          </div>

          {/* CAPTURE TOAST */}
          {showToast && (
            <div className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-none">
              <div className="px-10 py-5 bg-emerald-600/90 backdrop-blur rounded-2xl text-white font-black uppercase tracking-[0.5em] shadow-[0_0_60px_rgba(16,185,129,0.5)] animate-in zoom-in">
                CAPTURED
              </div>
            </div>
          )}

          {/* MAIN BATTLE STAGE */}
          <div className="relative w-full flex-1">
            
            {/* ENEMY SECTION (TOP RIGHT) - Redesigned to be smaller */}
            <div className="absolute top-10 right-10 sm:right-32 flex flex-col items-end z-20 w-1/3 min-w-[180px]">
              <div className="info-glass p-3 rounded-xl border-l-4 border-red-500 w-full mb-3 shadow-xl">
                <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-1.5 overflow-hidden">
                     <p className="font-black text-[9px] uppercase text-slate-700 truncate">{enemy.name}</p>
                     {enemy.isLegendary && <span className="text-[7px] bg-red-600 text-white px-1 rounded font-black">LEG</span>}
                   </div>
                   <p className="text-[8px] font-black text-slate-400">Lv{enemy.level}</p>
                </div>
                <div className="h-2 bg-slate-300 rounded-full overflow-hidden border border-slate-400 relative">
                  <div className={`h-full transition-all duration-700 ${(enemy.currentHp/enemy.maxHp)*100 < 25 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${(enemy.currentHp/enemy.maxHp)*100}%` }}></div>
                </div>
              </div>

              {/* ENEMY SPRITE - Scaled Down */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 flex flex-col items-center justify-end relative mr-8">
                <div className="pokemon-base-circle bottom-0 scale-75 opacity-30"></div>
                <img src={enemy.img} className={`w-20 h-20 sm:w-28 sm:h-28 object-contain pixelated relative z-10 ${enemyShaking ? 'shake' : 'animate-float-enemy'}`} 
                  style={{ 
                    opacity: enemyFainted ? 0 : 1, 
                    transform: enemyFainted ? 'scale(0) translateY(50px)' : 'none', 
                    transition: 'all 0.6s ease' 
                  }} 
                />
                <div className="shadow-oval scale-75" style={{ bottom: '10px' }}></div>
                
                {/* POKEBALL ANIM */}
                <div className={`absolute inset-0 -top-20 flex items-center justify-center z-50 pointer-events-none ${pokeballAnim ? 'ball-animation' : 'hidden'}`}>
                   <div className={`w-8 h-8 bg-red-500 rounded-full border-2 border-slate-900 ${pokeballShake ? 'ball-shake' : ''}`}>
                      <div className="w-full h-1/2 bg-white absolute bottom-0 rounded-b-full"></div>
                      <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-slate-900"></div>
                   </div>
                </div>
              </div>
            </div>

            {/* PLAYER SECTION (BOTTOM LEFT) - Redesigned to be smaller */}
            <div className="absolute bottom-10 left-10 sm:left-32 flex flex-col-reverse items-start z-20 w-1/3 min-w-[180px]">
              <div className="info-glass p-3 rounded-xl border-r-4 border-blue-500 w-full mt-3 shadow-xl">
                <div className="flex justify-between items-center mb-2">
                   <p className="font-black text-[9px] uppercase text-slate-700 truncate">{playerTeam[activeIdx].name}</p>
                   <p className="text-[8px] font-black text-blue-500">Lv{playerTeam[activeIdx].level}</p>
                </div>
                <div className="h-2.5 bg-slate-300 rounded-full overflow-hidden border border-slate-400 mb-1.5 relative">
                  <div className={`h-full transition-all duration-700 ${(playerTeam[activeIdx].currentHp/playerTeam[activeIdx].maxHp)*100 < 25 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${(playerTeam[activeIdx].currentHp/playerTeam[activeIdx].maxHp)*100}%` }}></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-slate-400 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400" style={{ width: `${(playerTeam[activeIdx].exp / expNeeded(playerTeam[activeIdx].level)) * 100}%` }}></div>
                  </div>
                  <span className="text-[7px] font-black text-slate-500 uppercase">EXP</span>
                </div>
              </div>

              {/* PLAYER SPRITE - Scaled Down */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 flex flex-col items-center justify-end relative ml-8">
                <div className="pokemon-base-circle bottom-0 scale-90 opacity-30"></div>
                <img src={playerTeam[activeIdx].img} className={`w-24 h-24 sm:w-32 sm:h-32 object-contain pixelated relative z-10 ${playerShaking ? 'shake' : 'animate-float-player'}`} />
                <div className="shadow-oval scale-90" style={{ bottom: '12px' }}></div>
              </div>
            </div>
          </div>

          {/* BATTLE CONTROLS PANEL */}
          <div className="bg-slate-900 border-t-4 border-slate-800 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 h-auto sm:h-52 z-[110] relative">
            
            {/* CONSOLE LOGS */}
            <div ref={logsScrollRef} className="flex-1 bg-black/40 p-4 rounded-xl text-white font-mono text-[10px] overflow-y-auto custom-scrollbar border border-white/5 leading-relaxed">
              {logs.map(log => (
                <div key={log.id} className={`mb-2 pl-2 border-l-2 ${log.type === 'player' ? 'border-blue-500 text-blue-200' : log.type === 'enemy' ? 'border-red-500 text-red-200' : log.type === 'system' ? 'border-yellow-500 text-yellow-100 font-bold' : 'border-slate-600 text-slate-400'}`}>
                   {log.msg}
                </div>
              ))}
            </div>

            {/* INTERACTION GRID */}
            <div className="grid grid-cols-2 gap-2 w-full sm:w-[380px]">
              {mustSwitch ? (
                <button onClick={() => setMenuOpen(true)} className="bg-blue-600 col-span-2 py-4 hover:bg-blue-500 border-b-4 border-blue-900 text-white rounded-xl font-black uppercase text-[10px] active:translate-y-1 active:border-b-0 transition-all">
                   Thay đổi Pokemon
                </button>
              ) : battleView === 'main' ? (
                <>
                  <button onClick={() => setBattleView('moves')} className="bg-rose-600 border-b-4 border-rose-800 hover:bg-rose-500 text-white rounded-xl font-black uppercase text-[10px] py-3 shadow-lg active:translate-y-1 active:border-b-0 transition-all">Chiến đấu</button>
                  <button onClick={attemptCapture} className="bg-amber-500 border-b-4 border-amber-700 hover:bg-amber-400 text-white rounded-xl font-black uppercase text-[10px] py-3 shadow-lg active:translate-y-1 active:border-b-0 transition-all">Thu phục</button>
                  <button onClick={() => setMenuOpen(true)} className="bg-indigo-600 border-b-4 border-indigo-800 hover:bg-indigo-500 text-white rounded-xl font-black uppercase text-[10px] py-3 shadow-lg active:translate-y-1 active:border-b-0 transition-all">Pokemon</button>
                  <button onClick={attemptRun} className="bg-slate-700 border-b-4 border-slate-900 hover:bg-slate-600 text-white rounded-xl font-black uppercase text-[10px] py-3 shadow-lg active:translate-y-1 active:border-b-0 transition-all">Bỏ chạy</button>
                </>
              ) : (
                <>
                  {playerTeam[activeIdx].moves.map(m => (
                    <button key={m.name} onClick={() => doMove(m)} className={`${getMoveTheme(m.type)} text-white rounded-xl font-black uppercase text-[9px] py-3 px-4 shadow-lg active:translate-y-1 transition-all flex flex-col text-left`}>
                      <span>{m.name}</span>
                      <span className="text-[7px] opacity-40">{m.type}</span>
                    </button>
                  ))}
                  <button onClick={() => setBattleView('main')} className="bg-slate-800 col-span-2 text-[9px] hover:bg-slate-700 text-white rounded-lg font-black uppercase py-2 border border-white/5">Hủy</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TEAM OVERLAY --- */}
      {menuOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl p-6 sm:p-12 z-[500] flex flex-col items-center animate-in fade-in duration-300">
          <div className="w-full max-w-3xl flex justify-between items-center mb-8 border-b border-white/10 pb-6">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-yellow-500 italic">Hệ thống đội hình</h2>
            {!mustSwitch && (
              <button onClick={() => setMenuOpen(false)} className="bg-slate-800 p-2 rounded-lg hover:bg-red-600 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" /></svg>
              </button>
            )}
          </div>

          <div className="grid gap-4 w-full max-w-3xl overflow-y-auto custom-scrollbar flex-1 pb-10">
            {playerTeam.map((p, idx) => {
              const isActive = idx === activeIdx && gameState === 'battle';
              const dead = p.currentHp <= 0;
              return (
                <div 
                  key={p.uid} 
                  onClick={() => {
                    if (gameState === 'battle') {
                      if (dead || isActive) return;
                      setActiveIdx(idx);
                      setMustSwitch(false);
                      setBattleView('main');
                      pushLog(`Triển khai ${p.name}!`, 'player');
                      setMenuOpen(false);
                    } else {
                      if (idx === 0) return;
                      const newTeam = [...playerTeam];
                      const selected = newTeam.splice(idx, 1)[0];
                      newTeam.unshift(selected);
                      setPlayerTeam(newTeam);
                      pushLog(`${selected.name} hiện là trưởng nhóm.`, 'system');
                    }
                  }} 
                  className={`bg-slate-900/50 p-4 rounded-2xl flex items-center gap-5 border-2 transition-all cursor-pointer group ${idx === 0 ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/5 hover:border-blue-500/50'} ${dead ? 'opacity-40 grayscale' : ''} ${isActive ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="w-16 h-16 bg-black/40 rounded-xl flex items-center justify-center border border-white/5">
                    <img src={p.img} className="w-12 h-12 object-contain pixelated group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-2">
                       <p className="font-black text-[11px] uppercase tracking-widest text-slate-200">{p.name}</p>
                       <p className="text-[9px] font-black text-slate-500">LEVEL {p.level}</p>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div className={`h-full transition-all duration-500 ${dead ? 'bg-slate-700' : (p.currentHp/p.maxHp)*100 < 30 ? 'bg-rose-600' : 'bg-blue-600'}`} style={{ width: `${(p.currentHp / p.maxHp) * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                       <span className="text-[7px] text-slate-600 font-bold uppercase tracking-tighter">{p.currentHp} / {p.maxHp} HP</span>
                       {p.isLegendary && <span className="text-[7px] font-black text-amber-500 italic">LEGENDARY TYPE</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.4em] mt-6 text-center">
            ACE SYSTEM V3.0 • NATIVE RNG SECURED
          </div>
        </div>
      )}

      {/* GLOBAL BACKGROUND ANIMATION */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-30">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
      </div>
    </div>
  );
};

export default App;
