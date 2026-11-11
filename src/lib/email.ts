import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${token}`

  const { data, error } = await resend.emails.send({
    from: 'Carta Menú <onboarding@resend.dev>',
    to: [email],
    subject: 'Recupera tu contraseña - Carta Menú',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 0;">
          <table role="presentation" width="100%" style="max-width: 600px; margin: 0 auto; padding: 40px 20px; border-collapse: collapse;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 600px; background-color: #171717; border-radius: 12px; border: 1px solid #262626; overflow: hidden;">
                  <tr>
                    <td align="center" style="padding: 32px 24px; background-color: #f59e0b;">
                      <h1 style="margin: 0; color: #0a0a0a; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Carta Menú</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 24px;">
                      <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 20px; font-weight: 700;">Recupera tu contraseña</h2>
                      <p style="margin: 0 0 24px 0; color: #a3a3a3; font-size: 14px; line-height: 1.6;">
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta de administrador en Carta Menú.
                      </p>
                      <table role="presentation" width="100%" style="border-collapse: collapse;">
                        <tr>
                          <td align="center">
                            <a href="${resetUrl}" style="display: inline-block; background-color: #f59e0b; color: #0a0a0a; text-decoration: none; font-weight: 700; padding: 14px 28px; border-radius: 8px; font-size: 14px;">
                              Restablecer contraseña
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 24px 0 0 0; color: #a3a3a3; font-size: 12px; line-height: 1.6;">
                        Este enlace expira en 1 hora. Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 24px; color: #737373; font-size: 11px;">
                      Carta Menú - Menús digitales para restaurantes<br>
                      Este es un mensaje automático, por favor no respondas a este correo.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })

  if (error) {
    console.error('Resend error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}