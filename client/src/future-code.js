var space = [1.0, 0.0, 0.0, 0.0]
var backup = 0
var n = 1
var x = 0
var dim = 4
while (x < dim - 1) {
    if (backup === 1500) { return x = dim }
    backup ++

    space[x] -= 0.1
    space[n] += 0.1
    space[x] = Math.round(space[x]*10) / 10
    space[n] = Math.round(space[n]*10) / 10

    // console.log(x, n)
    latentSpaces.push(space)
    // console.log(latentSpaces)

    if (space[n] === 1) {
        space[x] = 0.0
        space[n] = 0.0
        if (n === dim - 1) {
            x ++
            n = x + 1
        }
        else {
            n ++
        }
        space[x] = 1.0
        space[n] = 0.0
    }
}
console.log(latentSpaces)