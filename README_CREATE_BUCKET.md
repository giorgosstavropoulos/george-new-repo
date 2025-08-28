Create bucket helper server

This repository includes a tiny helper server that can create the `event-images` storage bucket in Supabase using a service role key.

1) Install dependencies

```bash
cd server
npm install express node-fetch body-parser
```

2) Run with environment variables (do NOT commit your service role key)

```bash
SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node create-bucket-server.js
```

3) The React app will call `http://localhost:8787/create-bucket` when it detects the bucket is missing. The server will create a public bucket named `event-images` and return the API response.

Security note: Keep the service role key secret. Only run this server in a trusted environment (local dev or secure server). For production consider implementing a proper authenticated admin endpoint. Avoid exposing the service role key to untrusted clients.
