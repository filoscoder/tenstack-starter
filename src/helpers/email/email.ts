import * as nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import CONFIG from "@/config";
import { EmailCTA, EmailContents } from "@/types/email/email";

export class Mail {
  private from = CONFIG.EMAIL.FROM;
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  private _contents!: string;
  private set contents({ name, body, cta }: EmailContents) {
    this._contents = /*html*/ `
        <html xmlns="http://www.w3.org/1999/xhtml">
        <body>
          <meta http-equiv="Content-Type" content="text/html; ">
          <style type="text/css">
            :root {
              color-scheme: light dark;
            }
        
            body {
              margin: 0;
              padding: 0;
              min-width: 100% !important;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              color-scheme: light dark;
            }
        
            .content {
              width: 100%;
              max-width: 65ch;
              margin: 0 auto;
              box-shadow: 0 0 5px #cacaca;
              border-radius: 8px;
            }
        
            #main {
              max-width: 75ch;
              margin: 0 auto;
            }
        
            #logo {
              text-align: center;
            }
        
            #logo img {
              margin: 1rem;
            }
        
            .cta {
              text-align: center;
            }
        
            .cta a {
              padding: 1rem;
              background-color: #efae42;
              color: white;
              text-decoration: none;
              border-radius: 8px;
            }
        
            a {
              word-break: break-all;
            }
            .muted {
              color: #777;
            }
        
            .footer {
              margin-top: 2rem;
              font-size: .85em;
            }
          </style>
        
          <div class="moz-text-html" lang="x-unicode">
            <table id="main" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tbody>
                <tr id="logo">
                  <td>
                    <img
                      src="http://casino-mex.com/favicon.ico"
                      alt="casino-mex.com" shrinktofit="true" width="100"
                      height="100">
                  </td>
                </tr>
                <tr>
                  <td>
                    <table class="content" cellspacing="0" cellpadding="0" border="0">
                      <tbody>
                        <tr>
                          <td style="padding: 20px">
                            <h2>Hola ${name} 👋</h2>
                            <br>
                            ${body}
                          </td>
                        </tr>
                        ${
                          cta &&
                          `<tr>
                            <td class="cta">
                              <br>
                              <br>
                              <a href="${cta.href}">
                                ${cta.name}
                              </a>
                            </td>
                          </tr>`
                        }
                        <tr>
                          <td style="padding: 20px">
                            <br>
                            <br>
                            Saludos!<br>
                            <br>
                            El equipo de casino-mex.com
                            ${
                              cta &&
                              `<br>
                               <br>
                              <span class="muted">
                                <small>
                                  Si el botón de arriba no funciona, copia y pega el siguiente enlace en tu navegador: <a href="${cta.href}">${cta.href}</a>
                                </small>
                              </span>`
                            }
                          </td>
                        </tr>
                      </tbody>
                    </table>
        
                    <table class="footer" cellspacing="0" cellpadding="0" border="0"
                      align="center">
                      <tbody>
                        <tr>
                          <td style="text-align: center">
        
                            Enviado desde <a
                              href="https://casino-mex.com">casino-mex.com</a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
        
        
        
          </div>
        
        </body>
        
        </html>`;
  }
  private subject!: string;

  constructor() {
    this.transporter = nodemailer.createTransport({
      //@ts-ignore
      host: CONFIG.EMAIL.HOST,
      port: CONFIG.EMAIL.PORT,
      secure: true,
      auth: {
        user: CONFIG.EMAIL.USER,
        pass: CONFIG.EMAIL.PASS,
      },
    });
  }

  compose(subject: string, name: string, body: string, cta?: EmailCTA): Mail {
    this.subject = subject;
    this.contents = { name, body, cta };

    return this;
  }

  async send(to: string): Promise<void> {
    if (!to || !this._contents) throw new TypeError();
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: this.subject,
      html: this._contents,
    });
  }
}
