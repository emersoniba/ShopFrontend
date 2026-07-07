// src/app/interceptors/pagination.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class PaginationInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            map(event => {
                // Solo transformar respuestas con estructura de paginación
                if (event instanceof HttpResponse && event.body) {
                    const body = event.body;
                    // Si tiene la estructura { message, data: { results } }
                    if (body.data && typeof body.data === 'object' && 'results' in body.data) {
                        // Transformar a { results, count, next, previous }
                        const transformedBody = {
                            results: body.data.results || [],
                            count: body.data.count || 0,
                            next: body.data.next || null,
                            previous: body.data.previous || null,
                            total_pages: body.data.total_pages || 0,
                            current_page: body.data.current_page || 1
                        };
                        return event.clone({ body: transformedBody });
                    }
                }
                return event;
            })
        );
    }
}