let factorials = []

export const factorial = (x) => {
  if (factorials.length == 0) {
    factorials.push(1)
    factorials.push(1)
    for (let i = 2; i <= 10; i++) {
      factorials[i] = factorials[i - 1] * i;
    }
  }

  return factorials[x]
}


export const INTERFACE_STATE = {
  NOW: "NOW",
  ONE_DAY: "ONE_DAY",
  ONE_WEEK: "ONE_WEEK",
  ALL_TIME: "ALL_TIME"
}

export const getProbabilityForCoordinates = (column, row) => {
  let totalPossibilities = 1 << (column - 1)
  let binomial = factorial(column - 1) / (factorial(row - 1) * factorial(column - row))

  return binomial / totalPossibilities
}