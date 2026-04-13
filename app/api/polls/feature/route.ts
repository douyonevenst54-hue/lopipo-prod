POST /api/polls/feature/route.ts

Pins a poll to trending for 24-48 hours.

Request:
{
  "pollId": "poll_xxx",
  "userId": "pi_user_id",
  "featureDuration": "24h" or "48h",
  "pinType": "standard" (5 Pi) or "premium" (10 Pi)
}

Response:
{
  "featuredId": "feat_xxx",
  "pollId": "poll_xxx",
  "cost": 5,
  "expiresAt": "2024-05-10T12:00:00Z",
  "visibility": "trending_top"
}

Side effects:
- Deduct 5-10 Pi from user wallet
- Create featured_polls record
- Move poll to trending section top
- Queue removal task for expiry
- Log revenue + poll pin analytics
