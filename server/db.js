const mysql = require("mysql2/promise");
const { seedApprovals, seedRecords } = require("./seedData");

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
      stage VARCHAR(40) NOT NULL,
      title VARCHAR(255) NOT NULL,
      summary TEXT NOT NULL,
      status VARCHAR(120) NOT NULL,
      review_status VARCHAR(120) NOT NULL,
      owner VARCHAR(120) DEFAULT '',
      path VARCHAR(255) NOT NULL,
      next_action TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS approvals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      record_id INT NOT NULL,
      record_title VARCHAR(255) NOT NULL,
      gate_type VARCHAR(80) NOT NULL,
      reviewer_role VARCHAR(120) NOT NULL,
      status VARCHAR(120) NOT NULL,
      prompt TEXT NOT NULL,
      decision_note TEXT DEFAULT '',
      reviewer VARCHAR(120) DEFAULT '',
      approved_on DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_approvals_record
        FOREIGN KEY (record_id) REFERENCES records(id)
        ON DELETE CASCADE
    )
  `);

  const [recordCountRows] = await pool.query("SELECT COUNT(*) AS count FROM records");
  if (recordCountRows[0].count > 0) {
    return;
  }

  const insertedRecordIds = [];
  for (const record of seedRecords) {
    const [result] = await pool.query(
      `
        INSERT INTO records (stage, title, summary, status, review_status, owner, path, next_action)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        record.stage,
        record.title,
        record.summary,
        record.status,
        record.reviewStatus,
        record.owner,
        record.path,
        record.nextAction
      ]
    );

    insertedRecordIds.push(result.insertId);
  }

  for (const approval of seedApprovals) {
    const matchingRecordIndex = seedRecords.findIndex(
      (record) => record.title === approval.recordTitle
    );
    const recordId = insertedRecordIds[matchingRecordIndex];

    await pool.query(
      `
        INSERT INTO approvals (record_id, record_title, gate_type, reviewer_role, status, prompt)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        recordId,
        approval.recordTitle,
        approval.gateType,
        approval.reviewerRole,
        approval.status,
        approval.prompt
      ]
    );
  }
}

module.exports = {
  createPool,
  initializeDatabase
};
