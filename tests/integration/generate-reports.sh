#!/bin/bash

# Test Report Generator for Integration Tests
# This script generates comprehensive test reports with analytics

echo "📊 Generating Test Reports"
echo "========================="

# Create reports directory
mkdir -p test-results/reports
mkdir -p test-results/coverage
mkdir -p test-results/performance

# Set timestamp for reports
TIMESTAMP=$(date +"%Y-%m-%d-%H-%M-%S")
REPORT_DIR="test-results/reports/$TIMESTAMP"
mkdir -p "$REPORT_DIR"

echo "📅 Report Generation: $TIMESTAMP"
echo "📁 Reports Directory: $REPORT_DIR"

# Function to generate HTML report header
generate_html_header() {
    cat > "$1" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Integration Test Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
        }
        .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            color: #7f8c8d;
            margin: 10px 0 0 0;
            font-size: 1.1em;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .summary-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .summary-card.success {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }
        .summary-card.warning {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        .summary-card.info {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 2em;
        }
        .summary-card p {
            margin: 0;
            font-size: 1.1em;
            opacity: 0.9;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .test-suite {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .test-suite h3 {
            color: #495057;
            margin: 0 0 15px 0;
            font-size: 1.3em;
        }
        .test-results {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .test-item {
            display: flex;
            align-items: center;
            padding: 10px;
            background: white;
            border-radius: 5px;
            border-left: 4px solid #ddd;
        }
        .test-item.passed {
            border-left-color: #28a745;
        }
        .test-item.failed {
            border-left-color: #dc3545;
        }
        .test-item.skipped {
            border-left-color: #ffc107;
        }
        .test-status {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            margin-right: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 12px;
        }
        .test-status.passed {
            background: #28a745;
        }
        .test-status.failed {
            background: #dc3545;
        }
        .test-status.skipped {
            background: #ffc107;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            transition: width 0.3s ease;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .metric-card {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
        }
        .metric-card h4 {
            color: #495057;
            margin: 0 0 15px 0;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .metric-label {
            color: #6c757d;
            font-size: 0.9em;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
        }
        .chart-container {
            margin: 20px 0;
            text-align: center;
        }
        .chart {
            max-width: 100%;
            height: auto;
        }
        @media (max-width: 768px) {
            .container {
                padding: 15px;
            }
            .summary {
                grid-template-columns: 1fr;
            }
            .metrics {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Integration Test Report</h1>
            <p>Generated on $(date) | Environment: Development</p>
        </div>
EOF
}

# Function to generate HTML report footer
generate_html_footer() {
    cat >> "$1" << 'EOF'
        <div class="footer">
            <p>Report generated by Integration Testing Suite | MERN Ecommerce Platform</p>
            <p>For detailed logs and artifacts, check the test-results directory</p>
        </div>
    </div>
</body>
</html>
EOF
}

# Function to run tests and capture results
run_test_suite() {
    local test_name=$1
    local test_command=$2
    
    echo "🧪 Running $test_name tests..."
    
    # Create test results file
    local results_file="$REPORT_DIR/${test_name}-results.json"
    
    # Run tests and capture output
    if eval "$test_command" > "$REPORT_DIR/${test_name}-output.log" 2>&1; then
        echo "✅ $test_name tests passed"
        echo '{"status": "passed", "name": "'$test_name'"}' > "$results_file"
        return 0
    else
        echo "❌ $test_name tests failed"
        echo '{"status": "failed", "name": "'$test_name'"}' > "$results_file"
        return 1
    fi
}

# Function to generate test summary
generate_summary() {
    local summary_file="$REPORT_DIR/summary.json"
    
    echo "📊 Generating test summary..."
    
    # Count test results
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    
    for results_file in "$REPORT_DIR"/*-results.json; do
        if [ -f "$results_file" ]; then
            total_tests=$((total_tests + 1))
            local status=$(jq -r '.status' "$results_file" 2>/dev/null || echo "unknown")
            if [ "$status" = "passed" ]; then
                passed_tests=$((passed_tests + 1))
            else
                failed_tests=$((failed_tests + 1))
            fi
        fi
    done
    
    # Generate summary JSON
    cat > "$summary_file" << EOF
{
    "timestamp": "$TIMESTAMP",
    "total_tests": $total_tests,
    "passed_tests": $passed_tests,
    "failed_tests": $failed_tests,
    "pass_rate": $(( passed_tests * 100 / total_tests )),
    "environment": "development",
    "framework": "jest + supertest",
    "node_version": "$(node --version)",
    "platform": "$(uname -s)"
}
EOF
    
    echo "📈 Summary: $passed_tests/$total_tests tests passed ($(( passed_tests * 100 / total_tests ))%)"
}

# Function to generate HTML report
generate_html_report() {
    local html_file="$REPORT_DIR/index.html"
    
    echo "🌐 Generating HTML report..."
    
    # Generate HTML header
    generate_html_header "$html_file"
    
    # Read summary data
    local summary_file="$REPORT_DIR/summary.json"
    if [ -f "$summary_file" ]; then
        local total_tests=$(jq -r '.total_tests' "$summary_file")
        local passed_tests=$(jq -r '.passed_tests' "$summary_file")
        local failed_tests=$(jq -r '.failed_tests' "$summary_file")
        local pass_rate=$(jq -r '.pass_rate' "$summary_file")
        
        # Add summary section
        cat >> "$html_file" << EOF
        <div class="summary">
            <div class="summary-card success">
                <h3>$passed_tests</h3>
                <p>Tests Passed</p>
            </div>
            <div class="summary-card warning">
                <h3>$failed_tests</h3>
                <p>Tests Failed</p>
            </div>
            <div class="summary-card info">
                <h3>$total_tests</h3>
                <p>Total Tests</p>
            </div>
            <div class="summary-card">
                <h3>${pass_rate}%</h3>
                <p>Pass Rate</p>
            </div>
        </div>

        <div class="section">
            <h2>📊 Test Execution Summary</h2>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${pass_rate}%"></div>
            </div>
            <p><strong>Overall Success Rate:</strong> ${pass_rate}%</p>
        </div>
EOF
    fi
    
    # Add test results section
    cat >> "$html_file" << EOF
        <div class="section">
            <h2>🧪 Test Suite Results</h2>
EOF
    
    # Add individual test results
    for results_file in "$REPORT_DIR"/*-results.json; do
        if [ -f "$results_file" ]; then
            local test_name=$(jq -r '.name' "$results_file" 2>/dev/null || echo "Unknown")
            local status=$(jq -r '.status' "$results_file" 2>/dev/null || echo "unknown")
            local status_class="skipped"
            local status_symbol="⚪"
            
            if [ "$status" = "passed" ]; then
                status_class="passed"
                status_symbol="✅"
            elif [ "$status" = "failed" ]; then
                status_class="failed"
                status_symbol="❌"
            fi
            
            cat >> "$html_file" << EOF
            <div class="test-suite">
                <h3>$status_symbol $test_name</h3>
                <div class="test-item $status_class">
                    <div class="test-status $status_class">$status_symbol</div>
                    <span>Status: $status</span>
                </div>
            </div>
EOF
        fi
    done
    
    cat >> "$html_file" << EOF
        </div>

        <div class="section">
            <h2>📈 Performance Metrics</h2>
            <div class="metrics">
                <div class="metric-card">
                    <h4>Test Execution Time</h4>
                    <div class="metric-value">--</div>
                    <div class="metric-label">Total duration</div>
                </div>
                <div class="metric-card">
                    <h4>Average Test Time</h4>
                    <div class="metric-value">--</div>
                    <div class="metric-label">Per test suite</div>
                </div>
                <div class="metric-card">
                    <h4>Coverage</h4>
                    <div class="metric-value">--</div>
                    <div class="metric-label">Code coverage</div>
                </div>
                <div class="metric-card">
                    <h4>Environment</h4>
                    <div class="metric-value">Dev</div>
                    <div class="metric-label">Test environment</div>
                </div>
            </div>
        </div>
EOF
    
    # Generate HTML footer
    generate_html_footer "$html_file"
    
    echo "📄 HTML report generated: $html_file"
}

# Function to generate coverage report
generate_coverage_report() {
    echo "📊 Generating coverage report..."
    
    # Run tests with coverage
    if npm run test:integration:coverage > "$REPORT_DIR/coverage-output.log" 2>&1; then
        echo "✅ Coverage report generated successfully"
        
        # Copy coverage files if they exist
        if [ -d "coverage" ]; then
            cp -r coverage "$REPORT_DIR/"
            echo "📁 Coverage files copied to $REPORT_DIR/coverage"
        fi
    else
        echo "❌ Coverage report generation failed"
    fi
}

# Function to generate performance report
generate_performance_report() {
    echo "⚡ Generating performance report..."
    
    local perf_file="$REPORT_DIR/performance.json"
    
    # Get system information
    cat > "$perf_file" << EOF
{
    "timestamp": "$TIMESTAMP",
    "system": {
        "platform": "$(uname -s)",
        "node_version": "$(node --version)",
        "npm_version": "$(npm --version)",
        "memory": "$(free -h 2>/dev/null || echo 'N/A')",
        "disk": "$(df -h . 2>/dev/null || echo 'N/A')"
    },
    "test_performance": {
        "start_time": "$(date -Iseconds)",
        "end_time": "$(date -Iseconds)",
        "duration": "0s"
    }
}
EOF
    
    echo "📊 Performance report generated: $perf_file"
}

# Function to generate markdown report
generate_markdown_report() {
    local md_file="$REPORT_DIR/README.md"
    
    echo "📝 Generating markdown report..."
    
    cat > "$md_file" << EOF
# Integration Test Report

**Generated:** $(date)  
**Environment:** Development  
**Framework:** Jest + Supertest  

## 📊 Test Summary

EOF
    
    # Read summary data
    local summary_file="$REPORT_DIR/summary.json"
    if [ -f "$summary_file" ]; then
        local total_tests=$(jq -r '.total_tests' "$summary_file")
        local passed_tests=$(jq -r '.passed_tests' "$summary_file")
        local failed_tests=$(jq -r '.failed_tests' "$summary_file")
        local pass_rate=$(jq -r '.pass_rate' "$summary_file")
        
        cat >> "$md_file" << EOF
- **Total Tests:** $total_tests
- **Passed:** $passed_tests
- **Failed:** $failed_tests
- **Pass Rate:** ${pass_rate}%

## 🧪 Test Results

EOF
        
        # Add individual test results
        for results_file in "$REPORT_DIR"/*-results.json; do
            if [ -f "$results_file" ]; then
                local test_name=$(jq -r '.name' "$results_file" 2>/dev/null || echo "Unknown")
                local status=$(jq -r '.status' "$results_file' 2>/dev/null || echo "unknown")
                local status_emoji="⚪"
                
                if [ "$status" = "passed" ]; then
                    status_emoji="✅"
                elif [ "$status" = "failed" ]; then
                    status_emoji="❌"
                fi
                
                echo "- $status_emoji **$test_name**: $status" >> "$md_file"
            fi
        done
    fi
    
    cat >> "$md_file" << EOF

## 📊 Coverage Report

Coverage reports are available in the \`coverage/\` directory.

## 📋 Artifacts

- **HTML Report:** \`index.html\`
- **Test Logs:** \`*-output.log\`
- **Coverage Reports:** \`coverage/\`
- **Performance Data:** \`performance.json\`

## 🔍 Detailed Analysis

### Test Environment
- **Node.js:** $(node --version)
- **Platform:** $(uname -s)
- **Test Framework:** Jest + Supertest

### Recommendations

1. **Fix Failed Tests:** Review failed test logs and fix issues
2. **Improve Coverage:** Add more test cases to increase coverage
3. **Performance:** Monitor test execution times
4. **CI/CD:** Integrate with continuous integration pipeline

---
*Report generated by Integration Testing Suite*
EOF
    
    echo "📄 Markdown report generated: $md_file"
}

# Main execution
main() {
    echo "🎯 Integration Test Report Generator"
    echo "=================================="
    
    # Check if server is running
    if ! curl -s http://localhost:5000/api/health > /dev/null; then
        echo "❌ Server is not running. Please start the server first:"
        echo "   npm run dev:server"
        exit 1
    fi
    
    echo "✅ Server is running"
    
    # Run test suites
    run_test_suite "Authentication" "npm run test:integration:auth"
    
    # Generate reports
    generate_summary
    generate_html_report
    generate_coverage_report
    generate_performance_report
    generate_markdown_report
    
    echo ""
    echo "🎉 Report Generation Complete!"
    echo "============================="
    echo "📁 Reports saved to: $REPORT_DIR"
    echo "🌐 Open HTML report: $REPORT_DIR/index.html"
    echo "📄 View summary: $REPORT_DIR/README.md"
    
    # Open HTML report if possible
    if command -v open > /dev/null; then
        echo "🌐 Opening HTML report..."
        open "$REPORT_DIR/index.html"
    elif command -v xdg-open > /dev/null; then
        echo "🌐 Opening HTML report..."
        xdg-open "$REPORT_DIR/index.html"
    fi
}

# Run main function
main "$@"
