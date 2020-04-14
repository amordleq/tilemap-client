import _ from 'lodash'
import React, {Component} from 'react'
import {Box, Drawer, Typography} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import Map from './map/Map'
import LayersPanel from './sidebar/LayersPanel'

const drawerWidth = 240

const styles = theme => {
    return {
        root: {
            display: 'flex'
        },
        drawer: {
            width: drawerWidth
        },
        drawerPaper: {
            width: drawerWidth
        },
        content: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth
        }
    }
}

function TitlePanel({documentCount}) {
    return (
        <Box mt={1} mb={1}>
            <Typography variant="h5" align="center">Cell Towers</Typography>
            {_.isNumber(documentCount) &&
            <Typography variant="h6" align="center">{documentCount.toLocaleString()}</Typography>
            }
        </Box>
    )
}

class App extends Component {

    constructor(props) {
        super(props)
        this.eventuallyUpdateDocumentCount = _.debounce(this.updateDocumentCount.bind(this), 500)
        this.state = {
            layers: [{
                id: 'baseMap',
                label: 'Base Map',
                opacity: 0.5
            }, {
                id: 'cell-towers',
                name: 'SYSTOLIC:cell-towers',
                label: 'Cell Tower Layer',
                opacity: 1,
                style: 'heatmap',
                hue: 0,
                filters: {
                    'radio': {
                        availableValues: ['CDMA', 'GSM', 'LTE', 'UMTS'],
                        currentValues: ['CDMA', 'GSM', 'LTE', 'UMTS']
                    },
                    'status': {
                        availableValues: ['Allocated', 'Not operational', 'Operational', 'Reserved', 'Unknown', 'Temporary operational'],
                        currentValues: ['Allocated', 'Not operational', 'Operational', 'Reserved', 'Unknown', 'Temporary operational']
                    },
                    'range': {
                        availableValues: [0, 50000],
                        currentValues: [0, 50000]
                    }
                },
                filter: this.createQuery()
            }],
            extent: undefined,
            zoom: undefined,
            documentCount: 0,
            selectedDocuments: undefined
        }
    }

    createQueryClauseToMatchValues(fieldName, values) {
        return {
            'bool': {
                'should': values.map(value => {
                    return {
                        'match': {
                            [fieldName]: value
                        }
                    }
                })
            }
        }
    }

    createQueryClauseToMatchRange(fieldName, min, max) {
        return {
            'range': {
                [fieldName]: {
                    'gte': min,
                    'lte': max
                }
            }
        }
    }

    createQuery(layer) {
        if (!layer) {
            return null
        }

        const clauses = []
        const {radio, status, range} = layer.filters

        if (radio.currentValues.length < radio.availableValues.length) {
            clauses.push(this.createQueryClauseToMatchValues('radio', radio.currentValues))
        }
        if (status.currentValues.length < status.availableValues.length) {
            clauses.push(this.createQueryClauseToMatchValues('status', status.currentValues))
        }
        if (range.currentValues[0] > range.availableValues[0] || range.currentValues[1] < range.availableValues[1]) {
            clauses.push(this.createQueryClauseToMatchRange('range', range.currentValues[0], range.currentValues[1]))
        }

        if (clauses.length > 0) {
            return {
                'bool': {
                    'must': [clauses]
                }
            }
        } else {
            return null
        }
    }

    handleLayerOpacityChange = (layer, opacity) => {
        this.setState({
            layers: Object.assign([], this.state.layers, {[this.state.layers.indexOf(layer)]: {...layer, opacity}})
        })
    }

    handleLayerStyleChange = (layer, style) => {
        this.setState({
            layers: Object.assign([], this.state.layers, {[this.state.layers.indexOf(layer)]: {...layer, style}})
        })
    }

    handleLayerHueChange = (layer, hue) => {
        this.setState({
            layers: Object.assign([], this.state.layers, {[this.state.layers.indexOf(layer)]: {...layer, hue}})
        })
    }

    handleLayerFilterChange = (layer, filterType, value) => {
        const newLayer = {...layer}
        newLayer.filters = {...newLayer.filters}

        if (filterType === 'radio' || filterType === 'status' || filterType === 'range') {
            const selectedValues = value
            newLayer.filters[filterType] = {...(newLayer.filters[filterType])}
            newLayer.filters[filterType].currentValues = selectedValues
        }

        newLayer.filter = this.createQuery(newLayer)

        this.setState({
            layers: Object.assign([], this.state.layers, {[this.state.layers.indexOf(layer)]: newLayer})
        })
    }

    handleDataLayerUpdate = () => {
        this.eventuallyUpdateDocumentCount()
    }

    handleMapChange = (extent, zoom) => {
        this.setState({
            extent: extent,
            zoom: zoom
        })
    }

    handleMapClick = (geoPoint, resolution) => {

    }

    componentDidMount() {
        this.eventuallyUpdateDocumentCount()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.extent !== prevState.extent) {
            this.eventuallyUpdateDocumentCount()
        }
    }

    updateDocumentCount() {
        const {extent, layers} = this.state
        if (!extent) { return }

        let [west, south, east, north] = extent
        while (west < -180) {
            west = 360 - Math.abs(west)
        }
        while (east < -180) {
            east = 360 - Math.abs(east)
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
                this.setState({
                    documentCount: parseInt(text, 10)
                })
            })
        }).catch(error => {
            console.error(error)
        })
    }

    render() {
        const {classes} = this.props
        const {documentCount} = this.state

        return (
            <div className="app">
                <Drawer
                    className={classes.drawer}
                    classes={{
                        paper: classes.drawerPaper
                    }}
                    variant="permanent"
                    anchor="left">
                    <TitlePanel documentCount={documentCount}/>
                    <LayersPanel layers={this.state.layers}
                                 onLayerOpacityChange={this.handleLayerOpacityChange}
                                 onLayerStyleChange={this.handleLayerStyleChange}
                                 onLayerHueChange={this.handleLayerHueChange}
                                 onLayerFilterChange={this.handleLayerFilterChange}/>
                </Drawer>
                <main className={classes.content}>
                    <Map layers={this.state.layers}
                         onDataLayerUpdate={this.handleDataLayerUpdate}
                         onMapChange={this.handleMapChange}
                         onMapClick={this.handleMapClick}/>
                </main>
            </div>
        )
    }

}

export default withStyles(styles)(App)
