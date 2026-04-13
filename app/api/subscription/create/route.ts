POST /api/subscription/create

Creates a monthly Pro subscription for a user.

Request:
{
  "userId": "pi_user_id",
  "subscriptionType": "pro",
  "piAmount": 1
}

Response:
{
  "subscriptionId": "sub_xxx",
  "userId": "pi_user_id",
  "type": "pro",
  "cost": 1,
  "expiresAt": "2024-05-09T00:00:00Z",
  "benefits": ["unlimited_polls", "2x_daily_spins", "early_access"]
}

Side effects:
- Deduct 1 Pi from user wallet
- Create subscription record with 30-day expiry
- Grant Pro badges and perks
- Log revenue transaction
