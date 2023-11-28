export enum EmailType {
	Welcome = "welcome",
	ForgetPassword = "forgetPassword",
	VerifyAccount = "verifyAccount",
	NewLocation = "newLocation",
}

export const emailContent = {
	[EmailType.Welcome]: {
		subject: "Bem-vindo ao TechDot",
		html: `
		  <html>
			<body style="font-family: Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0;">
			  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f2f2f2; margin: 0; padding: 0;">
				<tr>
				  <td align="center">
					<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
					  <tr>
						<td style="padding: 20px;">
						  <img src="https://picsum.photos/600/200" alt="Logo Techdot" style="display: block; width: 100%; border-top-left-radius: 8px; border-top-right-radius: 8px;">
						  <h1 style="color: #333333; margin: 20px 0; font-size: 28px; text-align: center;">Bem-vindo à Techdot</h1>
						  <p style="color: #666666; margin: 20px 0; line-height: 1.6; text-align: center;">Olá,</p>
						  <p style="color: #666666; margin: 20px 0; line-height: 1.6; text-align: center;">Obrigado por se registrar na Techdot! Estamos felizes por tê-lo conosco.</p>
						  <p style="margin: 20px 0; text-align: center;">
							<a href="" style="display: inline-block; padding: 15px 35px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 25px; font-size: 18px; border: 2px solid #007bff; transition: background-color 0.3s ease;">Comece a explorar</a>
						  </p>
						  <p style="color: #666666; margin: 20px 0; line-height: 1.6; text-align: center;">Se precisar de ajuda, não hesite em nos contatar.</p>
						  <p style="color: #999999; padding: 20px 0; text-align: center;">Atenciosamente, Equipe Techdot</p>
						</td>
					  </tr>
					</table>
				  </td>
				</tr>
			  </table>
			</body>
		  </html>
		`,
	},
	[EmailType.ForgetPassword]: {
		subject: "Esqueceu Senha",
		html: (token: string) => `
		  <html>
			<body style="font-family: Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0;">
			  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f2f2f2; margin: 0; padding: 0;">
				<tr>
				  <td align="center">
					<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
					  <tr>
						<td style="padding: 20px;">
						  <img src="https://picsum.photos/600/200" alt="Logo Techdot" style="display: block; width: 100%; border-top-left-radius: 8px; border-top-right-radius: 8px;">
						  <h1 style="color: #333333; margin: 20px 0; font-size: 28px; text-align: center;">Password Esquecida </h1>
						  <p style="color: #666666; margin: 20px 0; line-height: 1.6; text-align: center;">Olá,</p>
						  <p style="color: #666666; margin: 20px 0; line-height: 1.6; text-align: center;">Para repor a password, clique no botão abaixo:</p>
						  <p style="margin: 20px 0; text-align: center;">
							<a href="http://${process.env.HOST}:${process.env.PORT}/api/user/reset-password?token=${token}" style="display: inline-block; padding: 15px 35px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 25px; font-size: 18px; border: 2px solid #007bff; transition: background-color 0.3s ease;">Repor Password</a>
						  </p>
						  <p style="color: #666666; margin: 20px 0; line-height: 1.6; text-align: center;">Se o botão não funcionar, você também pode clicar <a href="http://${process.env.HOST}:${process.env.PORT}/api/user/reset-password?token=${token}" style="color: #007bff; text-decoration: none;">aqui</a></p>
						  <p style="color: #999999; padding: 20px 0; text-align: center;">Atenciosamente, Equipe Techdot</p>
						</td>
					  </tr>
					</table>
				  </td>
				</tr>
			  </table>
			</body>
		  </html>
		`,
	},
	[EmailType.VerifyAccount]: {
		subject: "Verificar Conta",
		html: (token: string) => `
		  <html>
			<body style="font-family: Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0;">
			  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f2f2f2; margin: 0; padding: 0;">
				<tr>
				  <td align="center">
					<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
					  <tr>
						<td style="padding: 20px;">
						  <img src="https://picsum.photos/600/200" alt="Logo Techdot" style="display: block; width: 100%; border-top-left-radius: 8px; border-top-right-radius: 8px;">
						  <h1 style="color: #333333; margin: 20px 0; font-size: 28px; text-align: center;">Verificar Conta</h1>
						  <p style="color: #666666; margin: 20px 0; line-height: 1.6; text-align: center;">Olá,</p>
						  <p style="color: #666666; margin: 20px 0; line-height: 1.6; text-align: center;">Clique no botão abaixo para verificar sua conta:</p>
						  <p style="margin: 20px 0; text-align: center;">
							<a href="http://${process.env.HOST}:${process.env.PORT}/api/user/verify?token=${token}" style="display: inline-block; padding: 15px 35px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 25px; font-size: 18px; border: 2px solid #007bff; transition: background-color 0.3s ease;">Verificar Conta</a>
						  </p>
						  <p style="color: #666666; margin: 20px 0; line-height: 1.6; text-align: center;">Se o botão não funcionar, você também pode clicar <a href="http://${process.env.HOST}:${process.env.PORT}/api/user/verify?token=${token}" style="color: #007bff; text-decoration: none;">aqui</a></p>
						  <p style="color: #999999; padding: 20px 0; text-align: center;">Atenciosamente, Equipe Techdot</p>
						</td>
					  </tr>
					</table>
				  </td>
				</tr>
			  </table>
			</body>
		  </html>
		`,
	},
	[EmailType.NewLocation]: {
		subject: "Novo início de sessão",
		html: (ip: string) => `
		  <html>
			<body style="font-family: Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0;">
			  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f2f2f2; margin: 0; padding: 0;">
				<tr>
				  <td align="center">
					<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
					  <tr>
						<td style="padding: 20px;">
						  <img src="https://picsum.photos/600/200" alt="Logo Techdot" style="display: block; width: 100%; border-top-left-radius: 8px; border-top-right-radius: 8px;">
						  <h1 style="color: #333333; margin: 20px 0; font-size: 28px; text-align: center;">Novo Início de Sessão</h1>
						  <p style="color: #666666; margin: 20px 0; line-height: 1.6; text-align: center;">Olá,</p>
						  <p style="color: #666666; margin: 20px 0; line-height: 1.6; text-align: center;">Detetamos um novo início de sessão a partir da seguinte localização:</p>
						  <p style="color: #666666; margin: 20px 0; line-height: 1.6; text-align: center;">Localização através do IP: ${ip}</p>
						  <p style="color: #999999; padding: 20px 0; text-align: center;">Atenciosamente, Equipe Techdot</p>
						</td>
					  </tr>
					</table>
				  </td>
				</tr>
			  </table>
			</body>
		  </html>
		`,
	},
};
