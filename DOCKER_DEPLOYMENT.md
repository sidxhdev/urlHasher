# Docker Deployment Guide

## EC2 Deployment with Docker

This setup deploys all three services (Frontend, Backend, Database) on a single EC2 instance using Docker and Docker Compose.

### Prerequisites

1. EC2 Instance (Ubuntu 20.04 or later recommended)
2. SSH access to the instance
3. At least 2GB RAM and 10GB storage

### Installation Steps

#### 1. Install Docker and Docker Compose

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

#### 2. Clone/Upload Project

```bash
# Clone repository or upload your project
cd /home/ubuntu
git clone <your-repo-url> urlhasher
# OR
scp -r ~/projects/urlHasher ubuntu@<ec2-ip>:/home/ubuntu/
```

#### 3. Create Environment File

Create `.env` file in the project root:

```bash
cd urlhasher
cat > .env << EOF
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=urlhasher
BASE_URL=http://your-ec2-ip-or-domain
ENVIRONMENT=production
EOF
```

#### 4. Build and Start Services

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f
```

#### 5. Verify Services

```bash
# Check running containers
docker-compose ps

# Test backend health
curl http://localhost:8080/api/health

# Test frontend
curl http://localhost
```

### File Explanations

#### docker-compose.yml
- **db service**: PostgreSQL database with persistent volume
- **backend service**: Go API server connecting to database
- **frontend service**: React app served by Nginx with API proxy
- **Networks**: Internal communication between services
- **Volumes**: Data persistence for PostgreSQL

#### server/Dockerfile
- **Multi-stage build**: Reduces final image size
- **Builder stage**: Compiles Go binary
- **Runtime stage**: Runs minimal Alpine Linux with binary

#### client/Dockerfile
- **Multi-stage build**: Reduces production image size
- **Builder stage**: Installs dependencies and builds React
- **Runtime stage**: Serves with Nginx

#### client/nginx.conf
- **Frontend routing**: Handles React SPA routing
- **API proxy**: Routes `/api/` and `/redirect/` to backend service
- **CORS ready**: Properly configured for API communication

### Stopping Services

```bash
docker-compose down
```

### Viewing Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Follow logs
docker-compose logs -f
```

### Accessing Services

- **Frontend**: http://your-ec2-ip/
- **Backend API**: http://your-ec2-ip/api/
- **Database**: localhost:5432 (accessible from EC2 only)

### Security Considerations

1. Change default PostgreSQL password in `.env`
2. Use security groups to restrict ports
3. Setup SSL/TLS with AWS Certificate Manager or Let's Encrypt
4. Use AWS RDS instead of containerized DB for production
5. Enable EC2 monitoring and logging

### Scaling Notes

For larger deployments:
- Use AWS RDS for managed database
- Use AWS ECR for image registry
- Use ECS or EKS for container orchestration
- Add load balancer for multiple instances
- Setup auto-scaling groups

### Troubleshooting

**Service won't start:**
```bash
docker-compose logs <service-name>
```

**Port already in use:**
```bash
# Change port in docker-compose.yml
# OR kill existing process
lsof -i :80  # Check what's using port 80
```

**Database connection error:**
- Check `.env` file
- Ensure db service is healthy: `docker-compose ps`
- Verify DATABASE_URL format

**Frontend not connecting to backend:**
- Check nginx.conf proxy settings
- Verify backend is running: `docker-compose ps`
- Check browser console for CORS errors
