import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  currentIndex = 0;
  testimonials = [
    {
      quote: "Gracias a GeoBike recuperé mi moto en menos de una hora. El sistema de rastreo es increíblemente preciso.",
      author: "Rafael S.",
      role: "Usuario desde julio 2025",
      image: "https://randomuser.me/api/portraits/men/35.jpg",
      stars: 5
    },
    {
      quote: "La aplicación es muy intuitiva y las alertas me han salvado dos veces de robos. ¡Totalmente recomendado!",
      author: "Viviana M.",
      role: "Usuario desde junio 2025",
      image: "https://randomuser.me/api/portraits/women/42.jpg",
      stars: 5
    }
  ];

  nextTestimonial() {
    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
  }

  prevTestimonial() {
    this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
  }

  get starsArray() {
    return Array(this.testimonials[this.currentIndex].stars).fill(0);
  }
}
