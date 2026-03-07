@echo off
chcp 65001 >nul
echo ========================================
echo 宠物管理与服务平台 - 数据库重建脚本
echo ========================================
echo.

set DB_HOST=localhost
set DB_PORT=3306
set DB_USER=root
set DB_NAME=pet_management_platform

echo 请输入MySQL密码:
set /p DB_PASSWORD=

echo.
echo [1/4] 正在修复数据库字符集...
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% --default-character-set=utf8mb4 < database\fix_encoding.sql

if %errorlevel% neq 0 (
    echo 错误：字符集修复失败！
    pause
    exit /b 1
)

echo.
echo [2/4] 正在创建数据库表结构...
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% --default-character-set=utf8mb4 %DB_NAME% < database\schema.sql

if %errorlevel% neq 0 (
    echo 错误：创建表结构失败！
    pause
    exit /b 1
)

echo.
echo [3/4] 正在导入初始数据...
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% --default-character-set=utf8mb4 %DB_NAME% < database\data.sql

if %errorlevel% neq 0 (
    echo 错误：导入数据失败！
    pause
    exit /b 1
)

echo.
echo [4/4] 验证数据...
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% --default-character-set=utf8mb4 %DB_NAME% -e "SELECT id, username, nickname FROM sys_user LIMIT 3;"

echo.
echo ========================================
echo 数据库重建完成！
echo ========================================
pause
