exports.up = (pgm) => {
  pgm.createTable('documents', {
    id: { type: 'varchar(50)', primaryKey: true },
    filename: { type: 'varchar(255)', notNull: true },
    original_name: { type: 'varchar(255)', notNull: true },
    size: { type: 'integer', notNull: true },
    mime_type: { type: 'varchar(100)', notNull: true },
    uploaded_by: {
      type: 'varchar(50)',
      references: '"users"',
      onDelete: 'SET NULL',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('documents');
};
