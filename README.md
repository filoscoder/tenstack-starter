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

### Jugadores
+ [Ver Jugador](#ver-jugador)
+ [Crear Jugador](#crear-jugador)
+ [Login de Jugador](#login-jugador)

#### Cuentas Bancarias
+ [Ver Cuentas Bancarias](#ver-cuentas-bancarias-🔒)
+ [Crear Cuenta Bancaria](#crear-cuenta-bancaria-🔒)
+ [Actualizar Cuenta Bancaria](#actualizar-cuenta-bancaria-🔒)
+ [Eliminar Cuenta Bancaria](#eliminar-cuenta-bancaria-🔒)

### Transferencias
+ [Cargar Fichas](#cargar-fichas-🔒)
+ [Retirar Premios](#retirar-premios-🔒)
+ [Ver Depósitos Pendientes](#ver-depósitos-pendientes-🔒)
+ [Confirmar Depósito Pendiente](#confirmar-depósito-pendiente-🔒)
+ [Eliminar Depósito Pendiente](#eliminar-depósito-pendiente-🔒)
+ [Ver Cuenta Bancaria de Alquimia](#ver-cuenta-alquimia-🔒)

### Agente
+ [Login de Agente](#login-agente)
+ [Ver Pagos](#ver-pagos-🔒)
+ [Marcar Pago Como Completado](#marcar-pago-como-completado-🔒)
+ [Ver Depósitos](#ver-depósitos-🔒)
+ [Ver QR](#ver-qr-🔒)
+ [Ver Cuenta Bancaria](#ver-cuenta-bancaria-🔒)
+ [Actualizar Cuenta Bancaria](#actualizar-cuenta-bancaria-🔒)
+ [Ver Balance Casino](#ver-balance-casino-🔒)
+ [Ver Balance Alquimia](#ver-balance-alquimia-🔒)
+ [Liberar Fichas Pendientes](#liberar-fichas-pendientes-🔒)
+ [Indicar Que El Agente Esta De Guardia](#setear-guardia-🔒)
+ [Ver Estado De Guardia]

### Auth
+ [Refrescar Token](#refrescar-token)
+ [Logout](#logout-🔒)

### [Interfaces](#interfaces-1)

### [Despliegue](#despliegue-1)

Jugadores
---------

### Ver Jugador 🔒

|Endpoint:| `/players/`|
---|---|
Método      | `GET`
Devuelve    | [`Player & { bank_accounts: BankAccount[] }`](#player)
Requiere rol| player

### Crear Jugador

|Endpoint:| `/players`|
---|---|
Método      | `POST`
Body (json) | [`PlayerRequest`](#playerrequest)
Devuelve    | [`LoginResponse`](#loginresponse)

### Login Jugador

|Endpoint| `/players/login`|
---|---|
Método      |`POST`
Body (json) | [`Credenciales`](#credenciales)
Devuelve    | [`LoginResponse`](#loginresponse)

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

### Retirar Premios 🔒

|Endpoint| `/transactions/cashout`|
---|---|
Método      |`POST`
Body (json) |[`CashoutRequest`](#cashoutrequest)
Devuelve    |[`CoinTransferResult`](#cointransferresult)
Requiere rol| player

### Ver Depósitos Pendientes 🔒

|Endpoint| `/transactions/deposit/pending`|
---|---|
Método      |`GET`
Devuelve    |[`Deposit[]`](#deposit)
Requiere rol| player

> **Nota:** siempre devuelve un array

### Confirmar Depósito Pendiente 🔒

|Endpoint| `/transactions/deposit/:id/confirm`|
---|---|
Método      |`POST`
Devuelve    |[`DepositResult`](#depositresult)
Requiere rol| player

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

Agente
------

### Login Agente

|Endpoint| `/agent/login`|
---|---|
Método      |`POST`
Body (json) |[`Credenciales`](#credenciales)
Devuelve    |[`Tokens`](#tokens)

### Ver Pagos 🔒

|Endpoint| `/agent/payments`|
---|---|
Método      |`GET`
Devuelve    |[`Payment[]`](#payment)
Requiere rol| agent

### Marcar Pago Como Completado 🔒

|Endpoint| `/agent/payments/:id/paid`|
---|---|
Método      |`POST`
Devuelve    |[`Payment`](#payment)
Requiere rol| agent

### Ver Depósitos 🔒

|Endpoint| `/agent/deposits/:id?`|
---|---|
Método      |`GET`
Devuelve    |[`Deposit[]`](#deposit)
Requiere rol| agent

### Ver QR 🔒

|Endpoint| `/agent/qr`|
---|---|
Método      |`GET`
Devuelve    |`Blob`
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

### Liberar Fichas Pendientes 🔒
Liberar transferencias que hayan quedado pendientes en el caso que un jugador quiera comprar mas fichas de las que tiene dispoibles el agente

|Endpoint| `/agent/deposits/complete`|
---|---|
Método      |`GET`
Devuelve    |[`Deposit[]`](#deposit) - los depositos afectados
Requiere rol| agent

### Setear Guardia 🔒
Indicar que alguien está al teléfono para que el bot muestre el menú "contactanos".

|Endpoint| `/agent/on-call`|
---|---|
Método      |`POST`
Body (json) |[`OnCallRequest`](#oncallrequest)
Devuelve    |200 OK
Requiere rol| agent

### Ver Guardia 🔒
Indicar que alguien está al teléfono para que el bot muestre el menú "contactanos".

|Endpoint| `/agent/on-call`|
---|---|
Método      |`GET`
Devuelve    |boolean
Requiere rol| agent

## Interfaces

### Player
```typescript
{
  id: string
  panel_id: number
  username: string
  email: string?
  first_name: string?
  last_name: string?
  date_of_birth: string?
  movile_number: string?
  country: string?
  balance_currency: string
  status: string
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
}
``` 

### BankAccountRequest
```typescript
{
  owner: string                       // Nombre del beneficiario
  owner_id: number                    // DNI
  bankName: string                    // Nombre del banco
  bankNumber: string                  // CBU
  bankAlias: string?   
}
```

### BankAccount
```typescript
{
  id: string        
  owner: string                       // Nombre del beneficiario
  owner_id: number                    // DNI
  player_id: string                   // ID de Player
  bankName: string                    // Nombre del banco
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
}
```

### CashoutRequest
```typescript
{
  amount: number
  bank_account: number                // ID de cuenta bancaria
}
```

### CoinTransferResult
Estado de transferencia de fichas
```typescript
{
  ok: boolean
  player_balance: number
  error: string?                      // En caso de error, el motivo
}
```

### DepositResult
```typescript
{
  player_balance: number?             // undefined en caso de fichas no transferidas
  error: string?                      // En caso de error, el motivo
  deposit: Deposit
}
```

### Deposit
```typescript
{
  id: string
  player_id: string
  currency: string
  dirty: boolean
  // Esperando verificacion | verificado en alquimia | verificado y fichas enviadas | todo OK | eliminado por agente
  status: "pending"|"verified"|"confirmed"|"completed"|"deleted"
  tracking_number: string
  amount: number
  created_at: datetime                // 2024-02-23T12:35:51.017Z
  updated_at: datetime                // 2024-02-23T12:35:51.017Z
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
  bankName: string
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

- Cambiar contraseña (no funciona en el casino, vamos por este lado)
  - Endpoint https://agent.casinomex.vip/api/users/5941/change-password/
  - Body: `{ new_password:	string }`
- Log errors to file
- Usar endpoint /auth/logout en frontend
- [Bot Whatsapp](https://bot-whatsapp.netlify.app/) ✅
  + [Diagrama Flujo](https://www.figma.com/file/rtxhrNqQxdEdYzOfPl1mRc/Whatsapp-Bot?type=whiteboard&node-id=0%3A1&t=5ACojRhp99vrh24S-1)
- Chequear si agent existe en la bbdd en `seed.ts`
- Subir la duracion del refresh token a 24 horas
- Tomar duracion de los tokens de `.env`
- Balance Alquimia en panel agente
- Tener en cuenta que pasa si el casino devuelve 200 a una transfer de fichas pero la transferencia no pasa
- Limpiar tabla TOKENS periodicamente
- Chequear token sesion en dos dispositivos

### Fichas insuficientes

- Revisar respuesta y avisarle al agente si quedaron transferencias sin liberar


## Optimizaciones

- Invalidar tokens en conjunto con una sola petición SQL
- Usar instancia global de prisma.


## Alquimia 

- ID Cuenta ahorro: 120902

Listar cuentas de ahorro 
```bash
curl -X GET \
-H "Authorization: Bearer $API_TOKEN" \
-H "AuthorizationAlquimia: Bearer $ALQ_TOKEN" \
${ALQ_TEST_BASE_URL}1.0.0/v2/cuenta-ahorro-cliente \
-H 'Content-Type: x-www-form-urlencoded' \
-d 'id_cliente=2733226' 
```

Listar TX pendientes
```bash
curl -X GET \
-H "Authorization: Bearer $API_TOKEN" \
-H "AuthorizationAlquimia: Bearer $ALQ_TOKEN" \
"${ALQ_BASE_URL}1.0.0/v2/ordenes-importador?id_cuenta=120902"
```

Consultar status TX
```bash
curl -X GET\
-H "Authorization: Bearer $API_TOKEN" \
-H "AuthorizationAlquimia: Bearer $ALQ_TOKEN" \
"${ALQ_BASE_URL}1.0.0/v2/consulta-status-tx" \
-d 'id_cuenta=120902&id_transaccion=18489885' \
-H 'Content-Type: x-www-form-urlencoded'
```
Devuelve 404 al intentar confirmar el ingreso de $10 con su id_transaccion

Consulta de movimientos
- Consulta movimientos `/1.0.0/v2/cuenta-ahorro-cliente`
  + Si el movimiento figura en la lista devuelta por "Consulta de Movimientos", esta confirmado? 
  + Cuales son los posibles valors del campo `estatus_transaccion` en el resultado de este endpoint?
- el endpoint "Consulta estatus TX `/1.0.0/v2/consulta-estatus-tx`" nos sirve para confirmar transferencias recibidas? o solo pagos salientes?


