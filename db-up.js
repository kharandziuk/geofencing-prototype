const { Client } = require('pg')
const client = new Client({
  user: 'test',
  host: 'localhost',
  database: 'test',
  password: 'test',
  port: 5432,
})

const up = function() {
  return client.connect()
    .then(() => client.query(`
        CREATE TABLE tbl_positions(
           id VARCHAR (32) UNIQUE NOT NULL,
           position GEOGRAPHY NOT NULL
        );
      `)
    )
    .then(() => client.query(`
    CREATE FUNCTION notify_position() RETURNS trigger AS $$
    DECLARE
      colocated_ids TEXT;
      BEGIN
        colocated_ids = (SELECT string_agg(id, ',') FROM tbl_positions WHERE ST_DISTANCE(
            position, NEW.position
          ) < 500 and id <> NEW.id
        );
        IF length(colocated_ids) > 0 THEN
            PERFORM pg_notify('q_event', NEW.id || '|' || colocated_ids);
        END IF;
        RETURN new;
    END;
    $$ LANGUAGE plpgsql;
    `))
    .then(() => client.query(`
      CREATE TRIGGER position_trigger AFTER UPDATE ON tbl_positions
      FOR EACH ROW
      EXECUTE PROCEDURE notify_position();
    `))
    .then(() =>
      client.end()
    )
}

up()

