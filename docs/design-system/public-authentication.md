# Fluxos públicos de autenticação

**Issue:** REN-53  
**Base visual:** Eyes Design System 1.0.0

## Rotas cobertas

| Rota                | Objetivo                       | Recuperação principal                 |
| ------------------- | ------------------------------ | ------------------------------------- |
| `/login`            | Entrada administrativa         | recuperar senha ou solicitar acesso   |
| `/solicitar-acesso` | Envio de solicitação pública   | voltar ao login                       |
| `/setup-password`   | Ativação por convite           | solicitar novo convite à equipe       |
| `/forgot-password`  | Solicitação de recuperação     | confirmação neutra e retorno ao login |
| `/reset-password`   | Definição de nova senha        | solicitar novo link                   |
| `/acesso-negado`    | Explicar ausência de permissão | encerrar sessão ou voltar ao login    |

## Contrato de experiência

1. Cada rota possui um único `h1`, que recebe foco programático na entrada.
2. O seletor de tema fica disponível antes do formulário e preserva a escolha do usuário.
3. Erros de campo são associados ao controle e só aparecem após interação ou tentativa de envio.
4. Erros remotos aparecem de forma persistente, segura e anunciada.
5. O botão principal impede envio duplicado e expõe estado ocupado.
6. Sucesso sempre oferece uma próxima ação explícita.
7. Links ausentes ou expirados permanecem em um estado recuperável, sem redirecionamento surpresa.
8. A recuperação de senha nunca confirma se o endereço informado possui conta.
9. Zoom de 200%, largura de 320 px, teclado, movimento reduzido e os quatro temas são requisitos de
   regressão.

## Segurança do retorno após login

O parâmetro `returnUrl` é aceito apenas para rotas administrativas conhecidas: dashboard,
solicitações, usuários, auditoria e catálogo interno do Design System. Destinos externos, caminhos
desconhecidos ou valores ausentes resultam em `/dashboard`.

## Verificação

```powershell
npm run design-system:validate
npm test -- --watch=false
npm run build
npm run e2e
```

Os testes E2E verificam axe, teclado, confirmação neutra, recuperação de link incompleto, os quatro
temas e ausência de rolagem horizontal em 320 px.
