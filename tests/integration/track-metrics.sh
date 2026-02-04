#!/bin/bash

# Test Metrics Tracker for Integration Tests
# This script tracks test performance over time and generates trend analysis

echo "📊 Test Metrics Tracker"
echo "====================="

# Create metrics directory
mkdir -p test-results/metrics
mkdir -p test-results/trends

# Set timestamp for metrics
TIMESTAMP=$(date +"%Y-%m-%d-%H-%M-%S")
METRICS_FILE="test-results/metrics/metrics-$TIMESTAMP.json"
TRENDS_FILE="test-results/trends/trends.json"

echo "📅 Metrics Collection: $TIMESTAMP"
echo "📁 Metrics File: $METRICS_FILE"

# Function to collect current test metrics
collect_metrics() {
    echo "📈 Collecting test metrics..."
    
    # Run tests and collect metrics
    local start_time=$(date +%s)
    
    # Run authentication tests
    echo "🧪 Running Authentication tests..."
    local auth_start=$(date +%s)
    npm run test:integration:auth > /tmp/auth-metrics.log 2>&1
    local auth_end=$(date +%s)
    local auth_duration=$((auth_end - auth_start))
    local auth_status=$?
    
    # Parse test results from log
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    
    if [ $auth_status -eq 0 ]; then
        total_tests=$(grep -c "√" /tmp/auth-metrics.log || echo "0")
        passed_tests=$total_tests
        failed_tests=0
    else
        total_tests=$(grep -c "√\|×" /tmp/auth-metrics.log || echo "0")
        passed_tests=$(grep -c "√" /tmp/auth-metrics.log || echo "0")
        failed_tests=$(grep -c "×" /tmp/auth-metrics.log || echo "0")
    fi
    
    local end_time=$(date +%s)
    local total_duration=$((end_time - start_time))
    
    # Calculate pass rate
    if [ $total_tests -gt 0 ]; then
        pass_rate=$((passed_tests * 100 / total_tests))
    else
        pass_rate=0
    fi
    
    # Get system metrics
    local memory_usage=$(free -h | grep "Mem:" | awk '{print $3}' || echo "N/A")
    local disk_usage=$(df -h . | tail -1 | awk '{print $5}' || echo "N/A")
    local cpu_load=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' || echo "N/A")
    
    # Generate metrics JSON
    cat > "$METRICS_FILE" << EOF
{
    "timestamp": "$TIMESTAMP",
    "date": "$(date -Iseconds)",
    "test_suite": "integration",
    "environment": "development",
    "framework": "jest + supertest",
    "node_version": "$(node --version)",
    "platform": "$(uname -s)",
    "results": {
        "total_tests": $total_tests,
        "passed_tests": $passed_tests,
        "failed_tests": $failed_tests,
        "pass_rate": $pass_rate,
        "status": "$([ $auth_status -eq 0 ] && echo "passed" || echo "failed")"
    },
    "performance": {
        "total_duration": $total_duration,
        "auth_duration": $auth_duration,
        "average_test_time": $([ $total_tests -gt 0 ] && echo "$((total_duration / total_tests))" || echo "0")",
        "fastest_test": "0",
        "slowest_test": "$auth_duration"
    },
    "system": {
        "memory_usage": "$memory_usage",
        "disk_usage": "$disk_usage",
        "cpu_load": "$cpu_load"
    },
    "details": {
        "auth_tests": {
            "duration": $auth_duration,
            "status": "$([ $auth_status -eq 0 ] && echo "passed" || echo "failed")",
            "tests": $total_tests,
            "passed": $passed_tests,
            "failed": $failed_tests
        }
    }
}
EOF
    
    echo "✅ Metrics collected: $total_tests tests, $pass_rate% pass rate"
    echo "⏱️  Total duration: ${total_duration}s"
    echo "📊 Auth duration: ${auth_duration}s"
    
    # Clean up
    rm -f /tmp/auth-metrics.log
}

# Function to update trends data
update_trends() {
    echo "📈 Updating trends data..."
    
    # Create trends file if it doesn't exist
    if [ ! -f "$TRENDS_FILE" ]; then
        echo "[]" > "$TRENDS_FILE"
    fi
    
    # Read current trends
    local temp_file=$(mktemp)
    jq '. + ["$(cat "$METRICS_FILE")"]' "$TRENDS_FILE" > "$temp_file"
    mv "$temp_file" "$TRENDS_FILE"
    
    # Keep only last 30 entries
    local temp_file=$(mktemp)
    jq '.[-30:]' "$TRENDS_FILE" > "$temp_file"
    mv "$temp_file" "$TRENDS_FILE"
    
    echo "✅ Trends updated with latest metrics"
}

