import type {SpendingEntry, SpendingPeriod} from '../types';
export const spendingCategories = ['Groceries','Eating out','Transport','Shopping','Entertainment','Health','Other'] as const;
export const periodLabels: Record<SpendingPeriod,string> = {daily:'Today',weekly:'This week',monthly:'This month',yearly:'This year'};
export const money = (value:number) => new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(value);
export const dateLocal = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export function periodBounds(period:SpendingPeriod,now=new Date()):[string,string]{
  const start=new Date(now.getFullYear(),now.getMonth(),now.getDate());const end=new Date(start);
  if(period==='daily')end.setDate(start.getDate()+1);
  else if(period==='weekly'){start.setDate(start.getDate()-((start.getDay()+6)%7));end.setTime(start.getTime());end.setDate(end.getDate()+7);}
  else if(period==='monthly'){start.setDate(1);end.setTime(start.getTime());end.setMonth(end.getMonth()+1);}
  else{start.setMonth(0,1);end.setTime(start.getTime());end.setFullYear(end.getFullYear()+1);}
  return [dateLocal(start),dateLocal(end)];
}
export function periodSpending(entries:SpendingEntry[],period:SpendingPeriod,now=new Date()):number{
  const [start,end]=periodBounds(period,now);return entries.reduce((sum,x)=>x.date>=start&&x.date<end?sum+x.amount:sum,0);
}
export function parseReceipt(text:string):{total:number|null;merchant:string;confidence:'labelled'|'unlabelled'|'none'}{
  const lines=text.replace(/\r/g,'').split('\n').map(x=>x.trim()).filter(Boolean);
  const amountPattern=/(?:£\s*)?(\d{1,6}(?:[,.]\d{3})*[.,]\d{2})\s*$/;
  const parse=(s:string)=>{const v=s.replace(/,/g,'.');return Number(v.split('.').length>2?s.replace(/,/g,''):v)};
  const merchant=(lines.find(x=>/[A-Za-z]{3}/.test(x)&&!/\b(receipt|tax invoice|vat no|thank you)\b/i.test(x))||'Receipt').replace(/[^\p{L}\p{N} '&.-]/gu,'').slice(0,70)||'Receipt';
  const labels=/(?:grand\s*total|total\s*(?:to\s*pay|due|paid|amount)?|amount\s*(?:due|paid)|card\s*payment|balance\s*due)/i;
  const ignored=/(?:sub\s*total|vat|tax|change|cashback|discount|saving|tendered|cash\s*received|card\s*number)/i;
  const candidates:{amount:number;score:number}[]=[];
  lines.forEach((line,i)=>{const match=line.match(amountPattern);if(!match||ignored.test(line))return;
    const amount=parse(match[1]);if(!Number.isFinite(amount)||amount<=0||amount>100000)return;
    const labelled=labels.test(line)||/^\s*(?:total|amount due)\s*$/i.test(lines[i-1]||'');
    candidates.push({amount:Math.round(amount*100)/100,score:labelled?100+i/100:i/Math.max(1,lines.length)});
  });
  candidates.sort((a,b)=>b.score-a.score);const best=candidates[0];
  return {total:best?.amount??null,merchant,confidence:best?(best.score>=100?'labelled':'unlabelled'):'none'};
}
