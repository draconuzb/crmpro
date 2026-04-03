# Pre-built static files — just serve with Nginx
FROM nginx:alpine AS production

# Copy pre-built dist (run `pnpm --filter web build` locally before docker build)
COPY apps/web/dist /usr/share/nginx/html

# Copy nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
