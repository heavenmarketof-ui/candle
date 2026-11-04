# Candle CRM — implantação segura

A central administrativa foi adicionada em /admin/, preservando /admin/contratos/ e /contrato/.

## Antes de usar dados reais

1. Proteger **/admin/**, **/admin/crm/**, **/admin/tarefas/** e **/admin/contratos/** com Cloudflare Access, inclusive domínios de preview. O HTML protegido por Access não substitui autenticação nas APIs.
2. Criar Cloudflare D1 e executar database/schema.sql. Configurar binding `DB` no Pages.
3. Implementar e testar endpoints de CRM com validação criptográfica do token Cloudflare Access em cada requisição; aplicar autorização por papel e proteção contra alterações não autorizadas.
4. Adaptar /api/leads para gravação transacional no D1 e envio de notificação de e-mail, evitando depender de CRM externo.
5. Configurar antispam, política de privacidade, logs sem dados pessoais e estratégia de backup/retenção.
6. Fazer teste de acesso não autenticado e de preview antes de habilitar qualquer consulta ou escrita de dados pessoais.

**Status:** estrutura e schema criados. Não há banco configurado nem API CRM ativa. As telas não mostram dados reais.
