import {containsAllLongitudes, wrapLongitudeTo180} from './CoordinateSupport'

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
    describe('containsAllLongitudes', () => {
        test('is true if zoomed out and east/west are the same', () => {
            expect(containsAllLongitudes(175, -80, 175, 80)).toBe(true)
            expect(containsAllLongitudes(175.01, -80, 175, 80)).toBe(true)
        })
        test('is false if zoomed in and east/west are the same', () => {
            expect(containsAllLongitudes(175, 5, 175, 6)).toBe(false)
            expect(containsAllLongitudes(175.01, 5, 175, 6)).toBe(false)
        })
    })
})