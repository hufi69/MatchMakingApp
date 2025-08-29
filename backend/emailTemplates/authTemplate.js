

exports.emailVerifyTemplate = (user, body) => {
    return `
    <div style="background:#f8fafc;padding:40px 0;min-height:100vh;font-family:'Inter',Arial,sans-serif;color:#374151;">
      <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;padding:32px 24px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06);">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="font-size:28px;font-weight:700;margin:0;color:#111827;letter-spacing:-0.025em;">AESTHIRA</h1>
        </div>
        <h2 style="font-size:24px;font-weight:600;margin-bottom:16px;color:#111827;">Verify Your Email</h2>
        <p style="font-size:16px;margin-bottom:16px;color:#374151;line-height:1.5;">Hello <b>${user.firstName}</b>,</p>
        <p style="font-size:16px;margin-bottom:24px;color:#374151;line-height:1.5;">Thank you for registering with Aesthira! Please use the OTP below to verify your email address.</p>
        <div style="text-align:center;margin:32px 0;">
          <span style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:8px;color:#ffffff;background:#1677FF;padding:16px 32px;border-radius:8px;box-shadow:0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px 0 rgba(0,0,0,0.06);">${body.otp}</span>
        </div>
        <p style="font-size:14px;margin-bottom:8px;color:#6b7280;">This OTP will expire in <b>10 minutes</b>.</p>
        <p style="font-size:14px;margin-bottom:24px;color:#6b7280;">If you did not request this, please ignore this email.</p>
        <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
          <p style="font-size:14px;color:#6b7280;">Thank you,<br/><b style="color:#111827;">The Aesthira Team</b></p>
        </div>
      </div>
    </div>
    `
}
exports.twoFATemplate = (user, body) => {
  return `
  <div style="background:#f8fafc;padding:40px 0;min-height:100vh;font-family:'Inter',Arial,sans-serif;color:#374151;">
    <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;padding:32px 24px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06);">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="font-size:28px;font-weight:700;margin:0;color:#111827;letter-spacing:-0.025em;">AESTHIRA</h1>
      </div>
      <h2 style="font-size:24px;font-weight:600;margin-bottom:16px;color:#111827;">Two Factor Authentication</h2>
      <p style="font-size:16px;margin-bottom:16px;color:#374151;line-height:1.5;">Hello <b>${user.firstName}</b>,</p>
      <p style="font-size:16px;margin-bottom:24px;color:#374151;line-height:1.5;">Please use the OTP below to complete your sign in process.</p>
      <div style="text-align:center;margin:32px 0;">
        <span style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:8px;color:#ffffff;background:#1677FF;padding:16px 32px;border-radius:8px;box-shadow:0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px 0 rgba(0,0,0,0.06);">${body.otp}</span>
      </div>
      <p style="font-size:14px;margin-bottom:8px;color:#6b7280;">This OTP will expire in <b>10 minutes</b>.</p>
      <p style="font-size:14px;margin-bottom:24px;color:#6b7280;">If you did not request this, please ignore this email or contact support.</p>
      <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
        <p style="font-size:14px;color:#6b7280;">Thank you,<br/><b style="color:#111827;">The Aesthira Team</b></p>
      </div>
    </div>
  </div>
  `
}

exports.resetPasswordTemplate = (user, body) => {
    return `
    <div style="background:#f8fafc;padding:40px 0;min-height:100vh;font-family:'Inter',Arial,sans-serif;color:#374151;">
      <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;padding:32px 24px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06);">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="font-size:28px;font-weight:700;margin:0;color:#111827;letter-spacing:-0.025em;">AESTHIRA</h1>
        </div>
        <h2 style="font-size:24px;font-weight:600;margin-bottom:16px;color:#111827;">Reset Your Password</h2>
        <p style="font-size:16px;margin-bottom:16px;color:#374151;line-height:1.5;">Hello <b>${user.firstName}</b>,</p>
        <p style="font-size:16px;margin-bottom:24px;color:#374151;line-height:1.5;">You (or someone else) requested a password reset for your Aesthira account. Please use the OTP below to reset your password.</p>
        <div style="text-align:center;margin:32px 0;">
          <span style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:8px;color:#ffffff;background:#1677FF;padding:16px 32px;border-radius:8px;box-shadow:0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px 0 rgba(0,0,0,0.06);">${body.otp}</span>
        </div>
        <p style="font-size:14px;margin-bottom:8px;color:#6b7280;">This OTP will expire in <b>10 minutes</b>.</p>
        <p style="font-size:14px;margin-bottom:24px;color:#6b7280;">If you did not request a password reset, please ignore this email.</p>
        <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
          <p style="font-size:14px;color:#6b7280;">Thank you,<br/><b style="color:#111827;">The Aesthira Team</b></p>
        </div>
      </div>
    </div>
    `
}