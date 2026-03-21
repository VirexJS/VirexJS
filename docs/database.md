# Database

VirexJS includes a built-in SQLite ORM via `@virexjs/db`. Zero dependencies, typed CRUD, SQL injection protection.

## Define a Table

```ts
import { defineTable } from "@virexjs/db";

const posts = defineTable("posts", {
  id: "integer primary key autoincrement",
  title: "text not null",
  slug: "text not null unique",
  content: "text not null default ''",
  published: "integer not null default 0",
  created_at: "text not null",
});
```

The table is auto-created on first use. Column names are validated — SQL injection is prevented.

## CRUD Operations

```ts
// Insert
const post = posts.insert({
  title: "Hello",
  slug: "hello",
  content: "World",
  published: 1,
  created_at: new Date().toISOString(),
});

// Find one
const found = posts.findOne({ slug: "hello" });

// Find many with pagination
const all = posts.findMany({
  where: { published: 1 },
  orderBy: "id DESC",
  limit: 10,
  offset: 0,
});

// Update
posts.update({ id: 1 }, { title: "Updated" });

// Delete
posts.delete({ id: 1 });

// Count
const total = posts.count({ published: 1 });
```

## Migrations

```ts
import { defineMigration, migrate, rollback, getMigrationStatus } from "@virexjs/db";

const m001 = defineMigration({
  version: "001",
  description: "Create users table",
  up: "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE)",
  down: "DROP TABLE users",
});

const m002 = defineMigration({
  version: "002",
  description: "Add avatar column",
  up: "ALTER TABLE users ADD COLUMN avatar TEXT",
  down: "ALTER TABLE users DROP COLUMN avatar",
});

// Apply all pending
const result = migrate([m001, m002]);
console.log(`Applied: ${result.applied.join(", ")}`);

// Rollback last migration
rollback([m001, m002], 1);

// Check status
const status = getMigrationStatus([m001, m002]);
console.log(`Current: ${status.current}, Pending: ${status.pending.join(", ")}`);
```

## Security

- Column names validated against schema whitelist
- ORDER BY sanitized (only known columns + ASC/DESC)
- All values use prepared statement bindings
- `validateIdentifier()` rejects non-alphanumeric names
