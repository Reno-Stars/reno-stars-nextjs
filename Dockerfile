# syntax=docker/dockerfile:1
#
# Reno Stars marketing site (www.reno-stars.com) — Next.js 16, port 3000.
#
# Three stages: pnpm dependency install, `next build`, and a runtime layer that
# carries only .next/standalone + .next/static + public.
#
# glibc, not alpine: node:alpine has no bash and sharp's prebuilt binaries are
# glibc-first. The site's /api/image route imports sharp.

FROM --platform=linux/amd64 node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
# packageManager pins pnpm@10.5.0 — corepack materialises exactly that version.
# It matters: pnpm 10 reads dependency-build settings under
# `onlyBuiltDependencies`, pnpm 11 reads `allowBuilds`, and each silently
# ignores the other's spelling. This repo currently needs neither (see below).
COPY package.json ./
RUN corepack enable && corepack install


# ---------------------------------------------------------------------------
# deps
# ---------------------------------------------------------------------------
# --ignore-scripts is about the ROOT package's `prepare: husky` lifecycle hook,
# not about dependencies: .git is excluded from the build context, so husky has
# nothing to install and the hook is pure dev tooling. Dependency build scripts
# are unaffected — pnpm blocks those by default and this repo has no
# pnpm-workspace.yaml / onlyBuiltDependencies list, i.e. every dependency here
# already installs with its scripts blocked on the Mac too (node_modules/
# .modules.yaml reports `pendingBuilds: []`). sharp 0.34.5 ships prebuilt
# @img/sharp-linux-x64 as an optional dependency and has no install script.
FROM base AS deps
COPY pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store-web,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts


# ---------------------------------------------------------------------------
# builder
# ---------------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* are inlined into the client bundle at build time, so they must
# be present HERE, not at run time. All of these are already public (they end up
# in the served HTML); no secret is baked in. Defaults are the production values
# so a plain `docker build` yields a correct image; override per environment.
ARG NEXT_PUBLIC_BASE_URL="https://www.reno-stars.com"
ARG NEXT_PUBLIC_STORAGE_PROVIDER="https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev"
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID="G-3EZTQFQ7XH"
ARG NEXT_PUBLIC_CLARITY_PROJECT_ID="w5mxyzdnlh"
ARG NEXT_PUBLIC_AW_CONVERSION_ID="AW-364086044"
ARG NEXT_PUBLIC_AW_CONVERSION_LABEL="Ndg-COCy8ckZEJyGzq0B"
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_PUBLIC_STORAGE_PROVIDER=$NEXT_PUBLIC_STORAGE_PROVIDER \
    NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID \
    NEXT_PUBLIC_CLARITY_PROJECT_ID=$NEXT_PUBLIC_CLARITY_PROJECT_ID \
    NEXT_PUBLIC_AW_CONVERSION_ID=$NEXT_PUBLIC_AW_CONVERSION_ID \
    NEXT_PUBLIC_AW_CONVERSION_LABEL=$NEXT_PUBLIC_AW_CONVERSION_LABEL \
    NODE_ENV=production \
    NEXT_OUTPUT_STANDALONE=1

RUN pnpm build \
 && test -f .next/standalone/server.js


# ---------------------------------------------------------------------------
# runtime
# ---------------------------------------------------------------------------
FROM --platform=linux/amd64 node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# `output: 'standalone'` traces the server into .next/standalone; .next/static
# and public/ are NOT traced and must be copied alongside it.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# ISR / fetch cache is written under .next/cache at run time; the standalone
# tree ships without it and the runtime user cannot create it under a root-owned
# WORKDIR.
RUN mkdir -p /app/.next/cache && chown -R node:node /app/.next

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/en/',{redirect:'manual'}).then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"

# Next's standalone server binds `process.env.HOSTNAME`. Kubernetes injects
# HOSTNAME=<pod-name> into every container, which would make the server try to
# bind an address it does not own — so pin it here at exec time rather than with
# ENV, which the kubelet would override.
CMD ["/bin/sh", "-c", "exec env HOSTNAME=0.0.0.0 node server.js"]
