import nodemailer from 'nodemailer';

// Configurar el transporter de Nodemailer
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Plantilla de email de bienvenida
export const emailBienvenida = (nombre, email, userType) => {
  const tipoUsuario = userType === 'freelancer' ? 'Freelancer' : 'Cliente';
  
  return {
    from: `"Free Market UTSC" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Bienvenido a Free Market UTSC',
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
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: radial-gradient(ellipse at top, 
                rgba(255, 255, 255, 0.15) 0%, 
                transparent 70%
              );
              pointer-events: none;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
              position: relative;
              z-index: 1;
            }
            .header p {
              margin: 10px 0 0 0;
              color: #0a0a0a;
              font-size: 14px;
              position: relative;
              z-index: 1;
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
              text-shadow: 0 2px 12px rgba(73, 194, 179, 0.4);
            }
            .content h3 {
              color: #49c2b3;
              margin-top: 25px;
              margin-bottom: 15px;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background: linear-gradient(135deg, #49c2b3 0%, #3da89c 100%);
              color: #ff6b35;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: bold;
              box-shadow: 0 4px 16px rgba(73, 194, 179, 0.4);
              transition: all 0.3s ease;
            }
            .button:hover {
              box-shadow: 0 6px 20px rgba(73, 194, 179, 0.6);
              transform: translateY(-2px);
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
            .badge {
              display: inline-block;
              padding: 8px 18px;
              background: linear-gradient(135deg, #49c2b3 0%, #3da89c 100%);
              color: #000000;
              border-radius: 20px;
              font-size: 14px;
              margin-top: 15px;
              font-weight: bold;
              box-shadow: 0 4px 12px rgba(73, 194, 179, 0.4);
            }
            .tip-box {
              margin-top: 30px;
              padding: 18px;
              background: rgba(73, 194, 179, 0.1);
              border-left: 4px solid #49c2b3;
              border-radius: 4px;
              box-shadow: 0 0 20px rgba(73, 194, 179, 0.1);
            }
            ul {
              color: #d1d5db;
            }
            ul li {
              margin: 10px 0;
              padding-left: 5px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="logo-section">
              <img src="https://raw.githubusercontent.com/Cachus05/No-compila-pero-corre/master/public/utsc-logo.png" alt="Free Market UTSC Logo" />
            </div>
            
            <div class="header">
              <h1>Bienvenido a Free Market UTSC</h1>
              <p>La plataforma exclusiva para freelancers de la UTSC</p>
            </div>
            
            <div class="content">
              <h2>Hola, ${nombre}</h2>
              
              <p>Nos emociona tenerte en nuestra comunidad. Tu cuenta como <strong>${tipoUsuario}</strong> ha sido creada exitosamente.</p>
              
              <div style="text-align: center;">
                <span class="badge">Cuenta de ${tipoUsuario}</span>
              </div>
              
              <h3>Que sigue</h3>
              <ul>
                ${userType === 'freelancer' ? `
                  <li>Completa tu perfil profesional</li>
                  <li>Publica tus servicios</li>
                  <li>Conecta con clientes de la UTSC</li>
                  <li>Empieza a ganar</li>
                ` : `
                  <li>Explora servicios disponibles</li>
                  <li>Encuentra el freelancer perfecto</li>
                  <li>Publica tus proyectos</li>
                  <li>Contrata talento de la UTSC</li>
                `}
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard" class="button">
                  Ir a mi Dashboard
                </a>
              </div>
              
              <div class="tip-box">
                <strong style="color: #49c2b3;">Consejo:</strong> Completa tu perfil al 100% para aumentar tus posibilidades de exito en la plataforma.
              </div>
              
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              
              <p>Mucho exito</p>
              <p><strong>El equipo de Free Market UTSC</strong></p>
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
Bienvenido a Free Market UTSC, ${nombre}

Tu cuenta como ${tipoUsuario} ha sido creada exitosamente.

${userType === 'freelancer' 
  ? 'Ahora puedes completar tu perfil, publicar tus servicios y conectar con clientes de la UTSC.'
  : 'Ahora puedes explorar servicios, encontrar freelancers y publicar tus proyectos.'}

Visita tu dashboard en: ${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard

Mucho exito
El equipo de Free Market UTSC
    `.trim()
  };
};

// Función para enviar email
export async function enviarEmail(mailOptions) {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar email:', error);
    return { success: false, error: error.message };
  }
}