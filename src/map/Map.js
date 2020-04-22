import _ from 'lodash'
import React, {Component} from 'react'
import {connect} from 'react-redux'
import View from 'ol/View'
import OpenLayerMap from 'ol/Map'
import Overlay from 'ol/Overlay'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import {fromLonLat, transform, transformExtent} from 'ol/proj'
import {defaults as defaultControls, ScaleLine} from 'ol/control'
import {fetchDetails, fetchTotalCount, showDetails} from '../store/cellTowers'
import {getLayers} from '../store/layers'
import {wrapLongitudeTo180} from '../support/CoordinateSupport'
import FilterableXYZ from './FilterableXYZ'
import 'ol/ol.css'
import './Map.css'

class Map extends Component {

    constructor(props) {
        super(props)
        this.mapContainer = React.createRef()
        this.handleWindowResize = this.onWindowResize.bind(this)
        this.eventuallyResizeMapContainer = _.debounce(this.resizeMapContainer.bind(this), 500)
        this.state = {
            extent: undefined
        }
    }

    handleMoveEnd = () => {
        const view = this.state.map.getView()
        const extent = transformExtent(view.calculateExtent(this.state.map.getSize()), view.getProjection().getCode(), 'EPSG:4326')

        this.setState({
            extent: extent
        })
    }

    handleClick = (event) => {
        const {showDetails, fetchCellTowerDetails} = this.props
        const {selectedLocationOverlay} = this.state

        const view = this.state.map.getView()
        const geoPoint = transform(event.coordinate, view.getProjection().getCode(), 'EPSG:4326')
        geoPoint[0] = wrapLongitudeTo180(geoPoint[0])
        const resolution = view.getResolution()

        selectedLocationOverlay.setPosition(event.coordinate)

        fetchCellTowerDetails(geoPoint, resolution)

        showDetails(geoPoint)
    }

    updateDataLayerHue() {
        this.props.layers.filter(layer => Number.isFinite(layer.hue)).forEach(layer => {
            // TODO support multiple data layers
            const dataLayerEl = document.querySelector('.data-layer')
            if (!dataLayerEl) {
                console.warn('data-layer element not found')
                return
            }

            dataLayerEl.style.filter = `hue-rotate(${layer.hue.toFixed()}deg)`
        })
    }

    initializeMap() {
        const layers = this.initializeLayers()

        const view = new View({
            center: fromLonLat([-5.05, 29.53]),
            zoom: 2
        })

        const selectedLocationOverlay = new Overlay({
            element: document.getElementById('selected-location-overlay'),
            positioning: 'center-center'
        });

        const map = new OpenLayerMap({
            target: this.mapContainer.current,
            layers: layers,
            view: view,
            controls: defaultControls().extend([
                new ScaleLine()
            ]),
            overlays: [selectedLocationOverlay]
        })

        this.setState({
            map,
            selectedLocationOverlay
        })

        map.on('moveend', this.handleMoveEnd)
        map.on('click', this.handleClick)
    }

    initializeLayers() {
        return this.props.layers.map(layer => {
            if (layer.id === 'baseMap') {
                const baseMapId = 'mapbox.dark'
                const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
                return new TileLayer({
                    id: layer.id,
                    className: 'base-layer',
                    source: new XYZ({
                        url: `https://api.tiles.mapbox.com/v4/${baseMapId}/{z}/{x}/{y}.png?access_token=${accessToken}`
                    }),
                    opacity: layer.opacity
                })
            } else {
                return new TileLayer({
                    id: layer.id,
                    className: 'data-layer',
                    opacity: layer.opacity,
                    source: new FilterableXYZ({
                        filter: layer.filter
                    })
                })
            }
        })
    }

    componentDidMount() {
        this.resizeMapContainer()

        this.initializeMap()

        window.addEventListener('resize', this.handleWindowResize)

        this.fetchTotalCellTowerCountForCurrentView()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        prevProps.layers.forEach((prevLayer, index) => {
            const layer = this.props.layers[index]
            if (layer.opacity !== prevLayer.opacity) {
                this.getLayerById(prevLayer.id).setOpacity(layer.opacity)
            }
            if (layer.style && layer.style !== prevLayer.style) {
                //this.getLayerById(layer.id).getSource().updateParams(this.createLayerParams(layer))
            }
            if (layer.hue && layer.hue !== prevLayer.hue) {
                this.updateDataLayerHue()
            }
            if (!_.isEqual(layer.filter, prevLayer.filter)) {
                this.getLayerById(layer.id).getSource().setFilter(layer.filter)
                this.fetchTotalCellTowerCountForCurrentView()
            }
        })

        if (this.state.extent !== prevState.extent) {
            this.fetchTotalCellTowerCountForCurrentView()
        }
    }

    onWindowResize() {
        this.eventuallyResizeMapContainer()
    }

    resizeMapContainer() {
        this.mapContainer.current.style.height = `${window.innerHeight}px`
    }

    render() {
        return <div ref={this.mapContainer} className="map-container"></div>
    }

    getLayerById(id) {
        return this.state.map.getLayers().getArray().find(layer => layer.get('id') === id)
    }

    fetchTotalCellTowerCountForCurrentView() {
        const {layers, fetchTotalCellTowerCount} = this.props
        const {extent} = this.state
        fetchTotalCellTowerCount(layers, extent)
    }

}

const mapStateToProps = state => {
    return {
        layers: getLayers(state)
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchTotalCellTowerCount: (layers, extent) => dispatch(fetchTotalCount(layers, extent)),
        fetchCellTowerDetails: (geoPoint, resolution) => dispatch(fetchDetails(geoPoint, resolution)),
        showDetails: (geoPoint) => dispatch(showDetails(geoPoint))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map)