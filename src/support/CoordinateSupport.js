export function wrapLongitudeTo180(longitude) {
    let result = longitude
    while (result < -180) {
        result += 360
    }
    while (result > 180) {
        result -= 360
    }
    return result
}