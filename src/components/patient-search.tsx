'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, Search, Loader2, AlertCircle } from 'lucide-react';
import { TableLoadingSkeleton } from '@/components/loading-skeleton';
import type { PatientSummary, PaginatedResult } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface PatientSearchProps {
  initialData: PaginatedResult<PatientSummary>;
}

export function PatientSearch({ initialData }: PatientSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  console.log('PatientSearch component rendered with initialData:', initialData);
  
  const [data, setData] = useState<PaginatedResult<PatientSummary>>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  console.log('Component state:', { 
    data, 
    loading, 
    error, 
    searchTerm, 
    debouncedSearchTerm,
    searchParams: Object.fromEntries(searchParams.entries())
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data when search term or page changes
  const fetchPatients = useCallback(async (page: number, search?: string) => {
    console.log('fetchPatients called with:', { page, search });
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      
      const url = `/api/patients?${params.toString()}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Response data:', result);
        setData(result);
        
        // Update URL
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page.toString());
        if (search) newParams.set('search', search);
        else newParams.delete('search');
        router.push(`?${newParams.toString()}`);
      } else {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || 'Error fetching patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError(error instanceof Error ? error.message : 'Error fetching patients');
    } finally {
      setLoading(false);
    }
  }, [router, searchParams]);

  // Handle search
  useEffect(() => {
    const currentSearchParam = searchParams.get('search') || ''; // Normalize null to empty string
    console.log('Search effect triggered:', { 
      debouncedSearchTerm, 
      currentSearch: currentSearchParam,
      willFetch: debouncedSearchTerm !== currentSearchParam
    });
    
    if (debouncedSearchTerm !== currentSearchParam) {
      console.log('Fetching patients due to search change');
      fetchPatients(1, debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, fetchPatients, searchParams]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchPatients(newPage, debouncedSearchTerm);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search form submitted with term:', searchTerm);
    fetchPatients(1, searchTerm);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    fetchPatients(1, '');
  };

  return (
    <div>
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar pacientes por nombre..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 bg-card"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
          </Button>
          {searchTerm && (
            <Button type="button" variant="outline" onClick={clearSearch} disabled={loading}>
              Limpiar
            </Button>
          )}
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <Alert className="mb-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Fecha de Nacimiento</TableHead>
              <TableHead>Última Visita</TableHead>
              <TableHead>Visitas</TableHead>
              <TableHead className="text-right">Ver</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="p-0">
                  <TableLoadingSkeleton rows={5} />
                </TableCell>
              </TableRow>
            ) : data.data.length > 0 ? (
              data.data.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    {`${patient.firstName} ${patient.lastName}`}
                  </TableCell>
                  <TableCell>
                    {patient.dob ? format(parseISO(patient.dob), "d 'de' MMMM, yyyy") : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {patient.lastVisitDate ? format(parseISO(patient.lastVisitDate), "d 'de' MMMM, yyyy") : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{patient.visitCount}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/patients/${patient.id}`} className="text-primary hover:underline">
                      Detalles
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  {debouncedSearchTerm ? 'No se encontraron pacientes con ese nombre.' : 'No hay pacientes registrados.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Mostrando {((data.pagination.page - 1) * data.pagination.limit) + 1} a{' '}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} de{' '}
            {data.pagination.total} pacientes
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.pagination.page - 1)}
              disabled={!data.pagination.hasPrev || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                if (data.pagination.totalPages <= 5) {
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === data.pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                }
                
                // Show first page, current page, and last page with ellipsis
                if (pageNum === 1 || pageNum === data.pagination.totalPages || 
                    (pageNum >= data.pagination.page - 1 && pageNum <= data.pagination.page + 1)) {
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === data.pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                }
                
                if (pageNum === 2 && data.pagination.page > 3) {
                  return <span key={pageNum} className="px-2">...</span>;
                }
                
                if (pageNum === data.pagination.totalPages - 1 && data.pagination.page < data.pagination.totalPages - 2) {
                  return <span key={pageNum} className="px-2">...</span>;
                }
                
                return null;
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.pagination.page + 1)}
              disabled={!data.pagination.hasNext || loading}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
