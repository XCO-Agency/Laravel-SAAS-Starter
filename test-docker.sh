#!/bin/bash

# Test Dockerfile locally

echo "🧪 Testing Dockerfile locally..."
echo ""

# Test 1: Build composer-build stage
echo "📦 Step 1: Testing composer-build stage..."
docker build --target composer-build -t laravel-saas-composer-build . && \
    echo "✅ composer-build stage: SUCCESS" || \
    echo "❌ composer-build stage: FAILED"

echo ""

# Test 2: Build node-build stage
echo "📦 Step 2: Testing node-build stage..."
docker build --target node-build -t laravel-saas-node-build . && \
    echo "✅ node-build stage: SUCCESS" || \
    echo "❌ node-build stage: FAILED"

echo ""

# Test 3: Build full image
echo "📦 Step 3: Building full production image..."
docker build -t laravel-saas-starter:test . && \
    echo "✅ Full build: SUCCESS" || \
    echo "❌ Full build: FAILED"

echo ""

# Test 4: Check if image was created
if docker images | grep -q "laravel-saas-starter.*test"; then
    echo "✅ Image created successfully"
    echo ""
    echo "🚀 To run the container:"
    echo "   docker run -p 8000:8000 --env-file .env laravel-saas-starter:test"
    echo ""
    echo "🔍 To inspect the image:"
    echo "   docker images laravel-saas-starter:test"
    echo ""
    echo "📝 To check image size:"
    echo "   docker images laravel-saas-starter:test --format '{{.Size}}'"
else
    echo "❌ Image not found"
fi

