# 📧 Supabase Edge Function Setup for Email Sending

This guide explains how to set up the Supabase Edge Function to send order confirmation emails.

---

## 🎯 Why Edge Function?

Since this is a React frontend app, we can't directly send SMTP emails from the browser for security reasons. The Edge Function runs on Supabase's servers and can securely send emails using your SMTP credentials.

---

## 🛠️ Setup Steps

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Deploy the Edge Function**:
   ```bash
   supabase functions deploy send-email
   ```

### Option 2: Manual Setup via Supabase Dashboard

1. **Go to Supabase Dashboard** → **Edge Functions**
2. **Click "Create a new function"**
3. **Name it:** `send-email`
4. **Copy the code from** `supabase/functions/send-email/index.ts`
5. **Paste it into the function editor**
6. **Click "Deploy"**

---

## ⚙️ Alternative: Use a Simple Backend Service

If Edge Functions aren't available, you can create a simple Node.js backend:

### Create `server/email-server.js`:

```javascript
import express from 'express';
import nodemailer from 'nodemailer';

const app = express();
app.use(express.json());

app.post('/api/send-email', async (req, res) => {
  const { to, subject, html, smtp_settings } = req.body;

  const transporter = nodemailer.createTransport({
    host: smtp_settings.smtp_host,
    port: parseInt(smtp_settings.smtp_port || '587'),
    secure: smtp_settings.smtp_port === '465',
    auth: {
      user: smtp_settings.smtp_username,
      pass: smtp_settings.smtp_password,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${smtp_settings.from_name}" <${smtp_settings.from_email}>`,
      to,
      subject,
      html,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Email server running on port 3001');
});
```

Then set `VITE_API_URL=http://your-backend-url:3001` in your environment variables.

---

## ✅ Testing

After setup, test by completing a purchase. The email should be sent automatically if:
- Email settings are configured in admin dashboard
- `send_order_confirmation_emails` is set to `true`
- Edge Function is deployed (or backend is running)

---

## 🚨 Troubleshooting

- **"Edge Function not found"**: Deploy the function using Supabase CLI or Dashboard
- **"Email not sending"**: Check SMTP settings in admin dashboard
- **"CORS errors"**: Ensure CORS headers are set in Edge Function
- **"SMTP authentication failed"**: Verify Zoho App Password is correct

---

**The email service will automatically use the Edge Function if available, or fall back to a backend API if configured.**

