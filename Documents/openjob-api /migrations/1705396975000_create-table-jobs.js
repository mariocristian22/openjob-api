exports.up = (pgm) => {
  pgm.createTable('jobs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    company_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"companies"',
      onDelete: 'CASCADE',
    },
    category_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"categories"',
      onDelete: 'CASCADE',
    },
    title: {
      type: 'VARCHAR(200)',
      notNull: true,
    },
    description: {
      type: 'TEXT',
    },
    job_type: {
      type: 'VARCHAR(50)',
    },
    experience_level: {
      type: 'VARCHAR(50)',
    },
    location_type: {
      type: 'VARCHAR(50)',
    },
    location_city: {
      type: 'VARCHAR(100)',
    },
    salary_min: {
      type: 'BIGINT',
    },
    salary_max: {
      type: 'BIGINT',
    },
    is_salary_visible: {
      type: 'BOOLEAN',
      default: true,
    },
    status: {
      type: 'VARCHAR(20)',
      default: 'open',
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('jobs');
};
