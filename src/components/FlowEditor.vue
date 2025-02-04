<template>
    <div class="flow-editor">
        <button class="add-track-btn" @click="addTrack">Add Track</button>
        <div class="tracks-container">
            <Track v-for="(track, index) in tracks" :key="track.id" :trackIndex="index" :nodes="track.nodes"
                :editorState="editorState" @add-node="handleAddNode" @drop-node="handleNodeDrop" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Track from './Track.vue'
import type { TrackData, EditorState } from '../types'

const editorState = ref<EditorState>({
    draggingNode: null
})

const tracks = ref<TrackData[]>([])

const addTrack = () => {
    tracks.value.push({
        id: tracks.value.length,
        nodes: []
    })
}

const handleAddNode = (data: { trackIndex: number, insertIndex: number }) => {
    const track = tracks.value[data.trackIndex]
    track.nodes.splice(data.insertIndex, 0, Date.now())
}

const handleNodeDrop = (data: { toTrack: number, toIndex: number }) => {
    let { toTrack, toIndex } = data
    if (editorState.value.draggingNode === null) {
        return
    }
    const fromTrack = editorState.value.draggingNode.trackIndex
    const fromIndex = editorState.value.draggingNode.index

    // Get the node being moved
    const sourceTrack = tracks.value[fromTrack]
    const [movedNode] = sourceTrack.nodes.splice(fromIndex, 1)

    // Insert node at the new position
    if (fromTrack === toTrack) {
        if (toIndex > fromIndex) {
            toIndex--
        }
    }
    const targetTrack = tracks.value[toTrack]
    targetTrack.nodes.splice(toIndex, 0, movedNode)
    editorState.value.draggingNode = null
}
</script>

<style scoped>
.flow-editor {
    padding: 20px;
    background-color: var(--background-primary);
    min-height: 100vh;
}

.tracks-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 20px;
}

.add-track-btn {
    padding: 8px 16px;
    background-color: var(--accent-color);
    color: var(--text-primary);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.add-track-btn:hover {
    opacity: 0.9;
}
</style>
