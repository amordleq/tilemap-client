import _ from 'lodash'
import React, {Component} from 'react'
import {connect} from 'react-redux'
import TileLayer from 'ol/layer/Tile'
import VectorTileLayer from 'ol/layer/VectorTile'
import OpenLayerMap from 'ol/Map'
import Overlay from 'ol/Overlay'
import View from 'ol/View'
import XYZ from 'ol/source/XYZ'
import Icon from 'ol/style/Icon'
import Style from 'ol/style/Style'
import {fromLonLat, transform, transformExtent} from 'ol/proj'
import {defaults as defaultControls, ScaleLine} from 'ol/control'
import {fetchDetails, fetchTotalCount, isDetailsVisible, showDetails} from '../store/cellTowers'
import {getLayers} from '../store/layers'
import {wrapLongitudeTo180} from '../support/CoordinateSupport'
import RasterLayerSource from './RasterLayerSource'
import IconLayerSource from './IconLayerSource'
import 'ol/ol.css'
import './Map.css'

const ICON_LAYER_ZOOM_THRESHOLD = 15

class Map extends Component {

    constructor(props) {
        super(props)
        this.mapContainer = React.createRef()
        this.handleWindowResize = this.onWindowResize.bind(this)
        this.eventuallyResizeMapContainer = _.debounce(this.resizeMapContainer.bind(this), 500)
        this.state = {
            extent: undefined,
            selectionGeoPoint: undefined,
            selectionResolution: undefined
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
        const {showDetails} = this.props
        const {selectedLocationOverlay} = this.state

        const view = this.state.map.getView()
        const geoPoint = transform(event.coordinate, view.getProjection().getCode(), 'EPSG:4326')
        geoPoint[0] = wrapLongitudeTo180(geoPoint[0])
        const resolution = view.getResolution()

        this.setState({
            selectionGeoPoint: geoPoint,
            selectionResolution: resolution
        })

        selectedLocationOverlay.setPosition(event.coordinate)

        this.fetchCellTowerDetailsForCurrentSelection()

        showDetails(geoPoint)
    }

    handleChangeResolution = (event) => {
        const resolution = event.target.get(event.key)
        const z = this.baseLayer.getSource().getTileGrid().getZForResolution(resolution)
        if (z >= ICON_LAYER_ZOOM_THRESHOLD && this.cellTowersRasterLayer.getVisible()) {
            this.cellTowersRasterLayer.setVisible(false)
            this.cellTowersIconLayer.setVisible(true)
            this.cellTowersIconLayer.once('postrender', () => _.defer(() => this.updateDataLayerHue()))
        } else if (z < ICON_LAYER_ZOOM_THRESHOLD && this.cellTowersIconLayer.getVisible()) {
            this.cellTowersRasterLayer.setVisible(true)
            this.cellTowersIconLayer.setVisible(false)
            this.cellTowersRasterLayer.once('postrender', () => _.defer(() => this.updateDataLayerHue()))
        }
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
        this.baseLayer = this.createBaseMapLayer()
        this.cellTowersRasterLayer = this.createCellTowersRasterLayer()
        this.cellTowersIconLayer = this.createCellTowersIconLayer()

        const view = new View({
            center: fromLonLat([-5.05, 29.53]),
            zoom: 2
        })

        const selectedLocationOverlay = new Overlay({
            element: document.getElementById('selected-location-overlay'),
            positioning: 'center-center'
        })

        const map = new OpenLayerMap({
            target: this.mapContainer.current,
            layers: [this.baseLayer, this.cellTowersRasterLayer, this.cellTowersIconLayer],
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

        view.on('change:resolution', this.handleChangeResolution)
    }

    createBaseMapLayer() {
        const baseMap = this.props.layers.find(layer => layer.id === 'base-map')
        const baseMapId = 'mapbox.dark'
        const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
        return new TileLayer({
            id: baseMap.id,
            className: 'base-layer',
            source: new XYZ({
                url: `https://api.tiles.mapbox.com/v4/${baseMapId}/{z}/{x}/{y}.png?access_token=${accessToken}`
            }),
            opacity: baseMap.opacity
        })
    }

    createCellTowersRasterLayer() {
        const cellTowers = this.props.layers.find(layer => layer.id === 'cell-towers')
        return new TileLayer({
            id: `${cellTowers.id}-raster`,
            className: 'data-layer',
            opacity: cellTowers.opacity,
            source: new RasterLayerSource({
                style: cellTowers.style,
                filter: cellTowers.filter
            })
        })
    }

    createCellTowersIconLayer() {
        const cellTowers = this.props.layers.find(layer => layer.id === 'cell-towers')
        return new VectorTileLayer({
            id: `${cellTowers.id}-icon`,
            className: 'data-layer',
            declutter: true,
            source: new IconLayerSource({
                style: cellTowers.style,
                filter: cellTowers.filter
            }),
            style: new Style({
                image: new Icon({
                    src: 'tower.png'
                })
            }),
            visible: false
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
                this.getMapLayersForLayerState(layer).forEach(mapLayer => mapLayer.setOpacity(layer.opacity))
            }
            if (layer.style && layer.style !== prevLayer.style) {
                this.getMapLayersForLayerState(layer).forEach(mapLayer => mapLayer.getSource().setStyle(layer.style))
            }
            if (layer.hue && layer.hue !== prevLayer.hue) {
                this.updateDataLayerHue()
            }
            if (!_.isEqual(layer.filter, prevLayer.filter)) {
                this.getMapLayersForLayerState(layer).forEach(mapLayer => mapLayer.getSource().setFilter(layer.filter))
                this.fetchTotalCellTowerCountForCurrentView()
                this.fetchCellTowerDetailsForCurrentSelection()
            }
        })

        if (this.state.extent !== prevState.extent) {
            this.fetchTotalCellTowerCountForCurrentView()
        }

        if (prevProps.detailsVisible && !this.props.detailsVisible) {
            this.setState({
                selectionGeoPoint: null,
                selectionResolution: null
            })
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

    getMapLayersForLayerState(layer) {
        if (layer.id === 'base-map') {
            return [this.baseLayer]
        } else {
            return [this.cellTowersRasterLayer, this.cellTowersIconLayer]
        }
    }

    fetchTotalCellTowerCountForCurrentView() {
        const {layers, fetchTotalCellTowerCount} = this.props
        const {extent} = this.state
        fetchTotalCellTowerCount(layers, extent)
    }

    fetchCellTowerDetailsForCurrentSelection() {
        const {fetchCellTowerDetails, layers} = this.props
        const {selectionGeoPoint, selectionResolution} = this.state
        if (selectionGeoPoint && selectionResolution) {
            fetchCellTowerDetails(selectionGeoPoint, selectionResolution, layers)
        }
    }

}

const mapStateToProps = state => {
    return {
        layers: getLayers(state),
        detailsVisible: isDetailsVisible(state)
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchTotalCellTowerCount: (layers, extent) => dispatch(fetchTotalCount(layers, extent)),
        fetchCellTowerDetails: (geoPoint, resolution, layers) => dispatch(fetchDetails(geoPoint, resolution, layers)),
        showDetails: (geoPoint) => dispatch(showDetails(geoPoint))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map)