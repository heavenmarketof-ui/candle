# Candle Sign — publicação protegida (custo zero)

## Situação
- Formulário público: `/contrato/` (publicado na branch main).
- Painel administrativo: `/admin/contratos/` (branch feature/candle-sign-mvp, **não publicar antes da proteção**).
- A interface administrativa é apenas demonstrativa: não há autenticação própria, banco de dados, cadastro persistente ou armazenamento de PDFs.

## Antes de publicar o painel
1. Entrar na conta Cloudflare que controla `candle-f4i.pages.dev`.
2. No Cloudflare Zero Trust, criar uma aplicação **Access > Applications > Add an application > Self-hosted** (a nomenclatura pode variar).
3. Proteger o hostname `candle-f4i.pages.dev` e o caminho `/admin/*` com política **Allow** somente para o e-mail administrativo da Candle, usando One-time PIN (OTP) ou outro método compatível com o plano gratuito.
4. Confirmar que a política cobre todos os arquivos e subcaminhos em `/admin/`, inclusive CSS e JavaScript. Não confiar apenas em `noindex` ou em um menu oculto.
5. Testar em janela anônima: `/contrato/` permanece público; `/admin/contratos/` exige autenticação; e-mails não autorizados não acessam.
6. Somente após os testes, publicar o painel na branch main. Verificar se a proteção está aplicada também a eventuais URLs de preview do Pages.

**Atenção:** proteção do caminho por Cloudflare Access não transforma HTML estático em sistema de gestão de dados. Para dados pessoais e contratos, não armazenar em GitHub público, localStorage ou arquivos no diretório do Pages. Arquivar PDFs assinados em Drive privado, com permissões e retenção apropriadas. O formulário público encaminha dados via WhatsApp após confirmação do cliente; não registra automaticamente as respostas.

## Processo de assinatura
1. Receber cadastro público via WhatsApp.
2. Completar e revisar juridicamente o contrato final.
3. Assinar o PDF no https://assinador.iti.br/ e solicitar a assinatura da outra parte.
4. Validar o PDF final no https://validar.iti.gov.br/.
5. Arquivar o arquivo digital original em pasta privada.

## Checklist de aceite
- [ ] Política Cloudflare Access configurada pelo titular da conta.
- [ ] Usuário não autorizado bloqueado.
- [ ] Usuário autorizado consegue entrar.
- [ ] Formulário público segue funcionando.
- [ ] Nenhum dado real em GitHub, Cloudflare Pages ou frontend.
- [ ] Modelo contratual revisado antes da assinatura.
