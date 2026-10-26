import {useState} from 'react';
import type {Bill, Category, Debt, Frequency, Income} from '../types';
import {categories, frequencies, makeId, today} from '../lib/money';
import {Modal} from './Ui';

type Mode = {kind: 'bill'; item?: Bill} | {kind: 'debt'; item?: Debt} | {kind: 'income'; item?: Income} | {kind: 'payment'; item: Debt};
type FormProps = {mode: Mode; close: () => void; save: (mode: Mode, values: Record<string, string>) => void};
const Input = ({label,name,value,onChange,type='text',required=true,min,max,step}: {label:string;name:string;value:string;onChange:(name:string,value:string)=>void;type?:string;required?:boolean;min?:string;max?:string;step?:string}) => <label className="form-field"><span className="control-label">{label}</span><input name={name} value={value} onChange={e=>onChange(name,e.target.value)} type={type} required={required} min={min} max={max} step={step} /></label>;
const Select = ({label,name,value,choices,onChange}:{label:string;name:string;value:string;choices:Record<string,string>;onChange:(name:string,value:string)=>void}) => <label className="form-field"><span className="control-label">{label}</span><select name={name} value={value} onChange={e=>onChange(name,e.target.value)}>{Object.entries(choices).map(([id,text])=><option key={id} value={id}>{text}</option>)}</select></label>;

export function FinanceForm({mode, close, save}: FormProps) {
  const item = mode.item;
  const initial: Record<string,string> = (() => {
    if(mode.kind === 'bill') {
      const b = mode.item;
      return {name:b?.name||'',amount:String(b?.amount??''),category:b?.category||'Home',frequency:b?.frequency||'monthly',nextDue:b?.nextDue||today()};
    }
    if(mode.kind === 'debt') {
      const d = mode.item;
      return {name:d?.name||'',balance:String(d?.balance??''),originalBalance:String(d?.originalBalance??''),apr:String(d?.apr??''),minPayment:String(d?.minPayment??''),promoEnd:d?.promoEnd||''};
    }
    if(mode.kind === 'income') {
      const i = mode.item;
      return {name:i?.name||'',amount:String(i?.amount??''),frequency:i?.frequency||'monthly'};
    }
    return {amount:'',date:today()};
  })() as unknown as Record<string, string>;
  const [values, setValues] = useState<Record<string,string>>(initial);
  const update = (name:string,value:string)=>setValues(v=>({...v,[name]:value}));
  const title = mode.kind === 'payment' ? `Record payment — ${mode.item.name}` : `${item?'Edit':'Add'} ${mode.kind}`;
  const submit = (e: React.FormEvent) => {e.preventDefault();save(mode,values);};
  return <Modal title={title} onClose={close}><form onSubmit={submit} className="finance-form">
    {mode.kind === 'bill' && <><Input label="Bill name" name="name" value={values.name} onChange={update}/><div className="form-grid"><Input label="Amount (£)" type="number" name="amount" value={values.amount} onChange={update} min="0" max="10000000000" step="0.01"/><Select label="Category" name="category" value={values.category} onChange={update} choices={Object.fromEntries(categories.map(x=>[x,x])) as Record<Category,string>}/></div><div className="form-grid"><Select label="Repeat" name="frequency" value={values.frequency} onChange={update} choices={frequencies}/><Input label="Next due date" type="date" name="nextDue" value={values.nextDue} onChange={update}/></div></>}
    {mode.kind === 'income' && <><Input label="Income name" name="name" value={values.name} onChange={update}/><div className="form-grid"><Input label="Amount (£)" type="number" name="amount" value={values.amount} onChange={update} min="0" max="10000000000" step="0.01"/><Select label="How often" name="frequency" value={values.frequency} onChange={update} choices={frequencies}/></div></>}
    {mode.kind === 'debt' && <><Input label="Lender or debt name" name="name" value={values.name} onChange={update}/><div className="form-grid"><Input label="Outstanding balance (£)" type="number" name="balance" value={values.balance} onChange={update} min="0" max="10000000000" step="0.01"/><Input label="Starting balance (£)" type="number" name="originalBalance" value={values.originalBalance} onChange={update} min="0" max="10000000000" step="0.01" required={false}/></div><div className="form-grid"><Input label="APR after promotion (%)" type="number" name="apr" value={values.apr} onChange={update} min="0" max="100" step="0.01"/><Input label="Minimum per month (£)" type="number" name="minPayment" value={values.minPayment} onChange={update} min="0" max="10000000000" step="0.01"/></div><Input label="0% promotional end date (optional)" type="date" name="promoEnd" value={values.promoEnd} onChange={update} required={false}/></>}
    {mode.kind === 'payment' && <><p className="form-hint">This reduces the outstanding balance you entered. It doesn't contact the lender or pay any money.</p><Input label="Amount paid (£)" type="number" name="amount" value={values.amount} onChange={update} min="0.01" max={String(mode.item.balance)} step="0.01"/><Input label="Date paid" type="date" name="date" value={values.date} onChange={update}/></>}
    <div className="form-actions"><button type="button" onClick={close} className="btn btn-secondary">Cancel</button><button className="btn btn-primary" type="submit">{mode.kind==='payment'?'Record payment': item ? 'Save changes' : 'Add to Billora'}</button></div>
  </form></Modal>;
}
export type {Mode};
export function newEntityId(){return makeId();}
export function readCategory(x:string):Category{return categories.includes(x as Category)?x as Category:'Other';}
export function readFrequency(x:string):Frequency{return x in frequencies?x as Frequency:'monthly';}
