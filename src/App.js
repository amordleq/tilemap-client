import React, {Component} from 'react'
import {Drawer} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import Map from './map/Map'
import LayersPanel from './sidebar/LayersPanel'
import TitlePanel from './sidebar/TitlePanel'

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
                    <Map/>
                </main>
            </div>
        )
    }

}

export default withStyles(styles)(App)
