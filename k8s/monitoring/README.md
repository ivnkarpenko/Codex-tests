# Monitoring on Kubernetes

This repo ships a local Docker Compose monitoring stack. For Kubernetes, install the standard Helm charts.

## Recommended Helm installs

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

helm install kube-prometheus prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace \
  -f k8s/monitoring/values-kube-prometheus.yaml
helm install loki grafana/loki-stack --namespace monitoring \
  -f k8s/monitoring/values-loki.yaml
```

Then point Grafana at Prometheus and Loki services, or use the built-in provisioning from the charts.

## Ingress

Two ingresses are included for public access:
- `k8s/monitoring/grafana-ingress.yaml` -> `grafana.kaiv.site`
- `k8s/monitoring/prometheus-ingress.yaml` -> `prometheus.kaiv.site`

Update the hostnames if you use different domains.

## Dashboards

Default dashboards are disabled; two curated dashboards are installed:
- Node Exporter Full (ID 1860)
- Kubernetes cluster (ID 315)

## Ansible

If you run `ansible/playbooks/setup-k8s.yml`, the charts are installed automatically with the values files above.
