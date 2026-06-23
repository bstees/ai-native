const { createPool, initializeDatabase } = require("./db");

function mapRecord(row) {
  return {
    id: row.id,
    stage: row.stage,
    path: row.path,
    title: row.title,
    summary: row.summary,
    status: row.status,
    reviewStatus: row.review_status,
    owner: row.owner,
    nextAction: row.next_action
  };
}

function mapApproval(row) {
  return {
    id: row.id,
    recordPath: row.record_path,
    recordTitle: row.record_title,
    gateType: row.gate_type,
    reviewerRole: row.reviewer_role,
    status: row.status,
    prompt: row.prompt,
    reviewer: row.reviewer,
    decisionNote: row.decision_note,
    approvedOn: row.approved_on
  };
}

class MemoryStore {
  constructor(seed) {
    this.records = seed.records.map((record, index) => ({ ...record, id: index + 1 }));
    this.approvals = seed.approvals.map((approval, index) => ({ ...approval, id: index + 1 }));
  }

  async sync(seed) {
    this.records = seed.records.map((record, index) => {
      const existing = this.records.find((candidate) => candidate.path === record.path);
      return existing
        ? {
            ...record,
            id: existing.id,
            status: existing.status,
            reviewStatus: existing.reviewStatus,
            nextAction: existing.nextAction
          }
        : { ...record, id: index + 1 };
    });

    this.approvals = seed.approvals.map((approval, index) => {
      const existing = this.approvals.find(
        (candidate) => candidate.recordPath === approval.recordPath && candidate.gateType === approval.gateType
      );
      return existing
        ? {
            ...approval,
            id: existing.id,
            status: existing.status,
            reviewer: existing.reviewer,
            decisionNote: existing.decisionNote,
            approvedOn: existing.approvedOn
          }
        : { ...approval, id: index + 1 };
    });
  }

  async getRecords() {
    return this.records;
  }

  async getPendingApprovals() {
    return this.approvals.filter((approval) => approval.status === "pending-human-review");
  }

  async updateRecord(id, updates) {
    this.records = this.records.map((record) =>
      String(record.id) === String(id) ? { ...record, ...updates } : record
    );
  }

  async decideApproval(id, { status, reviewer, note }) {
    const approval = this.approvals.find((candidate) => String(candidate.id) === String(id));
    if (!approval) {
      return null;
    }

    approval.status = status;
    approval.reviewer = reviewer || "";
    approval.decisionNote = note || "";
    approval.approvedOn = status === "approved" ? new Date().toISOString() : null;

    const record = this.records.find((candidate) => candidate.path === approval.recordPath);
    if (record) {
      record.reviewStatus = status === "approved" ? "approved" : "draft";
      record.nextAction =
        status === "approved"
          ? "Pilot approved. Apply the asset in the consumer repo and capture feedback."
          : "Pilot deferred. Review concerns and update the rollout record before retrying.";
    }

    return approval;
  }
}

class MysqlStore {
  constructor(pool) {
    this.pool = pool;
  }

  async sync(seed) {
    for (const record of seed.records) {
      await this.pool.query(
        `
          INSERT INTO records (stage, path, title, summary, status, review_status, owner, next_action)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            stage = VALUES(stage),
            title = VALUES(title),
            summary = VALUES(summary),
            owner = VALUES(owner)
        `,
        [
          record.stage,
          record.path,
          record.title,
          record.summary,
          record.status,
          record.reviewStatus,
          record.owner,
          record.nextAction
        ]
      );
    }

    for (const approval of seed.approvals) {
      const [recordRows] = await this.pool.query("SELECT id, title FROM records WHERE path = ?", [
        approval.recordPath
      ]);
      if (!recordRows.length) {
        continue;
      }

      await this.pool.query(
        `
          INSERT INTO approvals (record_id, record_path, record_title, gate_type, reviewer_role, status, prompt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            record_title = VALUES(record_title),
            reviewer_role = VALUES(reviewer_role),
            prompt = VALUES(prompt)
        `,
        [
          recordRows[0].id,
          approval.recordPath,
          approval.recordTitle || recordRows[0].title,
          approval.gateType,
          approval.reviewerRole,
          approval.status,
          approval.prompt
        ]
      );
    }
  }

  async getRecords() {
    const [rows] = await this.pool.query(
      `
        SELECT id, stage, path, title, summary, status,
               review_status, owner, next_action
        FROM records
        ORDER BY FIELD(stage, 'signals', 'decisions', 'assets', 'pilots'), title ASC
      `
    );
    return rows.map(mapRecord);
  }

  async getPendingApprovals() {
    const [rows] = await this.pool.query(
      `
        SELECT id, record_path, record_title, gate_type,
               reviewer_role, status, prompt, reviewer,
               decision_note, approved_on
        FROM approvals
        WHERE status = 'pending-human-review'
        ORDER BY id ASC
      `
    );
    return rows.map(mapApproval);
  }

  async updateRecord(id, updates) {
    await this.pool.query(
      `
        UPDATE records
        SET status = ?, review_status = ?, next_action = ?
        WHERE id = ?
      `,
      [updates.status, updates.reviewStatus, updates.nextAction, id]
    );
  }

  async decideApproval(id, { status, reviewer, note }) {
    const approvedOn = status === "approved" ? new Date() : null;
    const [approvalRows] = await this.pool.query(
      "SELECT record_id AS recordId FROM approvals WHERE id = ?",
      [id]
    );

    if (!approvalRows.length) {
      return null;
    }

    await this.pool.query(
      `
        UPDATE approvals
        SET status = ?, reviewer = ?, decision_note = ?, approved_on = ?
        WHERE id = ?
      `,
      [status, reviewer || "", note || "", approvedOn, id]
    );

    const reviewStatus = status === "approved" ? "approved" : "draft";
    const nextAction =
      status === "approved"
        ? "Pilot approved. Apply the asset in the consumer repo and capture feedback."
        : "Pilot deferred. Review concerns and update the rollout record before retrying.";

    await this.pool.query(
      `
        UPDATE records
        SET review_status = ?, next_action = ?
        WHERE id = ?
      `,
      [reviewStatus, nextAction, approvalRows[0].recordId]
    );

    return { id, status };
  }
}

async function createStore(seed) {
  if ((process.env.DB_MODE || "memory") === "memory") {
    return new MemoryStore(seed);
  }

  const pool = await createPool();
  await initializeDatabase(pool);
  return new MysqlStore(pool);
}

module.exports = {
  createStore
};
