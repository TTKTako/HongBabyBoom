CREATE TABLE proj_users (
  id            INT           UNSIGNED NOT NULL AUTO_INCREMENT,
  password_hash VARCHAR(255)  NOT NULL,
  display_name  VARCHAR(100)  NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE proj_boards (
  id           INT           UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      INT           UNSIGNED NOT NULL,
  board_token  VARCHAR(64)   NOT NULL UNIQUE,  -- secret used by ESP32 to auth POSTs
  room_name    VARCHAR(100)  NOT NULL,
  latitude     DECIMAL(10,7) NOT NULL,
  longitude    DECIMAL(10,7) NOT NULL,
  wifi_ssid    VARCHAR(64)   DEFAULT NULL,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  registered_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP    DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_boards_user
    FOREIGN KEY (user_id) REFERENCES proj_users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE proj_sensor_readings (
  id               BIGINT      UNSIGNED NOT NULL AUTO_INCREMENT,
  board_id         INT         UNSIGNED NOT NULL,
  temperature_c    FLOAT       NOT NULL,
  humidity_pct     FLOAT       NOT NULL,
  light_lux        FLOAT       NOT NULL,
  motion_detected  TINYINT(1)  NOT NULL DEFAULT 0,
  recorded_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_readings_board_time (board_id, recorded_at),  -- critical for time-range queries
  CONSTRAINT fk_readings_board
    FOREIGN KEY (board_id) REFERENCES proj_boards(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE proj_comfort_scores (
  id              BIGINT       UNSIGNED NOT NULL AUTO_INCREMENT,
  reading_id      BIGINT       UNSIGNED NOT NULL UNIQUE,  -- one score per reading
  score_label     ENUM('Comfortable', 'Moderate', 'Uncomfortable') NOT NULL,
  model_confidence FLOAT       DEFAULT NULL,              -- NULL when rule-based fallback used
  scoring_method  ENUM('ml_model', 'rule_based') NOT NULL,
  computed_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_scores_reading
    FOREIGN KEY (reading_id) REFERENCES proj_sensor_readings(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE proj_outdoor_weather_snapshots (
  id                 BIGINT      UNSIGNED NOT NULL AUTO_INCREMENT,
  board_id           INT         UNSIGNED NOT NULL,
  outdoor_temp_c     FLOAT       NOT NULL,
  outdoor_humidity_pct FLOAT     NOT NULL,
  weather_condition  VARCHAR(100) DEFAULT NULL,
  delta_temp_c       FLOAT       NOT NULL,               -- indoor minus outdoor
  delta_humidity_pct FLOAT       NOT NULL,
  fetched_at         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_weather_board_time (board_id, fetched_at),
  CONSTRAINT fk_weather_board
    FOREIGN KEY (board_id) REFERENCES proj_boards(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE proj_manual_events (
  id           BIGINT      UNSIGNED NOT NULL AUTO_INCREMENT,
  board_id     INT         UNSIGNED NOT NULL,
  button_id    TINYINT     UNSIGNED NOT NULL,             -- 1 or 2
  event_label  VARCHAR(100) DEFAULT NULL,                 -- e.g. "I'm home"
  triggered_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_events_board_time (board_id, triggered_at),
  CONSTRAINT fk_events_board
    FOREIGN KEY (board_id) REFERENCES proj_boards(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;