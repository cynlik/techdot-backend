export enum Constant {
    Product = "Product",
    Subcategory = "Subcategory",
    Category = "Category",
    User = "User",
    Sale = "Sale",
    Discount = "Discount"
}

export enum HttpStatus {
    // Sucesso
    OK = 200, // OK
    CREATED = 201, // Criado
    ACCEPTED = 202, // Aceito
    NO_CONTENT = 204, // Sem Conteúdo
  
    // Redirecionamento
    MOVED_PERMANENTLY = 301, // Movido Permanentemente
    FOUND = 302, // Encontrado
    SEE_OTHER = 303, // Ver Outro
    NOT_MODIFIED = 304, // Não Modificado
    TEMPORARY_REDIRECT = 307, // Redirecionamento Temporário
    PERMANENT_REDIRECT = 308, // Redirecionamento Permanente
  
    // Erros do Cliente
    BAD_REQUEST = 400, // Requisição Ruim
    UNAUTHORIZED = 401, // Não Autorizado
    PAYMENT_REQUIRED = 402, // Pagamento Necessário
    FORBIDDEN = 403, // Proibido
    NOT_FOUND = 404, // Não Encontrado
    METHOD_NOT_ALLOWED = 405, // Método Não Permitido
    NOT_ACCEPTABLE = 406, // Não Aceitável
    PROXY_AUTHENTICATION_REQUIRED = 407, // Autenticação de Proxy Necessária
    REQUEST_TIMEOUT = 408, // Tempo de Requisição Esgotado
    CONFLICT = 409, // Conflito
    GONE = 410, // Desaparecido
    LENGTH_REQUIRED = 411, // Comprimento Necessário
    PRECONDITION_FAILED = 412, // Pré-condição Falhou
    PAYLOAD_TOO_LARGE = 413, // Carga Demasiado Grande
    URI_TOO_LONG = 414, // URI Muito Longa
    UNSUPPORTED_MEDIA_TYPE = 415, // Tipo de Mídia Não Suportado
    RANGE_NOT_SATISFIABLE = 416, // Faixa Não Satisfatória
    EXPECTATION_FAILED = 417, // Expectativa Falhou
    IM_A_TEAPOT = 418, // Código de status não oficial, mais usado para easter eggs
    MISDIRECTED_REQUEST = 421, // Requisição Desviada
    UNPROCESSABLE_ENTITY = 422, // Entidade Não Processável
    LOCKED = 423, // Bloqueado
    FAILED_DEPENDENCY = 424, // Dependência Falhou
    TOO_EARLY = 425, // Muito Cedo
    UPGRADE_REQUIRED = 426, // Atualização Necessária
    PRECONDITION_REQUIRED = 428, // Pré-condição Necessária
    TOO_MANY_REQUESTS = 429, // Muitas Requisições
    REQUEST_HEADER_FIELDS_TOO_LARGE = 431, // Campos do Cabeçalho da Requisição Muito Grandes
    UNAVAILABLE_FOR_LEGAL_REASONS = 451, // Indisponível por Razões Legais
  
    // Erros do Servidor
    INTERNAL_SERVER_ERROR = 500, // Erro Interno do Servidor
    NOT_IMPLEMENTED = 501, // Não Implementado
    BAD_GATEWAY = 502, // Gateway Ruim
    SERVICE_UNAVAILABLE = 503, // Serviço Indisponível
    GATEWAY_TIMEOUT = 504, // Tempo Limite do Gateway
    HTTP_VERSION_NOT_SUPPORTED = 505, // Versão HTTP Não Suportada
    VARIANT_ALSO_NEGOTIATES = 506, // Variante Também Negocia
    INSUFFICIENT_STORAGE = 507, // Armazenamento Insuficiente
    LOOP_DETECTED = 508, // Loop Detectado
    NOT_EXTENDED = 510, // Não Estendido
    NETWORK_AUTHENTICATION_REQUIRED = 511 // Autenticação de Rede Necessária
}