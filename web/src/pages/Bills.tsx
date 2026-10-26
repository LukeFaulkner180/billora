import {useState} from 'react';
import type {FinanceData} from '../types';
import {categoryColours, dateText, dueStatus, frequencies, monthly, pounds, total} from '../lib/money';
import {Button, Empty, PageHeading} from '../components/Ui';
import {Icon} from '../components/Icons';
export function Bills({data, add, edit, remove, pay}: {data: FinanceData; add: () => void; edit: (id: string) => void; remove: (id: string) => void; pay: (id: string) => void}) {
  const [query, setQuery] = useState('');
  const bills = [...data.bills].filter(b => b.name.toLowerCase().includes(query.toLowerCase())).sort((a,b) => a.nextDue.localeCompare(b.nextDue));
  return <>
    <PageHeading eyebrow="Know what's coming" title="My bills" description="Never lose track of a recurring bill or subscription."><Button onClick={add}><Icon name="plus"/> Add a bill</Button></PageHeading>
    <div className="stat-grid"><Summary label="Monthly equivalent" value={pounds(total(data.bills.map(b => monthly(b.amount,b.frequency))))}/><Summary label="Bills tracked" value={String(data.bills.length)}/><Summary label="Overdue" value={String(data.bills.filter(b => dueStatus(b.nextDue).cls === 'overdue').length)}/><Summary label="Due in 7 days" value={String(data.bills.filter(b => ['today','soon'].includes(dueStatus(b.nextDue).cls)).length)}/></div>
    <section className="card panel"><div className="panel-heading"><div><h2>All your bills</h2><p>Tick payments off as you pay them</p></div><input aria-label="Search bills" className="bill-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search bills..."/></div>
      {bills.length ? <div className="bill-list">{bills.map(b => {const status = dueStatus(b.nextDue);return <div className="bill-row react-bill" key={b.id}>
        <div className="bill-emblem" style={{background:categoryColours[b.category]+'22',color:categoryColours[b.category]}}><Icon name="receipt"/></div>
        <div className="bill-details"><strong>{b.name}</strong><span>{b.category} · {frequencies[b.frequency]}</span><span>Next: {dateText(b.nextDue)} <span className={`status ${status.cls}`}>{status.text}</span></span></div>
        <div className="bill-right"><strong>{pounds(b.amount)}</strong><div className="row-actions"><button title="Mark paid" aria-label={`Mark ${b.name} paid`} className="mini-btn pay" onClick={() => pay(b.id)}><Icon name="check"/></button><button title="Edit" aria-label={`Edit ${b.name}`} className="mini-btn" onClick={() => edit(b.id)}><Icon name="edit"/></button><button title="Delete" aria-label={`Delete ${b.name}`} className="mini-btn" onClick={() => remove(b.id)}><Icon name="trash"/></button></div></div>
      </div>;})}</div> : <Empty title="No matching bills" message="Add a bill or change your search term."><Button onClick={add}>Add a bill</Button></Empty>}
    </section><div className="footer-line">Marking a bill as paid records that occurrence and moves its next due date forward.</div>
  </>;
}
function Summary({label,value}:{label:string;value:string}){return <div className="stat-card small-stat"><div className="stat-top">{label}</div><div className="stat-number">{value}</div></div>}
