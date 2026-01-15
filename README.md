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
- `A @` -> `94.183.184.8`
- `A @` -> `94.183.184.130`
- `A www` -> `94.183.183.133`
- `A grafana` -> `94.183.183.133`
- `A grafana` -> `94.183.184.8`
- `A grafana` -> `94.183.184.130`
- `A prometheus` -> `94.183.183.133`
- `A prometheus` -> `94.183.184.8`
- `A prometheus` -> `94.183.184.130`

## Kubernetes

The manifests are in `k8s/`. Update the image names if you use a different registry.

```bash
kubectl apply -k k8s
```

Ingress is installed via Ansible and exposed as a LoadBalancer service with `externalIPs`.
Make sure `ingress_external_ips` in `ansible/inventory.ini` matches your DNS A records.

Monitoring for k8s is documented in `k8s/monitoring/README.md`.

### Provider firewall (required for full metrics)

Open these TCP ports **between your nodes only** (source: your node public IPs):
- `9100` (node-exporter)
- `10249` (kube-proxy)
- `10250` (kubelet)
- `10257` (kube-controller-manager)
- `10259` (kube-scheduler)
- `2381` (etcd metrics)

If your provider blocks these ports, Grafana dashboards will show partial data.

### Monitoring access (K8s)

Grafana and Prometheus are installed via Helm in the `monitoring` namespace.

Ingress hosts:
- Grafana: `http://grafana.kaiv.site`
- Prometheus: `http://prometheus.kaiv.site`

Port-forward alternative:
```bash
kubectl -n monitoring port-forward svc/kube-prometheus-grafana 3001:80
kubectl -n monitoring port-forward svc/kube-prometheus-kube-prome-prometheus 9090:9090
kubectl -n monitoring port-forward svc/loki 3100:3100
```

Grafana default login: `admin` / `admin` (change in `k8s/monitoring/values-kube-prometheus.yaml`).
Grafana ships only two curated dashboards by default (Node Exporter + Kubernetes cluster) from `k8s/monitoring/values-kube-prometheus.yaml`.

## Ansible

Inventory is in `ansible/inventory.ini`. Run from the repo root or set `ANSIBLE_CONFIG=/mnt/d/Projects/Codex-tests/ansible.cfg`. Update the IPs for your servers. Use SSH keys (recommended) or pass a password at runtime.

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbooks/setup-docker.yml
ansible-playbook -i ansible/inventory.ini ansible/playbooks/setup-k8s.yml
ansible-playbook -i ansible/inventory.ini ansible/playbooks/deploy-app.yml
```

If you use a private network, run Ansible from a host that can reach the servers.

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
