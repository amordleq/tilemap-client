class ElasticsearchFilterBuilder {

    constructor() {
        this.clauses = []
    }

    matchAny(fieldName, values) {
        this.clauses.push(this.createShouldMatchClause(fieldName, values))
    }

    matchRange(fieldName, min, max) {
        this.clauses.push(this.createRangeClause(fieldName, min, max))
    }

    toString() {
        if (this.clauses.length > 0) {
            return {
                'bool': {
                    'must': [this.clauses]
                }
            }
        } else {
            return null
        }
    }

    /**
     * @private
     */
    createShouldMatchClause(fieldName, values) {
        return {
            'bool': {
                'should': values.map(value => {
                    return {
                        'match': {
                            [fieldName]: value
                        }
                    }
                })
            }
        }
    }

    /**
     * @private
     */
    createRangeClause(fieldName, min, max) {
        return {
            'range': {
                [fieldName]: {
                    'gte': min,
                    'lte': max
                }
            }
        }
    }

}

export default ElasticsearchFilterBuilder