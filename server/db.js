const mysql = require("mysql2/promise");

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createPool() {
  const config = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "ai_native",
    password: process.env.DB_PASSWORD || "ai_native",
    database: process.env.DB_NAME || "ai_native",
    waitForConnections: true,
    connectionLimit: 10
  };

  let lastError;

  for (let attempt = 1; attempt <= 15; attempt += 1) {
    try {
      const pool = mysql.createPool(config);
      await pool.query("SELECT 1");
      return pool;
    } catch (error) {
      lastError = error;
      await wait(2000);
    }
  }

  throw lastError;
}

async function initializeDatabase(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      path VARCHAR(255) NOT NULL UNIQUE,
      stage VARCHAR(40) NOT NULL,
      title VARCHAR(255) NOT NULL,
      summary TEXT NOT NULL,
      status VARCHAR(120) NOT NULL,
      review_status VARCHAR(120) NOT NULL,
      owner VARCHAR(120) DEFAULT '',
      next_action TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS approvals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      record_id INT NOT NULL,
      record_path VARCHAR(255) NOT NULL,
      record_title VARCHAR(255) NOT NULL,
      gate_type VARCHAR(80) NOT NULL,
      reviewer_role VARCHAR(120) NOT NULL,
      status VARCHAR(120) NOT NULL,
      prompt TEXT NOT NULL,
      decision_note TEXT,
      reviewer VARCHAR(120) DEFAULT '',
      approved_on DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_record_gate (record_path, gate_type),
      CONSTRAINT fk_approvals_record
        FOREIGN KEY (record_id) REFERENCES records(id)
        ON DELETE CASCADE
    )
  `);
}

module.exports = {
  createPool,
  initializeDatabase
};
