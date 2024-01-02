import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5173,
		open: true
	}
	// server: {
	// 	proxy: {
	// 		'/api': {
	// 			 target: 'http://10.0.2.2:3000',
	// 			 changeOrigin: false,
	// 			 secure: false,      
	// 			 ws: false,
	// 		 }
	// 	}
	// }
});
