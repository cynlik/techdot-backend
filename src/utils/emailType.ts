export enum EmailType {
	Welcome = "welcome",
	ResetPassword = "resetPassword",
	ForgetPassword = "forgetPassword",
	VerifyAccount = "verifyAccount",
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
		text: "Você solicitou o esquecimento de senha.",
	},
	[EmailType.VerifyAccount]: {
		subject: "Verificar Conta",
		text: (token: string) =>
		  `http://localhost:5173/user/verify?token=${token}`,
	},
};
