import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SearchQuery, SearchResult } from '../../shared/models/search';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);
  private readonly base = '/api/flights';

  search(q: SearchQuery) {
    const params: any = { ...q };
    return this.http.get<SearchResult>(`${this.base}/search`, { params });
  }
}
