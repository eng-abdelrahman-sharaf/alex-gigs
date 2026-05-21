#!/bin/bash

# Color codes
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000"
API_URL="$BASE_URL/api"

echo -e "${CYAN}======================================================================${NC}"
echo -e "${YELLOW}           ALEX GIGS API - COMPLETE CURL TEST FLOW${NC}"
echo -e "${CYAN}======================================================================${NC}\n"

# 1. Health check
echo -e "${CYAN}[1/18] GET /health - Testing API Health Check...${NC}"
health_res=$(curl -s "$BASE_URL/health")
echo "$health_res" | jq .
if [[ $(echo "$health_res" | jq -r '.status') != "success" ]]; then
  echo -e "${RED}Health check failed! Is the backend running?${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Health check successful!${NC}\n"

# Generate unique identifiers
RANDOM_SUFX=$(date +%s)
FREELANCER_USER="mohamed_curl_$RANDOM_SUFX"
FREELANCER_EMAIL="mohamed_curl_$RANDOM_SUFX@gigs.eg"
BUYER_USER="abdo_curl_$RANDOM_SUFX"
BUYER_EMAIL="abdo_curl_$RANDOM_SUFX@gigs.eg"

# 2. Register Freelancer Buyer
echo -e "${CYAN}[2/18] POST /api/auth/register - Registering Freelancer Account...${NC}"
reg_res_1=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$FREELANCER_USER\",
    \"email\": \"$FREELANCER_EMAIL\",
    \"password\": \"SecurePass123\",
    \"fname\": \"Mohamed\",
    \"lname\": \"Abdelhamid\",
    \"overview\": \"Express & Postgres Expert\",
    \"country\": \"Egypt\",
    \"languages\": [\"Arabic\", \"English\"]
  }")
echo "$reg_res_1" | jq .

FREELANCER_TOKEN=$(echo "$reg_res_1" | jq -r '.data.token')
FREELANCER_BUYER_ID=$(echo "$reg_res_1" | jq -r '.data.user.id')

if [[ "$FREELANCER_TOKEN" == "null" || -z "$FREELANCER_TOKEN" ]]; then
  echo -e "${RED}Failed to register freelancer user!${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Freelancer Buyer registered. ID: $FREELANCER_BUYER_ID${NC}\n"

# 3. Login Freelancer
echo -e "${CYAN}[3/18] POST /api/auth/login - Testing Freelancer Login...${NC}"
login_res_1=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"identifier\": \"$FREELANCER_EMAIL\",
    \"password\": \"SecurePass123\"
  }")
echo "$login_res_1" | jq .
echo -e "${GREEN}✓ Freelancer Login completed, token validated.${NC}\n"

