import {createSlice} from '@reduxjs/toolkit'

export const map = createSlice({
    name: 'map',
    initialState: {
        extent: undefined,
        zoom: undefined
    },
    reducers: {
        updateView: {
            reducer: (state, action) => {
                const {extent, zoom} = action.payload
                state.extent = extent
                state.zoom = zoom
            },
            prepare: (extent, zoom) => ({payload: {extent, zoom}})
        }
    }
})

export const {updateView} = map.actions

export const getExtent = state => state.map.extent
export const getZoom = state => state.map.zoom

export default map.reducer