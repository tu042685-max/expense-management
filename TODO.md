# TODO

## Debt repayment (“Pay”) feature

- [x] Backend: add `payDebt` controller to create DebtPayment record (not Expense) and send notifications to all group members.
- [x] Backend: add route `POST /api/expense/:groupId/pay`.
- [x] Frontend: add `expenseAPI.payDebt` method.
- [x] Frontend: update `GroupDetailPage` settlement tab with Pay button + modal/form (amount + select receiver).
- [x] Frontend: refresh settlement/balances after successful payment.
- [x] Frontend types: extend `Notification.type` union with `debt_payment_completed`.
- [x] Verification: run server/frontend build/typecheck and manual smoke test.

