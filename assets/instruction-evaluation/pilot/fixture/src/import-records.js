async function importRecord(database, record, options = {}) {
  const attempts = options.attempts || 2;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await database.insert({
        externalId: record.externalId,
        name: record.name
      });
      await database.markImported(record.externalId);
      return;
    } catch (error) {
      if (attempt === attempts) throw error;
    }
  }
}

module.exports = { importRecord };
