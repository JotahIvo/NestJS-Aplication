# ADR 001: Uso do Prisma para Acesso a Dados

**Status**: Aceito

**Data**: 2025-09-07

## Contexto

O projeto necessita de um método robusto e com forte tipagem para interagir com nosso banco de dados relacional. A camada de acesso a dados é uma peça crítica da arquitetura, e a ferramenta escolhida influenciará diretamente a produtividade, performance e segurança de tipos em toda a aplicação.

As alternativas consideradas foram:
* **TypeORM**: Um ORM maduro e amplamente utilizado no ecossistema TypeScript.
* **Knex.js (Query Builder)**: Oferece mais controle sobre o SQL ao custo de menos abstração.
* **SQL Puro**: Máximo controle e performance, mas também máximo esforço e risco de erros/problemas de segurança.

## Decisão

Decidimos usar o **Prisma** como nossa ferramenta principal para acesso ao banco de dados.

Isso inclui o uso de:
* **Prisma Schema (`schema.prisma`)** como a única fonte da verdade para o nosso schema de banco de dados.
* **Prisma Client** como o construtor de queries auto-gerado e type-safe em nossos serviços e repositórios.
* **Prisma Migrate** para gerenciar as migrações de schema do banco de dados.

## Consequências

### Positivas:

* **Excelente Type Safety**: O Prisma Client é totalmente gerado a partir do nosso schema, fornecendo auto-complete e checagens em tempo de compilação inigualáveis. Isso reduz significativamente os erros em tempo de execução.
* **Alta Produtividade do Desenvolvedor**: O schema declarativo e a API intuitiva do client tornam as operações comuns de banco de dados simples e rápidas de escrever.
* **Gerenciamento de Migrações**: O Prisma Migrate fornece uma ferramenta de linha de comando poderosa e direta para evoluir o schema do banco de dados.
* **Ecossistema Forte**: O Prisma possui uma comunidade forte e boa integração com frameworks como o NestJS.

### Negativas:

* **Camada de Abstração**: Como em qualquer ORM, abrimos mão de algum controle direto sobre o SQL gerado. Para queries altamente complexas e críticas em performance, ainda podemos precisar usar SQL puro (`$queryRaw`).
* **Curva de Aprendizagem**: Embora a API seja intuitiva, a "maneira Prisma" de pensar sobre relações e queries tem uma pequena curva de aprendizado para desenvolvedores vindos de outros ORMs.
