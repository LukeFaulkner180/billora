import {useRef,useState,type FormEvent} from 'react';
import type {FinanceData,SpendingCategory,SpendingEntry,SpendingPeriod,SavingsGoal} from '../types';
import {Icon} from '../components/Icons';
import {PageHeading} from '../components/Ui';
import {dateLocal,money,parseReceipt,periodBounds,periodSpending,spendingCategories} from '../lib/spending';
type Props={data:FinanceData;update:(fn:(prev:FinanceData)=>FinanceData)=>void;notify:(message:string)=>void};
const safeAmount=(v:string)=>{const n=Number(v);return Number.isFinite(n)?Math.min(1e8,Math.max(0,Math.round(n*100)/100)):0;};
export function Budget({data,update,notify}:Props){
  const [period,setPeriod]=useState<SpendingPeriod>('weekly');
  const [weeklyDraft,setWeeklyDraft]=useState(String(data.settings.weeklyBudget||''));
  const [showExpense,setShowExpense]=useState(false);
  const [showGoal,setShowGoal]=useState(false);
  const [editing,setEditing]=useState<string|null>(null);
  const [name,setName]=useState('');const [amount,setAmount]=useState('');
  const [category,setCategory]=useState<SpendingCategory>('Groceries');const [date,setDate]=useState(dateLocal());
  const [source,setSource]=useState<'receipt'|'manual'>('manual');
  const [goalName,setGoalName]=useState('');const [goalTarget,setGoalTarget]=useState('');const [goalDate,setGoalDate]=useState('');
  const [contribution,setContribution]=useState<Record<string,string>>({});
  const [scanning,setScanning]=useState(false);const [scanMessage,setScanMessage]=useState('');
  const [confidence,setConfidence]=useState<'labelled'|'unlabelled'|'none'>('none');
  const fileRef=useRef<HTMLInputElement>(null);
  const [rangeStart,rangeEnd]=periodBounds(period);
  const spent=periodSpending(data.spending,period),weekSpent=periodSpending(data.spending,'weekly');
  const remaining=data.settings.weeklyBudget-weekSpent;
  const used=data.settings.weeklyBudget>0?Math.min(100,Math.round(weekSpent/data.settings.weeklyBudget*100)):0;
  const totalSaved=data.savingsGoals.reduce((s,g)=>s+g.saved,0);
  const breakdown=spendingCategories.map(label=>({label,value:data.spending.filter(x=>x.category===label&&x.date>=rangeStart&&x.date<rangeEnd).reduce((s,x)=>s+x.amount,0)})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value);
  const reset=()=>{setEditing(null);setName('');setAmount('');setCategory('Groceries');setDate(dateLocal());setSource('manual');setScanMessage('');setConfidence('none');};
  function saveEntry(e:FormEvent<HTMLFormElement>){e.preventDefault();const value=safeAmount(amount);
    if(!value||!name.trim())return notify('Enter a name and an amount above £0.');
    const parsed=new Date(date+'T12:00:00');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(parsed.getTime())||dateLocal(parsed)!==date)return notify('Choose a valid date.');
    const item:SpendingEntry={id:editing||crypto.randomUUID(),name:name.trim().slice(0,100),amount:value,category,date,source};
    update(prev=>({...prev,spending:editing?prev.spending.map(x=>x.id===editing?item:x):[item,...prev.spending]}));
    setShowExpense(false);reset();notify(editing?'Purchase updated.':'Purchase added.');
  }
  function edit(item:SpendingEntry){setEditing(item.id);setName(item.name);setAmount(String(item.amount));setCategory(item.category);setDate(item.date);setSource(item.source);setScanMessage('');setShowExpense(true);}
  function erase(item:SpendingEntry){if(!window.confirm('Delete '+item.name+' ('+money(item.amount)+')?'))return;update(prev=>({...prev,spending:prev.spending.filter(x=>x.id!==item.id)}));notify('Purchase deleted.');}
  function addGoal(e:FormEvent<HTMLFormElement>){e.preventDefault();const target=safeAmount(goalTarget);if(!goalName.trim()||!target)return notify('Enter a goal and a target above £0.');
    const item:SavingsGoal={id:crypto.randomUUID(),name:goalName.trim().slice(0,100),target,saved:0,targetDate:goalDate};
    update(prev=>({...prev,savingsGoals:[...prev.savingsGoals,item]}));setGoalName('');setGoalTarget('');setGoalDate('');setShowGoal(false);notify('Goal added.');
  }
  function saveContribution(goal:SavingsGoal){const value=safeAmount(contribution[goal.id]||'');if(value<=0)return notify('Enter an amount above £0.');
    update(prev=>({...prev,savingsGoals:prev.savingsGoals.map(x=>x.id===goal.id?{...x,saved:Math.round((x.saved+value)*100)/100}:x)}));
    setContribution(x=>({...x,[goal.id]:''}));notify('Goal updated. No money has been moved.');
  }
  async function scan(file?:File){if(!file)return;
    if(!file.type.startsWith('image/')||file.size>12_000_000){setScanMessage('Choose a receipt photo under 12MB.');return;}
    setScanning(true);setScanMessage('Reading on your phone or computer. The first scan downloads OCR data.');
    try{const {createWorker}=await import('tesseract.js');const worker=await createWorker('eng');let text='';
      try{const result=await worker.recognize(file);text=result.data.text;}finally{await worker.terminate();}
      const guess=parseReceipt(text);reset();setName(guess.merchant);setAmount(guess.total!==null?String(guess.total):'');
      setSource('receipt');setConfidence(guess.confidence);setShowExpense(true);
      setScanMessage(guess.total===null?'A total could not be identified. Please enter it manually.':'Receipt read. Confirm the amount, shop, date and category.');
    }catch{setScanMessage('Unable to scan that picture. Try a sharper photo or enter the total manually.');setShowExpense(true);}
    finally{setScanning(false);if(fileRef.current)fileRef.current.value='';}
  }
  return <div className="budget-page">
    <PageHeading eyebrow="Everyday money" title="Budget & spending" description="See where your money goes, set flexible spending limits and make progress on your goals."/>
    <div className="budget-tools"><button type="button" className="btn btn-primary" onClick={()=>{reset();setShowExpense(true);}}><Icon name="plus"/> Add spending</button>
      <button type="button" className="btn btn-secondary" disabled={scanning} onClick={()=>fileRef.current?.click()}><Icon name="receipt"/>{scanning?'Scanning…':'Scan receipt'}</button>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" aria-label="Take or upload a receipt photo" hidden onChange={e=>void scan(e.target.files?.[0])}/></div>
    {scanMessage&&!showExpense&&<p role="status" className="budget-message">{scanMessage}</p>}
    <div className="budget-summary">
      <section className="budget-dark-panel"><span className="budget-kicker">YOUR WEEKLY BUDGET</span><strong className="budget-number">{money(data.settings.weeklyBudget)}</strong>
        <p>For everyday purchases — separate from your bills and loan repayments.</p>
        <div className="budget-meter"><span style={{width:used+'%',background:remaining<0?'#fba8ac':'#7ce8bc'}}/></div>
        <div className="budget-progress"><span>{money(weekSpent)} spent</span><strong>{remaining>=0?money(remaining)+' left':money(-remaining)+' over budget'}</strong></div>
        <form className="budget-limit" onSubmit={e=>{e.preventDefault();update(prev=>({...prev,settings:{...prev.settings,weeklyBudget:safeAmount(weeklyDraft)}}));notify('Weekly spending budget saved.');}}>
          <label htmlFor="budget-limit">Set your weekly limit (£)</label><div><input type="number" id="budget-limit" inputMode="decimal" min="0" step="0.01" placeholder="e.g. 125" value={weeklyDraft} onChange={e=>setWeeklyDraft(e.target.value)}/><button type="submit">Save</button></div>
        </form></section>
      <section className="budget-total-card"><span className="budget-kicker">YOUR SPENDING</span><div className="budget-tabs" role="group" aria-label="Spending period">
        {(['daily','weekly','monthly','yearly'] as SpendingPeriod[]).map(p=><button type="button" key={p} className={period===p?'selected':''} aria-pressed={period===p} onClick={()=>setPeriod(p)}>{p==='daily'?'Day':p==='weekly'?'Week':p==='monthly'?'Month':'Year'}</button>)}</div>
        <strong className="budget-number">{money(spent)}</strong><p>{data.spending.filter(x=>x.date>=rangeStart&&x.date<rangeEnd).length} recorded purchases in this period</p>
        <div className="budget-overview-mini"><div><small>Today</small><strong>{money(periodSpending(data.spending,'daily'))}</strong></div><div><small>This month</small><strong>{money(periodSpending(data.spending,'monthly'))}</strong></div><div><small>This year</small><strong>{money(periodSpending(data.spending,'yearly'))}</strong></div></div>
      </section></div>
    <div className="budget-panels">
      <section className="card panel"><div className="panel-heading"><div><h2>Spending by category</h2><p>Understand where purchases add up</p></div><Icon name="chart"/></div>
        {breakdown.length?<div className="budget-category-list">{breakdown.map(row=><div key={row.label} className="budget-category"><div><strong>{row.label}</strong><span>{money(row.value)}</span></div><div className="budget-meter"><span style={{width:Math.round(row.value/spent*100)+'%'}}/></div></div>)}</div>:<p className="budget-empty">No spending in this period yet.</p>}</section>
      <section className="card panel"><div className="panel-heading"><div><h2>Savings goals</h2><p>{money(totalSaved)} recorded across {data.savingsGoals.length} goals</p></div><button type="button" className="mini-btn" onClick={()=>setShowGoal(!showGoal)} aria-label="Create a savings goal"><Icon name="plus"/></button></div>
        {showGoal&&<form className="budget-goal-form" onSubmit={addGoal}><input required maxLength={100} placeholder="Goal name, e.g. holiday" aria-label="Goal name" value={goalName} onChange={e=>setGoalName(e.target.value)}/>
          <div><input required type="number" min="0.01" step="0.01" placeholder="Target £" aria-label="Savings target" value={goalTarget} onChange={e=>setGoalTarget(e.target.value)}/><input type="date" aria-label="Target date optional" value={goalDate} onChange={e=>setGoalDate(e.target.value)}/></div>
          <button type="submit" className="btn btn-primary">Create goal</button></form>}
        {data.savingsGoals.length?data.savingsGoals.map(g=>{const pct=Math.min(100,Math.round(g.saved/g.target*100));return <div className="budget-goal" key={g.id}><div className="budget-goal-heading"><strong>{g.name}</strong><button className="mini-btn" type="button" aria-label={'Delete '+g.name} onClick={()=>{if(window.confirm('Delete savings goal '+g.name+'?'))update(prev=>({...prev,savingsGoals:prev.savingsGoals.filter(x=>x.id!==g.id)}));}}><Icon name="trash"/></button></div><div className="budget-progress"><span>{money(g.saved)} of {money(g.target)}</span><strong>{pct}%</strong></div><div className="budget-meter"><span style={{width:pct+'%'}}/></div>{g.targetDate&&<small>Target date: {g.targetDate}</small>}<form className="budget-contribute" onSubmit={e=>{e.preventDefault();saveContribution(g);}}><input type="number" inputMode="decimal" min="0.01" step="0.01" aria-label={'Add savings towards '+g.name} placeholder="Amount saved £" value={contribution[g.id]||''} onChange={e=>setContribution(prev=>({...prev,[g.id]:e.target.value}))}/><button type="submit">Update</button></form></div>}):<p className="budget-empty">Start a goal for your emergency fund, holiday or big purchase.</p>}
        <p className="budget-note">Savings goals track progress only; no money is transferred.</p></section>
    </div>
    <section className="card panel"><div className="panel-heading"><div><h2>Your purchases</h2><p>Manually logged or confirmed from a receipt photo</p></div><Icon name="receipt"/></div>
      {data.spending.length?<div className="budget-list">{[...data.spending].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,150).map(x=><div className="budget-row" key={x.id}><span className="budget-symbol"><Icon name={x.source==='receipt'?'receipt':'wallet'}/></span><div className="budget-row-name"><strong>{x.name}</strong><small>{x.category} · {x.date}{x.source==='receipt'?' · receipt':''}</small></div><strong className="budget-row-price">−{money(x.amount)}</strong><div className="budget-actions"><button aria-label={'Edit '+x.name} onClick={()=>edit(x)}><Icon name="edit"/></button><button aria-label={'Delete '+x.name} onClick={()=>erase(x)}><Icon name="trash"/></button></div></div>)}</div>:<p className="budget-empty">No purchases yet. Add spending or scan a receipt to begin.</p>}</section>
    {showExpense&&<div className="budget-overlay" onMouseDown={e=>{if(e.target===e.currentTarget){setShowExpense(false);reset();}}}><section className="budget-dialog" role="dialog" aria-modal="true" aria-label="Record a purchase"><div className="budget-dialog-head"><h2>{editing?'Edit spending':'Record a purchase'}</h2><button type="button" onClick={()=>{setShowExpense(false);reset();}} aria-label="Close"><Icon name="close"/></button></div>
      {scanMessage&&<p role="status" className="budget-message">{scanMessage}</p>}
      {source==='receipt'&&confidence==='unlabelled'&&<p className="budget-warning">The total was not clearly labelled. Double-check it against the receipt.</p>}
      <form className="budget-entry-form" onSubmit={saveEntry}><label>Description<input value={name} required maxLength={100} placeholder="Shop or purchase" onChange={e=>setName(e.target.value)}/></label><label>Total spent (£)<input type="number" min="0.01" step="0.01" inputMode="decimal" required value={amount} onChange={e=>setAmount(e.target.value)}/></label>
        <div><label>Category<select value={category} onChange={e=>setCategory(e.target.value as SpendingCategory)}>{spendingCategories.map(c=><option key={c}>{c}</option>)}</select></label><label>Date<input required type="date" value={date} onChange={e=>setDate(e.target.value)}/></label></div>
        <button type="submit" className="btn btn-primary">{editing?'Save changes':'Confirm & save purchase'}</button>
        <p className="budget-note">Always check scanned totals. Receipt photos are not stored in Billora.</p></form></section></div>}
  </div>;
}
