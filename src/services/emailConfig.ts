import nodemailer from 'nodemailer';
import { Response } from 'express';
import { emailContent, EmailType } from '@src/utils/emailType';

interface MailOptions {
  to: string;
  subject: string;
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
  let html: string;

  if (typeof emailInfo.html === 'function') {
    html = emailInfo.html(token || '');
  } else {
    html = emailInfo.html || '';
  }

  const mailOptions: MailOptions = {
    to,
    subject: emailInfo.subject,
    html,
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
