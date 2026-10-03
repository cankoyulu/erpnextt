import { readFileSync } from 'node:fs';

// A linked checkout may live outside the bench's apps directory. Allow the
// development environment to supply the port without resolving a bench-relative file.
const webserver_port = process.env.FRAPPE_WEBSERVER_PORT ?? (
	JSON.parse(
		readFileSync(new URL('../../../sites/common_site_config.json', import.meta.url), 'utf8')
	) as { webserver_port: string | number }
).webserver_port;

export default {
	'^/(app|api|assets|files|private)': {
		target: `http://127.0.0.1:${webserver_port}`,
		ws: true,
		router: function (req) {
			const site_name = req.headers?.host?.split(':')[0];
			return `http://${site_name ?? 'localhost'}:${webserver_port}`;
		}
	}
};
