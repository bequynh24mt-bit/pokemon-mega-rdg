
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * BACKEND SERVERLESS
 * File này chạy trên server của Vercel, mã nguồn không bị lộ ra client.
 */
const ENGINE_CONFIG = {
  SPAWN_RATE: 0.15, // Tỉ lệ xuất hiện huyền thoại (15%)
  LEGENDARY_MULTIPLIER: 3.5, // Buff sức mạnh huyền thoại
  ANTI_TAMPER_SALT: "secure_v1_2024"
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Trả về các thông số nhạy cảm một cách an toàn
  return res.status(200).json({
    spawnRate: ENGINE_CONFIG.SPAWN_RATE,
    multipliers: {
      hp: ENGINE_CONFIG.LEGENDARY_MULTIPLIER,
      atk: ENGINE_CONFIG.LEGENDARY_MULTIPLIER
    },
    status: "active"
  });
}
