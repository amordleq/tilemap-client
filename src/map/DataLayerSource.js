import XYZ from 'ol/source/XYZ'

class DataLayerSource extends XYZ {

    constructor(options) {
        super(options)

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
        const url = `/${this.style}/${coordinates[0]}/${coordinates[1]}/${coordinates[2]}.png`
        if (this.filter) {
            return `${url}?filter=${encodeURIComponent(JSON.stringify(this.filter))}`
        } else {
            return url
        }
    }

}

export default DataLayerSource