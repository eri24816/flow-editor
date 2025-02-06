export interface TrackData {
    id: number
    nodes: Map<number, NodeData>
}


export interface NodeData {
    id: number
    title: string
    width: number
    position: number
    displayPosition: number
}

export interface Drag{
    node: NodeData
    track: TrackData
    startX: number
    startPosition: number
}

export interface EditorState {
    drag: Drag | null
    xUnit: number
    gap: number
    tracks: Map<number, TrackData>
    trackUnderMouse: TrackData | null
}