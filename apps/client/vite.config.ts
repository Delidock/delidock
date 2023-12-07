import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(async ()=> {
	const config = {
		plugins: [sveltekit()],
		server: {
		  host: '0.0.0.0', // listen on all addresses
		  port: 5173,
		  strictPort: true,
		  hmr: {
			protocol: 'ws',
			host: '192.168.0.88',
			port: 5183,
		  },
		},
	  }
	return config
});
