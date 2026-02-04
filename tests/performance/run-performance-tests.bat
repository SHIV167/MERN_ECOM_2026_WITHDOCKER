@echo off
REM Performance Testing Automation Script for Windows
REM This script runs comprehensive performance tests using Artillery

echo 🚀 Starting Performance Testing with Artillery
echo ==============================================

REM Create results directory
if not exist "test-results\performance" mkdir test-results\performance
if not exist "test-results\reports" mkdir test-results\reports

REM Set timestamp for reports
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "TIMESTAMP=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%-%dt:~8,2%-%dt:~10,2%-%dt:~12,2%"
set "REPORT_DIR=test-results\performance\%TIMESTAMP%"
mkdir "%REPORT_DIR%"

echo 📅 Test Run: %TIMESTAMP%
echo 📁 Results Directory: %REPORT_DIR%

REM Function to run a test and generate report
echo.
echo 🔥 Running load-test...
echo 📄 Test file: tests\performance\load-test.yml
echo 📊 Output: %REPORT_DIR%\load-test-results.json

REM Run the test
artillery run tests\performance\load-test.yml --output %REPORT_DIR%\load-test-results.json

REM Generate HTML report
artillery report %REPORT_DIR%\load-test-results.json --output %REPORT_DIR%\load-test-report.html

echo ✅ load-test completed
echo 📈 Report generated: %REPORT_DIR%\load-test-report.html

echo.
echo 🔥 Running stress-test...
echo 📄 Test file: tests\performance\stress-test.yml
echo 📊 Output: %REPORT_DIR%\stress-test-results.json

artillery run tests\performance\stress-test.yml --output %REPORT_DIR%\stress-test-results.json
artillery report %REPORT_DIR%\stress-test-results.json --output %REPORT_DIR%\stress-test-report.html

echo ✅ stress-test completed
echo 📈 Report generated: %REPORT_DIR%\stress-test-report.html

echo.
echo 🔥 Running spike-test...
echo 📄 Test file: tests\performance\spike-test.yml
echo 📊 Output: %REPORT_DIR%\spike-test-results.json

artillery run tests\performance\spike-test.yml --output %REPORT_DIR%\spike-test-results.json
artillery report %REPORT_DIR%\spike-test-results.json --output %REPORT_DIR%\spike-test-report.html

echo ✅ spike-test completed
echo 📈 Report generated: %REPORT_DIR%\spike-test-report.html

echo.
echo 🔥 Running endurance-test...
echo 📄 Test file: tests\performance\endurance-test.yml
echo 📊 Output: %REPORT_DIR%\endurance-test-results.json

artillery run tests\performance\endurance-test.yml --output %REPORT_DIR%\endurance-test-results.json
artillery report %REPORT_DIR%\endurance-test-results.json --output %REPORT_DIR%\endurance-test-report.html

echo ✅ endurance-test completed
echo 📈 Report generated: %REPORT_DIR%\endurance-test-report.html

REM Generate summary report
echo.
echo 📋 Generating Summary Report...

set "SUMMARY_FILE=%REPORT_DIR%\performance-summary.md"

