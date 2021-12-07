import nodemailer, { Transporter } from 'nodemailer';
import pug from 'pug';
import htmlToText from 'html-to-text';

const prodTransporter: Transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: process.env.SENDGRID_USERNAME,
    pass: process.env.SENDGRID_PASSWORD,
  },
});

const devTransporter: Transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 25,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export abstract class EmailHelper {
  // Send the actual email
  static send = async (
    template: string,
    user: any,
    subject: string,
    url: string
  ) => {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: user.name.split(' ')[0],
      url,

      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: `Sheiyhu <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    // 3) Create a transport and send email
    if (process.env.NODE_ENV === 'production') {
      await prodTransporter
        .sendMail(mailOptions)
        .then((msgInfo) => {
          console.log(msgInfo);
          return true;
        })
        .catch((err) => {
          console.log(err);
          return err;
        });
    } else {
      await devTransporter
        .sendMail(mailOptions)
        .then((msgInfo) => {
          console.log(msgInfo);
          return true;
        })
        .catch((err) => {
          console.log(err);
          return err;
        });
    }
  };
  public static sendWelcome = async (user: any, url: string) => {
    await EmailHelper.send('welcome', user, 'welcome', url);
  };

  public static sendPasswordReset = async (user: any, url: string) => {
    await EmailHelper.send(
      'passwordReset',
      user,
      'Your password reset token ( valid for only 10 minutes )',
      url
    );
  };
}
