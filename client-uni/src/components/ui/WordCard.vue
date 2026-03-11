<template>
  <view class="word-card" :class="{ compact: compact }">
    <view class="card-decoration"></view>
    
    <view class="word-header">
      <view class="word-info">
        <text class="word-text">{{ word.word }}</text>
        <view class="phonetic-row">
          <text class="phonetic">/{{ word.phonetic }}/</text>
          <button class="audio-btn" @click="playAudio">
            <text class="audio-icon">SND</text>
          </button>
        </view>
      </view>
      <view v-if="word.tag" class="word-tag">
        <text class="tag-text">{{ word.tag }}</text>
      </view>
    </view>
    
    <view class="word-body">
      <text class="definition">{{ word.definition }}</text>
    </view>
    
    <view v-if="showActions" class="word-footer">
      <button class="action-btn bookmark" @click="bookmark">
        <text class="btn-icon">BK</text>
        <text class="btn-text">收藏</text>
      </button>
      <button class="action-btn detail" @click="viewDetail">
        <text class="btn-text">查看详情</text>
        <text class="btn-icon">→</text>
      </button>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  word: {
    type: Object,
    required: true,
    default: () => ({
      word: 'Serendipity',
      phonetic: 'ˌser.ənˈdɪp.ə.t̬i',
      definition: '意外发现美好事物的运气',
      tag: '每日一词',
    }),
  },
  compact: Boolean,
  showActions: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['play', 'bookmark', 'detail']);

const playAudio = () => {
  emit('play', props.word);
};

const bookmark = () => {
  emit('bookmark', props.word);
};

const viewDetail = () => {
  emit('detail', props.word);
};
</script>

<style scoped>
.word-card {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 12px -2px rgba(0, 0, 0, 0.05);
}

.card-decoration {
  position: absolute;
  top: -2rem;
  right: -2rem;
  width: 6rem;
  height: 6rem;
  background: rgba(43, 173, 238, 0.05);
  border-radius: 50%;
}

.word-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.word-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2badee;
  display: block;
  margin-bottom: 0.25rem;
}

.phonetic-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.phonetic {
  font-size: 0.875rem;
  color: #64748b;
  font-family: monospace;
}

.audio-btn {
  width: 2rem;
  height: 2rem;
  background: rgba(43, 173, 238, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.audio-btn:active {
  transform: scale(0.9);
  background: rgba(43, 173, 238, 0.2);
}

.audio-icon {
  font-size: 0.875rem;
}

.word-tag {
  background: rgba(43, 173, 238, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.tag-text {
  font-size: 0.625rem;
  color: #2badee;
  font-weight: 600;
}

.word-body {
  margin-bottom: 1rem;
}

.definition {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.6;
}

.word-footer {
  display: flex;
  gap: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 0.75rem;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.bookmark {
  background: #f1f5f9;
  color: #64748b;
}

.action-btn.detail {
  background: rgba(43, 173, 238, 0.1);
  color: #2badee;
}

.action-btn:active {
  transform: scale(0.95);
}

.btn-icon {
  font-size: 0.875rem;
}

/* Compact mode */
.word-card.compact {
  padding: 1rem;
}

.word-card.compact .word-text {
  font-size: 1.25rem;
}

.word-card.compact .word-footer {
  display: none;
}
</style>
