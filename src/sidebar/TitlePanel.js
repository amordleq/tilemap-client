import {Box, Typography} from '@material-ui/core'
import _ from 'lodash'
import React from 'react'
import {useSelector} from 'react-redux'
import {getTotalCount} from '../store/cellTowers'

function TitlePanel() {
    const totalCellTowerCount = useSelector(getTotalCount)

    return (
        <Box mt={1} mb={1}>
            <Typography variant="h5" align="center">Cell Towers</Typography>
            {_.isNumber(totalCellTowerCount) &&
            <Typography variant="h6" align="center">{totalCellTowerCount.toLocaleString()}</Typography>
            }
        </Box>
    )
}

export default TitlePanel