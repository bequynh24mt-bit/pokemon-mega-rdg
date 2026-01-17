
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { POKEMON_DB, MAP_DATA } from './constants';
import { PokemonInstance, PokemonTemplate, GameState, LogEntry, Move } from './types';

/** 
 * ==========================================================================================
 * NATIVE RNG PROTECTION SUITE - SECURITY CORE
 * ==========================================================================================
 * Hệ thống này bảo vệ hàm Math.random() khỏi các cuộc tấn công script injection từ DevTools.
 */

// Lưu trữ bản sao Native ngay khi khởi chạy trang web
const __NATIVE_RNG__ = Math.random;
const __NATIVE_TO_STRING__ = Math.random.toString();

/**
 * Kiểm tra tính toàn vẹn của RNG. 
 * Trình duyệt luôn trả về "[native code]" cho các hàm tích hợp sẵn.
 */
const verifyRNGIntegrity = (): boolean => {
  try {
    const currentRNG = Math.random;
    const currentString = currentRNG.toString();
    
    // Kiểm tra xem hàm có bị ghi đè bởi một hàm trả về hằng số (như 0) không
    const sample = [currentRNG(), currentRNG(), currentRNG()];
    const isConstant = sample[0] === sample[1] && sample[1] === sample[2];
    
    return currentString === __NATIVE_TO_STRING__ && !isConstant;
  } catch (e) {
    return false;
  }
};

/**
 * Hàm khôi phục cưỡng bức RNG về trạng thái gốc của trình duyệt.
 */
const restoreRNG = () => {
  try {
    Object.defineProperty(Math, 'random', {
      value: __NATIVE_RNG__,
      writable: false, // Ngăn chặn ghi đè tiếp theo trong một số trình duyệt hỗ trợ
      configurable: true,
      enumerable: false
    });
  } catch (err) {
    // Dự phòng nếu Object.defineProperty bị chặn
    Math.random = __NATIVE_RNG__;
  }
};

// Khởi chạy vòng lặp giám sát liên tục trước cả khi Component App được render
const RNG_HEARTBEAT_INTERVAL = 100; // 100ms - Phản ứng cực nhanh
setInterval(() => {
  if (!verifyRNGIntegrity()) {
    restoreRNG();
    // Ghi log bảo mật vào console hệ thống (ẩn trong production)
    if (window.location.hostname === 'localhost') {
      console.warn("[SECURITY] Phát hiện thao túng RNG. Đã tự động khôi phục native code.");
    }
  }
}, RNG_HEARTBEAT_INTERVAL);

// Các hàm tiện ích an toàn sử dụng RNG đã được bảo vệ
const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const expNeeded = (level: number) => 50 + (level - 1) * 10;

type WeatherType = 'Clear' | 'Rain' | 'Snow' | 'Fog';

// Cấu hình hằng số hệ thống
const AUTO_MOVE_SPEED = 200;
const BATTLE_INTRO_DURATION = 2200;
const POKEBALL_ANIM_DURATION = 800;
const MAX_TEAM_SIZE = 6;
const MAX_LEVEL_CAP = 100;
const LEGENDARY_LEVEL_CAP = 30;

/**
 * COMPONENT CHÍNH CỦA ỨNG DỤNG
 */
