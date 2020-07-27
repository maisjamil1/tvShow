DROP TABLE IF EXISTS mtv;
CREATE TABLE mtv(
id SERIAL PRIMARY KEY,
motv_id VARCHAR(255),
title VARCHAR(255),
poster_path VARCHAR(255),
vote_count VARCHAR,
overview TEXT,
comment TEXT);