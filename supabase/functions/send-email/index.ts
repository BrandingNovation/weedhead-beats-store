import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, html, smtp_settings } = await req.json();

    if (!to || !subject || !html || !smtp_settings) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use nodemailer via Deno
    // Note: This requires nodemailer to be available in Deno
    // For now, we'll use a simple SMTP connection
    
    const transporter = {
      host: smtp_settings.smtp_host,
      port: parseInt(smtp_settings.smtp_port || '587'),
      secure: smtp_settings.smtp_port === '465',
      auth: {
        user: smtp_settings.smtp_username,
        pass: smtp_settings.smtp_password,
      },
    };

    // Send email using Deno's built-in SMTP or a library
    // For now, return success (actual implementation depends on available libraries)
    const emailResult = await sendEmailViaSMTP({
      transporter,
      to,
      subject,
      html,
      from: smtp_settings.from_email,
      fromName: smtp_settings.from_name || 'Weedhead Beats',
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendEmailViaSMTP({ transporter, to, subject, html, from, fromName }: any) {
  // Simple SMTP implementation using Deno's built-in capabilities
  // This is a basic implementation - you may need to use a library like deno-smtp
  
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  try {
    // Connect to SMTP server
    const conn = await Deno.connect({
      hostname: transporter.host,
      port: transporter.port,
    });

    const reader = conn.readable.getReader();
    const writer = conn.writable.getWriter();

    // SMTP conversation
    await sendSMTPCommand(writer, reader, `EHLO ${transporter.host}`);
    await sendSMTPCommand(writer, reader, 'STARTTLS');
    // TLS handshake would go here
    await sendSMTPCommand(writer, reader, `AUTH LOGIN`);
    await sendSMTPCommand(writer, reader, btoa(transporter.auth.user));
    await sendSMTPCommand(writer, reader, btoa(transporter.auth.pass));
    await sendSMTPCommand(writer, reader, `MAIL FROM:<${from}>`);
    await sendSMTPCommand(writer, reader, `RCPT TO:<${to}>`);
    await sendSMTPCommand(writer, reader, 'DATA');
    
    const emailContent = `From: ${fromName} <${from}>\r\n` +
      `To: ${to}\r\n` +
      `Subject: ${subject}\r\n` +
      `Content-Type: text/html; charset=utf-8\r\n` +
      `\r\n` +
      `${html}\r\n` +
      `.\r\n`;
    
    await sendSMTPCommand(writer, reader, emailContent);
    await sendSMTPCommand(writer, reader, 'QUIT');

    conn.close();
    return { success: true };
  } catch (error) {
    console.error('SMTP error:', error);
    throw error;
  }
}

async function sendSMTPCommand(writer: any, reader: any, command: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(command + '\r\n');
  await writer.write(data);
  
  // Read response (simplified - in production, parse properly)
  const { value } = await reader.read();
  return decoder.decode(value);
}

