// src/service/emailService.ts
import nodemailer from 'nodemailer';

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"NextPOS" <pgpgadelha123@gmail.com>',
      to: email,
      subject: 'Recuperação de Senha - NextPOS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #002AD3;">Recuperação de Senha - NextPOS</h2>
          <p>Você solicitou a recuperação de senha para sua conta NextPOS.</p>
          <p>Clique no link abaixo para redefinir sua senha:</p>
          <a href="${resetLink}" 
             style="background-color: #002AD3; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Redefinir Senha
          </a>
          <p style="margin-top: 20px; color: #666;">
            <strong>Este link expira em 1 hora.</strong><br>
            Se você não solicitou esta recuperação, ignore este email.
          </p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      return false;
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new EmailService();