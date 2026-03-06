<script>
import { INTER_BASE64, PLAYFAIR_BASE64 } from './static/fonts/font-data.js';
import './style.css';

export default {
	onLaunch: function() {
		console.log('App Launch')
			if (typeof wx !== 'undefined' && wx.cloud) {
				wx.cloud.init({
					env: wx.cloud.DYNAMIC_CURRENT_ENV,
					traceUser: true
				})
			}

		// Load Premium Fonts for Stitch 2.0 (Base64)
		// Cleanly loaded from imported font-data.js
		if (uni.loadFontFace) {
			// Inter - Premium Sans-serif
			uni.loadFontFace({
				family: 'Inter',
				global: true,
				source: 'url("data:font/woff2;base64,' + INTER_BASE64 + '")',
				success() { console.log('Inter font loaded successfully (Base64)') },
				fail(err) { console.error('Inter font base64 fail', err) }
			});
			// Playfair Display - Premium Serif
			uni.loadFontFace({
				family: 'Playfair Display',
				global: true,
				source: 'url("data:font/woff2;base64,' + PLAYFAIR_BASE64 + '")',
				success() { console.log('Playfair font loaded successfully (Base64)') },
				fail(err) { console.error('Playfair font base64 fail', err) }
			});
		}
	},
	onShow: function() {
		console.log('App Show')
	},
	onHide: function() {
		console.log('App Hide')
	}
}
</script>

<style>
/* Global CSS */

/* Reset some default styles for MP */
page {
	width: 100%;
	height: 100%;
}
</style>
