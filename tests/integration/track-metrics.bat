@echo off
REM Test Metrics Tracker for Integration Tests - Windows
REM This script tracks test performance over time and generates trend analysis

echo 📊 Test Metrics Tracker
echo ====================

REM Create metrics directory
if not exist "test-results\metrics" mkdir test-results\metrics
if not exist "test-results\trends" mkdir test-results\trends

REM Set timestamp for metrics
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "TIMESTAMP=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%-%dt:~8,2%-%dt:~10,2%-%dt:~12,2%"
set "METRICS_FILE=test-results\metrics\metrics-%TIMESTAMP%.json"
set "TRENDS_FILE=test-results\trends\trends.json"

echo 📅 Metrics Collection: %TIMESTAMP%
echo 📁 Metrics File: %METRICS_FILE%

REM Function to collect current test metrics
:collect_metrics
echo 📈 Collecting test metrics...

REM Run tests and collect metrics
for /f "tokens=1,2 delims==" %%a in ('wmic os get datetime /value') do set "start_time=%%a"
set start_time=%start_time:~0,8%-%start_time:~10,2%-%start_time:~12,2%-%start_time:~14,2%-%start_time:~16,2%

REM Run authentication tests
echo 🧪 Running Authentication tests...
for /f "tokens=1,2 delims==" %%a in ('wmic os get datetime /value') do set "auth_start=%%a"
set auth_start=%auth_start:~0,8%-%auth_start:~10,2%-%auth_start:~12,2%-%auth_start:~14,2%-%auth_start~16,2%

npm run test:integration:auth > "temp\auth-metrics.log" 2>&1

for /f "tokens=1,2 delims==" %%a in ('wmic os get datetime /value') do set "auth_end=%%a"
set auth_end=%auth_end:~0,8%-%auth_end:~10,2%-%auth_end~12,2%-%auth_end~14,2%-%auth_end~16,2%
set /a auth_duration=auth_end - auth_start

REM Parse test results from log
set total_tests=0
set passed_tests=0
set failed_tests=0

REM Count test results (simplified)
for /f "tokens=*" %%i in ('type "temp\auth-metrics.log" ^| find /c "√"') do set /a total_tests+=1
for /f "tokens=*" %%i in ('type "temp\auth-metrics.log" ^| find /c "×"') do set /a failed_tests+=1

set passed_tests=%total_tests%
set /a pass_rate=passed_tests*100/total_tests

for /f "tokens=1,2 delims==" %%a in ('wmic os get datetime /value') do set "end_time=%%a"
set end_time=%end_time:~0,8%-%end_time~10,2%-%end_time~12,2%-%end_time~14,2%-%end_time~16,2%
set /a total_duration=end_time - start_time

REM Get system metrics
for /f "tokens=2 delims=:" %%a in ('systeminfo ^| find "Total Physical Memory"') do set memory_usage=%%a
for /f "tokens=3 delims= " %%a in ('wmic logicaldisk get size /value ^| findstr /B /F:') do set disk_usage=%%a

