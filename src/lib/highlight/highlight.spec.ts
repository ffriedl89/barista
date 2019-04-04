import { async, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { DtHighlightModule } from '@dynatrace/angular-components';
import { By } from '@angular/platform-browser';

describe('DtHighlight', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DtHighlightModule],
      declarations: [
        TestComponentWithoutTerm,
        TestComponentWithHtmlInText,
        TestComponentWithStaticQueryAndStaticText,
        TestComponentWithMultipleHighlights,
        TestComponentWithStaticCaseSensitive,
        TestComponentWithHighlightedHtml,
        TestComponentWithInputBindung,
        TestComponentWithTextBinding,
      ],
    });

    TestBed.compileComponents();
  }));
  describe('with initial behaviour', () => {

    it('should show the original text if no term is given', () => {
      const fixture = TestBed.createComponent(TestComponentWithoutTerm);
      const containerEl = fixture.debugElement.query(By.css('.dt-highlight')).nativeElement;

      fixture.detectChanges();
      const transformed = containerEl.lastChild as HTMLElement;
      expect(transformed.innerHTML).toMatch('Original text where nothing should be highlighted');
    });

    it('should contain one container for the original source and one for the escaped text', () => {
      const fixture = TestBed.createComponent(TestComponentWithHtmlInText);
      const containerEl = fixture.debugElement.query(By.css('.dt-highlight')).nativeElement;

      expect(containerEl.childNodes.length).toBe(2);
      const hiddenSource = containerEl.firstChild as HTMLElement;
      const transformed = containerEl.lastChild as HTMLElement;
      expect(hiddenSource.tagName).toMatch('DIV');
      expect(hiddenSource.innerHTML).toMatch('Some <b>text where</b> with html characters');
      expect(transformed.tagName).toMatch('SPAN');
    });

    it('should escape every html character in the projected content', () => {
      const fixture = TestBed.createComponent(TestComponentWithHtmlInText);
      const containerEl = fixture.debugElement.query(By.css('.dt-highlight')).nativeElement;

      const transformed = containerEl.lastChild as HTMLElement;
      expect(transformed.tagName).toMatch('SPAN');
      expect(transformed.innerHTML).toMatch('');

      fixture.detectChanges();
      expect(transformed.innerHTML).toMatch('Some &lt;b&gt;text where&lt;/b&gt; with html characters');
    });

    it('should wrap the highlighted word with a mark tag', () => {
      const fixture = TestBed.createComponent(TestComponentWithStaticQueryAndStaticText);
      const containerEl = fixture.debugElement.query(By.css('.dt-highlight')).nativeElement;

      const transformed = containerEl.lastChild as HTMLElement;
      expect(transformed.tagName).toMatch('SPAN');
      expect(transformed.innerHTML).toMatch('');

      fixture.detectChanges();
      const highlights = transformed.querySelectorAll('.dt-highlight-mark');
      expect(highlights.length).toBe(1);
      expect(highlights[0].tagName).toMatch('MARK');
      expect(highlights[0].innerHTML).toMatch('wher');
    });

    it('should find multiple occurrences of the term that should be highlighted', () => {
      const fixture = TestBed.createComponent(TestComponentWithMultipleHighlights);
      const containerEl = fixture.debugElement.query(By.css('.dt-highlight')).nativeElement;

      const transformed = containerEl.lastChild as HTMLElement;
      expect(transformed.tagName).toMatch('SPAN');
      expect(transformed.innerHTML).toMatch('');

      fixture.detectChanges();
      const highlights = transformed.querySelectorAll('.dt-highlight-mark');
      expect(highlights.length).toBe(4);
      expect(highlights[0].tagName).toMatch('MARK');
      expect(highlights[0].innerHTML).toMatch('S');
      expect(highlights[1].innerHTML).toMatch('s');
      expect(highlights[2].innerHTML).toMatch('s');
      expect(highlights[3].innerHTML).toMatch('s');
    });

    it('should find multiple occurrences of the term that should be highlighted but case sensitive', () => {
      const fixture = TestBed.createComponent(TestComponentWithStaticCaseSensitive);
      const containerEl = fixture.debugElement.query(By.css('.dt-highlight')).nativeElement;

      const transformed = containerEl.lastChild as HTMLElement;
      expect(transformed.tagName).toMatch('SPAN');
      expect(transformed.innerHTML).toMatch('');

      fixture.detectChanges();
      const highlights = transformed.querySelectorAll('.dt-highlight-mark');
      expect(highlights.length).toBe(3);
      expect(highlights[0].tagName).toMatch('MARK');
      expect(highlights[0].innerHTML).toMatch('s');
      expect(highlights[1].innerHTML).toMatch('s');
      expect(highlights[2].innerHTML).toMatch('s');
    });

    it('should highlight found content and escape every html character inside the projected content', () => {
      const fixture = TestBed.createComponent(TestComponentWithHighlightedHtml);
      const containerEl = fixture.debugElement.query(By.css('.dt-highlight')).nativeElement;

      const transformed = containerEl.lastChild as HTMLElement;
      expect(transformed.tagName).toMatch('SPAN');
      expect(transformed.innerHTML).toMatch('');

      fixture.detectChanges();

      expect(transformed.innerHTML.startsWith('Some &lt;b&gt;text ')).toBeTruthy();
      expect(transformed.innerHTML.endsWith('e&lt;/b&gt; a part should be highlighted')).toBeTruthy();

      const highlights = transformed.querySelectorAll('.dt-highlight-mark');
      expect(highlights.length).toBe(1);
      expect(highlights[0].tagName).toMatch('MARK');
      expect(highlights[0].innerHTML).toMatch('wher');
    });
  });

  describe('with dynamic bindings', () => {

    it('should update the highlight when term is changed', () => {
      const fixture = TestBed.createComponent(TestComponentWithInputBindung);
      const instance = fixture.componentInstance;
      const containerEl = fixture.debugElement.query(By.css('.dt-highlight')).nativeElement;

      const transformed = containerEl.lastChild as HTMLElement;
      expect(transformed.tagName).toMatch('SPAN');
      expect(transformed.innerHTML).toMatch('');

      fixture.detectChanges();

      let highlights = transformed.querySelectorAll('.dt-highlight-mark');
      expect(highlights.length).toBe(0);

      instance.term = 'Some';
      fixture.detectChanges();

      highlights = transformed.querySelectorAll('.dt-highlight-mark');
      expect(highlights.length).toBe(1);
      expect(highlights[0].innerHTML).toMatch('Some');

      instance.term = 's';
      fixture.detectChanges();

      highlights = transformed.querySelectorAll('.dt-highlight-mark');
      expect(highlights.length).toBe(2);
      expect(highlights[0].innerHTML).toMatch('S'); // Some
      expect(highlights[1].innerHTML).toMatch('s'); // should
    });

    it('should update the highlight when caseSensitive is changed', () => {
      const fixture = TestBed.createComponent(TestComponentWithInputBindung);
      const instance = fixture.componentInstance;
      const containerEl = fixture.debugElement.query(By.css('.dt-highlight')).nativeElement;

      const transformed = containerEl.lastChild as HTMLElement;
      expect(transformed.tagName).toMatch('SPAN');
      expect(transformed.innerHTML).toMatch('');

      instance.term = 'some';
      fixture.detectChanges();

      let highlights = transformed.querySelectorAll('.dt-highlight-mark');
      expect(highlights.length).toBe(1);
      expect(highlights[0].innerHTML).toMatch('Some');

      instance.caseSensitive = true;
      fixture.detectChanges();

      highlights = transformed.querySelectorAll('.dt-highlight-mark');
      expect(highlights.length).toBe(0);
    });

    it('should highlight when term contains quantifier characters', () => {
      const fixture = TestBed.createComponent(TestComponentWithInputBindung);
      const instance = fixture.componentInstance;
      const containerEl = fixture.debugElement.query(By.css('.dt-highlight')).nativeElement;
      instance.term = 'highlighted?';

      fixture.detectChanges();

      const transformed = containerEl.lastChild as HTMLElement;
      const highlights = transformed.querySelectorAll('.dt-highlight-mark');
      expect(highlights.length).toBe(1);
      expect(highlights[0].innerHTML).toMatch('highlighted?');
    });

    it('should update the highlight when the dynamic text changes', () => {
      const fixture = TestBed.createComponent(TestComponentWithTextBinding);
      const instance = fixture.componentInstance;
      const containerEl = fixture.debugElement.query(By.css('.dt-highlight')).nativeElement;

      expect(containerEl.childNodes.length).toBe(2);

      const transformed = containerEl.lastChild as HTMLElement;
      let highlights = transformed.querySelectorAll('.dt-highlight-mark');
      expect(highlights.length).toBe(0);

      instance.name = 'Jane';
      fixture.detectChanges();
      highlights = transformed.querySelectorAll('.dt-highlight-mark');
      expect(highlights.length).toBe(1);
      expect(highlights[0].innerHTML).toMatch('Jane');
    });
  });

  describe('accessibility', () => {
    it('should hide the source container from screen readers', () => {
      const fixture = TestBed.createComponent(TestComponentWithHtmlInText);
      const containerEl = fixture.debugElement.query(By.css('.dt-highlight')).nativeElement;

      expect(containerEl.childNodes.length).toBe(2);
      const hiddenSource = containerEl.firstChild as HTMLElement;
      expect(hiddenSource.tagName).toMatch('DIV');
      expect(hiddenSource.getAttribute('aria-hidden')).toMatch('true');
    });

    it('should add a notice for screen readers when an element is marked', () => {
      const fixture = TestBed.createComponent(TestComponentWithStaticQueryAndStaticText);
      const containerEl = fixture.debugElement.query(By.css('.dt-highlight')).nativeElement;

      expect(containerEl.childNodes.length).toBe(2);
      const transformed = containerEl.lastChild as HTMLElement;
      fixture.detectChanges();

      const highlight = transformed.querySelectorAll('.dt-highlight-mark')[0];
      expect(getComputedStyle(highlight, ':before').content).toContain('[highlight start]');
      expect(getComputedStyle(highlight, ':after').content).toContain('[highlight end]');
    });
  });

});

