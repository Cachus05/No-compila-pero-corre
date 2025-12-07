// app/api/recuperar-contrasena/solicitar/route.js
import { consulta } from '../../../lib/db';
import { enviarEmail } from '../../../../lib/email';

// Función para generar código de 6 dígitos
function generarCodigoVerificacion() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Email con código de verificación
const emailRecuperacion = (email, codigo, nombre) => {
  return {
    from: `"Free Market UTSC" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Código de recuperación - Free Market UTSC',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #e5e5e5;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: #1a1a1a;
            }
            .email-container {
              background: #2a2a2a;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 
                0 8px 32px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(73, 194, 179, 0.15);
            }
            .logo-section {
              text-align: center;
              padding: 40px 20px 30px;
              background: #2a2a2a;
            }
            .logo-section img {
              max-width: 150px;
              height: auto;
              filter: drop-shadow(0 4px 16px rgba(73, 194, 179, 0.4));
            }
            .header {
              background: linear-gradient(135deg, #49c2b3 0%, #3da89c 100%);
              color: #000000;
              padding: 35px 30px;
              text-align: center;
              position: relative;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(73, 194, 179, 0.3);
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              margin: 10px 0 0 0;
              color: #0a0a0a;
              font-size: 14px;
              font-weight: 500;
            }
            .content {
              background: #2a2a2a;
              padding: 35px 30px;
              color: #e5e5e5;
              border-top: 2px solid rgba(73, 194, 179, 0.3);
            }
            .content h2 {
              color: #49c2b3;
              margin-top: 0;
            }
            .codigo-box {
              background: rgba(73, 194, 179, 0.1);
              border: 2px solid #49c2b3;
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
            }
            .codigo {
              font-size: 42px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #49c2b3;
              font-family: 'Courier New', monospace;
            }
            .warning-box {
              margin-top: 20px;
              padding: 18px;
              background: rgba(255, 107, 53, 0.1);
              border-left: 4px solid #ff6b35;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding: 20px;
              color: #888;
              font-size: 12px;
              background: #222;
              border-radius: 0 0 12px 12px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="logo-section">
              <img src="https://raw.githubusercontent.com/Cachus05/No-compila-pero-corre/master/public/utsc-logo.png" alt="Free Market UTSC Logo" />
            </div>
            
            <div class="header">
              <h1>Recuperación de Contraseña</h1>
              <p>Código de verificación</p>
            </div>
            
            <div class="content">
              <h2>Hola${nombre ? ', ' + nombre : ''}</h2>
              
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Free Market UTSC.</p>
              
              <p>Tu código de verificación es:</p>
              
              <div class="codigo-box">
                <div class="codigo">${codigo}</div>
                <p style="color: #888; font-size: 14px; margin-top: 15px;">Este código expira en 15 minutos</p>
              </div>
              
              <p>Ingresa este código en la página de recuperación para continuar con el proceso.</p>
              
              <div class="warning-box">
                <strong style="color: #ff6b35;">Importante:</strong> Si no solicitaste este cambio, ignora este correo. Tu contraseña permanecerá segura.
              </div>
              
              <div style="margin-top: 20px; padding: 18px; background: rgba(255, 193, 7, 0.1); border-left: 4px solid #ffc107; border-radius: 4px;">
                <strong style="color: #ffc107;">Recuerda:</strong> 
                <p style="margin: 8px 0 0 0; color: #e5e5e5;">No compartas este código con nadie. Este código es confidencial y personal.</p>
              </div>
              
              <p style="margin-top: 30px; color: #888; font-size: 14px;">
                Este código solo puede usarse una vez y expirará en 15 minutos por seguridad.
              </p>
            </div>
            
            <div class="footer">
              <p>Este correo fue enviado a ${email}</p>
              <p>Free Market UTSC - Plataforma exclusiva para estudiantes de la UTSC</p>
              <p>&copy; ${new Date().getFullYear()} Free Market UTSC. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Recuperación de Contraseña - Free Market UTSC

Hola${nombre ? ', ' + nombre : ''},

Tu código de verificación es: ${codigo}

Este código expira en 15 minutos.

IMPORTANTE: No compartas este código con nadie. Este código es confidencial y personal.

Si no solicitaste este cambio, ignora este correo.

Free Market UTSC
    `.trim()
  };
};

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    console.log('Solicitud de recuperación para:', email);
    
    if (!email) {
      return Response.json({ 
        error: 'El email es obligatorio' 
      }, { status: 400 });
    }
    
    // Verificar si el usuario existe
    const usuarios = await consulta(
      'SELECT id, email, first_name FROM users WHERE email = ?',
      [email]
    );
    
    console.log('Usuarios encontrados:', usuarios.length);
    
    if (usuarios.length === 0) {
      // Por seguridad, no revelamos si el email existe o no
      return Response.json({ 
        mensaje: 'Si el correo existe, recibirás un código de verificación' 
      });
    }
    
    const usuario = usuarios[0];
    console.log('Usuario encontrado:', usuario.id, usuario.email);
    
    // Generar código de verificación
    const codigo = generarCodigoVerificacion();
    const expiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    
    console.log('Código generado:', codigo);
    console.log('Expira en:', expiracion);
    console.log('IMPORTANTE: No compartas este código con nadie. Este código es confidencial y personal.');
    
    // Guardar código en la base de datos
    try {
      // Primero eliminar códigos antiguos del usuario
      await consulta(
        'DELETE FROM password_reset_codes WHERE user_id = ?',
        [usuario.id]
      );
      
      console.log('Códigos antiguos eliminados');
      
      // Insertar el nuevo código
      await consulta(
        'INSERT INTO password_reset_codes (user_id, code, expires_at, used) VALUES (?, ?, ?, false)',
        [usuario.id, codigo, expiracion]
      );
      
      console.log('Código guardado en BD');
    } catch (dbError) {
      console.error('Error al guardar código en BD:', dbError);
      return Response.json({ 
        error: 'Error al guardar en la base de datos',
        detalles: dbError.message 
      }, { status: 500 });
    }
    
    // Enviar email con el código
    console.log('Enviando email...');
    const mailOptions = emailRecuperacion(email, codigo, usuario.first_name);
    const resultado = await enviarEmail(mailOptions);
    
    if (!resultado.success) {
      console.error('Error al enviar email:', resultado.error);
      return Response.json({ 
        error: 'Error al enviar el código de verificación' 
      }, { status: 500 });
    }
    
    console.log('Email enviado exitosamente');
    
    return Response.json({ 
      mensaje: 'Código de verificación enviado a tu correo',
      email: email 
    });
    
  } catch (error) {
    console.error('Error general al solicitar recuperación:', error);
    return Response.json({ 
      error: 'Error al procesar la solicitud',
      detalles: error.message 
    }, { status: 500 });
  }
}