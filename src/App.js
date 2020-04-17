import _ from 'lodash'
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Box, Drawer, Typography} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import Map from './map/Map'
import LayersPanel from './sidebar/LayersPanel'
import {wrapLongitudeTo180} from './support/CoordinateSupport'
import {getLayers} from './store/layers'
import {getExtent, getZoom} from './store/map'

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
            documentCount: 0
        }
    }

    handleDataLayerUpdate = () => {
        this.eventuallyUpdateDocumentCount()
    }

    componentDidMount() {
        this.eventuallyUpdateDocumentCount()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.extent !== prevProps.extent) {
            this.eventuallyUpdateDocumentCount()
        }
    }

    updateDocumentCount() {
        const {extent, layers} = this.props
        if (!extent) {
            return
        }

        let [west, south, east, north] = extent

        west = wrapLongitudeTo180(west)
        east = wrapLongitudeTo180(east)

        if (Math.round(west) === Math.round(east)) {
            west = -180
            east = 180
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
                    <LayersPanel/>
                </Drawer>
                <main className={classes.content}>
                    <Map onDataLayerUpdate={this.handleDataLayerUpdate}/>
                </main>
            </div>
        )
    }

}

const mapStateToProps = state => {
    return {
        layers: getLayers(state),
        extent: getExtent(state),
        zoom: getZoom(state)
    }
}

const mapDispatchToProps = () => {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(App))