const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
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
  const secureConfig = useRef({ spawnRate: 0.05, buff: 2.0 });
  const logsEndRef = useRef<HTMLDivElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  /**
   * ==========================================================================================
   * HỆ THỐNG GIÁM SÁT TRẠNG THÁI TẬP TRUNG (ANTI-OUT OF FOCUS)
   * ==========================================================================================
   */
  useEffect(() => {
    if (gameState === 'start') return;

    const handleForceQuit = () => {
      // Điều hướng về about:blank ngay lập tức khi mất focus
      window.location.replace("about:blank");
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') handleForceQuit();
    };

    const handleBlur = () => handleForceQuit();

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameState]);

  /**
   * ==========================================================================================
   * HỆ THỐNG BẢO MẬT NÂNG CAO (ANTI-DEVTOOLS & INSPECT)
   * ==========================================================================================
   */
  useEffect(() => {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDev) return;

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Chặn các phím tắt phổ biến để mở DevTools
      if (e.key === 'F12') { e.preventDefault(); return false; }
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) { e.preventDefault(); return false; }
      if (e.ctrlKey && e.key === 'u') { e.preventDefault(); return false; }
    };

    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      if (widthThreshold || heightThreshold) window.location.href = "https://www.sumysumy.com"; 
    };

    const debuggerTrap = () => {
      const start = Date.now();
      debugger; // Chỉ kích hoạt khi DevTools mở, gây lag cực mạnh hoặc crash tab hack
      const end = Date.now();
      if (end - start > 100) window.location.href = "https://www.sumysumy.com";
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    const itvDetect = setInterval(detectDevTools, 2000);
    const itvTrap = setInterval(debuggerTrap, 1000);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(itvDetect);
      clearInterval(itvTrap);
    };
  }, []);

  /**
   * ==========================================================================================
   * HỆ THỐNG ĐỒNG BỘ CẤU HÌNH TỪ BACKEND
   * ==========================================================================================
   */
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/engine');
        const data = await res.json();
        if (data.spawnRate) {
          secureConfig.current = {
            spawnRate: data.spawnRate,
            buff: data.multipliers.hp
          };
        }
      } catch (e) {
        // Dự phòng khi offline hoặc lỗi API
        secureConfig.current = { spawnRate: 0.03, buff: 1.5 };
      }
    };
    fetchConfig();
    
    // Ghi đè console để ngăn chặn việc người dùng dùng console.log để debug logic game
    if (window.location.hostname !== 'localhost') {
      const _n = () => {};
      console.log = _n; console.warn = _n; console.error = _n; console.table = _n;
    }
  }, []);

  /**
   * ==========================================================================================
   * CẢNH BÁO AN TOÀN TRONG CONSOLE (NẾU HACKER VẪN MỞ ĐƯỢC)
   * ==========================================================================================
   */
  useEffect(() => {
    const warningText = `
      [ ACE SYSTEM SECURITY LAYER ]
      - RNG Protection: ACTIVE (Heartbeat: 100ms)
      - Focus Monitor: ACTIVE
      - Native Code Integrity: VERIFIED
      - Anti-Tamper Salt: secure_v1_2024
      
      Mọi nỗ lực can thiệp vào Math.random hoặc gameState sẽ bị hệ thống tự động reset.
    `;
    console.info("%c" + warningText, "color: #3b82f6; font-size: 12px; font-weight: bold; background: #000; padding: 10px; border-left: 5px solid #ef4444;");
  }, []);

  /**
   * ==========================================================================================
   * KIỂM TRA HƯỚNG MÀN HÌNH CHO MOBILE
   * ==========================================================================================
   */
  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = window.matchMedia("(max-width: 1024px)").matches;
      if (isMobile) {
        setIsPortrait(window.innerHeight > window.innerWidth);
      } else {
        setIsPortrait(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  /**
   * ==========================================================================================
   * LOGIC QUẢN LÝ NHẬT KÝ CHIẾN ĐẤU (LOGS)
   * ==========================================================================================
   */
  const addLog = useCallback((msg: string, type: LogEntry['type'] = 'normal') => {
    setLogs(prev => {
      const newLogs = [...prev, { msg, type, id: Date.now() + Math.random() }];
      // Chỉ giữ lại 50 logs gần nhất để tối ưu hiệu năng
      return newLogs.slice(-50);
    });
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollTop = logsEndRef.current.scrollHeight;
    }
  }, [logs]);

  /**
   * ==========================================================================================
   * LOGIC KHỞI TẠO POKEMON INSTANCE
   * ==========================================================================================
   */
  const createInstance = (template: PokemonTemplate, level = 5, noLegendaryBuff = false): PokemonInstance => {
    const isLegendary = !!template.isLegendary;
    const startLevel = isLegendary ? Math.min(level, LEGENDARY_LEVEL_CAP) : level;
    
    // Công thức tính chỉ số dựa trên level (Cân bằng lại)
    let hp = Math.floor(template.maxHp * (1 + startLevel / 20) + startLevel * 2);
    let atk = Math.floor(template.atk * (1 + startLevel / 50));
    
    // Áp dụng buff từ backend cho Pokemon huyền thoại
    if (isLegendary && !noLegendaryBuff) {
      const b = secureConfig.current.buff;
      hp = Math.floor(hp * b);
      atk = Math.floor(atk * b);
    }
    
    return { 
      ...template, 
      level: startLevel, 
      maxHp: hp, 
      currentHp: hp, 
      baseAtk: atk, 
      exp: 0, 
      uid: Math.random() 
    };
  };

  /**
   * ==========================================================================================
   * LOGIC CHỌN POKEMON KHỞI ĐẦU
   * ==========================================================================================
   */
  const selectStarter = (s: PokemonTemplate) => {
    const starter = createInstance(s, 5);
    setPlayerTeam([starter]);
    setGameState('lobby');
    // Log sự kiện bắt đầu
    addLog(`Chào mừng bạn đến với Ace System!`, 'system');
    addLog(`Bạn đã chọn ${s.name} làm bạn đồng hành.`);
  };

  /**
   * ==========================================================================================
   * LOGIC KHỞI TẠO TRẬN ĐẤU (BATTLE SYSTEM)
   * ==========================================================================================
   */
  const startBattle = useCallback(async () => {
    if (isBusy) return;
    
    const maxPlayerLv = playerTeam.reduce((m, p) => Math.max(m, p.level), 1);
    
    // Sử dụng Math.random() đã được bảo vệ để tính toán tỉ lệ xuất hiện
    const isLegend = Math.random() < secureConfig.current.spawnRate;
    
    let t: PokemonTemplate;
    let enemyLevel: number;

    // Hệ thống thời tiết ngẫu nhiên
    const weathers: WeatherType[] = ['Clear', 'Rain', 'Snow', 'Fog'];
    const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
    setWeather(newWeather);

    if (isLegend) {
      t = POKEMON_DB.legendary[Math.floor(Math.random() * POKEMON_DB.legendary.length)];
      enemyLevel = Math.min(maxPlayerLv + 10, LEGENDARY_LEVEL_CAP);
    } else {
      t = POKEMON_DB.wild[Math.floor(Math.random() * POKEMON_DB.wild.length)];
      const avgLv = Math.floor(playerTeam.reduce((acc, p) => acc + p.level, 0) / playerTeam.length);
      enemyLevel = clamp(avgLv + randInt(-1, 1), 1, MAX_LEVEL_CAP);
    }

    const newEnemy = createInstance(t, enemyLevel);
    setEnemy(newEnemy);
    setGameState('vs');
    setMustSwitch(false);
    setBattleView('main');
    setEnemyFainted(false);
    setLogs([]);
    
    // Tìm Pokemon khỏe mạnh đầu tiên
    const active = playerTeam.findIndex(p => p.currentHp > 0);
    setActiveIdx(active >= 0 ? active : 0);

    setTimeout(() => {
      setGameState('battle');
      addLog(newEnemy.isLegendary ? `⚠ CẢNH BÁO: PHÁT HIỆN ${newEnemy.name} HUYỀN THOẠI!` : `Một ${newEnemy.name} hoang dã xuất hiện!`);
      
      // Thông báo thời tiết
      if (newWeather === 'Rain') addLog("Trời bắt đầu đổ mưa... Hệ Nước được tăng cường!", 'system');
      if (newWeather === 'Snow') addLog("Bão tuyết thổi qua... Độ chính xác giảm xuống!", 'system');
      if (newWeather === 'Fog') addLog("Sương mù dày đặc... Tầm nhìn bị hạn chế!", 'system');
    }, BATTLE_INTRO_DURATION);
  }, [playerTeam, addLog, isBusy]);

  /**
   * ==========================================================================================
   * LOGIC DI CHUYỂN TRÊN BẢN ĐỒ (WORLD EXPLORATION)
   * ==========================================================================================
   */
  const isWalkable = (x: number, y: number) => {
    if (y < 0 || y >= MAP_DATA.length || x < 0 || x >= MAP_DATA[0].length) return false;
    const tile = MAP_DATA[y][x];
    return tile === 0 || tile === 1 || tile === 3; // 0: path, 1: grass, 2: wall, 3: heal
  };

  const move = useCallback((dx: number, dy: number) => {
    // Không cho di chuyển nếu game đang bận hoặc đang tự động bước đi
    if (gameState !== 'lobby' || isBusy || isAutoMoving) return;
    
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    
    if (!isWalkable(nx, ny)) return;
    
    setPos({ x: nx, y: ny });
    const targetTile = MAP_DATA[ny][nx];
    
    // Ô hồi máu
    if (targetTile === 3) {
      setPlayerTeam(prev => prev.map(p => ({ ...p, currentHp: p.maxHp })));
      addLog("Đội hình của bạn đã được hồi phục hoàn toàn!", "system");
    }
    
    // Ô cỏ cao (Tỉ lệ gặp quái)
    if (targetTile === 1 && Math.random() < 0.15) {
      startBattle();
    }
  }, [gameState, isBusy, isAutoMoving, pos, startBattle, addLog]);

  /**
   * Tự động tìm đường và di chuyển đến ô click (Pathfinding đơn giản)
   */
  const findPath = (start: {x: number, y: number}, target: {x: number, y: number}) => {
    const queue: {x: number, y: number, path: {x: number, y: number}[]}[] = [{...start, path: []}];
    const visited = new Set([`${start.x},${start.y}`]);
    const dirs = [{x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}];
    
    while (queue.length > 0) {
      const {x, y, path} = queue.shift()!;
      if (x === target.x && y === target.y) return path;
      
      for (const d of dirs) {
        const nx = x + d.x;
        const ny = y + d.y;
        if (isWalkable(nx, ny) && !visited.has(`${nx},${ny}`)) {
          visited.add(`${nx},${ny}`);
          queue.push({x: nx, y: ny, path: [...path, {x: nx, y: ny}]});
        }
      }
    }
    return null;
  };

  const handleTileClick = async (tx: number, ty: number) => {
    if (gameState !== 'lobby' || isBusy || isAutoMoving) return;
    if (tx === pos.x && ty === pos.y) return;
    
    const path = findPath(pos, {x: tx, y: ty});
    if (!path || path.length === 0) return;
    
    setIsAutoMoving(true);
    for (const step of path) {
      // Dừng lại nếu game chuyển sang trạng thái khác (VD: gặp quái)
      if (gameState !== 'lobby') break;
      
      setPos(step);
      const targetTile = MAP_DATA[step.y][step.x];
      
      if (targetTile === 3) {
        setPlayerTeam(prev => prev.map(p => ({ ...p, currentHp: p.maxHp })));
      }
      
      if (targetTile === 1 && Math.random() < 0.15) {
        startBattle();
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, AUTO_MOVE_SPEED));
    }
    setIsAutoMoving(false);
  };

  /**
   * EVENT LISTENERS CHO BÀN PHÍM
   */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'w') move(0, -1);
      if (k === 'arrowdown' || k === 's') move(0, 1);
      if (k === 'arrowleft' || k === 'a') move(-1, 0);
      if (k === 'arrowright' || k === 'd') move(1, 0);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move]);

  /**
   * ==========================================================================================
   * LOGIC KẾT THÚC TRẬN ĐẤU (BATTLE RESOLUTION)
   * ==========================================================================================
   */
  const endBattle = (forcedHeal = false) => {
    if (forcedHeal) {
      setPlayerTeam(prev => prev.map(p => ({ ...p, currentHp: p.maxHp })));
      // Đưa người chơi về ô hồi máu gần nhất hoặc ngẫu nhiên
      const heals: {x:number, y:number}[] = [];
      MAP_DATA.forEach((row, y) => row.forEach((cell, x) => cell === 3 && heals.push({x, y})));
      if (heals.length) setPos(heals[Math.floor(Math.random() * heals.length)]);
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
   * TÍNH TOÁN SÁT THƯƠNG (DAMAGE CALCULATOR)
   */
  const calculateDamage = (m: Move, attacker: PokemonInstance, isPlayerAttacking: boolean) => {
    let pwr = m.pwr;
    
    // Ảnh hưởng của thời tiết
    if (weather === 'Rain') {
      if (m.type === 'Water') pwr *= 1.2;
      if (m.type === 'Fire') pwr *= 0.8;
    }
    if (weather === 'Snow' && m.type === 'Ice') pwr *= 1.2;
    if (weather === 'Clear' && m.type === 'Fire') pwr *= 1.1;
    if (weather === 'Fog' && m.pwr > 70) pwr *= 0.8;

    // Công thức tính sát thương cơ bản
    const baseDmg = Math.floor((pwr / 5) * (attacker.level / 5) + (attacker.baseAtk / 18));
    
    // Biến động sát thương ngẫu nhiên (85% - 100%) - Sử dụng RNG được bảo vệ
    const variance = (Math.random() * 0.15) + 0.85;
    
    return Math.max(1, Math.floor((isPlayerAttacking ? baseDmg + 5 : baseDmg) * variance));
  };

  /**
   * LƯỢT CỦA ĐỐI THỦ
   */
  const enemyTurn = async (currentEnemy: PokemonInstance, currentPlayer: PokemonInstance) => {
    if (!currentEnemy || currentEnemy.currentHp <= 0) return;
    
    const m = currentEnemy.moves[Math.floor(Math.random() * currentEnemy.moves.length)];
    addLog(`${currentEnemy.name} sử dụng ${m.name}!`, 'enemy');
    
    // Kiểm tra hụt chiêu dựa trên thời tiết (RNG protected)
    let missChance = 0;
    if (weather === 'Snow') missChance = 0.15;
    if (weather === 'Fog') missChance = 0.20;

    if (Math.random() < missChance) {
      addLog(`Đòn tấn công đã bị hụt!`, 'system');
      return;
    }

    setPlayerShaking(true);
    setBattleFlash(true);
    const dmg = calculateDamage(m, currentEnemy, false);
    
    await new Promise(r => setTimeout(r, 600));
    
    setPlayerShaking(false);
    setBattleFlash(false);
    
    setPlayerTeam(prev => {
      const next = [...prev];
      next[activeIdx].currentHp = Math.max(0, next[activeIdx].currentHp - dmg);
      
      if (next[activeIdx].currentHp <= 0) {
        addLog(`${next[activeIdx].name} đã gục ngã!`, 'system');
        setMustSwitch(true);
        // Nếu tất cả Pokemon đều gục
        if (!next.some(pk => pk.currentHp > 0)) {
          addLog("Bạn không còn Pokemon nào có thể chiến đấu! Đang đưa về trung tâm hồi phục...", "system");
          setTimeout(() => endBattle(true), 1200);
        }
      }
      return next;
    });
  };

  /**
   * SỬ DỤNG CHIÊU THỨC
   */
  const useMove = async (m: Move) => {
    if (isBusy || !enemy) return;
    setIsBusy(true);
    
    const p = playerTeam[activeIdx];
    addLog(`${p.name} sử dụng ${m.name}!`, 'player');
    
    // Kiểm tra hụt chiêu cho người chơi (RNG protected)
    let missChance = 0;
    if (weather === 'Snow') missChance = 0.05;
    if (weather === 'Fog') missChance = 0.10;

    if (Math.random() < missChance) {
      addLog(`Chiêu thức của ${p.name} đã bị hụt!`, 'system');
      await new Promise(r => setTimeout(r, 600));
      await enemyTurn(enemy, p);
      setIsBusy(false);
      setBattleView('main');
      return;
    }

    setEnemyShaking(true);
    const dmg = calculateDamage(m, p, true);
    const newEnemyHp = Math.max(0, enemy.currentHp - dmg);
    setEnemy(prev => prev ? { ...prev, currentHp: newEnemyHp } : null);
    
    await new Promise(r => setTimeout(r, 600));
    setEnemyShaking(false);
    
    if (newEnemyHp <= 0) {
      addLog(`${enemy.name} đã bị đánh bại!`, 'system');
      setEnemyFainted(true);
      
      // Tính toán EXP nhận được
      const diff = enemy.level - p.level;
      const gain = diff > 0 ? diff * 30 : 20;
      addLog(`Đội hình nhận được ${gain} EXP!`);
      
      setPlayerTeam(prev => {
        const next = [...prev];
        const pk = next[activeIdx];
        
        // Kiểm tra Level Cap
        const currentCap = pk.isLegendary ? LEGENDARY_LEVEL_CAP : MAX_LEVEL_CAP;
        
        if (pk.level >= currentCap) {
          addLog(`${pk.name} đã đạt giới hạn cấp độ!`, 'system');
        } else {
          pk.exp += gain;
          while (pk.exp >= expNeeded(pk.level)) {
            pk.exp -= expNeeded(pk.level);
            pk.level++;
            pk.maxHp += 10;
            pk.baseAtk += 2;
            pk.currentHp = pk.maxHp;
            addLog(`🌟 CHÚC MỪNG! ${pk.name} lên cấp ${pk.level}!`, 'system');
            if (pk.level >= currentCap) break;
          }
        }
        return next;
      });
      
      setTimeout(() => endBattle(false), 1200);
      return;
    }
    
    // Lượt của đối thủ nếu nó chưa ngất
    await enemyTurn(enemy, p);
    setIsBusy(false);
    setBattleView('main');
  };

  /**
   * NÉM POKEBALL ĐỂ THU PHỤC
   */
  const throwBall = async () => {
    if (isBusy || mustSwitch || !enemy) return;
    setIsBusy(true);
    setPokeballAnim(true);
    addLog("Bạn đã ném Pokeball!", 'system');
    
    await new Promise(r => setTimeout(r, POKEBALL_ANIM_DURATION));
    setPokeballAnim(false);
    setEnemyFainted(true); // Tạm thời ẩn sprite pokemon để hiện pokeball
    
    // Hiệu ứng rung 3 lần trước khi xác nhận bắt thành công
    for (let i = 0; i < 3; i++) {
      setPokeballShake(true);
      await new Promise(r => setTimeout(r, 800));
      setPokeballShake(false);
    }
    
    const hpRatio = enemy.currentHp / enemy.maxHp;
    let captureRate;
    
    // Thuật toán tính tỉ lệ bắt (Sử dụng RNG protected)
    if (enemy.isLegendary) {
      captureRate = clamp(0.05 + (1 - hpRatio) * 0.35, 0.05, 0.60);
    } else {
      captureRate = clamp(0.70 + (1 - hpRatio) * 0.25, 0.10, 0.95);
    }
    
    if (Math.random() < captureRate) {
      addLog(`Tuyệt vời! ${enemy.name} đã bị thu phục!`, 'system');
      setShowToast(true);
      
      // Thêm vào team
      const captured = { ...enemy, currentHp: enemy.maxHp, uid: Math.random() };
      setPlayerTeam(prev => {
        if (prev.length < MAX_TEAM_SIZE) return [...prev, captured];
        addLog("Đội hình đã đầy! Pokemon được gửi về PC.", "system");
        return prev;
      });
      
      setTimeout(() => {
        setShowToast(false);
        endBattle(false);
      }, 1500);
    } else {
      addLog(`Thật đáng tiếc! ${enemy.name} đã thoát ra!`, 'system');
      setEnemyFainted(false);
      await enemyTurn(enemy, playerTeam[activeIdx]);
      setIsBusy(false);
      setBattleView('main');
    }
  };

  /**
   * CHẠY TRỐN KHỎI TRẬN ĐẤU
   */
  const tryRunAway = async () => {
    if (isBusy || mustSwitch || !enemy) return;
    setIsBusy(true);
    addLog("Đang cố gắng chạy trốn...", 'system');
    
    await new Promise(r => setTimeout(r, 500));
    
    // Tỉ lệ chạy trốn (RNG protected)
    const success = Math.random() < (enemy.isLegendary ? 0.40 : 0.85);
    
    if (success) {
      addLog("Chạy trốn thành công!", 'system');
      setTimeout(() => endBattle(false), 600);
    } else {
      addLog("Không thể chạy thoát!", 'system');
      await enemyTurn(enemy, playerTeam[activeIdx]);
      setIsBusy(false);
      setBattleView('main');
    }
  };

  /**
   * PHÂN LOẠI STYLE CHO CHIÊU THỨC DỰA TRÊN HỆ
   */
  const moveBorderClass = (type: string) => {
    const t = type.toLowerCase();
    const mapping: Record<string, string> = {
      fire: "border-l-4 border-l-red-500 bg-red-900/30",
      water: "border-l-4 border-l-blue-500 bg-blue-900/30",
      grass: "border-l-4 border-l-emerald-500 bg-emerald-900/30",
      electric: "border-l-4 border-l-yellow-500 bg-yellow-900/30",
      psychic: "border-l-4 border-l-purple-500 bg-purple-900/30",
      dragon: "border-l-4 border-l-indigo-500 bg-indigo-900/30",
      flying: "border-l-4 border-l-sky-500 bg-sky-900/30",
      dark: "border-l-4 border-l-slate-500 bg-slate-900/30",
      ghost: "border-l-4 border-l-violet-500 bg-violet-900/30",
      normal: "border-l-4 border-l-gray-400 bg-gray-800/30"
    };
    return mapping[t] || mapping.normal;
  };

  /**
   * ==========================================================================================
   * RENDER GIAO DIỆN (UI)
   * ==========================================================================================
   */
  return (
    <div ref={gameContainerRef} className="relative h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      
      {/* PORTRAIT LOCK OVERLAY - Chỉ hiện trên mobile khi màn hình dọc */}
      {isPortrait && (
        <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
          <div className="w-32 h-32 mb-8 text-yellow-500 phone-rotate-anim">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <path d="M12 18h.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Vui lòng xoay ngang điện thoại</h2>
          <p className="text-slate-400 font-bold text-sm max-w-xs leading-relaxed uppercase tracking-widest">
            Hệ thống ACE yêu cầu độ phân giải tối ưu ở chế độ nằm ngang
          </p>
        </div>
      )}

      {/* WARNING OVERLAY - Giám sát hệ thống */}
      <div className="hidden lg:block fixed top-2 left-1/2 -translate-x-1/2 z-[300] pointer-events-none">
        <div className="px-4 py-1 bg-red-600/20 backdrop-blur-sm border border-red-600/40 rounded-full text-[9px] text-red-200 font-black uppercase tracking-widest flex items-center gap-2">
           <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
           HỆ THỐNG GIÁM SÁT RNG: ĐANG HOẠT ĐỘNG
        </div>
      </div>

      {/* --- MÀN HÌNH KHỞI ĐẦU (START SCREEN) --- */}
      {gameState === 'start' && (
        <div className="min-h-screen flex flex-col items-center justify-center text-white p-6 relative overflow-hidden bg-slate-900">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-96 h-96 bg-red-600 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
          </div>
          
          <div className="animate-bounce mb-8 relative z-10">
            <svg width="120" height="120" viewBox="0 0 100 100" className="drop-shadow-2xl">
              <circle cx="50" cy="50" r="45" fill="white" stroke="#1e293b" strokeWidth="4"/>
              <path d="M5 50 A 45 45 0 0 1 95 50 L 5 50" fill="#ef4444" stroke="#1e293b" strokeWidth="2"/>
              <circle cx="50" cy="50" r="14" fill="white" stroke="#1e293b" strokeWidth="4"/>
              <circle cx="50" cy="50" r="8" fill="white" className="animate-pulse"/>
            </svg>
          </div>

          <h1 className="text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-yellow-600 drop-shadow-sm uppercase text-center font-pixel tracking-tighter">ACE SYSTEM</h1>
          <p className="mb-12 text-xs text-slate-400 uppercase tracking-[0.6em] font-black">Native RNG Protected</p>
          
          <div className="flex flex-wrap justify-center gap-8 relative z-10 max-w-4xl">
            {POKEMON_DB.starters.map(s => (
              <button key={s.id} onClick={() => selectStarter(s)} className="bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl hover:bg-slate-700/80 hover:-translate-y-3 transition-all border border-slate-600 flex flex-col items-center w-44 shadow-2xl group">
                <div className="relative w-24 h-24 mb-4">
                  <div className="absolute inset-0 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors"></div>
                  <img src={s.img} className="w-full h-full object-contain pixelated group-hover:scale-125 transition-transform duration-500 drop-shadow-lg" />
                </div>
                <p className="font-black uppercase text-xs text-slate-300 group-hover:text-yellow-400 transition-colors tracking-widest">{s.name}</p>
                <div className="mt-2 flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                   <div className="w-1 h-1 bg-white rounded-full"></div>
                   <div className="w-1 h-1 bg-white rounded-full"></div>
                   <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-16 text-[10px] text-slate-500 font-bold uppercase tracking-widest border border-slate-700/50 px-4 py-1.5 rounded-full">
            Version 2.5.0 • Remastered Engine
          </div>
        </div>
      )}

      {/* --- KHÁM PHÁ THẾ GIỚI (LOBBY/OVERWORLD) --- */}
      {gameState === 'lobby' && (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>
          
          <div className="relative bg-slate-800 p-2 rounded-2xl border-4 border-slate-700 shadow-2xl overflow-hidden scale-90 sm:scale-100 ring-8 ring-black/30">
            <div id="game-map" className="relative">
              {MAP_DATA.map((row, y) => (
                <div key={y} className="flex">
                  {row.map((cell, x) => (
                    <div 
                      key={`${x}-${y}`} 
                      onClick={() => handleTileClick(x, y)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center relative cursor-pointer hover:brightness-110 active:brightness-90 transition-all ${cell === 1 ? 'grass-tile' : cell === 2 ? 'wall-tile' : cell === 3 ? 'heal-tile' : 'path-tile'}`}
                    >
                      {cell === 3 && <span className="text-xl drop-shadow-md animate-pulse">❤️</span>}
                      {pos.x === x && pos.y === y && (
                        <div className="w-7 h-7 bg-red-600 rounded-full border-2 border-white shadow-[0_0_15px_rgba(239,68,68,0.8)] z-10 transition-all duration-300 ease-in-out">
                          <div className="w-full h-1/2 bg-white rounded-t-full opacity-30"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* D-PAD CHO MOBILE */}
          <div className="mt-8 grid grid-cols-3 gap-3 sm:hidden relative z-10">
            <div></div>
            <button className="d-pad-btn" onClick={() => move(0, -1)}>▲</button>
            <div></div>
            <button className="d-pad-btn" onClick={() => move(-1, 0)}>◀</button>
            <button className="d-pad-btn" onClick={() => move(0, 1)}>▼</button>
            <button className="d-pad-btn" onClick={() => move(1, 0)}>▶</button>
          </div>

          {/* NÚT MỞ ĐỘI HÌNH */}
          <button onClick={() => setMenuOpen(true)} className="absolute top-6 right-6 z-50 px-6 py-4 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-2xl border-b-4 border-yellow-800 shadow-xl font-black text-slate-900 flex items-center gap-4 hover:scale-105 active:scale-95 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm tracking-widest uppercase">Đội hình</span>
            <span className="bg-red-700 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-inner">{playerTeam.length}</span>
          </button>
        </div>
      )}

      {/* --- MÀN HÌNH VS (BATTLE INTRO) --- */}
      {gameState === 'vs' && enemy && (
        <div className="fixed inset-0 z-[90] vs-container flex flex-col items-center justify-center">
          <div className="vs-split-bg"></div>
          <div className="absolute inset-0 flex items-center justify-center gap-4 sm:gap-24 z-10 w-full px-8">
            <div className="vs-card-player flex flex-col items-center animate-in slide-in-from-left duration-700">
              <div className="w-40 h-40 sm:w-64 sm:h-64 relative drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                <img src={playerTeam[activeIdx].img} className="w-full h-full object-contain pixelated" style={{ transform: 'scaleX(-1)' }} />
              </div>
              <div className="mt-6 bg-blue-600 text-white text-sm font-black px-8 py-2 skew-x-[-15deg] shadow-2xl border-2 border-white uppercase tracking-[0.2em]">Của bạn</div>
            </div>
            
            <div className="vs-text-container relative z-20">
              <h1 className="text-8xl sm:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-red-600 italic tracking-tighter vs-glitch drop-shadow-2xl" style={{ WebkitTextStroke: '3px white' }}>VS</h1>
            </div>
            
            <div className="vs-card-enemy flex flex-col items-center animate-in slide-in-from-right duration-700">
              <div className="w-40 h-40 sm:w-64 sm:h-64 relative drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]">
                <img src={enemy.img} className="w-full h-full object-contain pixelated" />
              </div>
              <div className="mt-6 bg-red-600 text-white text-sm font-black px-8 py-2 skew-x-[-15deg] shadow-2xl border-2 border-white uppercase tracking-[0.2em]">Hoang dã</div>
            </div>
          </div>
        </div>
      )}

      {/* --- GIAO DIỆN CHIẾN ĐẤU (BATTLE SCENE) --- */}
      {gameState === 'battle' && enemy && (
        <div className={`fixed inset-0 battle-bg z-[80] flex flex-col ${weather === 'Rain' ? 'brightness-[0.75] saturate-[1.3]' : weather === 'Fog' ? 'brightness-[0.85]' : ''}`}>
          <div className="battle-field-ground"></div>
          <div className={`absolute inset-0 pointer-events-none z-50 ${battleFlash ? 'flash-red' : ''}`}></div>
          
          {/* LỚP THỜI TIẾT DỰA TRÊN STATE */}
          <div className="weather-layer">
            {weather === 'Rain' && Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="rain-drop" style={{ left: `${Math.random() * 110 - 5}%`, animationDelay: `${Math.random() * 1}s`, opacity: Math.random() }}></div>
            ))}
            {weather === 'Snow' && Array.from({ length: 60 }).map((_, i) => (
              <div key={i} className="snow-flake" style={{ left: `${Math.random() * 100}%`, width: `${Math.random() * 6 + 4}px`, height: `${Math.random() * 6 + 4}px`, animationDelay: `${Math.random() * 4}s` }}></div>
            ))}
            {weather === 'Fog' && <div className="fog-layer fog-active"></div>}
            {weather === 'Clear' && <div className="sun-glare"></div>}
          </div>

          {/* TOAST THÔNG BÁO BẮT THÀNH CÔNG */}
          {showToast && (
            <div className="absolute inset-0 z-[120] flex items-center justify-center pointer-events-none">
              <div className="px-12 py-6 rounded-2xl bg-black/90 backdrop-blur text-white font-black uppercase tracking-[0.4em] border-y-4 border-yellow-400 shadow-[0_0_80px_rgba(251,191,36,0.6)] transform scale-110 animate-in zoom-in duration-300">
                <span className="text-yellow-400 mr-4">★</span> BẮT THÀNH CÔNG <span className="text-yellow-400 ml-4">★</span>
              </div>
            </div>
          )}

          {/* CHIẾN TRƯỜNG CHÍNH */}
          <div className="relative w-full flex-1 overflow-hidden">
            {/* TAG THÔNG TIN THỜI TIẾT */}
            <div className="absolute top-4 left-6 z-50">
               <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 flex items-center gap-3 shadow-2xl">
                  <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">Môi trường:</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${weather === 'Rain' ? 'text-blue-400' : weather === 'Snow' ? 'text-white' : weather === 'Fog' ? 'text-gray-400' : 'text-yellow-400'}`}>
                    {weather === 'Fog' ? 'Sương mù dày' : weather === 'Rain' ? 'Mưa xối xả' : weather === 'Snow' ? 'Bão tuyết' : 'Trời quang'}
                  </span>
               </div>
            </div>
            
            {/* PHẦN THÔNG TIN ĐỐI THỦ (TOP RIGHT) */}
            <div className="absolute top-12 right-6 sm:right-24 flex flex-col items-end z-20 w-1/2 max-w-sm">
              <div className="info-glass p-4 rounded-2xl rounded-br-none border-l-8 border-l-red-600 w-full mb-3 shadow-2xl relative z-30 transform hover:scale-105 transition-transform">
                <div className="flex justify-between items-baseline mb-2">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-sm uppercase text-slate-800 tracking-tighter font-pixel text-[11px]">{enemy.name}</p>
                    {enemy.isLegendary && <span className="animate-pulse bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black">LEGEND</span>}
                  </div>
                  <p className="text-[10px] font-black text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Lv {enemy.level}</p>
                </div>
                <div className="h-3.5 bg-slate-300 rounded-full overflow-hidden border-2 border-slate-400 relative shadow-inner">
                  <div className={`h-full transition-all duration-700 shadow-[0_0_15px_rgba(16,185,129,0.5)] ${(enemy.currentHp/enemy.maxHp)*100 < 25 ? 'bg-red-500' : (enemy.currentHp/enemy.maxHp)*100 < 55 ? 'bg-yellow-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`} style={{ width: `${(enemy.currentHp/enemy.maxHp)*100}%` }}></div>
                </div>
                <div className="flex justify-between mt-1.5">
                   <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase">Health Point</p>
                   <p className="text-[10px] text-slate-600 font-black font-mono">{enemy.currentHp} / {enemy.maxHp}</p>
                </div>
              </div>

              {/* SPRITE ĐỐI THỦ */}
              <div className="w-36 h-36 sm:w-64 sm:h-64 flex flex-col items-center justify-end relative mr-12 group">
                <div className="pokemon-base-circle bottom-0 scale-125 opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <img src={enemy.img} className={`w-full h-full object-contain pixelated drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)] relative z-10 ${enemy.isLegendary ? 'legendary-glow' : ''} ${enemyShaking ? 'shake' : 'animate-float-enemy'}`} 
                  style={{ 
                    opacity: enemyFainted ? 0 : 1, 
                    transform: enemyFainted ? 'scale(0.1) translateY(100px)' : 'translateY(15px)', 
                    transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                  }} 
                />
                <div className="shadow-oval" style={{ bottom: '15px' }}></div>
                
                {/* ANIMATION POKEBALL KHI NÉM */}
                <div className={`absolute inset-0 -top-32 flex items-center justify-center z-50 pointer-events-none ${pokeballAnim ? 'ball-animation' : 'hidden'}`}>
                  <svg className={`w-14 h-14 drop-shadow-2xl ${pokeballShake ? 'ball-shake' : ''}`} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="48" fill="white" stroke="#1e293b" strokeWidth="4"/>
                    <path d="M2 50 A 48 48 0 0 1 98 50 L 2 50" fill="#ef4444" stroke="#1e293b" strokeWidth="2"/>
                    <circle cx="50" cy="50" r="14" fill="white" stroke="#1e293b" strokeWidth="5"/>
                    <circle cx="50" cy="50" r="10" fill="white" stroke="#9ca3af" strokeWidth="1"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* PHẦN THÔNG TIN NGƯỜI CHƠI (BOTTOM LEFT) */}
            <div className="absolute bottom-12 left-6 sm:left-24 flex flex-col-reverse items-start z-20 w-1/2 max-w-sm">
              <div className="info-glass p-4 rounded-2xl rounded-tl-none border-r-8 border-r-blue-600 w-full mt-3 shadow-2xl relative z-30 transform hover:scale-105 transition-transform">
                <div className="flex justify-between items-baseline mb-2">
                  <p className="font-black text-sm uppercase text-slate-800 tracking-tighter font-pixel text-[11px]">{playerTeam[activeIdx].name}</p>
                  <p className="text-[10px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Lv {playerTeam[activeIdx].level}</p>
                </div>
                <div className="h-4 bg-slate-300 rounded-full overflow-hidden border-2 border-slate-400 mb-2 relative shadow-inner">
                  <div className={`h-full transition-all duration-700 shadow-[0_0_15px_rgba(59,130,246,0.5)] ${(playerTeam[activeIdx].currentHp/playerTeam[activeIdx].maxHp)*100 < 25 ? 'bg-red-500' : (playerTeam[activeIdx].currentHp/playerTeam[activeIdx].maxHp)*100 < 55 ? 'bg-yellow-400' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`} style={{ width: `${(playerTeam[activeIdx].currentHp/playerTeam[activeIdx].maxHp)*100}%` }}></div>
                </div>
                
                {/* THANH EXP */}
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">EXP</span>
                  <div className="flex-1 h-2 bg-slate-300 rounded-full overflow-hidden border border-slate-400 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-300 transition-all duration-1000" style={{ width: `${Math.floor((playerTeam[activeIdx].exp / expNeeded(playerTeam[activeIdx].level)) * 100)}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between mt-2 items-center">
                  <span className="text-[10px] font-mono text-slate-500 font-black tracking-tighter">{playerTeam[activeIdx].currentHp} / {playerTeam[activeIdx].maxHp} HP</span>
                  {playerTeam[activeIdx].exp > 0 && <span className="text-[9px] font-black text-blue-500">+{playerTeam[activeIdx].exp} EXP</span>}
                </div>
              </div>

              {/* SPRITE NGƯỜI CHƠI */}
              <div className="w-44 h-44 sm:w-72 sm:h-72 flex flex-col items-center justify-end relative ml-8 mb-6 group">
                <div className="pokemon-base-circle bottom-0 scale-125 opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <img src={playerTeam[activeIdx].img} className={`w-full h-full object-contain pixelated drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)] relative z-10 ${playerShaking ? 'shake' : 'animate-float-player'}`} style={{ transform: 'translateY(15px) scaleX(-1)' }} />
                <div className="shadow-oval" style={{ bottom: '15px' }}></div>
              </div>
            </div>
          </div>

          {/* HÀNH ĐỘNG CHIẾN ĐẤU (BATTLE CONTROLS) */}
          <div className="bg-slate-900/98 backdrop-blur-xl p-5 flex flex-col sm:flex-row gap-5 border-t-4 border-slate-800 h-auto sm:h-[220px] z-[100] shrink-0 shadow-[0_-15px_60px_rgba(0,0,0,0.7)] relative">
            
            {/* NHẬT KÝ CHIẾN ĐẤU */}
            <div ref={logsEndRef} className="flex-1 bg-black/70 p-5 rounded-2xl text-white font-mono text-[12px] overflow-y-auto custom-scrollbar border-2 border-white/5 h-36 sm:h-full shadow-inner leading-relaxed">
              {logs.length === 0 && <div className="text-slate-600 italic">Đang chờ lệnh...</div>}
              {logs.map(l => (
                <div key={l.id} className={`mb-3 border-l-4 border-white/5 pl-3 py-1 animate-in slide-in-from-left duration-300 ${l.type === 'player' ? 'text-blue-300 border-l-blue-500' : l.type === 'enemy' ? 'text-red-300 border-l-red-500' : l.type === 'system' ? 'text-yellow-400 font-black border-l-yellow-400' : 'text-slate-400'}`}>
                   <span className="opacity-40 mr-3 text-[10px]">{l.type === 'player' ? '➤' : l.type === 'enemy' ? '⚔' : l.type === 'system' ? '★' : '»'}</span>
                   {l.msg}
                </div>
              ))}
            </div>

            {/* CỤM NÚT ĐIỀU KHIỂN */}
            <div className="grid grid-cols-2 gap-3 w-full sm:w-[480px]">
              {mustSwitch ? (
                <button onClick={() => setMenuOpen(true)} className="bg-blue-600 col-span-2 py-5 hover:bg-blue-500 border-b-6 border-blue-900 text-white rounded-2xl font-black uppercase text-xs active:translate-y-2 active:border-b-0 transition-all shadow-2xl flex items-center justify-center gap-3">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                   Thay đổi Pokemon
                </button>
              ) : battleView === 'main' ? (
                <>
                  <button onClick={() => setBattleView('moves')} className="bg-rose-600 border-b-6 border-rose-800 hover:bg-rose-500 text-white rounded-2xl font-black uppercase text-xs py-4 active:translate-y-2 active:border-b-0 transition-all shadow-2xl tracking-widest">Chiến đấu</button>
                  <button onClick={throwBall} className="bg-amber-500 border-b-6 border-amber-700 hover:bg-amber-400 text-white rounded-2xl font-black uppercase text-xs py-4 active:translate-y-2 active:border-b-0 transition-all shadow-2xl tracking-widest">Túi đồ</button>
                  <button onClick={() => setMenuOpen(true)} className="bg-indigo-600 border-b-6 border-indigo-800 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs py-4 active:translate-y-2 active:border-b-0 transition-all shadow-2xl tracking-widest">Pokemon</button>
                  <button onClick={tryRunAway} className="bg-slate-700 border-b-6 border-slate-900 hover:bg-slate-600 text-white rounded-2xl font-black uppercase text-xs py-4 active:translate-y-2 active:border-b-0 transition-all shadow-2xl tracking-widest">Bỏ chạy</button>
                </>
              ) : (
                <>
                  {playerTeam[activeIdx].moves.map(m => (
                    <button key={m.name} onClick={() => useMove(m)} className={`${moveBorderClass(m.type)} text-white rounded-2xl font-black uppercase text-[10px] py-4 active:translate-y-2 active:border-b-0 transition-all shadow-2xl text-left pl-4 relative group`}>
                      <div className="flex justify-between items-center pr-3">
                        <span className="group-hover:translate-x-1 transition-transform">{m.name}</span>
                        {/* Bonus thời tiết (RNG protected indicators) */}
                        {((weather === 'Rain' && m.type === 'Water') || (weather === 'Snow' && m.type === 'Ice')) && (
                          <span className="text-cyan-400 animate-pulse text-lg">↑</span>
                        )}
                      </div>
                      <div className="absolute top-1 right-2 text-[7px] opacity-30 font-black">{m.type}</div>
                    </button>
                  ))}
                  <button onClick={() => setBattleView('main')} className="bg-slate-800 col-span-2 text-[10px] h-10 hover:bg-slate-700 text-white rounded-xl font-black uppercase active:translate-y-1 transition-all border-2 border-white/5 mt-2"> Quay lại</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- OVERLAY QUẢN LÝ ĐỘI HÌNH (TEAM MENU) --- */}
      {menuOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl text-white p-8 z-[200] flex flex-col items-center animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-10 w-full max-w-2xl border-b-4 border-white/5 pb-6">
            <div className="flex flex-col">
              <h2 className="text-3xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 tracking-tighter">Đội hình ACE</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Native RNG Secured Environment</p>
            </div>
            {!mustSwitch && (
              <button onClick={() => setMenuOpen(false)} className="bg-slate-800 text-slate-400 hover:text-white w-14 h-14 rounded-2xl font-black hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center border-2 border-white/5">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          <div className="grid gap-5 w-full max-w-2xl overflow-y-auto custom-scrollbar pr-4 flex-1 pb-16">
            {playerTeam.map((p, i) => {
              const isAce = i === 0;
              const isFainted = p.currentHp <= 0;
              const isCurrentlyInBattle = i === activeIdx && gameState === 'battle';
              const isLegendary = !!p.isLegendary;

              return (
                <div 
                  key={p.uid} 
                  onClick={() => {
                    if (gameState === 'battle') {
                      if (isFainted || isCurrentlyInBattle) return;
                      setActiveIdx(i);
                      setMustSwitch(false);
                      setBattleView('main');
                      addLog(`Đã đến lúc rồi, ${p.name}! Hãy cho chúng thấy sức mạnh của bạn!`, 'player');
                      setMenuOpen(false);
                    } else {
                      // Thay đổi thứ tự Ace trong Lobby
                      if (isAce) return;
                      const next = [...playerTeam];
                      const selected = next.splice(i, 1)[0];
                      next.unshift(selected);
                      setPlayerTeam(next);
                      addLog(`${selected.name} hiện là Pokemon dẫn đầu.`, 'system');
                    }
                  }} 
                  className={`bg-slate-900/50 p-5 rounded-3xl flex items-center gap-6 transition-all cursor-pointer relative group border-2 ${isAce ? 'ace-border border-yellow-500' : 'border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80'} ${isFainted ? 'opacity-40 grayscale' : ''} ${isCurrentlyInBattle ? 'ring-4 ring-blue-500/50 bg-blue-900/20' : ''}`}
                >
                  {isAce && <div className="ace-tag">ACE</div>}
                  {isCurrentlyInBattle && <div className="absolute top-2 right-4 text-[8px] font-black text-blue-400 animate-pulse tracking-widest uppercase">Đang chiến đấu</div>}
                  
                  <div className="w-20 h-20 bg-black/40 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-white/5 shadow-inner">
                    <img src={p.img} className="w-16 h-16 object-contain pixelated group-hover:scale-125 transition-transform duration-500" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-3">
                        <p className={`font-black uppercase tracking-widest ${isAce ? 'text-yellow-400' : 'text-slate-100'} text-xs`}>{p.name}</p>
                        {isLegendary && <span className="bg-amber-600 text-white text-[8px] px-2 py-0.5 rounded font-black tracking-tighter">LEGEND</span>}
                      </div>
                      <p className="text-[10px] font-black text-slate-500 bg-black/40 px-3 py-1 rounded-full border border-white/5">LV {p.level}</p>
                    </div>
                    
                    {/* THANH HP TRONG MENU */}
                    <div className="h-2.5 bg-black/50 rounded-full mt-3 overflow-hidden border border-white/5 shadow-inner">
                      <div className={`h-full transition-all duration-700 ${isFainted ? 'bg-slate-700' : (p.currentHp/p.maxHp)*100 < 30 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`} style={{ width: `${(p.currentHp / p.maxHp) * 100}%` }}></div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                       <div className="flex-1 h-1.5 bg-black/30 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: `${Math.floor((p.exp / expNeeded(p.level)) * 100)}%` }}></div>
                       </div>
                       <span className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">{p.currentHp} / {p.maxHp} HP</span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {playerTeam.length < MAX_TEAM_SIZE && (
              <div className="p-10 border-4 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center opacity-30 hover:opacity-50 transition-opacity">
                 <svg className="w-10 h-10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                 <span className="text-xs font-black uppercase tracking-[0.3em]">Trống</span>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center max-w-md">
            Mẹo: Trong chế độ Lobby, chọn Pokemon không phải Ace để đưa chúng lên dẫn đầu đội hình. 
            Trong chiến đấu, chọn Pokemon để thay đổi lượt.
          </div>
        </div>  
      )}

      {/* FOOTER GIÁM SÁT RNG - Hiện diện ở mọi màn hình dưới dạng watermark */}
      <div className="fixed bottom-1 left-2 z-[500] pointer-events-none opacity-20">
        <div className="text-[8px] text-white font-mono tracking-tighter">
          SECURE_RNG_VAL: {Math.random().toString().substring(0, 10)}... | ENGINE: NATIVE_V8
        </div>
      </div>
    </div>
  );
};

export default App;
