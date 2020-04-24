import React from 'react'
import {Box, Divider} from '@material-ui/core'
import './ServerInfoPanel.css'

function ServerInfoPanel() {
    const serverInfo = process.env.REACT_APP_SERVER_INFO || ''
    const items = serverInfo.split(',').map(item => <div key={item} className="item">{item}</div>)

    return (
        <Box className="server-info-panel">
            <Divider/>
            <Box px={2} pt={1}>
                <div className="heading">Server Info</div>
            </Box>
            <Box px={2} pb={1}>
                {items}
            </Box>
        </Box>
    )
}

export default ServerInfoPanel