import XYZ from 'ol/source/XYZ'

class FilterableXYZ extends XYZ {

    constructor(options) {
        super(options)

        this.filter = options.filter

        this.tileUrlFunction = this.composeTileUrl.bind(this)
    }

    setFilter(filter) {
        this.filter = filter
        this.refresh()
    }

    composeTileUrl(coordinates) {
        const url = `/${coordinates[0]}/${coordinates[1]}/${coordinates[2]}.png`
        if (this.filter) {
            return `${url}?filter=${encodeURIComponent(JSON.stringify(this.filter))}`
        } else {
            return url
        }
    }

}

export default FilterableXYZ