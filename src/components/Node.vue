<template>
    <div class="node"
     @mousedown.stop="handleMouseDown"
     :style="{ left: `${left}px`, width: `${width}px` }" :class="{ dragging: isDragging }" >
        {{ node.title }} | {{ node.id }}
    </div>
</template>

<script setup lang="ts">
import type { EditorState, NodeData, TrackData } from '../types'
import { computed } from 'vue'
const props = defineProps<{
    editorState: EditorState,
    node: NodeData,
    track: TrackData
}>()


const emit = defineEmits(['drag-start', 'drag-move', 'drag-end'])


const handleMouseDown = (event: MouseEvent) => {
    props.editorState.drag = {
        node: props.node,
        track: props.track,
        startX: event.clientX,
        startPosition: props.node.position
    }
    emit('drag-start')
}

const isDragging = computed(() => {
    return props.editorState.drag?.node.id === props.node.id
})



const left = computed(() => {
    return props.node.displayPosition * props.editorState.xUnit + props.editorState.gap
})

const width = computed(() => {
    return props.node.width * props.editorState.xUnit - 2*props.editorState.gap
})

</script>

<style scoped>
.node {
    position: absolute;
    background-color: var(--background-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 16px;
    user-select: none;
    color: var(--text-primary);
    height: 100px;
}
.dragging {
    border-color: var(--accent-color);
}
</style>