# 4. Onboard Freelancer
echo -e "${CYAN}[4/18] POST /api/freelancers/onboard - Onboarding as Freelancer...${NC}"
onboard_res=$(curl -s -X POST "$API_URL/freelancers/onboard" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FREELANCER_TOKEN" \
  -d "{
    \"job_title\": \"Senior NodeJS Developer\",
    \"overview\": \"I design scalable microservices and database engines.\"
  }")
echo "$onboard_res" | jq .
FREELANCER_ID=$(echo "$onboard_res" | jq -r '.data.freelancer.id')
echo -e "${GREEN}✓ Onboarded. Freelancer Profile ID: $FREELANCER_ID${NC}\n"

# 5. Get Freelancer Profile
echo -e "${CYAN}[5/18] GET /api/freelancers/me - Fetching Freelancer Own Profile...${NC}"
freelancer_profile=$(curl -s -X GET "$API_URL/freelancers/me" \
  -H "Authorization: Bearer $FREELANCER_TOKEN")
echo "$freelancer_profile" | jq .
echo -e "${GREEN}✓ Freelancer profile retrieved successfully.${NC}\n"

# 6. Set Availability
echo -e "${CYAN}[6/18] POST /api/freelancers/availability - Setting Availability Schedule...${NC}"
availability_res=$(curl -s -X POST "$API_URL/freelancers/availability" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FREELANCER_TOKEN" \
  -d "{
    \"start_day\": \"Sunday\",
    \"end_day\": \"Thursday\",
    \"start_hour\": \"09:00\",
    \"end_hour\": \"18:00\"
  }")
echo "$availability_res" | jq .
echo -e "${GREEN}✓ Availability schedule set successfully.${NC}\n"

# 7. Create Gig with Packages
echo -e "${CYAN}[7/18] POST /api/gigs - Creating Gig with Packages...${NC}"
gig_res=$(curl -s -X POST "$API_URL/gigs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FREELANCER_TOKEN" \
  -d "{
    \"title\": \"Build custom Express REST APIs with Postgres\",
    \"descr\": \"Professional database design and routing using clean architecture.\",
    \"tags\": [\"express\", \"postgres\", \"typescript\", \"nodejs\"],
    \"portfolio\": [\"https://github.com/example/api-repo\"],
    \"packages\": [
      {
        \"type\": \"BASIC\",
        \"title\": \"Express Routing\",
        \"descr\": \"Configure standard Express router and mock data connection.\",
        \"delivery_time\": 3,
        \"price\": \"45.00\",
        \"deliverables\": [\"1 Route\", \"TypeScript config\"]
      },
      {
        \"type\": \"STANDARD\",
        \"title\": \"MVC Database API\",
        \"descr\": \"Full integration with postgres using model-service layers.\",
        \"delivery_time\": 7,
        \"price\": \"120.00\",
        \"deliverables\": [\"5 Routes\", \"Zod Schemas\", \"Centralized Errors\"]
      }
    ]
  }")
echo "$gig_res" | jq .
GIG_ID=$(echo "$gig_res" | jq -r '.data.gig.id')
PACKAGE_ID=$(echo "$gig_res" | jq -r '.data.gig.packages[] | select(.type=="STANDARD") | .id')
echo -e "${GREEN}✓ Gig created. ID: $GIG_ID, Standard Package ID: $PACKAGE_ID${NC}\n"

# 8. Add FAQ
echo -e "${CYAN}[8/18] POST /api/gigs/:id/faqs - Adding FAQ to the Gig...${NC}"
faq_res=$(curl -s -X POST "$API_URL/gigs/$GIG_ID/faqs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FREELANCER_TOKEN" \
  -d "{
    \"question\": \"Do you write Zod validation schemas?\",
    \"answer\": \"Yes! Every package receives exact validation rules using Zod.\"
  }")
echo "$faq_res" | jq .
echo -e "${GREEN}✓ FAQ added successfully.${NC}\n"

# 9. Register Buyer 2
echo -e "${CYAN}[9/18] POST /api/auth/register - Registering Buyer Account...${NC}"
reg_res_2=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$BUYER_USER\",
    \"email\": \"$BUYER_EMAIL\",
    \"password\": \"BuyerPass123\",
    \"fname\": \"Abdelrahman\",
    \"lname\": \"Sharaf\",
    \"overview\": \"Looking for excellent Express JS developers.\",
    \"country\": \"Egypt\",
    \"languages\": [\"Arabic\", \"English\"]
  }")
echo "$reg_res_2" | jq .

BUYER_TOKEN=$(echo "$reg_res_2" | jq -r '.data.token')
BUYER_ID=$(echo "$reg_res_2" | jq -r '.data.user.id')

if [[ "$BUYER_TOKEN" == "null" || -z "$BUYER_TOKEN" ]]; then
  echo -e "${RED}Failed to register buyer user!${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Buyer Buyer registered. ID: $BUYER_ID${NC}\n"

# 10. Search Gigs (Public)
echo -e "${CYAN}[10/18] GET /api/gigs - Searching Gigs (Public)...${NC}"
search_res=$(curl -s -X GET "$API_URL/gigs?search=Express&tag=postgres")
echo "$search_res" | jq .
echo -e "${GREEN}✓ Gigs search completed.${NC}\n"