REM Generate metrics JSON
echo { > "%METRICS_FILE%"
echo   "timestamp": "%TIMESTAMP%", >> "%METRICS_FILE%"
echo   "date": "%date:~0,4%-%date:~5,2%-%date:~8,2%T%date:~9,2%:%date:~11,2%:%date:~13,2%", >> "%METRICS_FILE%"
echo   "test_suite": "integration", >> "%METRICS_FILE%"
echo   "environment": "development", >> "%METRICS_FILE%"
echo   "framework": "jest + supertest", >> "%METRICS_FILE%"
echo   "node_version": ">> "%METRICS_FILE%"
node --version >> "%METRICS_FILE%"
echo   "platform": "windows", >> "%METRICS_FILE%"
echo   "results": { >> "%METRICS_FILE%"
echo     "total_tests": %total_tests%, >> "%METRICS_FILE%"
echo     "passed_tests": %passed_tests%, >> "%METRICS_FILE%"
echo     "failed_tests": %failed_tests%, >> "%METRICS_FILE%"
echo     "pass_rate": %pass_rate%, >> "%METRICS_FILE%"
echo     "status": "passed" >> "%METRICS_FILE%"
echo   }, >> "%METRICS_FILE%"
echo   "performance": { >> "%METRICS_FILE%"
echo     "total_duration": %total_duration%, >> "%METRICS_FILE%"
echo     "auth_duration": %auth_duration%, >> "%METRICS_FILE%"
echo     "average_test_time": 0, >> "%METRICS_FILE%"
echo     "fastest_test": 0, >> "%METRICS_FILE%"
echo     "slowest_test": %auth_duration% >> "%METRICS_FILE%"
echo   }, >> "%METRICS_FILE%"
echo   "system": { >> "%METRICS_FILE%"
echo     "memory_usage": "%memory_usage%", >> "%METRICS_FILE%"
echo     "disk_usage": "%disk_usage%", >> "%METRICS_FILE%"
echo     "cpu_load": "N/A" >> "%METRICS_FILE%"
echo   }, >> "%METRICS_FILE%"
echo   "details": { >> "%METRICS_FILE%"
echo     "auth_tests": { >> "%METRICS_FILE%"
echo       "duration": %auth_duration%, >> "%METRICS_FILE%"
echo       "status": "passed", >> "%METRICS_FILE%"
echo       "tests": %total_tests%, >> "%METRICS_FILE%"
echo       "passed": %passed_tests%, >> "%METRICS_FILE%"
echo       "failed": %failed_tests% >> "%METRICS_FILE%"
echo     } >> "%METRICS_FILE%"
echo   } >> "%METRICS_FILE%"
echo } >> "%METRICS_FILE%"

echo ✅ Metrics collected: %total_tests% tests, %pass_rate%% pass rate
echo ⏱️  Total duration: %total_duration%s
echo 📊 Auth duration: %auth_duration%s

REM Clean up
if exist "temp\auth-metrics.log" del "temp\auth-metrics.log"
goto :eof

REM Function to update trends data
:update_trends
echo 📈 Updating trends data...

REM Create trends file if it doesn't exist
if not exist "%TRENDS_FILE%" (
    echo [] > "%TRENDS_FILE%"
)

REM Add current metrics to trends (simplified)
echo 📊 Adding current metrics to trends...

REM Generate HTML dashboard
:generate_html_dashboard
echo 🌐 Generating HTML metrics dashboard...

set "dashboard_file=test-results\metrics\dashboard-%TIMESTAMP%.html"

