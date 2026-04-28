-- prompt_templates
CREATE TABLE prompt_templates (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    content     TEXT         NOT NULL,
    category    VARCHAR(100),
    is_public   BOOLEAN      NOT NULL DEFAULT false,
    created_by  VARCHAR(255),
    usage_count INT          NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL,
    updated_at  TIMESTAMP    NOT NULL
);

-- prompt_template_variables
CREATE TABLE prompt_template_variables (
    template_id   BIGINT       NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
    variable_name VARCHAR(255)
);

-- shared_conversations
CREATE TABLE shared_conversations (
    id              BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT       NOT NULL,
    share_token     VARCHAR(64)  NOT NULL UNIQUE,
    expires_at      TIMESTAMP,
    view_count      INT          NOT NULL DEFAULT 0,
    created_at      TIMESTAMP    NOT NULL
);

-- usage_records
CREATE TABLE usage_records (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT         NOT NULL,
    model            VARCHAR(100)   NOT NULL,
    prompt_tokens    INT            NOT NULL DEFAULT 0,
    completion_tokens INT           NOT NULL DEFAULT 0,
    total_tokens     INT            NOT NULL DEFAULT 0,
    cost             DECIMAL(10,6)  DEFAULT 0,
    timestamp        TIMESTAMP      NOT NULL,
    request_type     VARCHAR(50)    DEFAULT 'chat',
    response_time_ms BIGINT
);

CREATE INDEX idx_usage_user_timestamp ON usage_records(user_id, timestamp);
CREATE INDEX idx_usage_timestamp ON usage_records(timestamp);

-- webhook_configs
CREATE TABLE webhook_configs (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    url        VARCHAR(500) NOT NULL,
    events     VARCHAR(500) NOT NULL,
    secret     VARCHAR(128) NOT NULL,
    active     BOOLEAN      NOT NULL DEFAULT true,
    created_at TIMESTAMP    NOT NULL
);

-- webhook_deliveries
CREATE TABLE webhook_deliveries (
    id                BIGSERIAL PRIMARY KEY,
    webhook_config_id BIGINT    NOT NULL,
    event             VARCHAR(100) NOT NULL,
    payload           TEXT      NOT NULL,
    response_status   INT,
    attempts          INT       NOT NULL DEFAULT 0,
    success           BOOLEAN   NOT NULL DEFAULT false,
    delivered_at      TIMESTAMP
);