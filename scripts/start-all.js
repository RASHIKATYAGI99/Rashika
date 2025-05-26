const { spawn } = require("child_process")
const path = require("path")

console.log("🚀 Starting all microservices...\n")

const services = [
  { name: "Books Service", script: "services/books/server.js", port: 3001 },
  { name: "Users Service", script: "services/users/server.js", port: 3002 },
  { name: "Orders Service", script: "services/orders/server.js", port: 3003 },
  { name: "API Gateway", script: "gateway/server.js", port: 3000 },
]

services.forEach((service) => {
  const child = spawn("node", [service.script], {
    stdio: "inherit",
    cwd: process.cwd(),
  })

  child.on("error", (err) => {
    console.error('❌ Error starting ${service.name}:', err)
  })

  console.log('✅ ${service.name} starting on port ${service.port}')
})

console.log("\n📚 Book Store API is running!")
console.log("🌐 API Gateway: http://localhost:3000")
console.log("📖 Swagger Documentation: http://localhost:3000/api-docs")