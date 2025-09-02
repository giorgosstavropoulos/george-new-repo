Deploying this app (Netlify / Vercel)

Prereqs
- A GitHub repository (this workspace) with the code pushed to the remote.
- A Supabase project. You must set these environment variables in the Netlify/Vercel project settings:
  - VITE_SUPABASE_URL (your Supabase URL)
  - VITE_SUPABASE_ANON_KEY (your Supabase anon/public key)

Netlify (recommended)
1. Go to https://app.netlify.com/sites/new and connect your GitHub repo.
2. Set build command: npm run build
3. Set publish directory: dist
4. In Site settings → Build & deploy → Environment, add:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
5. Deploy the site. Netlify will provide a free *.netlify.app URL.

Vercel
1. Go to https://vercel.com/new and import the GitHub repo.
2. Set the framework to "Vite" or leave auto-detected.
3. Set build command: npm run build
4. Set output directory: dist
5. Add environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) in Project Settings → Environment Variables.
6. Deploy. Vercel will provide a free *.vercel.app URL.

Local preview
- Build locally: npm run build
- Preview: npm run preview

Notes
- For SPA routing to work on Netlify/Vercel we added a `_redirects` file and `netlify.toml`.
- Keep your Supabase keys private. Use the anon/public key for client usage.
- If you need help wiring secrets or automating the deploy, I can add GitHub Actions or a Netlify TOML more tailored to your repo.

GitHub Actions automatic deploy (Netlify)

1. Create a Netlify Personal Access Token:
   - In Netlify: User settings → Applications → Personal access tokens → New access token.
   - Copy the token.
2. Find your Netlify Site ID:
   - In the Netlify site dashboard → Site settings → Site details → Site ID.
3. In your GitHub repo settings → Secrets → Actions, add two secrets:
   - NETLIFY_AUTH_TOKEN = <your netlify personal access token>
   - NETLIFY_SITE_ID = <your netlify site id>
4. Push a commit to the `main` branch. The workflow `.github/workflows/deploy.yml` will build and deploy to Netlify automatically.

Notes
- The workflow deploys to the `main` branch. You can change the branch in `.github/workflows/deploy.yml` if you prefer a different branch.
- The action uses the Netlify CLI to deploy the `dist` directory. Ensure `npm run build` produces the site in `dist` (Vite default).
