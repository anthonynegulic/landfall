export function calculateRunway({
  savings,
  relocationCosts = 15000,
  monthlyRent,
  schoolFees = 0,
  healthInsurance = 500,
  livingExpenses = 3000,
  monthlyIncome = 0,
  monthsUntilIncome = 1,
}) {
  const data = [];
  const startingBalance = Math.round(savings - relocationCosts);

  // Month 0: deduct relocation costs upfront
  data.push({
    month: 0,
    balance: Math.max(startingBalance, 0),
    income: 0,
    expenses: 0,
  });

  if (startingBalance <= 0) return data;

  const totalMonthlyExpenses = monthlyRent + schoolFees + healthInsurance + livingExpenses;

  for (let m = 1; m <= 36; m++) {
    const prev = data[m - 1];
    const incomeForMonth = m > monthsUntilIncome ? monthlyIncome : 0;
    const balance = Math.round(prev.balance - totalMonthlyExpenses + incomeForMonth);

    if (balance <= 0) {
      data.push({ month: m, balance: 0, income: incomeForMonth, expenses: totalMonthlyExpenses });
      break;
    }

    data.push({
      month: m,
      balance,
      income: incomeForMonth,
      expenses: totalMonthlyExpenses,
    });
  }

  return data;
}

export function getRunwayMonths(data) {
  const lastEntry = data[data.length - 1];
  if (lastEntry.balance <= 0) {
    return lastEntry.month;
  }
  return data.length;
}

export function getBreakevenMonth(data) {
  // Breakeven = first month where take-home income covers all monthly expenses.
  // If income never reaches expenses (e.g. $2,000 income vs $6,000 expenses), returns null.
  for (const entry of data) {
    if (entry.month === 0) continue;
    if (entry.income >= entry.expenses && entry.expenses > 0) {
      return entry.month;
    }
  }
  return null;
}