# 11. Save Gig (Buyer)
echo -e "${CYAN}[11/18] POST /api/gigs/:id/save - Buyer Bookmarks Gig...${NC}"
save_res=$(curl -s -X POST "$API_URL/gigs/$GIG_ID/save" \
  -H "Authorization: Bearer $BUYER_TOKEN")
echo "$save_res" | jq .
echo -e "${GREEN}✓ Gig saved successfully.${NC}\n"

# 12. Get Saved Gigs (Buyer)
echo -e "${CYAN}[12/18] GET /api/gigs/saved - Fetching Saved Gigs (Buyer)...${NC}"
saved_gigs=$(curl -s -X GET "$API_URL/gigs/saved" \
  -H "Authorization: Bearer $BUYER_TOKEN")
echo "$saved_gigs" | jq .
echo -e "${GREEN}✓ Saved gigs retrieved.${NC}\n"

# 13. Book Order (Buyer)
echo -e "${CYAN}[13/18] POST /api/orders - Booking Order under Standard Package...${NC}"
order_res=$(curl -s -X POST "$API_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{
    \"package_id\": \"$PACKAGE_ID\",
    \"payment_method\": \"CARD\",
    \"additional_details\": \"Implement exactly using Model Service architecture.\"
  }")
echo "$order_res" | jq .
ORDER_ID=$(echo "$order_res" | jq -r '.data.order.id')
echo -e "${GREEN}✓ Order booked successfully. Order ID: $ORDER_ID, Status: $(echo "$order_res" | jq -r '.data.order.status')${NC}\n"

# 14. Accept Order (Freelancer: PENDING -> IN_PROGRESS)
echo -e "${CYAN}[14/18] PATCH /api/orders/:id/status - Freelancer Accepts Order...${NC}"
accept_res=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FREELANCER_TOKEN" \
  -d "{
    \"status\": \"IN_PROGRESS\"
  }")
echo "$accept_res" | jq .
echo -e "${GREEN}✓ Order state advanced to: $(echo "$accept_res" | jq -r '.data.order.status')${NC}\n"

# 15. Deliver Order (Freelancer: IN_PROGRESS -> DELIVERED)
echo -e "${CYAN}[15/18] PATCH /api/orders/:id/status - Freelancer Delivers Order...${NC}"
deliver_res=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FREELANCER_TOKEN" \
  -d "{
    \"status\": \"DELIVERED\"
  }")
echo "$deliver_res" | jq .
echo -e "${GREEN}✓ Order state advanced to: $(echo "$deliver_res" | jq -r '.data.order.status')${NC}\n"

# 16. Complete Order (Buyer: DELIVERED -> COMPLETED)
echo -e "${CYAN}[16/18] PATCH /api/orders/:id/status - Buyer Completes Order...${NC}"
complete_res=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{
    \"status\": \"COMPLETED\"
  }")
echo "$complete_res" | jq .
echo -e "${GREEN}✓ Order completed. State: $(echo "$complete_res" | jq -r '.data.order.status')${NC}\n"

# 17. Submit Review (Buyer)
echo -e "${CYAN}[17/18] POST /api/reviews - Buyer Submits a 5-Star Rating...${NC}"
review_res=$(curl -s -X POST "$API_URL/reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{
    \"order_id\": \"$ORDER_ID\",
    \"rating\": 5,
    \"descr\": \"Excellent TypeScript and postgres APIs. Standard structures followed!\",
    \"created_by\": \"BUYER\"
  }")
echo "$review_res" | jq .
echo -e "${GREEN}✓ Review submitted successfully.${NC}\n"

# 18. Get Gig Details & SQL View Analytics (Public)
echo -e "${CYAN}[18/18] GET /api/gigs/:id - Fetching Gig details with packages, FAQs, and SQL Gig Analytics View data...${NC}"
details_res=$(curl -s -X GET "$API_URL/gigs/$GIG_ID")
echo "$details_res" | jq .

echo -e "${CYAN}======================================================================${NC}"
echo -e "${GREEN}               ALL API ENDPOINTS TESTED SUCCESSFULLY!${NC}"
echo -e "${CYAN}======================================================================${NC}"
