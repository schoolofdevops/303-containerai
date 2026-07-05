# Acme Platform Runbooks

## Payments service
To restart the Acme payments service, run:
`kubectl rollout restart deploy/payments -n prod`.
The payments service depends on the Postgres primary in the `prod` namespace.

## Database backups
The Acme database backup runs nightly at 02:00 UTC and is stored in the
`s3://acme-backups` bucket. Backups are retained for 30 days. To restore, use
`acmectl db restore --from s3://acme-backups/<date>`.

## Checkout 503 errors
If the checkout page returns HTTP 503, the web tier is saturated. Scale it up:
`kubectl scale deploy/web --replicas=5 -n prod`. Then check the load balancer
health in the Acme dashboard.

## On-call escalation
Page the on-call engineer via the #acme-oncall Slack channel. If unacknowledged
for 15 minutes, the incident auto-escalates to the platform lead.
