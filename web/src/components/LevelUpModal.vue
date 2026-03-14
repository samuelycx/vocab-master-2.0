<script setup>
import { onMounted } from 'vue';

const props = defineProps({
    level: Number,
    rankTitle: String,
    rankIcon: String,
    onClose: Function
});

onMounted(() => {
    document.body.style.overflow = 'hidden';
});

const close = () => {
    document.body.style.overflow = '';
    props.onClose?.();
};
</script>

<template>
    <div class="modal-overlay" @click.self="close">
        <div class="modal-card">
            <div class="modal-bg">
                <div class="modal-bg-disc"></div>
            </div>

            <div class="modal-content">
                <div class="hero-icon">
                    {{ rankIcon || '✅' }}
                </div>

                <div class="title">升级了</div>
                <div class="subtitle">新头衔已解锁</div>

                <div class="info-card">
                    <div class="info-label">当前头衔</div>
                    <div class="info-title">{{ rankTitle || '未知' }}</div>
                    <div class="info-level">Lv.{{ level }}</div>
                </div>

                <button class="cta-btn" @click="close">
                    继续冒险
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
    position: relative;
    width: 100%;
    max-width: 360px;
    border-radius: 32px;
    background: #ffffff;
    padding: 32px 24px;
    overflow: hidden;
    box-shadow: 0 24px 48px rgba(17, 17, 17, 0.18);
    animation: popIn 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
}

.modal-bg-disc {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(from 0deg, transparent 0deg, rgba(251, 191, 36, 0.2) 30deg, transparent 60deg);
    animation: spin 10s linear infinite;
}

.modal-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.hero-icon {
    font-size: 56px;
    margin-bottom: 16px;
    animation: bounce 2s infinite;
}

.title {
    font-size: 32px;
    line-height: 1.1;
    font-weight: 800;
    color: #1f2937;
    margin-bottom: 8px;
}

.subtitle {
    font-size: 12px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-weight: 800;
    color: #f97316;
    margin-bottom: 24px;
}

.info-card {
    width: 100%;
    border-radius: 24px;
    border: 1px solid #f1f5f9;
    background: #f8fafc;
    padding: 24px;
    margin-bottom: 24px;
    transform: rotate(1deg);
}

.info-label {
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 800;
    color: #94a3b8;
    margin-bottom: 6px;
}

.info-title {
    font-size: 28px;
    font-weight: 800;
    color: #1f2937;
    margin-bottom: 8px;
}

.info-level {
    font-size: 18px;
    font-weight: 800;
    color: #6f58d9;
}

.cta-btn {
    width: 100%;
    min-height: 56px;
    border: none;
    border-radius: 18px;
    background: #6f58d9;
    color: #ffffff;
    font-size: 18px;
    font-weight: 800;
    box-shadow: 0 14px 28px rgba(111, 88, 217, 0.26);
}

.cta-btn:active {
    transform: scale(0.97);
}

@keyframes popIn {
    0% { transform: scale(0.5); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}
</style>
