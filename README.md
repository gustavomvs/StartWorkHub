# StartWorkHub

# Our Figma

https://www.figma.com/file/VmnDU5a446f9LuYMpdJbnM/Workhub-Oficial_MASTER-CLASSICO-2020-11?node-id=0%3A1&t=cTHsGCz2N3IcbeU2-3

# main FrameWorks

https://developer.microsoft.com/en-us/fluentui#/

https://pnp.github.io/pnpjs/

https://pnp.github.io/sp-dev-fx-controls-react/

https://www.npmjs.com/package/spfx-fast-serve

# READ Example

## Nome

Webpart Workhub: WHD Events

## Descrição

2 Webparts que exibem os eventos de um calendario no sharepoint: Events e Events Widget

## Versão atual da webpart:

2.6.10.22

## Node Version:

14.15.0

## TODO

- Verificar permissoes necessarias e atualizar no package-solution
- ajustar a altura do location, no card, quando tenho titulo com 2 linhas
- limpar campo mapa para permitir apenas iframe
- testar evento do dia inteiro
- quando esta abrindo a tela de editar, demora para carregar os grupos. travar tela ate terminar de carregar
- quando edito evento e coloco audiencia, mostra o label. Ate aqui ok. Mas se edito de novo e removo audiencia, entao, o label nao some e continua ate que eu de refresh
- a pesquisa do sp na barra superior encontra eventos mesmo eles estando segmentados e eu nao deveria conseguir encontra-los
- O campo de selecionar grupos de audiencia esta com pau: quando seleciono mais de 1 grupo, ele fica meio doido, principalmente se sou rapido ou dou scroll. Parece ser promises racing.
- O campo de escolha de grupos definitivamente esta com pau. Editei, selecionei um grupo a mais, e salvei. Salvou apenas o novo grupo e o anterior sumiu

## Run

gulp serve --nobrowser

## Build

gulp clean
gulp bundle --ship
gulp deploy-azure-storage
gulp package-solution --ship

## Criar ambiente dev

1 - Instalar NVM:
https://github.com/coreybutler/nvm-windows/releases

2 - Instalar node na versão desejada e ativa-lo: (usar cmd elevado)
nvm install 14.15.0
nvm use 14.15.0

3 - Instalar pacotes node:
npm install -g yarn
npm install -g gulp-cli
npm install -g yo
npm install -g @microsoft/generator-sharepoint
npm install gulp (na raiz do projeto)

4 - Instalar certificado de desv:
gulp trust-dev-cert

4 - Rodar comando para instalar todas as dependencias:
npm install

## Log de alterações

- 22/10/2022 - 2.6.10.22: [Gustavo]:
  Titulo: Ajustes gerais
  Descricao:
  Bug: Widget: Botao "novo item" nao estava funcionando
  Feature: Quando o campo url do ver todos estiver em branco, nao exibie o botao "ver todos"
