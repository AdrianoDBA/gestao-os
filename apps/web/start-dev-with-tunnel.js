const { spawn } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("\n\x1b[35m⚡ Iniciando servidor Gestão OS com túnel externo...\x1b[0m\n")

// 1. Inicia o Next.js dev server capturando a saída
const next = spawn("npx", ["next", "dev"], {
  shell: true
})

let tunnelStarted = false
let sshProcess = null

// Repassa a saída do Next.js e detecta a porta em runtime
next.stdout.on("data", (data) => {
  const output = data.toString()
  process.stdout.write(data) // Mantém a visualização do terminal normal

  // Se detectar a porta local (ex: http://localhost:3001) e o túnel ainda não começou
  const matchLocal = output.match(/Local:\s+http:\/\/localhost:(\d+)/i)
  const matchPortInUse = output.match(/trying (\d+) instead/i)
  const port = matchLocal ? matchLocal[1] : (matchPortInUse ? matchPortInUse[1] : null)

  if (port && !tunnelStarted) {
    tunnelStarted = true
    startTunnel(port)
  }
})

next.stderr.on("data", (data) => {
  process.stderr.write(data)
})

function startTunnel(port) {
  console.log(`\n\x1b[33m🔗 Porta Next.js detectada em tempo de execução: ${port}. Iniciando túnel SSH...\x1b[0m\n`)

  // 2. Inicia o Túnel SSH reverso apontando para a porta detectada em tempo de execução
  sshProcess = spawn("ssh", [
    "-o", "StrictHostKeyChecking=no",
    "-o", "UserKnownHostsFile=/dev/null",
    "-R", `80:localhost:${port}`,
    "nokey@localhost.run"
  ], {
    shell: true
  })

  sshProcess.stdout.on("data", (data) => {
    const output = data.toString()
    
    // Captura a URL do túnel na saída do terminal
    const match = output.match(/https:\/\/[a-z0-9-.]+\.lhr\.life|https:\/\/[a-z0-9-.]+\.localhost\.run/i)
    if (match) {
      const url = match[0]
      const border = "═".repeat(url.length + 42)
      
      console.log("\n\x1b[32m" + border)
      console.log(`🚀 LINK DE ACESSO EXTERNO TEMPORÁRIO DA IA: \x1b[36m${url}\x1b[32m`)
      console.log(border + "\x1b[0m\n")
      
      // Salva o link na pasta para clique rápido do usuário
      fs.writeFileSync(path.join(__dirname, "link-acesso-externo.txt"), url)
    }
  })

  sshProcess.stderr.on("data", (data) => {
    // Silencia ou debuga erros do SSH se necessário
  })
}

process.on("SIGINT", () => {
  if (next) next.kill()
  if (sshProcess) sshProcess.kill()
  process.exit()
})