# Function to generate trend analysis
generate_trend_analysis() {
    echo "📊 Generating trend analysis..."
    
    local trend_file="test-results/trends/trend-analysis-$TIMESTAMP.md"
    
    cat > "$trend_file" << EOF
# Test Performance Trends Analysis

**Generated:** $(date)  
**Period:** Last 30 test runs  
**Test Suite:** Integration Tests  

## 📈 Performance Trends

EOF
    
    # Calculate averages from trends
    if [ -f "$TRENDS_FILE" ]; then
        local avg_tests=$(jq '[.[] | length | . / (length // 1)]' "$TRENDS_FILE" 2>/dev/null || echo "N/A")
        local avg_pass_rate=$(jq '[.[] | map(.results.pass_rate) | add / length] / (length // 1)' "$TRENDS_FILE" 2>/dev/null || echo "N/A")
        local avg_duration=$(jq '[.[] | map(.performance.total_duration) | add / length] / (length // 1)' "$TRENDS_FILE" 2>/dev/null || echo "N/A")
        
        cat >> "$trend_file" << EOF
### Overall Averages
- **Average Tests per Run:** $avg_tests
- **Average Pass Rate:** ${avg_pass_rate}%
- **Average Duration:** ${avg_duration}s

### Recent Performance
EOF
        
        # Get last 5 runs
        local recent_file=$(mktemp)
        jq '.[-5:] | reverse | .[] | {
            timestamp: .timestamp,
            date: .date,
            pass_rate: .results.pass_rate,
            duration: .performance.total_duration,
            tests: .results.total_tests
        }' "$TRENDS_FILE" > "$recent_file"
        
        cat "$recent_file" >> "$trend_file"
        rm "$recent_file"
        
        cat >> "$trend_file" << EOF

## 📊 Performance Insights

### Test Stability
EOF
        
        # Calculate stability metrics
        local total_runs=$(jq '. | length' "$TRENDS_FILE" 2>/dev/null || echo "0")
        local passed_runs=$(jq '[.[] | select(.results.status == "passed")] | length' "$TRENDS_FILE" 2>/dev/null || echo "0")
        
        if [ "$total_runs" -gt 0 ]; then
            local stability=$((passed_runs * 100 / total_runs))
            cat >> "$trend_file" << EOF
- **Total Runs:** $total_runs
- **Successful Runs:** $passed_runs
- **Stability Rate:** ${stability}%
EOF
        fi
        
        cat >> "$trend_file" << EOF

### Recommendations
EOF
        
        # Generate recommendations based on trends
        if [ "${avg_pass_rate%.*}" -lt 90 ]; then
            echo "- ⚠️ **Low Pass Rate:** Consider fixing failing tests to improve reliability" >> "$trend_file"
        else
            echo "- ✅ **Good Pass Rate:** Tests are performing well" >> "$trend_file"
        fi
        
        if [ "${avg_duration%.*}" -gt 30 ]; then
            echo "- ⚠️ **Slow Execution:** Consider optimizing test performance" >> "$trend_file"
        else
            echo "- ✅ **Good Performance:** Test execution time is acceptable" >> "$trend_file"
        fi
        
        echo "- 📈 **Continue Monitoring:** Regular metrics collection helps maintain quality" >> "$trend_file"
        echo "- 🔄 **CI/CD Integration:** Consider automating tests in deployment pipeline" >> "$trend_file"
        
    else
        echo "No historical data available yet. Run more tests to see trends." >> "$trend_file"
    fi
    
    cat >> "$trend_file" << EOF

---
*Analysis generated by Test Metrics Tracker*
EOF
    
    echo "📄 Trend analysis saved: $trend_file"
}

