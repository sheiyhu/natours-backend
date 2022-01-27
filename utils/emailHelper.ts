import sgMail from '@sendgrid/mail';
import axios from 'axios';

const SEND_API_KEY = process.env.SEND_API_KEY as string;
const WELCOME_TEMPLATE_ID = process.env.WELCOME_TEMPLATE_ID as string;

sgMail.setApiKey(SEND_API_KEY);

export abstract class EmailHelper {
  public static emailMessage = (email: string, name: string, url: string) => {
    return {
      from: {
        name: 'Shehu',
        email: 'engr.nameless@gmail.com',
      },
      to: email,
      templateId: WELCOME_TEMPLATE_ID,
      dynamicTemplateData: {
        name,
        url,
      },
    };
  };

  public static sendWelcome = async (emailData: {
    from: {
      name: string;
      email: string;
    };
    to: string;
    templateId: string;
    dynamicTemplateData: {
      name: string;
      url: string;
    };
  }) => {
    await sgMail.send(emailData);
  };

  // public static sendPasswordReset = async (user: any, url: string) => {
  //   await EmailHelper.send(
  //     'passwordReset',
  //     user,
  //     'Your password reset token ( valid for only 10 minutes )',
  //     url
  //   );
  // };
}

// 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
