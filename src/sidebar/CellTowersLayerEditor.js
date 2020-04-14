import React, {Component} from 'react'
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
                        renderValue={selected => selected.sort().join(', ')}
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
                        renderValue={selected => selected.sort().join(', ')}
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
                <Slider min={min} max={max} defaultValue={range.availableValues} valueLabelDisplay="auto"
                        onChangeCommitted={handleRangeChange}/>
            </FormControl>
        </Box>
    )
}

class CellTowersLayerEditor extends Component {

    handleOpacityChange = (event, newValue) => {
        this.props.onLayerOpacityChange(this.props.layer, newValue)
    }

    handleStyleChange = (event) => {
        if (event.target.value) {
            this.props.onLayerStyleChange(this.props.layer, event.target.value)
        }
    }

    handleHueChange = (event, newValue) => {
        this.props.onLayerHueChange(this.props.layer, newValue)
    }

    handleRadioFilterChange = (event) => {
        const selectedValues = event.target.value
        this.props.onLayerFilterChange(this.props.layer, 'radio', selectedValues)
    }

    handleStatusFilterChange = (event) => {
        const selectedValues = event.target.value
        this.props.onLayerFilterChange(this.props.layer, 'status', selectedValues)
    }

    handleRangeChange = (event, newValue) => {
        this.props.onLayerFilterChange(this.props.layer, 'range', newValue)
    }

    render() {
        const {label, opacity, filters, style, hue} = this.props.layer
        const {radio, status, range} = filters

        return <div className="layer-editor">
            <div className="layer-editor-heading">{label}</div>
            <OpacityField opacity={opacity} handleOpacityChange={this.handleOpacityChange}/>
            <StyleField style={style} handleStyleChange={this.handleStyleChange}/>
            {style === 'heatmap' &&
            <HueField hue={hue} handleHueChange={this.handleHueChange}/>
            }
            <RadioFilterField radioFilter={radio} handleRadioFilterChange={this.handleRadioFilterChange}/>
            <StatusFilterField statusFilter={status} handleStatusFilterChange={this.handleStatusFilterChange}/>
            <RangeField range={range} handleRangeChange={this.handleRangeChange}/>
        </div>
    }

}

export default CellTowersLayerEditor