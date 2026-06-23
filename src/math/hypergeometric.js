// Log-factorial cache — avoids float overflow for large N
const LOG_FACT = [0]

function logFact(n) {
  for (let i = LOG_FACT.length; i <= n; i++) {
    LOG_FACT.push(LOG_FACT[i - 1] + Math.log(i))
  }
  return LOG_FACT[n]
}

function logBinomial(n, k) {
  if (k < 0 || k > n) return -Infinity
  if (k === 0 || k === n) return 0
  return logFact(n) - logFact(k) - logFact(n - k)
}

/**
 * Hypergeometric PMF: P(X = k)
 * Drawing n cards from a deck of N containing K successes.
 */
export function hypergeometric(N, K, n, k) {
  if (k < 0 || k > Math.min(K, n) || (n - k) > (N - K)) return 0
  return Math.exp(logBinomial(K, k) + logBinomial(N - K, n - k) - logBinomial(N, n))
}

/**
 * Build a [5][12] probability matrix.
 * matrix[roundIdx][k] = P(exactly k successes drawing hands[roundIdx] cards)
 */
export function buildMatrix(N, K, hands = [7, 8, 9, 10, 11], maxK = 11) {
  return hands.map(n =>
    Array.from({ length: maxK + 1 }, (_, k) => hypergeometric(N, K, n, k))
  )
}
