import { Injectable, NotFoundException } from "@nestjs/common";
import { BlockchainService } from "../blockchain/blockchain.service";

export interface PartnerProfileDto {
  bio?: string;
  specialties: string[];
  technologies: string[];
  brands: string[];
  devices: string[];
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  serviceType: "PRESENTIAL" | "REMOTE" | "HYBRID";
}

@Injectable()
export class PartnersService {
  constructor(private readonly blockchainService: BlockchainService) {}

  // Mock em memória para perfis de parceiros
  private partners: any[] = [
    {
      id: "partner_1",
      name: "Claudio Técnico Especialista",
      email: "claudio@especialista.com",
      bio: "Especialista em equipamentos de áudio vintage, amplificadores valvulados e restauração.",
      specialties: ["Amplificador Valvulado", "Mesa de Som", "Pedais de Efeito"],
      technologies: ["Valvulado", "Analógico", "SMD"],
      brands: ["Marshall", "Fender", "Vox", "Orange"],
      devices: ["Audio", "Instrumento Musical"],
      city: "São Paulo",
      state: "SP",
      latitude: -23.5505,
      longitude: -46.6333,
      serviceType: "PRESENTIAL",
      rating: 4.9,
      reviews: [
        { id: "rev_1", clientName: "Roberto Filho", rating: 5, comment: "Excelente reparo no meu Marshall JCM800. Altamente qualificado!" }
      ]
    },
    {
      id: "partner_2",
      name: "Mariana Microsoldagem",
      email: "mariana@microsoldagem.com",
      bio: "Recuperação avançada de placas de notebooks, MacBooks e consoles de videogame.",
      specialties: ["Reparo de Placa Mãe", "Reballing BGA", "Curto em Linhas Primárias"],
      technologies: ["SMD", "BGA", "Digital"],
      brands: ["Apple", "Dell", "Sony", "Microsoft"],
      devices: ["Notebook", "Videogame"],
      city: "Campinas",
      state: "SP",
      latitude: -22.9056,
      longitude: -47.0608,
      serviceType: "HYBRID",
      rating: 4.8,
      reviews: []
    }
  ];

  // Retorna todos os especialistas da rede
  findAll() {
    return this.partners;
  }

  // Busca inteligente por especialidade, marca, tecnologia ou proximidade geográfica
  search(query: string, city?: string, maxDistanceKm?: number) {
    let results = this.partners;

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.specialties.some((s) => s.toLowerCase().includes(q)) ||
          p.technologies.some((t) => t.toLowerCase().includes(q)) ||
          p.brands.some((b) => b.toLowerCase().includes(q)) ||
          p.devices.some((d) => d.toLowerCase().includes(q)) ||
          p.bio.toLowerCase().includes(q)
      );
    }

    if (city) {
      results = results.filter((p) => p.city.toLowerCase() === city.toLowerCase());
    }

    return results;
  }

  // Registra uma nova avaliação salvando o recibo em blockchain (Polygon L2)
  async addReview(partnerId: string, rating: number, comment: string, clientName: string) {
    const partner = this.partners.find((p) => p.id === partnerId);
    if (!partner) {
      throw new NotFoundException("Especialista não localizado na rede.");
    }

    const reviewData = {
      partnerId,
      rating,
      comment,
      clientName,
      timestamp: new Date().toISOString()
    };

    // Ancora a avaliação na Blockchain (Fase 3 - Imutabilidade de reputação)
    const tx = await this.blockchainService.anchorLog("PartnerReview", partnerId, reviewData);

    const newReview = {
      id: `rev_${Date.now()}`,
      clientName,
      rating,
      comment,
      blockchainTx: tx.txHash,
      createdAt: tx.timestamp
    };

    partner.reviews.push(newReview);
    
    // Recalcula média de estrelas
    const totalRating = partner.reviews.reduce((acc, r) => acc + r.rating, 0);
    partner.rating = parseFloat((totalRating / partner.reviews.length).toFixed(1));

    return {
      partner,
      review: newReview,
      txHash: tx.txHash,
      blockNumber: tx.blockNumber
    };
  }
}
