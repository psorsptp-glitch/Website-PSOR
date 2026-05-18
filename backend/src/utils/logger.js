const colors = {
  reset: '\x1b[0m', green: '\x1b[32m',
  yellow: '\x1b[33m', red: '\x1b[31m', cyan: '\x1b[36m'
}
const ts = () => new Date().toISOString()

export const logger = {
  info:  (msg, ...args) => console.log(`${colors.cyan}[INFO]${colors.reset} ${ts()} ${msg}`, ...args),
  warn:  (msg, ...args) => console.warn(`${colors.yellow}[WARN]${colors.reset} ${ts()} ${msg}`, ...args),
  error: (msg, ...args) => console.error(`${colors.red}[ERROR]${colors.reset} ${ts()} ${msg}`, ...args),
  success:(msg,...args) => console.log(`${colors.green}[OK]${colors.reset} ${ts()} ${msg}`, ...args),
}
