import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CategoryService } from './category.service';
import { ICategory } from '../../../../../../models/category.interface';
import { ICategoryRequest } from '../../../../../../models/CategoryRequest.interface';
import { environment } from '../../../../../../environments/environment';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/categories`;

  const mockCategory: ICategory = {
    id: 1,
    catName: 'Networking',
    dateCreated: '2026-08-01T10:30:00',
    createdBy: {
      id: 1,
      userHandle: 'suhad_sh',
      role: 'ADMIN',
    },
  };

  const mockCategories: ICategory[] = [
    mockCategory,
    {
      id: 2,
      catName: 'DevOps',
      dateCreated: '2026-08-02T14:15:00',
      createdBy: {
        id: 1,
        userHandle: 'suhad_sh',
        role: 'ADMIN',
      },
    },
  ];
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryService],
    });

    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should send a GET request to the categories endpoint', () => {
      service.getAll().subscribe((categories) => {
        expect(categories).toEqual(mockCategories);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategories);
    });

    it('should return an empty array when there are no categories', () => {
      service.getAll().subscribe((categories) => {
        expect(categories).toEqual([]);
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush([]);
    });
  });

  describe('getCategoryById', () => {
    it('should send a GET request to the correct URL with the given id', () => {
      service.getCategoryById('1').subscribe((category) => {
        expect(category).toEqual(mockCategory);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategory);
    });
  });

  describe('create', () => {
    it('should send a POST request with the category payload', () => {
      const request: ICategoryRequest = { catName: 'QA' };

      service.create(request).subscribe((category) => {
        expect(category).toEqual(mockCategory);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockCategory);
    });
  });

  describe('delete', () => {
    it('should send a DELETE request to the correct URL with the given id', () => {
      service.delete(1).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
