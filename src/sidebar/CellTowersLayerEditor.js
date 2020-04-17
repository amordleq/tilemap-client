import _ from 'lodash'
import React, {useCallback} from 'react'
import {
    Box,
    Checkbox,
    FormControl,
    FormGroup,
    Input,
    ListItemText,
    MenuItem,
    Select,
    Slider,
    Typography
} from '@material-ui/core'
import {useDispatch} from 'react-redux'
import {setLayerFilter, setLayerHue, setLayerOpacity, setLayerStyle} from '../store/layers'

const menuProps = {
    PaperProps: {
        style: {
            width: 250,
            minWidth: 250,
            maxHeight: 400
        }
    }
}

function OpacityField({opacity, handleOpacityChange}) {
    return (
        <Box>
            <FormControl fullWidth>
                <Typography variant={'subtitle2'}>Opacity</Typography>
                <Slider min={0} max={1} step={0.01} value={opacity} onChange={handleOpacityChange}/>
            </FormControl>
        </Box>
    )
}

function StyleField({style, handleStyleChange}) {
    return (
        <Box mb={2}>
            <FormControl fullWidth>
                <Typography variant={'subtitle2'}>Style</Typography>
                <Select value={style} onChange={handleStyleChange}>
                    <MenuItem value={'heatmap'}>Heatmap</MenuItem>
                    <MenuItem value={'country-codes'}>MCC (Country Codes)</MenuItem>
                </Select>
            </FormControl>
        </Box>
    )
}

function HueField({hue, handleHueChange}) {
    return (
        <Box mb={2}>
            <FormControl fullWidth>
                <Typography variant={'subtitle2'}>Hue</Typography>
                <div className="hue-gradient"/>
                <Slider min={-180} max={180} step={1} value={hue} onChange={handleHueChange}/>
            </FormControl>
        </Box>
    )
}

function RadioFilterField({radioFilter, handleRadioFilterChange}) {
    return (
        <Box mb={2}>
            <FormControl fullWidth>
                <Typography variant={'subtitle2'}>Radio</Typography>
                <FormGroup row>
                    <Select
                        multiple
                        value={radioFilter.currentValues}
                        onChange={handleRadioFilterChange}
                        input={<Input/>}
                        renderValue={selected => _.sortBy(selected).join(', ')}
                        MenuProps={menuProps}
                    >
                        {radioFilter.availableValues.map(value => (
                            <MenuItem key={value} value={value}>
                                <Checkbox checked={radioFilter.currentValues.includes(value)} color="primary"/>
                                <ListItemText primary={value}/>
                            </MenuItem>
                        ))}
                    </Select>
                </FormGroup>
            </FormControl>
        </Box>
    )
}

function StatusFilterField({statusFilter, handleStatusFilterChange}) {
    return (
        <Box mb={2}>
            <FormControl fullWidth>
                <Typography variant={'subtitle2'}>Status</Typography>
                <FormGroup row>
                    <Select
                        multiple
                        value={statusFilter.currentValues}
                        onChange={handleStatusFilterChange}
                        input={<Input/>}
                        renderValue={selected => _.sortBy(selected).join(', ')}
                        MenuProps={menuProps}
                    >
                        {statusFilter.availableValues.map(value => (
                            <MenuItem key={value} value={value}>
                                <Checkbox checked={statusFilter.currentValues.includes(value)} color="primary"/>
                                <ListItemText primary={value}/>
                            </MenuItem>
                        ))}
                    </Select>
                </FormGroup>
            </FormControl>
        </Box>
    )
}

function RangeField({range, handleRangeChange}) {
    const [min, max] = range.availableValues

    return (
        <Box>
            <FormControl fullWidth>
                <Typography variant={'subtitle2'}>Range (m)</Typography>
                <Slider min={min} max={max} defaultValue={[min, max]} valueLabelDisplay="auto"
                        onChangeCommitted={handleRangeChange}/>
            </FormControl>
        </Box>
    )
}

function CellTowersLayerEditor({layer}) {
    const {label, opacity, filters, style, hue} = layer
    const {radio, status, range} = filters
    const dispatch = useDispatch()

    const handleOpacityChange = useCallback((event, newValue) => {
        dispatch(setLayerOpacity(layer.id, newValue))
    }, [dispatch, layer])

    const handleStyleChange = useCallback((event) => {
        if (event.target.value) {
            dispatch(setLayerStyle(layer.id, event.target.value))
        }
    }, [dispatch, layer])

    const handleHueChange = useCallback((event, newValue) => {
        dispatch(setLayerHue(layer.id, newValue))
    }, [dispatch, layer])

    const handleRadioFilterChange = useCallback((event) => {
        const selectedValues = event.target.value
        dispatch(setLayerFilter(layer.id, 'radio', selectedValues))
    }, [dispatch, layer])

    const handleStatusFilterChange = useCallback((event) => {
        const selectedValues = event.target.value
        dispatch(setLayerFilter(layer.id, 'status', selectedValues))
    }, [dispatch, layer])

    const handleRangeChange = useCallback((event, newValue) => {
        dispatch(setLayerFilter(layer.id, 'range', newValue))
    }, [dispatch, layer])

    return <div className="layer-editor">
        <div className="layer-editor-heading">{label}</div>
        <OpacityField opacity={opacity} handleOpacityChange={handleOpacityChange}/>
        <StyleField style={style} handleStyleChange={handleStyleChange}/>
        {style === 'heatmap' &&
        <HueField hue={hue} handleHueChange={handleHueChange}/>
        }
        <RadioFilterField radioFilter={radio} handleRadioFilterChange={handleRadioFilterChange}/>
        <StatusFilterField statusFilter={status} handleStatusFilterChange={handleStatusFilterChange}/>
        <RangeField range={range} handleRangeChange={handleRangeChange}/>
    </div>
}

export default CellTowersLayerEditor