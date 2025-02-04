<template>
    <div class="track" @click="handleTrackClick" @dragover="handleDragOver" @dragleave="handleDragLeave" @drop.prevent="handleDrop" ref="trackEl">
        <Node v-for="(node, index) in nodes" :key="node" :nodeIndex="index" :trackIndex="trackIndex"
            :editorState="editorState" @drag-start="handleDragStart" ref="nodeEls" />
        <div class="drop-placeholder" :class="{ visible: isDraggingOver }" :style="placeholderStyle"></div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import Node from './Node.vue'
import type { EditorState } from '../types'
const nodeEls = ref<ComponentPublicInstance[]>([])
const trackEl = ref<HTMLElement>()

const props = defineProps<{
    trackIndex: number,
    nodes: number[],
    editorState: EditorState
}>()

const emit = defineEmits(['add-node', 'drop-node'])

const isDraggingOver = ref(false)
const placeholderStyle = ref({
    left: '0px',
    display: 'none'
})

const handleTrackClick = (event: MouseEvent) => {
    const trackRect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const clickX = event.clientX - trackRect.left
    const insertIndex = calculateDropIndex(clickX)
    emit('add-node', { trackIndex: props.trackIndex, insertIndex })
}

const handleDragStart = (data: { nodeIndex: number, trackIndex: number }) => {
    isDraggingOver.value = true
}

const handleDragOver = (event: DragEvent) => {
    if (props.editorState.draggingNode === null) {
        return
    }
    event.preventDefault()

    const trackRect = trackEl.value!.getBoundingClientRect()
    const mouseX = event.clientX - trackRect.left

    const { position, index } = calculatePlaceholderPosition(mouseX)
    // if the node does not move, then don't show the placeholder
    if (
        (index == props.editorState.draggingNode.index || index == props.editorState.draggingNode.index + 1)
        && props.editorState.draggingNode.trackIndex == props.trackIndex
    ) {
        placeholderStyle.value = {
            left: '0px',
            display: 'none'
        }
        return
    }
    placeholderStyle.value = {
        left: `${position}px`,
        display: 'block'
    }
}

const handleDragLeave = (event: DragEvent) => {
    // if the mouse if out of the bounding box, then it is a drag leave
    const rect = trackEl.value!.getBoundingClientRect()
    if (event.clientX <= rect.left || event.clientX >= rect.right ||
        event.clientY <= rect.top || event.clientY >= rect.bottom) {
        isDraggingOver.value = false
        placeholderStyle.value.display = 'none' 
    }
}

const handleDrop = (event: DragEvent) => {
    isDraggingOver.value = false
    placeholderStyle.value.display = 'none'

    if (props.editorState.draggingNode !== null) {
        const dropIndex = calculateDropIndex(event.clientX)
        emit('drop-node', {
            toTrack: props.trackIndex,
            toIndex: dropIndex
        })
    }
}

const getNodeRects = () => {
    const trackRect = trackEl.value!.getBoundingClientRect()
    const rects = nodeEls.value.map(node => {
        const rect = node.$el.getBoundingClientRect()
        return {
            left: rect.left - trackRect.left,
            right: rect.right - trackRect.left,
            width: rect.width
        }
    })
    // sort by left
    return rects.sort((a, b) => a.left - b.left)
}

const calculateDropIndex = (mouseX: number): number => {
    const trackRect = trackEl.value!.getBoundingClientRect()
    const rects = getNodeRects()

    for (let i = 0; i < rects.length; i++) {
        const nodeCenter = rects[i].left + rects[i].width / 2 - trackRect.left

        if (mouseX < nodeCenter) {
            return i
        }
    }

    return props.nodes.length
}

const calculatePlaceholderPosition = (mouseX: number): { position: number, index: number } => {
    const nodeRects = getNodeRects()
    const insertionIndex = calculateDropIndex(mouseX)
    const defaultGap = 16
    // place the placeholder at the middle of left node and right node
    if (insertionIndex === 0) {
        // return nodeRects[0].left
        return {
            position: defaultGap / 2,
            index: insertionIndex
        }
    }
    if (insertionIndex === nodeRects.length) {
        return {
            position: nodeRects[nodeRects.length - 1].right + defaultGap / 2,
            index: insertionIndex
        }
    }
    const left = nodeRects[insertionIndex - 1].right
    const right = nodeRects[insertionIndex].left
    return {
        position: (left + right) / 2,
        index: insertionIndex
    }
}

</script>

<style scoped>
.track {
    background-color: var(--background-secondary);
    min-height: 100px;
    border-radius: 8px;
    padding: 16px;
    position: relative;
    display: flex;
    gap: 16px;
    align-items: center;
}

.drop-placeholder {
    position: absolute;
    width: 0px;
    height: 80px;
    background-color: rgba(100, 108, 255, 0.3);
    border: 2px dashed var(--accent-color);
    border-radius: 6px;
    pointer-events: none;
    display: none;
}

.drop-placeholder.visible {
    display: block;
}
</style>
