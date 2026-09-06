// openmusic-consumer/consumer.js
require('dotenv').config();
const amqp = require('amqplib');
const MailSender = require('./MailSender');

const listen = async () => {
  const mailSender = new MailSender();
  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  await channel.assertQueue('export:playlists', {
    durable: true,
  });

  console.log('Menunggu pesan pada queue: export:playlists...');

  channel.consume('export:playlists', async (message) => {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());

      console.log(`Menerima permintaan ekspor playlist ${playlistId} ke email ${targetEmail}`);

      await mailSender.sendEmail(targetEmail, playlistId);

      channel.ack(message); 

      console.log(`Email untuk playlist ${playlistId} berhasil dikirim.`);
    } catch (error) {
      console.error('Gagal memproses pesan:', error.message);
      channel.ack(message);
    }
  }, { noAck: false });
};

listen();