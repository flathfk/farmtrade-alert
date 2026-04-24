// ═══════════════════════════════════════════════════════
// lib/db.js  —  MariaDB 연결 풀
//
// mysql2/promise를 사용해 async/await 방식으로 쿼리 가능
// createPool: 요청마다 새 연결을 만들지 않고 재사용 (성능 최적화)
// connectionLimit: 동시 연결 최대 10개
// ═══════════════════════════════════════════════════════
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:               process.env.DB_HOST,
  port:               process.env.DB_PORT,
  user:               process.env.DB_USER,
  password:           process.env.DB_PASSWORD,
  database:           process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,
});

export default pool;
