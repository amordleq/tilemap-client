import React, {Component} from 'react'
import {Box, Divider} from '@material-ui/core'
import BaseLayerEditor from './BaseLayerEditor'
import CellTowersLayerEditor from './CellTowersLayerEditor'
import './LayersPanel.css'

class LayersPanel extends Component {

    render() {
        const {layers} = this.props
        const baseLayer = layers[0]
        const dataLayer = layers[1]

        return (
            <Box className="layers-panel">
                <Box mb={1} px={2} py={1}>
                    <BaseLayerEditor layer={baseLayer} onLayerOpacityChange={this.props.onLayerOpacityChange}/>
                </Box>
                <Divider/>
                <Box px={2} py={1}>
                    <CellTowersLayerEditor layer={dataLayer}
                                           onLayerOpacityChange={this.props.onLayerOpacityChange}
                                           onLayerStyleChange={this.props.onLayerStyleChange}
                                           onLayerHueChange={this.props.onLayerHueChange}
                                           onLayerFilterChange={this.props.onLayerFilterChange}/>
                </Box>
            </Box>
        )
    }

}

export default LayersPanel