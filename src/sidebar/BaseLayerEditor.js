import React, {Component} from 'react'
import {Box, FormControl, Slider, Typography} from '@material-ui/core'

class BaseLayerEditor extends Component {

    handleOpacityChange = (event, newValue) => {
        this.props.onLayerOpacityChange(this.props.layer, newValue)
    }

    render() {
        const {opacity} = this.props.layer

        return (
            <div className="layer-editor">
                <div className="layer-editor-heading">Base Layer</div>
                <Box>
                    <FormControl fullWidth>
                        <Typography variant={'subtitle2'}>Opacity</Typography>
                        <Slider min={0} max={1} step={0.01} value={opacity} onChange={this.handleOpacityChange}/>
                    </FormControl>
                </Box>
            </div>
        )
    }

}

export default BaseLayerEditor