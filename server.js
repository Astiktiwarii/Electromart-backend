require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Transporter Setup (Fast Gmail SMTP)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL Connection
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email Handler Function
const handleSendMail = async (req, res) => {
  const { email, total } = req.body;
  const toMail = email || req.body.toEmail || process.env.EMAIL_USER;

  const mailOptions = {
    from: `"ElectroMart" <${process.env.EMAIL_USER}>`,
    to: toMail,
    subject: 'Order Confirmation - ElectroMart',
    text: `Aapka order successful ho gaya hai! Total Amount: ₹${total || 59999}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #007bff;">Order Confirmation - ElectroMart</h2>
        <p>Thank you for shopping with us!</p>
        <p><strong>Total Amount Paid:</strong> ₹${total || 59999}</p>
        <p>Your order receipt is confirmed.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', toMail);
    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Route 1 (Dono URLs Support Karne Ke Liye)
app.post('/send-email', handleSendMail);

// Route 2
app.post('/send-receipt', handleSendMail);

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});