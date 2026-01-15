# CalcOps DevOps Project

A simple calculator with a Node.js backend and static frontend, plus Docker-based observability (Prometheus, Grafana, Loki/Promtail), GitHub Actions CI/CD, Ansible automation, and Kubernetes manifests.

## Structure

- `backend/` Node.js API + Prometheus metrics
- `frontend/` Static UI served by Nginx with API proxy
- `monitoring/` Prometheus, Grafana, Loki, Promtail configs
- `docker-compose.yml` Local stack
- `ansible/` Inventory + playbooks (Docker + K8s + deploy)
- `k8s/` Kubernetes manifests

## Local run (Docker)

```bash
docker compose up --build
```

URLs:
- App: http://localhost:8080
- Backend: http://localhost:3000/health
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)
- Loki: http://localhost:3100

## Backend API

- `GET /api/calc?a=1&b=2&op=add`
- `POST /api/calc` with JSON `{ "a": 1, "b": 2, "op": "add" }`
- `GET /metrics` Prometheus metrics

## Servers (public IP)

Servers used:
- `server-O0Vs6g` (control-plane): `94.183.183.133`
- `server-wZvlaz-1` (worker): `94.183.184.8`
- `server-wZvlaz-2` (worker): `94.183.184.130`

DNS for `kaiv.site`:
- `A @` -> `94.183.183.133`
- `A www` -> `94.183.183.133`

If you want `kaiv.site` to serve on port 80/443, add an external load balancer or a reverse proxy on the control-plane node that forwards to the ingress NodePort.

## Kubernetes

The manifests are in `k8s/`. Update the image names if you use a different registry.

```bash
kubectl apply -k k8s
```

Ingress is installed via Ansible and exposed as a NodePort service.
To see the ports:
```bash
kubectl -n ingress-nginx get svc ingress-nginx-controller
```
Access via `http://<server-ip>:<nodeport>` or configure an external load balancer for 80/443.

Monitoring for k8s is documented in `k8s/monitoring/README.md`.

## Ansible

Inventory is in `ansible/inventory.ini`. Run from the repo root or set `ANSIBLE_CONFIG=/mnt/d/Projects/Codex-tests/ansible.cfg`. Update the IPs for your servers. Use SSH keys (recommended) or pass a password at runtime.

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbooks/setup-docker.yml
ansible-playbook -i ansible/inventory.ini ansible/playbooks/setup-k8s.yml
ansible-playbook -i ansible/inventory.ini ansible/playbooks/deploy-app.yml
```

Optional: if you use a private network, connect via your VPN/WireGuard solution.

## CI/CD (GitHub Actions)

Workflows:
- `CI` runs backend tests and builds Docker images.
- `Deploy` builds/pushes images to GHCR, runs server bootstrap (Docker + K8s), and deploys via Ansible.

### Required secrets

Add these in GitHub: `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`.

- `DEPLOY_SSH_KEY`: private SSH key for the servers (PEM format)
- `SSH_KNOWN_HOSTS`: output of `ssh-keyscan -H <server-ip>` for all servers

Optional:
- `GHCR_TOKEN`: personal access token with `write:packages` (if you do not want to use `GITHUB_TOKEN`)

If you use a password instead of SSH keys, do not store it in the repo. Pass it to Ansible with `-e ansible_password=...` or use Ansible Vault.

## GitHub repo setup

```bash
git init
git add .
git commit -m "Initial DevOps calculator project"
git branch -M main
git remote add origin https://github.com/<your-user>/<new-repo>.git
git push -u origin main
```
