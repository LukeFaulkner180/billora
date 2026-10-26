import {useEffect,useState,type FormEvent} from 'react';
import {supabase} from './client';
import {Brand} from '../components/Brand';
import {Icon} from '../components/Icons';

export function PasswordResetDialog({ready,onFinished}: {ready:boolean;onFinished:()=>void}) {
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [show,setShow]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{
    const prev=document.body.style.overflow;document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=prev;};
  },[]);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!ready||busy)return;
    if(password.length<8){setError('Choose a password of at least 8 characters.');return;}
    if(password!==confirm){setError('Passwords do not match.');return;}
    setBusy(true);setError('');
    try {
      if(!supabase)throw new Error('Account service is unavailable.');
      const {error:updateError}=await supabase.auth.updateUser({password});
      if(updateError)throw updateError;
      const {error:signOutError}=await supabase.auth.signOut();
      if(signOutError)throw signOutError;
      onFinished();
    }catch(reason){
      setError(reason instanceof Error?reason.message:'Unable to change your password.');
    }finally{setBusy(false);}
  }
  return <div className="auth-backdrop billora-reset-backdrop">
    <section className="billora-reset-dialog" role="dialog" aria-modal="true" aria-labelledby="billora-reset-title">
      <Brand compact/>
      <div className="billora-reset-kicker"><Icon name="shield" size={17}/> ACCOUNT SECURITY</div>
      <h2 id="billora-reset-title">Set a new password</h2>
      <p>{ready?'Choose a new password for your Billora account.':'Checking the reset link. If it has expired, request a new link from Sign in.'}</p>
      {ready&&<form className="auth-form" onSubmit={e=>void submit(e)}>
        <label>New password<input autoComplete="new-password" minLength={8} type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required/></label>
        <label>Confirm new password<input autoComplete="new-password" minLength={8} type={show?'text':'password'} value={confirm} onChange={e=>setConfirm(e.target.value)} required/></label>
        <label className="billora-reset-toggle"><input type="checkbox" checked={show} onChange={e=>setShow(e.target.checked)}/> Show passwords</label>
        <button disabled={busy} className="auth-submit" type="submit">{busy?'Saving…':'Save password'}<span>→</span></button>
      </form>}
      {error&&<div className="auth-feedback" role="alert">{error}</div>}
      {!ready&&<button type="button" className="billora-reset-return" onClick={onFinished}>Back to sign in</button>}
      <small>After updating your password, you'll sign in again.</small>
    </section>
  </div>;
}
