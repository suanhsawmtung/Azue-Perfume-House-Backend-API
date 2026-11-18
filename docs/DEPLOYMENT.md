# Production deployment

Production runs on the existing Ubuntu 24.04 DigitalOcean Droplet. The backend is built with Node.js 24 and pnpm 10.8.0, then managed by PM2 as `azue-perfume-house-api` behind the existing Nginx configuration.

The GitHub Actions workflow is `.github/workflows/deploy-production.yml`. It runs only after a push to `main` and serializes production deployments so two deployments cannot overlap.

## Required GitHub Secrets

Configure these repository secrets under **Settings → Secrets and variables → Actions**:

| Secret | Value |
| --- | --- |
| `DO_HOST` | Droplet hostname or IP address |
| `DO_USERNAME` | Linux user that owns or can deploy the backend checkout and manages the PM2 process |
| `DO_SSH_PRIVATE_KEY` | Private SSH key for `DO_USERNAME`, including the full `BEGIN`/`END` lines |
| `DO_SSH_PORT` | SSH port, normally `22` |
| `DO_BACKEND_PATH` | Absolute path to the existing backend Git checkout on the Droplet |
| `DO_KNOWN_HOSTS` | Independently verified SSH host-key entry for the Droplet, in OpenSSH `known_hosts` format |

Do not commit the private key or production environment variables. The workflow does not read, change, or replace the server-side `.env` file.

## Server prerequisites

These checks run during every deployment and fail before installation or PM2 restart when a prerequisite is missing:

- The `DO_KNOWN_HOSTS` value is the independently verified host key for the Droplet.
- The SSH user can access `DO_BACKEND_PATH`.
- `DO_BACKEND_PATH` is the existing Git checkout and has an `origin` remote.
- The checkout can fetch `origin/main` non-interactively. If the repository is private, configure a deploy key or another non-interactive Git credential on the Droplet for this checkout. Do not put that credential in this workflow.
- Node.js 24 is available on the SSH user’s non-interactive `PATH`.
- pnpm 10.8.0 is available on the SSH user’s non-interactive `PATH`.
- PM2 is available on the SSH user’s non-interactive `PATH`, and that user manages `azue-perfume-house-api`.
- The server-side production environment and upload directories already exist.

Before enabling the workflow, log in as `DO_USERNAME` and verify:

```bash
cd /absolute/path/to/backend
git remote -v
git fetch origin main
node --version
pnpm --version
pm2 describe azue-perfume-house-api
```

The expected versions are Node.js `v24.x` and pnpm `10.8.0`. The workflow uses the SSH user’s non-interactive shell, so version managers must be initialized for that shell or the binaries must be on its standard `PATH`.

For a private GitHub repository, use a read-only deploy key associated with the repository or configure the server’s existing credential helper/SSH setup. Confirm `git fetch origin main` works without a prompt before enabling automatic deployment.

## How automatic deployment works

After a push to `main`, GitHub Actions connects to the Droplet and:

1. Checks the required workflow secrets.
2. Checks the SSH connection using the configured private key.
3. Verifies the backend directory, Git checkout, Node.js, pnpm, and PM2.
4. Fetches `origin/main` and fast-forwards the local `main` checkout. A dirty, ahead, or diverged checkout causes the deployment to stop.
5. Runs `pnpm install --frozen-lockfile`.
6. Runs `pnpm build`.
7. Restarts `azue-perfume-house-api` with PM2.
8. Confirms the PM2 process status is `online`.

The workflow never runs `pnpm dev`, runs database migrations, restarts Nginx, changes production environment variables, or modifies uploads. A failed install or build prevents the PM2 restart.

## Inspecting logs

In GitHub, open the repository’s **Actions** tab, select **Deploy production**, and open the workflow run and **Deploy to DigitalOcean** job. The workflow prints step names and command results but does not print secret values.

On the Droplet, PM2 logs can be inspected with:

```bash
pm2 status azue-perfume-house-api
pm2 logs azue-perfume-house-api --lines 100
pm2 describe azue-perfume-house-api
```

## Troubleshooting

- **SSH fails:** verify `DO_HOST`, `DO_USERNAME`, `DO_SSH_PORT`, the private key format, and the user’s `authorized_keys` entry. Confirm the user can log in using the same key.
- **Host key verification fails:** independently verify the Droplet host key and update `DO_KNOWN_HOSTS` with the complete OpenSSH `known_hosts` entry. The workflow uses `StrictHostKeyChecking=yes` and does not dynamically trust host keys.
- **Git fetch fails:** log in as the deployment user and fix the checkout’s `origin` authentication. The workflow intentionally stops before building when fetch cannot complete.
- **Node, pnpm, or PM2 is missing:** install or expose the required tool in the SSH user’s non-interactive `PATH`, then rerun the prerequisite commands.
- **Build fails:** inspect the GitHub Actions build output and run `pnpm install --frozen-lockfile` followed by `pnpm build` manually in the checkout. PM2 is not restarted after a failed build.
- **PM2 is not online after restart:** inspect `pm2 logs azue-perfume-house-api --lines 100`, verify the server-side `.env`, and confirm the PM2 process still uses the existing application name.

## Manual deployment

If Actions is unavailable, log in to the Droplet as the PM2 deployment user and run:

```bash
cd /absolute/path/to/backend
git fetch --prune origin main
git checkout main
git merge --ff-only origin/main
pnpm install --frozen-lockfile
pnpm build
pm2 restart azue-perfume-house-api
pm2 jlist
```

Confirm the process is `online` before considering the deployment complete. Do not run database migrations unless they are separately reviewed and approved.
