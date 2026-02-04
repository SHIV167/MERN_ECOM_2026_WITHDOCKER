@echo off
REM Test Report Generator for Integration Tests - Windows
REM This script generates comprehensive test reports with analytics

echo 📊 Generating Test Reports
echo =========================

REM Create reports directory
if not exist "test-results\reports" mkdir test-results\reports
if not exist "test-results\coverage" mkdir test-results\coverage
if not exist "test-results\performance" mkdir test-results\performance

REM Set timestamp for reports
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "TIMESTAMP=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%-%dt:~8,2%-%dt:~10,2%-%dt:~12,2%"
set "REPORT_DIR=test-results\reports\%TIMESTAMP%"
mkdir "%REPORT_DIR%"

echo 📅 Report Generation: %TIMESTAMP%
echo 📁 Reports Directory: %REPORT_DIR%

REM Check if server is running
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Server is not running. Please start the server first:
    echo    npm run dev:server
    exit /b 1
)

echo ✅ Server is running

REM Run test suites
echo.
echo 🧪 Running Test Suites
echo =====================

REM Authentication tests
echo 🔐 Running Authentication tests...
npm run test:integration:auth > "%REPORT_DIR%\auth-output.log" 2>&1
if %errorlevel% equ 0 (
    echo ✅ Authentication tests passed
    echo {"status": "passed", "name": "Authentication"} > "%REPORT_DIR%\auth-results.json"
) else (
    echo ❌ Authentication tests failed
    echo {"status": "failed", "name": "Authentication"} > "%REPORT_DIR%\auth-results.json"
)

REM Generate summary
echo.
echo 📊 Generating Test Summary...

REM Count test results
set total_tests=0
set passed_tests=0
set failed_tests=0

REM Count JSON result files
for %%f in ("%REPORT_DIR%\*-results.json") do (
    set /a total_tests+=1
    REM Simple check for passed status
    findstr "passed" "%%f" >nul 2>&1
    if !errorlevel! equ 0 (
        set /a passed_tests+=1
    ) else (
        set /a failed_tests+=1
    )
)

REM Calculate pass rate
if %total_tests% gtr 0 (
    set /a pass_rate=passed_tests*100/total_tests
) else (
    set pass_rate=0
)

REM Generate summary JSON
echo { > "%REPORT_DIR%\summary.json"
echo   "timestamp": "%TIMESTAMP%", >> "%REPORT_DIR%\summary.json"
echo   "total_tests": %total_tests%, >> "%REPORT_DIR%\summary.json"
echo   "passed_tests": %passed_tests%, >> "%REPORT_DIR%\summary.json"
echo   "failed_tests": %failed_tests%, >> "%REPORT_DIR%\summary.json"
echo   "pass_rate": %pass_rate%, >> "%REPORT_DIR%\summary.json"
echo   "environment": "development", >> "%REPORT_DIR%\summary.json"
echo   "framework": "jest + supertest", >> "%REPORT_DIR%\summary.json"
echo   "node_version": ">> "%REPORT_DIR%\summary.json"
node --version >> "%REPORT_DIR%\summary.json"
echo   "platform": "windows" >> "%REPORT_DIR%\summary.json"
echo } >> "%REPORT_DIR%\summary.json"

echo 📈 Summary: %passed_tests%/%total_tests% tests passed (%pass_rate%%%)

REM Generate HTML report
echo.
echo 🌐 Generating HTML Report...

set "html_file=%REPORT_DIR%\index.html"

