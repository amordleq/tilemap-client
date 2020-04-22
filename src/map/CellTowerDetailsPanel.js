import _ from 'lodash'
import React, {useCallback, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
    Box,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import {makeStyles} from '@material-ui/core/styles'
import {getDetailsCellTowers, getDetailsSelectedLocation, hideDetails, isDetailsVisible} from '../store/cellTowers'
import './CellTowerDetailsPanel.css'
import TableSortLabel from '@material-ui/core/TableSortLabel'

/*
radio: "UMTS"
mcc: 310
net: 410
area: 15904
cell: 208044403
range: 6222
location: {lat: 37.551093, lon: -86.366239}
type: "National"
countryName: "United States of America"
countryCode: "US"
brand: "AT&T"
operator: "AT&T Mobility"
status: "Operational"
bands: "GSM 850 / GSM 1900 / UMTS 850 / UMTS 1900"
 */

const useStyles = makeStyles({
    paperRoot: {
        backgroundColor: 'hsla(0, 0%, 26%, 0.97)',
        boxShadow: '0 6px 10px hsla(0, 0%, 0%, 0.7)',
        transition: 'bottom 300ms ease'
    },
    container: {
        maxHeight: 180
    }
})

function formatValue(value) {
    if (!value) {
        return String.fromCharCode(8212)
    }
    return value
}

function Title({cellTowerCount, selectedLocation}) {
    if (!selectedLocation) {
        return null
    }

    const [longitude, latitude] = selectedLocation
    const label = `${cellTowerCount} Cell Tower${cellTowerCount === 1 ? '' : 's'} near ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`

    return (
        <Box className="title">
            <i className="fas fa-crosshairs"/>{label}
        </Box>
    )
}

function NoCellTowersFoundMessage() {
    return (
        <div className="no-cell-towers-found-message">
            <div className="message-text">No Cell Towers Found</div>
        </div>
    )
}

const columns = [{
    id: 'radio',
    fieldName: 'radio',
    header: 'Radio',
    sortIteratee: true
}, {
    id: 'mcc',
    fieldName: 'mcc',
    header: 'MCC',
    sortIteratee: true
}, {
    id: 'mnc',
    fieldName: 'net',
    header: 'MNC',
    sortIteratee: true
}, {
    id: 'area',
    fieldName: 'area',
    header: 'Area',
    sortIteratee: true
}, {
    id: 'cell',
    fieldName: 'cell',
    header: 'Cell',
    sortIteratee: true
}, {
    id: 'country',
    fieldName: 'countryCode',
    header: 'Country'
}, {
    id: 'status',
    fieldName: 'status',
    header: 'Status'
}, {
    id: 'range',
    fieldName: 'range',
    header: 'Range (m)'
}]

function CellTowerTableRow({cellTower, index}) {
    const tableCells = columns.map(column => (
        <TableCell key={column.id}>{formatValue(cellTower[column.fieldName])}</TableCell>
    ))
    return (
        <TableRow key={index}>
            {tableCells}
        </TableRow>
    )
}

function CellTowerDetailsPanel() {
    const [sortColumn, setSortColumn] = useState('radio')
    const [sortDirection, setSortDirection] = useState('asc')

    const visible = useSelector(isDetailsVisible)
    const cellTowers = useSelector(getDetailsCellTowers)
    const selectedLocation = useSelector(getDetailsSelectedLocation)
    const dispatch = useDispatch()

    const classes = useStyles()
    const classNames = ['details-overlay']
    if (!visible) {
        classNames.push('hidden')
    }

    const handleClose = useCallback(() => {
        dispatch(hideDetails())
    }, [dispatch])

    const handleRequestSort = useCallback((property) => {
        const isAsc = sortColumn === property && sortDirection === 'asc'
        setSortDirection(isAsc ? 'desc' : 'asc')
        setSortColumn(property)
    }, [sortColumn, sortDirection])

    const columnHeaders = columns.map(column => (
        <TableCell key={column.id} sortDirection={sortColumn === column.id ? sortDirection : false}>
            <TableSortLabel
                active={sortColumn === column.id}
                direction={sortColumn === column.id ? sortDirection : 'asc'}
                onClick={() => handleRequestSort(column.id)}>
                {column.header}
            </TableSortLabel>
        </TableCell>
    ))

    const sortIteratees = [columns.find(column => column.id === sortColumn).fieldName].concat(columns.filter(column => column.sortIteratee && column.id !== sortColumn).map(column => column.fieldName))
    const sortedTableRows = _.sortBy(cellTowers, sortIteratees)
    if (sortDirection === 'desc') {
        _.reverse(sortedTableRows)
    }

    const tableRows = sortedTableRows.map((cellTower, index) => <CellTowerTableRow key={index} cellTower={cellTower}/>)

    return (
        <Paper id="details-overlay" className={classNames.join(' ')} classes={{root: classes.paperRoot}}>
            <Title cellTowerCount={cellTowers.length} selectedLocation={selectedLocation}/>
            {cellTowers.length > 0 &&
            <Box>
                <TableContainer className={classes.container}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                {columnHeaders}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableRows}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            }
            {cellTowers.length === 0 &&
            <NoCellTowersFoundMessage/>
            }
            <IconButton className="close-button" size="small" onClick={handleClose}>
                <CloseIcon/>
            </IconButton>
        </Paper>
    )
}

export default CellTowerDetailsPanel
