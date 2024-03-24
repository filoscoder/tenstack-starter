export interface AlqApiManagerTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

export interface AlqTokenResponse {
  access_token: string;
  scope: string | null;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export interface AlqToken {
  token: string;
  expires_at: number;
}

export interface AlqMovement {
  id_transaccion: number;
  tipo_transaccion: number;
  id_cuenta_ahorro: number;
  id_medio_pago: number;
  id_cliente: number;
  instructor: string;
  autorizador: string;
  tipo_movimiento: number;
  tipo_cargo: number;
  tipo_operacion: number;
  fecha_alta: string; // yyyy-mm-dd hh:mm:ss
  fecha_actualizacion: string; // yyyy-mm-dd hh:mm:ss
  concepto: string;
  descripcion: string | null;
  estatus_transaccion: number;
  id_establecimiento: number | null;
  id_categoria: number | null;
  clave_rastreo: string;
  id_cuenta_ahorro_medio_pago: number;
  concepto_otro: string | null;
  fecha_operacion: string; // yyyy-mm-dd
  monto: string;
  valor_real: number;
  categoria: null;
  establecimiento: null;
}