# Function to generate HTML trends dashboard
generate_html_dashboard() {
    echo "🌐 Generating HTML trends dashboard..."
    
    local dashboard_file="test-results/metrics/dashboard-$TIMESTAMP.html"
    
    cat > "$dashboard_file" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Integration Test Metrics Dashboard</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #e0e0e0;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            color: #2c3e50;
        }
        .header p {
            margin: 10px 0 0 0;
            color: #7f8c8d;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .metric-card {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
        .metric-card.success {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }
        .metric-card.info {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        .metric-card h3 {
            margin: 0 0 10px 0;
            font-size: 2em;
        }
        .metric-card .value {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }
        .metric-card .label {
            font-size: 1em;
            opacity: 0.9;
        }
        .chart-container {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .chart-container h3 {
            margin-top: 0;
            color: #2c3e50;
        }
        .trend-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .trend-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        .trend-item.good {
            border-left-color: #28a745;
        }
        .trend-item.warning {
            border-left-color: #ffc107;
        }
        .trend-item.bad {
            border-left-color: #dc3545;
        }
        .trend-time {
            font-weight: bold;
            color: #495057;
        }
        .trend-metrics {
            display: flex;
            gap: 20px;
            align-items: center;
        }
        .trend-metric {
            text-align: center;
            padding: 5px 15px;
            background: white;
            border-radius: 6px;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Integration Test Metrics Dashboard</h1>
            <p>Real-time test performance monitoring and trend analysis</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card success">
                <h3>Current Status</h3>
                <div class="value">✅</div>
                <div class="label">All Systems Operational</div>
            </div>
            <div class="metric-card info">
                <h3>Latest Test Run</h3>
                <div class="value" id="latest-pass-rate">--</div>
                <div class="label">Pass Rate</div>
            </div>
            <div class="metric-card">
                <h3>Test Duration</h3>
                <div class="value" id="latest-duration">--</div>
                <div class="label">Last Run Time</div>
            </div>
            <div class="metric-card">
                <h3>Total Tests</h3>
                <div class="value" id="latest-tests">--</div>
                <div class="label">Test Count</div>
            </div>
        </div>

        <div class="chart-container">
            <h3>📈 Recent Test Runs</h3>
            <ul class="trend-list" id="trend-list">
                <li class="trend-item">
                    <span class="trend-time">Loading...</span>
                    <div class="trend-metrics">
                        <div class="trend-metric">--</div>
                        <div class="trend-metric">--</div>
                        <div class="trend-metric">--</div>
                    </div>
                </li>
            </ul>
        </div>
    </div>

    <script>
        // Load and display metrics
        fetch('test-results/trends/trends.json')
            .then(response => response.json())
            .then(data => {
                const trendList = document.getElementById('trend-list');
                const latestData = data[data.length - 1];
                
                if (latestData) {
                    document.getElementById('latest-pass-rate').textContent = latestData.results.pass_rate + '%';
                    document.getElementById('latest-duration').textContent = latestData.performance.total_duration + 's';
                    document.getElementById('latest-tests').textContent = latestData.results.total_tests;
                }
                
                // Display last 10 runs
                const recentRuns = data.slice(-10).reverse();
                trendList.innerHTML = '';
                
                recentRuns.forEach(run => {
                    const li = document.createElement('li');
                    li.className = 'trend-item';
                    
                    if (run.results.status === 'passed') {
                        li.classList.add('good');
                    } else if (run.results.pass_rate < 80) {
                        li.classList.add('bad');
                    } else {
                        li.classList.add('warning');
                    }
                    
                    const date = new Date(run.date);
                    li.innerHTML = `
                        <span class="trend-time">${date.toLocaleString()}</span>
                        <div class="trend-metrics">
                            <div class="trend-metric">${run.results.pass_rate}%</div>
                            <div class="trend-metric">${run.results.total_tests} tests</div>
                            <div class="trend-metric">${run.performance.total_duration}s</div>
                        </div>
                    `;
                    
                    trendList.appendChild(li);
                });
            })
            .catch(error => {
                console.error('Error loading trends:', error);
                document.getElementById('trend-list').innerHTML = '<li class="trend-item"><span class="trend-time">No data available</span></li>';
            });
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            location.reload();
        }, 30000);
    </script>
</body>
</html>
EOF
    
    echo "🌐 HTML dashboard generated: $dashboard_file"
}

# Main execution
main() {
    echo "🎯 Test Metrics Tracker"
    echo "==================="
    
    # Check if server is running
    if ! curl -s http://localhost:5000/api/health > /dev/null; then
        echo "❌ Server is not running. Please start the server first:"
        echo "   npm run dev:server"
        exit 1
    fi
    
    echo "✅ Server is running"
    
    # Collect metrics
    collect_metrics
    
    # Update trends
    update_trends
    
    # Generate analysis
    generate_trend_analysis
    
    # Generate HTML dashboard
    generate_html_dashboard
    
    echo ""
    echo "🎉 Metrics Collection Complete!"
    echo "========================="
    echo "📁 Metrics saved to: $METRICS_FILE"
    echo "📈 Trends updated: $TRENDS_FILE"
    echo "📄 Analysis: test-results/trends/trend-analysis-$TIMESTAMP.md"
    echo "🌐 Dashboard: test-results/metrics/dashboard-$TIMESTAMP.html"
    
    # Open HTML dashboard
    if command -v open > /dev/null; then
        echo "🌐 Opening metrics dashboard..."
        open "test-results/metrics/dashboard-$TIMESTAMP.html"
    elif command -v xdg-open > /dev/null; then
        echo "🌐 Opening metrics dashboard..."
        xdg-open "test-results/metrics/dashboard-$TIMESTAMP.html"
    fi
}

# Run main function
main "$@"
