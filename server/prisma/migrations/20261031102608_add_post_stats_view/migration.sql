CREATE OR REPLACE VIEW "PostAnalyticsView" AS
SELECT 
    p.id AS "postId",
    p.title,
    p.slug,
    p.status,
    u.name AS "authorName",
    u.email AS "authorEmail",
    COUNT(DISTINCT c.id) AS "commentCount",
    COUNT(DISTINCT r.id) AS "reportCount",
    p."createdAt"
FROM "Post" p
JOIN "User" u ON p."authorId" = u.id
LEFT JOIN "Comment" c ON p.id = c."postId"
LEFT JOIN "Report" r ON p.id = r."postId"
GROUP BY p.id, u.name, u.email;