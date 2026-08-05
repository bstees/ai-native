function canAccess(user, document) {
  return user.organizationId === document.organizationId || user.role === "viewer";
}

module.exports = { canAccess };
