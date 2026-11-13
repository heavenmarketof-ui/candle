# Candle Admin — acesso com usuário e senha

## Como o novo acesso funciona
- A página de login fica em `/admin/login/`.
- O usuário e a senha são definidos pelo responsável no primeiro acesso; a senha nunca deve ser enviada por mensagem ou incluída no repositório.
- A senha é armazenada no D1 como derivação PBKDF2-SHA-256 com salt aleatório; o cookie de sessão é HttpOnly, Secure e SameSite=Lax.
- As sessões expiram em 7 dias. O botão “Sair” encerra a sessão.
- As APIs administrativas validam a sessão no servidor. O painel não confia em uma senha ou indicador guardado no navegador.
- O cadastro inicial só funciona enquanto a sessão do Cloudflare Access ainda está válida; depois de criado o usuário, novos cadastros são recusados.

## Ativação em duas etapas
1. Publicar esta versão mantendo a proteção atual do Cloudflare Access.
2. Acessar `/admin/login/` e, na primeira visita, definir usuário e senha próprios. Esta etapa ainda passa pelo código por e-mail já existente.
3. Confirmar que o login novo abre as páginas do admin e que o botão “Sair” encerra a sessão.
4. Depois da validação, alterar a política Cloudflare Access para não exigir OTP no caminho `/admin/*`. As APIs `/api/admin/*` continuam protegidas pela sessão do painel.
5. Testar o login em uma janela anônima antes de considerar a troca concluída.

## Proteção e dados
- A senha tem no mínimo 12 caracteres; tentativas por IP são limitadas no D1.
- Não armazene dados reais de clientes em arquivos estáticos ou no GitHub.
- O D1 usado pelo CRM contém dados pessoais e deve permanecer vinculado somente ao ambiente de produção.
- Se o D1 não estiver vinculado, o login e as rotas administrativas falham fechados.
