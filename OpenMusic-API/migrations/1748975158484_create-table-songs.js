exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT', 
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
    genre: {
      type: 'TEXT',
      notNull: true,
    },
    performer: {
      type: 'TEXT', 
      notNull: true,
    },
    duration: {
      type: 'INTEGER',
      notNull: false, 
    },
    album_id: { 
      type: 'VARCHAR(50)',
      notNull: false, 
      references: '"albums"(id)', 
      onDelete: 'SET NULL', 
    },
  });

  pgm.createIndex('songs', 'album_id');
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};