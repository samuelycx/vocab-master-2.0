const API_URL = 'http://localhost:3000';

export const API = {
    async login(username) {
        try {
            // First try to login
            let res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            let data = await res.json();

            if (!data.success) {
                // If failed, try to create (Auto-register for now per simple UX)
                res = await fetch(`${API_URL}/auth/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });
                data = await res.json();
            }
            return data;
        } catch (e) {
            console.error('Login failed', e);
            return { success: false, error: e.message };
        }
    },

    async syncProgress(userId, wordId, status) {
        try {
            await fetch(`${API_URL}/progress/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, wordId, status })
            });
        } catch (e) {
            console.error('Sync failed', e);
        }
    },

    async getStats(userId) {
        try {
            const res = await fetch(`${API_URL}/progress/stats?userId=${userId}`);
            return await res.json();
        } catch (e) {
            return null;
        }
    }
};
