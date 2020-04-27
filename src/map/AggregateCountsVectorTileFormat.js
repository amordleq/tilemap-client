import JSONFeature from 'ol/format/JSONFeature'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import {get as getProjection} from 'ol/proj'
import {transformGeometryWithOptions} from 'ol/format/Feature'

class AggregateCountsVectorTileFormat extends JSONFeature {

    constructor() {
        super()
        this.dataProjection = getProjection('EPSG:4326')
    }

    /**
     * @override
     */
    readFeatureFromObject(object, opt_options) {
        const feature = new Feature()
        feature.setGeometry(this.renderGeometry(object, opt_options))
        feature.setProperties({count: object.count}, true)
        return feature
    }

    /**
     * @override
     */
    readFeaturesFromObject(object, opt_options) {
        return object.map(locationCount => this.readFeatureFromObject(locationCount, opt_options))
    }

    /**
     * @override
     */
    readGeometryFromObject(object, opt_options) {
        return this.renderGeometry(object, opt_options)
    }

    /**
     * @override
     */
    readProjectionFromObject(object) {
        return this.dataProjection
    }

    /**
     * @private
     */
    renderGeometry(object, opt_options) {
        const {lat, lon} = object.location
        const geometry = new Point([lon, lat])
        return transformGeometryWithOptions(geometry, false, opt_options)
    }

}

export default AggregateCountsVectorTileFormat