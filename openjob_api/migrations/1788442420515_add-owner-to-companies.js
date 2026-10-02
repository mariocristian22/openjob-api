exports.up = (pgm) => {
  pgm.addColumn('companies', {
    owner_id: {
      type: 'VARCHAR(50)',
      references: '"users"',
      onDelete: 'SET NULL',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('companies', 'owner_id');
};
