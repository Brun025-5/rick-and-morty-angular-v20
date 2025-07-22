import { Injectable, inject, signal, WritableSignal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiResponse, Character } from '../models/character';

@Injectable({
  providedIn: 'root'
})
export class Api {
  // 1. Define la API_URL
  private readonly API_URL: string = 'https://rickandmortyapi.com/api/character';

  // 2. Inyecta HttpClient
  private readonly http = inject(HttpClient);

  // 3. Gestiona el estado de los personajes con señales:
  // Crea una señal privada (private) llamada charactersSignal que almacenará un arreglo de Character[]
  private charactersSignal: WritableSignal<Character[]> = signal([]);

  // Expón una versión pública de solo lectura (public readonly) de esta señal, llamada characters
  public readonly characters: Signal<Character[]> = this.charactersSignal.asReadonly();

  // 4. Implementa getCharacters()
  getCharacters(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.API_URL).pipe(
      // Encadena el operador tap() de RxJS. Dentro de tap(), actualiza la señal charactersSignal
      // con el arreglo de personajes que viene en la propiedad results de la respuesta de la API.
      tap(response => {
        this.charactersSignal.set(response.results);
      })
    );
  }

  // 5. Implementa searchCharacters(name: string)
  searchCharacters(name: string): Observable<ApiResponse> {
    // Primero, verifica si el parámetro name está vacío o solo contiene espacios en blanco.
    // Si es así, llama al método getCharacters() (para mostrar todos los personajes) y retorna su resultado.
    if (!name || name.trim() === '') {
      return this.getCharacters();
    }

    // De lo contrario, construye una URL de búsqueda añadiendo el parámetro ?name= al API_URL con el valor de name
    const searchUrl = `${this.API_URL}/?name=${name.trim()}`;

    // Realiza una petición GET a esta URL de búsqueda utilizando HttpClient.
    return this.http.get<ApiResponse>(searchUrl).pipe(
      // Al igual que en getCharacters(), encadena el operador tap() para actualizar la señal
      // charactersSignal con los nuevos resultados de la búsqueda.
      tap(response => {
        this.charactersSignal.set(response.results);
      })
    );
  }
}