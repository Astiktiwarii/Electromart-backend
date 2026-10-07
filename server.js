const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Base64 screenshot badi image ho sakti hai, isliye 10mb limit rakhi hai
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Resend Setup
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// Order Processing API
app.post('/api/order', async (req, res) => {
    const { customer, items, totalPrice, paymentMethod, utr, screenshot } = req.body;
    const itemListText = items ? items.map(i => `- ${i.name}: ₹${i.price}`).join('\n') : '';

    // --- 1. Customer Order Confirmation Email (Isolated Try-Catch) ---
    try {
        if (customer && customer.email) {
            await resend.emails.send({
                from: 'Electromart <onboarding@resend.dev>',
                to: customer.email,
                subject: 'Order Confirmation - Electromart ⚡',
                html: `
                    <h2>Order Confirmed!</h2>
                    <p>Hi ${customer.name || 'Customer'}, thank you for shopping with Electromart.</p>
                    <p>Your order has been placed successfully and is currently being processed.</p>
                    <p><strong>Total Amount Paid:</strong> ₹${totalPrice}</p>
                    <p><strong>Delivery Address:</strong> ${customer.address || 'N/A'}</p>
                    <br/>
                    <p>We will notify you once your items are shipped!</p>
                `
            });
            console.log('✅ Customer Email Sent Successfully to:', customer.email);
        }
    } catch (customerEmailError) {
        // Resend testing domain restriction issue log
        console.error('⚠️ Customer Email Warning/Error:', customerEmailError.message || customerEmailError);
    }

    // --- 2. Admin Payment Verification & Order Alert Email (Isolated Try-Catch) ---
    try {
        const adminEmailData = {
            from: 'Electromart System <onboarding@resend.dev>',
            to: process.env.EMAIL_USER,
            subject: `🚨 New Order & Payment Alert (${paymentMethod}) from ${customer?.name || 'Customer'}`,
            html: `
                <h2>New Order Payment Details</h2>
                
                <h3>Customer Details:</h3>
                <ul>
                    <li><strong>Name:</strong> ${customer?.name || 'N/A'}</li>
                    <li><strong>Email:</strong> ${customer?.email || 'N/A'}</li>
                    <li><strong>Phone:</strong> ${customer?.phone || 'N/A'}</li>
                    <li><strong>Address:</strong> ${customer?.address || 'N/A'}</li>
                </ul>

                <h3>Payment Information:</h3>
                <ul>
                    <li><strong>Payment Method:</strong> ${paymentMethod}</li>
                    <li><strong>Total Amount:</strong> ₹${totalPrice}</li>
                    <li><strong>UTR / Transaction ID:</strong> <span style="color: blue; font-weight: bold;">${utr || 'N/A'}</span></li>
                </ul>

                <h3>Ordered Items:</h3>
                <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${itemListText}</pre>
            `
        };

        // Agar screenshot base64 format mein aati hai toh file attachment add karein
        if (screenshot) {
            adminEmailData.attachments = [
                {
                    filename: `payment_proof_${Date.now()}.png`,
                    content: screenshot.includes('base64,') ? screenshot.split('base64,')[1] : screenshot
                }
            ];
        }

        await resend.emails.send(adminEmailData);
        console.log('✅ Admin Notification Email Sent Successfully!');

        // Send Success Response to Frontend
        return res.status(200).json({ success: true, message: 'Order placed successfully!' });

    } catch (error) {
        console.error('❌ Critical Admin Email / Order Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to process order notification' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});