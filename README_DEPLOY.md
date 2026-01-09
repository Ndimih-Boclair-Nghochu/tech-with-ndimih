# Deployment guide

This repository includes a GitHub Actions workflow that builds and pushes Docker images for the backend and frontend to GitHub Container Registry (GHCR).

Quick notes:

- The workflow is at `.github/workflows/build-and-push.yml` and runs on pushes to `main`/`master`.
- Images are published to `ghcr.io/<OWNER>/tech-with-ndimih-backend` and `ghcr.io/<OWNER>/tech-with-ndimih-frontend`.

Prerequisites for automated publish

- Ensure the repository is hosted on GitHub and you have GHCR enabled for your account/organization.
- The workflow uses the built-in `GITHUB_TOKEN` with `packages: write` permission (set in the workflow). No additional secrets are required to push to GHCR when using `GITHUB_TOKEN`.

Deploying the images

1. After the workflow publishes images, you can deploy them to any container platform (Render, AWS ECS, DigitalOcean App Platform, Azure App Service, a VPS, etc.).
2. Example: using a server with `docker-compose` — create a `docker-compose.override.yml` that references the GHCR images with the `:latest` tag and run `docker-compose pull && docker-compose up -d` on the server.

Manual local run

To run the project locally with Docker Compose (builds images locally):

```powershell
docker-compose build
docker-compose up
```

Optional: Heroku deploy (template)

- If you prefer Heroku, you can use the images pushed to GHCR or use Heroku container registry. You will need to set `HEROKU_API_KEY` as a GitHub secret and use a separate workflow or the official Heroku GitHub Action.

Optional: Render

- Render can deploy directly from this GitHub repo — after connecting the repo in Render, enable automatic deploys on push to `main`.

If you'd like, I can also:

- Add a Heroku deploy workflow template that uses `HEROKU_API_KEY` and `HEROKU_APP_NAME` secrets.
- Add an SSH-based workflow to deploy to a VPS using `appleboy/ssh-action` (requires `SSH_PRIVATE_KEY`, `SERVER_HOST`).
