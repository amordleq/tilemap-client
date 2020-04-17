import React, {useCallback} from 'react'
import {useDispatch} from 'react-redux'
import {Box, FormControl, Slider, Typography} from '@material-ui/core'
import {setLayerOpacity} from '../store/layers'

function BaseLayerEditor({layer}) {
    const {opacity} = layer
    const dispatch = useDispatch()

    const handleOpacityChange = useCallback((event, newValue) => {
        dispatch(setLayerOpacity(layer.id, newValue))
    }, [dispatch, layer])

    return (
        <div className="layer-editor">
            <div className="layer-editor-heading">Base Layer</div>
            <Box>
                <FormControl fullWidth>
                    <Typography variant={'subtitle2'}>Opacity</Typography>
                    <Slider min={0} max={1} step={0.01} value={opacity} onChange={handleOpacityChange}/>
                </FormControl>
            </Box>
        </div>
    )

}

export default BaseLayerEditor