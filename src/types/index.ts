export type LotData = {
  name: string;
  value: number;
  id: string;
  startAngleRad: number;
  endAngleRad: number;
  startAngle: number;
  endAngle: number;
  color: string;
  winChance: number;
};

export enum AUCTION_TYPE {
  CLASSIC,
  ILIMINATION,
}
