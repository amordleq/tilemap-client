import React, {Component} from 'react'
import {Drawer} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import CellTowerDetailsPanel from './map/CellTowerDetailsPanel'
import Map from './map/Map'
import SelectedLocationOverlay from './map/SelectedLocationOverlay'
import LayersPanel from './sidebar/LayersPanel'
import ServerInfoPanel from './sidebar/ServerInfoPanel'
import TitlePanel from './sidebar/TitlePanel'

const drawerWidth = 240

const styles = theme => {
    return {
        root: {
            display: 'flex'
        },
        drawer: {
            display: 'flex',
            width: drawerWidth
        },
        drawerPaper: {
            width: drawerWidth
        },
        content: {
            position: 'relative',
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth,
            overflow: 'hidden'
        }
    }
}

class App extends Component {

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
                    <ServerInfoPanel/>
                </Drawer>
                <main className={classes.content}>
                    <Map/>
                    <SelectedLocationOverlay/>
                    <CellTowerDetailsPanel/>
                </main>
            </div>
        )
    }

}

export default withStyles(styles)(App)
