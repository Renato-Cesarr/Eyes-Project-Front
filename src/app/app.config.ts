import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthRepository } from './features/auth/domain/repositories/auth.repository';
import { AuthHttpService } from './features/auth/infrastructure/http/auth-http.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    { provide: AuthRepository, useExisting: AuthHttpService },
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
