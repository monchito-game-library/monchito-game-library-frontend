import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { DatepickerFieldClickDirective } from './datepicker-field-click.directive';

@Component({
  template: `
    <mat-form-field [appDatepickerFieldClick]="picker">
      <mat-label>Fecha</mat-label>
      <input matInput [matDatepicker]="picker" [formControl]="ctrl" [readonly]="true" />
      <mat-datepicker #picker></mat-datepicker>
    </mat-form-field>
  `,
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, DatepickerFieldClickDirective]
})
class TestHostComponent {
  @ViewChild('picker') picker!: MatDatepicker<Date>;
  ctrl = new FormControl<Date | null>(null);
}

describe('DatepickerFieldClickDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideNativeDateAdapter()]
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  describe('onClick', () => {
    it('abre el datepicker al hacer click dentro del wrapper del campo', () => {
      const openSpy = vi.spyOn(host.picker, 'open');
      const wrapper: HTMLElement = fixture.nativeElement.querySelector('.mat-mdc-text-field-wrapper');

      wrapper.click();

      expect(openSpy).toHaveBeenCalledOnce();
    });

    it('no abre el datepicker al hacer click en el área de subscript', () => {
      const openSpy = vi.spyOn(host.picker, 'open');
      const subscript: HTMLElement | null = fixture.nativeElement.querySelector(
        '.mat-mdc-form-field-subscript-wrapper'
      );

      subscript?.click();

      expect(openSpy).not.toHaveBeenCalled();
    });
  });
});
