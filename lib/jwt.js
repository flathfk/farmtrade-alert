// ═══════════════════════════════════════════════════════
// lib/jwt.js  —  JWT 토큰 발급 / 검증 유틸
//
// signToken : 로그인 성공 시 유저 정보를 암호화해 토큰 발급 (24시간 유효)
// verifyToken: 요청마다 토큰 유효성 검사 — 만료/위조 시 에러 throw
// ═══════════════════════════════════════════════════════
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '24h' });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
