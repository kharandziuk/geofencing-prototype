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
      r record;
      BEGIN
        FOR r IN (
          SELECT id FROM tbl_positions WHERE ST_DISTANCE(
            position, NEW.position
          ) < 300 and id <> NEW.id
        ) LOOP
          PERFORM pg_notify(
            'q_event',
            r.id
          );
        END LOOP;
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

