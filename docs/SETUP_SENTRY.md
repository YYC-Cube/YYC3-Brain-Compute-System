# Sentry Error Monitoring Setup Guide

## Quick Start

### 1. Create Sentry Project

1. Go to [Sentry.io](https://sentry.io) and sign up/login
2. Create a new project (select "Next.js" as platform)
3. Copy the **DSN** (Data Source Name) from project settings

### 2. Configure Environment Variables

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local and add your Sentry DSN
NEXT_PUBLIC_SENTRY_DSN=https://yourKey@o0.ingest.sentry.io/yourProjectId
```

### 3. Enable Sentry in Application

```bash
# Enable Sentry feature flag
NEXT_PUBLIC_ENABLE_SENTRY=true

# Set environment
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

### 4. Test Sentry Integration

```bash
# Run development server with Sentry enabled
pnpm dev

# Trigger a test error in browser console:
throw new Error('Sentry Test Error');
```

## Configuration Options

### Sample Rates

| Environment | Traces | Replay Session | Replay Error | Profiling |
|-------------|--------|----------------|--------------|-----------|
| Development | 0% | 0% | 0% | 0% |
| Staging     | 10% | 10% | 100% | 10% |
| Production  | 20-100% | 10-20% | 100% | 10% |

### Recommended Settings for YYC³

**Production:**
```env
SENTRY_TRACES_SAMPLE_RATE=0.2          # 20% of transactions traced
SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1 # 10% of sessions recorded
SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1.0 # All errors with replay
SENTRY_PROFILES_SAMPLE_RATE=0.1        # 10% of transactions profiled
```

**High-Traffic Production (>10k requests/hour):**
```env
SENTRY_TRACES_SAMPLE_RATE=0.05         # 5% to reduce costs
SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.02 # 2% session replay
```

## Features Enabled

### ✅ Error Tracking
- Automatic error capture
- Source map upload support
- Error grouping and deduplication
- Release tracking

### ✅ Performance Monitoring
- Transaction tracing (API calls, page loads)
- Web Vitals monitoring (LCP, FID, CLS)
- Slow transaction detection
- Database query tracing (if applicable)

### ✅ Session Replay
- DOM recording on errors
- User interaction playback
- Console log capture
- Network request visualization

### ✅ Security Features
- PII scrubbing (passwords, tokens, credit cards)
- Request/Response body filtering
- IP address anonymization option
- GDPR compliance support

## Deployment Checklist

- [ ] Sentry DSN configured in `.env.local`
- [ ] `NEXT_PUBLIC_ENABLE_SENTRY=true` set
- [ ] Environment correctly set (`production`/`staging`)
- [ ] Sample rates adjusted for traffic volume
- [ ] Source maps uploaded (for production)
- [ ] Alert rules configured in Sentry dashboard
- [ ] Team notification channels set up
- [ ] Error budget defined (SLA/SLO)

## Monitoring Dashboard Setup

### Key Metrics to Track

1. **Error Rate**: Target < 0.1% of requests
2. **Apdex Score**: Target > 0.95
3. **P95 Latency**: Target < 2000ms
4. **Crash-Free Users**: Target > 99.9%

### Recommended Alerts

- Critical error spike (>5x baseline)
- Performance regression (>50% slowdown)
- New error type introduced
- Error rate exceeds threshold

## Troubleshooting

### Errors not appearing in Sentry?
1. Check DSN is correct
2. Verify `NEXT_PUBLIC_ENABLE_SENTRY=true`
3. Check browser console for Sentry initialization errors
4. Ensure network requests to `ingest.sentry.io` aren't blocked

### Too many events?
1. Reduce sample rates
2. Add more patterns to `ignoreErrors`
3. Implement custom `beforeSend` filtering
4. Review Sentry quota usage

### Performance impact?
1. Disable profiling if not needed
2. Reduce replay sample rate
3. Use lazy loading for Sentry SDK
4. Monitor bundle size impact

## Cost Optimization

### Free Tier (Sentry)
- 5,000 errors/month
- 5,000 transactions/month
- Suitable for development/staging

### Paid Tier Recommendations
- Start with Team plan ($26/month)
- Scale to Business plan based on volume
- Consider self-hosted Sentry for full control

## Integration with CI/CD

```yaml
# GitHub Actions Example
- name: Upload Source Maps
  run: |
    npx @sentry/cli sourcemaps upload \
      --org your-org \
      --project your-project \
      --release ${GITHUB_SHA} \
      ./dist
```

## Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Best Practices Guide](https://docs.sentry.io/product/best-practices/serverless/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry/platforms/session-replay/)
