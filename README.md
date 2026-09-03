# OfertaPerfeita

Plataforma web completa, mobile-first, em português, para descoberta de ofertas afiliadas, com design premium e curado. Usa Supabase como fonte de dados real: schema, RLS segura, Auth, perfis/roles, favoritos, alertas, produtos, cupões, lojas e configurações. Inclui: Home, ofertas com busca/filtros/ordenação e URL state, produto, lojas/detalhe, cupões com clipboard, favoritos, alertas, conta/perfil, conversor e simulador, páginas legais/contacto, navegação desktop/mobile, SEO e estados de loading/erro/vazio. Área admin protegida com produtos, cupões, lojas, utilizadores e configurações, com garantia server-side/RLS para ações administrativas e conceito de superadmin sem expor email/identificador no frontend. Tabela `stores` configurável, sem lojas fixas no código. Sem secrets no browser e sem mocks como fonte de produção.

## Desenvolvimento

Precisa de Node.js e npm — [instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <url-do-repositorio>
cd <nome-do-repositorio>
npm i
npm run dev
```
