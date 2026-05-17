import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { LibSnackbarService } from './lib-snackbar.service';

describe('LibSnackbarService', () => {
  let service: LibSnackbarService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    TestBed.configureTestingModule({});
    service = TestBed.inject(LibSnackbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should enqueue a message and return its id', () => {
    const id = service.open({ text: 'Test message' });
    expect(typeof id).toBe('number');
    expect(service.messages().length).toBe(1);
    expect(service.messages()[0].text).toBe('Test message');
  });

  it('should use default variant "info" when not specified', () => {
    service.open({ text: 'Test' });
    expect(service.messages()[0].variant).toBe('info');
  });

  it('should use the provided variant', () => {
    service.open({ text: 'Error', variant: 'error' });
    expect(service.messages()[0].variant).toBe('error');
  });

  it('should auto-dismiss after duration ms', () => {
    service.open({ text: 'Auto dismiss', duration: 3000 });
    expect(service.messages().length).toBe(1);
    vi.advanceTimersByTime(3000);
    expect(service.messages().length).toBe(0);
  });

  it('should NOT auto-dismiss when duration is 0', () => {
    service.open({ text: 'Sticky', duration: 0 });
    vi.advanceTimersByTime(10000);
    expect(service.messages().length).toBe(1);
  });

  it('should dismiss by id', () => {
    const id = service.open({ text: 'Dismiss me' });
    service.dismiss(id);
    expect(service.messages().length).toBe(0);
  });

  it('should dismissAll messages', () => {
    service.open({ text: 'First' });
    service.open({ text: 'Second' });
    expect(service.messages().length).toBe(2);
    service.dismissAll();
    expect(service.messages().length).toBe(0);
  });
});
