import nodemailer from 'nodemailer'

const FROM_EMAIL = process.env.FROM_EMAIL || 'Carta Menú <noreply@tudominio.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true si usas puerto 465 (SSL), false para 587 (STARTTLS)
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!, // tu clave de aplicación de 16 dígitos
      },
    })
  }
  return transporter
}

async function sendMail(mailOptions: nodemailer.SendMailOptions) {
  const transport = getTransporter()
  return await transport.sendMail({
    from: FROM_EMAIL,
    ...mailOptions,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password/${token}`

  const html = `<!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 600px; margin: 0 auto; border-collapse: collapse; background-color: #171717; border-radius: 12px; border: 1px solid #262626; overflow: hidden;">
          <tr>
            <td align="center" style="padding: 32px 24px; background-color: #f59e0b;">
              <h1 style="margin: 0; color: #0a0a0a; font-size: 24px; font-weight: 800;">Carta Menú</h1>
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
      </body>
    </html>`

  try {
    await sendMail({
      to: email,
      subject: 'Recupera tu contraseña - Carta Menú',
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Nodemailer password reset error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function sendWelcomeEmail(email: string, restaurantName: string) {
  const html = `<!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 600px; margin: 0 auto; border-collapse: collapse; background-color: #171717; border-radius: 12px; border: 1px solid #262626; overflow: hidden;">
          <tr>
            <td align="center" style="padding: 32px 24px; background-color: #f59e0b;">
              <h1 style="margin: 0; color: #0a0a0a; font-size: 24px; font-weight: 800;">Carta Menú</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 20px; font-weight: 700;">¡Bienvenido, ${restaurantName}!</h2>
              <p style="margin: 0 0 24px 0; color: #a3a3a3; font-size: 14px; line-height: 1.6;">
                Tu restaurante ha sido creado con éxito. Ya podés ingresar al panel de administración para cargar tus productos, categorías y personalizar los colores de tu menú digital.
              </p>
              <table role="presentation" width="100%" style="border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}/admin/login" style="display: inline-block; background-color: #f59e0b; color: #0a0a0a; text-decoration: none; font-weight: 700; padding: 14px 28px; border-radius: 8px; font-size: 14px;">
                      Ir al panel de administración
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0 0; color: #a3a3a3; font-size: 12px; line-height: 1.6;">
                Tu menú público estará disponible en: <strong>${APP_URL}/[tu-slug]</strong>
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
      </body>
    </html>`

  try {
    await sendMail({
      to: email,
      subject: `¡Tu menú está listo! Bienvenido a Carta Menú, ${restaurantName}`,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Nodemailer welcome email error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function sendEmailVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email/${token}`

  const html = `<!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 600px; margin: 0 auto; border-collapse: collapse; background-color: #171717; border-radius: 12px; border: 1px solid #262626; overflow: hidden;">
          <tr>
            <td align="center" style="padding: 32px 24px; background-color: #f59e0b;">
              <h1 style="margin: 0; color: #0a0a0a; font-size: 24px; font-weight: 800;">Carta Menú</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 20px; font-weight: 700;">Confirma tu correo electrónico</h2>
              <p style="margin: 0 0 24px 0; color: #a3a3a3; font-size: 14px; line-height: 1.6;">
                Casi estás listo. Para activar tu cuenta de administrador en Carta Menú, confirma tu dirección de correo haciendo clic en el botón de abajo:
              </p>
              <table role="presentation" width="100%" style="border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" style="display: inline-block; background-color: #f59e0b; color: #0a0a0a; text-decoration: none; font-weight: 700; padding: 14px 28px; border-radius: 8px; font-size: 14px;">
                      Confirmar mi cuenta
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0 0; color: #a3a3a3; font-size: 12px; line-height: 1.6;">
                Este enlace expira en 24 horas. Si no creaste esta cuenta, puedes ignorar este mensaje.
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
      </body>
    </html>`

  try {
    await sendMail({
      to: email,
      subject: 'Confirma tu cuenta - Carta Menú',
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Nodemailer email verification error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}