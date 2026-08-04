import { Controller, Get, Post, Body, Query, Param } from "@nestjs/common";
import { PartnersService } from "./partners.service";

@Controller("partners")
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  getAllPartners() {
    return this.partnersService.findAll();
  }

  @Get("search")
  searchPartners(
    @Query("q") query: string,
    @Query("city") city?: string
  ) {
    return this.partnersService.search(query, city);
  }

  @Post(":id/reviews")
  addReview(
    @Param("id") id: string,
    @Body() body: { rating: number; comment: string; clientName: string }
  ) {
    return this.partnersService.addReview(id, body.rating, body.comment, body.clientName);
  }
}
