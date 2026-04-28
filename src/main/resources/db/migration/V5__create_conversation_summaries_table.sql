CREATE TABLE conversation_summaries (
    id                  BIGSERIAL PRIMARY KEY,
    conversation_id     BIGINT    NOT NULL,
    summary_text        TEXT      NOT NULL,
    from_message_index  INT       NOT NULL,
    to_message_index    INT       NOT NULL,
    created_at          TIMESTAMP NOT NULL
);