# SolarView - App de Cálculo de Energia Solar

## 📱 Sobre o App

SolarView é um aplicativo móvel desenvolvido em React Native com Expo que permite calcular a posição ótima e prever a produção de energia de painéis solares a partir de coordenadas geográficas e características dos modelos de painel.

## 🚀 Funcionalidades

### 🏠 Página Calcular (Home)
- Formulário para inserir latitude, longitude, potência de pico e perda do sistema
- Preenchimento automático via GPS do dispositivo
- Seleção de coordenadas através de mapa interativo
- Opção de selecionar modelo de painel cadastrado para preencher automaticamente peakpower e loss

### 🔧 Página Modelos
- Listagem de painéis solares cadastrados pelo usuário
- CRUD completo (Criar, Ler, Atualizar, Deletar) de modelos de painéis
- Filtros por fabricante, capacidade, eficiência e tipo
- Campos: Nome, Fabricante, Capacidade de Pico, Perda do Sistema, Tipo

### ⚙️ Página Configurações
- Perfil do usuário logado
- Alternância entre idiomas (PT-BR e EN)
- Modo escuro/claro
- Logout e outras configurações

### 🔐 Login/Cadastro
- Autenticação com email e senha
- Validação de senha (min. 8 caracteres, 1 minúscula, 1 maiúscula)
- Cadastro de novos usuários

### 📊 Página Resultados
- Dados retornados pela API de cálculo
- Gráficos de previsão de produção mensal
- Mapa confirmando coordenadas selecionadas
- Bússola para direção ótima dos painéis

## 🏗️ Arquitetura do Projeto

```
├── app/                     # Rotas do Expo Router
│   ├── (auth)/             # Grupo de autenticação
│   ├── (tabs)/             # Grupo de tabs principais
│   └── _layout.tsx         # Layout raiz
├── components/             # Componentes reutilizáveis
│   ├── ui/                 # Componentes de UI básicos
│   └── forms/              # Componentes de formulários
├── contexts/               # Contextos React
├── services/               # Serviços de API
├── types/                  # Definições de tipos TypeScript
├── utils/                  # Utilitários e helpers
├── constants/              # Constantes da aplicação
└── hooks/                  # Hooks customizados
```

## 🎨 Design System

### Cores
- **Primária**: #FF6B35 (Laranja)
- **Secundária**: #FFFFFF (Branco)
- **Background**: #F8F9FA
- **Texto**: #2C3E50
- **Cinza**: #6C757D

### Princípios
- Design flat sem gradientes
- Interface minimalista e moderna
- Animações simples e sutis
- Alta legibilidade e contraste

## 🔧 Tecnologias Utilizadas

- **React Native 0.79.1**
- **Expo SDK 53**
- **Expo Router 5** - Navegação file-based
- **TypeScript** - Tipagem estática
- **React Context** - Gerenciamento de estado
- **Expo Location** - Geolocalização
- **Expo Camera** - Câmera e bússola
- **React Native Maps** - Mapas interativos
- **Recharts** - Gráficos
- **AsyncStorage** - Persistência local

## 🚀 Como Executar

1. **Clone o projeto**
```bash
git clone <repository-url>
cd solarview-app
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o arquivo .env**
```
EXPO_PUBLIC_API_BASE_URL=https://wb-solarview.onrender.com
EXPO_PUBLIC_ADMIN_EMAIL=seu-email-admin
EXPO_PUBLIC_ADMIN_PASSWORD=sua-senha-admin
```

4. **Execute o projeto**
```bash
npm run dev
```

## 📱 Navegação

O app utiliza navegação em tabs como estrutura principal:

- **Calcular** - Tela inicial para cálculos
- **Modelos** - Gerenciamento de modelos de painéis
- **Configurações** - Configurações do usuário

Navegação adicional:
- **Login/Cadastro** - Autenticação (fora das tabs)
- **Resultados** - Exibição de resultados (modal/stack)

## 🌐 API Integration

O app integra com a API SolarView para:

- Autenticação de usuários
- Gerenciamento de modelos de painéis
- Cálculos de produção solar
- Gestão de usuários (admin)

### Autenticação
- Login via email/senha retorna API key
- API key tem validade de 30 minutos
- Renovação automática da chave quando necessário

## 📊 Funcionalidades Avançadas

### GPS e Mapas
- Detecção automática da localização do usuário
- Seleção manual de coordenadas no mapa
- Validação de coordenadas válidas

### Bússola
- Integração com sensores do dispositivo
- Comparação entre direção atual e direção ótima
- Interface visual intuitiva

### Gráficos
- Visualização mensal da produção prevista
- Dados interativos e responsivos
- Exportação de dados (futuro)

## 🌍 Internacionalização

Suporte completo a:
- **Português Brasileiro (pt-BR)** - Padrão
- **Inglês (en)** - Secundário

## 🎯 Próximas Funcionalidades

- [ ] Exportação de relatórios em PDF
- [ ] Notificações push para lembretes
- [ ] Compartilhamento de resultados
- [ ] Histórico de cálculos
- [ ] Comparação entre diferentes modelos
- [ ] Integração com APIs de clima
- [ ] Mode offline básico

## 📄 Licença

Este projeto está licenciado sob a MIT License.