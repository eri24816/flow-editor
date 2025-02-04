export interface TrackData {
    id: number
    nodes: number[]
}

export interface NodeData {
    position: number
    trackIndex: number
    index: number
}

export interface EditorState {
    draggingNode: NodeData | null
}