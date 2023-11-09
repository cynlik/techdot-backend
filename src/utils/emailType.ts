export enum EmailType {
	Welcome = "welcome",
	ResetPassword = "resetPassword",
	ForgetPassword = "forgetPassword",
	VerifyAccount = "verifyAccount",
	NewLocation = "newLocation",
}

export const emailContent = {
	[EmailType.Welcome]: {
		subject: "Bem-vindo ao TechDot",
		text: "Bem-vindo ao TechDot. Obrigado por se juntar a nós!",
	},
	[EmailType.ResetPassword]: {
		subject: "Redefinir Senha",
		text: "Você solicitou a redefinição de senha.",
	},
	[EmailType.ForgetPassword]: {
		subject: "Esqueceu Senha",
		text: (token: string) =>
		  `http://${process.env.HOST}:${process.env.PORT}/api/user/reset-password?token=${token}`,
	},
	[EmailType.VerifyAccount]: {
		subject: "Verificar Conta",
		text: (token: string) =>
		  `http://${process.env.HOST}:${process.env.PORT}/api/user/verify?token=${token}`,
	},
	[EmailType.NewLocation]: {
		subject: "Verificar Conta",
		text: (ip: string) =>
		  `Novo inicio de sessao a partir de uma localizaçao atraves do ip: ${ip}`,
	},
};
