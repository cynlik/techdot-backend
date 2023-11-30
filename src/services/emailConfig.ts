import nodemailer from 'nodemailer';
import { Response } from 'express';
import { emailContent, EmailType } from '@src/utils/emailType';
import { HttpStatus } from "@src/utils/constant";

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
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({ message: 'Error in sending email', error: error.message });
    } else {
      return res.status(HttpStatus.OK).json({ message: 'Email sent successfully' });
    }
  });
}

// Exemplo de uso:
// sendMail(EmailType.Tipo, user.email, res);
// sendMail(EmailType.Welcome, user.email, res);
// sendMail(EmailType.VerifyAccount, user.email, res, token); Caso seja VerifyAccount
