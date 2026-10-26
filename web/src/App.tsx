import {useEffect, useState} from 'react';
import type {Bill, Debt, FinanceData, Income, Page} from './types';
import {advanceBill, makeId, pounds, round, today} from './lib/money';
import {initialData, saveData} from './lib/storage';
import {Icon} from './components/Icons';
import {FinanceForm, newEntityId, readCategory, readFrequency} from './components/FinanceForm';
import type {Mode} from './components/FinanceForm';
import {Overview} from './pages/Overview';
import {Bills} from './pages/Bills';
import {Debts} from './pages/Debts';
import {Planner} from './pages/Planner';
import {Settings} from './pages/Settings';
const pages: Record<Page,{name:string,short:string,icon:string}> = {
  overview:{name:'Overview',short:'Home',icon:'overview'},bills:{name:'My bills',short:'Bills',icon:'calendar'},debts:{name:'My debts',short:'Debts',icon:'card'},planner:{name:'Debt-free planner',short:'Planner',icon:'trend'},settings:{name:'Settings & income',short:'Settings',icon:'settings'},
};
const pageFromHash = ():Page => window.location.hash.slice(1) in pages ? window.location.hash.slice(1) as Page : 'overview';
export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [data, setData] = useState<FinanceData>(initialData);
  const [mode, setMode] = useState<Mode | null>(null);
  const [toast, setToast] = useState('');
  const notify = (message:string) => {setToast(message);};
  useEffect(() => {
    const handler = () => setPage(pageFromHash());
    window.addEventListener('hashchange',handler);
    return () => window.removeEventListener('hashchange',handler);
  },[]);
  useEffect(() => {if (!saveData(data)) notify('Unable to save locally. Export a backup.');},[data]);
  useEffect(() => {if (!toast) return;const timer=window.setTimeout(()=>setToast(''),4200);return ()=>window.clearTimeout(timer);},[toast]);
  const update = (fn:(prev:FinanceData)=>FinanceData) => setData(current=>({...fn(current),mode:'personal'}));
  const navigate = (next:Page) => {window.location.hash=next;setPage(next);window.scrollTo({top:0,behavior:'smooth'});};
  const add = (kind:'bill'|'debt'|'income') => setMode({kind});
  const edit = (kind:'bill'|'debt'|'income',id:string) => {
    const item = kind === 'bill' ? data.bills.find(b=>b.id===id) : kind === 'debt' ? data.debts.find(d=>d.id===id) : data.incomes.find(i=>i.id===id);
    if (!item) return;
    if (kind === 'bill') setMode({kind,item:item as Bill});
    if (kind === 'debt') setMode({kind,item:item as Debt});
    if (kind === 'income') setMode({kind,item:item as Income});
  };
  const remove = (kind:'bill'|'debt'|'income',id:string) => {
    if (!window.confirm(`Delete this ${kind}? This can't be undone.`)) return;
    update(current => ({...current,bills:kind==='bill'?current.bills.filter(x=>x.id!==id):current.bills,debts:kind==='debt'?current.debts.filter(x=>x.id!==id):current.debts,incomes:kind==='income'?current.incomes.filter(x=>x.id!==id):current.incomes}));
    notify('Item deleted.');
  };
  const markBillPaid = (id:string) => {
    const bill = data.bills.find(b=>b.id===id);
    if (!bill || !window.confirm(`Record ${pounds(bill.amount)} paid for ${bill.name} (due ${bill.nextDue})?`)) return;
    update(current=>({...current,bills:current.bills.map(b=>b.id===id?{...b,payments:[...b.payments,{amount:b.amount,date:today(),due:b.nextDue}],nextDue:advanceBill(b)}:b)}));
    notify('Bill marked as paid.');
  };
  const submit = (openMode:Mode, raw:Record<string,string>) => {
    const money = (key:string) => round(Math.max(0,Number(raw[key])||0));
    const existing = openMode.item;
    if (openMode.kind==='bill') {
      const bill:Bill={id:existing?.id||newEntityId(),name:raw.name.trim().slice(0,100),amount:money('amount'),frequency:readFrequency(raw.frequency),category:readCategory(raw.category),nextDue:raw.nextDue,anchorDay:Number(raw.nextDue.slice(8)),payments:openMode.item?.payments||[]};
      update(prev=>({...prev,bills:existing?prev.bills.map(b=>b.id===bill.id?bill:b):[...prev.bills,bill]}));
    } else if (openMode.kind==='debt') {
      const balance = money('balance');
      const debt:Debt={id:existing?.id||makeId(),name:raw.name.trim().slice(0,100),balance,originalBalance:Math.max(balance,money('originalBalance')||balance),apr:Math.min(100,money('apr')),minPayment:money('minPayment'),promoEnd:raw.promoEnd||'',payments:openMode.item?.payments||[]};
      update(prev=>({...prev,debts:existing?prev.debts.map(d=>d.id===debt.id?debt:d):[...prev.debts,debt]}));
    } else if(openMode.kind==='income') {
      const income:Income={id:existing?.id||makeId(),name:raw.name.trim().slice(0,100),amount:money('amount'),frequency:readFrequency(raw.frequency)};
      update(prev=>({...prev,incomes:existing?prev.incomes.map(i=>i.id===income.id?income:i):[...prev.incomes,income]}));
    } else {
      const requested = money('amount');
      const payment = Math.min(openMode.item.balance,requested);
      if(payment <= 0) {notify('Enter a payment greater than £0.');return;}
      update(prev=>({...prev,debts:prev.debts.map(d=>d.id===openMode.item.id?{...d,balance:round(Math.max(0,d.balance-payment)),payments:[...d.payments,{amount:payment,date:raw.date||today()}]}:d)}));
    }
    notify(openMode.kind==='payment'?'Repayment recorded.':'Changes saved.');
    setMode(null);
  };
  const navButton = (id:Page,mobile=false) => <button key={id} className={`${mobile?'':'nav-item '} ${page===id?'is-active':''}`} onClick={()=>navigate(id)} aria-current={page===id?'page':undefined}><span className={mobile?'':'nav-icon'}><Icon name={pages[id].icon}/></span>{mobile?<small>{pages[id].short}</small>:pages[id].name}</button>;
  return <div className="app-shell">
    <aside className="sidebar" aria-label="Main menu"><button className="brand" type="button" onClick={()=>navigate('overview')}><span className="brand-icon"><Icon name="trend" size={26}/></span><span>billora<span className="brand-dot">.</span></span></button><div className="nav-intro">YOUR SPACE</div><nav className="nav-list">{(['overview','bills','debts','planner'] as Page[]).map(id=>navButton(id))}</nav><div className="nav-intro lower">PREFERENCES</div><nav className="nav-list">{navButton('settings')}</nav><div className="sidebar-bottom"><div className="help-card"><span className="help-sparkle">✦</span><strong>Small steps. Big progress.</strong><p>A little clarity today can change tomorrow.</p></div><div className="privacy-foot"><Icon name="shield"/> Local prototype · Not synced</div></div></aside>
    <main className="main"><header className="topbar"><div className="mobile-brand"><span className="mobile-logo">✳</span><strong>billora<span className="brand-dot">.</span></strong></div><div className="breadcrumb"><span>My workspace</span><span className="crumb-arrow">/</span><strong>{pages[page].name}</strong></div><div className="topbar-actions"><span className="demo-pill"><span/> Local demo</span><div className="user-avatar">B</div></div></header><div className="content" aria-live="polite">
      {page==='overview' && <Overview data={data} add={kind=>add(kind)} navigate={navigate}/>}
      {page==='bills' && <Bills data={data} add={()=>add('bill')} edit={id=>edit('bill',id)} remove={id=>remove('bill',id)} pay={markBillPaid}/>}
      {page==='debts' && <Debts data={data} add={()=>add('debt')} edit={id=>edit('debt',id)} remove={id=>remove('debt',id)} pay={id=>{const debt=data.debts.find(d=>d.id===id);if(debt)setMode({kind:'payment',item:debt});}}/>}
      {page==='planner' && <Planner data={data} onChange={settings=>update(prev=>({...prev,settings}))}/>}
      {page==='settings' && <Settings data={data} add={()=>add('income')} edit={id=>edit('income',id)} remove={id=>remove('income',id)} replace={setData} notify={notify}/>}
    </div></main>
    <nav className="mobile-nav" aria-label="Mobile menu">{(Object.keys(pages) as Page[]).map(id=>navButton(id,true))}</nav>
    {mode && <FinanceForm key={`${mode.kind}-${mode.item?.id||'new'}`} mode={mode} close={()=>setMode(null)} save={submit}/>}
    {toast && <div className="toast is-visible" role="status">{toast}</div>}
  </div>;
}
