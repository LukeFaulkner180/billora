/** Billora Premium public pricing. Figures are pence to avoid floating point drift. */
export const PREMIUM_MONTHLY_PENCE = 399;
export const PREMIUM_YEARLY_PENCE = 3299;
export const premiumSavingsPence = PREMIUM_MONTHLY_PENCE * 12 - PREMIUM_YEARLY_PENCE;
export const premiumSavingsPercent = Math.round((premiumSavingsPence / (PREMIUM_MONTHLY_PENCE * 12)) * 100);
export const formatPremiumPrice = (pence: number): string =>
  new Intl.NumberFormat('en-GB', {style:'currency', currency:'GBP'}).format(pence / 100);
