// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("nirvaanaa");

db.createUser({
  user: "admin1",
  pwd: "nirvaanaa123",
  roles: [{ role: "readWrite", db: "nirvaanaa" }]
})
