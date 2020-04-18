import _ from 'lodash'
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Drawer} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import Map from './map/Map'
import LayersPanel from './sidebar/LayersPanel'
import TitlePanel from './sidebar/TitlePanel'
import {updateTotalCount} from './store/cellTowers'
import {getLayers} from './store/layers'
import {getExtent} from './store/map'

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

class App extends Component {

    constructor(props) {
        super(props)
        this.eventuallyUpdateTotalCount = _.debounce(this.updateTotalCount.bind(this), 500)
    }

    handleDataLayerUpdate = () => {
        this.eventuallyUpdateTotalCount()
    }

    componentDidMount() {
        this.eventuallyUpdateTotalCount()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.extent !== prevProps.extent) {
            this.eventuallyUpdateTotalCount()
        }
    }

    updateTotalCount() {
        const {layers, extent, updateTotalCellTowerCount} = this.props
        updateTotalCellTowerCount(layers, extent)
    }

    render() {
        const {classes} = this.props

        return (
            <div className="app">
                <Drawer
                    className={classes.drawer}
                    classes={{
                        paper: classes.drawerPaper
                    }}
                    variant="permanent"
                    anchor="left">
                    <TitlePanel/>
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
        extent: getExtent(state)
    }
}

const mapDispatchToProps = dispatch => {
    return {
        updateTotalCellTowerCount: (layers, extent) => dispatch(updateTotalCount(layers, extent))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(App))
