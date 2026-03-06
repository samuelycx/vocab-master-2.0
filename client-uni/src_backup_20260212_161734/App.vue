<script>
export default {
	onLaunch: function() {
		console.log('App Launch')
		if (typeof wx !== 'undefined' && wx.cloud) {
			wx.cloud.init({
				env: 'cloud1-5gafz7hr13d79ef4',
				traceUser: true
			})
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
