const morgan = require("morgan")

// Custom token for response time
morgan.token("response-time", (req, res) => {
  if (!req._startAt || !res._startAt) {
    return "-"
  }

  const ms = (res._startAt[0] - req._startAt[0]) * 1e3 + (res._startAt[1] - req._startAt[1]) * 1e-6

  return ms.toFixed(3)
})

// Custom format
const logFormat = ":method :url :status :res[content-length] - :response-time ms"

const logger = morgan(logFormat, {
  skip: (req, res) => {
    // Skip logging for health checks
    return req.url === "/health"
  },
})

module.exports = logger