"use-server"

import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';
import nodemailer from 'nodemailer';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { firstName, lastName, email } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
      // Insert user data into the database
      await client.query(
        'INSERT INTO users (first_name, last_name, email) VALUES ($1, $2, $3)',
        [firstName, lastName, email]
      );

      // Send confirmation email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Account Created Successfully',
        text: `Hello ${firstName},\n\nYour account has been created successfully.\n\nThank you!`,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: 'Account created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};