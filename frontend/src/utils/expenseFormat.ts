export const expenseCategories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Bills', 'Other']

export function formatTnd(amount: number) {
  return new Intl.NumberFormat('en-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(amount)
}

export function currencyCode() {
  const saved = localStorage.getItem('spendwise-currency')
  return saved === 'EUR' || saved === 'USD' ? saved : 'TND'
}

export function todayIsoDate() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}