@Component({
  template: `<p dt-highlight>Original text where nothing should be highlighted</p>`,
})
class TestComponentWithoutTerm {}

@Component({
  template: `<p dt-highlight term="">Some <b>text where</b> with html characters</p>`,
})
class TestComponentWithHtmlInText {}

@Component({
  template: `<p dt-highlight term="wher">Some text where a part should be highlighted</p>`,
})
class TestComponentWithStaticQueryAndStaticText {}

@Component({
  template: `<span dt-highlight term="s">Some text where some parts should be highlighted</span>`,
})
class TestComponentWithMultipleHighlights {}

@Component({
  template: `<span dt-highlight term="s" caseSensitive>Some text where some parts should be highlighted</span>`,
})
class TestComponentWithStaticCaseSensitive {}

@Component({
  template: `<p dt-highlight term="wher" >Some <b>text where</b> a part should be highlighted</p>`,
})
class TestComponentWithHighlightedHtml {}

@Component({
  template: `
    <dt-highlight [term]="term" [caseSensitive]="caseSensitive">
    Some text where a part should be highlighted?
    </dt-highlight>
  `,
})
class TestComponentWithInputBindung {
  term = '';
  caseSensitive = false;
}

@Component({
  template: `<dt-highlight term="Jane">We welcome {{ name }} to this event.</dt-highlight>`,
})
class TestComponentWithTextBinding {
  name = 'John';
}