import React from 'react'
import {useSelector} from 'react-redux'
import {Box, Divider} from '@material-ui/core'
import {getLayers} from '../store/layers'
import BaseLayerEditor from './BaseLayerEditor'
import CellTowersLayerEditor from './CellTowersLayerEditor'
import './LayersPanel.css'

function LayersPanel() {
    const layers = useSelector(getLayers)
    const baseLayer = layers[0]
    const dataLayer = layers[1]

    return (
        <Box className="layers-panel">
            <Box mb={1} px={2} py={1}>
                <BaseLayerEditor layer={baseLayer}/>
            </Box>
            <Divider/>
            <Box px={2} py={1}>
                <CellTowersLayerEditor layer={dataLayer}/>
            </Box>
        </Box>
    )
}

export default LayersPanel