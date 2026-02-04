@echo off
REM testing-workflow.bat - Windows testing workflow script

echo.
echo 🧪 MERN Ecommerce Testing Workflow
echo ==================================

REM 1. Environment Check
echo 1. Checking Environment...
echo Node.js version:
node --version
echo npm version:
npm --version

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker is installed
) else (
    echo ⚠️  Docker not found - some tests may fail
)

REM 2. Check Test Dependencies
echo.
echo 2. Checking Test Dependencies...
npm list jest >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Jest is installed
) else (
    echo ❌ Jest not found - installing...
    npm install --save-dev jest
)

npm list cypress >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Cypress is installed
) else (
    echo ⚠️  Cypress not found - E2E tests may fail
)

REM 3. Start Services
echo.
echo 3. Starting Services...
docker-compose up -d mongodb redis >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker services started
    echo ℹ️  Waiting for services to start...
    timeout /t 10 /nobreak >nul
    
    docker ps | findstr mongo >nul
    if %errorlevel% equ 0 (
        echo ✅ MongoDB is running
    ) else (
        echo ❌ MongoDB failed to start
    )
    
    docker ps | findstr redis >nul
    if %errorlevel% equ 0 (
        echo ✅ Redis is running
    ) else (
        echo ⚠️  Redis not running - tests will use mocks
    )
) else (
    echo ⚠️  Docker Compose not found - skipping service startup
)

REM 4. Run Tests
echo.
echo 4. Running Tests...

REM Run unit tests
echo.
echo ℹ️  Running Unit Tests...
npm run test:unit
if %errorlevel% equ 0 (
    echo ✅ Unit tests passed
) else (
    echo ❌ Unit tests failed
)

REM Generate coverage report
echo.
echo ℹ️  Generating Coverage Report...
npm run test:coverage
if %errorlevel% equ 0 (
    echo ✅ Coverage report generated
    echo ℹ️  View coverage: coverage\lcov-report\index.html
) else (
    echo ❌ Coverage report failed
)

REM 5. Generate Test Report
echo.
echo 5. Generating Test Report...

set REPORT_FILE=test-report-%date:~-4,4%%date:~-7,2%%date:~-10,2%%.md%

echo # Test Report > %REPORT_FILE%
echo. >> %REPORT_FILE%
echo **Date:** %date% >> %REPORT_FILE%
echo **Environment:** >> %REPORT_FILE%
node --version >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo ## Test Results >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo ### Unit Tests >> %REPORT_FILE%
echo \`\`\` >> %REPORT_FILE%
npm run test:unit >> %REPORT_FILE% 2>&1
echo \`\`\` >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo ### Coverage Report >> %REPORT_FILE%
echo \`\`\` >> %REPORT_FILE%
npm run test:coverage >> %REPORT_FILE% 2>&1
echo \`\`\` >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo ### Services Status >> %REPORT_FILE%
echo \`\`\` >> %REPORT_FILE%
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>nul || echo Docker not available >> %REPORT_FILE%
echo \`\`\` >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo ### Next Steps >> %REPORT_FILE%
echo 1. Review coverage report: open coverage\lcov-report\index.html >> %REPORT_FILE%
echo 2. Check failed tests and fix issues >> %REPORT_FILE%
echo 3. Add more tests to improve coverage >> %REPORT_FILE%
echo 4. Set up CI/CD for automated testing >> %REPORT_FILE%

echo ✅ Test report generated: %REPORT_FILE%

REM 6. Cleanup
echo.
echo 6. Cleanup...
echo ℹ️  Stopping Docker services...
docker-compose down >nul 2>&1

REM 7. Summary
echo.
echo ==================================
echo 🎉 Testing Workflow Complete!
echo.
echo 📊 Reports Generated:
echo    - Coverage Report: coverage\lcov-report\index.html
echo    - Test Summary: %REPORT_FILE%
echo.
echo 🔧 Next Steps:
echo    1. Review coverage report and improve test coverage
echo    2. Fix any failed tests
echo    3. Add more integration and E2E tests
echo    4. Set up CI/CD pipeline for automated testing
echo.
echo 📞 For help, see: TESTING_WORKFLOW.md
echo ==================================

pause
