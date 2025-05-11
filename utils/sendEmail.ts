import nodemailer from "nodemailer";

const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // HTML email template
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
              }
              .header {
                  background-color: #8e44ad;
                  color: white;
                  padding: 20px;
                  text-align: center;
                  border-radius: 5px 5px 0 0;
              }
              .content {
                  padding: 20px;
                  background-color: #f9f9f9;
                  border: 1px solid #ddd;
                  border-top: none;
                  border-radius: 0 0 5px 5px;
              }
              .footer {
                  margin-top: 20px;
                  font-size: 12px;
                  text-align: center;
                  color: #777;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  margin: 20px 0;
                  background-color: #4a6baf;
                  color: white !important;
                  text-decoration: none;
                  border-radius: 5px;
              }
              .notification-title {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 15px;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h2>SalonBooking.lk</h2>
          </div>
          <div class="content">
              <div class="notification-title">${subject}</div>
              <p>${text.replace(/\n/g, '<br>')}</p>
              
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
              
              <div class="footer">
                  <p>© ${new Date().getFullYear()} SalonBooking.lk. All rights reserved.</p>
                  <p>Please do not reply directly to this email.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"SalonBooking.lk" <${process.env.SMTP_USER}>`,
      to, // This will be handled by the SMTP server, recipients won't see each other
      subject,
      text, // plain text fallback
      html,
    };

    // Use BCC for multiple recipients to maintain privacy
    // if (to.includes(',')) {
    //   mailOptions.to = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    //   mailOptions.bcc = to;
    // }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;