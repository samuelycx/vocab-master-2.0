<script setup>
import { UI_ICONS } from '../utils/ui-icons.js';
import { useI18n } from '../i18n.js';

const props = defineProps({
    level: Number,
    rankTitle: String,
    rankIcon: String,
    onClose: Function
});
const uiIcons = UI_ICONS;
const { t } = useI18n();
</script>

<template>
    <view class="fixed inset-0 bg-black bg-opacity-80 backdrop-blur z-60 flex items-center justify-center p-6" @click.stop="onClose">
        <view class="relative bg-white w-full max-w-sm rounded-4xl p-8 text-center shadow-2xl overflow-hidden animate-pop-in">
            <!-- Background Decorations -->
            <view class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <view class="absolute top-n-50p left-n-50p w-200p h-200p bg-slate-50 opacity-20 animate-spin-slow"></view>
            </view>

            <view class="relative z-10">
                <view class="text-6xl mb-4 animate-bounce-custom">
                    <image class="level-icon-image" :src="uiIcons.ok" mode="aspectFit" />
                </view>
                
                <text class="text-3xl font-black text-slate-800 mb-2 block">{{ t('levelup_title') }}</text>
                <text class="text-orange-500 font-bold uppercase tracking-widest text-sm mb-6 block">{{ t('levelup_subtitle') }}</text>
                
                <view class="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8 transform rotate-1 hover_rotate-0 transition-transform duration-300">
                    <text class="text-slate-400 text-xs uppercase font-bold mb-1 block">{{ t('levelup_rank_label') }}</text>
                    <text class="text-2xl font-black text-slate-800 block">{{ rankTitle || t('levelup_rank_unknown') }}</text>
                    <text class="text-primary font-bold mt-2 block">{{ t('levelup_level', { level }) }}</text>
                </view>

                <button @click="onClose" class="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 active_scale-95 transition-transform">
                    {{ t('levelup_cta') }}
                </button>
            </view>
        </view>
    </view>
</template>

<style scoped>
.level-icon-image {
    width: 96rpx;
    height: 96rpx;
}
.animate-pop-in {
    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.animate-spin-slow {
    animation: spin 10s linear infinite;
}

.animate-bounce-custom {
    animation: bounce 2s infinite;
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
