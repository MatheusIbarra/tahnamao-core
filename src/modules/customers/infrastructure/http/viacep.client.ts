import { Injectable } from '@nestjs/common';

export interface ViaCepAddressSuggestion {
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

interface ViaCepResponse {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

@Injectable()
export class ViaCepClient {
  async lookup(cep: string): Promise<ViaCepAddressSuggestion | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3_000);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
        method: 'GET',
        signal: controller.signal,
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as ViaCepResponse;
      if (payload.erro) {
        return null;
      }

      return {
        logradouro: payload.logradouro,
        bairro: payload.bairro,
        cidade: payload.localidade,
        estado: payload.uf,
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}
