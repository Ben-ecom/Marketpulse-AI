#!/bin/bash

# Kleuren voor output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:5002/api/v1"

# Test health endpoint
echo -e "${YELLOW}Testing health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s "$BASE_URL/health")
if [[ $HEALTH_RESPONSE == *"success\":true"* ]]; then
  echo -e "${GREEN}Health endpoint test: SUCCESS${NC}"
  echo "$HEALTH_RESPONSE" | jq '.'
else
  echo -e "${RED}Health endpoint test: FAILED${NC}"
  echo "$HEALTH_RESPONSE" | jq '.'
fi
echo ""

# Test projects endpoint (zonder authenticatie, verwacht 401)
echo -e "${YELLOW}Testing projects endpoint without authentication...${NC}"
PROJECTS_RESPONSE=$(curl -s "$BASE_URL/projects")
if [[ $PROJECTS_RESPONSE == *"NOT_AUTHENTICATED"* ]]; then
  echo -e "${GREEN}Projects endpoint authentication test: SUCCESS${NC}"
  echo "$PROJECTS_RESPONSE" | jq '.'
else
  echo -e "${RED}Projects endpoint authentication test: FAILED${NC}"
  echo "$PROJECTS_RESPONSE" | jq '.'
fi
echo ""

# Test data endpoints (zonder authenticatie, verwacht 401)
echo -e "${YELLOW}Testing data/reddit endpoint without authentication...${NC}"
DATA_RESPONSE=$(curl -s "$BASE_URL/data/reddit/123")
if [[ $DATA_RESPONSE == *"NOT_AUTHENTICATED"* ]]; then
  echo -e "${GREEN}Data endpoint authentication test: SUCCESS${NC}"
  echo "$DATA_RESPONSE" | jq '.'
else
  echo -e "${RED}Data endpoint authentication test: FAILED${NC}"
  echo "$DATA_RESPONSE" | jq '.'
fi
echo ""

# Test insights endpoints (zonder authenticatie, verwacht 401)
echo -e "${YELLOW}Testing insights/pain-points endpoint without authentication...${NC}"
INSIGHTS_RESPONSE=$(curl -s "$BASE_URL/insights/pain-points/123")
if [[ $INSIGHTS_RESPONSE == *"NOT_AUTHENTICATED"* ]]; then
  echo -e "${GREEN}Insights endpoint authentication test: SUCCESS${NC}"
  echo "$INSIGHTS_RESPONSE" | jq '.'
else
  echo -e "${RED}Insights endpoint authentication test: FAILED${NC}"
  echo "$INSIGHTS_RESPONSE" | jq '.'
fi
echo ""

# Test data collection endpoint (zonder authenticatie, verwacht 401)
echo -e "${YELLOW}Testing data/collect endpoint without authentication...${NC}"
COLLECT_RESPONSE=$(curl -s -X POST "$BASE_URL/data/collect" -H "Content-Type: application/json" -d '{"project_id":"123"}')
if [[ $COLLECT_RESPONSE == *"NOT_AUTHENTICATED"* ]]; then
  echo -e "${GREEN}Data collection endpoint authentication test: SUCCESS${NC}"
  echo "$COLLECT_RESPONSE" | jq '.'
else
  echo -e "${RED}Data collection endpoint authentication test: FAILED${NC}"
  echo "$COLLECT_RESPONSE" | jq '.'
fi
echo ""

# Test insights generation endpoint (zonder authenticatie, verwacht 401)
echo -e "${YELLOW}Testing insights/generate endpoint without authentication...${NC}"
GENERATE_RESPONSE=$(curl -s -X POST "$BASE_URL/insights/generate" -H "Content-Type: application/json" -d '{"project_id":"123"}')
if [[ $GENERATE_RESPONSE == *"NOT_AUTHENTICATED"* ]]; then
  echo -e "${GREEN}Insights generation endpoint authentication test: SUCCESS${NC}"
  echo "$GENERATE_RESPONSE" | jq '.'
else
  echo -e "${RED}Insights generation endpoint authentication test: FAILED${NC}"
  echo "$GENERATE_RESPONSE" | jq '.'
fi
echo ""

echo -e "${YELLOW}API tests completed${NC}"
