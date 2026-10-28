export class ApiError extends Error {constructor(status,message){super(message);this.status=status;}}
export function ensure(condition,message,status=400){if(!condition)throw new ApiError(status,message);}
export function text(value,label='Value',min=1,max=500){ensure(typeof value==='string'&&value.trim().length>=min&&value.trim().length<=max,`${label} must contain ${min}–${max} characters`);return value.trim();}
export function optional(value,label,max=500){return value===undefined?'':text(value,label,0,max);}
export function integer(value,label,min=0,max=100_000_000_000){ensure(Number.isSafeInteger(value)&&value>=min&&value<=max,`${label} must be an integer between ${min} and ${max}`);return value;}
export function choice(value,values,label){ensure(values.includes(value),`Invalid ${label}`);return value;}
export function email(value){const result=text(value,'Email',3,254).toLowerCase();ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result),'Invalid email');return result;}
export function date(value){ensure(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&value>='2000-01-01'&&value<='2100-12-31','Invalid date');const parsed=new Date(value+'T00:00:00Z');ensure(!Number.isNaN(parsed.valueOf())&&parsed.toISOString().slice(0,10)===value,'Invalid calendar date');return value;}
export function month(value){ensure(typeof value==='string'&&/^20\d{2}-(0[1-9]|1[0-2])$/.test(value),'Invalid month');return value;}
export const today=()=>new Date().toISOString().slice(0,10);
