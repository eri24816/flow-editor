<template>
    <div class="node" draggable="true" @dragstart="handleDragStart" @dragend="handleDragEnd">
        Node {{ nodeIndex }} {{ random }}
    </div>
</template>

<script setup lang="ts">
import type { EditorState } from '../types'
const props = defineProps<{
    nodeIndex: number
    trackIndex: number
    editorState: EditorState
}>()

const random = Math.random()

const emit = defineEmits(['drag-start'])

const handleDragStart = (event: DragEvent) => {
    props.editorState.draggingNode = {
        position: 0,
        trackIndex: props.trackIndex,
        index: props.nodeIndex
    }
    emit('drag-start', { nodeIndex: props.nodeIndex, trackIndex: props.trackIndex })
}

const handleDragEnd = () => {
    // Handle drag end if needed
}
</script>

<style scoped>
.node {
    background-color: var(--background-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 16px;
    min-width: 100px;
    cursor: move;
    user-select: none;
    color: var(--text-primary);
}

.node:hover {
    border-color: var(--accent-color);
}
</style>
