import { ApiResponse } from "@/customTypes/ApiResponse";
import { google } from "googleapis";
import nodemailer from "nodemailer";

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    // Create a Nodemailer transporter using OAuth2
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "arnab.rph.99@gmail.com", // Your email address to send emails from
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
      },
    });

    const htmlFormat =`<!DOCTYPE html>
      <html>
      <head>
          <style>
              /* Inline styles to mimic Tailwind CSS */
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(
                to bottom right,
                #9f7aea,  /* from-purple-500 */
                #ec4899,  /* via-pink-500 */
                 #ef4444   /* to-red-500 */
            );
                  color: #ffffff;
                  padding: 15px;
                  border-radius: 8px 8px 0 0;
                  text-align: center;
              }
              .content {
                  padding: 20px;
              }
              .footer {
                  text-align: center;
                  padding: 15px;
                  font-size: 14px;
                  color: #777;
              }
              .code {
                  font-size: 24px;
                  font-weight: bold;
                  color: #4CAF50;
                  padding: 10px;
                  border: 1px solid #4CAF50;
                  border-radius: 4px;
                  display: inline-block;
                  margin: 10px 0;
              }
              .text-base {
                  font-size: 16px;
                  line-height: 1.5;
                  color: #333;
              }
              .text-sm {
                  font-size: 14px;
                  color: #777;
              }
              .text-center {
                  text-align: center;
              }
          </style>
      </head>
      <body class="bg-gray-100 font-sans text-gray-900 m-0 p-0">
          <div class="container">
              <div class="header">
                  <h1 class="text-2xl font-bold">Whisperwave Verification Code</h1>
              </div>
              <div class="content">
                  <div class="text-base text-center">
                      <p class="font-bold" >Hello ${username},</p>
                      <p>Thank you for registering. Please use the following verification code to complete your registration:</p>
                      <div class="code">${verifyCode}</div>
                      <p>If you did not request this code, please ignore this email.</p>
                      <p>Thank you!</p>
                  </div>
              </div>
              <div class="footer">
                  <p class="text-sm text-center">Best regards,<br> Whisperwave </p>
              </div>
          </div>
      </body>
      </html>
    `;

    // Define email options
    const mailOptions = {
      from: "Whisperwave <arnab.rph.99@gmail.com> ", // Sender address
      to: email, // Receiver address
      subject : "Verification Code", // Subject line
      html : htmlFormat // Email body
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);

    console.log(result);

    // Return success response
    return {
      success: true,
      message: "Verification email sent successfully",
      messages: result as any,
    };
  } catch (error) {
    // Handle errors
    console.error("Error sending verification email:", error);
    return {
      success: false,
      message: "Failed to send verification email",
      messages: error as any,
    };
  }
}
