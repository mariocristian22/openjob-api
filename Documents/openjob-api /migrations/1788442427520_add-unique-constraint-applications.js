exports.up = (pgm) => {
  pgm.addConstraint('applications', 'applications_user_id_job_id_unique', {
    unique: ['user_id', 'job_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('applications', 'applications_user_id_job_id_unique');
};
