Как получить новые cookie для youtube:

1. Синхронизировать через postman cookie с youtube под авторизованным пользователем
2. Удалить все кроме тех, что наичинаются на "__Secure"
3. Сделать тестовый запрос и убедиться, что в полученном запросе есть "ID_LOGIN"
4. Скопировать ID_LOGIN в process.env.YOUTUBE_ID_TOKEN
5. Скопировать Cookie в process.env.YOUTUBE_COOKIE
