import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { Character } from '../../models/character';
import { finalize, catchError } from 'rxjs/operators'; // Import finalize and catchError
import { of } from 'rxjs'; // Import 'of' to return an observable in case of error

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './character-list.html',
  styleUrls: ['./character-list.scss']
})
export class CharacterListComponent implements OnInit {
  // 3. Inyecta tu servicio Api
  private api = inject(Api);

  // 4. Declara la señal pública de personajes:
  public characters = this.api.characters;

  // 5. Define propiedades para el estado de la UI:
  public searchTerm: string = '';
  public loading = signal<boolean>(false); // Using signal for loading state
  public errorMessage = signal<string>(''); // Using signal for error message

  // 6. Crea una señal computada hasCharacters:
  public hasCharacters = computed(() => this.characters().length > 0);

  // 7. Implementa ngOnInit():
  ngOnInit(): void {
    this.loadInitialCharacters();
  }

  // 8. Implementa loadInitialCharacters():
  loadInitialCharacters(): void {
    // Establecer el estado de carga (loading) a true y limpiar cualquier mensaje de error previo (errorMessage).
    this.loading.set(true);
    this.errorMessage.set('');

    // Llamar al método 'getCharacters()' de tu servicio 'Api'.
    this.api.getCharacters().pipe(
      // Utiliza el operador finalize de RxJS para establecer loading a false una vez que la petición haya terminado.
      finalize(() => this.loading.set(false)),
      // En caso de error, puedes usar catchError de RxJS o manejarlo en el bloque error de la suscripción
      catchError(error => {
        console.error('Error loading initial characters:', error);
        this.errorMessage.set('No se pudieron cargar los personajes. Inténtalo de nuevo más tarde.');
        // Return a new observable that emits no items to prevent the original observable from completing
        return of({ info: null, results: [] }); // Return an empty ApiResponse to continue the stream
      })
    ).subscribe({
      // Dentro de la suscripción, no necesitas actualizar los personajes (el servicio ya lo hace)
      next: () => {
        // console.log('Characters loaded successfully via subscription (signal updated in service)');
      },
      error: () => {
        // Error handling is done in catchError, so this block might not be strictly necessary if catchError re-throws or handles fully.
        // But it's good practice to have it to catch any unhandled errors or for logging.
      }
    });
  }

  // 9. Implementa onSearch():
  onSearch(): void {
    // Establecer el estado de carga (loading) a true y limpiar cualquier mensaje de error previo (errorMessage).
    this.loading.set(true);
    this.errorMessage.set('');

    // Llamar al método 'searchCharacters()' de tu servicio 'Api', pasándole el searchTerm actual.
    this.api.searchCharacters(this.searchTerm).pipe(
      // Utiliza el operador finalize de RxJS para establecer loading a false al finalizar.
      finalize(() => this.loading.set(false)),
      // En caso de error, asigna un mensaje a errorMessage.
      catchError(error => {
        console.error('Error searching characters:', error);
        // Check if the error is a 404 (No characters found) or a generic error
        if (error.status === 404) {
          this.errorMessage.set('No se encontraron personajes con ese término de búsqueda.');
        } else {
          this.errorMessage.set('Error al buscar personajes. Inténtalo de nuevo más tarde.');
        }
        return of({ info: null, results: [] }); // Return an empty ApiResponse
      })
    ).subscribe({
      next: () => {
        // console.log('Search results loaded successfully (signal updated in service)');
      },
      error: () => {
        // Same as loadInitialCharacters, error is handled by catchError
      }
    });
  }

  // 10. onSearchKeyup(event: KeyboardEvent):
  // Este método ya está implementado, solo asegúrate de que llama a this.onSearch() cuando la tecla presionada es "Enter".
  onSearchKeyup(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }
}