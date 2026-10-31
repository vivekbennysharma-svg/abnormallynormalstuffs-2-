-- Function to auto-flag posts that receive 3 or more pending reports
CREATE OR REPLACE FUNCTION check_post_report_threshold()
RETURNS TRIGGER AS $$
DECLARE
    pending_count INT;
BEGIN
    SELECT COUNT(*) INTO pending_count
    FROM "Report"
    WHERE "postId" = NEW."postId" AND "status" = 'PENDING';

    IF pending_count >= 3 THEN
        UPDATE "Post"
        SET "status" = 'HIDDEN'
        WHERE id = NEW."postId";
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger firing after a new report is inserted
DROP TRIGGER IF EXISTS trigger_auto_hide_reported_post ON "Report";
CREATE TRIGGER trigger_auto_hide_reported_post
AFTER INSERT ON "Report"
FOR EACH ROW
WHEN (NEW."postId" IS NOT NULL)
EXECUTE FUNCTION check_post_report_threshold();