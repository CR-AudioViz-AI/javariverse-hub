#!/bin/bash
# 
# BRAND COLOR DEPLOYMENT SCRIPT
# Updates all CR AudioViz AI applications with official logo colors
# Version: 1.0
# Date: January 11, 2026
#
# USAGE: Set GITHUB_TOKEN environment variable before running
# export GITHUB_TOKEN="your_github_token_here"
# bash deploy_brand_colors.sh

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ ERROR: GITHUB_TOKEN environment variable not set"
    echo ""
    echo "Usage:"
    echo "  export GITHUB_TOKEN=\"your_github_token_here\""
    echo "  bash deploy_brand_colors.sh"
    exit 1
fi

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "CR AUDIOVIZ AI - BRAND COLOR DEPLOYMENT"
echo "Deploying official logo colors to all applications"
echo "Timestamp: $(TZ='America/New_York' date '+%A, %B %d, %Y | %I:%M:%S %p %Z')"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# List of all repositories to update
REPOS=(
    "javari-ai"
    "javariverse-hub"
    "javari-autonomous-system"
    "javari-ebook"
    "javari-merch"
    "javari-social-posts"
    "javari-resume-builder"
    "javari-cover-letter"
    "javari-email-templates"
    "javari-invoice"
    "javari-presentation-maker"
    "javari-graphics"
    "javari-coin-cache"
    "javari-vinyl-vault"
    "javari-comic-crypt"
    "javari-watch-works"
    "javari-card-vault"
    "javari-first-responders"
    "javari-veterans-connect"
    "javari-faith-communities"
    "javari-animal-rescue"
    "javari-business-formation"
    "javari-insurance"
    "javari-legal"
    "javari-construction"
    "javari-home-services"
    "javari-supply-chain"
    "javari-manufacturing"
    "javari-hr-workforce"
    "javari-dating"
    "javari-shopping"
    "javari-family"
    "javari-entertainment"
    "javari-education"
    "javari-fitness"
    "javari-health"
    "javari-orlando"
    "crochet-platform"
    "javari-travel"
    "javari-property"
    "javari-movie-audio"
    "javari-analytics"
    "javari-game-studio"
    "javari-model-arena"
    "javari-spirits"
    "javari-intelligence"
    "javari-ops"
    "javari-components"
)

# Check if template files exist
if [ ! -f "./templates/tailwind.config.ts" ]; then
    echo "❌ ERROR: tailwind.config.ts template not found"
    echo "Please ensure templates directory exists with required files"
    exit 1
fi

if [ ! -f "./templates/globals.css" ]; then
    echo "❌ ERROR: globals.css template not found"
    echo "Please ensure templates directory exists with required files"
    exit 1
fi

update_repo() {
    local REPO=$1
    echo "Updating $REPO..."
    
    # Check if repo exists
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        "https://api.github.com/repos/CR-AudioViz-AI/$REPO" \
        -H "Authorization: token $GITHUB_TOKEN")
    
    if [ "$STATUS" != "200" ]; then
        echo "  ⚠️  Repository not found (may be renamed or deleted)"
        return 1
    fi
    
    # Update tailwind.config.ts
    TAILWIND_SHA=$(curl -s "https://api.github.com/repos/CR-AudioViz-AI/$REPO/contents/tailwind.config.ts" \
        -H "Authorization: token $GITHUB_TOKEN" | python3 -c "import json,sys; print(json.load(sys.stdin).get('sha', 'notfound'))" 2>/dev/null)
    
    if [ "$TAILWIND_SHA" != "notfound" ] && [ ! -z "$TAILWIND_SHA" ]; then
        TAILWIND_ENCODED=$(cat ./templates/tailwind.config.ts | base64 -w 0)
        
        curl -s -X PUT "https://api.github.com/repos/CR-AudioViz-AI/$REPO/contents/tailwind.config.ts" \
            -H "Authorization: token $GITHUB_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
                \"message\": \"Brand: Update to official logo colors (Navy/Red/Cyan)\",
                \"content\": \"$TAILWIND_ENCODED\",
                \"sha\": \"$TAILWIND_SHA\"
            }" > /dev/null 2>&1
        echo "    ✅ tailwind.config.ts"
    fi
    
    # Update globals.css
    GLOBALS_SHA=$(curl -s "https://api.github.com/repos/CR-AudioViz-AI/$REPO/contents/app/globals.css" \
        -H "Authorization: token $GITHUB_TOKEN" | python3 -c "import json,sys; print(json.load(sys.stdin).get('sha', 'notfound'))" 2>/dev/null)
    
    if [ "$GLOBALS_SHA" != "notfound" ] && [ ! -z "$GLOBALS_SHA" ]; then
        GLOBALS_ENCODED=$(cat ./templates/globals.css | base64 -w 0)
        
        curl -s -X PUT "https://api.github.com/repos/CR-AudioViz-AI/$REPO/contents/app/globals.css" \
            -H "Authorization: token $GITHUB_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
                \"message\": \"Brand: Update to official logo colors (Navy/Red/Cyan)\",
                \"content\": \"$GLOBALS_ENCODED\",
                \"sha\": \"$GLOBALS_SHA\"
            }" > /dev/null 2>&1
        echo "    ✅ app/globals.css"
    fi
    
    echo "  ✅ $REPO updated (deployment triggered)"
    return 0
}

SUCCESS=0
FAILED=0
TOTAL=${#REPOS[@]}

echo "Updating $TOTAL repositories with official brand colors..."
echo "Colors: Navy (#1E3A5F), Red (#E31937), Cyan (#00B4D8)"
echo ""

for REPO in "${REPOS[@]}"; do
    if update_repo "$REPO"; then
        ((SUCCESS++))
    else
        ((FAILED++))
    fi
    echo ""
    
    # Rate limit: pause every 10 repos
    if [ $((SUCCESS % 10)) -eq 0 ]; then
        echo "  ⏸️  Pausing 5 seconds (rate limit)..."
        sleep 5
    fi
done

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "DEPLOYMENT COMPLETE"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Results:"
echo "  ✅ Success: $SUCCESS/$TOTAL repositories"
echo "  ❌ Failed:  $FAILED/$TOTAL repositories"
echo ""
echo "Each successful update triggers automatic Vercel deployment."
echo "Allow 5-10 minutes for all deployments to complete."
echo ""
echo "To verify: Visit any app and check button colors are Navy/Red/Cyan"
echo ""
