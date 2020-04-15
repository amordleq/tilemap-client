import {wrapLongitudeTo180} from './CoordinateSupport'

describe('CoordinateSupport', () => {
    describe('wrapLongitudeTo180', () => {
        test('wraps longitude values into the [-180, 180] range', () => {
            expect(wrapLongitudeTo180(0)).toEqual(0)
            expect(wrapLongitudeTo180(180)).toEqual(180)
            expect(wrapLongitudeTo180(-180)).toEqual(-180)
            expect(wrapLongitudeTo180(-185)).toEqual(175)
            expect(wrapLongitudeTo180(185)).toEqual(-175)
            expect(wrapLongitudeTo180(-280)).toEqual(80)
            expect(wrapLongitudeTo180(280)).toEqual(-80)
            expect(wrapLongitudeTo180(540)).toEqual(180)
            expect(wrapLongitudeTo180(-540)).toEqual(-180)
        })
    })
})