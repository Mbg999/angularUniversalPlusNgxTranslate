import { Component, Inject, Optional } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Request } from 'express';
import { REQUEST } from '@nguniversal/express-engine/tokens';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'universalpruebas';

  constructor(
    private translateService: TranslateService,
    @Optional() @Inject(REQUEST) private request: Request
  ) {
    // settear el uso del lenguage almacenado |
    //  por defecto setteado por el programador | defecto por el navegador | ingles
    this.changeCurrentLang(
      this.request?.cookies?.lang ||
      // leer document.cookie y buscar lang para obtener el almacenado
        this.translateService.getDefaultLang() ||
        this.translateService.getBrowserLang() ||
        'en'
    );
  }

  changeCurrentLang(lang: string) {
    this.translateService.use(lang);
  }
}
