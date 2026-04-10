export const getOtpRegisterTemplate = (otp: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify your email</title>
</head>

<body style="margin:0; padding:0; background-color:#f7f7f9; font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

  <!-- Preheader (hidden preview text) -->
  <span style="display:none; opacity:0; color:transparent; height:0; width:0;">
    Your Serenphea verification code is ${otp}
  </span>

  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px; background-color:#f7f7f9;">
    <tr>
      <td align="center">

        <!-- Container -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 16px;">
              <h2 style="margin:0; font-size:22px; color:#222;">Serenphéa</h2>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none; border-top:1px solid #eee;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px; font-size:22px; color:#222;">
                Verify your email
              </h1>

              <p style="margin:0 0 20px; color:#555; font-size:15px; line-height:1.6;">
                Welcome to Serenphéa. Please use the verification code below to complete your registration.
              </p>

              <!-- OTP Box -->
              <div style="text-align:center; margin:28px 0;">
                <span style="
                  display:inline-block;
                  font-size:30px;
                  font-weight:bold;
                  letter-spacing:10px;
                  color:#111;
                  background:#f4f4f6;
                  padding:16px 24px;
                  border-radius:8px;
                  border:1px solid #e5e5e5;
                ">
                  ${otp}
                </span>
              </div>

              <p style="margin:0 0 10px; color:#555; font-size:14px;">
                This code will expire in <strong>15 minutes</strong>.
              </p>

              <!-- Security note -->
              <p style="margin:16px 0 0; color:#888; font-size:13px; line-height:1.5;">
                For your security, never share this code with anyone. Serenphéa will never ask for your verification code.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;">
              <hr style="border:none; border-top:1px solid #eee; margin-bottom:16px;" />

              <p style="margin:0; font-size:12px; color:#999; text-align:center;">
                © 2026 Serenphéa, Inc.<br/>
                Explore the world, your way.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
