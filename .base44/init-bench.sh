#!/bin/bash
set -euo pipefail

BENCH_DIR=/home/frappe/bench-data/frappe-bench
APP_DIR=/app

# Only create the bench once. Never reinstall an existing site's database.
if [ ! -x "$BENCH_DIR/env/bin/python" ]; then
    bench init --skip-assets --frappe-branch develop --python python3 "$BENCH_DIR"
fi
cd "$BENCH_DIR"

if [ ! -d apps/payments ]; then
    bench get-app https://github.com/frappe/payments.git --branch develop --skip-assets
fi
ln -sfn "$APP_DIR" apps/erpnext
printf 'frappe\npayments\nerpnext\n' > sites/apps.txt

# Dependencies live on mounted storage, so sync them after mounting it.
# Do not hide failed installations or mutate the checked-in Yarn lockfiles.
env/bin/python -m pip install --quiet -e apps/frappe -e apps/payments -e apps/erpnext
for app in frappe payments erpnext; do
    if [ -f "apps/$app/package.json" ]; then
        (cd "apps/$app" && yarn install --frozen-lockfile --non-interactive --ignore-scripts)
    fi
done
(cd "$APP_DIR/banking" && yarn install --frozen-lockfile --non-interactive)

python3 - <<'PY'
import json
from pathlib import Path

path = Path('sites/common_site_config.json')
config = json.loads(path.read_text()) if path.exists() else {}
config.update({
    'redis_cache': 'redis://redis:6379/0',
    'redis_queue': 'redis://redis:6379/1',
    'redis_socketio': 'redis://redis:6379/2',
    'webserver_port': 8000,
    'webserver_host': '127.0.0.1',
    'socketio_port': 9000,
    'socketio_backend': 'python',
    'default_site': 'test_site',
    'serve_default_site': True,
    'developer_mode': 1,
})
path.write_text(json.dumps(config, indent=2) + '\n')
PY

# The initial environment created this site already. If the bench is new,
# create a fresh development site rather than overwriting existing data.
if [ ! -f sites/test_site/site_config.json ]; then
    : "${FRAPPE_ADMIN_PASSWORD:?Provide the development site administrator password in Secrets}"
    bench new-site test_site --db-host mariadb --db-port 3306 \
        --db-root-username root --db-root-password root --admin-password "$FRAPPE_ADMIN_PASSWORD"
fi
installed_apps=$(bench --site test_site list-apps)
for app in payments erpnext; do
    if ! grep -qE "^${app}[[:space:]]" <<< "$installed_apps"; then
        bench --site test_site install-app "$app"
    fi
done
bench use test_site

# Use the framework's development server (including static assets and reload),
# not an unqualified gunicorn command outside the bench virtual environment.
# DEV_SERVER=0 keeps browser realtime URLs on the same proxied HTTPS origin;
# the Python reloader and bench watch are still enabled.
cat > Procfile <<'PROC'
web: DEV_SERVER=0 bench --site test_site serve --host 0.0.0.0 --port 8000 --proxy
socketio: bench socketio
watch: bench watch
schedule: bench schedule
worker: bench worker --queue short,default,long
PROC

bench build --app frappe,payments,erpnext
printf '\nBase44 bench initialization completed successfully.\n'