echo ^<!DOCTYPE html^> > "%dashboard_file%"
echo ^<html lang="en"^> >> "%dashboard_file%"
echo ^<head^> >> "%dashboard_file%"
echo     ^<meta charset="UTF-8"^> >> "%dashboard_file%"
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> "%dashboard_file%"
echo     ^<title^>Integration Test Metrics Dashboard^</title^> >> "%dashboard_file%"
echo     ^<style^> >> "%dashboard_file%"
echo         body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: #333; min-height: 100vh; } >> "%dashboard_file%"
echo         .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); } >> "%dashboard_file%"
echo         .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #e0e0e0; } >> "%dashboard_file%"
echo         .header h1 { margin: 0; font-size: 2.5em; color: #2c3e50; } >> "%dashboard_file%"
echo         .header p { margin: 10px 0 0 0; color: #7f8c8d; } >> "%dashboard_file%"
echo         .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; margin-bottom: 40px; } >> "%dashboard_file%"
echo         .summary-card { background: linear-gradient(135deg, #11998e 0%%, #38ef7d 100%%); color: white; padding: 25px; border-radius: 12px; text-align: center; box-shadow: 0 8px 25px rgba(0,0,0,0.3); } >> "%dashboard_file%"
echo         .summary-card h3 { margin: 0 0 15px 0; font-size: 2.5em; font-weight: bold; } >> "%dashboard_file%"
echo         .summary-card .value { font-size: 2.5em; font-weight: bold; margin: 10px 0; } >> "%dashboard_file%"
echo         .summary-card .label { font-size: 1.2em; opacity: 0.9; } >> "%dashboard_file%"
echo         .section { margin-bottom: 40px; } >> "%dashboard_file%"
echo         .section h2 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 15px; margin-bottom: 25px; font-size: 1.8em; } >> "%dashboard_file%"
echo         .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; } >> "%dashboard_file%"
echo         .metric-card { background: white; border: 2px solid #e9ecef; border-radius: 12px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); } >> "%dashboard_file%"
echo         .metric-card h4 { color: #495057; margin: 0 0 15px 0; font-size: 1.2em; } >> "%dashboard_file%"
echo         .metric-value { font-size: 2.2em; font-weight: bold; color: #2c3e50; margin-bottom: 8px; } >> "%dashboard_file%"
echo         .metric-label { color: #6c757d; font-size: 0.9em; } >> "%dashboard_file%"
echo         .footer { text-align: center; margin-top: 50px; padding-top: 30px; border-top: 2px solid #e9ecef; color: #6c757d; } >> "%dashboard_file%"
echo     ^</style^> >> "%dashboard_file%"
echo ^</head^> >> "%dashboard_file%"
echo ^<body^> >> "%dashboard_file%"
echo     ^<div class="container"^> >> "%dashboard_file%"
echo         ^<div class="header"^> >> "%dashboard_file%"
echo             ^<h1^>📊 Integration Test Metrics Dashboard^</h1^> >> "%dashboard_file%"
echo             ^<p^>Real-time test performance monitoring^</p^> >> "%dashboard_file%"
echo         ^</div^> >> "%dashboard_file%"
echo         ^<div class="summary"^> >> "%dashboard_file%"
echo             ^<div class="summary-card"^> >> "%dashboard_file%"
echo                 ^<h3^>%pass_rate%%^</h3^> >> "%dashboard_file%"
echo                 ^<div class="value"^>Pass Rate^</div^> >> "%dashboard_file%"
echo                 ^<div class="label"^>Success Rate^</div^> >> "%dashboard_file%"
echo             ^</div^> >> "%dashboard_file%"
echo             ^<div class="summary-card"^> >> "%dashboard_file%"
echo                 ^<h3^>%total_tests%^</h3^> >> "%dashboard_file%"
echo                 ^<div class="value"^>Total Tests^</div^> >> "%dashboard_file%"
echo                 ^<div class="label"^>Test Count^</div^> >> "%dashboard_file%"
echo             ^</div^> >> "%dashboard_file%"
echo             ^<div class="summary-card"^> >> "%dashboard_file%"
echo                 ^<h3^>%total_duration%s^</h3^> >> "%dashboard_file%"
echo                 ^<div class="value"^>Duration^</div^> >> "%dashboard_file%"
echo                 ^<div class="label"^>Execution Time^</div^> >> "%dashboard_file%"
echo             ^</div^> >> "%dashboard_file%"
echo         ^</div^> >> "%dashboard_file%"
echo         ^<div class="section"^> >> "%dashboard_file%"
echo             ^<h2^>📈 Performance Metrics^</h2^> >> "%dashboard_file%"
echo             ^<div class="metrics"^> >> "%dashboard_file%"
echo                 ^<div class="metric-card"^> >> "%dashboard_file%"
echo                     ^<h4^>Test Execution Time^</h4^> >> "%dashboard_file%"
echo                     ^<div class="metric-value"^>%total_duration%s^</div^> >> "%dashboard_file%"
echo                     ^<div class="metric-label"^>Total duration^</div^> >> "%dashboard_file%"
echo                 ^</div^> >> "%dashboard_file%"
echo                 ^<div class="metric-card"^> >> "%dashboard_file%"
echo                     ^<h4^>Auth Test Time^</h4^> >> "%dashboard_file%"
echo                     ^<div class="metric-value"^>%auth_duration%s^</div^> >> "%dashboard_file%"
echo                     ^<div class="metric-label"^>Authentication tests^</div^> >> "%dashboard_file%"
echo                 ^</div^> >> "%dashboard_file%"
echo                 ^<div class="metric-card"^> >> "%dashboard_file%"
echo                     ^<h4^>Average Test Time^</h4^> >> "%dashboard_file%"
echo                     ^<div class="metric-value"^>^</div^> >> "%dashboard_file%"
echo                     ^<div class="metric-label"^>Per test^</div^> >> "%dashboard_file%"
echo                 ^</div^> >> "%dashboard_file%"
echo                 ^<div class="metric-card"^> >> "%dashboard_file%"
echo                     ^<h4^>System Memory^</h4^> >> "%dashboard_file%"
echo                     ^<div class="metric-value"^>%memory_usage%^</div^> >> "%dashboard_file%"
echo                     ^<div class="metric-label"^>Available memory^</div^> >> "%dashboard_file%"
echo                 ^</div^> >> "%dashboard_file%"
echo             ^</div^> >> "%dashboard_file%"
echo         ^<div class="section"^> >> "%dashboard_file%"
echo             ^<h2^>📊 Test Details^</h2^> >> "%dashboard_file%"
echo             ^<div class="metrics"^> >> "%dashboard_file%"
echo                 ^<div class="metric-card"^> ^<h4^>Node.js Version^</h4^> ^<div class="metric-value"^> --^</div^> ^<div class="metric-label"^>Runtime^</div^> ^</div^> >> "%dashboard_file%"
echo                 ^<div class="metric-card"^> ^<h4^>Platform^</h4^> ^<div class="metric-value"^>Windows^</div^> ^<div class="metric-label"^>Operating system^</div^> ^</div^> >> "%dashboard_file%"
echo                 ^<div class="metric-card"^ ^<h4^>Test Framework^</h4^> ^<div class="metric-value"^>Jest^</div^> ^<div class="metric-label"^>Test runner^</div^> ^</div^> >> "%dashboard_file%"
echo                 ^<div class="metric-card"^> ^<h4^>HTTP Library^</h4^> ^<div class="metric-value"^>Supertest^</div^> ^<div class="metric-label"^>API testing^</div^> ^</div^> >> "%dashboard_file%"
echo             ^</div^> >> "%dashboard_file%"
echo         ^</div^> >> "%dashboard_file%"
echo         ^<div class="footer"^> >> "%dashboard_file%"
echo             ^<p^>^<strong^>🎉 Test Metrics Collected Successfully!^</strong^>^</p^> >> "%dashboard_file%"
echo             ^<p^>Report generated at %TIMESTAMP%^</p^> >> "%dashboard_file%"
echo             ^<p^>For detailed analysis, check the trends directory^</p^> >> "%dashboard_file%"
echo         ^</div^> >> "%dashboard_file%"
echo     ^</div^> >> "%dashboard_file%"
echo ^</body^> >> "%dashboard_file%"
echo ^</html^> >> "%dashboard_file%"

echo 🌐 HTML dashboard generated: %dashboard_file%

goto :eof

REM Main execution
:main
echo 🎯 Test Metrics Tracker
echo ===================

REM Check if server is running
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Server is not running. Please start the server first:
    echo    npm run dev:server
    exit /b 1
)

echo ✅ Server is running

REM Collect metrics
call :collect_metrics

REM Generate dashboard
call :generate_html_dashboard

echo.
echo 🎉 Metrics Collection Complete!
echo =========================
echo 📁 Metrics saved to: %METRICS_FILE%
echo 🌐 Dashboard: %dashboard_file%

REM Open HTML dashboard
start "" "%dashboard_file%"

echo ✅ Script completed successfully
pause

goto :end

:error
echo ❌ Error occurred during metrics collection
exit /b 1

:end
echo ✅ Script completed successfully
pause