REM Generate HTML header
echo ^<!DOCTYPE html^> > "%html_file%"
echo ^<html lang="en"^> >> "%html_file%"
echo ^<head^> >> "%html_file%"
echo     ^<meta charset="UTF-8"^> >> "%html_file%"
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> "%html_file%"
echo     ^<title^>Integration Test Report^</title^> >> "%html_file%"
echo     ^<style^> >> "%html_file%"
echo         body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; color: #333; } >> "%html_file%"
echo         .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); } >> "%html_file%"
echo         .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e0e0e0; } >> "%html_file%"
echo         .header h1 { color: #2c3e50; margin: 0; font-size: 2.5em; } >> "%html_file%"
echo         .header p { color: #7f8c8d; margin: 10px 0 0 0; font-size: 1.1em; } >> "%html_file%"
echo         .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; } >> "%html_file%"
echo         .summary-card { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2); } >> "%html_file%"
echo         .summary-card.success { background: linear-gradient(135deg, #11998e 0%%, #38ef7d 100%%); } >> "%html_file%"
echo         .summary-card.warning { background: linear-gradient(135deg, #f093fb 0%%, #f5576c 100%%); } >> "%html_file%"
echo         .summary-card.info { background: linear-gradient(135deg, #4facfe 0%%, #00f2fe 100%%); } >> "%html_file%"
echo         .summary-card h3 { margin: 0 0 10px 0; font-size: 2em; } >> "%html_file%"
echo         .summary-card p { margin: 0; font-size: 1.1em; opacity: 0.9; } >> "%html_file%"
echo         .section { margin-bottom: 40px; } >> "%html_file%"
echo         .section h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 20px; } >> "%html_file%"
echo         .test-suite { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; } >> "%html_file%"
echo         .test-suite h3 { color: #495057; margin: 0 0 15px 0; font-size: 1.3em; } >> "%html_file%"
echo         .test-item { display: flex; align-items: center; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #ddd; } >> "%html_file%"
echo         .test-item.passed { border-left-color: #28a745; } >> "%html_file%"
echo         .test-item.failed { border-left-color: #dc3545; } >> "%html_file%"
echo         .test-item.skipped { border-left-color: #ffc107; } >> "%html_file%"
echo         .test-status { width: 20px; height: 20px; border-radius: 50%%; margin-right: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 12px; } >> "%html_file%"
echo         .test-status.passed { background: #28a745; } >> "%html_file%"
echo         .test-status.failed { background: #dc3545; } >> "%html_file%"
echo         .test-status.skipped { background: #ffc107; } >> "%html_file%"
echo         .progress-bar { width: 100%%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 10px 0; } >> "%html_file%"
echo         .progress-fill { height: 100%%; background: linear-gradient(90deg, #28a745, #20c997); transition: width 0.3s ease; } >> "%html_file%"
echo         .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; } >> "%html_file%"
echo     ^</style^> >> "%html_file%"
echo ^</head^> >> "%html_file%"
echo ^<body^> >> "%html_file%"
echo     ^<div class="container"^> >> "%html_file%"
echo         ^<div class="header"^> >> "%html_file%"
echo             ^<h1^>🧪 Integration Test Report^</h1^> >> "%html_file%"
echo             ^<p^>Generated on %date% ^| Environment: Development^</p^> >> "%html_file%"
echo         ^</div^> >> "%html_file%"

REM Add summary section
echo         ^<div class="summary"^> >> "%html_file%"
echo             ^<div class="summary-card success"^> >> "%html_file%"
echo                 ^<h3^>%passed_tests%^</h3^> >> "%html_file%"
echo                 ^<p^>Tests Passed^</p^> >> "%html_file%"
echo             ^</div^> >> "%html_file%"
echo             ^<div class="summary-card warning"^> >> "%html_file%"
echo                 ^<h3^>%failed_tests%^</h3^> >> "%html_file%"
echo                 ^<p^>Tests Failed^</p^> >> "%html_file%"
echo             ^</div^> >> "%html_file%"
echo             ^<div class="summary-card info"^> >> "%html_file%"
echo                 ^<h3^>%total_tests%^</h3^> >> "%html_file%"
echo                 ^<p^>Total Tests^</p^> >> "%html_file%"
echo             ^</div^> >> "%html_file%"
echo             ^<div class="summary-card"^> >> "%html_file%"
echo                 ^<h3^>%pass_rate%%%^</h3^> >> "%html_file%"
echo                 ^<p^>Pass Rate^</p^> >> "%html_file%"
echo             ^</div^> >> "%html_file%"
echo         ^</div^> >> "%html_file%"

REM Add progress bar
echo         ^<div class="section"^> >> "%html_file%"
echo             ^<h2^>📊 Test Execution Summary^</h2^> >> "%html_file%"
echo             ^<div class="progress-bar"^> >> "%html_file%"
echo                 ^<div class="progress-fill" style="width: %pass_rate%%%"^>^</div^> >> "%html_file%"
echo             ^</div^> >> "%html_file%"
echo             ^<p^>^<strong^>Overall Success Rate:^</strong^> %pass_rate%%%^</p^> >> "%html_file%"
echo         ^</div^> >> "%html_file%"

REM Add test results
echo         ^<div class="section"^> >> "%html_file%"
echo             ^<h2^>🧪 Test Suite Results^</h2^> >> "%html_file%"

REM Add individual test results
for %%f in ("%REPORT_DIR%\*-results.json") do (
    echo             ^<div class="test-suite"^> >> "%html_file%"
    
    REM Extract test name and status
    for /f "tokens=2 delims=:" %%a in ('findstr "name" "%%f"') do (
        set test_name=%%a
    )
    for /f "tokens=2 delims=:" %%a in ('findstr "status" "%%f"') do (
        set test_status=%%a
    )
    
    REM Clean up the values (remove quotes and spaces)
    set test_name=!test_name:"=!
    set test_name=!test_name: =!
    set test_status=!test_status:"=!
    set test_status=!test_status: =!
    
    REM Set status class and symbol
    set status_class=skipped
    set status_symbol=⚪
    
    if "!test_status!"=="passed" (
        set status_class=passed
        set status_symbol=✅
    ) else if "!test_status!"=="failed" (
        set status_class=failed
        set status_symbol=❌
    )
    
    echo                 ^<h3^>!status_symbol! !test_name!^</h3^> >> "%html_file%"
    echo                 ^<div class="test-item !status_class!"^> >> "%html_file%"
    echo                     ^<div class="test-status !status_class!"^>!status_symbol!^</div^> >> "%html_file%"
    echo                     ^<span^>Status: !test_status!^</span^> >> "%html_file%"
    echo                 ^</div^> >> "%html_file%"
    echo             ^</div^> >> "%html_file%"
)

echo         ^</div^> >> "%html_file%"

REM Add metrics section
echo         ^<div class="section"^> >> "%html_file%"
echo             ^<h2^>📈 Performance Metrics^</h2^> >> "%html_file%"
echo             ^<div class="metrics"^> >> "%html_file%"
echo                 ^<div class="metric-card"^> >> "%html_file%"
echo                     ^<h4^>Test Execution Time^</h4^> >> "%html_file%"
echo                     ^<div class="metric-value"^>--^</div^> >> "%html_file%"
echo                     ^<div class="metric-label"^>Total duration^</div^> >> "%html_file%"
echo                 ^</div^> >> "%html_file%"
echo                 ^<div class="metric-card"^> >> "%html_file%"
echo                     ^<h4^>Average Test Time^</h4^> >> "%html_file%"
echo                     ^<div class="metric-value"^>--^</div^> >> "%html_file%"
echo                     ^<div class="metric-label"^>Per test suite^</div^> >> "%html_file%"
echo                 ^</div^> >> "%html_file%"
echo                 ^<div class="metric-card"^> >> "%html_file%"
echo                     ^<h4^>Coverage^</h4^> >> "%html_file%"
echo                     ^<div class="metric-value"^>--^</div^> >> "%html_file%"
echo                     ^<div class="metric-label"^>Code coverage^</div^> >> "%html_file%"
echo                 ^</div^> >> "%html_file%"
echo                 ^<div class="metric-card"^> >> "%html_file%"
echo                     ^<h4^>Environment^</h4^> >> "%html_file%"
echo                     ^<div class="metric-value"^>Dev^</div^> >> "%html_file%"
echo                     ^<div class="metric-label"^>Test environment^</div^> >> "%html_file%"
echo                 ^</div^> >> "%html_file%"
echo             ^</div^> >> "%html_file%"
echo         ^</div^> >> "%html_file%"

REM Add footer
echo         ^<div class="footer"^> >> "%html_file%"
echo             ^<p^>Report generated by Integration Testing Suite ^| MERN Ecommerce Platform^</p^> >> "%html_file%"
echo             ^<p^>For detailed logs and artifacts, check the test-results directory^</p^> >> "%html_file%"
echo         ^</div^> >> "%html_file%"
echo     ^</div^> >> "%html_file%"
echo ^</body^> >> "%html_file%"
echo ^</html^> >> "%html_file%"

echo 📄 HTML report generated: %html_file%

REM Generate coverage report
echo.
echo 📊 Generating Coverage Report...

if exist "coverage" (
    xcopy /E /I coverage "%REPORT_DIR%\coverage" >nul 2>&1
    echo 📁 Coverage files copied to %REPORT_DIR%\coverage
) else (
    echo ⚠️ Coverage directory not found
)

REM Generate performance report
echo ⚡ Generating Performance Report...

set "perf_file=%REPORT_DIR%\performance.json"
echo { > "%perf_file%"
echo   "timestamp": "%TIMESTAMP%", >> "%perf_file%"
echo   "system": { >> "%perf_file%"
echo     "platform": "windows", >> "%perf_file%"
echo     "node_version": ">> "%perf_file%"
node --version >> "%perf_file%"
echo     "npm_version": ">> "%perf_file%"
npm --version >> "%perf_file%"
echo     "memory": "Available", >> "%perf_file%"
echo     "disk": "Available" >> "%perf_file%"
echo   }, >> "%perf_file%"
echo   "test_performance": { >> "%perf_file%"
echo     "start_time": "%date% %time%", >> "%perf_file%"
echo     "end_time": "%date% %time%", >> "%perf_file%"
echo     "duration": "0s" >> "%perf_file%"
echo   } >> "%perf_file%"
echo } >> "%perf_file%"

echo 📊 Performance report generated: %perf_file%

REM Generate markdown report
echo.
echo 📝 Generating Markdown Report...

set "md_file=%REPORT_DIR%\README.md"
echo # Integration Test Report > "%md_file%"
echo. >> "%md_file%"
echo **Generated:** %date% >> "%md_file%"
echo **Environment:** Development >> "%md_file%"
echo **Framework:** Jest + Supertest >> "%md_file%"
echo. >> "%md_file%"
echo ## 📊 Test Summary >> "%md_file%"
echo. >> "%md_file%"
echo - **Total Tests:** %total_tests% >> "%md_file%"
echo - **Passed:** %passed_tests% >> "%md_file%"
echo - **Failed:** %failed_tests% >> "%md_file%"
echo - **Pass Rate:** %pass_rate%%% >> "%md_file%"
echo. >> "%md_file%"
echo ## 🧪 Test Results >> "%md_file%"
echo. >> "%md_file%"

REM Add individual test results to markdown
for %%f in ("%REPORT_DIR%\*-results.json") do (
    for /f "tokens=2 delims=:" %%a in ('findstr "name" "%%f"') do (
        set test_name=%%a
    )
    for /f "tokens=2 delims=:" %%a in ('findstr "status" "%%f"') do (
        set test_status=%%a
    )
    
    set test_name=!test_name:"=!
    set test_name=!test_name: =!
    set test_status=!test_status:"=!
    set test_status=!test_status: =!
    
    set status_emoji=⚪
    if "!test_status!"=="passed" (
        set status_emoji=✅
    ) else if "!test_status!"=="failed" (
        set status_emoji=❌
    )
    
    echo - !status_emoji! **!test_name!**: !test_status! >> "%md_file%"
)

echo. >> "%md_file%"
echo ## 📊 Coverage Report >> "%md_file%"
echo. >> "%md_file%"
echo Coverage reports are available in the \`coverage/\` directory. >> "%md_file%"
echo. >> "%md_file%"
echo ## 📋 Artifacts >> "%md_file%"
echo. >> "%md_file%"
echo - **HTML Report:** \`index.html\` >> "%md_file%"
echo - **Test Logs:** \`*-output.log\` >> "%md_file%"
echo - **Coverage Reports:** \`coverage/\` >> "%md_file%"
echo - **Performance Data:** \`performance.json\` >> "%md_file%"
echo. >> "%md_file%"
echo ## 🔍 Detailed Analysis >> "%md_file%"
echo. >> "%md_file%"
echo ### Test Environment >> "%md_file%"
echo - **Node.js:** >> "%md_file%"
node --version >> "%md_file%"
echo - **Platform:** Windows >> "%md_file%"
echo - **Test Framework:** Jest + Supertest >> "%md_file%"
echo. >> "%md_file%"
echo ### Recommendations >> "%md_file%"
echo. >> "%md_file%"
echo 1. **Fix Failed Tests:** Review failed test logs and fix issues >> "%md_file%"
echo 2. **Improve Coverage:** Add more test cases to increase coverage >> "%md_file%"
echo 3. **Performance:** Monitor test execution times >> "%md_file%"
echo 4. **CI/CD:** Integrate with continuous integration pipeline >> "%md_file%"
echo. >> "%md_file%"
echo --- >> "%md_file%"
echo *Report generated by Integration Testing Suite* >> "%md_file%"

echo 📄 Markdown report generated: %md_file%

echo.
echo 🎉 Report Generation Complete!
echo =============================
echo 📁 Reports saved to: %REPORT_DIR%
echo 🌐 Open HTML report: %REPORT_DIR%\index.html
echo 📄 View summary: %REPORT_DIR%\README.md

REM Open HTML report
start "" "%REPORT_DIR%\index.html"

echo ✅ Script completed successfully
pause
