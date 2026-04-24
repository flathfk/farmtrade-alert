// ═══════════════════════════════════════════════════════
// lib/auth.js  —  Route Handler 인증 미들웨어
//
// Authorization: Bearer <token> 헤더에서 토큰을 추출해 검증
// 유효하면 유저 정보(id, username, email) 반환
// 실패하면 null 반환 → 각 Route Handler에서 null 체크 후 401 처리
// ═══════════════════════════════════════════════════════
import { verifyToken } from '@/lib/jwt';

export function getUser(request) {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try {
    return verifyToken(auth.split(' ')[1]);
  } catch {
    // 토큰 만료 또는 위조된 경우
    return null;
  }
}
