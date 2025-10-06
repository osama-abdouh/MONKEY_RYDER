import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface BestSellerProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  category_id: number;
  sales_count: number;
  category_name: string;
}

@Component({
  selector: 'app-best-seller',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './best-seller.html',
  styleUrl: './best-seller.css'
})
export class BestSellerComponent implements OnInit, AfterViewInit {
  bestSellerProducts: BestSellerProduct[] = [];
  backendUrl = 'http://localhost:3000';
  
  @ViewChild('carouselContainer') carouselContainer!: ElementRef<HTMLDivElement>;
  
  currentIndex = 0;
  cardsVisible = 4; // Number of cards visible at once
  cardWidth = 320; // Width of each card + margin
  canScrollLeft = false;
  canScrollRight = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadBestSellers();
  }

  ngAfterViewInit() {
    this.updateScrollButtons();
    
    // Add scroll event listener to update button states
    if (this.carouselContainer) {
      this.carouselContainer.nativeElement.addEventListener('scroll', () => {
        this.updateScrollButtons();
      });
    }
  }

  loadBestSellers() {
    this.http.get<BestSellerProduct[]>(`${this.backendUrl}/api/products/push?limit=9`).subscribe({
      next: (data) => {
        this.bestSellerProducts = data;
        console.log('Bestseller caricati:', data);
        // Update scroll buttons after data is loaded
        setTimeout(() => this.updateScrollButtons(), 100);
      },
      error: (error) => {
        console.error('Errore nel caricamento dei bestseller:', error);
        this.bestSellerProducts = [];
      }
    });
  }

  scrollCarousel(direction: number) {
    if (!this.carouselContainer) return;
    
    const container = this.carouselContainer.nativeElement;
    const scrollAmount = this.cardWidth * direction;
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
    
    // Update scroll buttons after scroll
    setTimeout(() => this.updateScrollButtons(), 300);
  }

  updateScrollButtons() {
    if (!this.carouselContainer) return;
    
    const container = this.carouselContainer.nativeElement;
    this.canScrollLeft = container.scrollLeft > 0;
    this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth);
  }

  onProductClick(product: BestSellerProduct) {
    console.log('Prodotto bestseller selezionato:', product);
    // Qui puoi navigare alla pagina del prodotto
    // this.router.navigate(['/product', product.id]);
  }

  formatPrice(price: string): string {
    return `€${parseFloat(price).toFixed(2)}`;
  }
}