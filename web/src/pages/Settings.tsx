import {useRef} from 'react';
import type {FinanceData} from '../types';
import {frequencies, monthly, pounds, total} from '../lib/money';
import {exportData, normaliseData} from '../lib/storage';
import {Button, Empty, PageHeading} from '../components/Ui';
import {Icon} from '../components/Icons';
export function Settings({data,add,edit,remove,replace,cloud,notify}: {data: FinanceData;add:()=>void;edit:(id:string)=>void;remove:(id:string)=>void;replace:(data:FinanceData)=>void;cloud:boolean;notify:(s:string)=>void}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const start = () => {if (window.confirm('Remove every bill, debt and income from this workspace? This cannot be undone.')) replace({version:2,mode:'personal',incomes:[],bills:[],debts:[],settings:{strategy:'avalanche',extraPayment:0}})};
  const restore = async (file: File | undefined) => {
    if(!file) return;
    try {
      if(file.size > 2_000_000) throw new Error('The backup file is too large.');
      const parsed: unknown = JSON.parse(await file.text());
      const incoming = normaliseData(parsed);
      if(window.confirm('Replace your current Billora data with the contents of your backup?')) {replace({...incoming,mode:'personal'});notify('Backup imported successfully.');}
    } catch (e) {notify(e instanceof Error?e.message:'Could not import backup.');}
    finally {if (fileRef.current) fileRef.current.value = '';}
  };
  return <>
    <PageHeading eyebrow="Make it your own" title="Settings & income" description="Manage income, exports and your financial information."><Button onClick={add}><Icon name="plus"/> Add income</Button></PageHeading>
    <div className="settings-grid">
      <section className="card panel"><div className="panel-heading"><div><h2>Your income</h2><p>Monthly equivalent: {pounds(total(data.incomes.map(i=>monthly(i.amount,i.frequency))))}</p></div><Icon name="wallet"/></div>
        {data.incomes.length ? <div className="compact-list">{data.incomes.map(i=><div className="compact-row" key={i.id}><span className="bill-emblem"><Icon name="wallet"/></span><div className="grow"><strong>{i.name}</strong><small>{frequencies[i.frequency]}</small></div><div className="right"><strong>{pounds(i.amount)}</strong><div className="row-actions"><button className="mini-btn" aria-label={`Edit ${i.name}`} onClick={()=>edit(i.id)}><Icon name="edit"/></button><button className="mini-btn" aria-label={`Delete ${i.name}`} onClick={()=>remove(i.id)}><Icon name="trash"/></button></div></div></div>)}</div> : <Empty title="No income sources" message="Add your pay or another income source."><Button onClick={add}>Add income</Button></Empty>}
      </section>
      <section className="card panel"><div className="panel-heading"><div><h2>{cloud?'Your private account':'Your demo data'}</h2><p>{cloud?'Your finances are stored in your private Billora account':'Control the figures saved in this browser'}</p></div><Icon name="shield"/></div>
        <p className="plain-note">{cloud?'Your signed-in account stores a private finance snapshot in Supabase. You can export a personal backup at any time. Never share your login details.':'You are using a local browser demo. Data can be lost if you clear browser storage. Avoid entering real account numbers or other sensitive financial information until secure accounts are enabled.'}</p>
        <div className="data-buttons"><Button variant="secondary" onClick={()=>{exportData(data);notify('Backup downloaded.')}}><Icon name="download"/> Export backup</Button><Button variant="secondary" onClick={()=>fileRef.current?.click()}><Icon name="upload"/> Import backup</Button><input ref={fileRef} aria-label="Import Billora JSON backup" type="file" accept=".json,application/json" hidden onChange={e=>{void restore(e.target.files?.[0]);}}/></div>
        <div className="settings-separator"/>
        <h3>Reset this workspace</h3><p className="plain-note">Delete all bills, debts and income from this workspace. This cannot be undone.</p><Button variant="danger" onClick={start}><Icon name="trash"/> Clear all data</Button>
      </section>
    </div>
    {data.mode==='demo' && <div className="newbie-banner"><Icon name="info"/><span>You're still exploring sample figures.</span><button onClick={start}>Start with my own data</button></div>}
    <div className="footer-line">Billora isn't linked to any real bank or lender. Figures are illustrative and not financial advice.</div>
  </>;
}
