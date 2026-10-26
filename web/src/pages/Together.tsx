import {useEffect,useState,type FormEvent} from 'react';
import type {FinanceData,Bill,SpendingCategory,SavingsGoal} from '../types';
import {supabase} from '../auth/client';
// App requires an authenticated session before rendering this page.
const jointClient = supabase!;
import {normaliseData} from '../lib/storage';
import {emptyData} from '../lib/storage';
import {dateLocal,spendingCategories} from '../lib/spending';
import {makeId,advanceBill} from '../lib/money';
import {Icon} from '../components/Icons';
import type {ConfirmRequest} from '../components/ConfirmDialog';
type Household={id:string;name:string;owner_id:string};
type Invitation={invite_id:string;household_name:string};
type Member={user_id:string;role:string};
type Props={userId:string; premium:boolean; notify:(message:string)=>void; requestConfirm:ConfirmRequest};
const cash=(n:number)=>'£'+n.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});
const amount=(x:string)=>Math.max(0,Math.min(1e8,Math.round(Number(x)*100)/100||0));
const fresh=()=>({...emptyData(),mode:'personal' as const});
export function Together({userId,premium,notify,requestConfirm}:Props){
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState('');
 const [house,setHouse]=useState<Household|null>(null),[members,setMembers]=useState<Member[]>([]);
 const [invites,setInvites]=useState<Invitation[]>([]),[joint,setJoint]=useState<FinanceData>(fresh);
 const [revision,setRevision]=useState(0),[dirty,setDirty]=useState(false);
 const [partnerEmail,setPartnerEmail]=useState(''),[houseName,setHouseName]=useState('Our household');
 const [billName,setBillName]=useState(''),[billAmount,setBillAmount]=useState(''),[billDay,setBillDay]=useState('');
 const [spendName,setSpendName]=useState(''),[spendAmount,setSpendAmount]=useState(''),[spendCategory,setSpendCategory]=useState<SpendingCategory>('Groceries');
 const [goalName,setGoalName]=useState(''),[goalTarget,setGoalTarget]=useState('');
 const [newContribution,setNewContribution]=useState<Record<string,string>>({});
 async function load(){
   setLoading(true);setError('');
   try{
    const m=await jointClient.from('billora_household_members').select('household_id,role').eq('user_id',userId).maybeSingle();
    if(m.error)throw m.error;
    let hid=m.data?.household_id as string|undefined;
    if(!hid){
      setHouse(null);setMembers([]);setDirty(false);
      const pending=await jointClient.rpc('billora_joint_pending');
      if(pending.error)throw pending.error;
      setInvites((pending.data||[]) as Invitation[]);return;
    }
    const [h,mem,fin]=await Promise.all([
     jointClient.from('billora_households').select('id,name,owner_id').eq('id',hid).single(),
     jointClient.from('billora_household_members').select('user_id,role').eq('household_id',hid),
     jointClient.from('billora_household_finances').select('data,revision').eq('household_id',hid).single()
    ]);
    if(h.error)throw h.error;if(mem.error)throw mem.error;if(fin.error)throw fin.error;
    setHouse(h.data as Household);setMembers((mem.data||[]) as Member[]);
    setJoint({...normaliseData(fin.data.data),mode:'personal'});setRevision(fin.data.revision);
    setDirty(false);setInvites([]);
   }catch(e){setError(e instanceof Error?e.message:'Cannot load your shared household.');}
   finally{setLoading(false);}
 }
 useEffect(()=>{void load();},[userId]);
 function change(fn:(data:FinanceData)=>FinanceData){setJoint(prev=>({...fn(prev),mode:'personal'}));setDirty(true);}
 async function save(){
  if(!house||!dirty||saving)return;
  setSaving(true);setError('');
  try{
    // Server-side optimistic revision check prevents silent overwrite by the second partner.
    const clean={...joint,categoryBudgets:{},settings:{...joint.settings,weeklyBudget:0}};
    const {data,error}=await jointClient.rpc('billora_joint_save',{p_house:house.id,p_data:clean,p_revision:revision});
    if(error)throw error;
    setRevision(data as number);setDirty(false);notify('Joint household saved.');
  }catch(e){setError(e instanceof Error?e.message:'Could not save changes. Reload shared data and try again.');}
  finally{setSaving(false);}
 }
 async function create(event:FormEvent){event.preventDefault();
  setError('');const {error}=await jointClient.rpc('billora_joint_create',{p_name:houseName.trim()||'Our household'});
  if(error){setError(error.message);return;}notify('Joint household created.');void load();
 }
 async function invite(event:FormEvent){event.preventDefault();if(!house)return;
  const {error}=await jointClient.rpc('billora_joint_invite',{p_house:house.id,p_email:partnerEmail.trim().toLowerCase()});
  if(error){setError(error.message);return;}setPartnerEmail('');setError('');
  notify('Invite saved. Ask your partner to sign in to Billora Together using that exact email.');
 }
 async function accept(id:string){
  const {error}=await jointClient.rpc('billora_joint_accept',{p_invite:id});
  if(error){setError(error.message);return;}notify('You joined the household.');void load();
 }
 function leave(){
  if(!house)return;
  requestConfirm({title:house.owner_id===userId?'Delete shared household?':'Leave household?',message:house.name,
  detail:house.owner_id===userId?'This permanently deletes all shared finances for both partners. Personal finances remain private and untouched.':'Your partner will keep the joint records. Your personal finances remain private.',
  confirmLabel:house.owner_id===userId?'Delete household':'Leave household',tone:'danger'},
  ()=>void jointClient.rpc('billora_joint_leave',{p_house:house.id}).then(({error})=>{
    if(error){setError(error.message);return;}notify('Joint membership updated.');void load();
  }));
 }
 const blocked=<section className="together-unlock">
   <span className="together-tag"><Icon name="sparkle" size={14}/> PREMIUM FEATURE</span>
   <h2>Better money management, together.</h2>
   <p>One shared workspace for two people, alongside your own private finances. Track household bills, purchases and savings without sharing a login.</p>
   <div className="together-benefits"><span>✓ Two separate accounts</span><span>✓ Joint bills and spending</span><span>✓ Shared savings goals</span><span>✓ Private personal finances</span></div>
   <strong>Included with Billora Premium</strong>
   <p>Premium subscriptions are not on sale yet. This feature is reserved for paid accounts and is being prepared for launch.</p>
 </section>;
 function addBill(e:FormEvent){
  e.preventDefault();if(!billName.trim()||amount(billAmount)<=0||!billDay)return;
  const date=new Date(billDay+'T12:00:00');
  if(Number.isNaN(date.getTime()))return;
  const bill:Bill={id:makeId(),name:billName.trim().slice(0,100),amount:amount(billAmount),category:'Home',frequency:'monthly',nextDue:billDay,anchorDay:date.getDate(),payments:[]};
  change(p=>({...p,bills:[...p.bills,bill]}));setBillName('');setBillAmount('');setBillDay('');
 }
 function addSpending(e:FormEvent){e.preventDefault();if(!spendName.trim()||amount(spendAmount)<=0)return;
  change(p=>({...p,spending:[{id:makeId(),name:spendName.trim().slice(0,100),amount:amount(spendAmount),category:spendCategory,date:dateLocal(),source:'manual'},...p.spending]}));
  setSpendName('');setSpendAmount('');
 }
 function addGoal(e:FormEvent){e.preventDefault();if(!goalName.trim()||amount(goalTarget)<=0)return;
  const goal:SavingsGoal={id:makeId(),name:goalName.trim().slice(0,100),target:amount(goalTarget),saved:0,targetDate:''};
  change(p=>({...p,savingsGoals:[...p.savingsGoals,goal]}));setGoalName('');setGoalTarget('');
 }
 return <div className="together-page">
   <div className="page-heading"><div><div className="page-eyebrow">BILLORA TOGETHER</div><h1>Our household</h1><p>A shared space for the finances you manage together, separate from your personal records.</p></div></div>
   {error&&<div className="together-error" role="alert">{error}</div>}
   {loading?<p role="status">Checking joint household membership…</p>:
    house ? <div className="together-content">
      <section className="together-top">
       <div><span className="together-tag">JOINT WORKSPACE</span><h2>{house.name}</h2><p>{members.length} of 2 people connected. {house.owner_id===userId?'You are the household owner.':'You are the invited partner.'}</p></div>
       <div className="together-top-actions"><button className="btn btn-secondary" type="button" disabled={saving||!dirty} onClick={()=>void save()}>{saving?'Saving…':dirty?'Save shared changes':'Everything saved'}</button>
       <button className="btn btn-secondary" type="button" disabled={saving} onClick={()=>void load()}>Reload</button></div>
      </section>
      {dirty&&<p className="together-unsaved" role="status">Unsaved household changes. Save before switching away to avoid losing them.</p>}
      {house.owner_id===userId&&members.length<2&&<section className="together-panel"><h3>Invite your partner</h3><p>Your partner must have a separate, email-verified Billora account. No invitation email is sent yet; ask them to open Billora Together after you save the invitation.</p>
       <form onSubmit={e=>void invite(e)} className="together-form"><input type="email" required placeholder="partner@example.com" value={partnerEmail} onChange={e=>setPartnerEmail(e.target.value)}/><button className="btn btn-primary">Create invitation</button></form>
      </section>}
      <div className="together-stats"><div><span>Regular household bills</span><strong>{cash(joint.bills.reduce((s,b)=>s+b.amount,0))}</strong></div><div><span>Logged purchases</span><strong>{cash(joint.spending.reduce((s,b)=>s+b.amount,0))}</strong></div><div><span>Savings recorded</span><strong>{cash(joint.savingsGoals.reduce((s,g)=>s+g.saved,0))}</strong></div></div>
      <div className="together-grid">
       <section className="together-panel"><h3>Shared bills</h3><form className="together-form" onSubmit={addBill}><input required aria-label="Bill name" placeholder="Bill name" value={billName} onChange={e=>setBillName(e.target.value)}/><input required aria-label="Bill amount" type="number" inputMode="decimal" min=".01" step=".01" placeholder="£ amount" value={billAmount} onChange={e=>setBillAmount(e.target.value)}/><input required aria-label="Next due date" type="date" value={billDay} onChange={e=>setBillDay(e.target.value)}/><button className="btn btn-primary">Add bill</button></form>
       {joint.bills.map(b=><div className="together-line" key={b.id}><div><strong>{b.name}</strong><small>Due {b.nextDue} · Monthly</small></div><b>{cash(b.amount)}</b><button aria-label={'Mark '+b.name+' paid'} title="Mark paid" type="button" onClick={()=>change(p=>({...p,bills:p.bills.map(x=>x.id===b.id?{...x,nextDue:advanceBill(x),payments:[...x.payments,{date:dateLocal(),amount:x.amount,due:x.nextDue}]}:x)}))}><Icon name="check"/></button><button aria-label={'Delete '+b.name} type="button" onClick={()=>change(p=>({...p,bills:p.bills.filter(x=>x.id!==b.id)}))}><Icon name="trash"/></button></div>)}</section>
       <section className="together-panel"><h3>Shared purchases</h3><form className="together-form" onSubmit={addSpending}><input required aria-label="Purchase name" placeholder="Shop or purchase" value={spendName} onChange={e=>setSpendName(e.target.value)}/><input required aria-label="Purchase amount" type="number" inputMode="decimal" min=".01" step=".01" placeholder="£ amount" value={spendAmount} onChange={e=>setSpendAmount(e.target.value)}/><select value={spendCategory} aria-label="Purchase category" onChange={e=>setSpendCategory(e.target.value as SpendingCategory)}>{spendingCategories.map(c=><option key={c}>{c}</option>)}</select><button className="btn btn-primary">Add spending</button></form>
       {joint.spending.map(x=><div className="together-line" key={x.id}><div><strong>{x.name}</strong><small>{x.category} · {x.date}</small></div><b>−{cash(x.amount)}</b><button aria-label={'Delete '+x.name} type="button" onClick={()=>change(p=>({...p,spending:p.spending.filter(v=>v.id!==x.id)}))}><Icon name="trash"/></button></div>)}</section>
      </div>
      <section className="together-panel"><h3>Our savings goals</h3><form className="together-form" onSubmit={addGoal}><input required aria-label="Goal name" placeholder="Saving for..." value={goalName} onChange={e=>setGoalName(e.target.value)}/><input required aria-label="Goal target" type="number" min=".01" step=".01" inputMode="decimal" placeholder="£ target" value={goalTarget} onChange={e=>setGoalTarget(e.target.value)}/><button className="btn btn-primary">Create goal</button></form>
       {joint.savingsGoals.map(g=><div className="together-line" key={g.id}><div><strong>{g.name}</strong><small>{cash(g.saved)} of {cash(g.target)} saved</small></div><div className="together-contribute"><input type="number" min=".01" step=".01" inputMode="decimal" aria-label={'Amount saved toward '+g.name} placeholder="£ saved" value={newContribution[g.id]||''} onChange={e=>setNewContribution(v=>({...v,[g.id]:e.target.value}))}/><button type="button" onClick={()=>{if(amount(newContribution[g.id]||'')>0)change(p=>({...p,savingsGoals:p.savingsGoals.map(x=>x.id===g.id?{...x,saved:Math.round((x.saved+amount(newContribution[g.id]||''))*100)/100}:x)}));setNewContribution(v=>({...v,[g.id]:''}));}}>Add</button><button aria-label={'Delete goal '+g.name} type="button" onClick={()=>change(p=>({...p,savingsGoals:p.savingsGoals.filter(x=>x.id!==g.id)}))}><Icon name="trash"/></button></div></div>)}
       <p>These are tracking figures only. Billora never moves money.</p>
      </section>
      <section className="together-panel together-danger"><h3>Household membership</h3><p>Only the people connected to this shared workspace can access its records. Personal finance data stays separate.</p><button type="button" className="btn btn-danger" onClick={leave}>{house.owner_id===userId?'Delete joint household':'Leave household'}</button></section>
    </div>:
    <div>{invites.length>0&&<section className="together-panel"><h3>Your invitations</h3>{invites.map(x=><div key={x.invite_id} className="together-line"><strong>{x.household_name}</strong><button type="button" className="btn btn-primary" onClick={()=>void accept(x.invite_id)}>Join household</button></div>)}</section>}
     {premium?<section className="together-panel"><h3>Start a joint household</h3><p>Invite one partner to share household finances. Your own personal workspace stays private.</p><form className="together-form" onSubmit={e=>void create(e)}><input required maxLength={60} value={houseName} aria-label="Household name" onChange={e=>setHouseName(e.target.value)}/><button className="btn btn-primary">Create household</button></form></section>:blocked}
    </div>}
 </div>;
}
