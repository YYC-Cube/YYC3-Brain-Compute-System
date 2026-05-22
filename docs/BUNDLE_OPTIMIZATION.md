# Bundle Optimization Guide for YYC³ Brain Computer System

## Current Bundle Analysis

### How to Analyze Your Bundle

```bash
# Build with visualization
pnpm build:analyze

# Open generated report
open stats.html
```

### Expected Output
- **stats.html**: Interactive treemap visualization
- **Gzip size**: Compressed bundle size
- **Brotli size**: Modern compression size
- **Module dependency graph**: Shows which modules depend on what

## Optimization Strategies

### 1. Code Splitting (High Impact)

**Problem**: Large initial bundle slows page load

**Solution**: Implement route-based and component-based code splitting

```typescript
// Before: Eager loading
import { HeavyComponent } from './HeavyComponent';

// After: Lazy loading with React.lazy
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Usage with Suspense boundary
<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

**Priority Routes to Split**:
- `/devices` - Device management (likely large)
- `/audit` - Audit logs (heavy data tables)
- `/monitor` - Monitoring dashboard (charts, real-time data)
- `/alerts` - Alert management (complex UI)

### 2. Tree Shaking (Medium Impact)

**Problem**: Unused code included in bundle

**Solutions**:

#### a) Use ES Modules imports
```typescript
// Bad: Imports entire library
import _ from 'lodash';

// Good: Import specific functions
import { debounce, throttle } from 'lodash-es';
```

#### b) Use barrel exports carefully
```typescript
// Avoid this pattern if not all exports are used:
export * from './components';

// Prefer named re-exports:
export { Button } from './Button';
export { Input } from './Input';
```

### 3. Dependency Optimization (High Impact)

#### Large Dependencies to Address

| Package | Current Size | Target Size | Strategy |
|---------|-------------|-------------|----------|
| @mui/material | ~300KB | <150KB | Tree shaking, theme optimization |
| @mui/icons-material | ~200KB | <50KB | Icon-on-demand |
| emotion | ~80KB | <40KB | Cache extraction |
| radix-ui | ~50KB | <30KB | Already tree-shakeable |

#### MUI Optimization

```typescript
// mui/theme.ts - Optimize MUI imports
import { createTheme } from '@mui/material/styles';

// Only import needed components
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

// Or use auto-import plugin (recommended)
```

**Install MUI Optimizer**:
```bash
pnpm add -D @mui/material-nextjs-vite-plugin
```

```typescript
// vite.config.ts
import MuiNextjsVitePlugin from '@mui/material-nextjs-vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    MuiNextjsVitePlugin(),
    // ... other plugins
  ],
});
```

### 4. Asset Optimization (Medium Impact)

#### Images
```typescript
// Use Next.js Image optimization or manual optimization
import Image from 'next/image'; // If using Next.js
// OR use WebP/AVIF format with responsive images
```

#### Fonts
```css
/* Use font-display: swap for faster rendering */
@font-face {
  font-family: 'Inter';
  font-display: swap;
  src: url('/fonts/inter-var.woff2') format('woff2');
}
```

#### SVG Icons
```typescript
// Instead of icon libraries, use inline SVGs or SVG sprites
// This reduces bundle size significantly
```

### 5. Compression Configuration (Low Effort, High Impact)

**Gzip/Brotli Setup**:

```javascript
// vite.config.ts - Add compression plugin
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    // ... existing plugins
    compression({
      algorithm: 'brotliCompress',
      threshold: 10240, // Only compress files > 10KB
    }),
  ],
});
```

**Installation**:
```bash
pnpm add -D vite-plugin-compression
```

## Performance Budgets

### Targets for YYC³

| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| Initial JS Bundle | TBD | < 200KB gzipped | 🔴 Critical |
| First Contentful Paint | TBD | < 1.5s | 🟡 Important |
| Largest Contentful Paint | TBD | < 2.5s | 🟡 Important |
| Time to Interactive | TBD | < 3.0s | 🟢 Nice-to-have |
| Total Bundle Size | TBD | < 500KB gzipped | 🟡 Important |

## Implementation Roadmap

### Phase 1: Quick Wins (This Week)
- [ ] Install `@mui/material-nextjs-vite-plugin`
- [ ] Configure Brotli compression
- [ ] Run bundle analysis baseline
- [ ] Identify top 5 largest modules

### Phase 2: Code Splitting (Next Week)
- [ ] Implement lazy loading for `/devices` route
- [ ] Implement lazy loading for `/audit` route
- [ ] Add Suspense boundaries with loading states
- [ ] Test performance improvements

### Phase 3: Dependency Optimization (Following Week)
- [ ] Replace lodash with lodash-es
- [ ] Optimize MUI icon imports
- [ ] Remove unused Radix UI components
- [ ] Audit and remove dead code

### Phase 4: Advanced Optimization (Ongoing)
- [ ] Implement service worker caching
- [ ] Add prefetching for likely routes
- [ ] Optimize images and assets
- [ ] Monitor Core Web Vitals in production

## Monitoring & Maintenance

### Weekly Bundle Audits

```bash
# Add to CI/CD pipeline
pnpm build:analyze

# Check bundle size trends
# Alert if bundle grows > 10% week-over-week
```

### Automated Size Checks

```json
// package.json scripts
{
  "scripts": {
    "size-check": "bundlesize",
    "build:check": "pnpm build && pnpm size-check"
  }
}

// .bundlesizec.json
[
  {
    "path": "./dist/assets/*.js",
    "maxSize": "200 kB"
  }
]
```

## Tools & Resources

### Recommended Tools
- **[bundlephobia.com](https://bundlephobia.com)**: Check package sizes before installing
- **[webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)**: Visual analysis
- **[rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer)**: Already configured!
- **[lighthouse](https://developers.google.com/web/tools/lighthouse)**: Performance auditing

### Useful Commands

```bash
# Check individual package size
npx size-limit @mui/material

# Find large dependencies
npx depcheck

# Analyze tree shaking effectiveness
pnpm build --mode analyze
```

## Success Metrics

### After Optimization, Expect:
- ⚡ **30-50% reduction** in initial bundle size
- 🚀 **20-40% improvement** in LCP/FID metrics
- 💾 **Better cache hit rates** due to code splitting
- 📱 **Improved mobile experience** with smaller bundles
- 🔋 **Reduced bandwidth costs** for users

## Next Steps

1. **Run baseline analysis** today:
   ```bash
   pnpm build:analyze
   ```

2. **Review stats.html** and identify largest modules

3. **Implement Phase 1 optimizations** this week

4. **Measure impact** and iterate based on results

---

**Remember**: Bundle optimization is an ongoing process. Set up monitoring, establish budgets, and continuously improve!
