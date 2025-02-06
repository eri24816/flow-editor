<template>
    <div class="flow-editor">
        <button class="add-track-btn" @click="addTrack">Add Track</button>
        <div class="tracks-container">
            <Track v-for="[trackId, track] in editorState.tracks" :key="trackId" :track="track"
                :editorState="editorState" @add-node="handleAddNode" @drag-start="handleDragStart" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Track from './Track.vue'
import type { EditorState, TrackData, NodeData } from '../types'
import { generateId } from '../util'

const editorState = ref<EditorState>({
    drag: null,
    trackUnderMouse: null,
    xUnit: 100,
    gap: 10,
    tracks: new Map()
})

const addTrack = () => {
    const trackId = generateId()
    editorState.value.tracks.set(trackId, {
        id: trackId,
        nodes: new Map()
    })
}

const handleAddNode = (data: { trackId: number, mousePos: number }) => {
    const { trackId, mousePos } = data
    const track = editorState.value.tracks.get(trackId)
    if (!track) {
        return
    }
    const nodeId = generateId()
    track.nodes.set(nodeId, {
        title: 'New Node',
        width: 2,
        position: mousePos,
        displayPosition: mousePos,
        id: nodeId
    })
}

const handleDragStart = (event: MouseEvent) => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (event: MouseEvent) => {
    if (!editorState.value.drag) return
    const deltaX = event.clientX - editorState.value.drag.startX
    let newPosition = editorState.value.drag.startPosition + Math.round(deltaX / editorState.value.xUnit)
    newPosition = Math.max(0, newPosition)
    const toTrackId = editorState.value.trackUnderMouse?.id ?? editorState.value.drag.track.id
    if (newPosition != editorState.value.drag.node.position || toTrackId != editorState.value.drag.track.id) {
        handleDragMove(
            editorState.value.drag.node.id,
            editorState.value.drag.track.id,
            toTrackId,
            editorState.value.drag.node.position,
            newPosition
        )
    }
}

const handleMouseUp = (event: MouseEvent) => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    editorState.value.drag = null
    applyDisplayPosition()
}

const nodeOverlap = (a: NodeData, b: NodeData) => {
    let overlap = Math.min(a.position + a.width, b.position + b.width) - Math.max(a.position, b.position)
    return Math.max(overlap, 0)
}

const updateOtherNodesPosition = (track: TrackData, targetNode: NodeData) => {
    const nodes = track.nodes
    const nodesSorted = Array.from(nodes.values()).sort((a, b) => a.position - b.position 
    + 0.1*(a.id==targetNode.id?-1:1) - 0.1* (b.id==targetNode.id?-1:1))
    
    const targetNodeIndex = nodesSorted.findIndex(node => node.id === targetNode.id)
    const rightNodes = nodesSorted.slice(targetNodeIndex)
    
    // if targetNode overlap with the left node, move targetNode
    if (targetNodeIndex > 0) {
        const leftNode = nodesSorted[targetNodeIndex - 1]
        if (nodeOverlap(targetNode, leftNode) > 0) {

            targetNode.position = leftNode.position + leftNode.width
            targetNode.displayPosition = targetNode.position
        }
    }

    // move right nodes if they overlap
    for (let i = 0; i < rightNodes.length - 1; i++) {
        const node = rightNodes[i]
        const nextNode = rightNodes[i + 1]
        if (node.displayPosition + node.width > nextNode.displayPosition) {
            nextNode.displayPosition = node.displayPosition + node.width
        }
    }
}

const handleDragMove = (nodeId: number, fromTrackId: number, toTrackId: number, fromPosition: number, toPosition: number ) => {
    resetDisplayPosition()
    console.log({nodeId, fromTrackId, toTrackId, fromPosition, toPosition})
    if (fromTrackId === toTrackId) {
        const track = editorState.value.tracks.get(fromTrackId)
        if (!track) return
        const node = track.nodes.get(nodeId)
        if (!node) return

        node.position = toPosition
        node.displayPosition = toPosition
        updateOtherNodesPosition(track, node)

    } else {
        const fromTrack = editorState.value.tracks.get(fromTrackId)!
        const toTrack = editorState.value.tracks.get(toTrackId)!
        const node = fromTrack.nodes.get(nodeId)!
        fromTrack.nodes.delete(nodeId)
        toTrack.nodes.set(nodeId, node)
        node.position = toPosition
        node.displayPosition = toPosition

        editorState.value.drag!.track = toTrack
        
        updateOtherNodesPosition(toTrack, node)
    }
}

const resetDisplayPosition = () => {
    // set position to displayPosition
    for (const track of editorState.value.tracks.values()) {
        for (const node of track.nodes.values()) {
            node.displayPosition = node.position
        }
    }
}

const applyDisplayPosition = () => {
    // set position to displayPosition
    for (const track of editorState.value.tracks.values()) {
        for (const node of track.nodes.values()) {
            node.position = node.displayPosition
        }
    }
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
