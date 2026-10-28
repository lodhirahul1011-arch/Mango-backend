import {randomBytes,randomUUID,createHash,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {ensure,email,text} from './validation.js';
const scrypt=promisify(scryptCallback);
const hash=value=>createHash('sha256').update(value).digest('hex');
const publicUser=u=>({id:u.id,name:u.name,email:u.email,role:u.role});
export function createAuth(store){
  const {db}=store;
  function issue(user,sessionId){
    const accessToken=randomBytes(32).toString('hex'),refreshToken=randomBytes(48).toString('hex');
    db.prepare('DELETE FROM sessions WHERE refresh_expires < ?').run(Date.now());
    db.prepare('INSERT OR REPLACE INTO sessions VALUES (?,?,?,?,?,?)').run(sessionId||randomUUID(),user.id,hash(accessToken),hash(refreshToken),Date.now()+15*60_000,Date.now()+7*86400_000);
    return {accessToken,refreshToken,role:user.role,organizationId:user.organization_id,user:publicUser(user)};
  }
  return {
    async register(body,role){
      const name=text(body.name,'Name',2,120),mail=email(body.email),password=text(body.password,'Password',10,128);
      const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64);
      return store.transaction(()=>{
        ensure(!db.prepare('SELECT id FROM users WHERE email=?').get(mail),'Email already registered',409);
        const id=randomUUID(),org=role==='owner'?randomUUID():null;
        db.prepare('INSERT INTO users VALUES (?,?,?,?,?,?)').run(id,mail,name,`${salt}:${key.toString('hex')}`,role,org);
        return {user:{id,name,email:mail,role}};
      });
    },
    async login(body){
      const mail=email(body.email),password=text(body.password,'Password',1,128);
      const user=db.prepare('SELECT * FROM users WHERE email=?').get(mail);
      const [salt,expected]=(user?.password||'00000000000000000000000000000000:'+ '00'.repeat(64)).split(':');
      const actual=await scrypt(password,salt,64);
      ensure(user&&timingSafeEqual(actual,Buffer.from(expected,'hex')),'Invalid email or password',401);
      return issue(user);
    },
    authenticate(req){
      const token=req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
      ensure(token,'Sign in required',401);
      const session=db.prepare('SELECT * FROM sessions WHERE access_hash=? AND access_expires>?').get(hash(token),Date.now());
      ensure(session,'Session expired; sign in again',401);
      const user=db.prepare('SELECT * FROM users WHERE id=?').get(session.user_id);
      return {...publicUser(user),organizationId:user.organization_id,sessionId:session.id};
    },
    refresh(body){
      const token=text(body.refreshToken,'Refresh token',96,96);
      return store.transaction(()=>{
        const session=db.prepare('SELECT * FROM sessions WHERE refresh_hash=? AND refresh_expires>?').get(hash(token),Date.now());
        ensure(session,'Refresh session expired',401);
        const user=db.prepare('SELECT * FROM users WHERE id=?').get(session.user_id);
        return issue(user,session.id);
      });
    },
    logout(actor){db.prepare('DELETE FROM sessions WHERE id=?').run(actor.sessionId);}
  };
}
