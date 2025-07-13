import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { VerticalFooterComponent } from './components/vertical-footer/vertical-footer.component';
@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    VerticalFooterComponent
    
  ],
  exports : [
  HeaderComponent,
  FooterComponent,
  VerticalFooterComponent
  ]
})
export class SharedModule { }
