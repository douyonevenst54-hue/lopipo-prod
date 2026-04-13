POST /app/api/lottery/group-payout/route.ts

Executes group lottery payout with 5% platform fee.

Request:
{
  "groupLotteryId": "group_xxx",
  "winners": [{ userId, tickets }],
  "totalPool": 100
}

Response:
{
  "platformFee": 5,
  "totalPayout": 95,
  "payoutPerWinner": 19,
  "transactionId": "txn_xxx"
}

Fee Breakdown (on 100 Pi pool):
- Total pool: 100 Pi
- Platform fee (5%): 5 Pi
- Winner payout: 95 Pi
- Per winner (5 winners): 19 Pi each

Side effects:
- Deduct 5% from group pot
- Credit platform wallet
- Credit each winner with their share
- Log group lottery payout
- Send winner notifications
- Update leaderboard
