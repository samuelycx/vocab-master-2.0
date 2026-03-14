<script setup>
import { computed, onMounted } from 'vue';
import { getAchievementIconById } from '../utils/achievement-icons.js';

const props = defineProps({
    achievement: Object, // { name, description, icon }
    onClose: Function
});

onMounted(() => {
    document.body.style.overflow = 'hidden';
});

const badgeIcon = computed(() => getAchievementIconById(props.achievement?.id || 'default'));

const close = () => {
    document.body.style.overflow = '';
    props.onClose?.();
};
</script>

<template>
    <div class="modal-overlay" @click.self="close">
        <div class="modal-card">
            <div class="modal-content">
                <div class="badge-wrap">
                    <img class="badge-image" :src="badgeIcon" :alt="achievement?.name || 'achievement badge'" />
                </div>

                <div class="title">解锁新成就</div>
                <div class="achievement-name">{{ achievement?.name }}</div>
                <p class="achievement-desc">{{ achievement?.description }}</p>

                <button class="cta-btn" @click="close">
                    太棒了!
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
}

.modal-card {
    width: 100%;
    max-width: 360px;
    border-radius: 32px;
    background: #ffffff;
    padding: 32px 24px;
    box-shadow: 0 24px 48px rgba(17, 17, 17, 0.18);
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.badge-wrap {
    width: 96px;
    height: 96px;
    border-radius: 28px;
    background: #fef3c7;
    box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    animation: pulse 3s infinite;
}

.badge-image {
    width: 52px;
    height: 52px;
    object-fit: contain;
}

.title {
    font-size: 28px;
    font-weight: 800;
    color: #1f2937;
    margin-bottom: 8px;
}

.achievement-name {
    font-size: 24px;
    font-weight: 800;
    color: #111827;
    margin-bottom: 8px;
}

.achievement-desc {
    margin: 0 0 24px;
    font-size: 15px;
    line-height: 1.7;
    color: #94a3b8;
}

.cta-btn {
    width: 100%;
    min-height: 56px;
    border: none;
    border-radius: 18px;
    background: #111827;
    color: #ffffff;
    font-size: 18px;
    font-weight: 800;
}

.cta-btn:active {
    transform: scale(0.97);
}

@keyframes slideUp {
    from { transform: translateY(40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}
</style>
