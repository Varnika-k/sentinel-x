#!/usr/bin/env bash
# ==============================================================================
# SentinelX Local Bootstrap & Deployment Engine
# Compatible with Ubuntu WSL, Docker Desktop, and standard Linux/macOS.
# ==============================================================================

set -eo pipefail

# Visual ANSI Color Codes for beautiful terminal layouts
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${BLUE}======================================================"
echo -e "         🛡️  SENTINELX LOCAL DEPLOYMENT BOOTSTRAPPER"
echo -e "======================================================${NC}"

# Define utility function for logging Info, Warn, Error
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_err() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. System Requirements & Dependency Check
log_info "Verifying deployment environment dependencies..."

if ! command -v docker &> /dev/null; then
    log_err "Docker is not installed or not in your PATH. Please install Docker in WSL or Docker Desktop first."
    exit 1
fi

if ! docker info &> /dev/null; then
    log_err "Docker daemon is not running. Please launch Docker Desktop or start your Docker service (sudo service docker start)."
    exit 1
fi

# Support for modern 'docker compose' V2 command structure
COMPOSE_CMD=""
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    log_err "Docker Compose (V1 or V2) was not detected. Please install docker-compose."
    exit 1
fi
log_info "Detected Compose Tool: ${BOLD}$COMPOSE_CMD${NC}"

# 2. Local Configuration & Environment Files Creation
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    log_warn "Local .env file was not discovered. Bootstrapping a fresh out-of-the-box cluster config..."
    
    # Prompt user for Gemini API Key to enable AI features immediately
    echo -e "${YELLOW}------------------------------------------------------"
    echo -e "💡 TIP: SentinelX uses Google Gemini AI for behavioral"
    echo -e "anomaly classification and automated twin assessments."
    echo -e "------------------------------------------------------${NC}"
    read -p "Enter your Google Gemini API Key (press Enter to skip): " USER_GEMINI_KEY
    
    cat <<EOF > "$ENV_FILE"
# ==============================================================================
# SentinelX External & Local Cluster Node Configurations
# Generated automatically by start-local.sh
# ==============================================================================

# Core System Ingress Settings
PORT=3000
NODE_ENV=production
APP_URL=http://localhost:3000
DEPLOYMENT_PROFILE=local_docker

# Google Gemini Core Intelligence Integration
GEMINI_API_KEY="${USER_GEMINI_KEY:-}"

# Postgres Database Engine Configuration (Managed inside Docker)
DATABASE_URL=postgres://postgres:postgres_pass@postgres-db:5432/sentinelx_enterprise
DB_POOL_MAX=15

# Enterprise Redis State & Pub/Sub Event Mesh Stream (Managed inside Docker)
REDIS_URL=redis://:sentinel_redis_secret@redis-stream:6379/0

# Optional Threat Intel Integrations
VIRUSTOTAL_API_KEY=""
SHODAN_API_KEY=""

# Optional AWS Auditing
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_DEFAULT_REGION=us-east-1
EOF
    log_info "Default environment mappings stored securely inside: ${BOLD}.env${NC}"
else
    log_info "Discovered existing .env configuration file."
fi

# 3. Spin Up Docker Compose Infrastructure
log_info "Launching SentinelX multi-container microservice mesh..."
$COMPOSE_CMD up -d --build

# 4. Success Verification & Interactive Operational Manual
echo -e "\n${GREEN}===================================================================="
echo -e " 🎉 SUCCESS: SENTINELX LOCAL CLUSTER ACTIVE AND OPERATIONAL!"
echo -e "====================================================================${NC}"
echo -e "Your local active defense cyber range has fully started. Here is the layout:"
echo -e "--------------------------------------------------------------------"
echo -e "📱 ${BOLD}Core Dashboard Console:${NC}     http://localhost:3000 (Open in your browser)"
echo -e "📊 ${BOLD}Prometheus Metrics:${NC}         http://localhost:9090"
echo -e "📈 ${BOLD}Grafana Data Visualizer:${NC}     http://localhost:3001"
echo -e "📖 ${BOLD}Database Connection Endpoint:${NC}  localhost:5432 (User: postgres, Pass: postgres_pass, Database: sentinelx_enterprise)"
echo -e "⚡ ${BOLD}Redis Stream Broker Hub:${NC}     localhost:6379 (Pass: sentinel_redis_secret)"
echo -e "--------------------------------------------------------------------"
echo -e "${BLUE}💡 CORE OPERATION CLI COMMANDS:${NC}"
echo -e "  - View live application logs:    ${BOLD}$COMPOSE_CMD logs -f sentinelx${NC}"
echo -e "  - Inspect Redis pub/sub queue:   ${BOLD}$COMPOSE_CMD logs -f redis-stream${NC}"
echo -e "  - Inspect Postgres logs:          ${BOLD}$COMPOSE_CMD logs -f postgres-db${NC}"
echo -e "  - Shut down cluster completely:  ${BOLD}$COMPOSE_CMD down${NC}"
echo -e "  - Reset all persistent volumes:  ${BOLD}$COMPOSE_CMD down -v${NC}"
echo -e "===================================================================="
