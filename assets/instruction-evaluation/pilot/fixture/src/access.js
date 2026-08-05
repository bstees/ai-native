function canAccess(user, document) {
  return user.organizationId === document.organizationId;
}

module.exports = { canAccess };