echo # Performance Test Summary Report > "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo **Date:** %date% >> "%SUMMARY_FILE%"
echo **Test Run:** %TIMESTAMP% >> "%SUMMARY_FILE%"
echo **Environment:** Development >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ## Test Results Overview >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ### Load Test >> "%SUMMARY_FILE%"
echo - **File:** load-test.yml >> "%SUMMARY_FILE%"
echo - **Duration:** 4 minutes >> "%SUMMARY_FILE%"
echo - **Phases:** Warm up, Load test, Peak load >> "%SUMMARY_FILE%"
echo - **Report:** [Load Test Report](load-test-report.html) >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ### Stress Test >> "%SUMMARY_FILE%"
echo - **File:** stress-test.yml >> "%SUMMARY_FILE%"
echo - **Duration:** 6 minutes >> "%SUMMARY_FILE%"
echo - **Phases:** Increasing load, High load, Maximum load, Stress test, Peak stress >> "%SUMMARY_FILE%"
echo - **Report:** [Stress Test Report](stress-test-report.html) >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ### Spike Test >> "%SUMMARY_FILE%"
echo - **File:** spike-test.yml >> "%SUMMARY_FILE%"
echo - **Duration:** 4 minutes >> "%SUMMARY_FILE%"
echo - **Phases:** Baseline, Spike, Recovery, Major spike, Final recovery >> "%SUMMARY_FILE%"
echo - **Report:** [Spike Test Report](spike-test-report.html) >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ### Endurance Test >> "%SUMMARY_FILE%"
echo - **File:** endurance-test.yml >> "%SUMMARY_FILE%"
echo - **Duration:** 25 minutes >> "%SUMMARY_FILE%"
echo - **Phases:** Endurance test, Extended load, Sustained load >> "%SUMMARY_FILE%"
echo - **Report:** [Endurance Test Report](endurance-test-report.html) >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ## Key Performance Indicators >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ### Response Time Targets >> "%SUMMARY_FILE%"
echo - **Health Check:** ^< 100ms >> "%SUMMARY_FILE%"
echo - **Product List:** ^< 500ms >> "%SUMMARY_FILE%"
echo - **Product Details:** ^< 300ms >> "%SUMMARY_FILE%"
echo - **Categories:** ^< 200ms >> "%SUMMARY_FILE%"
echo - **Authentication:** ^< 1000ms >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ### Throughput Targets >> "%SUMMARY_FILE%"
echo - **Normal Load:** 50+ requests/second >> "%SUMMARY_FILE%"
echo - **Peak Load:** 100+ requests/second >> "%SUMMARY_FILE%"
echo - **Stress Test:** 200+ requests/second >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ### Error Rate Targets >> "%SUMMARY_FILE%"
echo - **Normal Load:** ^< 1%% >> "%SUMMARY_FILE%"
echo - **Peak Load:** ^< 2%% >> "%SUMMARY_FILE%"
echo - **Stress Test:** ^< 5%% >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ## Recommendations >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ### Performance Optimizations >> "%SUMMARY_FILE%"
echo 1. **Database Indexing:** Ensure proper indexes on frequently queried fields >> "%SUMMARY_FILE%"
echo 2. **Caching:** Implement Redis caching for product listings >> "%SUMMARY_FILE%"
echo 3. **Connection Pooling:** Optimize database connection pool size >> "%SUMMARY_FILE%"
echo 4. **Load Balancing:** Consider load balancer for high traffic scenarios >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ### Monitoring >> "%SUMMARY_FILE%"
echo 1. **Response Time Monitoring:** Set up alerts for slow responses >> "%SUMMARY_FILE%"
echo 2. **Error Rate Monitoring:** Alert on error rate thresholds >> "%SUMMARY_FILE%"
echo 3. **Resource Monitoring:** Monitor CPU, memory, and database connections >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ### Next Steps >> "%SUMMARY_FILE%"
echo 1. Run tests in staging environment >> "%SUMMARY_FILE%"
echo 2. Compare with production baseline >> "%SUMMARY_FILE%"
echo 3. Set up automated performance testing in CI/CD >> "%SUMMARY_FILE%"
echo 4. Establish performance SLAs >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo --- >> "%SUMMARY_FILE%"
echo *Report generated by Artillery Performance Testing Suite* >> "%SUMMARY_FILE%"

echo 📄 Summary report generated: %SUMMARY_FILE%

echo.
echo 🎉 Performance Testing Complete!
echo ===============================
echo 📁 All reports saved to: %REPORT_DIR%
echo 📊 View summary: %REPORT_DIR%\performance-summary.md
echo 🌐 Open reports in your browser to view detailed results

REM Open reports in browser (optional)
start "" "%REPORT_DIR%\performance-summary.md"

pause
