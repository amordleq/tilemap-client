import {configureStore} from '@reduxjs/toolkit'
import cellTowers from './cellTowers'
import layers from './layers'

export default configureStore({
    reducer: {
        cellTowers,
        layers
    }
})