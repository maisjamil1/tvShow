DROP TABLE IF EXISTS mtv;
CREATE TABLE mtv(
id SERIAL PRIMARY KEY,
title VARCHAR(255),
poster_path VARCHAR(255),
vote_count INT,
overview TEXT);