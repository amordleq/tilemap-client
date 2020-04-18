import {createSlice} from '@reduxjs/toolkit'
import {wrapLongitudeTo180} from '../support/CoordinateSupport'

export const cellTowers = createSlice({
    name: 'cellTowers',
    initialState: {
        totalCount: undefined
    },
    reducers: {
        setTotalCount: (state, action) => {
            state.totalCount = action.payload
        }
    }
})

const {setTotalCount} = cellTowers.actions

export const fetchTotalCount = (layers, extent) => dispatch => {
    if (!layers || !extent) {
        return
    }

    let [west, south, east, north] = extent

    west = wrapLongitudeTo180(west)
    east = wrapLongitudeTo180(east)

    if (Math.round(west) === Math.round(east)) {
        west = -180
        east = 180
    }

    let url = `http://localhost:3000/count-region?north=${north}&south=${south}&east=${east}&west=${west}`

    const layerWithFilter = layers.find(layer => layer.filter)
    if (layerWithFilter) {
        url += `&filter=${encodeURIComponent(JSON.stringify(layerWithFilter.filter))}`
    }

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
            dispatch(setTotalCount(totalCount))
        })
    }).catch(error => {
        console.error(error)
    })
}

export const getTotalCount = state => state.cellTowers.totalCount

export default cellTowers.reducer