import {configureStore} from '@reduxjs/toolkit'
import cellTowers from './cellTowers'
import layers from './layers'
import map from './map'

export default configureStore({
    reducer: {
        cellTowers,
        layers,
        map
    }
})