import { supabase } from '../lib/supabaseClient';

interface EmailSettings {
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  use_tls: boolean;
}

interface OrderEmailData {
  to: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    title: string;
    license?: string;
    price: number;
  }>;
  total: number;
  hasPhysicalItems: boolean;
  shippingAddress?: any;
  downloadLinks?: Array<{ title: string; url: string }>;
}

/**
 * Send order confirmation email using SMTP settings from database
 * This function calls a Supabase Edge Function to send the email
 */
export const sendOrderConfirmationEmail = async (emailData: OrderEmailData): Promise<boolean> => {
  try {
    // Get email settings from database
    const { data: emailSettingsData, error: settingsError } = await supabase
      .from('email_settings')
      .select('setting_name, setting_value')
      .in('setting_name', [
        'send_order_confirmation_emails',
        'smtp_host',
        'smtp_port',
        'smtp_username',
        'smtp_password',
        'from_email',
        'from_name',
        'use_tls'
      ])
      .eq('is_active', true);

    if (settingsError) {
      console.error('Error fetching email settings:', settingsError);
      return false;
    }

    // Check if email sending is enabled
    const sendEmailEnabled = emailSettingsData?.find(
      s => s.setting_name === 'send_order_confirmation_emails'
    )?.setting_value === 'true';

    if (!sendEmailEnabled) {
      console.log('Order confirmation emails are disabled in settings');
      return false;
    }

    // Build email settings object
    const settings: Partial<EmailSettings> = {};
    emailSettingsData?.forEach(setting => {
      if (setting.setting_name === 'smtp_host') settings.smtp_host = setting.setting_value || '';
      if (setting.setting_name === 'smtp_port') settings.smtp_port = setting.setting_value || '587';
      if (setting.setting_name === 'smtp_username') settings.smtp_username = setting.setting_value || '';
      if (setting.setting_name === 'smtp_password') settings.smtp_password = setting.setting_value || '';
      if (setting.setting_name === 'from_email') settings.from_email = setting.setting_value || '';
      if (setting.setting_name === 'from_name') settings.from_name = setting.setting_value || 'Weedhead Beats';
      if (setting.setting_name === 'use_tls') settings.use_tls = setting.setting_value === 'true';
    });

    // Validate required settings
    if (!settings.smtp_host || !settings.smtp_username || !settings.smtp_password || !settings.from_email) {
      console.error('Missing required email settings');
      return false;
    }

    // Generate email HTML
    const emailHtml = generateOrderEmailHTML(emailData);

    // Call Supabase Edge Function to send email
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: emailData.to,
          subject: `Order Confirmation - ${emailData.orderNumber}`,
          html: emailHtml,
          smtp_settings: settings
        }
      });

      if (error) {
        console.error('Error sending email via Edge Function:', error);
        // Fallback: Try direct API call if Edge Function doesn't exist
        return await sendEmailViaAPI(emailData, settings as EmailSettings);
      }

      console.log('✅ Order confirmation email sent successfully');
      return true;
    } catch (edgeFunctionError: any) {
      console.warn('Edge Function not available or failed:', edgeFunctionError?.message || edgeFunctionError);
      // Fallback: Try direct API call if Edge Function doesn't exist
      return await sendEmailViaAPI(emailData, settings as EmailSettings);
    }
  } catch (error) {
    console.error('Error in sendOrderConfirmationEmail:', error);
    return false;
  }
};

/**
 * Fallback: Send email via direct API call (requires backend endpoint)
 * For now, we'll log the email details so you can see what would be sent
 */
const sendEmailViaAPI = async (emailData: OrderEmailData, settings: EmailSettings): Promise<boolean> => {
  try {
    // Check if API URL is configured
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (!apiUrl) {
      console.warn('⚠️ Email API URL not configured. Email details:', {
        to: emailData.to,
        subject: `Order Confirmation - ${emailData.orderNumber}`,
        orderNumber: emailData.orderNumber,
        total: emailData.total
      });
      console.warn('💡 To enable email sending, either:');
      console.warn('   1. Deploy the Supabase Edge Function (see EDGE_FUNCTION_SETUP.md)');
      console.warn('   2. Set up a backend API and configure VITE_API_URL');
      return false;
    }

    const response = await fetch(`${apiUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailData.to,
        subject: `Order Confirmation - ${emailData.orderNumber}`,
        html: generateOrderEmailHTML(emailData),
        smtp_settings: settings
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending email via API:', error);
    return false;
  }
};

/**
 * Generate HTML email template for order confirmation
 */
const generateOrderEmailHTML = (data: OrderEmailData): string => {
  const itemsList = data.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title} ${item.license ? `(${item.license})` : ''}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const downloadSection = data.downloadLinks && data.downloadLinks.length > 0 ? `
    <div style="margin: 20px 0;">
      <h3 style="color: #0D5F11;">Digital Downloads</h3>
      ${data.downloadLinks.map(link => `
        <p><a href="${link.url}" style="color: #0D5F11; text-decoration: none;">Download ${link.title}</a></p>
      `).join('')}
    </div>
  ` : '';

  const shippingSection = data.hasPhysicalItems && data.shippingAddress ? `
    <div style="margin: 20px 0;">
      <h3 style="color: #0D5F11;">Shipping Information</h3>
      <p>${data.shippingAddress.name}<br>
      ${data.shippingAddress.street}<br>
      ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zip}<br>
      ${data.shippingAddress.country}</p>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0D5F11; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        .total { font-size: 18px; font-weight: bold; color: #0D5F11; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>WEEDHEAD BEATS</h1>
          <h2>Order Confirmation</h2>
        </div>
        <div class="content">
          <p>Thank you for your purchase!</p>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Order Date:</strong> ${data.orderDate}</p>
          
          <h3>Order Summary</h3>
          <table>
            ${itemsList}
            <tr>
              <td style="padding: 10px; border-top: 2px solid #0D5F11;"><strong>Total</strong></td>
              <td style="padding: 10px; border-top: 2px solid #0D5F11; text-align: right;" class="total">$${data.total.toFixed(2)}</td>
            </tr>
          </table>
          
          ${downloadSection}
          ${shippingSection}
          
          <p>If you have any questions, please contact us at support@weedheadbeats.com</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Weedhead Beats. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

