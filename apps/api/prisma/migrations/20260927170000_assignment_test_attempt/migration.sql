ALTER TABLE "TestAttempt" ADD COLUMN "assignmentId" TEXT;

UPDATE "TestAttempt" ta
SET "assignmentId" = a.id
FROM "Assignment" a
JOIN "Test" t ON t.id = ta."testId"
WHERE a."userId" = ta."userId"
  AND a."courseVersionId" = t."courseVersionId"
  AND a.id = (
    SELECT a2.id
    FROM "Assignment" a2
    WHERE a2."userId" = ta."userId"
      AND a2."courseVersionId" = t."courseVersionId"
      AND a2."assignedAt" <= ta."startedAt"
    ORDER BY a2."assignedAt" DESC
    LIMIT 1
  );

DELETE FROM "TestAttempt" WHERE "assignmentId" IS NULL;

ALTER TABLE "TestAttempt" ALTER COLUMN "assignmentId" SET NOT NULL;
CREATE INDEX "TestAttempt_assignmentId_testId_idx" ON "TestAttempt"("assignmentId","testId");
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
