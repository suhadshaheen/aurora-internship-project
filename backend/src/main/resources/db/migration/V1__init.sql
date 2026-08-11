-- Initial schema for Info Hub. Mirrors the JPA entities.
-- Table creation order respects FK dependencies.

CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    user_handle VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    role        VARCHAR(255)
);

CREATE TABLE categories (
    id           BIGSERIAL PRIMARY KEY,
    cat_name     VARCHAR(255) NOT NULL,
    user_id      BIGINT NOT NULL REFERENCES users(id),
    date_created TIMESTAMP
);

CREATE TABLE sections (
    id         BIGSERIAL PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    content    TEXT,
    user_id    BIGINT NOT NULL REFERENCES users(id),
    cat_id     BIGINT REFERENCES categories(id),
    visibility BOOLEAN,
    created_at TIMESTAMP
);

CREATE TABLE section_images (
    id         BIGSERIAL PRIMARY KEY,
    image_url  VARCHAR(255) NOT NULL,
    section_id BIGINT NOT NULL REFERENCES sections(id)
);

CREATE TABLE section_docs (
    id         BIGSERIAL PRIMARY KEY,
    file_name  VARCHAR(255) NOT NULL,
    file_url   VARCHAR(255) NOT NULL,
    section_id BIGINT REFERENCES sections(id)
);

CREATE TABLE comments (
    id                BIGSERIAL PRIMARY KEY,
    content           VARCHAR(255) NOT NULL,
    parent_comment_id BIGINT REFERENCES comments(id),
    user_id           BIGINT NOT NULL REFERENCES users(id),
    section_id        BIGINT NOT NULL REFERENCES sections(id),
    date_created      TIMESTAMP
);

CREATE TABLE password_reset_tokens (
    id          SERIAL PRIMARY KEY,
    token       VARCHAR(255) NOT NULL UNIQUE,
    user_id     BIGINT NOT NULL UNIQUE REFERENCES users(id),
    expiry_date TIMESTAMP NOT NULL,
    used        BOOLEAN NOT NULL DEFAULT FALSE
);
