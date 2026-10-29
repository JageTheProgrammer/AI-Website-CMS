-- Reserve public subdomains for existing projects and publish already-generated sites.
-- Run once against the existing ai_cms database.

DELIMITER //

CREATE PROCEDURE backfill_public_project_subdomains()
BEGIN
  DECLARE finished BOOLEAN DEFAULT FALSE;
  DECLARE project_id BIGINT UNSIGNED;
  DECLARE project_slug VARCHAR(100);
  DECLARE base_subdomain VARCHAR(63);
  DECLARE candidate VARCHAR(63);
  DECLARE suffix_number INT UNSIGNED;
  DECLARE candidate_count INT UNSIGNED;

  DECLARE project_cursor CURSOR FOR
    SELECT id, slug
    FROM projects
    WHERE platform_subdomain IS NULL
      AND deleted_at IS NULL
    ORDER BY id;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET finished = TRUE;

  OPEN project_cursor;

  project_loop: LOOP
    FETCH project_cursor INTO project_id, project_slug;
    IF finished THEN
      LEAVE project_loop;
    END IF;

    SET base_subdomain = LEFT(
      REGEXP_REPLACE(LOWER(project_slug), '[^a-z0-9]+', '-'),
      63
    );
    SET base_subdomain = TRIM(BOTH '-' FROM base_subdomain);
    IF base_subdomain IS NULL OR base_subdomain = '' THEN
      SET base_subdomain = CONCAT('project-', project_id);
    END IF;

    SET candidate = base_subdomain;
    SET suffix_number = 1;

    IF candidate IN ('admin', 'api', 'app', 'assets', 'mail', 'static', 'www') THEN
      SET candidate = CONCAT(LEFT(base_subdomain, 63 - CHAR_LENGTH(CONCAT('-', suffix_number))), '-', suffix_number);
      SET suffix_number = suffix_number + 1;
    END IF;

    SET candidate_count = 1;
    WHILE candidate_count > 0 DO
      SELECT COUNT(*) INTO candidate_count
      FROM projects
      WHERE platform_subdomain = candidate;

      IF candidate_count > 0 THEN
        SET candidate = CONCAT(
          LEFT(base_subdomain, 63 - CHAR_LENGTH(CONCAT('-', suffix_number))),
          '-',
          suffix_number
        );
        SET suffix_number = suffix_number + 1;
      END IF;
    END WHILE;

    UPDATE projects
    SET platform_subdomain = candidate
    WHERE id = project_id;
  END LOOP;

  CLOSE project_cursor;
END//

DELIMITER ;

CALL backfill_public_project_subdomains();
DROP PROCEDURE backfill_public_project_subdomains;

-- Previously generated ready documents have already passed the component
-- document validator and renderer. Publish those sites on their new hostnames.
UPDATE projects p
INNER JOIN project_versions pv
  ON pv.project_id = p.id
 AND pv.version_number = p.current_version_number
INNER JOIN project_files pf
  ON pf.project_version_id = pv.id
 AND pf.file_path = 'site.json'
SET p.status = 'published',
    p.visibility = 'public',
    pv.status = 'published'
WHERE p.deleted_at IS NULL
  AND p.platform_subdomain IS NOT NULL
  AND p.status = 'ready'
  AND JSON_VALID(pf.content) = 1;

INSERT INTO deployments
  (project_id, project_version_id, created_by_user_id, target, status,
   deployment_url, build_id, started_at, finished_at)
SELECT p.id,
       pv.id,
       COALESCE(pv.created_by_user_id, p.owner_user_id),
       'platform',
       'succeeded',
       CONCAT('https://', p.platform_subdomain, '.maatix.fi'),
       CONCAT('subdomain-migration-', p.id),
       NOW(3),
       NOW(3)
FROM projects p
INNER JOIN project_versions pv
  ON pv.project_id = p.id
 AND pv.version_number = p.current_version_number
INNER JOIN project_files pf
  ON pf.project_version_id = pv.id
 AND pf.file_path = 'site.json'
WHERE p.deleted_at IS NULL
  AND p.status = 'published'
  AND p.platform_subdomain IS NOT NULL
  AND JSON_VALID(pf.content) = 1
  AND NOT EXISTS (
    SELECT 1
    FROM deployments d
    WHERE d.project_id = p.id
      AND d.project_version_id = pv.id
      AND d.target = 'platform'
  );
