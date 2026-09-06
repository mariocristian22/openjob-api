require('dotenv').config();
const nodemailer = require('nodemailer');
const pool = require('./db/pool');
const { getChannel, QUEUE_NAME } = require('./rabbitmq/connection');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

async function getApplicationOwnerInfo(applicationId) {
  const query = {
    text: `SELECT a.created_at AS application_date,
           u.name AS applicant_name, u.email AS applicant_email,
           j.title AS job_title,
           owner.email AS owner_email, owner.name AS owner_name
           FROM applications a
           JOIN users u ON a.user_id = u.id
           JOIN jobs j ON a.job_id = j.id
           JOIN companies c ON j.company_id = c.id
           JOIN users owner ON c.owner_id = owner.id
           WHERE a.id = $1`,
    values: [applicationId],
  };
  const result = await pool.query(query);
  return result.rows[0];
}

async function sendNotificationEmail(info) {
  const info2 = await transporter.sendMail({
    from: '"OpenJob" <no-reply@openjob.com>',
    to: info.owner_email,
    subject: `New Application for ${info.job_title}`,
    text: `Hi ${info.owner_name},

You have a new applicant for "${info.job_title}":

Name: ${info.applicant_name}
Email: ${info.applicant_email}
Applied on: ${info.application_date}

- OpenJob`,
  });
  return info2;
}

async function startConsumer() {
  const channel = await getChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  console.log('Consumer waiting for messages on', QUEUE_NAME);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;
    try {
      const { application_id } = JSON.parse(msg.content.toString());
      console.log('Processing application:', application_id);

      const info = await getApplicationOwnerInfo(application_id);
      if (!info || !info.owner_email) {
        console.warn('No job owner email found for application', application_id);
        channel.ack(msg);
        return;
      }

      const sendResult = await sendNotificationEmail(info);
      console.log('Email sent to', info.owner_email);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(sendResult));

      channel.ack(msg);
    } catch (err) {
      console.error('Failed to process message:', err);
      channel.nack(msg, false, false);
    }
  });
}

startConsumer().catch((err) => {
  console.error('Consumer failed to start:', err);
  process.exit(1);
});