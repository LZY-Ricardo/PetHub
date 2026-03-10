-- 为现有用户设置卡通头像
-- 使用时请在 MySQL 中执行此脚本

USE `pet_management_platform`;

UPDATE `sys_user`
SET
    `avatar` = '/uploads/avatar/default_panda.svg'
WHERE
    `username` = 'admin'
    AND (
        `avatar` IS NULL
        OR `avatar` = ''
    );

UPDATE `sys_user`
SET
    `avatar` = '/uploads/avatar/default_dog.svg'
WHERE
    `username` = 'xiaoming'
    AND (
        `avatar` IS NULL
        OR `avatar` = ''
    );

UPDATE `sys_user`
SET
    `avatar` = '/uploads/avatar/default_rabbit.svg'
WHERE
    `username` = 'xiaohong'
    AND (
        `avatar` IS NULL
        OR `avatar` = ''
    );

UPDATE `sys_user`
SET
    `avatar` = '/uploads/avatar/default_fox.svg'
WHERE
    `username` = 'david'
    AND (
        `avatar` IS NULL
        OR `avatar` = ''
    );

UPDATE `sys_user`
SET
    `avatar` = '/uploads/avatar/default_cat.svg'
WHERE
    `username` = 'lucy'
    AND (
        `avatar` IS NULL
        OR `avatar` = ''
    );

UPDATE `sys_user`
SET
    `avatar` = '/uploads/avatar/default_bear.svg'
WHERE
    `username` = 'tom'
    AND (
        `avatar` IS NULL
        OR `avatar` = ''
    );

UPDATE `sys_user`
SET
    `avatar` = '/uploads/avatar/default_hamster.svg'
WHERE
    `username` = 'jerry'
    AND (
        `avatar` IS NULL
        OR `avatar` = ''
    );

UPDATE `sys_user`
SET
    `avatar` = '/uploads/avatar/default_penguin.svg'
WHERE
    `username` = 'amy'
    AND (
        `avatar` IS NULL
        OR `avatar` = ''
    );

SELECT `username`, `nickname`, `avatar` FROM `sys_user`;