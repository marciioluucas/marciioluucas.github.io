import { describe, it, expect } from 'vitest';
import {
  custoPorKm,
  melhorCombustivel,
  economiaPorTanque,
  regraSetenta,
  custoViagem,
  tanquesPorViagem,
} from '../src/lib/calc';

describe('custoPorKm', () => {
  it('divide preço pela autonomia', () => {
    expect(custoPorKm(4.9, 10)).toBeCloseTo(0.49);
  });
  it('lança erro com autonomia zero', () => {
    expect(() => custoPorKm(4.9, 0)).toThrow();
  });
});

describe('melhorCombustivel', () => {
  it('escolhe gasolina quando custo é menor', () => {
    expect(melhorCombustivel(0.5, 0.6)).toBe('gasolina');
  });
  it('escolhe etanol quando custo é menor', () => {
    expect(melhorCombustivel(0.6, 0.5)).toBe('etanol');
  });
  it('empate fica com gasolina por convenção', () => {
    expect(melhorCombustivel(0.5, 0.5)).toBe('gasolina');
  });
});

describe('economiaPorTanque', () => {
  it('calcula economia em R$ usando o tanque do vencedor', () => {
    const r = economiaPorTanque({
      precoGasolina: 4.9, autonomiaGasolina: 10,
      precoEtanol: 3.79, autonomiaEtanol: 7,
      tanque: 56,
    });
    expect(r.vencedor).toBe('gasolina');
    expect(r.economiaRs).toBeGreaterThan(0);
  });
});

describe('regraSetenta', () => {
  it('vale quando ratio <= limite', () => {
    const r = regraSetenta(3.43, 4.9, 0.7);
    expect(r.ratio).toBeCloseTo(0.7);
    expect(r.vale).toBe(true);
  });
  it('não vale acima do limite', () => {
    const r = regraSetenta(3.6, 4.9, 0.7);
    expect(r.vale).toBe(false);
  });
});

describe('custoViagem', () => {
  it('multiplica km por custo/km', () => {
    expect(custoViagem(100, 0.49)).toBeCloseTo(49);
  });
});

describe('tanquesPorViagem', () => {
  it('arredonda para cima', () => {
    expect(tanquesPorViagem(1000, 10, 56)).toBe(2);
  });
});
