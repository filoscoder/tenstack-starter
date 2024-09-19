**Timba Api** is a `Typescript` + `Express` + `Node` starter kit to develop `REST API` server apps.
Nothing new under the sun, just a straight forward combo to make server development a little bit faster. And of course, this make my freelancing days more enjoyable 😎
Comes with:

- Everything typed with [Typescript](https://www.typescriptlang.org/)
- [ES6](http://babeljs.io/learn-es2015/) features/modules
- ES7 [async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) / [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
- Run with [Nodemon](https://nodemon.io/) for automatic reload & watch
- [ESLint](http://eslint.org/) for code linting
- Code formatting using [Prettier](https://www.npmjs.com/package/prettier)
- Configuration management using [dotenv](https://www.npmjs.com/package/dotenv)
- Improved commits with [Husky](https://typicode.github.io/husky)
- Manage production app proccess with [PM2](https://pm2.keymetrics.io/)

  <br>
  <br>

---
# Docs

## Contenidos

### API
<details>
  <summary>Jugadores</summary>

  + [Listar Jugadores](#listar-jugadores-) ✅
  + [Ver Jugador](#ver-jugador-) ❓
  + [Crear Jugador](#crear-jugador) ✅
  + [Editar Jugador](#editar-jugador-) ✅
  + [Login de Jugador](#login-jugador) ✅
  + [Consultar Balance](#consultar-balance-) ✅
  + [Consultar Bono](#consultar-bono-) ✅
</details>

<details>
  <summary>Cuentas Bancarias</summary>
  
  + [Ver Cuentas Bancarias](#ver-cuentas-bancarias-)
  + [Crear Cuenta Bancaria](#crear-cuenta-bancaria-) ✅
  + [Actualizar Cuenta Bancaria](#actualizar-cuenta-bancaria-)
  + [Eliminar Cuenta Bancaria](#eliminar-cuenta-bancaria-)
</details>

<details>
  <summary>Depositos (jugador ➡ plataforma)</summary>

  + [Cargar Fichas](#cargar-fichas-) (instanciar depósito) ✅
  + [Ver Depósitos Pendientes](#ver-depósitos-pendientes-)
  + [Ver Depósito](#ver-depósito-)
  + [Listar Depósitos](#listar-depósitos-)
  + [Cambiar Estado del Depósito](#cambiar-estado-del-depósito-)
  + [Ver Cuenta Bancaria de Alquimia](#ver-cuenta-alquimia-)
</details>

<details>
  <summary>Pagos (plataforma ➡ jugador)</summary>

  + [Retirar Premios](#retirar-premios-) (instanciar pago) ✅
  + [Listar Pagos](#listar-pagos-)
</details>

<details>
  <summary>Agente</summary>

  + [Login de Agente](#login-agente)
  + [Marcar Pago Como Completado](#marcar-pago-como-completado-)
  + [Liberar Pago](#liberar-pago-)
  + [Ver QR](#ver-qr-)
  + [Ver Cuenta Bancaria](#ver-cuenta-bancaria-)
  + [Actualizar Cuenta Bancaria](#actualizar-cuenta-bancaria-)
  + [Ver Balance Casino](#ver-balance-casino-)
  + [Ver Balance Alquimia](#ver-balance-alquimia-)
  + [Indicar Que El Agente Esta De Guardia](#setear-guardia-)
  + [Ver Estado De Guardia](#ver-guardia-)
  + [Ver Números de Soporte](#ver-números-de-soporte-)
  + [Actualizar Números de Soporte](#actualizar-números-de-soporte-)
  + [Cambiar Contraseña de Jugador](#cambiar-contraseña-de-jugador-)
</details>

<details>
  <summary>Bot</summary>

  + [Ver QR](#ver-qr-)
  + [Ver bots](#ver-qr-)
  + [Blacklist](#blacklist-)
  + [Ver Blacklist](#ver-blacklist-)
  + [Encender / Apagar](#encender--apagar-)
  + [Ver Estado](#ver-estado-)
</details>

<details>
<summary>Bot History</summary>

  + [Listar Bot History](#listar-bot-history)
</details>

<details>
  <summary>Auth</summary>

  + [Refrescar Token](#refrescar-token)
  + [Logout](#logout-) ✅
  + [Olvidé mi contraseña](#olvide-mi-contraseña)
  + [Reestablecer contraseña](#reestablecer-contraseña)
  + [Cambiar contraseña](#cambiar-contraseña-)
</details>

<details>
  <summary>Analytics</summary>

  + [Listar](#listar-analytics)
  + [Ver](#ver-analytics)
  + [Crear](#crear-analytics)
  + [Resumen](#resumen-de-analytics)
</details>

<details>
  <summary>Bonus</summary>

  + [Listar Bonos](#listar-bonos-)
  + [Ver Bono](#ver-bono-)
  + [Crear Bono](#crear-bono-)
  + [Canjear Bono](#canjear-bono-)
</details>

<details>
  <summary>Transferencias de Fichas</summary>

  + [Liberar Pendientes](#liberar-fichas-pendientes-)
  + [Ver Total de Transferencias Pendientes](#ver-total-de-transferencias-pendientes-)
</details>

<details>
  <summary>Cajeros</summary>

  + [Listar Jugadores de Cajero](#listar-jugadores-de-cajero-)
  + [Ver Jugador de Cajero](#ver-jugador-de-cajero-)
  + [Ver Reporte General](#ver-reporte-general-)
  + [Ver Balance de Cajero](#ver-balance-de-cajero-)
  + [Cobrar Ganancias](#cobrar-ganancias-)
  + [Actualizar Alias](#actualizar-alias-)
</details>

### [Interfaces](#interfaces-1)

### [Despliegue](#despliegue-1)

Jugadores
---------

### Listar Jugadores 🔒

|Endpoint:| `/players`|
---|---|
Método      | `GET`
Query string| [`ResourceListQueryString`](#ResourceListQueryString)
Devuelve    | [`ListResponse<Player>`](#listresponset)
Requiere rol| agent

### Ver Jugador 🔒

|Endpoint:| `/players/:id`|
---|---|
Método      | `GET`
Devuelve    | [`Player & { bank_accounts: BankAccount[] }`](#player)
Requiere rol| player

### Crear Jugador
Usar `roles: ["player"]` o `roles: undefined` en `PlayerRequest` para dar de alta un jugador.

Usar `roles: ["cashier"[, "player"]]` en `PlayerRequest` para dar de alta un cajero.

Usar `cashier_id: string` en `PlayerRequest` para crear un jugador vinculado a un cajero. Si `cashier_id` está presente, roles debe ser `["player"]`.

|Endpoint:| `/players`|
---|---|
Método      | `POST`
Body (json) | [`PlayerRequest`](#playerrequest)
Devuelve    | [`LoginResponse`](#loginresponse)

### Editar Jugador 🔒

|Endpoint:| `/players/:id`|
---|---|
Método      | `POST`
Body (json) | [`PlayerUpdateRequest`](#playerupdaterequest)
Devuelve    | [`Player`](#player)
Requiere rol| agent

### Login Jugador

|Endpoint| `/players/login`|
---|---|
Método      |`POST`
Body (json) | [`Credenciales`](#credenciales)
Devuelve    | [`LoginResponse`](#loginresponse)

### Consultar Balance 🔒

|Endpoint| `/players/:id/balance`|
---|---|
Método      |`GET`
Devuelve    | [`Number`]

### Consultar Bono 🔒

|Endpoint| `/players/:id/bonus`|
---|---|
Método      |`GET`
Devuelve    | [`Bonus[]`](#bonus-1)

> **❗Nota**: devuelve un array.


Cuentas Bancarias
-----------------

### Ver Cuentas Bancarias 🔒

|Endpoint| `/bank-account/:id?`|
---|---|
Método      |`GET`
Devuelve    | [`BankAccount[]`](#bankaccount)
Requiere rol| player

> **Nota:** Siempre devuleve un array

> **Nota:** Omitir el parámetro `id` para ver todas las cuentas bancarias del usuario

### Crear Cuenta Bancaria 🔒

|Endpoint| `/bank-account`|
---|---|
Método      |`POST`
Body (json) | [`BankAccountRequest`](#bankaccountrequest)
Devuelve    | [`BankAccount`](#bankaccount)
Requiere rol| player

### Actualizar Cuenta Bancaria 🔒

|Endpoint| `/bank-account`|
---|---|
Método      |`POST`
Body (json) | [`BankAccountRequest`](#bankaccountrequest)
Devuelve    | [`BankAccount`](#bankaccount)
Requiere rol| player

> **Nota:** Los campos son opcionales. Incluir los que se quiera modificar

### Eliminar Cuenta Bancaria 🔒

|Endpoint| `/bank-account/:id/delete`|
---|---|
Método      |`POST`
Devuelve    | 200 OK
Requiere rol| player

### Cargar Fichas 🔒
Incluir el id en la URL y omitir el body para confirmar un depósito pendiente
Omitir el id en la URL e incluir los datos en el body para crear un depósito nuevo

|Endpoint| `/transactions/deposit/:id?`|
---|---|
Método      |`POST`
Body (json) |[`DepositRequest`](#depositrequest)
Devuelve    |[`DepositResult`](#depositresult)
Requiere rol| player
Rate-limited|1 every 10 seconds

### Retirar Premios 🔒

|Endpoint| `/transactions/cashout`|
---|---|
Método      |`POST`
Body (json) |[`CashoutRequest`](#cashoutrequest)
Devuelve    |[`CoinTransfer`](#cointransfer) \|  [`ERR.INSUFICIENT_BALANCE`](#errinsuficient_balance) \| [`ERR.COIN_TRANSFER_UNSUCCESSFUL`](#errcoin_transfer_unsuccessful)
Requiere rol| player

### Listar Pagos 🔒

|Endpoint| `/transactions/payment`|
---|---|
Método      |`GET`
Query string| [`ResourceListQueryString`](#ResourceListQueryString)
Devuelve    |[`Payment[]`](#payment)
Requiere rol| agent

### Ver Depósitos Pendientes 🔒

|Endpoint| `/transactions/deposit/pending`|
---|---|
Método      |`GET`
Devuelve    |[`Deposit[]`](#deposit)
Requiere rol| player

> **Nota:** siempre devuelve un array

### Ver Cuenta Alquimia 🔒

|Endpoint| `/transactions/bank-details`|
---|---|
Método      |`GET`
Devuelve    |[`RootBankAccount`](#rootbankaccount)
Requiere rol| player

Auth
----

### Refrescar Token

|Endpoint| `/auth/refresh`|
---|---|
Método      |`POST`
Body (json) |[`RefreshRequest`](#refreshrequest)
Devuelve    |[`Tokens`](#tokens)

### Logout 🔒

|Endpoint| `/auth/logout`|
---|---|
Método      |`POST`
Body (json) |[`RefreshRequest`](#refreshrequest)
Devuelve    |200 OK si el token es invalidado
Error       |403 si el token no le pertenece al usuario, 404 si el token no se encuentra
Requiere rol| player \| agent

**Nota** el token puede ser un access o refresh token. Al recibir uno, los dos serán invalidados.

### Olvide Mi Contraseña
Envia un email al usuario con un enlace para reestablecer su contraseña. El token tiene una validez de 10' y sólo puede ser usado una vez.

|Endpoint| `/auth/forgot-password`|
---|---|
Método      |`POST`
Body (json) |[`ForgotPasswordRequest`](#forgot-password-request)
Devuelve    |OK 200 \| 429 too_many_requests
Rate limited|1 request cada 10' por username.

> **Nota**: siempre devuelve 200 OK para evitar [user enumeration attack](https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/03-Identity_Management_Testing/04-Testing_for_Account_Enumeration_and_Guessable_User_Account.html). Cuando devuelve 429, el tiempo que se debe esperar hasta el próximo request está en el encabezado `Retry-After` (en segundos).

### Reestablecer Contraseña
Reestablecer contraseña usando el token generado en [`/auth/forgot-password`](#olvide-mi-contraseña).

|Endpoint| `/auth/restore-password`|
---|---|
Método      |`POST`
Body (json) |[`RestorePasswordRequest`](#restorepasswordrequest)
Devuelve    |OK 200

### Cambiar Contraseña 🔒

|Endpoint| `/auth/reset-password`|
---|---|
Método      |`POST`
Body (json) |[`ResetPasswordRequest`](#resetpasswordrequest)
Devuelve    |OK 200
Requiere rol| player

Agente
------

### Login Agente

|Endpoint| `/agent/login`|
---|---|
Método      |`POST`
Body (json) |[`Credenciales`](#credenciales)
Devuelve    |[`Tokens`](#tokens)

### Marcar Pago Como Completado 🔒

|Endpoint| `/agent/payments/:id/paid`|
---|---|
Método      |`POST`
Devuelve    |[`Payment`](#payment)
Requiere rol| agent

### Liberar Pago 🔒
Transferir desde alquimia a la cuenta del jugador

|Endpoint| `/agent/payments/:id/release`|
---|---|
Método      |`POST`
Devuelve    |[`Payment`](#payment)
Requiere rol| agent

### Ver Depósito 🔒

|Endpoint| `/transactions/deposit/:id`|
---|---|
Método      |`GET`
Devuelve    |[`Deposit & { Player: Player}[]`](#deposit)
Requiere rol| agent

### Listar Depósitos 🔒

|Endpoint| `/transactions/deposit/`|
---|---|
Método      |`GET`
Query string| [`ResourceListQueryString`](#ResourceListQueryString)
Devuelve    |[`Deposit[]`](#deposit)
Requiere rol| agent

### Editar Depósito 🔒
Endpoint para que el agente modifique el `tracking_number` de un depósito y dispare el flujo de verificación.

|Endpoint| `/transactions/deposit/:id`|
---|---|
Método      |`POST`
Body (json) | [`EditDepositRequest`](#editdepositrequest)
Devuelve    |[`DepositResult`](#depositresult)
Requiere rol| agent

### Cambiar Estado del Depósito 🔒
Para que el agente marque un depósito como pagado

|Endpoint| `/transactions/deposit/:id/set-status`|
---|---|
Método      |`POST`
Body (json) | [`SetDepositStatusRequest`](#setdepositstatusrequest)
Devuelve    |[`Deposit`](#deposit)
Requiere rol| agent

### Ver Cuenta Bancaria 🔒

|Endpoint| `/agent/bank-account`|
---|---|
Método      |`GET`
Devuelve    |[`RootBankAccount`](#rootbankaccount)
Requiere rol| agent

### Actualizar Cuenta Bancaria 🔒

|Endpoint| `/agent/bank-account`|
---|---|
Método      |`POST`
Body (json) |[`RootBankAccount`](#rootbankaccount)
Devuelve    |[`RootBankAccount`](#rootbankaccount)
Requiere rol| agent

**Nota** Todos los parámetros son opcionales, incluir solo los que se quiera actualizar.

### Ver Balance Casino 🔒

|Endpoint| `/agent/balance/casino`|
---|---|
Método      |`GET`
Devuelve    |[`Balance`](#balance)
Requiere rol| agent

### Ver Balance Alquimia 🔒

|Endpoint| `/agent/balance/alquimia`|
---|---|
Método      |`GET`
Devuelve    |[`Balance`](#balance)
Requiere rol| agent

### Ver Guardia 🔒
Indicar que alguien está al teléfono para que el bot muestre el menú "contactanos".

|Endpoint| `/agent/on-call`|
---|---|
Método      |`GET`
Devuelve    |boolean
Requiere rol| agent

### Ver Números de soporte 🔒

|Endpoint| `/agent/support`|
---|---|
Método      |`GET`
Devuelve    |[`SupportResponse`](#supportresponse)
Requiere rol| agent

### Actualizar Números de soporte 🔒

|Endpoint| `/agent/support`|
---|---|
Método      |`POST`
Body (json) |[`SupportRequest`](#supportrequest)
Devuelve    |200 OK
Requiere rol| agent

### Cambiar Contraseña de Jugador 🔒

|Endpoint| `/agent/reset-player-password`|
---|---|
Método      |`POST`
Body (json) |[`PlayerPasswordResetRequest`](#playerpasswordresetrequest)
Devuelve    |200 OK
Requiere rol| agent

Bot
---

### Ver QR 🔒

|Endpoint| `/bot/:name?`|
---|---|
Método      |`GET`
Devuelve    |`Blob | string[]`
Requiere rol| agent

> Omitir el parametro `:name` para que devuelva un array con los nombres de los bots.
> Cualquier caracter que no esté en el rango [a-b] es eliminado del parametro `:name`. Ademas `:name` debe tener entre 1 y 10 caracteres.

### Blacklist 🔒

|Endpoint| `/bot/blacklist`|
---|---|
Método      | `POST`
Body (json) |[`BlacklistRequest`](#blacklistrequest)
Devuelve    | 200 OK
Requiere rol| agent

### Ver Blacklist 🔒

|Endpoint| `/bot/blacklist`|
---|---|
Método      | `GET`
Devuelve    | `string[]` (la lista de números)
Requiere rol| agent

### Encender / Apagar 🔒

|Endpoint| `//bot/switch`|
---|---|
Método      | `POST`
Body (json) |[`BotSwitchRequest`](#botswitchrequest)
Devuelve    | 200 OK
Requiere rol| agent

### Ver Estado 🔒
Muestra si el bot está encendido o apagado.

|Endpoint| `/bot/switch`|
---|---|
Método      | `GET`
Devuelve    | [`GLOBAL_SWITCH_STATE`](#global_switch_state)

Bot History
-----------

### Listar Bot History

|Endpoint| `/bot-history`|
---|---|
Método      | `GET`
Query string| [`ResourceListQueryString`](#ResourceListQueryString)
Devuelve    |[`BotHistory[]`]()


Analytics
---------

### Listar Analytics

|Endpoint| `/analytics/`|
---|---|
Método      |`GET`
Query string| [`ResourceListQueryString`](#ResourceListQueryString)
Devuelve    |[`Analytics[]`](#analytics-2)

### Ver Analytics

|Endpoint| `/analytics/:id`|
---|---|
Método      |`GET`
Devuelve    |[`Analytics[]`](#analytics-2)

### Crear Analytics

|Endpoint| `/analytics/`|
---|---|
Método      |`POST`
Body (json) | [`AnalyticsRequest`](#analyticsrequest)
Devuelve    |`Analytics`

### Resumen de Analytics

|Endpoint| `/analytics/summary`|
---|---|
Método      |`GET`
Devuelve    | [`AnalyticsSummary[]`](#analyticssummary)

Bonos
-----

### Listar Bonos 🔒

|Endpoint| `/bonus`|
---|---|
Método      |`GET`
Query string| [`ResourceListQueryString`](#ResourceListQueryString)
Devuelve    |[`Bonus[]`](#bonus-1)
Requiere rol| agent

### Ver Bono 🔒
Sólo muestra el bono si pertenece al usuario logueado o si el usuario logueado es agente

|Endpoint| `/bonus/:id`|
---|---|
Método      |`GET`
Devuelve    |[`Bonus[]`](#bonus-1)

### Crear Bono 🔒

|Endpoint| `/bonus/:id`|
---|---|
Método      |`POST`
Body (json) |`{ player_id: string }`
Devuelve    |[`Bonus`](#bonus-1)
Requiere rol| player

### Canjear Bono 🔒

|Endpoint| `/bonus/:id/redeem`|
---|---|
Método      |`GET`
Devuelve    |[`BonusRedemptionResult`](#bonusredemptionresult)
Requiere rol| player
Rate-limited|1 every 10 seconds for the same `:id`

Transferencia de Fichas
-----------------------

### Liberar Fichas Pendientes 🔒
Liberar transferencias de fichas que hayan quedado pendientes en el caso que un jugador quiera comprar mas fichas de las que tiene dispoibles el agente

|Endpoint| `/coin-transfer/release-pending`|
---|---|
Método      |`GET`
Devuelve    |[`CoinTransfer[]`](#cointransfer)
Requiere rol| agent

### Ver Total de Transferencias Pendientes 🔒

|Endpoint| `/coin-transfer/pending-total`|
---|---|
Método      |`GET`
Devuelve    |`number`
Requiere rol| agent

Cajeros
-------

### Listar Jugadores de Cajero 🔒

|Endpoint| `/cashier/:cashier_id/player`|
---|---|
Método      |`GET`
Devuelve    |[`ListResponse<PlayerWithUsageMetrics>`](#listresponset)
Requiere rol| cashier

### Ver Jugador de Cajero 🔒

|Endpoint| `/cashier/:cashier_id/player/:player_id`|
---|---|
Método      |`GET`
Devuelve    |[`Player`](#player)
Requiere rol| cashier

### Ver Reporte General 🔒

|Endpoint| `/cashier/:cashier_id/player/:player_id/general-report`|
---|---|
Método      |`GET`
Query string| [`GeneralReportRequest`](#generalreportrequest)
Devuelve    | [`GeneralReport`](#generalreport)

### Ver Balance de Cajero 🔒

|Endpoint| `/cashier/:cashier_id/balance`|
---|---|
Método      |`GET`
Devuelve    |`number`
Requiere rol| cashier

### Cobrar Ganancias 🔒

|Endpoint| `/cashier/:cashier_id/cashout`|
---|---|
Método      |`GET`
Devuelve    |[`CoinTransfer`](#cointransfer) \|  [`ERR.INSUFICIENT_BALANCE`](#errinsuficient_balance) \| [`ERR.COIN_TRANSFER_UNSUCCESSFUL`](#errcoin_transfer_unsuccessful)
Requiere rol| cashier

### Actualizar Alias 🔒

|Endpoint| `/cashier/:cashier_id/update`|
---|---|
Método      |`POST`
Body (json) |[`CashierUpdateRequest`](#cashierupdaterequest)
Devuelve    |[`Cashier`](#cashier)
Requiere rol| cashier

## Interfaces

### Player
```typescript
{
  id: string
  panel_id: number
  username: string
  email: string
  first_name: string?
  last_name: string?
  date_of_birth: string?
  movile_number: string?
  country: string?
  balance_currency: string
  status: string
  cashier_id: string?
  created_at: string                  // 2024-01-29T18:14:41.534Z
  updated_at: string                  // 2024-01-29T18:14:41.534Z
}
```

### ResourceListQueryString
```typescript
  page=1
  items_per_page=20
  search=<string>
  sort_column=<string>
  sort_direction='asc' | 'desc'
```

### ListResponse&lt;T&gt;
```typescript
{
  result: T[]
  total: number
}
```

### PlayerWithUsageMetrics
```typescript
{
  player_id: string
  username: string
  email: string
  movile_number: string
  first_name: string
  last_name: string
  deposits_total: number
  cashout_total: number
  last_deposit: string                // 2024-01-29T18:14:41.534Z
  created_at: string                  // 2024-01-29T18:14:41.534Z
}
```

### LoginResponse
```typescript
{
  access: string
  refresh: string
  player: Player
}
```


### PlayerRequest
```typescript
{
  username: string
  password: string
  email: string
  first_name: string?
  last_name: string?
  date_of_birth: DateTime?
  movile_number: string?
  country: string?
  cashier_id: string?                 // Puede ser el ID o handle (@foo)
  roles: string[]?                    // default: [ "player" ]
  handle: string?                     // Solo para cajeros, default: @<username>
}
``` 

### PlayerUpdateRequest
```typescript
{
  email?: string
  movile_number?: string
  first_name?: string
  last_name?: string
}
```

### BankAccountRequest
```typescript
{
  owner: string                       // Nombre del beneficiario
  bankId: string                    // Nombre del banco
  bankNumber: string                  // CBU
  bankAlias: string?   
}
```

### BankAccount
```typescript
{
  id: string        
  owner: string                       // Nombre del beneficiario
  player_id: string                   // ID de Player
  bankId: string                    // Nombre del banco
  bankNumber: string                  // CBU
  bankAlias: string?       
  created_at: datetime                // 2024-01-29T18:14:41.534Z
  updated_at: datetime                // 2024-01-29T18:14:41.534Z
}
```

### Credenciales
```typescript
{
  username: string
  password: string
}
```

### DepositRequest
```typescript
{
  tracking_number: string;
  amount: number;
  date: datetime;                     // 2024-01-29T18:14:41.534Z 
  sending_bank: string;               // valid bank ID
}
```

### CashoutRequest
```typescript
{
  amount: number
  bank_account: number                // ID de cuenta bancaria
}
```

### CoinTransfer
```typescript
{
  id: string
  status: string
  player_balance_after?: number
  updated_at: datetime                // 2024-02-23T12:35:51.017Z
  created_at: datetime                // 2024-02-23T12:35:51.017Z
}
```

### DepositResult
```typescript
{
  deposit: Deposit
  bonus?: Bonus
  coinTransfer?: CoinTransfer
}
```

### Deposit
```typescript
{
  id: string
  player_id: string
  currency: string
  dirty: boolean
  status: "pending"|"unverified"|"verified"|"deleted"
  tracking_number: string
  amount: number
  sending_bank: string
  created_at: datetime                // 2024-02-23T12:35:51.017Z
  updated_at: datetime                // 2024-02-23T12:35:51.017Z
}
```

### EditDepositRequest
```typescript
{
  tracking_number: string
}
```

### SetDepositStatusRequest
```typescript
{
  status: "pending"|"unverified"|"verified"|"deleted"
}
```

### Payment
```typescript
{
  id: string
  player_id: string
  amount: number
  paid: datetime | null               // 2024-02-23T12:35:51.017Z
  bank_account: string
  currency: string
  created_at: datetime                // 2024-02-23T12:35:51.017Z                  
  updated_at: datetime                // 2024-02-23T12:35:51.017Z
}
```

### RootBankAccount
```typescript
{
  name: string
  dni: string
  bankId: string
  accountNumber: string
  clabe: string
  alias: string
}
```

### RefreshRequest
```typescript
{
  token: string
}
```

### Tokens
```typescript
{
  access: string
  refresh: string
}
```

### Balance
```typescript
{
  balance: number
}
```

### OnCallRequest
```typescript
{
  active: boolean
}
```

### SupportResponse
```typescript
{
  bot_phone: string | null;
  human_phone: string | null;
}
```

### SupportRequest
```typescript
{
  bot_phone?: string;
  human_phone?: string;
}
```

### ForgotPasswordRequest
```typescript
{
  username: string
}
```

### RestorePasswordRequest
```typescript
{
  token: string
  new_password: string
  repeat_password: string
}
```

### ResetPasswordRequest
```typescript
{
  new_password: string
  repeat_password: string
}
```

### PlayerPasswordResetRequest
```typescript
{
  new_password: string
  user_id: string
}
```

### Analytics
```typescript
{
  id: string
  source: string
  event: string
  data?: object
  created_at: datetime    // 2024-01-29T18:14:41.534Z
  updated_at: datetime    // 2024-01-29T18:14:41.534Z
}
```

### AnalyticsRequest
```typescript
{
  source: string
  event: string
  data?: object
}
```

### AnalyticsSummary
```typescript
{
  _count: { event: number };
  source: string;
  event: string;
}
```

### Bonus
```typescript
{
  id: string
  player_id: string
  Player: Player
  status: string
  percentage: number  
  amount: number  
  created_at: DateTime
  updated_at: DateTime
}
```

### BonusRedemptionResult
```typescript
{
  coinTransfer: CoinTransfer
  bonus: Bonus
}
```

### CashierUpdateRequest
```typescript
{
  handle: string
}
```

### Cashier
```typescript
{
  id: string       
  handle: string   
  username: string
  password: string 
  panel_id: number?
  access: string?  
  refresh: string? 
  dirty: boolean   
  last_cashout: DateTime
  created_at: DateTime      // 2024-01-29T18:14:41.534Z
  updated_at: DateTime      // 2024-01-29T18:14:41.534Z
}
```

### GeneralReportRequest
> ❗**Importante**: revisar el formato de las fechas. El casino no soporta ISO-8601.
```typescript
{
  date_from: string;        // 2024-01-29T18:14-03:00
  date_to: string;          // 2024-01-29T18:14-03:00
}
```

### GeneralReport 
```typescript
{
  total: BetReport;
  providers: GameProvider[];
}
```

### GameProvider 
```typescript
{
  BetReport & 
  {
    producer: string;
  }
}
```

### BetReport 
```typescript
{
  bets_count: number;
  total_bets: string;
  total_wins: string;
  total_profit: string;
}
```

### BlacklistRequest
```typescript
{
  number: string,
  method: 'add' | 'remove'
}
```

### BotSwitchRequest
```typescript
{
  state: GLOBAL_SWITCH_STATE
}
```

### GLOBAL_SWITCH_STATE 
```typescript
enum {
  ON = "on",
  OFF = "off",
}
```

### BotHistory
```typescript
{
  id: string 
  ref: string
  keyword?: string
  answer: string 
  refSerialize: string
  from: string
  options: any
  created_at: string
  updated_at: string
}
```

### ERR.INSUFICIENT_BALANCE
```typescript
{
  status: 400,
  code: "insuficient_balance",
  description: "Saldo insuficiente",
}
```

### ERR.COIN_TRANSFER_UNSUCCESSFUL
```typescript
{
  status: 502,
  code: "bad_gateway",
  description: "No se pudo transferir las fichas.",
}
```

## Load Testing

### Ddosify

Correr contenedor de ddosify con
```bash
$ docker run -it --rm --add-host host.docker.internal:host-gateway ddosify/ddosify
```

Luego obtener un token de acceso y correr el siguiente comando en el contenedor
```bash
$ ddosify -t 'http://host.docker.internal:8080/app/v1/endpoint \
-m POST \
-b '{"json": "data"}' \
-h 'Content-Type: application/json' \
-h "Authorization: Bearer $ACCESS_TOKEN" \
-h 'User-Agent: curl/7.81.0' \
-n <request_count>
-d <test_duration>
```

## Despliegue

- `npx prisma migrate deploy` Para levantar la base de datos.
- `npm run seed` Para registrar al agente en nuestra base de datos. El comando pide el usuario y contraseña del casino y de nuestro panel propio. Las credenciales que se ingresen serán las que se usen para loguear al agente en el casino y en nuestro panel.

## TODO

- Generar allowed origin dinamicamente en producción para incluir localhost


### Fichas insuficientes

- Revisar respuesta y avisarle al agente si quedaron transferencias sin liberar

## Optimizaciones

- Invalidar tokens en conjunto con una sola petición SQL
- Usar instancia global de prisma.


## Alquimia 

- ID Cuenta ahorro: 120902

### Cuentas destino
- Carolina Maruzza
  + 646180146003556692
  + Albo
- Luis Gonzalo Sosa
  + 646180402301855904
  + Banco Stori

Listar cuentas de ahorro 
```bash
curl -X GET \
-H "Authorization: Bearer $API_TOKEN" \
-H "AuthorizationAlquimia: Bearer $ALQ_TOKEN" \
${ALQ_TEST_BASE_URL}/cuenta-ahorro-cliente \
-H 'Content-Type: x-www-form-urlencoded' \
-d 'id_cliente=2733226' 
```

Crear TX
```bash
curl -X POST \
-H "Authorization: Bearer $API_TOKEN" \
-H "AuthorizationAlquimia: Bearer $ALQ_TOKEN" \
-H "Content-Type: application/json" \
-d '{"cuenta_origen": 120902, "id_cliente": 2733226, "medio_pago": 4, "importe": 1, "cuenta_destino": 646180146003556692,"nombre_beneficiario": "Carolina Maruzza", "rfc_beneficiario": "NA", "email_beneficiario": "contacto@rodrigoalvarez.co.uk", "concepto": "test", "no_referencia": 123456, "api_key": "694cefc59cdd7a30202dcd4ea7fdb790"}' \
"${ALQ_TEST_BASE_URL}/guardar-transacciones"
```

Response
```js
{
  "error": false,
  "id_transaccion": 7281723,
  "folio_orden": "334251325903025153",
  "message": "Operación registrada con éxito. Estado: Aplicada.",
  "pendiente": true,
  "obj_res": []
}
```

Confirmar TX
```bash
curl -X POST \
-H "Authorization: Bearer $API_TOKEN" \
-H "AuthorizationAlquimia: Bearer $ALQ_TOKEN" \
-H "Content-Type: application/json" \
-d '{"id_transaccion": 7279624, "accion": 1, "id_cuenta": 120902, "api_key": "694cefc59cdd7a30202dcd4ea7fdb790"}' \
"${ALQ_TEST_BASE_URL}/ordenes-importador"
```

Listar TX pendientes
```bash
curl -X GET \
-H "Authorization: Bearer $API_TOKEN" \
-H "AuthorizationAlquimia: Bearer $ALQ_TOKEN" \
"${ALQ_TEST_BASE_URL}/ordenes-importador?id_cuenta=120902"
```
7388577, 7388722 
Consultar status TX
```bash
curl -X GET \
-H "Authorization: Bearer $API_TOKEN" \
-H "AuthorizationAlquimia: Bearer $ALQ_TOKEN" \
"${ALQ_TEST_BASE_URL}/consulta-estatus-tx?id_transaccion=7281723" 
```
Respuesta
```js
{
  id_transaccion: "7281723",
  estatus: "LIQUIDADA",
  detalle_proveedor: {
    "error":true,
    "message":"Respuesta proveedor desconocida"
  }
}
```

Consultar transferencia por clave de rastreo
```bash
curl -X GET \
-H "Authorization: Bearer $API_TOKEN" \
-H "AuthorizationAlquimia: Bearer $ALQ_TOKEN" \
"${ALQ_TEST_BASE_URL}/cuenta-ahorro-cliente/120902/transaccion" \
-d 'clave_rastreo=$TRACKING_NUMBER'
```

Datos que necesitamos saber:

- Cuales son los distintos valores posibles, y que significan, del campo `estatus` en la respuesta de `/consulta-estatus-tx`
- Cuales son los valores posibles, y que significan, del campo `estatus_transaccion` en la respuesta de `/cuenta-ahorro-cliente/$ACCOUNT_ID/transaccion`

## Banxico

### Verificar transferencia

Enviar el siguiente pedido y guardar la cookie JSESSIONID de la respuesta
```bash
curl -X POST \
-i \
https://www.banxico.org.mx/cep/valida.do \
-d 'tipoCriterio=T&fecha=11-03-2024&criterio=53771ALBO11032024195558814&emisor=90646&receptor=90659&cuenta=659437001005389354&receptorParticipante=0&monto=10&captcha=c&tipoConsulta=1' 
```

Despues
```bash
curl https://www.banxico.org.mx/cep/descarga.do?formato=XML \
-H "Cookie: JSESSIONID=$JSESSIONID"
```

Respesta
```xml
<SPEI_Tercero 
  FechaOperacion="2024-03-11" 
  Hora="13:56:07" 
  ClaveSPEI="90659" 
  sello="DbcZSGP5NnDGhmfHt+2wBv1+tdOorVXVdM4rktrhjycj1okIAcgQSM7B3glPe6DEB9nsNZ6iM4ckjjwcdn1q0ub9aOi8qHwg1vuBDr+nmv00+VwKNGX/vDcIosPk2NzHW5pAYYeHQy+WINzFtSgJx4o30dK7rtlGFjWNfaLRKQC0Cau4E1KLWZ+AP8iYjC5CLJEHL2VZhcbJaUivupJ40bP1Idh1bOI1me+F2GQ4sQuuqms8vzMPX1wIsweqFCqysco8ycO1RaFCs0OsZ8Ij9delh3jZG8QftYwdLGjM6XOh85MoRs4P7HoMrOw07S9SzB6NNyZa+YgP2lpdUXq/eA==" 
  numeroCertificado="00001000000505544848" 
  cadenaCDA="||1|11032024|11032024|135607|90659|STP|CAROLINA MARUZZA|40|646180146003556692|MAXC720729MNERXR07|ASP INTEGRA OPC|TECHNOLOGY AND INTEROPERABILITY SA DE CV|40|659437001005389354|TIN160223BC2|sin concepto|0.00|10.00|NA|NA|0|0|NA|0|0.00|00001000000505544848||DbcZSGP5NnDGhmfHt+2wBv1+tdOorVXVdM4rktrhjycj1okIAcgQSM7B3glPe6DEB9nsNZ6iM4ckjjwcdn1q0ub9aOi8qHwg1vuBDr+nmv00+VwKNGX/vDcIosPk2NzHW5pAYYeHQy+WINzFtSgJx4o30dK7rtlGFjWNfaLRKQC0Cau4E1KLWZ+AP8iYjC5CLJEHL2VZhcbJaUivupJ40bP1Idh1bOI1me+F2GQ4sQuuqms8vzMPX1wIsweqFCqysco8ycO1RaFCs0OsZ8Ij9delh3jZG8QftYwdLGjM6XOh85MoRs4P7HoMrOw07S9SzB6NNyZa+YgP2lpdUXq/eA==" 
  claveRastreo="53771ALBO11032024195558814">
    <Beneficiario 
      BancoReceptor="ASP INTEGRA OPC" 
      Nombre="TECHNOLOGY AND INTEROPERABILITY SA DE CV" 
      TipoCuenta="40" 
      uenta="659437001005389354" 
      RFC="TIN160223BC2" 
      Concepto="sin concepto" 
      IVA="0.00" 
      MontoPago="10.00"/>
    <Ordenante 
      BancoEmisor="STP" 
      Nombre="CAROLINA MARUZZA" 
      TipoCuenta="40" 
      Cuenta="646180146003556692" 
      RFC="MAXC720729MNERXR07"/>
</SPEI_Tercero>
```

Sacar el valor del atributo `MontoPago` del elemento `Beneficiario`


## Subagent

### Create

POST https://agent.casinomex.vip/api/pyramid/create/agent/

Request
```json
{
  "username":"testsubagent01",
  "password":"1234",
  "email":"",
  "social_links":[
    {
      "link":"",
     "social_type":"WA"
    }
  ],
  "user_info":{
    "mobile_number":"",
    "first_name":"",
    "last_name":""
  },
  "agent_info":{
    "payments_percentage":50
  }
}
```

Response
```json
{
  "username": "testsubagent01",
  "password": "1234",
  "currency": "MXN",
  "agent_info": {
    "payments_percentage": 50,
    "can_create_sub_agents": false,
    "is_technical_agent": false
  },
  "email": ""

}
```

## Password restoration checklist

### Forgot password request
[x] Return consistent message for both existent and non-existent accounts
[x] Ensure consistent response time
[x] Rate limit restore request endpoint
[] Sanitize input on restore request endpoint

### Password reset request
[x] Send password twice
[] Enforce secure password policy
[x] Email user informing password has been reset
[x] Don't log user straight in, redirect to login page.
[x] Invalidate previous sessions

### URL token
[x] Either user a [criptographically secure random number](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#secure-random-number-generation) or JWT
