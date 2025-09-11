URL base da API: https://wb-solarview.onrender.com/

 ### Autenticação
- **POST** `/auth/login`
  - Realiza login e retorna a chave de API do usuário
  - Parâmetros (query): `email=usuario@exemplo.com&password=senha`
  - Retorna: 
  ```json
  {
    "id": 1,
    "email": "usuario@exemplo.com",
    "is_active": true,
    "is_admin": false,
    "api_key": "sua-chave-de-api-aqui"
  }
  ```

- **POST** `/auth/rotate-key`
  - Gera uma nova chave de API para o usuário autenticado
  - Cabeçalho: `X-API-Key: sua-chave-atual`
  - Retorna: Nova chave de API

- **POST** `/auth/admin/rotate-key/{user_id}`
  - Gera uma nova chave de API para um usuário específico (apenas admin)
  - Cabeçalho: `X-API-Key: sua-chave-de-admin`
  - Retorna: Nova chave de API para o usuário

### Usuários
- **POST** `/users/`
  - Cria um novo usuário (apenas administradores)
  - Cabeçalho: `X-API-Key: sua-chave-de-admin`
  - Corpo:
  ```json
  {
    "email": "usuario@exemplo.com",
    "password": "senha_segura",
    "is_admin": false
  }
  ```
  - Retorna: Dados do usuário criado

- **GET** `/auth/me` ou `/users/me`
  - Retorna os dados do usuário autenticado
  - Cabeçalho: `X-API-Key: sua-chave-de-api`

- **GET** `/users/`
  - Lista todos os usuários (apenas administradores)
  - Cabeçalho: `X-API-Key: sua-chave-de-admin`
  - Parâmetros opcionais: 
    - `skip`: Número de registros para pular
    - `limit`: Limite de registros por página

- **GET** `/users/{user_id}`
  - Retorna um usuário específico
  - Cabeçalho: `X-API-Key: sua-chave-de-api`
  - Apenas o próprio usuário ou administrador pode acessar

- **PUT** `/users/{user_id}`
  - Atualiza um usuário
  - Cabeçalho: `X-API-Key: sua-chave-de-api`
  - Aceita atualizações parciais
  - Apenas o próprio usuário ou administrador pode atualizar
  - Exemplo de corpo:
  ```json
  {
    "email": "novo@email.com",
    "is_admin": true
  }
  ```

- **DELETE** `/users/{user_id}`
  - Remove um usuário (apenas administradores)
  - Cabeçalho: `X-API-Key: sua-chave-de-admin`

- **POST** `/users/change-password/`
  - Altera a senha do usuário
  - Cabeçalho: `X-API-Key: sua-chave-de-api`
  - Parâmetros (query): `user_id`, `current_password`, `new_password`
  - Apenas o próprio usuário ou administrador pode alterar a senha

### Health Check
- **GET** `/health`
  - Retorna o status da API
  - Não requer autenticação
  - Resposta: `{"status": "ok"}`

### Cálculo de Produção Solar
- **POST** `/calculate`
  - Recebe os dados para o cálculo, faz a requisição à API do PVGIS e retorna o resultado.
  - **Autenticação**: Chave de API no cabeçalho `X-API-Key`
  - **Cabeçalho obrigatório**: `X-API-Key: sua-chave-de-api`

  **Exemplo de corpo da requisição (JSON):**
  ```json
  {
    "lat": -23.531138,
    "lon": -46.762038,
    "peakpower": 5,
    "loss": 14
  }
  ```

  **Exemplo de chamada com `curl`:**
  ```bash
  curl -X POST "http://127.0.0.1:8000/calculate" \
  -H "X-API-Key: sua-chave-de-api" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": -23.531138,
    "lon": -46.762038,
    "peakpower": 5,
    "loss": 14
  }'
  ```

### Gerenciamento de Modelos de Painéis

#### Listar Modelos
- **GET** `/api/panel-models/`
  - Retorna a lista de todos os modelos de painéis cadastrados.
  - **Autenticação**: Chave de API no cabeçalho `X-API-Key`
  - **Cabeçalho obrigatório**: `X-API-Key: sua-chave-de-api`
  - Parâmetros opcionais (query):
    - `manufacturer`: Filtra por fabricante
    - `min_capacity`: Filtra por potência mínima (kWp)
    - `min_efficiency`: Filtra por eficiência mínima (%)
    - `panel_type`: Filtra por tipo do painel

  **Exemplo de resposta (JSON):**
  ```json
  [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Painel Solar 400W",
      "capacity": 0.4,
      "efficiency": 20.5,
      "manufacturer": "SolarTech",
      "type": "Monocristalino"
    }
  ]
  ```

#### Obter um Modelo Específico
- **GET** `/api/panel-models/{model_id}`
  - Retorna os detalhes de um modelo de painel específico.
  - **Autenticação**: Chave de API no cabeçalho `X-API-Key`
  - **Cabeçalho obrigatório**: `X-API-Key: sua-chave-de-api`
  - **Parâmetros de URL**:
    - `model_id`: UUID do modelo

#### Criar um Novo Modelo
- **POST** `/api/panel-models/`
  - Cria um novo modelo de painel solar (apenas administradores).
  - **Autenticação**: Chave de API no cabeçalho `X-API-Key`
  - **Cabeçalho obrigatório**: `X-API-Key: sua-chave-de-admin`
  - **Corpo da Requisição (JSON)**:
    - `name`: Nome do modelo (obrigatório)
    - `capacity`: Capacidade em kWp (obrigatório, > 0)
    - `efficiency`: Eficiência em % (obrigatório, 0-100)
    - `manufacturer`: Fabricante (obrigatório)
    - `type`: Tipo do painel (ex: Monocristalino) (obrigatório)

#### Atualizar um Modelo
- **PUT** `/api/panel-models/{model_id}`
  - Atualiza um modelo de painel existente. Aceita atualizações parciais (apenas administradores).
  - **Autenticação**: Chave de API no cabeçalho `X-API-Key`
  - **Cabeçalho obrigatório**: `X-API-Key: sua-chave-de-admin`
  - **Parâmetros de URL**:
    - `model_id`: UUID do modelo a ser atualizado
  - **Corpo da Requisição (JSON)**: Pelo menos um dos campos abaixo:
    - `name`: Nome do modelo
    - `capacity`: Capacidade em kWp (> 0)
    - `efficiency`: Eficiência em % (0-100)
    - `manufacturer`: Fabricante
    - `type`: Tipo do painel

#### Excluir um Modelo
- **DELETE** `/api/panel-models/{model_id}`
  - Remove um modelo de painel (apenas administradores).
  - **Autenticação**: Chave de API no cabeçalho `X-API-Key`
  - **Cabeçalho obrigatório**: `X-API-Key: sua-chave-de-admin`
  - **Parâmetros de URL**:
    - `model_id`: UUID do modelo a ser removido
