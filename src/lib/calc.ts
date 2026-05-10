export type Combustivel = 'gasolina' | 'etanol';

export function custoPorKm(preco: number, autonomia: number): number {
  if (autonomia <= 0) throw new Error('autonomia deve ser > 0');
  return preco / autonomia;
}

export function melhorCombustivel(
  custoGasolina: number,
  custoEtanol: number
): Combustivel {
  return custoGasolina <= custoEtanol ? 'gasolina' : 'etanol';
}

export type EconomiaInput = {
  precoGasolina: number;
  autonomiaGasolina: number;
  precoEtanol: number;
  autonomiaEtanol: number;
  tanque: number;
};

export type EconomiaResult = {
  vencedor: Combustivel;
  custoGasolinaKm: number;
  custoEtanolKm: number;
  autonomiaTanqueGasolina: number;
  autonomiaTanqueEtanol: number;
  economiaRs: number;
};

export function economiaPorTanque(i: EconomiaInput): EconomiaResult {
  const cg = custoPorKm(i.precoGasolina, i.autonomiaGasolina);
  const ce = custoPorKm(i.precoEtanol, i.autonomiaEtanol);
  const vencedor = melhorCombustivel(cg, ce);
  const autoGas = i.autonomiaGasolina * i.tanque;
  const autoEta = i.autonomiaEtanol * i.tanque;
  const economiaRs = vencedor === 'gasolina'
    ? (ce - cg) * autoGas
    : (cg - ce) * autoEta;
  return {
    vencedor,
    custoGasolinaKm: cg,
    custoEtanolKm: ce,
    autonomiaTanqueGasolina: autoGas,
    autonomiaTanqueEtanol: autoEta,
    economiaRs: Math.max(0, economiaRs),
  };
}

export function regraSetenta(
  precoEtanol: number,
  precoGasolina: number,
  limite = 0.7
): { ratio: number; vale: boolean } {
  if (precoGasolina <= 0) throw new Error('preço gasolina deve ser > 0');
  const ratio = precoEtanol / precoGasolina;
  return { ratio, vale: ratio <= limite };
}

export function custoViagem(km: number, custoPorKm: number): number {
  return km * custoPorKm;
}

export function tanquesPorViagem(
  km: number,
  autonomia: number,
  tanque: number
): number {
  if (autonomia <= 0 || tanque <= 0) throw new Error('valores devem ser > 0');
  return Math.ceil(km / (autonomia * tanque));
}
