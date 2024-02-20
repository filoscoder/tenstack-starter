export type getPlayerId = number;

export interface getPlayerIdRequest extends Res {
  params: {
    id: getPlayerId;
  };
}
