import nodemailer from 'nodemailer';
import { Response } from 'express';
import { emailContent, EmailType } from '@src/utils/emailType';

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL as string,
    pass: process.env.PASSWORD as string,
  }
});

export function sendMail(emailType: EmailType, to: string, res: Response, token?: string) {
  const emailInfo = emailContent[emailType];
  let text: string;

  if (typeof emailInfo.text === 'function') {
    text = emailInfo.text(token || '');
  } else {
    text = emailInfo.text as string;
  }

  const mailOptions = {
    to,
    subject: emailInfo.subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(422).json({ message: 'Error in sending email', error: error.message });
    } else {
      console.log('Email sent: ' + info.response);
      return res.status(200).json({ message: 'Email sent successfully' });
    }
  });
}


// Exemplo de uso:
// sendMail(EmailType.Tipo, user.email, res);
// sendMail(EmailType.Welcome, user.email, res);
// sendMail(EmailType.VerifyAccount, user.email, res, token); Caso seja VerifyAccount
