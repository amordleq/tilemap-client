import _ from 'lodash'
import {createSlice} from '@reduxjs/toolkit'
import ElasticsearchFilterBuilder from '../support/ElasticsearchFilterBuilder'

function createElasticsearchFilter(layer) {
    const {radio, status, range} = layer.filters
    const builder = new ElasticsearchFilterBuilder()

    if (radio.currentValues.length < radio.availableValues.length) {
        builder.matchAny('radio', radio.currentValues)
    }
    if (status.currentValues.length < status.availableValues.length) {
        builder.matchAny('status', status.currentValues)
    }
    if (range.currentValues[0] > range.availableValues[0] || range.currentValues[1] < range.availableValues[1]) {
        builder.matchRange('range', range.currentValues[0], range.currentValues[1])
    }

    return builder.toString()
}

export const layers = createSlice({
    name: 'layers',
    initialState: {
        layers: [{
            id: 'baseMap',
            label: 'Base Map',
            opacity: 0.5
        }, {
            id: 'cell-towers',
            name: 'SYSTOLIC:cell-towers',
            label: 'Cell Tower Layer',
            opacity: 1,
            style: 'heatmap',
            hue: 0,
            filters: {
                'radio': {
                    availableValues: ['CDMA', 'GSM', 'LTE', 'UMTS'],
                    currentValues: ['CDMA', 'GSM', 'LTE', 'UMTS']
                },
                'status': {
                    availableValues: ['Allocated', 'Not operational', 'Operational', 'Reserved', 'Unknown', 'Temporary operational'],
                    currentValues: ['Allocated', 'Not operational', 'Operational', 'Reserved', 'Unknown', 'Temporary operational']
                },
                'range': {
                    availableValues: [0, 50000],
                    currentValues: [0, 50000]
                }
            },
            filter: null
        }]
    },
    reducers: {
        setLayerOpacity: {
            reducer: (state, action) => {
                const {layerId, opacity} = action.payload
                state.layers.find(layer => layer.id === layerId).opacity = opacity
            },
            prepare: (layerId, opacity) => ({payload: {layerId, opacity}})
        },

        setLayerStyle: {
            reducer: (state, action) => {
                const {layerId, style} = action.payload
                state.layers.find(layer => layer.id === layerId).style = style
            },
            prepare: (layerId, style) => ({payload: {layerId, style}})
        },

        setLayerHue: {
            reducer: (state, action) => {
                const {layerId, hue} = action.payload
                state.layers.find(layer => layer.id === layerId).hue = hue
            },
            prepare: (layerId, hue) => ({payload: {layerId, hue}})
        },

        setLayerFilter: {
            reducer: (state, action) => {
                const {layerId, filterType, filterValue} = action.payload
                const draftLayer = state.layers.find(layer => layer.id === layerId)

                if (filterType === 'radio' || filterType === 'status' || filterType === 'range') {
                    draftLayer.filters[filterType].currentValues = _.clone(filterValue)
                }

                draftLayer.filter = createElasticsearchFilter(draftLayer)
            },
            prepare: (layerId, filterType, filterValue) => ({payload: {layerId, filterType, filterValue}})
        }
    }
})

export const {setLayerOpacity, setLayerStyle, setLayerHue, setLayerFilter} = layers.actions

export const getLayers = state => state.layers.layers

export default layers.reducer