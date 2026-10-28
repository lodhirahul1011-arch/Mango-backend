import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {randomUUID} from 'node:crypto';

export function openStore(filename) {
  if (filename !== ':memory:') mkdirSync(dirname(filename), {recursive:true});
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
      password TEXT NOT NULL, role TEXT NOT NULL, organization_id TEXT);
    CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
      access_hash TEXT UNIQUE NOT NULL, refresh_hash TEXT UNIQUE NOT NULL, access_expires INTEGER NOT NULL, refresh_expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, resource TEXT NOT NULL, organization_id TEXT NOT NULL, body TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS records_scope ON records(resource, organization_id);
    CREATE TABLE IF NOT EXISTS files (id TEXT PRIMARY KEY REFERENCES records(id), content BLOB NOT NULL);
    CREATE TABLE IF NOT EXISTS audit (id TEXT PRIMARY KEY, actor_id TEXT NOT NULL, action TEXT NOT NULL, occurred_at TEXT NOT NULL);
    PRAGMA user_version=1;`);
  return {
    db,
    all(resource, org) {
      const rows = org === undefined ? db.prepare('SELECT body FROM records WHERE resource=? ORDER BY rowid').all(resource)
        : db.prepare('SELECT body FROM records WHERE resource=? AND organization_id=? ORDER BY rowid').all(resource,org);
      return rows.map(r=>JSON.parse(r.body));
    },
    get(resource,id) {const r=db.prepare('SELECT body FROM records WHERE resource=? AND id=?').get(resource,id);return r?JSON.parse(r.body):null;},
    add(resource,org,data) {
      const id=randomUUID();const record={...data,id,_id:id,organizationId:org,createdAt:new Date().toISOString()};
      db.prepare('INSERT INTO records VALUES (?,?,?,?)').run(id,resource,org,JSON.stringify(record));return record;
    },
    save(resource,record) {db.prepare('UPDATE records SET body=? WHERE resource=? AND id=?').run(JSON.stringify(record),resource,record.id);return record;},
    remove(resource,id) {db.prepare('DELETE FROM records WHERE resource=? AND id=?').run(resource,id);},
    transaction(fn) {db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}},
    audit(actor,action) {db.prepare('INSERT INTO audit VALUES (?,?,?,?)').run(randomUUID(),actor.id,action,new Date().toISOString());},
    close(){db.close();}
  };
}
