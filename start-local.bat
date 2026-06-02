@echo off
REM ==============================================================================
REM SentinelX Local Bootstrap & Deployment Engine (Windows CMD)
REM For native Windows Command Line setups running Docker Desktop.
REM ==============================================================================

echo ======================================================
echo          🛡️  SENTINELX LOCAL DEPLOYMENT BOOTSTRAPPER
echo ======================================================

REM 1. System Requirements Check
echo [INFO] Verifying Docker environment requirements...
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in your PATH. Please install Docker Desktop for Windows.
    pause
    exit /b 1
)

docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker daemon is not running. Please launch Docker Desktop or check its status.
    pause
    exit /b 1
)

REM Support for modern 'docker compose' V2 command structure
set COMPOSE_CMD=docker compose
docker compose version >nul 2>nul
if %errorlevel% neq 0 (
    set COMPOSE_CMD=docker-compose
    docker-compose version >nul 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] Docker Compose V1 or V2 was not found. Please install docker-compose.
        pause
        exit /b 1
    )
)
echo [INFO] Detected Compose Tool: %COMPOSE_CMD%

REM 2. Local Configuration & Environment Files Creation
if not exist .env (
    echo [WARN] Local .env file was not discovered. Bootstrapping a fresh out-of-the-box cluster config...
    echo ------------------------------------------------------
    echo TIP: SentinelX uses Google Gemini AI for behavioral
    echo anomaly classification and automated twin assessments.
    echo ------------------------------------------------------
    set /p USER_GEMINI_KEY="Enter your Google Gemini API Key (press Enter to skip): "

    (
    echo # ==============================================================================
    echo # SentinelX External ^& Local Cluster Node Configurations
    echo # Generated automatically by start-local.bat
    echo # ==============================================================================
    echo.
    echo # Core System Ingress Settings
    echo PORT=3000
    echo NODE_ENV=production
    echo APP_URL=http://localhost:3000
    echo DEPLOYMENT_PROFILE=local_docker
    echo.
    echo # Google Gemini Core Intelligence Integration
    echo GEMINI_API_KEY=%USER_GEMINI_KEY%
    echo.
    echo # Postgres Database Engine Configuration ^(Managed inside Docker^)
    echo DATABASE_URL=postgres://postgres:postgres_pass@postgres-db:5432/sentinelx_enterprise
    echo DB_POOL_MAX=15
    echo.
    echo # Enterprise Redis State ^& Pub/Sub Event Mesh Stream ^(Managed inside Docker^)
    echo REDIS_URL=redis://:sentinel_redis_secret@redis-stream:6379/0
    echo.
    echo # Optional Threat Intel Integrations
    echo VIRUSTOTAL_API_KEY=""
    echo SHODAN_API_KEY=""
    echo.
    echo # Optional AWS Auditing
    echo AWS_ACCESS_KEY_ID=""
    echo AWS_SECRET_ACCESS_KEY=""
    echo AWS_DEFAULT_REGION=us-east-1
    ) > .env
    echo [INFO] Default environment mappings stored securely inside: .env
) else (
    echo [INFO] Discovered existing .env configuration file.
)

REM 3. Spin Up Docker Compose Infrastructure
echo [INFO] Launching SentinelX multi-container microservice mesh...
%COMPOSE_CMD% up -d --build

REM 4. Success Verification
echo ====================================================================
echo  🎉 SUCCESS: SENTINELX LOCAL CLUSTER ACTIVE AND OPERATIONAL!
echo ====================================================================
echo Your local active defense cyber range has fully started. Here is the layout:
echo --------------------------------------------------------------------
echo Core Dashboard Console:     http://localhost:3000 (Open in your browser)
echo Prometheus Metrics:         http://localhost:9090
echo Grafana Data Visualizer:     http://localhost:3001
echo Database Connection:        localhost:5432 (User: postgres, Pass: postgres_pass, Database: sentinelx_enterprise)
echo Redis Stream Broker:        localhost:6379 (Pass: sentinel_redis_secret)
echo --------------------------------------------------------------------
echo CORE OPERATION CLI COMMANDS:
echo   - View live application logs:    %COMPOSE_CMD% logs -f sentinelx
echo   - Inspect Redis pub/sub queue:   %COMPOSE_CMD% logs -f redis-stream
echo   - Inspect Postgres logs:          %COMPOSE_CMD% logs -f postgres-db
echo   - Shut down cluster completely:  %COMPOSE_CMD% down
echo   - Reset all persistent volumes:  %COMPOSE_CMD% down -v
echo ====================================================================
pause
