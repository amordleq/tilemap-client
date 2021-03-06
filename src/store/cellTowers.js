import {createSlice} from '@reduxjs/toolkit'
import {containsAllLongitudes, wrapLongitudeTo180} from '../support/CoordinateSupport'

export const cellTowers = createSlice({
    name: 'cellTowers',
    initialState: {
        totalCount: undefined,
        details: {
            selectedLocation: undefined,
            cellTowers: [],
            visible: false
        }
    },
    reducers: {
        updateTotalCount: (state, action) => {
            state.totalCount = action.payload
        },
        updateDetails: (state, action) => {
            state.details.cellTowers = action.payload
        },
        showDetails: (state, action) => {
            state.details.selectedLocation = action.payload
            state.details.visible = true
        },
        hideDetails: (state, action) => {
            state.details.visible = false
        }
    }
})

export const {updateTotalCount, updateDetails, showDetails, hideDetails} = cellTowers.actions

export const fetchTotalCount = (layers, extent) => dispatch => {
    if (!layers || !extent) {
        return
    }

    let [west, south, east, north] = extent

    west = wrapLongitudeTo180(west)
    east = wrapLongitudeTo180(east)

    if (containsAllLongitudes(west, south, east, north)) {
        west = -180
        east = 180
    }

    const layerWithFilter = layers.find(layer => layer.filter)

    const url = new URL('/count-region', window.location.origin)
    const params = {north, south, east, west}
    if (layerWithFilter) {
        params['filter'] = JSON.stringify(layerWithFilter.filter)
    }
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

    fetch(url, {
        method: 'GET',
        mode: 'same-origin',
        headers: {
            'Content-Type': 'text/plain'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error(response.statusText)
        }
        response.text().then(text => {
            const totalCount = parseInt(text, 10)
            dispatch(updateTotalCount(totalCount))
        })
    }).catch(error => {
        console.error(error)
    })
}

export const fetchDetails = (geoPoint, resolution, layers) => dispatch => {
    const [longitude, latitude] = geoPoint
    const minimumDistanceInMeters = 5
    const maximumDistanceInMeters = 20000
    const radiusInPixels = 10
    const distance = Math.max(minimumDistanceInMeters, Math.min(maximumDistanceInMeters, Math.round(resolution * radiusInPixels))) + 'm'
    const maxResults = 200
    const layerWithFilter = layers.find(layer => layer.filter)

    const url = new URL('/cell-towers', window.location.origin)
    const params = {latitude, longitude, distance, maxResults}
    if (layerWithFilter) {
        params['filter'] = JSON.stringify(layerWithFilter.filter)
    }
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

    fetch(url, {
        method: 'GET',
        mode: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error(response.statusText)
        }
        response.json().then(json => {
            dispatch(updateDetails(json))
        })
    }).catch(error => {
        console.error(error)
    })
}

export const getTotalCount = state => state.cellTowers.totalCount

export const getDetailsSelectedLocation = state => state.cellTowers.details.selectedLocation

export const isDetailsVisible = state => state.cellTowers.details.visible

export const getDetailsCellTowers = state => state.cellTowers.details.cellTowers

export default cellTowers.reducer