import type {FinanceData} from '../types';
import {dateText, pounds, total} from '../lib/money';
import {Button, Empty, PageHeading} from '../components/Ui';
import {Icon} from '../components/Icons';
export function Debts({data,add,edit,remove,pay}: {data: FinanceData; add:()=>void;edit:(id:string)=>void;remove:(id:string)=>void;pay:(id:string)=>void}) {
  const remaining = total(data.debts.map(d => d.balance));
  const originals = total(data.debts.map(d => d.originalBalance));
  return <>
    <PageHeading eyebrow="Your path to financial freedom" title="My debts" description="See each balance, progress and monthly commitment."><Button onClick={add}><Icon name="plus"/> Add a debt</Button></PageHeading>
    <div className="debt-overview"><div className="debt-highlight"><div className="highlight-kicker">Total outstanding balance</div><div className="highlight-value">{pounds(remaining)}</div><div className="highlight-sub">Across {data.debts.length} debt account{data.debts.length === 1 ? '' : 's'}</div></div><div className="card panel debt-highlight-alt"><div className="highlight-kicker">Paid off so far</div><div className="highlight-value dark">{pounds(Math.max(0,originals-remaining))}</div><div className="highlight-sub">{originals ? Math.round((originals-remaining)/originals*100):100}% of original balances</div></div></div>
    <div className="debt-cards">{data.debts.map(d => {const pct = d.originalBalance ? Math.round((d.originalBalance-d.balance)/d.originalBalance*100) : 100;return <div className="card debt-card" key={d.id}>
      <div className="debt-card-top"><span className="debt-badge"><Icon name="card"/></span><div className="row-actions"><button aria-label={`Edit ${d.name}`} title="Edit" className="mini-btn" onClick={()=>edit(d.id)}><Icon name="edit"/></button><button aria-label={`Delete ${d.name}`} title="Delete" className="mini-btn" onClick={()=>remove(d.id)}><Icon name="trash"/></button></div></div>
      <div className="debt-title">{d.name}</div><div className="debt-balance">{pounds(d.balance)}</div><div className="debt-sub">{d.balance === 0 ? 'Paid off' : `Minimum ${pounds(d.minPayment)} / month`}</div>
      <div className="debt-progress-row"><span>{Math.max(0,pct)}% paid off</span><span>Started at {pounds(d.originalBalance)}</span></div><div className="progress-track"><div style={{width:`${Math.max(0,Math.min(100,pct))}%`}}/></div>
      <div className="debt-meta"><span>APR <strong>{d.apr}%</strong></span>{d.promoEnd && <span>0% until <strong>{dateText(d.promoEnd)}</strong></span>}</div>
      <div className="debt-actions"><Button onClick={() => pay(d.id)} disabled={d.balance <= 0}><Icon name="plus"/> Record payment</Button></div>
    </div>;})}</div>
    {data.debts.length === 0 && <section className="card"><Empty title="No debts added" message="Add a loan or credit card and watch your progress."><Button onClick={add}>Add your first debt</Button></Empty></section>}
    <div className="footer-line">Balances are manually updated when you record payments. Interest is estimated in the planner and isn't added automatically to tracked balances.</div>
  </>;
}
