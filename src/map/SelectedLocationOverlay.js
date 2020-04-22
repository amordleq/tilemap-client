import React from 'react'
import {useSelector} from 'react-redux'
import {isDetailsVisible} from '../store/cellTowers'
import './SelectedLocationOverlay.css'

function SelectedLocationOverlay() {
    const visible = useSelector(isDetailsVisible)

    return (
        <div id="selected-location-overlay" style={{display: visible ? '' : 'none'}}>
            <i className="fas fa-crosshairs"/>
        </div>
    )
}

export default SelectedLocationOverlay