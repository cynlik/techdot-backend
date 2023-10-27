export enum EmailType {
	Welcome = "welcome",
	ResetPassword = "resetPassword",
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
};
