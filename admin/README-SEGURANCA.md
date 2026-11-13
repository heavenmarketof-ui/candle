# Candle Admin — acesso com usuário e senha

## Como o acesso funciona
- A página de login fica em `/admin/login/`.
- O usuário e a senha do painel são definidos nas variáveis do projeto Cloudflare, nunca no repositório ou em mensagens.
- A senha fica guardada como segredo criptografado no Cloudflare. O painel cria uma sessão HttpOnly, Secure e SameSite=Lax, válida por 7 dias.
- As APIs administrativas validam a sessão no servidor; tentativas de login são limitadas no D1.
- A configuração antiga por D1 continua disponível como alternativa, mas requer Cloudflare Access para o cadastro inicial.

## Configuração recomendada no Cloudflare
1. Em **Workers e Pages > candle-f4i > Configurações > Variáveis e segredos**, crie `ADMIN_USERNAME` como variável de texto.
2. Crie `ADMIN_PASSWORD` como **segredo**. Use uma senha exclusiva, com pelo menos 12 caracteres. Não envie a senha por chat.
3. Mantenha o vínculo D1 `DB` no projeto. Salve e faça uma nova implantação para as variáveis entrarem em vigor.
4. Acesse `/admin/login/` e valide que o login próprio abre o painel e que **Sair** encerra a sessão.
5. Depois da validação, ajuste o Cloudflare Access para deixar o login próprio do painel controlar o acesso a `/admin/*`. As páginas e APIs administrativas continuam exigindo uma sessão válida do painel.

## Proteção e dados
- `ADMIN_EMAILS` pode continuar configurado para atribuição de autoria e para a configuração legada por Access; ele não substitui `ADMIN_USERNAME` e `ADMIN_PASSWORD`.
- A senha tem no mínimo 12 caracteres; tentativas por IP são limitadas no D1.
- Não armazene dados reais de clientes em arquivos estáticos ou no GitHub.
- O D1 usado pelo CRM contém dados pessoais e deve permanecer vinculado somente ao ambiente de produção.
- Se o D1 não estiver vinculado, o login e as rotas administrativas falham fechados.
