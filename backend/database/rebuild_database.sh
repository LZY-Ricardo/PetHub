#!/bin/bash

# ========================================
# 宠物管理与服务平台 - 数据库重建脚本
# ========================================

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-pet_management_platform}

echo "========================================"
echo "宠物管理与服务平台 - 数据库重建脚本"
echo "========================================"
echo ""

# 检查mysql命令是否可用
if ! command -v mysql &> /dev/null; then
    echo "错误：找不到mysql命令，请确保MySQL已安装并添加到PATH"
    exit 1
fi

# 读取密码
echo "请输入MySQL密码:"
read -s DB_PASSWORD
echo ""

echo "[1/4] 正在修复数据库字符集..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" --default-character-set=utf8mb4 < database/fix_encoding.sql

if [ $? -ne 0 ]; then
    echo "错误：字符集修复失败！"
    exit 1
fi

echo ""
echo "[2/4] 正在创建数据库表结构..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" --default-character-set=utf8mb4 "$DB_NAME" < database/schema.sql

if [ $? -ne 0 ]; then
    echo "错误：创建表结构失败！"
    exit 1
fi

echo ""
echo "[3/4] 正在导入初始数据..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" --default-character-set=utf8mb4 "$DB_NAME" < database/data.sql

if [ $? -ne 0 ]; then
    echo "错误：导入数据失败！"
    exit 1
fi

echo ""
echo "[4/4] 验证数据..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" --default-character-set=utf8mb4 "$DB_NAME" -e "SELECT id, username, nickname FROM sys_user LIMIT 3;"

echo ""
echo "========================================"
echo "数据库重建完成！"
echo "========================================"
