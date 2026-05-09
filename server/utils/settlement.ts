/**
 * Settlement Algorithm
 * Minimizes the number of transactions to settle all debts
 */

export interface SettlementTransaction {
  from: string; // userId who pays
  to: string; // userId who receives
  amount: number;
}

export interface UserBalance {
  userId: string;
  balance: number; // positive = owed, negative = owes
}

/**
 * Calculate settlement transactions from user balances
 * Uses a greedy algorithm to minimize transactions
 */
export function calculateSettlements(
  balances: Record<string, number>
): SettlementTransaction[] {
  const transactions: SettlementTransaction[] = [];

  // Convert balances to array format
  const userBalances: UserBalance[] = Object.entries(balances).map(
    ([userId, balance]) => ({
      userId,
      balance,
    })
  );

  // Separate into debtors and creditors
  const debtors = userBalances.filter((b) => b.balance < 0); // owes money
  const creditors = userBalances.filter((b) => b.balance > 0); // owed money

  // Greedy matching algorithm
  let debtorIdx = 0;
  let creditorIdx = 0;

  while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
    const debtor = debtors[debtorIdx];
    const creditor = creditors[creditorIdx];

    // Amount to settle (absolute value of debtor's balance)
    const debtAmount = Math.abs(debtor.balance);
    const creditAmount = creditor.balance;

    // Settle the minimum of the two
    const settlementAmount = Math.min(debtAmount, creditAmount);

    transactions.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: Math.round(settlementAmount * 100) / 100, // Round to 2 decimal places
    });

    // Update balances
    debtor.balance += settlementAmount;
    creditor.balance -= settlementAmount;

    // Move to next debtor/creditor if current is settled
    if (Math.abs(debtor.balance) < 0.01) debtorIdx++;
    if (creditor.balance < 0.01) creditorIdx++;
  }

  return transactions;
}

/**
 * Calculate user balances from expenses and debt payments
 */
export function calculateUserBalances(
  expenses: Array<{
    id: string;
    amount: number;
    paidBy: string;
    splits: Array<{ userId: string; shareAmount: number }>;
  }>,
  debtPayments: Array<{
    id: string;
    amount: number;
    paidBy: string;
    paidTo: string;
  }> = []
): Record<string, number> {
  const balances: Record<string, number> = {};

  for (const expense of expenses) {
    // Person who paid gets credit
    if (!balances[expense.paidBy]) balances[expense.paidBy] = 0;
    balances[expense.paidBy] += expense.amount;

    // Each person in split owes their share
    for (const split of expense.splits) {
      if (!balances[split.userId]) balances[split.userId] = 0;
      balances[split.userId] -= split.shareAmount;
    }
  }

  // Adjust balances for debt payments
  for (const payment of debtPayments) {
    // Person who paid the debt gets credit (reduces what they owe)
    if (!balances[payment.paidBy]) balances[payment.paidBy] = 0;
    balances[payment.paidBy] += payment.amount;

    // Person who received the payment owes less (or gets more credit)
    if (!balances[payment.paidTo]) balances[payment.paidTo] = 0;
    balances[payment.paidTo] -= payment.amount;
  }

  // Remove zero balances
  Object.keys(balances).forEach((key) => {
    if (Math.abs(balances[key]) < 0.01) {
      delete balances[key];
    }
  });

  return balances;
}
