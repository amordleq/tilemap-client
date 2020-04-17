import {configureStore} from '@reduxjs/toolkit'
import layers from './layers'
import map from './map'

export default configureStore({
    reducer: {
        layers,
        map
    }
})