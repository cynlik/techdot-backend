export enum Constant {
  Product = 'Product',
  Subcategory = 'Subcategory',
  Category = 'Category',
  User = 'User',
  Sale = 'Sale',
  Discount = 'Discount',
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
  NETWORK_AUTHENTICATION_REQUIRED = 511, // Autenticação de Rede Necessária
}

export const ERROR_MESSAGES = {
  INVALID_QUANTITY: 'Invalid quantity',
  PRODUCT_NOT_FOUND: 'Product not found.',
  SALE_NOT_FOUND: 'Sale not found',
  CART_NOT_FOUND: 'Cart not found',
  OUT_OF_STOCK: 'Out of stock.',
  USER_ALREADY_EXISTS: 'User already exists',
  USER_NOT_FOUND: 'User not found.',
  REMOVE_PRODUCT_ID: 'Please remove product id',
  REMOVE_PRODUCT_QUANTITY: 'Please remove product quantity',
  QUANTITY_REQUIRED: 'Quantity is required',
  PRODUCT_ID_REQUIRED: 'Product id is required',
  PRODUCT_NOT_IN_CART: 'Product not found in cart',
  PRODUCT_ALREADY_IN_WISHLIST: 'Product already in your wishlist.',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  EMAIL_PASSWORD_MATCH: 'The new password and confirm password fields must match.',
  NAME_SAME_AS_CURRENT: 'The new name is the same as the current name',
  PASSWORD_SAME_AS_CURRENT: 'The new password is the same as the current password',
  PICTURE_SAME_AS_CURRENT: 'The new picture is the same as the current picture',
  ADDRESS_SAME_AS_CURRENT: 'The new address is the same as the current address',
  COUNTRY_SAME_AS_CURRENT: 'The new country is the same as the current country',
  EMAIL_ALREADY_IN_USE: 'Email already in use.',
  VERIFY_EMAIL: 'Please verify your email.',
  NEW_PASSWORD_DIFFERENT: 'New password must be different from the previous one.',
  NAME_LENGTH_EXCEEDED: 'Name must be 50 characters or less.',
  INVALID_EMAIL_PASSWORD: 'Invalid email address or password.',
  INVALID_USER_ROLE: 'Invalid user role.',
  INVALID_PICTURE_FORMAT: 'Invalid picture format. Allowed formats are jpg, jpeg, or png.',
  ADDRESS_LENGTH_EXCEEDED: 'Address must be 100 characters or less.',
  INVALID_COUNTRY: 'Invalid country',
  INVALID_VALUE_IS_VERIFIED: 'Invalid value for isVerified. Must be a boolean.',
  INVALID_CART_FORMAT: 'Invalid cart format.',
  NO_TOKEN_PROVIDED: 'No token provided',
  NO_USER: 'No user',
  SENDING_EMAIL: 'Error sending email',
  NO_VALID_ROLE: 'Access denied. User has no valid role.',
  ACCESS_DENIED: 'Access denied. Only',
  OR_HIGHER: 'or higher users allowed.',
  ERROR_IN_MIDDLEWARE: 'Error in middleware:',
  UNAUTHORIZED_MISSING_TOKEN: 'User is not authorized or token is missing',
  INVALID_TOKEN_FORMAT: 'Invalid token format',
  TOKEN_REVOKED: 'Token revoked. Login again',
  INVALID_EXPIRED_TOKEN: 'Invalid or expired token',
  UNEXPECTED_ERROR: 'An unexpected error occurred',
};

export const SUCCESS_MESSAGES = {
  ACCOUNT_REGISTERED_SUCCESSFULLY: 'Account registered successfully. Please verify your account through the email sent to your email.',
  CREATED_SUCCESSFULLY: 'Created successfully',
  UPDATED_SUCCESSFULLY: 'Updated successfully',
  EMPTY_CART: 'Empty cart',
  EMPTY_WISH_LIST: 'Empty wish list',
  ACCOUNT_VERIFIED_SUCCESSFULLY: 'Account verified successfully!',
  PASSWORD_UPDATED_SUCCESSFULLY: 'Password updated successfully.',
  INFO_UPDATED_SUCCESSFULLY: 'Info updated successfully',
  WISHLIST_UPDATED_SUCCESSFULLY: 'Wishlist updated successfully',
  ITEM_REMOVED_FROM_WISHLIST_SUCCESSFULLY: 'Item removed from wishlist successfully',
  VIEW_CHANGED_SUCCESSFULLY: 'View changed successfully',
  LOGOUT_SUCCESSFUL: 'Logout successful',
  EMAIL_SENT_SUCCESSFULLY: 'Email sent successfully',
};
