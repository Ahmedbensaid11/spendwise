# SpendWise

SpendWise is a personal finance application with a React and TypeScript frontend, a Spring Boot REST API, and PostgreSQL.

## Run the API and database with Docker Compose

1. Copy `.env.example` to `.env` if you do not already have a local `.env` file. Set a local database password and a JWT secret of at least 32 characters.
2. From the repository root, build and start the database and API:

   ```powershell
   docker compose up --build -d
   ```

3. Check that both services are healthy/running:

   ```powershell
   docker compose ps
   docker compose logs -f api
   ```

The API is available at `http://localhost:9091` by default. PostgreSQL is available to local tools at `localhost:5433`; the API connects to the database over the Compose network. The named `pgdata` volume keeps the database between container restarts.

## Run the frontend

The Vite development server proxies `/api` requests to port 9090 by default. For the Docker API on port 9091, set the target in the frontend terminal:

```powershell
cd frontend
npm ci
$env:VITE_API_PROXY_TARGET = "http://localhost:9091"
npm run dev
```

Open the local URL printed by Vite.

## Stop the local services

From the repository root:

```powershell
docker compose down
```

This stops the containers and keeps the PostgreSQL volume for the next run.

## Deploy to an Oracle Cloud VM and Cloudflare Pages

The production Compose file keeps PostgreSQL private and publishes the API only on the VM's loopback interface. Nginx is the public entry point for the API; the React frontend is built and hosted separately on Cloudflare Pages.

### 1. Prepare the Oracle VM

Create an Ubuntu compute instance with a public IP and SSH key. In the VCN security list or network security group, allow inbound TCP 80 and 443, and allow SSH (22) only from your own IP. Do not open PostgreSQL (5432) or the API port (9090) to the internet. Install Docker Engine and the Docker Compose plugin using Docker's [Ubuntu installation guide](https://docs.docker.com/engine/install/ubuntu/).

### 2. Configure the API and database

Clone the repository on the VM. Create `.env.production` from `.env.production.example`, then set unique production values for `DB_PASSWORD` and `JWT_SECRET`. Set `APP_CORS_ALLOWED_ORIGINS` to the exact Cloudflare Pages origin (for example, `https://spendwise.pages.dev`). Keep `.env.production` on the VM; it is ignored by Git.

Start the production API and database from the repository root:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

The production database uses its own named volume. It has no published port, and the API is reachable from the VM only at `127.0.0.1:9090`.

### 3. Put Nginx in front of the API

Create an `A` record such as `api.your-domain.example` pointing to the VM's public IP. Copy `deploy/nginx/spendwise.conf.example` to the VM's Nginx site configuration, replace the example hostname with your API hostname, enable the site, validate with `sudo nginx -t`, and reload Nginx. Nginx forwards API requests to the loopback-only container port.

Issue and install an HTTPS certificate with [Certbot's Nginx instructions](https://certbot.eff.org/instructions?os=ubuntufocal&ws=nginx). For the HTTP-01 setup, ensure the API hostname resolves to the VM and port 80 reaches Nginx. Certbot can configure HTTPS and the HTTP-to-HTTPS redirect; verify renewal with `sudo certbot renew --dry-run`.

### 4. Publish the frontend on Cloudflare Pages

Connect the repository to Cloudflare Pages and configure the monorepo build as follows:

- Root directory: `frontend`
- Build command: `npm run build`
- Build output directory: `dist`
- Build environment variable `VITE_API_BASE_URL`: `https://api.your-domain.example/api`

Replace the example hostname with your real API hostname. Vite embeds this variable during the Pages build. Add the final Pages origin to `APP_CORS_ALLOWED_ORIGINS` in `.env.production`, then recreate the API container so Spring reads the updated setting. Cloudflare Pages supports `npm run build` and `dist` for React (Vite) projects; the included `_redirects` file enables client-side routes and `_headers` sets basic browser security headers.

Oracle VM creation, DNS records, Cloudflare Pages configuration, and HTTPS issuance happen in your cloud accounts; this repository contains the app-side deployment configuration and steps.

### No-card alternative for the backend

If Oracle's card verification blocks your account, deploy the Spring Boot API as a free Docker web service on Render and use Neon Free for PostgreSQL. This replaces the Oracle VM and host-managed Nginx portion of the deployment plan. Render Free services sleep after 15 minutes without requests, so the first request after idle can take about a minute. Neon Free currently includes 1 GB of database storage per project. These free tiers are suitable for a portfolio demo, not an always-on production service.

1. Create a PostgreSQL project on Neon. Copy its PostgreSQL connection details; use the pooled connection string if Neon offers one, and make sure it includes `sslmode=require`.
2. In Render, create a **Web Service** from `Ahmedbensaid11/spendwise`, choose the **Docker** runtime and **Free** instance, and set the Dockerfile path to `backend/Dockerfile` and Docker context to `backend`.
3. Add these environment variables to the Render service:
   - `SPRING_DATASOURCE_URL`: Neon JDBC URL, using `jdbc:postgresql://` and the host, database, and `sslmode=require` from Neon
   - `SPRING_DATASOURCE_USERNAME`: Neon database role
   - `SPRING_DATASOURCE_PASSWORD`: Neon database password
   - `JWT_SECRET`: a randomly generated secret of at least 32 characters
   - `APP_CORS_ALLOWED_ORIGINS`: the exact Cloudflare Pages site origin, such as `https://spendwise.pages.dev`
4. Let Render provide its `PORT` variable; Spring Boot now uses that port and falls back to `9090` for local development.
5. After Render deploys, copy its HTTPS service URL. In Cloudflare Pages, add the build-time variable `VITE_API_BASE_URL` with value `<Render URL>/api`, then redeploy the frontend.

Render documents its free deployment tutorial as requiring no payment method. The free web service sleeps after 15 minutes of inactivity, and Neon Free provides 1 GB per project. See [Render free deploys](https://render.com/docs/your-first-deploy), [Render free service limits](https://render.com/docs/free), and [Neon Free plan update](https://neon.com/blog/neon-free-plan-1-gb-per-project).
