import 'typeface-roboto'
import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import CssBaseline from '@material-ui/core/CssBaseline'
import {ThemeProvider} from '@material-ui/core/styles'
import store from './store'
import theme from './theme'
import App from './App'
import '@fortawesome/fontawesome-free/css/all.css'
import './index.css'

document.title = 'Tile Map Demo'

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <Provider store={store}>
            <CssBaseline/>
            <App/>
        </Provider>
    </ThemeProvider>,
    document.getElementById('root')
)