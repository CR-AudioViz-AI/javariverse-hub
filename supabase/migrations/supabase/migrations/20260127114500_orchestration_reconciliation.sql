BEGIN;

ALTER TABLE orchestration_sessions
  ALTER COLUMN state SET NOT NULL,
  ALTER COLUMN state SET DEFAULT '{}'::jsonb,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_orchestration_sessions_user_id
  ON orchestration_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_orchestration_sessions_status
  ON orchestration_sessions(status);

ALTER TABLE approval_queue
  ALTER COLUMN requested_at SET NOT NULL,
  ALTER COLUMN requested_at SET DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_approval_queue_session_id
  ON approval_queue(session_id);

CREATE INDEX IF NOT EXISTS idx_approval_queue_status
  ON approval_queue(status);

ALTER TABLE orchestration_audit_log
  RENAME TO orchestration_audit_log_legacy;

CREATE TABLE orchestration_audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  session_id uuid NOT NULL
    REFERENCES orchestration_sessions(id)
    ON DELETE CASCADE,

  actor text NOT NULL,
  action text NOT NULL,

  target jsonb NOT NULL,
  outcome text NOT NULL,
  metadata jsonb,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orchestration_audit_log_session_id
  ON orchestration_audit_log(session_id);

CREATE INDEX idx_orchestration_audit_log_created_at
  ON orchestration_audit_log(created_at);

ALTER TABLE orchestration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestration_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS orchestration_sessions_owner ON orchestration_sessions;
CREATE POLICY orchestration_sessions_owner
  ON orchestration_sessions
  FOR ALL
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS approval_queue_owner ON approval_queue;
CREATE POLICY approval_queue_owner
  ON approval_queue
  FOR ALL
  USING (
    session_id IN (
      SELECT id FROM orchestration_sessions
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS orchestration_audit_log_read ON orchestration_audit_log;
CREATE POLICY orchestration_audit_log_read
  ON orchestration_audit_log
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM orchestration_sessions
      WHERE user_id = auth.uid()
    )
  );

COMMIT;

