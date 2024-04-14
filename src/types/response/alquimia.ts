export type AlqApiManagerTokenResponse = {
  access_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
};

export type AlqTokenResponse = {
  access_token: string;
  scope: string | null;
  token_type: string;
  expires_in: number;
  refresh_token: string;
};

export type AlqToken = {
  token: string;
  expires_at: number;
};

export type AlqMovementResponse = {
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
  fecha_alta: string;
  fecha_actualizacion: string;
  concepto: string;
  descripcion: string | null;
  estatus_transaccion: number;
  id_establecimiento: number | null;
  id_categoria: number | null;
  clave_rastreo: string;
  id_cuenta_ahorro_medio_pago: number;
  concepto_otro: string | null;
  fecha_operacion: string;
  monto: string;
  valor_real: number;
  categoria: null;
  establecimiento: null;
  imagen_medio_pago: string;
  geolocalizacion: object;
};

export type AlqCuentaAhorroResponse = {
  id_cuenta_ahorro: number;
  id_cliente: number;
  nombre_cliente: string;
  id_producto_ahorro_empresa: number;
  saldo_ahorro: number;
  fecha_alta: string;
  fecha_actualizacion: string;
  activo: number;
  bloqueo_speiout: number;
  no_cuenta: string;
  fecha_actualizacion_movimientos: null;
  tarjeta_id: number;
  retiro_pendiente: string;
  cuenta_eje: null;
  cuenta_clabe: null;
  nombre_centro_costos: null;
  tipo_persona: string;
  tipo_persona_int: number;
  fondeador_stp_id: number;
  alias: string;
  id_cuenta_ahorro_padre: null;
  latitud: string;
  longitud: string;
  ubucacion_creacion: string;
  actuo_cuenta_propia: string;
  nombre_tercero: null;
  id_grupo_trabajo: null;
  id_distribuidor: null;
  cuenta_concentradora: number;
  nombre_empresa: string;
  token_id: string;
  rendimiento_mensual: null;
  rendimiento_total_acumulado: null;
}[];
