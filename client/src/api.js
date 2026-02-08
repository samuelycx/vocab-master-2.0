const API_URL = import.meta.env.VITE_API_URL || '/api';

export const API = {
    async getSessionWords(count = 10, category = 'GENERAL') {
        try {
            const url = `${API_URL}/word/session?count=${count}${category ? `&category=${category}` : ''}`;
            const res = await fetch(url);
            return await res.json();
        } catch (e) {
            console.error('Failed to fetch words', e);
            return [];
        }
    },

    async updateCategory(userId, category) {
        try {
            const res = await fetch(`${API_URL}/progress/set-category`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, category })
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to update category', e);
            return null;
        }
    },

    async getReviews(userId) {
        try {
            const res = await fetch(`${API_URL}/word/review?userId=${userId}`);
            return await res.json();
        } catch (e) {
            console.error('Failed to fetch reviews', e);
            return [];
        }
    },

    async getMistakes(userId) {
        try {
            const res = await fetch(`${API_URL}/word/mistakes?userId=${userId}`);
            return await res.json();
        } catch (e) {
            console.error('Failed to fetch mistakes', e);
            return [];
        }
    },

    async getLearnedWords(userId, page = 1, limit = 20, search = '') {
        try {
            const res = await fetch(`${API_URL}/word/learned?userId=${userId}&page=${page}&limit=${limit}&search=${search}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            console.error(e);
            return null;
        }
    },

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

    async syncProgress(userId, wordId, status, xp = 0, coins = 0) {
        try {
            const res = await fetch(`${API_URL}/progress/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    wordId,
                    status,
                    xpGained: xp,
                    coinsGained: coins
                })
            });
            return await res.json();
        } catch (e) {
            console.error('Sync failed', e);
            return null;
        }
    },

    async getStats(userId) {
        try {
            const res = await fetch(`${API_URL}/progress/stats?userId=${userId}`);
            return await res.json();
        } catch (e) {
            console.error('Failed to get stats', e);
            return null;
        }
    },

    async getAchievements() {
        // Mock or real endpoint. For now we might need a new endpoint or embed in stats.
        // Let's assume we fetch all definitions from a new endpoint.
        // But for speed, let's hardcode the definitions on client or fetch them.
        // Let's create a simple endpoint for definitions in backend if needed, 
        // or just hardcode visually in frontend?
        // Better to fetch. Let's add getAchievements to API.
        try {
            const res = await fetch(`${API_URL}/progress/achievements`);
            return await res.json();
        } catch (e) {
            return [];
        }
    },



    // --- System API ---
    async getSystemConfigs() {
        try {
            const res = await fetch(`${API_URL}/config`);
            return await res.json();
        } catch (e) {
            console.error('Failed to load configs', e);
            return { pk_arena_enabled: true }; // Default fallback
        }
    },

    // --- Admin API ---
    async createWord(wordData) {
        try {
            const res = await fetch(`${API_URL}/admin/word`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(wordData)
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to create word', e);
            return null;
        }
    },

    async deleteWord(wordId) {
        try {
            const res = await fetch(`${API_URL}/admin/word/${wordId}`, {
                method: 'DELETE'
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to delete word', e);
            return null;
        }
    },

    async toggleModule(key, enabled) {
        try {
            const res = await fetch(`${API_URL}/admin/module/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, enabled })
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to toggle module', e);
            return null;
        }
    },

    async getUsers() {
        try {
            const res = await fetch(`${API_URL}/admin/users`);
            return await res.json();
        } catch (e) {
            console.error('Failed to get users', e);
            return [];
        }
    },

    async setCategory(userId, category) {
        try {
            const res = await fetch(`${API_URL}/progress/set-category`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, category })
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to set category', e);
            return null;
        }
    },

    async banUser(userId) {
        try {
            const res = await fetch(`${API_URL}/admin/user/${userId}/ban`, {
                method: 'POST'
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to ban user', e);
            return null;
        }
    },

    async resetProgress(userId) {
        try {
            const res = await fetch(`${API_URL}/progress/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            return await res.json();
        } catch (e) {
            console.error('Reset failed', e);
            return null;
        }
    },
    async importWords(words) {
        try {
            const res = await fetch(`${API_URL}/admin/words/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(words)
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to import words', e);
            return null;
        }
    },

    async exportWords() {
        try {
            const res = await fetch(`${API_URL}/admin/words/export`);
            if (!res.ok) throw new Error('Export failed');
            return await res.json();
        } catch (e) {
            console.error('Failed to export words', e);
            return null;
        }
    },

    // --- Social API ---
    async getSocialFeed(userId) {
        try {
            const res = await fetch(`${API_URL}/social/feed/${userId}`);
            return await res.json();
        } catch (e) {
            console.error('Failed to fetch social feed', e);
            return [];
        }
    },

    async getLeaderboard() {
        try {
            const res = await fetch(`${API_URL}/social/leaderboard`);
            return await res.json();
        } catch (e) {
            console.error('Failed to fetch leaderboard', e);
            return [];
        }
    },

    async getFriends(userId) {
        try {
            const res = await fetch(`${API_URL}/social/friends/${userId}`);
            return await res.json();
        } catch (e) {
            console.error('Failed to fetch friends', e);
            return { following: [], followers: [] };
        }
    },

    async followUser(followerId, followingId) {
        try {
            const res = await fetch(`${API_URL}/social/follow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ followerId, followingId })
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to follow user', e);
            return null;
        }
    },

    async unfollowUser(followerId, followingId) {
        try {
            const res = await fetch(`${API_URL}/social/unfollow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ followerId, followingId })
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to unfollow user', e);
            return null;
        }
    },

    async searchUsers(query) {
        try {
            const res = await fetch(`${API_URL}/social/search?q=${encodeURIComponent(query)}`);
            return await res.json();
        } catch (e) {
            console.error('Failed to search users', e);
            return [];
        }
    }
};
