# Create test data
$body = @{
    email = "kvnlhm@gmail.com"
    password = "password123"
}

# Convert to JSON
$jsonBody = ConvertTo-Json -InputObject $body

# Test API call
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $jsonBody -ContentType "application/json" -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "=== API Test Result ==="
    Write-Host "Status: Success"
    Write-Host "Token: $($result.token)"
    Write-Host "User: $($result.user.email)"
    
} catch {
    Write-Host "=== API Test Failed ==="
    Write-Host "Error: $_"
}
