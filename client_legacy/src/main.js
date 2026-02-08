import { createApp } from 'vue';
import App from './App.js';

const app = createApp(App);

// Global error handler
app.config.errorHandler = (err) => {
    console.error('Vue Error:', err);
};

// Mount
app.mount('#app');

// Remove preloader
const preloader = document.getElementById('preloader');
if (preloader) {
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.remove(), 500);
    }, 500);
}
