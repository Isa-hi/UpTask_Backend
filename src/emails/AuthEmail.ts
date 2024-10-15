import { transporter } from "../config/nodemailer"

type authEmailProps = {
    email: string;
    user: string;
    token: string;
}

export class AuthEmail {
    static sendVerificationEmail = async ( user : authEmailProps) => {
        await transporter.sendMail({
            from: "UpTask <Admin@uptask.com>",
            to: user.email,
            subject: "Email verification",
            html: `<p>Hello ${user.user},</p>
            <p>Thank you for creating an account with UpTask. Please verify your email by clicking the link below:</p>
            <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Click here and enter your token</a>
            <p>Your verification token is: <b>${user.token}</b></p>
            <p>This token will expire in 10 minutes.</p>`,
          })
    }

    static sendPasswordResetEmail = async ( user : authEmailProps) => {
        await transporter.sendMail({
            from: "UpTask <Admin@uptask.com>",
            to: user.email,
            subject: "Password reset",
            html: `<p>Hello ${user.user},</p>
            <p>It seems you have requested a password reset. Please click the link below to reset your password:</p>
            <a href="${process.env.FRONTEND_URL}/auth/new-password">Click here and enter your token</a>
            <p>Your password reset token is: <b>${user.token}</b></p>
            <p>This token will expire in 10 minutes.</p>`,
            })
    }
}