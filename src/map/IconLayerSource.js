import VectorTileSource from 'ol/source/VectorTile'
import AggregateCountsVectorTileFormat from './AggregateCountsVectorTileFormat'

class IconLayerSource extends VectorTileSource {

    constructor(options) {
        super(Object.assign({}, options, {
            format: new AggregateCountsVectorTileFormat()
        }))

        this.style = options.style
        this.filter = options.filter

        this.tileUrlFunction = this.composeTileUrl.bind(this)
    }

    setStyle(style) {
        this.style = style
        this.refresh()
    }

    setFilter(filter) {
        this.filter = filter
        this.refresh()
    }

    composeTileUrl(coordinates) {
        const url = `/aggregate-counts-for-tile?z=${coordinates[0]}&x=${coordinates[1]}&y=${coordinates[2]}`
        if (this.filter) {
            return `${url}&filter=${encodeURIComponent(JSON.stringify(this.filter))}`
        } else {
            return url
        }
    }

}

export default IconLayerSource