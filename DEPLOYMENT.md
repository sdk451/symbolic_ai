# 🚀 Netlify Deployment Guide

This guide provides comprehensive instructions for deploying the Symbolic AI website to Netlify using automated workflows.

## 📋 Prerequisites

### Required Tools
- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) (for local deployment)
- [GitHub Account](https://github.com/) (for automated deployment)

### Required Accounts
- [Netlify Account](https://app.netlify.com/)
- [GitHub Account](https://github.com/)

## 🔧 Setup Instructions

### 1. Install Netlify CLI
```bash
npm install -g netlify-cli
```

### 2. Login to Netlify
```bash
netlify login
```

### 3. Link Your Site (First Time Only)
```bash
netlify link
```

## 🎯 Deployment Options

### Option 1: Automated GitHub Actions (Recommended)

This is the **recommended approach** for production deployments.

#### Setup Steps:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add automated deployment"
   git push origin main
   ```

2. **Create a new Netlify site**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
     - **Functions directory**: `netlify/functions`

3. **Configure GitHub Secrets**
   In your GitHub repository settings, add these secrets:
   - `NETLIFY_SITE_ID`: Your Netlify site ID
   - `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token

4. **Get Netlify Site ID**
   ```bash
   netlify status
   ```

5. **Get Netlify Auth Token**
   - Go to [Netlify User Settings](https://app.netlify.com/user/applications#personal-access-tokens)
   - Click "New access token"
   - Copy the token

#### How It Works:
- **Pull Requests**: Automatically creates preview deployments
- **Main Branch**: Automatically deploys to production
- **Quality Gates**: Runs tests, linting, and type checking before deployment
- **Security**: Weekly security audits and dependency reviews

### Option 2: Manual CLI Deployment

For quick deployments or testing.

#### Local Development
```bash
# Start local development server
.\scripts\deploy.ps1 local
# or
npm run dev:netlify
```

#### Preview Deployment
```bash
# Deploy preview
.\scripts\deploy.ps1 preview
# or
netlify deploy --dir=dist
```

#### Production Deployment
```bash
# Deploy to production
.\scripts\deploy.ps1 production
# or
netlify deploy --prod --dir=dist
```

#### Automated Deployment (with quality checks)
```bash
# Run all checks and deploy
.\scripts\deploy.ps1 automated
```

### Option 3: Netlify Dashboard

For one-time deployments or configuration changes.

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site
3. Go to "Deploys" tab
4. Click "Trigger deploy" → "Deploy site"

## 🔒 Environment Variables

Configure these in your Netlify dashboard under **Site settings** → **Environment variables**:

### Required Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Netlify Functions
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
N8N_WEBHOOK_URL=your_n8n_webhook_url
N8N_WEBHOOK_SECRET=your_webhook_secret
```

### Optional Variables
```bash
# Analytics
VITE_GA_TRACKING_ID=your_ga_tracking_id

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

## 📊 Monitoring & Analytics

### Deployment Status
- **GitHub Actions**: Check the Actions tab in your repository
- **Netlify Dashboard**: Monitor deployments in the Deploys tab
- **Status Page**: Use `netlify status` command

### Performance Monitoring
- **Netlify Analytics**: Built-in performance metrics
- **Lighthouse**: Automated performance audits in CI/CD
- **Error Tracking**: Netlify Functions error logs

## 🛠️ Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build locally
npm run build

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint
```

#### Function Deployment Issues
```bash
# Test functions locally
netlify dev

# Check function logs
netlify functions:list
netlify functions:invoke function-name
```

#### Environment Variable Issues
- Verify all required environment variables are set in Netlify dashboard
- Check variable names match exactly (case-sensitive)
- Ensure no extra spaces or quotes

### Debug Commands
```bash
# Check Netlify status
netlify status

# View deployment logs
netlify logs

# Test functions locally
netlify dev

# Check site configuration
netlify open:admin
```

## 🔄 CI/CD Pipeline

The automated deployment pipeline includes:

### Quality Assurance
- ✅ TypeScript type checking
- ✅ ESLint code quality checks
- ✅ Comprehensive test suite (73 tests)
- ✅ Test coverage reporting
- ✅ Security vulnerability scanning

### Deployment Stages
1. **Pull Request**: Preview deployment with quality checks
2. **Main Branch**: Production deployment with full validation
3. **Security**: Weekly automated security audits

### Rollback Strategy
- **Netlify Dashboard**: One-click rollback to previous deployment
- **Git Revert**: Revert commits and push to trigger new deployment
- **Manual Deploy**: Deploy specific commit from Netlify dashboard

## 📈 Performance Optimization

### Build Optimization
- **Vite**: Fast build times with HMR
- **Code Splitting**: Automatic chunk optimization
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: Image and CSS optimization

### Runtime Optimization
- **Netlify CDN**: Global content delivery
- **Edge Functions**: Serverless functions at the edge
- **Caching**: Intelligent caching strategies
- **Compression**: Automatic gzip/brotli compression

## 🚨 Emergency Procedures

### Quick Rollback
```bash
# Rollback to previous deployment
netlify rollback

# Or deploy specific commit
netlify deploy --prod --dir=dist --message="Emergency rollback"
```

### Emergency Contact
- **Netlify Support**: [support.netlify.com](https://support.netlify.com/)
- **GitHub Issues**: Create issue in repository
- **Team Slack**: #dev-ops channel

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Deployment Guide](https://supabase.com/docs/guides/hosting/overview)

---

**Need Help?** Check the troubleshooting section above or create an issue in the repository.
