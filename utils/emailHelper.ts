import nodemailer, { Transporter } from 'nodemailer';

const transporter: Transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST as string | undefined,
  port: process.env.EMAIL_PORT as number | undefined,
  auth: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASS as string,
  },
});

export const sendEmail = async (options: {
  to: string;
  subject: string;
  message: string;
}) => {
  const mailOptions = {
    from: 'Shehu <forgeneralmailing@gmail.com>',
    to: options.to,
    subject: options.subject,
    message: options.message,
  };

  await transporter.sendMail(mailOptions);
};
